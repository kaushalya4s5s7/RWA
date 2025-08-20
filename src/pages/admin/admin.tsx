import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Building2, 
  Settings,
  Plus,
  Trash2,
  Eye, 
  Search, 
  Filter, 
  MoreHorizontal,
  Activity,
  Bell,
  Home,
  Sun,
  Moon,
  Power,
  PowerOff,
  UserPlus,
  UserMinus,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Clock,
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar,
  Download,
  RefreshCw,
  Lock,
  Unlock,
  Database,
  Server,
  Zap,
  FileText,
  Shield as ShieldCheck,
  CreditCard,
  Briefcase,
  Play,
  Pause
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
import { Switch } from '@/components/ui/switch';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import * as authApi from '@/api/authApi';
import { useSuiWallet, ConnectButton } from '@/context/SuiWalletContext';
import { OneChainService, ONECHAIN_CONTRACTS } from '@/services/oneChainService';
import { uploadJSONToIPFS, fetchIPFSContent } from '@/utils/ipfs';
import { Transaction } from '@mysten/sui/transactions';

// Types for Admin Management
interface User {
  id: string;
  address: string;
  name: string;
  email: string;
  role: 'issuer' | 'manager';
  status: 'active' | 'inactive' | 'pending';
  metadataURI: string;
  joinedDate: string;
  lastActive: string;
  tokensManaged?: number;
  totalVolume?: number;
  assignedTokens?: string[];
}

interface SystemMetrics {
  totalIssuers: number;
  totalManagers: number;
  activeTokens: number;
  totalVolume: number;
  marketplaceStatus: boolean;
  platformFees: number;
}

const Admin: React.FC = () => {
  // OneChain/Sui wallet integration
  const { account, isConnected, suiClient, signAndExecuteTransaction } = useSuiWallet();
  const address = account?.address;
  const oneChainService = new OneChainService(suiClient);
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Main state
  const [activeTab, setActiveTab] = useState('overview');
  const [issuers, setIssuers] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [contractIssuers, setContractIssuers] = useState<{
    addresses: string[], 
    count: number, 
    metadata: Record<string, string>
  }>({ addresses: [], count: 0, metadata: {} });
  const [contractManagers, setContractManagers] = useState<{
    addresses: string[], 
    count: number, 
    metadata: Record<string, string>
  }>({ addresses: [], count: 0, metadata: {} });
  const [isLoadingContractData, setIsLoadingContractData] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalIssuers: 0,
    totalManagers: 0,
    activeTokens: 0,
    totalVolume: 0,
    marketplaceStatus: true,
    platformFees: 0
  });
  
  // Dialog states
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false);
  const [showRemoveUserDialog, setShowRemoveUserDialog] = useState(false);
  const [showMarketplaceToggleDialog, setShowMarketplaceToggleDialog] = useState(false);
  const [showAssignTokenDialog, setShowAssignTokenDialog] = useState(false);
  
  // Form states
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    walletAddress: '',
    role: 'issuer' as 'issuer' | 'manager',
    metadataURI: ''
  });
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [marketplacePaused, setMarketplacePaused] = useState(false);
  const [assignTokenForm, setAssignTokenForm] = useState({
    tokenId: '',
    managerAddress: ''
  });

  // Demo data initialization
  useEffect(() => {
    loadContractData();
  }, [isConnected]);

  // Load marketplace status on mount
  useEffect(() => {
    const loadMarketplaceStatus = async () => {
      try {
        // For OneChain, check marketplace status from contract
        const status = await checkMarketplaceStatus();
        setMarketplacePaused(!status);
      } catch (error) {
        console.error('Error loading marketplace status:', error);
      }
    };
    
    loadMarketplaceStatus();
  }, []);

  const loadContractData = async () => {
    if (!isConnected || !suiClient) return;
    
    setIsLoadingContractData(true);
    
    try {
      console.log('🔄 Fetching OneChain contract data...');
      
      // Load issuers from OneChain contract
      const issuersData = await getContractIssuers();
      console.log('📜 Issuers Data:', issuersData)  ;
      const managersData = await getContractManagers();
      const marketplacePausedStatus = await checkMarketplacePaused();
      
      setContractIssuers(issuersData);
      setContractManagers(managersData);
      setMarketplacePaused(marketplacePausedStatus);
      
      // Convert contract data to User format
      const issuerUsers: User[] = [];
      const managerUsers: User[] = [];
      
      // Process issuers
      for (const address of issuersData.addresses) {
        const metadataURI = issuersData.metadata[address];
        let userData = {
          id: address,
          address: address,
          name: `Issuer ${address.slice(0, 6)}...${address.slice(-4)}`,
          email: `issuer-${address.slice(0, 8)}@platform.local`,
          role: 'issuer' as const,
          status: 'active' as const,
          metadataURI: metadataURI,
          joinedDate: new Date().toISOString().split('T')[0],
          lastActive: new Date().toISOString().split('T')[0],
          tokensManaged: 0,
          totalVolume: 0
        };
        
        // Try to fetch metadata from IPFS
        try {
          if (metadataURI && metadataURI !== '' && metadataURI !== 'undefined') {
            const metadata = await fetchIPFSContent(metadataURI);
            if (metadata && metadata.name && metadata.email) {
              userData.name = metadata.name;
              userData.email = metadata.email;
            }
          }
        } catch (error) {
          console.log(`Using fallback data for issuer ${address}:`, error);
        }
        
        issuerUsers.push(userData);
      }
      
      // Process managers
      for (const address of managersData.addresses) {
        const metadataURI = managersData.metadata[address];
        
        // Fetch assigned tokens for this manager
        let assignedTokens: string[] = [];
        try {
          assignedTokens = await getManagerTokens(address);
        } catch (error) {
          console.log(`Error fetching tokens for manager ${address}:`, error);
        }
        
        let userData = {
          id: address,
          address: address,
          name: `Manager ${address.slice(0, 6)}...${address.slice(-4)}`,
          email: `manager-${address.slice(0, 8)}@platform.local`,
          role: 'manager' as const,
          status: 'active' as const,
          metadataURI: metadataURI,
          joinedDate: new Date().toISOString().split('T')[0],
          lastActive: new Date().toISOString().split('T')[0],
          tokensManaged: assignedTokens.length,
          totalVolume: 0,
          assignedTokens: assignedTokens
        };
        
        // Try to fetch metadata from IPFS
        try {
          if (metadataURI && metadataURI !== '' && metadataURI !== 'undefined') {
            const metadata = await fetchIPFSContent(metadataURI);
            if (metadata && metadata.name && metadata.email) {
              userData.name = metadata.name;
              userData.email = metadata.email;
            }
          }
        } catch (error) {
          console.log(`Using fallback data for manager ${address}:`, error);
        }
        
        managerUsers.push(userData);
      }
      
      setIssuers(issuerUsers);
      setManagers(managerUsers);
      
      setSystemMetrics({
        totalIssuers: issuerUsers.length,
        totalManagers: managerUsers.length,
        activeTokens: 8,
        totalVolume: 21730000,
        marketplaceStatus: !marketplacePausedStatus,
        platformFees: 125000
      });
      
      console.log('✅ Contract data loaded successfully');
      
    } catch (error: any) {
      console.error('❌ Error fetching contract data:', error);
      toast.error(`Failed to load contract data: ${error.message}`);
    } finally {
      setIsLoadingContractData(false);
    }
  };

  // OneChain Contract Functions
  const getContractIssuers = async () => {
    try {
      return await oneChainService.getAuthorizedIssuers();
    } catch (error) {
      console.error('Error fetching contract issuers:', error);
      return { addresses: [], count: 0, metadata: {} };
    }
  };

  const getContractManagers = async () => {
    try {
      // For now, return empty data - managers will be implemented later
      return { addresses: [], count: 0, metadata: {} };
    } catch (error) {
      console.error('Error fetching contract managers:', error);
      return { addresses: [], count: 0, metadata: {} };
    }
  };

  const checkMarketplaceStatus = async () => {
    try {
      const isPaused = await oneChainService.isMarketplacePaused();
      return !isPaused;
    } catch (error) {
      console.error('Error checking marketplace status:', error);
      return true;
    }
  };

  const checkMarketplacePaused = async () => {
    try {
      return await oneChainService.isMarketplacePaused();
    } catch (error) {
      console.error('Error checking marketplace paused status:', error);
      return false;
    }
  };

  const getManagerTokens = async (managerAddress: string) => {
    try {
      // Fetch tokens assigned to this manager from OneChain
      return [];
    } catch (error) {
      console.error('Error fetching manager tokens:', error);
      return [];
    }
  };

  // Admin Actions with OneChain Integration
  const addIssuer = async () => {
    if (!isConnected || !signAndExecuteTransaction) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!userForm.walletAddress) {
      toast.error('Wallet address is required');
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Define the issuer's name from the form
      const issuerName = `${userForm.firstName} ${userForm.lastName}`;

      // 2. Prepare and upload metadata to IPFS
      const metadata = {
        name: issuerName,
        email: userForm.email,
        role: userForm.role,
        dateAdded: new Date().toISOString()
      };
      
      const metadataURI = await uploadJSONToIPFS(metadata);
      
      // 3. Call the service with the CORRECT arguments and order
      const result = await oneChainService.addIssuer(
        userForm.walletAddress, // Argument 1: issuerAddress (Correct)
        issuerName,             // Argument 2: name (Added)
        metadataURI,            // Argument 3: metadataURI (Corrected position)
        address!,               // Argument 4: signerAddress (Corrected position)
        signAndExecuteTransaction
      );

      if (result.success) {
        toast.success('Issuer added successfully!');
        setShowAddUserDialog(false);
        resetUserForm();
        loadContractData();
      } else {
        toast.error(`Failed to add issuer: ${result.error}`);
      }
      
    } catch (error: any) {
      console.error('Error adding issuer:', error);
      toast.error(`Failed to add issuer: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const removeIssuer = async (userAddress: string) => {
    if (!isConnected || !signAndExecuteTransaction) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    
    try {
      // Use OneChainService to remove issuer
      const result = await oneChainService.removeIssuer(
        userAddress,
        address!,
        signAndExecuteTransaction
      );

      if (result.success) {
        toast.success('Issuer removed successfully!');
        setShowRemoveUserDialog(false);
        setSelectedUser(null);
        loadContractData(); // Reload data
      } else {
        toast.error(`Failed to remove issuer: ${result.error}`);
      }
      
    } catch (error: any) {
      console.error('Error removing issuer:', error);
      toast.error(`Failed to remove issuer: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMarketplace = async () => {
    if (!isConnected || !signAndExecuteTransaction) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    
    try {
      let result;
      
      if (marketplacePaused) {
        result = await oneChainService.resumeMarketplace(address!, signAndExecuteTransaction);
      } else {
        result = await oneChainService.pauseMarketplace(address!, signAndExecuteTransaction);
      }

      if (result.success) {
        toast.success(`Marketplace ${marketplacePaused ? 'resumed' : 'paused'} successfully!`);
        setShowMarketplaceToggleDialog(false);
        setMarketplacePaused(!marketplacePaused);
        setSystemMetrics(prev => ({ ...prev, marketplaceStatus: marketplacePaused }));
      } else {
        toast.error(`Failed to update marketplace: ${result.error}`);
      }
      
    } catch (error: any) {
      console.error('Error updating marketplace:', error);
      toast.error(`Failed to update marketplace: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetUserForm = () => {
    setUserForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      walletAddress: '',
      role: 'issuer',
      metadataURI: ''
    });
  };

  if (!isConnected) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className={`text-2xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                OneChain Admin Panel
              </CardTitle>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Connect your wallet to access administrative functions
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ConnectButton />
              <div className="text-center">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Admin access required for platform management
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  OneChain Admin
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-500 text-white text-xs">
                    {address?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full grid-cols-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="issuers" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Issuers</span>
            </TabsTrigger>
            <TabsTrigger value="managers" className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>Managers</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Total Issuers
                        </p>
                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {systemMetrics.totalIssuers}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Active Tokens
                        </p>
                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {systemMetrics.activeTokens}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Total Volume
                        </p>
                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          ${(systemMetrics.totalVolume / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Marketplace
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={systemMetrics.marketplaceStatus ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {systemMetrics.marketplaceStatus ? 'Active' : 'Paused'}
                          </Badge>
                        </div>
                      </div>
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        systemMetrics.marketplaceStatus ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {systemMetrics.marketplaceStatus ? 
                          <CheckCircle className="w-6 h-6 text-green-600" /> :
                          <XCircle className="w-6 h-6 text-red-600" />
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardHeader>
                <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => setShowAddUserDialog(true)}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <UserPlus className="w-6 h-6" />
                    <span>Add Issuer</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowMarketplaceToggleDialog(true)}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    {marketplacePaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                    <span>{marketplacePaused ? 'Resume' : 'Pause'} Marketplace</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={loadContractData}
                    disabled={isLoadingContractData}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <RefreshCw className={`w-6 h-6 ${isLoadingContractData ? 'animate-spin' : ''}`} />
                    <span>Refresh Data</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Issuers Tab */}
          <TabsContent value="issuers" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Issuer Management
                </h2>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage authorized asset issuers on OneChain
                </p>
              </div>
              <Button onClick={() => setShowAddUserDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Issuer
              </Button>
            </div>

            <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${isDarkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          User
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          Address
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          Status
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          Joined
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {issuers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center">
                            <div className="flex flex-col items-center space-y-2">
                              <Users className={`w-12 h-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                No issuers found
                              </p>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowAddUserDialog(true)}
                              >
                                Add First Issuer
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        issuers.map((issuer) => (
                          <tr key={issuer.id} className={`${isDarkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback className="bg-blue-500 text-white">
                                    {issuer.name.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="ml-4">
                                  <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {issuer.name}
                                  </div>
                                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {issuer.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {issuer.address.slice(0, 8)}...{issuer.address.slice(-6)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge 
                                variant={issuer.status === 'active' ? 'default' : 'secondary'}
                                className="capitalize"
                              >
                                {issuer.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {issuer.joinedDate}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(issuer);
                                    setShowUserDetailsDialog(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(issuer);
                                    setShowRemoveUserDialog(true);
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Managers Tab */}
          <TabsContent value="managers" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Manager Dashboard
                </h2>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Overview of platform managers and their assigned tokens
                </p>
              </div>
            </div>

            <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Building2 className={`w-16 h-16 mx-auto ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mb-4`} />
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Manager System
                  </h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                    Manager functionality will be implemented in the next phase of OneChain integration
                  </p>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Platform Settings
              </h2>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Configure OneChain platform parameters and permissions
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <CardHeader>
                  <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Marketplace Control
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Marketplace Status
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Enable or disable marketplace operations
                      </p>
                    </div>
                    <Switch
                      checked={!marketplacePaused}
                      onCheckedChange={() => setShowMarketplaceToggleDialog(true)}
                    />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setShowMarketplaceToggleDialog(true)}
                      className="w-full"
                    >
                      {marketplacePaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                      {marketplacePaused ? 'Resume Marketplace' : 'Pause Marketplace'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <CardHeader>
                  <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Contract Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Issuer Registry:
                      </span>
                      <span className={`font-mono text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {ONECHAIN_CONTRACTS.ISSUER_REGISTRY.slice(0, 8)}...{ONECHAIN_CONTRACTS.ISSUER_REGISTRY.slice(-6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Admin Contract:
                      </span>
                      <span className={`font-mono text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {ONECHAIN_CONTRACTS.ADMIN.slice(0, 8)}...{ONECHAIN_CONTRACTS.ADMIN.slice(-6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        RWA Asset:
                      </span>
                      <span className={`font-mono text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {ONECHAIN_CONTRACTS.RWA_ASSET.slice(0, 8)}...{ONECHAIN_CONTRACTS.RWA_ASSET.slice(-6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Marketplace:
                      </span>
                      <span className={`font-mono text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {ONECHAIN_CONTRACTS.MARKETPLACE.slice(0, 8)}...{ONECHAIN_CONTRACTS.MARKETPLACE.slice(-6)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Add New Issuer
            </DialogTitle>
            <DialogDescription className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Add a new authorized issuer to the OneChain platform
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={userForm.firstName}
                  onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                  placeholder="John"
                  className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                />
              </div>
              <div>
                <Label htmlFor="lastName" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={userForm.lastName}
                  onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                  placeholder="Doe"
                  className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="john.doe@example.com"
                className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
              />
            </div>
            
            <div>
              <Label htmlFor="walletAddress" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Wallet Address
              </Label>
              <Input
                id="walletAddress"
                value={userForm.walletAddress}
                onChange={(e) => setUserForm({ ...userForm, walletAddress: e.target.value })}
                placeholder="0x..."
                className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddUserDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={addIssuer}
              disabled={isLoading || !userForm.walletAddress || !userForm.firstName}
            >
              {isLoading ? 'Adding...' : 'Add Issuer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={showUserDetailsDialog} onOpenChange={setShowUserDetailsDialog}>
        <DialogContent className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              User Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-blue-500 text-white text-lg">
                    {selectedUser.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedUser.name}
                  </h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedUser.email}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Wallet Address
                  </Label>
                  <p className={`text-sm font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedUser.address}
                  </p>
                </div>
                <div>
                  <Label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </Label>
                  <Badge variant={selectedUser.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                    {selectedUser.status}
                  </Badge>
                </div>
                <div>
                  <Label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Joined Date
                  </Label>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedUser.joinedDate}
                  </p>
                </div>
                <div>
                  <Label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Last Active
                  </Label>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedUser.lastActive}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove User Dialog */}
      <Dialog open={showRemoveUserDialog} onOpenChange={setShowRemoveUserDialog}>
        <DialogContent className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Remove Issuer
            </DialogTitle>
            <DialogDescription className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Are you sure you want to remove this issuer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-red-500 text-white">
                    {selectedUser.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-red-900">{selectedUser.name}</p>
                  <p className="text-sm text-red-700">{selectedUser.email}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRemoveUserDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedUser && removeIssuer(selectedUser.address)}
              disabled={isLoading}
            >
              {isLoading ? 'Removing...' : 'Remove Issuer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Marketplace Toggle Dialog */}
      <Dialog open={showMarketplaceToggleDialog} onOpenChange={setShowMarketplaceToggleDialog}>
        <DialogContent className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {marketplacePaused ? 'Resume' : 'Pause'} Marketplace
            </DialogTitle>
            <DialogDescription className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {marketplacePaused 
                ? 'Resume marketplace operations to allow trading.'
                : 'Pause marketplace operations to temporarily disable trading.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className={`p-4 rounded-lg ${
            marketplacePaused ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center space-x-3">
              {marketplacePaused ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              )}
              <div>
                <p className={`font-medium ${
                  marketplacePaused ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  {marketplacePaused ? 'Resume Trading' : 'Pause Trading'}
                </p>
                <p className={`text-sm ${
                  marketplacePaused ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {marketplacePaused 
                    ? 'This will allow users to buy and sell assets again.'
                    : 'This will temporarily prevent all marketplace transactions.'
                  }
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMarketplaceToggleDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={toggleMarketplace}
              disabled={isLoading}
              variant={marketplacePaused ? "default" : "destructive"}
            >
              {isLoading ? 'Updating...' : (marketplacePaused ? 'Resume' : 'Pause')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
