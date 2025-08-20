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
  Briefcase
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
import { OneChainService } from '@/services/oneChainService';
import { uploadJSONToIPFS, fetchIPFSContent } from '@/utils/ipfs';

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
        // For now, assume marketplace is not paused until OneChain admin functions are implemented
        setMarketplacePaused(false);
      } catch (error) {
        console.error('Error loading marketplace status:', error);
      }
    };
    
    loadMarketplaceStatus();
  }, []);

  const loadContractData = async () => {
    if (!isConnected) return;
    
    setIsLoadingContractData(true);
    
    try {
      console.log('🔄 Fetching OneChain contract data...');
      
      // For now, use placeholder data until OneChain admin functions are implemented
      const issuersData = { addresses: [], count: 0, metadata: {} };
      const managersData = { addresses: [], count: 0, metadata: {} };
      const marketplacePausedStatus = false;
      
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
        
        // Try to fetch metadata from IPFS silently
        try {
          if (metadataURI && metadataURI !== '' && metadataURI !== 'undefined') {
            console.log(`Fetching metadata for issuer ${address} from URI: ${metadataURI}`);
            const metadata = await fetchIPFSContent(metadataURI);
            if (metadata && metadata.name && metadata.email) {
              userData.name = metadata.name;
              userData.email = metadata.email;
              console.log(`Successfully loaded metadata for issuer ${address}:`, { name: metadata.name, email: metadata.email });
            } else {
              console.log(`No valid metadata found for issuer ${address}`, metadata);
            }
          } else {
            console.log(`No metadata URI for issuer ${address}`);
          }
        } catch (error) {
          // Silently fail and use fallback data
          console.log(`Using fallback data for issuer ${address} due to error:`, error);
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
        
        // Try to fetch metadata from IPFS silently
        try {
          if (metadataURI && metadataURI !== '' && metadataURI !== 'undefined') {
            console.log(`Fetching metadata for manager ${address} from URI: ${metadataURI}`);
            const metadata = await fetchIPFSContent(metadataURI);
            if (metadata && metadata.name && metadata.email) {
              userData.name = metadata.name;
              userData.email = metadata.email;
              console.log(`Successfully loaded metadata for manager ${address}:`, { name: metadata.name, email: metadata.email });
            } else {
              console.log(`No valid metadata found for manager ${address}`, metadata);
            }
          } else {
            console.log(`No metadata URI for manager ${address}`);
          }
        } catch (error) {
          // Silently fail and use fallback data
          console.log(`Using fallback data for manager ${address} due to error:`, error);
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
        marketplaceStatus: !marketplacePaused,
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

  const loadDemoData = () => {
    // Keep this for fallback/demo purposes - now empty since we use contract data
    setIssuers([]);
    setManagers([]);
    setSystemMetrics({
      totalIssuers: 0,
      totalManagers: 0,
      activeTokens: 0,
      totalVolume: 0,
      marketplaceStatus: !marketplacePaused,
      platformFees: 0
    });
  };

  const handleAddUser = async () => {
    // Check wallet connection
    if (!isConnected || !signer) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!userForm.firstName || !userForm.lastName || !userForm.email || !userForm.password || !userForm.walletAddress) {
      toast.error('Please fill all required fields');
      return;
    }

    if (userForm.password !== userForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (userForm.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    // Validate wallet address format
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!walletRegex.test(userForm.walletAddress)) {
      toast.error('Invalid wallet address format');
      return;
    }

    setIsLoading(true);
    
    try {
      // Step 1: Create metadata object for IPFS
      const metadata = {
        name: `${userForm.firstName} ${userForm.lastName}`,
        email: userForm.email,
        role: userForm.role,
        createdAt: new Date().toISOString(),
        createdBy: address
      };

      // Step 2: Upload metadata to IPFS
      const metadataURI = await uploadJSONToIPFS(metadata);
      console.log('Metadata uploaded to IPFS:', metadataURI);

      // Step 3: Add to contract
      if (userForm.role === 'issuer') {
        toast('Adding issuer to contract...');
        await addIssuer(userForm.walletAddress, metadataURI, signer);
        toast.success('Issuer added successfully!');
      } else {
        toast('Adding manager to contract...');
        await addManager(userForm.walletAddress, metadataURI, signer);
        toast.success('Manager added successfully!');
      }

      // Step 4: Backend registration using the regular register route
      const userData = {
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        email: userForm.email,
        password: userForm.password,
        confirmPassword: userForm.confirmPassword,
        walletAddress: userForm.walletAddress,
        role: userForm.role,
      };

      try {
        await authApi.register(userData);
        console.log('User registered in backend successfully via register route');
      } catch (backendError) {
        console.error('Backend registration failed (continuing anyway):', backendError);
        // Don't fail the whole process if backend fails
      }
      
      // Step 5: Refresh contract data to show the new user
      await loadContractData();
      
      setShowAddUserDialog(false);
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
      
      toast.success(`${userForm.role.charAt(0).toUpperCase() + userForm.role.slice(1)} added successfully!`);
      
    } catch (error: any) {
      console.error('Error adding user:', error);
      if (error.message.includes('User denied')) {
        toast.error('Transaction was cancelled by user');
      } else if (error.message.includes('already exists')) {
        toast.error('User already exists in the system');
      } else {
        toast.error(`Failed to add user: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async () => {
    if (!selectedUser) return;

    // Check wallet connection
    if (!isConnected || !signer) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    
    try {
      // Remove from contract first
      if (selectedUser.role === 'issuer') {
        toast('Removing issuer from contract...');
        const tx = await removeIssuer(selectedUser.address, signer);
        console.log('Remove issuer transaction:', tx);
        toast.success('Issuer removed successfully!');
      } else {
        toast('Removing manager from contract...');
        const tx = await removeManager(selectedUser.address, signer);
        console.log('Remove manager transaction:', tx);
        toast.success('Manager removed successfully!');
      }

      // Wait a moment for the blockchain to update
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Refresh contract data to reflect the removal
      await loadContractData();
      
      setShowRemoveUserDialog(false);
      setSelectedUser(null);
      
    } catch (error: any) {
      console.error('Error removing user:', error);
      if (error.message.includes('User denied')) {
        toast.error('Transaction was cancelled by user');
      } else if (error.message.includes('not found')) {
        toast.error('User not found in contract');
      } else {
        toast.error(`Failed to remove user: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMarketplace = async () => {
    // Check wallet connection
    if (!isConnected || !signer) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    
    try {
      // Call the contract to toggle marketplace pause status
      const action = marketplacePaused ? 'Resuming' : 'Pausing';
      toast(`${action} marketplace...`);
      
      const tx = await pauseMarketplace(signer);
      console.log('Marketplace toggle transaction:', tx);
      
      // Wait a moment for the blockchain to update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Fetch the updated marketplace status from contract
      const newStatus = await getMarketplacePaused();
      setMarketplacePaused(newStatus);
      setSystemMetrics(prev => ({ ...prev, marketplaceStatus: !newStatus }));
      
      toast.success(newStatus ? 'Marketplace paused successfully' : 'Marketplace resumed successfully');
      
      // Close the confirmation dialog
      setShowMarketplaceToggleDialog(false);
      
    } catch (error: any) {
      console.error('Error toggling marketplace:', error);
      if (error.message.includes('User denied')) {
        toast.error('Transaction was cancelled by user');
      } else {
        toast.error(`Failed to toggle marketplace: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarketplaceToggleRequest = () => {
    setShowMarketplaceToggleDialog(true);
  };

  const handleAssignToken = async () => {
    // Check wallet connection
    if (!isConnected || !signer) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!assignTokenForm.tokenId) {
      toast.error('Please enter a token ID');
      return;
    }

    // Token ID can now be any string (no longer restricted to numbers)
    if (assignTokenForm.tokenId.trim().length === 0) {
      toast.error('Token ID cannot be empty');
      return;
    }

    setIsLoading(true);
    
    try {
      toast('Assigning token to manager...');
      
      const tx = await assignManager(assignTokenForm.managerAddress, assignTokenForm.tokenId, signer);
      console.log('Assign manager transaction:', tx);
      
      toast.success('Token assigned to manager successfully!');
      
      // Wait a moment for the blockchain to update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh contract data to show the updated assignments
      await loadContractData();
      
      setShowAssignTokenDialog(false);
      setAssignTokenForm({ tokenId: '', managerAddress: '' });
      
    } catch (error: any) {
      console.error('Error assigning token:', error);
      if (error.message.includes('User denied')) {
        toast.error('Transaction was cancelled by user');
      } else {
        toast.error(`Failed to assign token: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignTokenRequest = (manager: any) => {
    setAssignTokenForm({ tokenId: '', managerAddress: manager.address });
    setShowAssignTokenDialog(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Professional Header */}
      <header className={`${isDarkMode ? 'bg-slate-800/95 backdrop-blur-md border-slate-700/50' : 'bg-white/95 backdrop-blur-md border-slate-200/60'} border-b sticky top-0 z-50 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-lg font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Administration Console</h1>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Platform Management & Control</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Professional Status Indicator */}
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium ${
                marketplacePaused 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              } ${isDarkMode && (marketplacePaused ? 'bg-red-900/20 text-red-400 border-red-800/30' : 'bg-emerald-900/20 text-emerald-400 border-emerald-800/30')}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${marketplacePaused ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                <span>{marketplacePaused ? 'Trading Suspended' : 'System Operational'}</span>
              </div>

              {/* Wallet Connection Status */}
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium ${
                isConnected 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              } ${isDarkMode && (isConnected ? 'bg-green-900/20 text-green-400 border-green-800/30' : 'bg-red-900/20 text-red-400 border-red-800/30')}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{isConnected ? 'Wallet Connected' : 'Wallet Disconnected'}</span>
              </div>
              
              {!isConnected && (
                <Button 
                  onClick={connectWallet}
                  size="sm"
                  className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 text-xs"
                >
                  Connect Wallet
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'} h-8 w-8 p-0`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              <Button variant="ghost" size="sm" className={`${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'} h-8 w-8 p-0`}>
                <Bell className="w-4 h-4" />
              </Button>
              
              <Button asChild variant="ghost" size="sm" className={`${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                <Link to="/marketplace" className="flex items-center space-x-2 px-3 py-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Marketplace</span>
                </Link>
              </Button>
              
              <Button asChild variant="ghost" size="sm" className={`${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                <Link to="/" className="flex items-center space-x-2 px-3 py-1.5">
                  <Home className="w-4 h-4" />
                  <span className="text-sm">Home</span>
                </Link>
              </Button>
              
              <div className="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>
              
              <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                <AvatarFallback className="text-xs bg-slate-100 dark:bg-slate-800">AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Professional Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className={`inline-flex h-10 items-center justify-center rounded-lg p-1 ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="issuers" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white">
              Issuers
            </TabsTrigger>
            <TabsTrigger value="managers" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white">
              Managers
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white">
              System
            </TabsTrigger>
          </TabsList>

          {/* Professional Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Executive Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <Card className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'} shadow-sm hover:shadow-md transition-shadow duration-200`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Active Issuers</p>
                      <p className={`text-2xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {isLoadingContractData ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                            <span className="text-lg">Loading...</span>
                          </div>
                        ) : (
                          systemMetrics.totalIssuers
                        )}
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Live contract data</p>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                      <Building2 className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'} shadow-sm hover:shadow-md transition-shadow duration-200`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Property Managers</p>
                      <p className={`text-2xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {isLoadingContractData ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                            <span className="text-lg">Loading...</span>
                          </div>
                        ) : (
                          systemMetrics.totalManagers
                        )}
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Live contract data</p>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                      <Users className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'} shadow-sm hover:shadow-md transition-shadow duration-200`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Active Tokens</p>
                      <p className={`text-2xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{systemMetrics.activeTokens}</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">+3 this week</p>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                      <Zap className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'} shadow-sm hover:shadow-md transition-shadow duration-200`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total Volume</p>
                      <p className={`text-2xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>${(systemMetrics.totalVolume / 1000000).toFixed(1)}M</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">+$2.1M this month</p>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Professional Action Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'} shadow-sm`}>
                  <CardHeader className="pb-4">
                    <CardTitle className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Administrative Actions</CardTitle>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Manage platform users and system settings</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        onClick={() => setShowAddUserDialog(true)}
                        disabled={!isConnected}
                        className="h-20 flex-col space-y-2 bg-slate-900 hover:bg-slate-800 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
                      >
                        <UserPlus className="w-5 h-5" />
                        <span className="text-sm font-medium">{!isConnected ? 'Connect Wallet' : 'Add User'}</span>
                      </Button>
                      
                      <Button 
                        onClick={loadContractData}
                        disabled={isLoadingContractData || !isConnected}
                        variant="outline"
                        className={`h-20 flex-col space-y-2 ${isDarkMode ? 'border-slate-700 bg-slate-800/30 text-slate-300 hover:bg-slate-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'} disabled:opacity-50`}
                      >
                        {isLoadingContractData ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-5 h-5" />
                        )}
                        <span className="text-sm font-medium">
                          {isLoadingContractData ? 'Loading...' : 'Refresh Data'}
                        </span>
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className={`h-20 flex-col space-y-2 ${isDarkMode ? 'border-slate-700 bg-slate-800/30 text-slate-300 hover:bg-slate-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                      >
                        <FileText className="w-5 h-5" />
                        <span className="text-sm font-medium">Audit Logs</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className={`h-20 flex-col space-y-2 ${isDarkMode ? 'border-slate-700 bg-slate-800/30 text-slate-300 hover:bg-slate-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                      >
                        <CreditCard className="w-5 h-5" />
                        <span className="text-sm font-medium">Fee Management</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className={`h-20 flex-col space-y-2 ${isDarkMode ? 'border-slate-700 bg-slate-800/30 text-slate-300 hover:bg-slate-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                      >
                        <Briefcase className="w-5 h-5" />
                        <span className="text-sm font-medium">Asset Registry</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'} shadow-sm`}>
                  <CardHeader className="pb-4">
                    <CardTitle className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>System Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${marketplacePaused ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                        <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Trading Engine</span>
                      </div>
                      <Badge variant={marketplacePaused ? 'destructive' : 'default'} className="text-xs">
                        {marketplacePaused ? 'Paused' : 'Active'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Smart Contracts</span>
                      </div>
                      <Badge variant="default" className="text-xs">Deployed</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Infrastructure</span>
                      </div>
                      <Badge variant="default" className="text-xs">Healthy</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Professional Issuers Tab */}
          <TabsContent value="issuers" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Platform Issuers</h2>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Manage tokenization partners and authorized issuers</p>
              </div>
              <Button 
                onClick={() => { setUserForm(prev => ({ ...prev, role: 'issuer' })); setShowAddUserDialog(true); }}
                className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Issuer
              </Button>
            </div>

            <div className="space-y-4">
              {issuers.map((issuer) => (
                <Card key={issuer.id} className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'} shadow-sm hover:shadow-md transition-all duration-200`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-11 w-11 border border-slate-200 dark:border-slate-700">
                          <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                            {issuer.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{issuer.name}</h3>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{issuer.email}</p>
                          <p className={`text-xs font-mono ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                            {issuer.address.slice(0, 8)}...{issuer.address.slice(-6)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-8">
                        <div className="text-right space-y-1">
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {issuer.tokensManaged} Active Tokens
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            ${(issuer.totalVolume! / 1000000).toFixed(1)}M Total Volume
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${issuer.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                          <Badge 
                            variant={issuer.status === 'active' ? 'default' : 'secondary'} 
                            className="text-xs font-medium"
                          >
                            {issuer.status}
                          </Badge>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setSelectedUser(issuer);
                              setShowUserDetailsDialog(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
                            onClick={() => {
                              setSelectedUser(issuer);
                              setShowRemoveUserDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Professional Managers Tab */}
          <TabsContent value="managers" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Property Managers</h2>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Manage asset managers and property supervisors</p>
              </div>
              <Button 
                onClick={() => { setUserForm(prev => ({ ...prev, role: 'manager' })); setShowAddUserDialog(true); }}
                className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Manager
              </Button>
            </div>

            <div className="space-y-4">
              {managers.map((manager) => (
                <Card key={manager.id} className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'} shadow-sm hover:shadow-md transition-all duration-200`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-11 w-11 border border-slate-200 dark:border-slate-700">
                          <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                            {manager.name.split(' ').map(n => n.charAt(0)).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{manager.name}</h3>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{manager.email}</p>
                          <p className={`text-xs font-mono ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                            {manager.address.slice(0, 8)}...{manager.address.slice(-6)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-8">
                        <div className="text-right space-y-1">
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {manager.tokensManaged} Managed Assets
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            ${manager.totalVolume!.toLocaleString()} Monthly Income
                          </p>
                          {manager.assignedTokens && manager.assignedTokens.length > 0 && (
                            <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} font-mono`}>
                              Tokens: {manager.assignedTokens.join(', ')}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${manager.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                          <Badge 
                            variant={manager.status === 'active' ? 'default' : 'secondary'} 
                            className="text-xs font-medium"
                          >
                            {manager.status}
                          </Badge>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950"
                            onClick={() => handleAssignTokenRequest(manager)}
                            title="Assign Token"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setSelectedUser(manager);
                              setShowUserDetailsDialog(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
                            onClick={() => {
                              setSelectedUser(manager);
                              setShowRemoveUserDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Professional System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>System Administration</h2>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Configure platform settings and monitor system health</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'} shadow-sm`}>
                <CardHeader className="pb-4">
                  <CardTitle className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Trading Controls</CardTitle>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Manage marketplace operations</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Marketplace Status</p>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {marketplacePaused ? 'All trading operations are currently suspended' : 'Trading operations are active and functioning normally'}
                      </p>
                    </div>
                    <Switch 
                      checked={!marketplacePaused}
                      onCheckedChange={handleMarketplaceToggleRequest}
                      disabled={isLoading || !isConnected}
                    />
                  </div>
                  
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button 
                      onClick={handleMarketplaceToggleRequest}
                      disabled={isLoading || !isConnected}
                      className="w-full"
                      variant={marketplacePaused ? "default" : "destructive"}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {marketplacePaused ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                          {marketplacePaused ? 'Resume Trading' : 'Suspend Trading'}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'} shadow-sm`}>
                <CardHeader className="pb-4">
                  <CardTitle className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Platform Configuration</CardTitle>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>System settings and administration tools</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start h-12">
                    <Settings className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Fee Structure</div>
                      <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Configure platform fees and commissions</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start h-12">
                    <Download className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Export Logs</div>
                      <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Download system logs and audit trails</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start h-12">
                    <BarChart3 className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Analytics Dashboard</div>
                      <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>View detailed platform analytics</div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Professional Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className={`sm:max-w-md ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-xl`}>
          <DialogHeader className="space-y-3">
            <DialogTitle className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Add {userForm.role.charAt(0).toUpperCase() + userForm.role.slice(1)}
            </DialogTitle>
            <DialogDescription className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Create a new {userForm.role} account with platform access and appropriate permissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="role" className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>User Role</Label>
              <Select 
                value={userForm.role} 
                onValueChange={(value: 'issuer' | 'manager') => 
                  setUserForm(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger className={`${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="issuer">Platform Issuer</SelectItem>
                  <SelectItem value="manager">Property Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={userForm.firstName}
                  onChange={(e) => setUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className={`${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400' : 'bg-white border-slate-300'}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={userForm.lastName}
                  onChange={(e) => setUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className={`${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400' : 'bg-white border-slate-300'}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@company.com"
                value={userForm.email}
                onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                className={`${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400' : 'bg-white border-slate-300'}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="walletAddress" className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Wallet Address</Label>
              <Input
                id="walletAddress"
                placeholder="0x742d35Cc..."
                value={userForm.walletAddress}
                onChange={(e) => setUserForm(prev => ({ ...prev, walletAddress: e.target.value }))}
                className={`${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400' : 'bg-white border-slate-300'} font-mono text-sm`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter secure password"
                value={userForm.password}
                onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                className={`${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400' : 'bg-white border-slate-300'}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={userForm.confirmPassword}
                onChange={(e) => setUserForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className={`${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400' : 'bg-white border-slate-300'}`}
              />
            </div>
          </div>

          <DialogFooter className="space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={isLoading} className="bg-slate-900 hover:bg-slate-800">
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                `Create ${userForm.role.charAt(0).toUpperCase() + userForm.role.slice(1)} Account`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={showUserDetailsDialog} onOpenChange={setShowUserDetailsDialog}>
        <DialogContent className={`sm:max-w-2xl ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedUser.name}
                </DialogTitle>
                <DialogDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)} Details
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Wallet Address</p>
                    <p className={`font-mono text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedUser.address}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email</p>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</p>
                    <Badge variant={selectedUser.status === 'active' ? 'default' : 'secondary'}>
                      {selectedUser.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Joined Date</p>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedUser.joinedDate}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last Active</p>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedUser.lastActive}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedUser.role === 'issuer' ? 'Tokens Created' : 'Assets Managed'}
                    </p>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedUser.tokensManaged}</p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUserDetailsDialog(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Professional Remove User Confirmation Dialog */}
      <Dialog open={showRemoveUserDialog} onOpenChange={setShowRemoveUserDialog}>
        <DialogContent className={`sm:max-w-md ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-xl`}>
          {selectedUser && (
            <>
              <DialogHeader className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <DialogTitle className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Confirm Removal
                    </DialogTitle>
                    <DialogDescription className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Are you sure you want to remove this user from the blockchain? This action cannot be undone.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="py-4">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'} border ${isDarkMode ? 'border-slate-600' : 'border-slate-200'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    You are about to remove <span className="font-medium">{selectedUser.name}</span> from the platform.
                  </p>
                  <p className={`text-xs mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Role: <span className="capitalize font-medium">{selectedUser.role}</span>
                  </p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Address: <span className="font-mono">{selectedUser.address}</span>
                  </p>
                  <div className={`mt-3 p-3 rounded ${isDarkMode ? 'bg-red-900/20 border border-red-800/30' : 'bg-red-50 border border-red-200'}`}>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                      ⚠️ This action cannot be undone. All associated permissions will be permanently revoked.
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className="space-x-2">
                <Button variant="outline" onClick={() => setShowRemoveUserDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleRemoveUser} 
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <UserMinus className="w-4 h-4 mr-2" />
                      Remove User
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Marketplace Toggle Confirmation Dialog */}
      <Dialog open={showMarketplaceToggleDialog} onOpenChange={setShowMarketplaceToggleDialog}>
        <DialogContent className={`sm:max-w-md ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-xl`}>
          <DialogHeader className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${marketplacePaused ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                {marketplacePaused ? (
                  <Unlock className={`w-5 h-5 ${marketplacePaused ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                ) : (
                  <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <DialogTitle className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {marketplacePaused ? 'Resume Trading' : 'Suspend Trading'}
                </DialogTitle>
                <DialogDescription className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  This action will affect the entire marketplace operations
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="py-4">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'} border ${isDarkMode ? 'border-slate-600' : 'border-slate-200'}`}>
              {marketplacePaused ? (
                <>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                    ✅ Resume Marketplace Trading
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-3`}>
                    This will enable all trading operations across the platform:
                  </p>
                  <ul className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} space-y-1 ml-4`}>
                    <li>• Token buying and selling will be enabled</li>
                    <li>• All marketplace functions will be active</li>
                    <li>• Users can perform transactions normally</li>
                    <li>• Platform fees and commissions will apply</li>
                  </ul>
                </>
              ) : (
                <>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                    ⚠️ Suspend All Marketplace Trading
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-3`}>
                    This will immediately halt all trading operations:
                  </p>
                  <ul className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} space-y-1 ml-4`}>
                    <li>• All token purchases will be disabled</li>
                    <li>• Existing listings will be suspended</li>
                    <li>• Users cannot buy or sell any assets</li>
                    <li>• Only viewing functions will remain active</li>
                  </ul>
                </>
              )}
              
              <div className={`mt-3 p-3 rounded ${isDarkMode ? 'bg-orange-900/20 border border-orange-800/30' : 'bg-orange-50 border border-orange-200'}`}>
                <p className={`text-xs font-medium ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>
                  ⚡ This action requires a blockchain transaction and will affect all users immediately.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={() => setShowMarketplaceToggleDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleToggleMarketplace} 
              disabled={isLoading || !isConnected}
              variant={marketplacePaused ? "default" : "destructive"}
              className={marketplacePaused ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {marketplacePaused ? (
                    <>
                      <Unlock className="w-4 h-4 mr-2" />
                      Confirm Resume Trading
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Confirm Suspend Trading
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Token Dialog */}
      <Dialog open={showAssignTokenDialog} onOpenChange={setShowAssignTokenDialog}>
        <DialogContent className={`sm:max-w-md ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-xl`}>
          <DialogHeader className="space-y-3">
            <DialogTitle className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Assign Token to Manager
            </DialogTitle>
            <DialogDescription className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Assign a specific token ID to this manager for asset management.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'} border ${isDarkMode ? 'border-slate-600' : 'border-slate-200'}`}>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Manager Address:</p>
                <p className={`text-xs font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
                  {assignTokenForm.managerAddress}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tokenId" className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  Token ID
                </Label>
                <Input
                  id="tokenId"
                  type="text"
                  placeholder="Enter token ID (e.g., token_001, asset_123...)"
                  value={assignTokenForm.tokenId}
                  onChange={(e) => setAssignTokenForm(prev => ({ ...prev, tokenId: e.target.value }))}
                  className={`${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400' : 'bg-white border-slate-300'}`}
                />
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Enter the ID of the token you want to assign to this manager (can be alphanumeric).
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={() => setShowAssignTokenDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignToken} 
              disabled={isLoading || !assignTokenForm.tokenId || !isConnected}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Token
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;