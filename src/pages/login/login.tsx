import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User,
  ArrowRight,
  Building,
  Shield,
  TrendingUp,
  Globe,
  CheckCircle,
  Star,
  Home,
  AlertCircle,
  Loader2,
  Wallet,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { authApi, type RegisterData, type LoginData } from '@/api/authApi';
import { useSuiWallet, ConnectButton } from '@/context/SuiWalletContext';
import { useAuth } from '@/context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { account, isConnected, connectWallet } = useSuiWallet();
  const address = account?.address;
  const { login } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'user'>('user'); // Only user role allowed
  const [loginMethod, setLoginMethod] = useState<'email' | 'wallet'>('email');
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [userPrimaryRole, setUserPrimaryRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    acceptTerms: false,
    walletAddress: ''
  });

  // Effect to handle wallet connection
  useEffect(() => {
    if (isConnected && address) {
      setWalletConnected(true);
      setFormData(prev => ({ ...prev, walletAddress: address }));
      verifyWalletAddress(address);
    } else {
      setWalletConnected(false);
      setFormData(prev => ({ ...prev, walletAddress: '' }));
      setAvailableRoles([]);
      setUserPrimaryRole(null);
    }
  }, [isConnected, address]);

  // Verify wallet address and get available roles
  const verifyWalletAddress = async (walletAddress: string) => {
    try {
      const response = await authApi.verifyWallet(walletAddress);
      if (response.success && response.data.walletExists) {
        setAvailableRoles(response.data.availableRoles);
        // Set primary role as the first available role (or null if none)
        setUserPrimaryRole(response.data.availableRoles.length > 0 ? response.data.availableRoles[0] : null);
        if (response.data.userInfo) {
          setFormData(prev => ({
            ...prev,
            firstName: response.data.userInfo?.firstName || '',
            lastName: response.data.userInfo?.lastName || '',
            email: response.data.userInfo?.email || ''
          }));
        }
      }
    } catch (error) {
      console.error('Wallet verification error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear errors when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    // For wallet login
    if (loginMethod === 'wallet') {
      if (!walletConnected || !formData.walletAddress) {
        return 'Please connect your wallet first';
      }
      if (isLogin && availableRoles.length === 0) {
        return 'No registered account found for this wallet';
      }
      if (!isLogin && (!formData.firstName || !formData.lastName || !formData.email)) {
        return 'First name, last name, and email are required for registration';
      }
      return null;
    }

    // For email login
    if (!formData.email || !formData.password) {
      return 'Email and password are required';
    }

    if (!isLogin) {
      if (!formData.firstName || !formData.lastName) {
        return 'First name and last name are required';
      }
      if (!walletConnected || !formData.walletAddress) {
        return 'Please connect your wallet to complete registration';
      }
      if (formData.password !== formData.confirmPassword) {
        return 'Passwords do not match';
      }
      if (formData.password.length < 6) {
        return 'Password must be at least 6 characters long';
      }
      if (!formData.acceptTerms) {
        return 'You must accept the terms and conditions';
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        let loginData: LoginData;

        if (loginMethod === 'wallet') {
          loginData = {
            walletAddress: formData.walletAddress
            // Remove preferredRole since we'll use the user's primary role
          };
        } else {
          loginData = {
            email: formData.email,
            password: formData.password
            // Remove preferredRole since we'll use the user's primary role
          };
        }

        // Use Auth Context login method
        await login(loginData);
        setSuccess('Login successful! Redirecting...');
        // Auth Context will handle navigation automatically
      } else {
        // Register
        const registerData: RegisterData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          walletAddress: formData.walletAddress,
          role: selectedRole
        };

        const response = await authApi.register(registerData);
        
        if (response.success) {
          setSuccess('Registration successful! Redirecting...');
          // Navigate based on the registered role (should be 'user' for public registration)
          const userRole = response.data.user?.primaryRole || response.data.user?.roles?.[0] || 'user';
          let dashboardRoute = '/marketplace'; // default for users
          
          switch (userRole) {
            case 'admin':
              dashboardRoute = '/admin';
              break;
            case 'issuer':
              dashboardRoute = '/issuer';
              break;
            case 'manager':
              dashboardRoute = '/manager';
              break;
            default:
              dashboardRoute = '/marketplace';
          }
          
          setTimeout(() => {
            navigate(dashboardRoute);
          }, 1000);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Building,
      title: "Real Estate Tokens",
      description: "Invest in premium properties worldwide"
    },
    {
      icon: Shield,
      title: "Secure & Regulated",
      description: "Bank-level security and compliance"
    },
    {
      icon: TrendingUp,
      title: "High Returns",
      description: "Average 12-15% annual returns"
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Diversify across international markets"
    }
  ];

  const stats = [
    { value: "$2.4B+", label: "Assets Tokenized" },
    { value: "50K+", label: "Active Investors" },
    { value: "125+", label: "Properties Listed" },
    { value: "98.5%", label: "Customer Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Home Button - Top Left */}
      <div className="absolute top-6 left-6 z-20">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
          className="bg-white/90 backdrop-blur-sm border-gray-200 text-gray-700 hover:bg-white hover:text-gray-900 hover:shadow-md transition-all duration-200"
        >
          <Home className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Home</span>
        </Button>
      </div>

      {/* Left Side - Minimal Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          {/* Logo & Minimal Branding */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                <Building className="w-10 h-10 text-gray-900" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-3">Credora</h1>
            <p className="text-gray-300 text-lg mb-8">Investment Portfolio Management</p>
            

            <div className="w-24 h-1 bg-white mx-auto mb-8 rounded-full"></div>
            
            <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
              Secure access to your investment dashboard and portfolio management tools.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Building className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AssetDash</h1>
            <p className="text-gray-600 text-sm">Portfolio Management</p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </CardTitle>
              <p className="text-gray-600 text-sm">
                {isLogin 
                  ? 'Enter your credentials to access your dashboard' 
                  : 'Fill in your information to get started'
                }
              </p>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Auth Tabs */}
              <div className="flex bg-gray-50 rounded-xl p-1 mb-6">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isLogin 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    !isLogin 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Sign Up
                </button>
              </div>



              {/* Wallet Connection - Only show for registration or when needed */}
              {(!isLogin || loginMethod === 'wallet') && (
                <div className="mb-6">
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Connect Wallet {!isLogin ? '' : '(Alternative Login)'}
                  </Label>
                  <div className="space-y-3">
                    {!isConnected ? (
                      <Button 
                        onClick={connectWallet}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        Connect Wallet
                      </Button>
                    ) : (
                      <div className="w-full">
                        <p className="text-sm text-green-600 mb-2">
                          ✅ Wallet Connected: {address?.slice(0, 8)}...{address?.slice(-6)}
                        </p>
                        <ConnectButton />
                      </div>
                    )}
                    {walletConnected && address && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center text-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm">Wallet Connected: {address.slice(0, 6)}...{address.slice(-4)}</span>
                        </div>
                        {userPrimaryRole && (
                          <div className="mt-2 text-sm text-green-600">
                            Account type: {userPrimaryRole.charAt(0).toUpperCase() + userPrimaryRole.slice(1)}
                          </div>
                        )}
                        {availableRoles.length === 0 && isLogin && (
                          <div className="mt-2 text-sm text-orange-600">
                            No registered account found for this wallet
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Role Selection - Show existing roles for registration */}
              {!isLogin && userPrimaryRole && (
                <div className="mb-6">
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Existing Account Detected
                  </Label>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center text-blue-700">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">
                        This wallet already has roles: {availableRoles.join(', ')}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      You can add additional roles to this wallet or login with existing roles.
                    </p>
                  </div>
                </div>
              )}

              {!isLogin && !userPrimaryRole && (
                <div className="mb-6">
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Account Type
                  </Label>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center text-blue-700">
                      <User className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">User Account - Investor</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Only user accounts can be created here. Issuer and manager accounts are created by administrators.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-0">
                {/* Error/Success Messages */}
                {error && (
                  <Alert className="mb-4 border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="mb-4 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Name Fields - Register Only */}
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="John"
                          className="pl-10 h-11 border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Last Name</label>
                      <Input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        className="h-11 border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {/* Email and Password Fields - For email login or registration */}
                {(loginMethod === 'email' || !isLogin) && (
                  <>
                    {/* Email Field */}
                    <div className="space-y-2 mb-4">
                      <label className="text-sm font-medium text-gray-700">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="john@example.com"
                          className="pl-10 h-11 border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2 mb-4">
                      <label className="text-sm font-medium text-gray-700">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter your password"
                          className="pl-10 pr-10 h-11 border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Confirm Password - Register Only */}
                {!isLogin && (
                  <div className="space-y-2 mb-4">
                    <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        className="pl-10 pr-10 h-11 border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                        required={!isLogin}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Terms and Conditions - Required for registration */}
                {!isLogin && (
                  <div className="mb-6">
                    <label className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 focus:ring-1 mt-0.5"
                        required
                      />
                      <span className="text-sm text-gray-600 leading-5">
                        I agree to the{' '}
                        <button type="button" className="text-gray-900 hover:text-gray-700 font-medium">
                          Terms of Service
                        </button>
                        {' '}and{' '}
                        <button type="button" className="text-gray-900 hover:text-gray-700 font-medium">
                          Privacy Policy
                        </button>
                        {' '}*
                      </span>
                    </label>
                  </div>
                )}

                {/* Remember Me for Login */}
                {isLogin && (
                  <div className="flex items-center justify-between mb-6">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 focus:ring-1" 
                      />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <button type="button" className="text-sm text-gray-900 hover:text-gray-700 font-medium">
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white h-11 text-base font-medium transition-colors duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isLogin ? 'Signing In...' : 'Creating Account...'}
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                {/* Alternative Login Methods */}
                {isLogin && (
                  <>
                    <div className="mt-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">or continue with</span>
                        </div>
                      </div>

                      {/* Wallet Login Option */}
                      <div className="mt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full h-11 border-gray-200"
                          onClick={() => setLoginMethod('wallet')}
                        >
                          <Wallet className="w-4 h-4 mr-2" />
                          Connect Wallet to Login
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </form>
            </CardContent>
          </Card>

          
        </div>
      </div>
    </div>
  );
};

export default Login;
