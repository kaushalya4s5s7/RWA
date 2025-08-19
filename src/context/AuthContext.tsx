import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/authApi';

// JWT decode function
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  primaryRole: string;
  walletAddress: string;
  isVerified: boolean;
  kycStatus: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  fullName: string;
}

interface AuthContextType {
  // Authentication state
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  
  // Role management
  userRoles: string[];
  currentRole: string | null;
  primaryRole: string | null;
  
  // Authentication methods
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  switchRole: (role: string) => Promise<void>;
  
  // Authorization helpers
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  canAccess: (allowedRoles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [primaryRole, setPrimaryRole] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔍 Initializing Auth Context...');
        
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        const storedCurrentRole = localStorage.getItem('currentRole');
        const storedAvailableRoles = localStorage.getItem('availableRoles');

        if (storedToken && storedUser) {
          // Decode JWT to get user info and roles
          const decodedToken = decodeJWT(storedToken);
          
          if (decodedToken) {
            const parsedUser = JSON.parse(storedUser);
            const roles = decodedToken.roles || parsedUser.roles || [];
            const currentRoleFromToken = decodedToken.currentRole || storedCurrentRole || roles[0];
            const primaryRoleFromToken = decodedToken.primaryRole || parsedUser.primaryRole || roles[0];

            // Check if token is expired
            const currentTime = Date.now() / 1000;
            if (decodedToken.exp && decodedToken.exp < currentTime) {
              console.log('⚠️ Token expired, clearing auth data');
              clearAuthData();
              setIsLoading(false);
              return;
            }

            // Set auth state
            setToken(storedToken);
            setUser(parsedUser);
            setUserRoles(roles);
            setCurrentRole(currentRoleFromToken);
            setPrimaryRole(primaryRoleFromToken);
            setIsAuthenticated(true);

            console.log('✅ Auth state initialized:', {
              userId: parsedUser._id,
              roles: roles,
              currentRole: currentRoleFromToken,
              primaryRole: primaryRoleFromToken
            });
          } else {
            console.log('❌ Invalid token, clearing auth data');
            clearAuthData();
          }
        } else {
          console.log('ℹ️ No auth data found');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    // Add a timeout to ensure loading doesn't persist indefinitely
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    initializeAuth();

    return () => clearTimeout(timeout);
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('currentRole');
    localStorage.removeItem('availableRoles');
    
    setToken(null);
    setUser(null);
    setUserRoles([]);
    setCurrentRole(null);
    setPrimaryRole(null);
    setIsAuthenticated(false);
  };

  const login = async (credentials: any) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(credentials);
      
      if (response.success) {
        const { user: userData, token: userToken, currentRole: userCurrentRole, availableRoles } = response.data;
        
        // Store auth data in localStorage
        localStorage.setItem('authToken', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('currentRole', userCurrentRole);
        localStorage.setItem('availableRoles', JSON.stringify(availableRoles));
        
        // Decode JWT to get additional info
        const decodedToken = decodeJWT(userToken);
        
        setToken(userToken);
        setUser(userData);
        setUserRoles(availableRoles);
        setCurrentRole(userCurrentRole);
        setPrimaryRole(userData.primaryRole);
        setIsAuthenticated(true);

        console.log('✅ Login successful:', {
          userId: userData._id,
          roles: availableRoles,
          currentRole: userCurrentRole
        });

        // Redirect to appropriate dashboard
        const from = location.state?.from?.pathname || getDefaultDashboard(availableRoles);
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Logging out user');
    clearAuthData();
    navigate('/login', { replace: true });
  };

  const switchRole = async (role: string) => {
    try {
      if (!userRoles.includes(role)) {
        throw new Error(`You do not have ${role} role`);
      }

      const response = await authApi.switchRole(role as any);
      if (response.success) {
        const newToken = response.data.token;
        const decodedToken = decodeJWT(newToken);
        
        // Update localStorage
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('currentRole', role);
        
        setToken(newToken);
        setCurrentRole(role);
        
        console.log('🔄 Role switched to:', role);
        
        // Navigate to appropriate dashboard for the new role
        const dashboardRoute = getDefaultDashboard([role]);
        navigate(dashboardRoute, { replace: true });
      }
    } catch (error) {
      console.error('❌ Role switch failed:', error);
      throw error;
    }
  };

  const hasRole = (role: string): boolean => {
    return userRoles.includes(role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => userRoles.includes(role));
  };

  const canAccess = (allowedRoles: string[]): boolean => {
    if (!isAuthenticated) return false;
    return hasAnyRole(allowedRoles);
  };

  const getDefaultDashboard = (roles: string[]): string => {
    // Priority order: admin > issuer > manager > user
    if (roles.includes('admin')) return '/admin';
    if (roles.includes('issuer')) return '/issuer';
    if (roles.includes('manager')) return '/manager';
    return '/marketplace';
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    token,
    userRoles,
    currentRole,
    primaryRole,
    login,
    logout,
    switchRole,
    hasRole,
    hasAnyRole,
    canAccess
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
