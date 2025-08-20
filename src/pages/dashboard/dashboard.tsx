import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Wallet, User, DollarSign, TrendingUp, TrendingDown, AlertCircle, Bell, Settings, LogOut, Home, ChevronRight, Eye, EyeOff, Calendar, PieChart, Activity, ArrowUpRight, Building, FileText, Coins, Leaf, Download, Filter, Menu, X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { OneChainService } from '@/services/oneChainService';
import { useSuiWallet, ConnectButton } from '@/context/SuiWalletContext';
import { fetchIPFSContent } from '@/utils/ipfs';

// --- UTILITY FUNCTIONS (Updated for OCT token) ---
const formatPriceInUSD = (octAmount: number, octPrice: number): string => {
  const usdValue = octAmount * octPrice;
  return `$${usdValue.toFixed(2)} USD`;
};

const formatOCTPrice = (priceInBaseUnits: string | number): string => {
  const priceNum = typeof priceInBaseUnits === 'string' ? parseFloat(priceInBaseUnits) : priceInBaseUnits;
  const octAmount = priceNum / 1e9; // Convert MIST to OCT (9 decimals)
  return `${octAmount.toFixed(4)} OCT`;
};

// Format OCT amounts that are already in OCT units (not MIST)
const formatOCTAmount = (octAmount: number): string => {
  return `${octAmount.toFixed(4)} OCT`;
};

// --- INTERFACES ---
interface UserAsset {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  price: string; // in MIST (OCT base units)
  amount: number;
  seller: string;
  metadataURI: string;
  attributes: Array<{ trait_type: string; value: string; }>;
  type: string;
}

interface PortfolioData {
  totalInvestment: number;
  currentValue: number;
  totalReturn: number;
  returnPercentage: number;
  monthlyIncome: number;
  totalAssets: number;
  activeInvestments: number;
}

// --- MOCK DATA (for sections without on-chain data yet) ---
const MOCK_INCOME_HISTORY = [
  { date: "2024-03-01", asset: "Manhattan Luxury Apartment", amount: 1850, type: "Rental" },
  { date: "2024-02-01", asset: "Manhattan Luxury Apartment", amount: 1850, type: "Rental" },
  { date: "2024-01-01", asset: "Carbon Credit Portfolio", amount: 250, type: "Carbon Credits" },
];

const MOCK_TRANSACTIONS = [
  { date: "2024-03-15", time: "09:30 AM", asset: "Manhattan Luxury Apartment", amount: 125000, type: "buy", status: "completed" },
  { date: "2024-02-28", time: "10:20 AM", asset: "Carbon Credit Portfolio", amount: 15000, type: "buy", status: "completed" },
  { date: "2024-02-15", time: "14:45 PM", asset: "Tech Startup Shares", amount: 50000, type: "buy", status: "completed" },
  { date: "2024-01-30", time: "11:20 AM", asset: "Dubai Real Estate", amount: 75000, type: "sell", status: "completed" },
];

// Function to fetch real transaction history (placeholder for future implementation)
const fetchUserTransactionHistory = async (userAddress: string) => {
  try {
    // TODO: Implement real transaction history fetching from OneChain
    // This would involve querying transaction events from the blockchain
    console.log('Fetching transaction history for:', userAddress);
    
    // For now, return mock data
    return MOCK_TRANSACTIONS;
  } catch (error) {
    console.error('Failed to fetch transaction history:', error);
    return MOCK_TRANSACTIONS; // Fallback to mock data
  }
};

const SIDEBAR_ITEMS = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'portfolio', label: 'Owned Assets', icon: Wallet },
  { id: 'income', label: 'My Income', icon: DollarSign },
  { id: 'transactions', label: 'Transactions', icon: Activity },
  { id: 'profile', label: 'Profile', icon: User },
];

// --- SELL MODAL COMPONENT (Updated for Sui/OneChain) ---
const SellModal: React.FC<{
  asset: UserAsset;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ asset, onClose, onSuccess }) => {
  const [price, setPrice] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { account, suiClient, signAndExecuteTransaction } = useSuiWallet();

  const handleListAsset = async () => {
    if (!account?.address) {
      toast.error('Please connect your wallet first.');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      toast.error('Please enter a valid price.');
      return;
    }

    setIsProcessing(true);
    try {
      // First validate that the asset still exists
      console.log(`🔍 Checking if asset ${asset.tokenId} still exists before listing...`);
      
      const priceInMist = Math.floor(parseFloat(price) * 1e9);
      const oneChainService = new OneChainService(suiClient);

      const result = await oneChainService.listAsset(
        asset.tokenId,
        priceInMist,
        account.address,
        signAndExecuteTransaction
      );

      if (result.success) {
        toast.success('Asset listed successfully!');
        onSuccess();
        onClose();
      } else {
        throw new Error(result.error || 'Failed to list asset.');
      }
    } catch (error: any) {
      console.error('Listing error:', error);
      
      // Check for specific error types
      if (error.message?.includes('object has been deleted') || 
          error.message?.includes('Object does not exist') ||
          error.message?.includes('UnresolvedObject')) {
        toast.error('This asset no longer exists. Please refresh your assets list.');
        onSuccess(); // Trigger refresh by calling onSuccess
      } else {
        toast.error(`Listing failed: ${error.message}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md bg-white">
      <DialogHeader>
        <DialogTitle>List {asset.name} for Sale</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">You are listing {asset.amount} token(s) of this asset. Set the price in OCT.</p>
        <div>
          <Label htmlFor="price">Price per Token (in OCT)</Label>
          <Input
            id="price"
            type="number"
            placeholder="e.g., 10.5"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
          <Button onClick={handleListAsset} disabled={isProcessing}>
            {isProcessing ? 'Listing...' : 'List Asset'}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};


// --- MAIN DASHBOARD COMPONENT (Updated for Sui/OneChain) ---
const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('analytics');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { account, suiClient } = useSuiWallet();
  const [userAssets, setUserAssets] = useState<UserAsset[]>([]);
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    totalInvestment: 0, currentValue: 0, totalReturn: 0, returnPercentage: 0, monthlyIncome: 0, totalAssets: 0, activeInvestments: 0
  });
  const [loading, setLoading] = useState(true);

  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<UserAsset | null>(null);

  // Fetch user assets when wallet is connected
  useEffect(() => {
    if (account?.address && suiClient) {
      fetchUserAssets(account.address);
    } else {
      setLoading(false);
      setUserAssets([]);
      calculatePortfolioData([]);
    }
  }, [account, suiClient]);

  // Add a refresh function to manually refresh assets
  const refreshAssets = () => {
    if (account?.address && suiClient) {
      fetchUserAssets(account.address);
    }
  };

  const fetchUserAssets = async (userAddress: string) => {
    setLoading(true);
    try {
      console.log('🔄 Fetching user assets for:', userAddress);
      const oneChainService = new OneChainService(suiClient);
      
      // Fetch both NFTs and FT balances
      const [rawNFTAssets, ftBalances] = await Promise.all([
        oneChainService.getUserAssets(userAddress),
        oneChainService.getUserFTBalances(userAddress)
      ]);

      console.log('📊 Raw NFT assets:', rawNFTAssets);
      console.log('💰 FT balances:', ftBalances);

      // Process NFT assets
      const enrichedNFTsPromises = rawNFTAssets.map(async (assetObject: any) => {
        const fields = assetObject.data?.content?.fields;
        if (!fields) return null;

        const metadataURI = fields.metadata_uri || '';
        let metadata: any = {};
        if (metadataURI && metadataURI.startsWith('ipfs://')) {
          metadata = await fetchIPFSContent(metadataURI);
        }

        return {
          tokenId: fields.id.id,
          name: metadata.name || 'Unnamed Asset',
          description: metadata.description || 'No description.',
          image: metadata.image ? `${import.meta.env.VITE_PINATA_GATEWAY}${metadata.image.replace('ipfs://', '')}` : '/placeholder.svg',
          price: '0', // Owned assets don't have a price until listed
          amount: 1, // NFTs have quantity of 1
          seller: userAddress,
          type: 'NFT',
          metadataURI,
          attributes: metadata.attributes || [],
        };
      });

      // Process FT balances
      const enrichedFTsPromises = ftBalances.map(async (ftBalance: any) => {
        let metadata: any = {};
        if (ftBalance.metadata_uri && ftBalance.metadata_uri.startsWith('ipfs://')) {
          metadata = await fetchIPFSContent(ftBalance.metadata_uri);
        }

        return {
          tokenId: ftBalance.asset_id,
          name: metadata.name || ftBalance.name || 'Unnamed FT Asset',
          description: metadata.description || 'Fractional Token Asset',
          image: metadata.image ? `${import.meta.env.VITE_PINATA_GATEWAY}${metadata.image.replace('ipfs://', '')}` : '/placeholder.svg',
          price: ftBalance.price_per_unit || '0',
          amount: ftBalance.user_balance, // Actual FT balance owned by user
          seller: userAddress,
          type: 'FT',
          metadataURI: ftBalance.metadata_uri || '',
          attributes: metadata.attributes || [],
        };
      });

      // Combine both NFT and FT assets
      const [enrichedNFTs, enrichedFTs] = await Promise.all([
        Promise.all(enrichedNFTsPromises),
        Promise.all(enrichedFTsPromises)
      ]);

      const allAssets = [
        ...enrichedNFTs.filter(Boolean),
        ...enrichedFTs.filter(Boolean)
      ] as UserAsset[];
      
      console.log('✅ Final enriched user assets:', allAssets);
      setUserAssets(allAssets);
      calculatePortfolioData(allAssets);
      
    } catch (error) {
      console.error('❌ Failed to fetch user assets:', error);
      toast.error('Failed to fetch your assets from the blockchain.');
      setUserAssets([]);
      calculatePortfolioData([]);
    } finally {
      setLoading(false);
    }
  };

  const calculatePortfolioData = (assets: UserAsset[]) => {
    console.log('📊 Calculating portfolio data for assets:', assets);
    
    // Calculate real investment values using FT balances and prices where available
    let totalInvestmentOCT = 0;
    let currentValueOCT = 0;

    assets.forEach(asset => {
      console.log(`💰 Processing asset:`, {
        name: asset.name,
        type: asset.type,
        amount: asset.amount,
        price: asset.price
      });

      if (asset.type === 'FT' && asset.price) {
        // Convert price from MIST to OCT (divide by 1e9)
        const priceInOCT = parseFloat(asset.price) / 1000000000;
        const assetValue = priceInOCT * asset.amount;
        
        console.log(`💵 FT Asset Value: ${asset.amount} tokens × ${priceInOCT} OCT = ${assetValue} OCT`);
        
        totalInvestmentOCT += assetValue;
        currentValueOCT += assetValue; // For now, assume current value equals investment
      } else if (asset.type === 'NFT') {
        // For NFTs, use a mock value of 1 OCT each (since they don't have quantity pricing)
        const mockNFTValue = 1;
        console.log(`🎨 NFT Asset Value: ${mockNFTValue} OCT (mock)`);
        
        totalInvestmentOCT += mockNFTValue;
        currentValueOCT += mockNFTValue;
      }
    });

    console.log(`📈 Portfolio Summary: Investment=${totalInvestmentOCT} OCT, Current=${currentValueOCT} OCT`);

    // If no real values, fall back to mock calculation
    if (totalInvestmentOCT === 0 && assets.length > 0) {
      console.log('📋 Using mock values for portfolio calculation');
      const mockValuePerAsset = 1; // Assuming each asset is worth 1 OCT for demo
      totalInvestmentOCT = assets.length * mockValuePerAsset;
      currentValueOCT = totalInvestmentOCT;
    }

    const totalReturn = currentValueOCT - totalInvestmentOCT;
    const returnPercentage = totalInvestmentOCT > 0 ? (totalReturn / totalInvestmentOCT) * 100 : 0;

    const portfolioData = {
      totalInvestment: totalInvestmentOCT,
      currentValue: currentValueOCT,
      totalReturn: totalReturn,
      returnPercentage: returnPercentage,
      monthlyIncome: (currentValueOCT * 0.10) / 12, // Mock 10% annual yield
      totalAssets: assets.length,
      activeInvestments: assets.length,
    };

    console.log('✅ Final portfolio data:', portfolioData);
    setPortfolioData(portfolioData);
  };

  const openSellModal = (asset: UserAsset) => {
    setSelectedAsset(asset);
    setSellModalOpen(true);
  };

  const renderContent = () => {
    // Content rendering logic remains largely the same, but uses Sui data
    switch (activeSection) {
      case 'analytics':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics Overview</h1>
            
            {/* Portfolio Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Wallet className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Investment</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {balanceVisible ? `${formatOCTAmount(portfolioData.totalInvestment)} (${formatPriceInUSD(portfolioData.totalInvestment, 0.1)})` : '••••'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Current Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {balanceVisible ? `${formatOCTAmount(portfolioData.currentValue)} (${formatPriceInUSD(portfolioData.currentValue, 0.1)})` : '••••'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Return</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {balanceVisible ? (
                          <span className={portfolioData.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {portfolioData.returnPercentage >= 0 ? '+' : ''}{portfolioData.returnPercentage.toFixed(2)}%
                          </span>
                        ) : '••••'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {balanceVisible ? `${formatOCTAmount(portfolioData.monthlyIncome)} (${formatPriceInUSD(portfolioData.monthlyIncome, 0.1)})` : '••••'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Assets Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Distribution</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Assets Owned</span>
                      <span className="font-semibold">{portfolioData.totalAssets}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Investments</span>
                      <span className="font-semibold">{portfolioData.activeInvestments}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">NFT Assets</span>
                      <span className="font-semibold">{userAssets.filter(a => a.type === 'NFT').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">FT Assets</span>
                      <span className="font-semibold">{userAssets.filter(a => a.type === 'FT').length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Best Performing Asset</span>
                      <span className="font-semibold text-green-600">Manhattan Luxury Apartment</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average ROI</span>
                      <span className="font-semibold text-green-600">+12.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Dividends Earned</span>
                      <span className="font-semibold">{formatPriceInUSD(portfolioData.monthlyIncome * 12, 0.1)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'portfolio':
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Owned Assets</h1>
              {account && (
                <Button onClick={refreshAssets} variant="outline">
                  <Activity className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              )}
            </div>
            {!account ? (
              <Card className="text-center p-8">
                <Wallet className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Connect Your Wallet</h3>
                <p className="mt-1 text-sm text-gray-500">Connect your Sui wallet to view your assets.</p>
                <div className="mt-4">
                  <ConnectButton />
                </div>
              </Card>
            ) : loading ? (
              <p>Loading your assets...</p>
            ) : userAssets.length === 0 ? (
              <Card className="text-center p-8">
                <h3 className="text-lg font-medium">No Assets Found</h3>
                <p className="mt-1 text-sm text-gray-500">You do not own any assets yet.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {userAssets.map((asset) => (
                  <Card key={asset.tokenId}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <img src={asset.image} alt={asset.name} className="w-24 h-24 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h3 className="font-bold">{asset.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{asset.description}</p>
                          <Badge variant="outline" className="mt-2">{asset.type}</Badge>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button onClick={() => openSellModal(asset)}>
                          <DollarSign className="w-4 h-4 mr-2" />
                          List for Sale
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      case 'income':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">My Income</h1>
            
            {/* Income Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {balanceVisible ? `${formatOCTPrice(portfolioData.monthlyIncome)} (${formatPriceInUSD(portfolioData.monthlyIncome, 0.1)})` : '••••'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Annual Yield</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {balanceVisible ? `${formatPriceInUSD(portfolioData.monthlyIncome * 12, 0.1)}` : '••••'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Yield Rate</p>
                      <p className="text-2xl font-bold text-green-600">10.0%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Income History */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Income History</h3>
                <div className="space-y-4">
                  {MOCK_INCOME_HISTORY.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No income history available yet.</p>
                  ) : (
                    MOCK_INCOME_HISTORY.map((income, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{income.asset}</p>
                            <p className="text-sm text-gray-600">{income.date} • {income.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">+{formatPriceInUSD(income.amount, 0.1)}</p>
                          <p className="text-sm text-gray-600">≈ {formatOCTPrice(income.amount * 10)} OCT</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Income Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Earning Assets</h3>
                  <div className="space-y-3">
                    {userAssets.slice(0, 3).map((asset, index) => (
                      <div key={asset.tokenId} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <img src={asset.image} alt={asset.name} className="w-8 h-8 object-cover rounded" />
                          <span className="font-medium">{asset.name}</span>
                        </div>
                        <span className="font-bold text-green-600">$1,850</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Projection</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next Month</span>
                      <span className="font-semibold">{formatPriceInUSD(portfolioData.monthlyIncome, 0.1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next Quarter</span>
                      <span className="font-semibold">{formatPriceInUSD(portfolioData.monthlyIncome * 3, 0.1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next Year</span>
                      <span className="font-semibold">{formatPriceInUSD(portfolioData.monthlyIncome * 12, 0.1)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'transactions':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Transaction History</h1>
            
            {/* Transaction Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Activity className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                      <p className="text-2xl font-bold text-gray-900">{MOCK_TRANSACTIONS.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Volume</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatPriceInUSD(MOCK_TRANSACTIONS.reduce((sum, tx) => sum + tx.amount, 0), 0.1)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold text-green-600">100%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transaction List */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                <div className="space-y-4">
                  {MOCK_TRANSACTIONS.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No transactions found.</p>
                  ) : (
                    MOCK_TRANSACTIONS.map((tx, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${
                            tx.type === 'buy' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {tx.type === 'buy' ? (
                              <TrendingUp className={`h-5 w-5 ${
                                tx.type === 'buy' ? 'text-green-600' : 'text-red-600'
                              }`} />
                            ) : (
                              <TrendingDown className={`h-5 w-5 ${
                                tx.type === 'buy' ? 'text-green-600' : 'text-red-600'
                              }`} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{tx.asset}</p>
                            <p className="text-sm text-gray-600">{tx.date} • {tx.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            tx.type === 'buy' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {tx.type === 'buy' ? '+' : '-'}{formatPriceInUSD(tx.amount, 0.1)}
                          </p>
                          <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'profile':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile Settings</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Wallet Information */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Wallet Address</label>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-1">
                        {account?.address || 'Not connected'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Network</label>
                      <p className="text-sm text-gray-900 mt-1">OneChain Testnet</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Connection Status</label>
                      <p className={`text-sm mt-1 ${account ? 'text-green-600' : 'text-red-600'}`}>
                        {account ? 'Connected' : 'Disconnected'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Overview */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member Since</span>
                      <span className="font-medium">March 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assets Owned</span>
                      <span className="font-medium">{portfolioData.totalAssets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Invested</span>
                      <span className="font-medium">{formatPriceInUSD(portfolioData.totalInvestment, 0.1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Risk Level</span>
                      <Badge variant="outline">Moderate</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Show Balance</span>
                      <button 
                        onClick={() => setBalanceVisible(!balanceVisible)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          balanceVisible ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                          balanceVisible ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Email Notifications</span>
                      <button className="w-12 h-6 rounded-full bg-blue-600">
                        <div className="w-5 h-5 bg-white rounded-full shadow-md transform translate-x-6" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Push Notifications</span>
                      <button className="w-12 h-6 rounded-full bg-gray-300">
                        <div className="w-5 h-5 bg-white rounded-full shadow-md transform translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Change Profile Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="w-4 h-4 mr-2" />
                      View Transaction History
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Disconnect Wallet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      // Other cases for income, transactions, etc. would be built here
      default:
        return <div><h1 className="text-3xl font-bold">{activeSection}</h1><p>Content coming soon...</p></div>;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <motion.div
        className="fixed left-0 top-0 h-full shadow-lg z-50 bg-white"
        initial={false}
        animate={{ width: sidebarCollapsed ? 64 : 256 }}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-900">
              <Home className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <p className="font-bold text-gray-900">AssetDash</p>
                <p className="text-xs text-gray-600">Portfolio Manager</p>
              </div>
            )}
          </div>
        </div>
        <nav className="p-4">
          <div className="space-y-2">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Welcome back,</p>
              <p className="font-semibold text-gray-900">
                {account ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : 'Investor'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <ConnectButton />
            </div>
          </div>
        </header>
        <main className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Sell Asset Modal */}
      <AnimatePresence>
        {sellModalOpen && selectedAsset && (
          <Dialog open={sellModalOpen} onOpenChange={setSellModalOpen}>
            <SellModal 
              asset={selectedAsset} 
              onClose={() => setSellModalOpen(false)} 
              onSuccess={() => {
                setSellModalOpen(false);
                // Refresh assets to show updated list
                refreshAssets();
              }}
            />
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
