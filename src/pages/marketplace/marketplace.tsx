import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingCart, Eye, LayoutDashboard } from 'lucide-react';
import { Tabs, TabsContent, TabsTrigger, TabsList } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { OneChainService } from '@/services/oneChainService';
import { useSuiWallet, ConnectButton } from '@/context/SuiWalletContext';

// --- UTILITY FUNCTIONS ---
const formatPriceInUSD = (octAmount: number, octPrice: number): string => {
  const usdValue = octAmount * octPrice;
  return `$${usdValue.toFixed(2)} USD`;
};

const formatOCTPrice = (priceInBaseUnits: string | number): string => {
  console.log('🔍 formatOCTPrice input:', priceInBaseUnits, 'type:', typeof priceInBaseUnits);
  const priceNum = typeof priceInBaseUnits === 'string' ? parseFloat(priceInBaseUnits) : priceInBaseUnits;
  console.log('🔍 Parsed price number:', priceNum);
  const octAmount = priceNum / Math.pow(10, 9); // Convert MIST to OCT
  console.log('🔍 OCT amount after division:', octAmount);
  return `${octAmount.toFixed(4)} OCT`;
};

// --- INTERFACES ---
interface MarketplaceListing {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  price: string;
  pricePerToken: string;
  totalSupply: number;
  amount: number;
  availableTokens: number;
  seller: string;
  metadataURI: string;
  metadata?: any;
  isNft?: boolean;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  // Additional metadata
  assetType?: string;
  baseCurrency?: string;
  pricePerTokenOCT?: number;
  tokenRewards?: number;
}

// --- BUY MODAL COMPONENT ---
const BuyModal: React.FC<{
  asset: MarketplaceListing;
  onClose: () => void;
  onSuccess: () => void;
  tokenPrice: number;
}> = ({ asset, onClose, onSuccess, tokenPrice }) => {
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const { account, suiClient, signAndExecuteTransaction } = useSuiWallet();

  const handlePurchase = async () => {
    if (!account?.address) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (quantity <= 0 || quantity > asset.availableTokens) {
      toast.error(`Please enter a valid quantity (1-${asset.availableTokens})`);
      return;
    }
    
    setIsProcessing(true);
    try {
      const oneChainService = new OneChainService(suiClient);

      // Check if this is an FT asset (availableTokens > 1) or NFT (availableTokens = 1)
      const isFT = asset.availableTokens > 1;
      
      let result;
      if (isFT && quantity < asset.availableTokens) {
        // Use FT buying for partial purchases
        const pricePerTokenNumber = parseFloat(asset.pricePerToken) || 0;
        result = await oneChainService.buyAssetFT(
          asset.tokenId,
          quantity,
          pricePerTokenNumber,
          account.address,
          signAndExecuteTransaction
        );
      } else {
        // Use regular buying for full asset purchase or NFTs
        result = await oneChainService.buyAsset(
          asset.tokenId,
          0, // Price parameter kept for compatibility
          account.address,
          signAndExecuteTransaction
        );
      }

      if (result.success) {
        toast.success(`Successfully purchased ${quantity} tokens!`);
        onSuccess();
        onClose();
      } else {
        throw new Error(result.error || 'Purchase failed');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(`Purchase failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const pricePerTokenOCT = parseFloat(formatOCTPrice(asset.pricePerToken).split(' ')[0]);
  const totalPriceOCT = pricePerTokenOCT * quantity;
  const totalPriceUSD = totalPriceOCT * tokenPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Purchase Investment Tokens</h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-blue-100 mt-2">You are investing in tokenized {asset.assetType || 'asset'}</p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Asset Overview */}
          <div className="flex items-start space-x-6 mb-8">
            <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0">
              <img src={asset.image} alt={asset.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{asset.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{asset.description}</p>
              
              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-xs text-blue-600 font-medium">PRICE PER TOKEN</div>
                  <div className="text-lg font-bold text-blue-900">{formatOCTPrice(asset.pricePerToken)}</div>
                  <div className="text-xs text-blue-600">${(pricePerTokenOCT * tokenPrice).toFixed(2)} USD</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-xs text-green-600 font-medium">AVAILABLE TOKENS</div>
                  <div className="text-lg font-bold text-green-900">{asset.availableTokens.toLocaleString()}</div>
                  <div className="text-xs text-green-600">of {asset.totalSupply.toLocaleString()} total</div>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Configuration */}
          <div className="space-y-6">
            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Number of Tokens to Purchase
              </label>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 flex items-center justify-center font-bold transition-colors"
                >
                  -
                </button>
                <div className="flex-1">
                  <input
                    type="number"
                    min="1"
                    max={asset.availableTokens}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.min(Math.max(1, val), asset.availableTokens));
                    }}
                    className="w-full text-center text-xl font-bold py-3 px-4 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="text-center text-xs text-gray-500 mt-1">
                    Max: {asset.availableTokens.toLocaleString()} tokens
                  </div>
                </div>
                <button 
                  onClick={() => setQuantity(Math.min(asset.availableTokens, quantity + 1))}
                  disabled={quantity >= asset.availableTokens}
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 flex items-center justify-center font-bold transition-colors"
                >
                  +
                </button>
              </div>
              
              {/* Quick Select Buttons */}
              <div className="flex space-x-2 mt-3">
                {[10, 25, 50, 100].filter(val => val <= asset.availableTokens).map(val => (
                  <button
                    key={val}
                    onClick={() => setQuantity(val)}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    {val}
                  </button>
                ))}
                <button
                  onClick={() => setQuantity(asset.availableTokens)}
                  className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors"
                >
                  Max ({asset.availableTokens})
                </button>
              </div>
            </div>

            {/* Investment Summary */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Investment Summary</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tokens</span>
                  <span className="font-semibold">{quantity.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price per Token</span>
                  <div className="text-right">
                    <div className="font-semibold">{formatOCTPrice(asset.pricePerToken)}</div>
                    <div className="text-xs text-gray-500">${(pricePerTokenOCT * tokenPrice).toFixed(2)} USD</div>
                  </div>
                </div>
                
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total Investment</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{formatOCTPrice(parseInt(asset.pricePerToken) * quantity)}</div>
                      <div className="text-lg text-gray-600">${totalPriceUSD.toFixed(2)} USD</div>
                    </div>
                  </div>
                </div>

                {asset.tokenRewards && asset.tokenRewards > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-green-800 font-medium">Estimated Returns</span>
                      <span className="text-green-800 font-bold">${(asset.tokenRewards * quantity).toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-green-600 mt-1">Based on {asset.tokenRewards} per token</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={onClose} 
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold py-3" 
              onClick={handlePurchase} 
              disabled={isProcessing || !account || quantity <= 0 || quantity > asset.availableTokens}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Invest ${formatOCTPrice(parseInt(asset.pricePerToken) * quantity)}`
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- UI HELPER COMPONENTS ---
const ProfessionalTab: React.FC<{ title: string; icon: string; value: string; }> = ({ title, icon, value }) => (
    <TabsTrigger value={value} className="px-6 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300 font-medium text-gray-700 data-[state=active]:text-gray-900">
        <span className="mr-2 text-lg">{icon}</span>
        {title}
    </TabsTrigger>
);

// --- MAIN MARKETPLACE COMPONENT ---
const Marketplace: React.FC = () => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [showDetails, setShowDetails] = useState<MarketplaceListing | null>(null);
  const [tokenPrice, setTokenPrice] = useState<number>(0.1); // 1 OCT = 0.1 USD (hardcoded as requested)
  const { account, suiClient } = useSuiWallet();
  const navigate = useNavigate();

  useEffect(() => {
    loadMarketplaceListings();
  }, [suiClient]); // Re-fetch if the client changes

  const loadMarketplaceListings = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching marketplace listings...');
      const oneChainService = new OneChainService(suiClient);
      const marketplaceListings = await oneChainService.getMarketplaceListings();
      
      console.log('Raw marketplace listings:', marketplaceListings);
      
      if (marketplaceListings && marketplaceListings.length > 0) {
        // Transform IPFS URLs if needed (matching old marketplace logic)
        const transformed = marketplaceListings.map(listing => {
          if (listing.image && listing.image.startsWith('ipfs://')) {
            const hash = listing.image.replace('ipfs://', '');
            return { ...listing, image: `${import.meta.env.VITE_PINATA_GATEWAY}${hash}` };
          }
          return listing;
        });
        
        console.log('Transformed listings:', transformed);
        setListings(transformed);
      } else {
        // If no listings are returned from the service, set an empty array
        console.log('No listings found');
        setListings([]);
      }
    } catch (error: any) {
      console.error('Error fetching marketplace listings:', error);
      setError(`Failed to load marketplace listings: ${error.message}`);
      toast.error('Failed to load marketplace listings');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseSuccess = () => {
    loadMarketplaceListings();
    toast.success('Purchase completed! Refreshing marketplace...');
  };

  if (loading) {
    return (
      <div className="min-h-screen h-screen w-full bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <div className="text-black text-xl font-medium">Loading Marketplace...</div>
        </div>
      </div>
    );
  }

  if (error) {
     return (
       <div className="min-h-screen h-screen w-full bg-white flex items-center justify-center">
         <div className="flex flex-col items-center space-y-4 text-center max-w-md">
           <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
             <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
           </div>
           <div className="text-black text-xl font-medium">Connection Error</div>
           <div className="text-gray-600 text-sm">{error}</div>
           <Button onClick={loadMarketplaceListings}>Try Again</Button>
         </div>
       </div>
     );
  }

  // Add null/undefined check for listings (matching old marketplace logic)
  if (!listings) {
    return (
      <div className="min-h-screen h-screen w-full bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-7 7-7-7" /></svg>
          </div>
          <div className="text-black text-xl font-medium">No Listings Data</div>
          <div className="text-gray-600 text-sm">Unable to load marketplace data</div>
          <Button onClick={loadMarketplaceListings}>Retry Loading</Button>
        </div>
      </div>
    );
  }

  // Filter listings by category based on metadata (matching old marketplace logic)
  const realEstateListings = listings.filter(listing => {
    const assetType = listing.attributes?.find(attr => 
      attr.trait_type === 'Asset Type'
    )?.value;
    return assetType?.toLowerCase() === 'real estate';
  });

  const invoiceListings = listings.filter(listing => {
    const assetType = listing.attributes?.find(attr => 
      attr.trait_type === 'Asset Type'
    )?.value;
    return assetType?.toLowerCase() === 'invoice';
  });

  const carbonCreditListings = listings.filter(listing => {
    const assetType = listing.attributes?.find(attr => 
      attr.trait_type === 'Asset Type'
    )?.value;
    return assetType?.toLowerCase() === 'carbon credit';
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50/30 to-gray-100">
      <header className="backdrop-blur-lg bg-white/90 border-b border-gray-200/60 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => navigate('/')}>Credora</h1>
            <div className="flex items-center gap-4">
                {account && (
                    <Button 
                        onClick={() => navigate('/dashboard')} 
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        My Dashboard
                    </Button>
                )}
                <ConnectButton />
            </div>
        </div>
      </header>

      <div className="container mx-auto px-6 pt-8 pb-12">
        <FeaturedPropertiesCarousel listings={listings.slice(0, 3)} onViewDetails={setShowDetails} onSelectListing={setSelectedListing} tokenPrice={tokenPrice} />
        
        <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">See All Listings</h2>
            <p className="text-gray-600">Explore our complete collection of tokenized assets on Onechain</p>
        </div>

        <Tabs defaultValue="realEstate" className="w-full mt-8">
            <div className="flex justify-center mb-8">
                <TabsList className="inline-flex bg-white/80 backdrop-blur-sm p-1 rounded-2xl shadow-lg border border-gray-200/50">
                    <ProfessionalTab title="Real Estate" icon="🏘️" value="realEstate" />
                    <ProfessionalTab title="Invoices" icon="📄" value="invoices" />
                    <ProfessionalTab title="Carbon Credits" icon="🌱" value="carbonCredits" />
                </TabsList>
            </div>
            <TabsContent value="realEstate"><ProfessionalListingsGrid listings={realEstateListings} category="Real Estate" onViewDetails={setShowDetails} onSelectListing={setSelectedListing} tokenPrice={tokenPrice} /></TabsContent>
            <TabsContent value="invoices"><ProfessionalListingsGrid listings={invoiceListings} category="Invoices" onViewDetails={setShowDetails} onSelectListing={setSelectedListing} tokenPrice={tokenPrice} /></TabsContent>
            <TabsContent value="carbonCredits"><ProfessionalListingsGrid listings={carbonCreditListings} category="Carbon Credits" onViewDetails={setShowDetails} onSelectListing={setSelectedListing} tokenPrice={tokenPrice} /></TabsContent>
        </Tabs>
      </div>

      <AnimatePresence>
        {selectedListing && (
            <BuyModal asset={selectedListing} onClose={() => setSelectedListing(null)} onSuccess={handlePurchaseSuccess} tokenPrice={tokenPrice} />
        )}
        {showDetails && (
            <ProfessionalExpandedDetail listing={showDetails} onClose={() => setShowDetails(null)} onBuy={(listing) => { setShowDetails(null); setSelectedListing(listing); }} tokenPrice={tokenPrice} />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- FULL IMPLEMENTATION OF UI COMPONENTS ---
const FeaturedPropertiesCarousel: React.FC<{ 
    listings: MarketplaceListing[]; 
    onSelectListing: (listing: MarketplaceListing) => void;
    onViewDetails: (listing: MarketplaceListing) => void; 
    tokenPrice: number;
}> = ({ listings, onSelectListing, onViewDetails, tokenPrice }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => setCurrentIndex(prev => (prev + 1) % listings.length);
    const prevSlide = () => setCurrentIndex(prev => (prev - 1 + listings.length) % listings.length);

    if (listings.length === 0) return null;

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-black shadow-2xl">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="flex flex-col lg:flex-row"
                >
                    <div className="lg:w-1/2 relative">
                        <img src={listings[currentIndex].image} alt={listings[currentIndex].name} className="w-full h-64 lg:h-96 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                    <div className="lg:w-1/2 p-8 lg:p-12 text-white flex flex-col justify-center">
                        <h3 className="text-3xl lg:text-4xl font-bold mb-4">{listings[currentIndex].name}</h3>
                        <p className="text-lg text-gray-100 mb-6">{listings[currentIndex].description}</p>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <div className="text-3xl font-bold text-white mb-1">{formatPriceInUSD(parseFloat(formatOCTPrice(listings[currentIndex].price).split(' ')[0]), tokenPrice)}</div>
                                <div className="text-gray-200 text-sm">Price ({formatOCTPrice(listings[currentIndex].price)})</div>
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <Button className="flex-1" variant="secondary" onClick={() => onViewDetails(listings[currentIndex])}>View Details</Button>
                            <Button className="flex-1 bg-white text-black hover:bg-gray-200" onClick={() => onSelectListing(listings[currentIndex])}>Invest Now</Button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white"><ChevronLeft /></button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white"><ChevronRight /></button>
        </div>
    );
};

const ProfessionalListingsGrid: React.FC<{ 
    listings: MarketplaceListing[]; 
    category: string; 
    onSelectListing: (listing: MarketplaceListing) => void; 
    onViewDetails: (listing: MarketplaceListing) => void;
    tokenPrice: number;
}> = ({ listings, category, onSelectListing, onViewDetails, tokenPrice }) => {
    if(listings.length === 0) return <div className="text-center py-16"><h3 className="text-xl font-semibold">No {category} Available</h3><p className="text-gray-600">Check back later for new listings.</p></div>

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing, index) => (
                <motion.div
                    key={listing.tokenId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    onClick={() => onViewDetails(listing)}
                    className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border overflow-hidden"
                >
                    <div className="relative overflow-hidden h-48">
                        <img src={listing.image} alt={listing.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        {/* Token Supply Badge */}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                            <div className="text-xs font-bold text-gray-800">{listing.availableTokens.toLocaleString()}</div>
                            <div className="text-xs text-gray-600">available</div>
                        </div>
                    </div>
                    <div className="p-6">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{listing.name}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>
                        
                        {/* Token Info */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm text-gray-500">
                                <div>{listing.availableTokens.toLocaleString()} of {listing.totalSupply.toLocaleString()}</div>
                                <div>tokens available</div>
                            </div>
                            {listing.assetType && (
                                <Badge variant="secondary" className="text-xs">
                                    {listing.assetType}
                                </Badge>
                            )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-gray-800">{formatPriceInUSD(parseFloat(formatOCTPrice(listing.pricePerToken).split(' ')[0]), tokenPrice)}</p>
                                <p className="text-xs text-gray-500">{formatOCTPrice(listing.pricePerToken)} per token</p>
                            </div>
                            <Button size="sm" className="bg-gray-800 hover:bg-gray-900 text-white" onClick={(e) => { e.stopPropagation(); onSelectListing(listing); }}>Invest</Button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

const ProfessionalExpandedDetail: React.FC<{ 
    listing: MarketplaceListing; 
    onClose: () => void;
    onBuy: (listing: MarketplaceListing) => void;
    tokenPrice: number;
}> = ({ listing, onClose, onBuy, tokenPrice }) => {
    const pricePerTokenOCT = parseFloat(formatOCTPrice(listing.pricePerToken).split(' ')[0]);
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col lg:flex-row"
            >
                <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/90 shadow-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                <div className="lg:w-1/2"><img src={listing.image} alt={listing.name} className="w-full h-64 lg:h-full object-cover" /></div>
                <div className="lg:w-1/2 p-8 flex flex-col">
                    <div className="flex-grow overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-3xl font-bold text-gray-900">{listing.name}</h2>
                            {listing.assetType && (
                                <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                                    {listing.assetType}
                                </Badge>
                            )}
                        </div>
                        
                        {/* Price Information */}
                        <div className="mb-6">
                            <div className="flex items-baseline space-x-2 mb-2">
                                <span className="text-4xl font-bold text-gray-800">{formatPriceInUSD(pricePerTokenOCT, tokenPrice)}</span>
                                <span className="text-lg text-gray-500">per token</span>
                            </div>
                            <div className="text-lg text-gray-600">{formatOCTPrice(listing.pricePerToken)} per token</div>
                        </div>
                        
                        <p className="text-gray-600 mb-6">{listing.description}</p>
                        
                        {/* Token Supply Info */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl mb-6">
                            <h4 className="font-semibold text-gray-800 mb-3">Token Information</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-gray-600">Available Tokens</div>
                                    <div className="text-xl font-bold text-gray-900">{listing.availableTokens.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Total Supply</div>
                                    <div className="text-xl font-bold text-gray-900">{listing.totalSupply.toLocaleString()}</div>
                                </div>
                                {listing.tokenRewards && listing.tokenRewards > 0 && (
                                    <div className="col-span-2">
                                        <div className="text-sm text-gray-600">Estimated Returns</div>
                                        <div className="text-xl font-bold text-green-600">${listing.tokenRewards.toLocaleString()} per token</div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Asset Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-100 p-3 rounded-lg"><div className="text-sm text-gray-500">Asset ID</div><div className="font-semibold">#{listing.tokenId.slice(-6)}</div></div>
                            <div className="bg-gray-100 p-3 rounded-lg"><div className="text-sm text-gray-500">Base Currency</div><div className="font-semibold">{listing.baseCurrency || 'OCT'}</div></div>
                            {listing.attributes.map(attr => <div key={attr.trait_type} className="bg-gray-100 p-3 rounded-lg"><div className="text-sm text-gray-500">{attr.trait_type}</div><div className="font-semibold">{attr.value}</div></div>)}
                        </div>
                    </div>
                    <div className="flex-shrink-0 pt-6">
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" size="lg" onClick={() => onBuy(listing)}>
                            Invest in {listing.availableTokens.toLocaleString()} Available Tokens
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Marketplace;