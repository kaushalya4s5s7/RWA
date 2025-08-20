import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Coins, 
  TrendingUp, 
  Users, 
  Shield, 
  FileText,
  BarChart3,
  Globe,
  DollarSign,
  Activity,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Bell,
  Home,
  Sun,
  Moon,
  Zap,
  Lock,
  Unlock,
  RefreshCw,
  PieChart,
  TrendingDown,
  Clock,
  MapPin,
  Camera,
  Upload,
  Calculator,
  CreditCard,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';
import { fetchIPFSContent } from '@/utils/ipfs';
import { getAllManagers, getManagerTokens } from '@/services/contractService';

// Types for Asset Management
interface AssignedAsset {
  tokenId: string;
  name: string;
  type: 'real-estate' | 'commodity' | 'bonds' | 'equity';
  location: string;
  totalTokens: number;
  soldTokens: number;
  currentValue: number;
  monthlyIncome: number;
  occupancyRate: number;
  lastInspection: string;
  nextPayment: string;
  status: 'active' | 'maintenance' | 'vacancy' | 'development';
  metadataURI: string;
  images: string[];
}

interface RentalSubmission {
  tokenId: string;
  assetName: string;
  amount: number;
  month: string;
  type: 'rental' | 'dividend' | 'interest';
  notes: string;
  receipts: File[];
}

interface IncomeHistory {
  id: string;
  tokenId: string;
  assetName: string;
  amount: number;
  perToken: number;
  submittedDate: string;
  distributedDate: string;
  type: string;
  status: 'pending' | 'distributed' | 'failed';
}

const ManagerDashboard: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Wallet states
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isAuthorizedManager, setIsAuthorizedManager] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Main state
  const [assignedAssets, setAssignedAssets] = useState<AssignedAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<AssignedAsset | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dialog states
  const [showRentalDialog, setShowRentalDialog] = useState(false);
  const [showAssetDetails, setShowAssetDetails] = useState(false);
  const [showIncomeHistory, setShowIncomeHistory] = useState(false);
  
  // Form states
  const [rentalForm, setRentalForm] = useState<RentalSubmission>({
    tokenId: '',
    assetName: '',
    amount: 0,
    month: '',
    type: 'rental',
    notes: '',
    receipts: []
  });
  
  // Data states
  const [incomeHistory, setIncomeHistory] = useState<IncomeHistory[]>([]);
  const [totalManaged, setTotalManaged] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Demo data initialization
  useEffect(() => {
    checkWalletConnection();
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error('MetaMask not found! Please install MetaMask.');
        return;
      }

      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      setWalletAddress(address);
      setWalletConnected(true);
      toast.success('Wallet connected successfully!');
      
      // Check if user is authorized manager
      await checkManagerAuthorization(address);
      
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      toast.error(`Failed to connect wallet: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Check wallet connection on mount
  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletConnected(true);
          await checkManagerAuthorization(accounts[0]);
        }
      } catch (error) {
        console.log('No wallet connected');
        loadDemoData(); // Load demo data if no wallet connected
      }
    } else {
      loadDemoData(); // Load demo data if no MetaMask
    }
  };

  // Check if wallet is authorized manager
  const checkManagerAuthorization = async (address: string) => {
    try {
      console.log('🔄 Checking manager authorization for:', address);
      
      // Use contractService to get all managers
      const managersData = await getAllManagers();
      console.log('✅ All managers from contract:', managersData);
      
      // Check if current address is an authorized manager
      const isManager = managersData.addresses.map((addr: string) => addr.toLowerCase()).includes(address.toLowerCase());
      setIsAuthorizedManager(isManager);
      
      if (isManager) {
        console.log('✅ User is authorized manager');
        toast.success('Manager authorization confirmed!');
        
        // Get manager's assigned tokens
        await fetchManagerAssets(address);
      } else {
        console.log('❌ User is not an authorized manager');
        toast.error('Access denied: You are not an authorized manager');
      }
      
    } catch (error: any) {
      console.error('❌ Failed to check manager authorization:', error);
      toast.error('Failed to verify manager status');
      // Load demo data on error
      loadDemoData();
    }
  };

  // Fetch manager's assigned assets
  const fetchManagerAssets = async (managerAddress: string) => {
    try {
      setLoading(true);
      console.log('🔄 Fetching manager assets for:', managerAddress);
      
      // Use contractService to get manager's token IDs
      const managerTokenIds = await getManagerTokens(managerAddress);
      console.log('✅ Manager token IDs:', managerTokenIds);
      
      if (managerTokenIds.length === 0) {
        console.log('ℹ️ No assets assigned to manager');
        setAssignedAssets([]);
        setTotalManaged(0);
        setTotalIncome(0);
        return;
      }
      
      console.log('✅ Token ID strings:', managerTokenIds);
      
      // For now, create demo assets based on assigned token IDs
      // In production, you would fetch actual asset data from marketplace/IPFS
      const managedAssets: AssignedAsset[] = managerTokenIds.map((tokenId: string, index: number) => ({
        tokenId,
        name: `Asset #${tokenId}`,
        type: 'real-estate' as const,
        location: `Location ${index + 1}`,
        totalTokens: 1000,
        soldTokens: Math.floor(Math.random() * 800) + 200,
        currentValue: Math.floor(Math.random() * 2000000) + 500000,
        monthlyIncome: Math.floor(Math.random() * 15000) + 5000,
        occupancyRate: Math.floor(Math.random() * 20) + 80,
        lastInspection: "2024-11-15",
        nextPayment: "2025-01-01",
        status: 'active' as const,
        metadataURI: `ipfs://QmExample${tokenId}`,
        images: ["/api/placeholder/400/300"]
      }));
      
      setAssignedAssets(managedAssets);
      setTotalManaged(managedAssets.length);
      setTotalIncome(managedAssets.reduce((sum, asset) => sum + asset.monthlyIncome, 0));
      
      
    } catch (error: any) {
      console.error('❌ Failed to fetch manager assets:', error);
      toast.error('Failed to load assigned assets');
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    const demoAssets: AssignedAsset[] = [
      {
        tokenId: "1001",
        name: "Manhattan Office Complex",
        type: "real-estate",
        location: "New York, NY",
        totalTokens: 1000,
        soldTokens: 750,
        currentValue: 2500000,
        monthlyIncome: 18500,
        occupancyRate: 94,
        lastInspection: "2024-11-15",
        nextPayment: "2025-01-01",
        status: "active",
        metadataURI: "ipfs://QmExample1",
        images: ["/api/placeholder/400/300"]
      },
      {
        tokenId: "1002", 
        name: "Gold Reserve Portfolio",
        type: "commodity",
        location: "Swiss Vault, Geneva",
        totalTokens: 500,
        soldTokens: 400,
        currentValue: 1800000,
        monthlyIncome: 8200,
        occupancyRate: 100,
        lastInspection: "2024-12-01",
        nextPayment: "2025-01-05",
        status: "active",
        metadataURI: "ipfs://QmExample2",
        images: ["/api/placeholder/400/300"]
      },
      {
        tokenId: "1003",
        name: "Miami Residential Complex",
        type: "real-estate", 
        location: "Miami, FL",
        totalTokens: 800,
        soldTokens: 600,
        currentValue: 1200000,
        monthlyIncome: 12000,
        occupancyRate: 88,
        lastInspection: "2024-10-20",
        nextPayment: "2025-01-01",
        status: "maintenance",
        metadataURI: "ipfs://QmExample3",
        images: ["/api/placeholder/400/300"]
      }
    ];
    
    setAssignedAssets(demoAssets);
    setTotalManaged(demoAssets.length);
    setTotalIncome(demoAssets.reduce((sum, asset) => sum + asset.monthlyIncome, 0));
    
    // Demo income history
    const demoHistory: IncomeHistory[] = [
      {
        id: "inc_001",
        tokenId: "1001",
        assetName: "Manhattan Office Complex",
        amount: 18500,
        perToken: 18.5,
        submittedDate: "2024-12-01",
        distributedDate: "2024-12-02",
        type: "rental",
        status: "distributed"
      },
      {
        id: "inc_002",
        tokenId: "1002",
        assetName: "Gold Reserve Portfolio", 
        amount: 8200,
        perToken: 16.4,
        submittedDate: "2024-12-01",
        distributedDate: "2024-12-02",
        type: "dividend",
        status: "distributed"
      }
    ];
    
    setIncomeHistory(demoHistory);
  };

  const handleRentalSubmission = async () => {
    if (!rentalForm.tokenId || !rentalForm.amount || !rentalForm.month) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      // Demo submission - in production, this would call the PaymentSplitter contract
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newIncome: IncomeHistory = {
        id: `inc_${Date.now()}`,
        tokenId: rentalForm.tokenId,
        assetName: rentalForm.assetName,
        amount: rentalForm.amount,
        perToken: rentalForm.amount / 1000, // Demo calculation
        submittedDate: new Date().toISOString().split('T')[0],
        distributedDate: '',
        type: rentalForm.type,
        status: 'pending'
      };
      
      setIncomeHistory(prev => [newIncome, ...prev]);
      setShowRentalDialog(false);
      setRentalForm({
        tokenId: '',
        assetName: '',
        amount: 0,
        month: '',
        type: 'rental',
        notes: '',
        receipts: []
      });
      
      toast.success('Rental income submitted successfully!');
      
    } catch (error) {
      toast.error('Failed to submit rental income');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'vacancy': return 'bg-red-500';
      case 'development': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'real-estate': return Building2;
      case 'commodity': return Coins;
      case 'bonds': return FileText;
      case 'equity': return TrendingUp;
      default: return Building2;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-900/50 backdrop-blur-xl border-gray-800' : 'bg-white/80 backdrop-blur-xl border-gray-200'} border-b sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Asset Manager</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Portfolio Management Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Wallet Connection */}
              {!walletConnected ? (
                <Button 
                  onClick={connectWallet}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {loading ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm font-medium">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                  </div>
                  
                  {isAuthorizedManager ? (
                    <div className="flex items-center space-x-2 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 text-sm font-medium">Authorized Manager</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 text-sm font-medium">Not Authorized</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-emerald-400 text-sm font-medium">Active Manager</span>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              <Button variant="ghost" size="icon" className={`${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                <Bell className="w-4 h-4" />
              </Button>
              
              <Button asChild variant="ghost" className={`${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                <Link to="/" className="flex items-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
              </Button>
              
              <Avatar className="h-8 w-8">
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!walletConnected ? (
          /* Wallet Connection Required */
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className={`max-w-md w-full ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-blue-500" />
                </div>
                <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Connect Your Wallet
                </h2>
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Connect your wallet to access the Asset Manager Dashboard and manage your assigned properties.
                </p>
                <Button 
                  onClick={connectWallet}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {loading ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : !isAuthorizedManager ? (
          /* Not Authorized */
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className={`max-w-md w-full ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-red-500" />
                </div>
                <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Access Restricted
                </h2>
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your wallet address is not authorized to access the Asset Manager Dashboard.
                </p>
                <p className={`text-xs mb-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Connected: {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
                </p>
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Return to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Authorized Manager Dashboard */
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full grid-cols-4 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-100 border-gray-200'}`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assets">My Assets</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className={`${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Assets Managed</p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {walletConnected && isAuthorizedManager ? totalManaged : 'N/A'}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <Building2 className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">
                      {walletConnected ? 'Real-time data' : 'Connect wallet to view'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Monthly Income</p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {walletConnected && isAuthorizedManager ? `$${totalIncome.toLocaleString()}` : 'N/A'}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-lg">
                      <DollarSign className="w-6 h-6 text-emerald-500" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">
                      {walletConnected ? 'From assigned assets' : 'Connect wallet to view'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Occupancy</p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {walletConnected && isAuthorizedManager && assignedAssets.length > 0 
                          ? `${Math.round(assignedAssets.reduce((sum, asset) => sum + asset.occupancyRate, 0) / assignedAssets.length)}%`
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                      <PieChart className="w-6 h-6 text-purple-500" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">+3% from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Value</p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {walletConnected && isAuthorizedManager 
                          ? `$${(assignedAssets.reduce((sum, asset) => sum + asset.currentValue, 0) / 1000000).toFixed(1)}M`
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <div className="p-3 bg-orange-500/10 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-orange-500" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">+15.2% from last month</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className={`${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
              <CardHeader>
                <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    onClick={() => setShowRentalDialog(true)}
                    className="h-24 flex-col space-y-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <DollarSign className="w-6 h-6" />
                    <span className="text-sm font-medium">Submit Income</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className={`h-24 flex-col space-y-2 ${isDarkMode ? 'border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                    onClick={() => setShowIncomeHistory(true)}
                  >
                    <BarChart3 className="w-6 h-6" />
                    <span className="text-sm font-medium">View History</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className={`h-24 flex-col space-y-2 ${isDarkMode ? 'border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                  >
                    <FileText className="w-6 h-6" />
                    <span className="text-sm font-medium">Generate Report</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className={`h-24 flex-col space-y-2 ${isDarkMode ? 'border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                  >
                    <Calendar className="w-6 h-6" />
                    <span className="text-sm font-medium">Schedule Inspection</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className={`${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
              <CardHeader>
                <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incomeHistory.slice(0, 3).map((income) => (
                    <div key={income.id} className={`flex items-center justify-between p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${income.status === 'distributed' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                        <div>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {income.type.charAt(0).toUpperCase() + income.type.slice(1)} - {income.assetName}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            ${income.amount.toLocaleString()} distributed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={income.status === 'distributed' ? 'default' : 'secondary'}>
                          {income.status}
                        </Badge>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                          {income.submittedDate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>My Assigned Assets</h2>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => walletConnected && fetchManagerAssets(walletAddress)}
                  disabled={loading || !walletConnected}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignedAssets.length === 0 ? (
                <div className="col-span-full">
                  <Card className={`${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <CardContent className="p-12 text-center">
                      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="w-8 h-8 text-blue-500" />
                      </div>
                      <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        No Assets Assigned
                      </h3>
                      <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {walletConnected ? 
                          'You currently have no assets assigned to manage. Contact the admin to get assets assigned.' :
                          'Connect your wallet to view assigned assets.'
                        }
                      </p>
                      {walletConnected && (
                        <Button 
                          onClick={() => fetchManagerAssets(walletAddress)}
                          disabled={loading}
                          variant="outline"
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                          {loading ? 'Checking...' : 'Check Again'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                assignedAssets.map((asset) => {
                const IconComponent = getTypeIcon(asset.type);
                return (
                  <Card key={asset.tokenId} className={`${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} cursor-pointer hover:shadow-lg transition-shadow`}
                    onClick={() => {
                      setSelectedAsset(asset);
                      setShowAssetDetails(true);
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <IconComponent className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{asset.name}</h3>
                            <p className={`text-sm flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <MapPin className="w-3 h-3 mr-1" />
                              {asset.location}
                            </p>
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(asset.status)}`}></div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tokens Sold</span>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {asset.soldTokens}/{asset.totalTokens}
                          </span>
                        </div>
                        
                        <Progress 
                          value={(asset.soldTokens / asset.totalTokens) * 100} 
                          className="h-2"
                        />

                        <div className="flex justify-between">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Monthly Income</span>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            ${asset.monthlyIncome.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Occupancy</span>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {asset.occupancyRate}%
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Next Payment</span>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {asset.nextPayment}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRentalForm(prev => ({
                              ...prev,
                              tokenId: asset.tokenId,
                              assetName: asset.name
                            }));
                            setShowRentalDialog(true);
                          }}
                        >
                          Submit Income
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
              )}
            </div>
          </TabsContent>

          {/* Income Tab */}
          <TabsContent value="income" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Income Management</h2>
              <Button onClick={() => setShowRentalDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Submit New Income
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className={`${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>This Month</p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$38,700</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$0</p>
                    </div>
                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                      <Clock className="w-6 h-6 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>YTD Total</p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$428,400</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className={`${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
              <CardHeader>
                <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Income History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incomeHistory.map((income) => (
                    <div key={income.id} className={`flex items-center justify-between p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          income.type === 'rental' ? 'bg-blue-500/10' : 
                          income.type === 'dividend' ? 'bg-emerald-500/10' : 'bg-purple-500/10'
                        }`}>
                          {income.type === 'rental' ? <Building2 className="w-5 h-5 text-blue-500" /> :
                           income.type === 'dividend' ? <Coins className="w-5 h-5 text-emerald-500" /> :
                           <FileText className="w-5 h-5 text-purple-500" />}
                        </div>
                        <div>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {income.assetName}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {income.type.charAt(0).toUpperCase() + income.type.slice(1)} • Token ID: {income.tokenId}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          ${income.amount.toLocaleString()}
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          ${income.perToken}/token
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant={income.status === 'distributed' ? 'default' : income.status === 'pending' ? 'secondary' : 'destructive'}>
                          {income.status}
                        </Badge>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {income.submittedDate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Reports & Analytics</h2>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Reports
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className={`${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                <CardHeader>
                  <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Assets Under Management</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Combined Asset Value</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$5.5M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average Monthly Income</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$38.7K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Portfolio Yield</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>8.4%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
                <CardHeader>
                  <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quick Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Monthly Income Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Asset Performance Analysis
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Occupancy Trends
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <PieChart className="w-4 h-4 mr-2" />
                      Portfolio Distribution
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        )}
      </main>

      {/* Submit Rental Income Dialog */}
      <Dialog open={showRentalDialog} onOpenChange={setShowRentalDialog}>
        <DialogContent className={`sm:max-w-lg ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <DialogHeader>
            <DialogTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Submit Income</DialogTitle>
            <DialogDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Submit rental income or dividends for distribution to token holders.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="asset-select" className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Select Asset</Label>
              <Select 
                value={rentalForm.tokenId} 
                onValueChange={(value) => {
                  const asset = assignedAssets.find(a => a.tokenId === value);
                  setRentalForm(prev => ({
                    ...prev,
                    tokenId: value,
                    assetName: asset?.name || ''
                  }));
                }}
              >
                <SelectTrigger className={`${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                  <SelectValue placeholder="Choose an asset" />
                </SelectTrigger>
                <SelectContent>
                  {assignedAssets.map(asset => (
                    <SelectItem key={asset.tokenId} value={asset.tokenId}>
                      {asset.name} (ID: {asset.tokenId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="income-type" className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Income Type</Label>
              <Select 
                value={rentalForm.type} 
                onValueChange={(value: 'rental' | 'dividend' | 'interest') => 
                  setRentalForm(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className={`${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rental">Rental Income</SelectItem>
                  <SelectItem value="dividend">Dividend</SelectItem>
                  <SelectItem value="interest">Interest Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount" className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={rentalForm.amount || ''}
                onChange={(e) => setRentalForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                className={`${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div>
              <Label htmlFor="month" className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Period</Label>
              <Input
                id="month"
                type="month"
                value={rentalForm.month}
                onChange={(e) => setRentalForm(prev => ({ ...prev, month: e.target.value }))}
                className={`${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div>
              <Label htmlFor="notes" className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes or details"
                value={rentalForm.notes}
                onChange={(e) => setRentalForm(prev => ({ ...prev, notes: e.target.value }))}
                className={`${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRentalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRentalSubmission} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Income'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Asset Details Dialog */}
      <Dialog open={showAssetDetails} onOpenChange={setShowAssetDetails}>
        <DialogContent className={`sm:max-w-2xl ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          {selectedAsset && (
            <>
              <DialogHeader>
                <DialogTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedAsset.name}</DialogTitle>
                <DialogDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Asset Details and Management
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Token ID</p>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedAsset.tokenId}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Location</p>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedAsset.location}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Value</p>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${selectedAsset.currentValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Monthly Income</p>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${selectedAsset.monthlyIncome.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tokens</p>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedAsset.soldTokens} / {selectedAsset.totalTokens} sold
                    </p>
                    <Progress value={(selectedAsset.soldTokens / selectedAsset.totalTokens) * 100} className="mt-2" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Occupancy Rate</p>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedAsset.occupancyRate}%</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last Inspection</p>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedAsset.lastInspection}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Next Payment</p>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedAsset.nextPayment}</p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAssetDetails(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setRentalForm(prev => ({
                      ...prev,
                      tokenId: selectedAsset.tokenId,
                      assetName: selectedAsset.name
                    }));
                    setShowAssetDetails(false);
                    setShowRentalDialog(true);
                  }}
                >
                  Submit Income
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerDashboard;
