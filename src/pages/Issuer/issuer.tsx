import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LabelInputContainer } from '@/components/ui/form-utils';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Copy, Home, TrendingUp, Building2, Plus, FileText, BarChart3, Shield, Users, Globe, Sun, Moon, Loader2, Wallet, RefreshCw, ExternalLink } from 'lucide-react';
import { uploadImageToIPFS, uploadJSONToIPFS } from '@/utils/ipfs';
import { useSuiWallet, ConnectButton } from '@/context/SuiWalletContext';
import { OneChainService } from '@/services/oneChainService';

const assetTypes = [
  'Real Estate',
  'Invoice',
  'Commodity',
  'Stocks',
  'CarbonCredit',
];

const priceTokens = [
  'OCT',
  'USD',
  'EUR',
  'GBP',
  'JPY',
];

const Issuer: React.FC = () => {
  // OneChain/Sui wallet integration
  const { account, isConnected, suiClient, signAndExecuteTransaction, connectWallet, wallets } = useSuiWallet();
  const oneChainService = new OneChainService(suiClient);
  const address = account?.address;
  
  // Authorization state
  const [isAuthorizedIssuer, setIsAuthorizedIssuer] = useState<boolean | null>(null);
  const [authCheckLoading, setAuthCheckLoading] = useState(false);
  
  // Contract data state
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
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Main navigation state
  const [currentView, setCurrentView] = useState<'dashboard' | 'mint' | 'list'>('dashboard');

  // Dialog states
  const [showNFTDialog, setShowNFTDialog] = useState(false);

  // NFT form state
  const [mintStep, setMintStep] = useState(1);
  const [tokenType, setTokenType] = useState<'ERC20' | 'NFT'>('ERC20');
  const [nftTitle, setNftTitle] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [nftAssetType, setNftAssetType] = useState(0);
  const [nftPriceToken, setNftPriceToken] = useState('OCT');
  const [nftPricePerToken, setNftPricePerToken] = useState('1.0'); // Price per token in OCT (used for both reference and marketplace)
  const [nftEarnXP, setNftEarnXP] = useState('32000');
  const [nftImageFiles, setNftImageFiles] = useState<File[]>([]);
  const [nftId, setNftId] = useState('');
  const [nftAmount, setNftAmount] = useState('');
  const [isMinting, setIsMinting] = useState(false);

  // Real Estate specific fields
  const [realEstateSize, setRealEstateSize] = useState('');
  const [realEstateBedrooms, setRealEstateBedrooms] = useState('');
  const [realEstateLocation, setRealEstateLocation] = useState('');

  // Invoice specific fields
  const [invoiceIssuer, setInvoiceIssuer] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState('');
  const [invoiceRiskRating, setInvoiceRiskRating] = useState('');

  // Commodity specific fields
  const [commodityWeight, setCommodityWeight] = useState('');
  const [commodityPurity, setCommodityPurity] = useState('');
  const [commodityStorage, setCommodityStorage] = useState('');

  // Stocks specific fields
  const [stockSymbol, setStockSymbol] = useState('');
  const [stockExchange, setStockExchange] = useState('');
  const [stockSector, setStockSector] = useState('');

  // Carbon Credits specific fields
  const [carbonStandard, setCarbonStandard] = useState('');
  const [carbonProjectType, setCarbonProjectType] = useState('');
  const [carbonCO2Offset, setCarbonCO2Offset] = useState('');

  // Success states
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [mintedAssetId, setMintedAssetId] = useState<string | null>(null);
  const [createdTokens, setCreatedTokens] = useState<Array<{
    tokenId: string;
    name: string;
    amount: number;
    price: number;
    createdAt: Date;
  }>>([]);

  // Check issuer authorization on wallet connection
  useEffect(() => {
    const checkAuthorization = async () => {
      if (!isConnected || !address) {
        setIsAuthorizedIssuer(null);
        console.log('⏳ Authorization check skipped:', { isConnected, address: !!address });
        return;
      }

      setAuthCheckLoading(true);
      console.log('🔍 Starting authorization check for:', address);
      
      try {
        // Fetch latest issuer data and check authorization
        await fetchContractData();
        
      } catch (error) {
        console.error('❌ Error checking authorization:', error);
        setIsAuthorizedIssuer(false);
      } finally {
        setAuthCheckLoading(false);
      }
    };

    checkAuthorization();
  }, [isConnected, address]);

  // Function to fetch all contract data
  const fetchContractData = async () => {
    setIsLoadingContractData(true);
    
    try {
      console.log('🔄 Fetching contract data from OneChain...');
      
      // Use OneChain service to check authorization and get user assets
      const isAuthorized = await oneChainService.isAuthorizedIssuer(address);
      const userAssets = await oneChainService.getUserAssets(address);
      
      setIsAuthorizedIssuer(isAuthorized);
      setContractIssuers({ 
        addresses: [address], 
        count: userAssets.length, 
        metadata: {} 
      });
      setContractManagers({ 
        addresses: [], 
        count: 0, 
        metadata: {} 
      });

      if (isAuthorized) {
        console.log('✅ Connected wallet is authorized as issuer');
      } else {
        console.log('❌ Connected wallet is not authorized as issuer');
      }

      console.log('🎯 OneChain contract data fetched successfully');
      
    } catch (error: any) {
      console.error('❌ Error fetching contract data:', error);
      setIsAuthorizedIssuer(false);
    } finally {
      setIsLoadingContractData(false);
    }
  };

  const handleNftImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setNftImageFiles(prev => [...prev, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setNftImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleMintNFT = async () => {
    // Check wallet connection and authorization
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (isAuthorizedIssuer === false) {
      toast.error('Your wallet is not authorized as an issuer');
      return;
    }

    if (isAuthorizedIssuer === null) {
      toast.error('Authorization check in progress, please wait');
      return;
    }

    // Validate form
    if (!nftTitle || !nftDescription || !nftAmount || !nftPricePerToken) {
      toast.error('Please fill all required fields');
      return;
    }

    // For NFTs, images are required. For ERC20 tokens, they're optional
    if (tokenType === 'NFT' && nftImageFiles.length === 0) {
      toast.error('Please upload at least one image for NFT tokens');
      return;
    }

    setIsMinting(true);
    
    try {
      // Step 1: Upload images to IPFS
      toast('Uploading images to IPFS...');
      const imageUrls = [];
      if (nftImageFiles.length > 0) {
        for (const file of nftImageFiles) {
          console.log('Uploading image file to IPFS:', file.name);
          const imageUrl = await uploadImageToIPFS(file);
          console.log('Image uploaded successfully:', imageUrl);
          imageUrls.push(imageUrl);
        }
      }
      console.log('All images uploaded to IPFS:', imageUrls);

      // Step 2: Create comprehensive metadata object with all form data
      toast('Creating comprehensive metadata...');
      const comprehensiveMetadata: any = {
        name: nftTitle,
        description: nftDescription,
        image: imageUrls.length > 0 ? imageUrls[0] : '', // First image for compatibility
        images: imageUrls, // All images array
        assetType: assetTypes[nftAssetType],
        baseCurrency: nftPriceToken,
        pricePerTokenOCT: parseFloat(nftPricePerToken),
        tokenRewards: parseInt(nftEarnXP),
        totalSupply: parseInt(nftAmount),
        attributes: [
          {
            trait_type: "Asset Type",
            value: assetTypes[nftAssetType]
          },
          {
            trait_type: "Base Currency",
            value: nftPriceToken
          },
          {
            trait_type: "Price per Token (OCT)",
            value: parseFloat(nftPricePerToken)
          },
          {
            trait_type: "Token Rewards",
            value: parseInt(nftEarnXP)
          },
          {
            trait_type: "Total Supply",
            value: parseInt(nftAmount)
          }
        ],
        external_url: "",
        animation_url: ""
      };

      // Add asset-specific attributes and data based on type
      if (nftAssetType === 0) { // Real Estate
        if (realEstateSize) {
          comprehensiveMetadata.attributes.push({ trait_type: "Size", value: `${realEstateSize} sq ft` });
          comprehensiveMetadata.realEstate = {
            size: realEstateSize,
            bedrooms: realEstateBedrooms,
            location: realEstateLocation
          };
        }
        if (realEstateBedrooms) comprehensiveMetadata.attributes.push({ trait_type: "Bedrooms", value: realEstateBedrooms });
        if (realEstateLocation) comprehensiveMetadata.attributes.push({ trait_type: "Location", value: realEstateLocation });
      } else if (nftAssetType === 1) { // Invoice
        if (invoiceIssuer) {
          comprehensiveMetadata.attributes.push({ trait_type: "Issuer", value: invoiceIssuer });
          comprehensiveMetadata.invoice = {
            issuer: invoiceIssuer,
            dueDate: invoiceDueDate,
            riskRating: invoiceRiskRating
          };
        }
        if (invoiceDueDate) comprehensiveMetadata.attributes.push({ trait_type: "Due Date", value: invoiceDueDate });
        if (invoiceRiskRating) comprehensiveMetadata.attributes.push({ trait_type: "Risk Rating", value: invoiceRiskRating });
      } else if (nftAssetType === 2) { // Commodity
        if (commodityWeight) {
          comprehensiveMetadata.attributes.push({ trait_type: "Weight", value: commodityWeight });
          comprehensiveMetadata.commodity = {
            weight: commodityWeight,
            purity: commodityPurity,
            storage: commodityStorage
          };
        }
        if (commodityPurity) comprehensiveMetadata.attributes.push({ trait_type: "Purity", value: commodityPurity });
        if (commodityStorage) comprehensiveMetadata.attributes.push({ trait_type: "Storage", value: commodityStorage });
      } else if (nftAssetType === 3) { // Stocks
        if (stockSymbol) {
          comprehensiveMetadata.attributes.push({ trait_type: "Symbol", value: stockSymbol });
          comprehensiveMetadata.stocks = {
            symbol: stockSymbol,
            exchange: stockExchange,
            sector: stockSector
          };
        }
        if (stockExchange) comprehensiveMetadata.attributes.push({ trait_type: "Exchange", value: stockExchange });
        if (stockSector) comprehensiveMetadata.attributes.push({ trait_type: "Sector", value: stockSector });
      } else if (nftAssetType === 4) { // Carbon Credits
        if (carbonStandard) {
          comprehensiveMetadata.attributes.push({ trait_type: "Standard", value: carbonStandard });
          comprehensiveMetadata.carbonCredits = {
            standard: carbonStandard,
            projectType: carbonProjectType,
            co2Offset: carbonCO2Offset
          };
        }
        if (carbonProjectType) comprehensiveMetadata.attributes.push({ trait_type: "Project Type", value: carbonProjectType });
        if (carbonCO2Offset) comprehensiveMetadata.attributes.push({ trait_type: "CO2 Offset", value: `${carbonCO2Offset} tons` });
      }

      // Step 3: Upload comprehensive metadata to IPFS
      toast('Uploading metadata to IPFS...');
      const metadataUri = await uploadJSONToIPFS(comprehensiveMetadata);
      console.log('✅ Metadata uploaded to IPFS:', metadataUri);

      // Step 4: Create and Auto-List token on OneChain using sequential transactions
      toast('� Creating token and auto-listing on marketplace...');
      toast(`Processing ${tokenType} token on OneChain...`);
      
      const tokenData = {
        name: nftTitle,
        description: nftDescription,
        metadataURI: metadataUri,
        amount: parseInt(nftAmount),
        price: parseFloat(nftPricePerToken),
        assetType: assetTypes[nftAssetType]
      };
      
      // Convert price to OCT base units (MIST): 1 OCT = 10^9 MIST
      const marketplacePriceInMIST = Math.floor(parseFloat(nftPricePerToken) * 1000000000); // 10^9
      
      let result;
      
      if (tokenType === 'ERC20') {
        // Create and Auto-List Fungible Token (FT) using sequential transactions
        console.log('� Starting: Create + List FT (Sequential)');
        result = await oneChainService.createAndListFT(tokenData, marketplacePriceInMIST, address, signAndExecuteTransaction);
      } else {
        // Create and Auto-List Non-Fungible Token (NFT) using sequential transactions
        console.log('� Starting: Create + List NFT (Sequential)');
        result = await oneChainService.createAndListNFT(tokenData, marketplacePriceInMIST, address, signAndExecuteTransaction);
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create and list token on OneChain');
      }

      // Step 5: Success - Token created and listed automatically
      console.log('🎯 Success: Token created and auto-listed in marketplace');
      
      // Step 6: Save token to local storage for user reference
      const newToken = {
        tokenId: result.objectId || 'unknown',
        name: nftTitle,
        amount: parseInt(nftAmount),
        price: parseFloat(nftPricePerToken),
        createdAt: new Date()
      };
      
      setCreatedTokens(prev => [...prev, newToken]);
      localStorage.setItem('userTokens', JSON.stringify([...createdTokens, newToken]));

      // Step 7: Show success
      setMintedAssetId(result.objectId || 'unknown');
      setShowSuccessDialog(true);
      setShowNFTDialog(false);
      resetNFTForm();
      
      toast.success(`${tokenType} Token created and listed successfully!`);
      toast.success(`Object ID: ${result.objectId}`);
      toast.success(`Listed on marketplace at ${nftPricePerToken} OCT per token`);
      toast.success(`View on OneChain Explorer: https://explorer.onechain.ai/testnet/object/${result.objectId}`);

    } catch (error: any) {
      console.error('Token creation error:', error);
      if (error.message.includes('User denied')) {
        toast.error('Transaction was cancelled by user');
      } else if (error.message.includes('Signature expired')) {
        toast.error('Signature expired. Please try again.');
      } else if (error.message.includes('Invalid signature')) {
        toast.error('Invalid signature. Please try again.');
      } else {
        toast.error(`Failed to create token: ${error.message}`);
      }
    } finally {
      setIsMinting(false);
    }
  };

  const resetNFTForm = () => {
    setMintStep(1);
    setTokenType('ERC20');
    setNftTitle('');
    setNftDescription('');
    setNftImageFiles([]);
    setNftAssetType(0);
    setNftPriceToken('OCT');
    setNftPricePerToken('1.0');
    setNftEarnXP('32000');
    setNftAmount('');
    
    // Reset asset-specific fields
    setRealEstateSize('');
    setRealEstateBedrooms('');
    setRealEstateLocation('');
    setInvoiceIssuer('');
    setInvoiceDueDate('');
    setInvoiceRiskRating('');
    setCommodityWeight('');
    setCommodityPurity('');
    setCommodityStorage('');
    setStockSymbol('');
    setStockExchange('');
    setStockSector('');
    setCarbonStandard('');
    setCarbonProjectType('');
    setCarbonCO2Offset('');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Professional Header */}
      <header className={`${isDarkMode ? 'bg-gray-900/50 backdrop-blur-xl border-gray-800' : 'bg-white/80 backdrop-blur-xl border-gray-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Dashboard Title and Status */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Issuer Dashboard</h1>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Manage your tokenized assets and marketplace listings</p>
              </div>
            </div>
            
            {/* Navigation and Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                  isConnected 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-red-500/10 border-red-500/20'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className={`text-sm font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                    {isConnected ? 'Wallet Connected' : 'Wallet Disconnected'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">
                    {isAuthorizedIssuer === true ? 'Authorized Issuer' : 
                     isAuthorizedIssuer === false ? 'Not Authorized' : 'Checking...'}
                  </span>
                </div>
              </div>
              
              {/* Dark Mode Toggle */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              {/* Connect Wallet Button */}
              {!isConnected && (
                <ConnectButton />
              )}
              
              <Button asChild variant="ghost" className={`${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                <Link to="/" className="flex items-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" className={`${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                <Link to="/marketplace" className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Marketplace</span>
                </Link>
              </Button>
              <div className={`w-8 h-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
                <Users className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`${isDarkMode ? 'bg-gray-900/50 backdrop-blur-xl border-gray-800' : 'bg-white border-gray-200'} rounded-lg border p-6 shadow-sm`}>
            <div className="flex items-center">
              <div className={`p-2 ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'} rounded-lg`}>
                <Building2 className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Assets Created</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>0</p>
              </div>
            </div>
          </div>
          
          <div className={`${isDarkMode ? 'bg-gray-900/50 backdrop-blur-xl border-gray-800' : 'bg-white border-gray-200'} rounded-lg border p-6 shadow-sm`}>
            <div className="flex items-center">
              <div className={`p-2 ${isDarkMode ? 'bg-green-500/20' : 'bg-green-50'} rounded-lg`}>
                <TrendingUp className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Assets Listed</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>0</p>
              </div>
            </div>
          </div>
          
          <div className={`${isDarkMode ? 'bg-gray-900/50 backdrop-blur-xl border-gray-800' : 'bg-white border-gray-200'} rounded-lg border p-6 shadow-sm`}>
            <div className="flex items-center">
              <div className={`p-2 ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-50'} rounded-lg`}>
                <BarChart3 className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Volume</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$0</p>
              </div>
            </div>
          </div>
          
          <div className={`${isDarkMode ? 'bg-gray-900/50 backdrop-blur-xl border-gray-800' : 'bg-white border-gray-200'} rounded-lg border p-6 shadow-sm`}>
            <div className="flex items-center">
              <div className={`p-2 ${isDarkMode ? 'bg-orange-500/20' : 'bg-orange-50'} rounded-lg`}>
                <Shield className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Compliance Status</p>
                <p className="text-lg font-bold text-green-400">Verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-8">
          {/* Asset Creation */}
          <div className={`${isDarkMode ? 'bg-gray-900/50 backdrop-blur-xl border-gray-800' : 'bg-white border-gray-200'} rounded-xl border shadow-xl`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'} rounded-lg`}>
                  <Plus className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tokenize & Auto-List Asset</h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Convert assets into tokens and automatically list on marketplace</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Asset Types Supported:</span>
                    <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>IPFS Storage:</span>
                    <span className="text-green-400 font-medium">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Token Standard:</span>
                    <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>HTS NFT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Auto-Listing:</span>
                    <span className="text-green-400 font-medium">Enabled</span>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowNFTDialog(true)}
                  disabled={!isConnected || isAuthorizedIssuer === false}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {!isConnected ? 'Connect Wallet First' : 
                   isAuthorizedIssuer === false ? 'Not Authorized' :
                   'Start Tokenization'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className={`${isDarkMode ? 'bg-gray-900/50 backdrop-blur-xl border-gray-800' : 'bg-white border-gray-200'} rounded-xl border shadow-xl mb-8`}>
          <div className="p-6">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className={`h-20 flex-col space-y-2 ${isDarkMode ? 'border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                onClick={() => {/* Handle view portfolio */}}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm font-medium">Portfolio</span>
              </Button>
              
              <Button 
                variant="outline" 
                className={`h-20 flex-col space-y-2 ${isDarkMode ? 'border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                onClick={() => {/* Handle transaction history */}}
              >
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">Transactions</span>
              </Button>
              
              <Button 
                variant="outline" 
                className={`h-20 flex-col space-y-2 ${isDarkMode ? 'border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                onClick={() => {/* Handle wallet settings */}}
              >
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Wallet</span>
              </Button>
              
              <Button 
                variant="outline" 
                className={`h-20 flex-col space-y-2 ${isDarkMode ? 'border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                onClick={() => {/* Handle support */}}
              >
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Support</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="mt-8">
          <div className={`${isDarkMode ? 'bg-gray-900/50 backdrop-blur-xl border-gray-800' : 'bg-white border-gray-200'} rounded-xl border shadow-xl`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Your Asset Portfolio</h3>
                <Button variant="outline" size="sm" className={`${isDarkMode ? 'text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-white' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </div>
            <div className="p-6">
              {createdTokens.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className={`w-12 h-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-300'} mx-auto mb-4`} />
                  <h4 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No Assets Yet</h4>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>Start by tokenizing your first real-world asset</p>
                  <Button 
                    onClick={() => setShowNFTDialog(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tokenize Asset
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Your Created Tokens</h4>
                  {createdTokens.map((token, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{token.name}</h5>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                            Token Address: <span className="font-mono text-xs">{token.tokenId}</span>
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Supply: {token.amount}
                            </span>
                            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Price: {token.price} OCT
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(token.tokenId)}
                            className={`${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`https://onescan.cc/testnet/account?address=${token.tokenId}`, '_blank')}
                            className={`${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button 
                    onClick={() => setShowNFTDialog(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Another Asset
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* NFT Mint Dialog */}
      <Dialog open={showNFTDialog} onOpenChange={(open) => {
          if (!open) {
            resetNFTForm();
          }
          setShowNFTDialog(open);
        }}>
          <DialogContent className={`sm:max-w-lg rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} shadow-xl p-6 md:p-8 max-h-[90vh] overflow-hidden`}>
            <DialogHeader>
              <DialogTitle className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Create Asset Token</DialogTitle>
              <DialogDescription className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                {mintStep === 1
                  ? "Enter the details for your real-world asset tokenization."
                  : "Configure the token parameters for deployment."}
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto scrollbar-hide my-6 pr-2" style={{ maxHeight: 'calc(80vh - 200px)' }}>
              {mintStep === 1 ? (
                <form className="space-y-5">
                  <LabelInputContainer>
                    <Label htmlFor="nftTitle" className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Asset Title</Label>
                    <Input id="nftTitle" value={nftTitle} onChange={e => setNftTitle(e.target.value)} placeholder="e.g., Manhattan Commercial Property" type="text" className={`${isDarkMode ? 'border-gray-600 bg-gray-800 text-white placeholder:text-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-500'}`} />
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="nftDescription" className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Description</Label>
                    <Input id="nftDescription" value={nftDescription} onChange={e => setNftDescription(e.target.value)} placeholder="Detailed asset description" type="text" className={`${isDarkMode ? 'border-gray-600 bg-gray-800 text-white placeholder:text-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-500'}`} />
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="nftImage" className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Asset Documentation</Label>
                    <div className="flex flex-col gap-2">
                      <Input
                        id="nftImage"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleNftImageUpload}
                        className={`${isDarkMode ? 'border-gray-600 bg-gray-800 text-white file:bg-blue-600 file:text-white hover:file:bg-blue-700' : 'border-gray-300 bg-white text-gray-900 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold`}
                      />
                      {nftImageFiles.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {nftImageFiles.map((file, index) => (
                            <div key={index} className="relative w-full h-24">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className={`rounded-lg object-cover w-full h-full border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 bg-red-500 hover:bg-red-600 text-white border-0"
                                onClick={() => removeImage(index)}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="nftAssetType" className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Asset Category</Label>
                    <select id="nftAssetType" value={nftAssetType} onChange={e => setNftAssetType(Number(e.target.value))} className={`border rounded-md px-3 py-2 ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'}`}>
                      {assetTypes.map((type, idx) => (
                        <option key={type} value={idx}>{type}</option>
                      ))}
                    </select>
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="nftPriceToken" className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Base Currency</Label>
                    <select id="nftPriceToken" value={nftPriceToken} onChange={e => setNftPriceToken(e.target.value)} className={`border rounded-md px-3 py-2 ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'}`}>
                      {priceTokens.map((token) => (
                        <option key={token} value={token}>{token}</option>
                      ))}
                    </select>
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="nftPricePerToken" className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Price per Token (OCT)</Label>
                    <Input 
                      id="nftPricePerToken" 
                      value={nftPricePerToken} 
                      onChange={e => setNftPricePerToken(e.target.value)} 
                      placeholder="1.0" 
                      type="number" 
                      step="0.001"
                      min="0"
                      className={`${isDarkMode ? 'border-gray-600 bg-gray-800 text-white placeholder:text-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-500'}`} 
                    />
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Price per token in OCT (will be used for marketplace listing)
                    </p>
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="nftEarnXP">Token Rewards</Label>
                    <Input id="nftEarnXP" value={nftEarnXP} onChange={e => setNftEarnXP(e.target.value)} placeholder="32000" type="number" className="border-gray-300" />
                  </LabelInputContainer>

                  {/* Conditional fields based on asset type */}
                  {nftAssetType === 0 && ( // Real Estate
                    <>
                      <LabelInputContainer>
                        <Label htmlFor="realEstateSize">Property Size (sq ft)</Label>
                        <Input id="realEstateSize" value={realEstateSize} onChange={e => setRealEstateSize(e.target.value)} placeholder="Enter size in square feet" type="number" className="border-gray-300" />
                      </LabelInputContainer>
                      <LabelInputContainer>
                        <Label htmlFor="realEstateBedrooms">Bedrooms</Label>
                        <Input id="realEstateBedrooms" value={realEstateBedrooms} onChange={e => setRealEstateBedrooms(e.target.value)} placeholder="Number of bedrooms" type="number" className="border-gray-300" />
                      </LabelInputContainer>
                      <LabelInputContainer>
                        <Label htmlFor="realEstateLocation">Location</Label>
                        <Input id="realEstateLocation" value={realEstateLocation} onChange={e => setRealEstateLocation(e.target.value)} placeholder="Property address/location" type="text" className="border-gray-300" />
                      </LabelInputContainer>
                    </>
                  )}

                  {nftAssetType === 1 && ( // Invoice
                    <>
                      <LabelInputContainer>
                        <Label htmlFor="invoiceIssuer">Invoice Issuer</Label>
                        <Input id="invoiceIssuer" value={invoiceIssuer} onChange={e => setInvoiceIssuer(e.target.value)} placeholder="Company name" type="text" className="border-gray-300" />
                      </LabelInputContainer>
                      <LabelInputContainer>
                        <Label htmlFor="invoiceDueDate">Due Date</Label>
                        <Input id="invoiceDueDate" value={invoiceDueDate} onChange={e => setInvoiceDueDate(e.target.value)} placeholder="YYYY-MM-DD" type="date" className="border-gray-300" />
                      </LabelInputContainer>
                      <LabelInputContainer>
                        <Label htmlFor="invoiceRiskRating">Credit Rating</Label>
                        <select id="invoiceRiskRating" value={invoiceRiskRating} onChange={e => setInvoiceRiskRating(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2">
                          <option value="">Select credit rating</option>
                          <option value="AAA">AAA - Highest Quality</option>
                          <option value="AA">AA - High Quality</option>
                          <option value="A">A - Upper Medium Grade</option>
                          <option value="BBB">BBB - Medium Grade</option>
                          <option value="BB">BB - Lower Medium Grade</option>
                          <option value="B">B - Speculative</option>
                          <option value="CCC">CCC - Highly Speculative</option>
                          <option value="CC">CC - Extremely Speculative</option>
                          <option value="C">C - Default Imminent</option>
                          <option value="D">D - In Default</option>
                        </select>
                      </LabelInputContainer>
                    </>
                  )}

                  {nftAssetType === 2 && ( // Commodity
                    <>
                      <LabelInputContainer>
                        <Label htmlFor="commodityWeight">Weight/Quantity</Label>
                        <Input id="commodityWeight" value={commodityWeight} onChange={e => setCommodityWeight(e.target.value)} placeholder="Weight (kg, tons, etc.)" type="text" className="border-gray-300" />
                      </LabelInputContainer>
                      <LabelInputContainer>
                        <Label htmlFor="commodityPurity">Grade/Purity</Label>
                        <Input id="commodityPurity" value={commodityPurity} onChange={e => setCommodityPurity(e.target.value)} placeholder="Purity percentage or grade" type="text" className="border-gray-300" />
                      </LabelInputContainer>
                      <LabelInputContainer>
                        <Label htmlFor="commodityStorage">Storage Facility</Label>
                        <Input id="commodityStorage" value={commodityStorage} onChange={e => setCommodityStorage(e.target.value)} placeholder="Storage location/facility" type="text" className="border-gray-300" />
                      </LabelInputContainer>
                    </>
                  )}

                  {nftAssetType === 3 && ( // Stocks
                    <>
                      <LabelInputContainer>
                        <Label htmlFor="stockSymbol">Ticker Symbol</Label>
                        <Input id="stockSymbol" value={stockSymbol} onChange={e => setStockSymbol(e.target.value)} placeholder="Stock ticker symbol" type="text" className="border-gray-300" />
                      </LabelInputContainer>
                      <LabelInputContainer>
                        <Label htmlFor="stockExchange">Exchange</Label>
                        <Input id="stockExchange" value={stockExchange} onChange={e => setStockExchange(e.target.value)} placeholder="NYSE, NASDAQ, etc." type="text" className="border-gray-300" />
                      </LabelInputContainer>
                      <LabelInputContainer>
                        <Label htmlFor="stockSector">Industry Sector</Label>
                        <Input id="stockSector" value={stockSector} onChange={e => setStockSector(e.target.value)} placeholder="Technology, Healthcare, etc." type="text" className="border-gray-300" />
                      </LabelInputContainer>
                    </>
                  )}

                  {nftAssetType === 4 && ( // Carbon Credits
                    <>
                      <LabelInputContainer>
                        <Label htmlFor="carbonStandard">Certification Standard</Label>
                        <select id="carbonStandard" value={carbonStandard} onChange={e => setCarbonStandard(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2">
                          <option value="">Select standard</option>
                          <option value="VCS">VCS (Verified Carbon Standard)</option>
                          <option value="Gold Standard">Gold Standard</option>
                          <option value="CDM">CDM (Clean Development Mechanism)</option>
                          <option value="CAR">CAR (Climate Action Reserve)</option>
                          <option value="ACR">ACR (American Carbon Registry)</option>
                        </select>
                      </LabelInputContainer>
                      <LabelInputContainer>
                        <Label htmlFor="carbonProjectType">Project Category</Label>
                        <select id="carbonProjectType" value={carbonProjectType} onChange={e => setCarbonProjectType(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2">
                          <option value="">Select project type</option>
                          <option value="Renewable Energy">Renewable Energy</option>
                          <option value="Forestry">Forestry & Land Use</option>
                          <option value="Energy Efficiency">Energy Efficiency</option>
                          <option value="Methane Capture">Methane Capture</option>
                          <option value="Direct Air Capture">Direct Air Capture</option>
                        </select>
                      </LabelInputContainer>
                      <LabelInputContainer>
                        <Label htmlFor="carbonCO2Offset">CO2 Offset Capacity (tons)</Label>
                        <Input id="carbonCO2Offset" value={carbonCO2Offset} onChange={e => setCarbonCO2Offset(e.target.value)} placeholder="Amount of CO2 offset in tons" type="number" className="border-gray-300" />
                      </LabelInputContainer>
                    </>
                  )}
                </form>
              ) : (
                <form className="space-y-5">
                  <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
                    <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Token Configuration</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Configure the token supply and parameters. Token ID will be automatically generated by OneChain.
                    </p>
                  </div>
                  
                  <LabelInputContainer>
                    <Label htmlFor="nftAmount" className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Token Supply</Label>
                    <Input 
                      id="nftAmount" 
                      value={nftAmount} 
                      onChange={e => setNftAmount(e.target.value)} 
                      placeholder="Enter total number of tokens to mint" 
                      type="number" 
                      min="1"
                      className={`${isDarkMode ? 'border-gray-600 bg-gray-800 text-white placeholder:text-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-500'}`} 
                    />
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Number of individual NFTs to create
                    </p>
                  </LabelInputContainer>

                  <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <h5 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Summary</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Asset Name:</span>
                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{nftTitle || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Asset Type:</span>
                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{assetTypes[nftAssetType]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Token Supply:</span>
                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{nftAmount || '0'} NFTs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Price per Token:</span>
                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{nftPricePerToken} OCT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Images:</span>
                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{nftImageFiles.length} file(s)</span>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => { resetNFTForm(); setShowNFTDialog(false); }} className={`${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                Cancel
              </Button>
              {mintStep === 1 ? (
                <Button 
  type="button" 
  onClick={() => {
    if (!nftTitle || !nftDescription || nftImageFiles.length === 0 || !nftPricePerToken) {
      toast.error('Please fill all required fields and upload documentation');
      return;
    }
    setMintStep(2);
  }} 
  className="bg-blue-600 text-white hover:bg-blue-700"
>
  Configure Token
</Button>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={() => setMintStep(1)} className={`${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                    Back
                  </Button>
                  <Button 
    type="button"
    onClick={() => {
      if (!nftAmount || parseInt(nftAmount) <= 0) {
        toast.error('Please enter a valid token supply');
        return;
      }
      if (!nftPricePerToken || parseFloat(nftPricePerToken) <= 0) {
        toast.error('Please enter a valid price per token');
        return;
      }
      handleMintNFT();
    }}
    disabled={isMinting}
    className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
  >
    <div className="flex items-center space-x-2">
      {isMinting && (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      <span>{isMinting ? 'Creating Token...' : 'Create Asset Token'}</span>
    </div>
  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Dialog for Minting NFT */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className={`sm:max-w-md rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} shadow-xl p-6`}>
            <DialogHeader>
              <DialogTitle className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Asset Token Created!</DialogTitle>
              <DialogDescription className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                Your asset has been successfully tokenized and deployed to the blockchain.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className={`flex items-center justify-between p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex flex-col">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Asset Token ID</span>
                  <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} break-all`}>{mintedAssetId || 'Loading...'}</span>
                </div>
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(mintedAssetId || '')} className={`${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}>
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
              <Button asChild variant="default" onClick={() => { setShowSuccessDialog(false); setMintedAssetId(null); }} className="bg-blue-600 hover:bg-blue-700">
                <Link to="/issuer" className="w-full h-full">Return to Dashboard</Link>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
};

export default Issuer;