import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingCart, Eye, Clock, User } from 'lucide-react';
import { Tabs, TabsContent, TabsTrigger, TabsList } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';
import { OneChainService } from '@/services/oneChainService';
import { useSuiWallet, ConnectButton } from '@/context/SuiWalletContext';

// Price utilities
const formatPriceInUSD = (octAmount: number, octPrice: number): string => {
  const usdValue = octAmount * octPrice;
  return `$${usdValue.toFixed(2)} USD`;
};

const formatOCTPrice = (mistAmount: string | number): string => {
  const octAmount = typeof mistAmount === 'string' 
    ? parseFloat(mistAmount) / 1000000000
    : mistAmount / 1000000000;
  return `${octAmount.toFixed(4)} OCT`;
};

interface MarketplaceListing {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  price: string;
  amount: number;
  seller: string;
  metadataURI: string;
  metadata?: any;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface BuyModalProps {
  asset: MarketplaceListing;
  onClose: () => void;
  onSuccess?: () => void;
  suiPrice: number;
}

const BuyModal: React.FC<BuyModalProps> = ({ asset, onClose, onSuccess, suiPrice }) => {
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const { address, signAndExecuteTransaction, suiClient } = useSuiWallet();

  const handlePurchase = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('=== OneChain Purchase ===');
      console.log('Token ID:', asset.tokenId);
      console.log('Amount:', quantity);
      console.log('Price per token (MIST):', asset.price);
      
      const priceInMist = parseInt(asset.price);
      const totalPrice = priceInMist * quantity;
      
      // Initialize OneChainService with SUI client
      const oneChainService = new OneChainService(suiClient);
      const result = await oneChainService.purchaseAsset(
        asset.tokenId, 
        totalPrice, 
        address, 
        signAndExecuteTransaction
      );

      if (result.success) {
        toast.success('Asset purchased successfully!');
        onSuccess?.();
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

  return (
    <DialogContent className="max-w-md mx-auto bg-gray-900 border border-gray-700">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-white">Purchase {asset.name}</DialogTitle>
        <DialogDescription className="text-gray-400">
          Complete your purchase on OneChain
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 mt-4">
        <div className="flex items-center space-x-4">
          <img 
            src={asset.image || '/placeholder.svg'} 
            alt={asset.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div>
            <h3 className="text-white font-medium">{asset.name}</h3>
            <p className="text-gray-400 text-sm">{asset.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800 rounded-lg">
          <div>
            <p className="text-gray-400 text-sm">Price per token</p>
            <p className="text-white font-bold">{formatOCTPrice(asset.price)}</p>
            <p className="text-gray-400 text-xs">{formatPriceInUSD(parseFloat(formatOCTPrice(asset.price).split(' ')[0]), suiPrice)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Price</p>
            <p className="text-white font-bold">{formatOCTPrice(parseInt(asset.price) * quantity)}</p>
            <p className="text-gray-400 text-xs">{formatPriceInUSD(parseFloat(formatOCTPrice(parseInt(asset.price) * quantity).split(' ')[0]), suiPrice)}</p>
          </div>
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Quantity (Available: {asset.amount})
          </label>
          <input
            type="number"
            min="1"
            max={asset.amount}
            value={quantity}
            onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, asset.amount))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isProcessing || !address}
          >
            {isProcessing ? 'Processing...' : `Purchase ${quantity} token${quantity > 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

const Marketplace: React.FC = () => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [showDetails, setShowDetails] = useState<MarketplaceListing | null>(null);
  const [suiPrice, setSuiPrice] = useState<number>(1.50);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { address, suiClient } = useSuiWallet();
  const navigate = useNavigate();

  // Initialize OneChainService with SUI client
  const oneChainService = new OneChainService(suiClient);

  useEffect(() => {
    loadMarketplaceListings();
    fetchSUIPrice();
  }, []);

  const fetchSUIPrice = async () => {
    try {
      // Mock SUI price - in production, fetch from price API
      setSuiPrice(1.50);
    } catch (error) {
      console.warn('Failed to fetch SUI price, using default');
      setSuiPrice(1.50);
    }
  };

  const loadMarketplaceListings = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Create mock data for demonstration since marketplace might not have listings yet
      const mockListings: MarketplaceListing[] = [
        {
          tokenId: '0x20bd83972d4b9815e3079335ba5c902df1b9a9af881c5bd90b39c330415863f1',
          name: 'Real Estate NFT #1',
          description: 'Premium real estate asset tokenized on OneChain',
          image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
          price: '2000000000', // 2 SUI in MIST
          amount: 1,
          seller: '0x1e67312d903303444457fa31ad20d813875b9875d9878162f700e555290a98bc',
          metadataURI: 'https://ipfs.io/ipfs/QmTestRWAAsset',
          attributes: [
            { trait_type: 'Type', value: 'Real Estate' },
            { trait_type: 'Location', value: 'New York' },
            { trait_type: 'Valuation', value: '$1,000,000' }
          ]
        },
        {
          tokenId: '0xc987d1c7a8d3c1e874e4aa272fde0c158cf32564671f4d3ff58186797486b507',
          name: 'Invoice Token #1',
          description: 'Invoice token representing future payment',
          image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
          price: '1000000000000', // 1000 OCT in MIST (1000 * 10^9)
          amount: 1000,
          seller: '0x1e67312d903303444457fa31ad20d813875b9875d9878162f700e555290a98bc',
          metadataURI: 'https://ipfs.io/ipfs/QmTestFT',
          attributes: [
            { trait_type: 'Type', value: 'Invoice' },
            { trait_type: 'Total Supply', value: '1000' },
            { trait_type: 'Due Date', value: '2024-12-31' }
          ]
        }
      ];
      
      setListings(mockListings);
      
      if (mockListings.length === 0) {
        setError('No active listings found on the marketplace');
      }
      
    } catch (error: any) {
      console.error('Error loading marketplace listings:', error);
      setError(`Failed to load marketplace listings: ${error.message}`);
      toast.error('Failed to load marketplace listings');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseSuccess = () => {
    loadMarketplaceListings();
    toast.success('Purchase completed! Refreshing marketplace...');
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % listings.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + listings.length) % listings.length);
  };

  const AssetCard = ({ listing, index }: { listing: MarketplaceListing; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-gray-600"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={listing.image || '/placeholder.svg'} 
          alt={listing.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-black/50 text-white">
            {listing.amount} Available
          </Badge>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-white font-semibold text-lg truncate">{listing.name}</h3>
          <Badge variant="outline" className="text-xs text-gray-300 border-gray-600">
            {listing.attributes.find(attr => attr.trait_type === 'Type')?.value || 'Asset'}
          </Badge>
        </div>
        
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{listing.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Price</span>
            <div className="text-right">
              <div className="text-white font-bold">{formatOCTPrice(listing.price)}</div>
              <div className="text-gray-400 text-xs">{formatPriceInUSD(parseFloat(formatOCTPrice(listing.price).split(' ')[0]), suiPrice)}</div>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700">
                <Eye className="w-4 h-4 mr-1" />
                Details
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border border-gray-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">{listing.name}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <img 
                  src={listing.image || '/placeholder.svg'} 
                  alt={listing.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-medium mb-2">Description</h4>
                    <p className="text-gray-400 text-sm">{listing.description}</p>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2">Attributes</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {listing.attributes.map((attr, idx) => (
                        <div key={idx} className="bg-gray-800 rounded p-2">
                          <div className="text-gray-400 text-xs">{attr.trait_type}</div>
                          <div className="text-white text-sm font-medium">{attr.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className="text-gray-400 text-sm mb-1">Price</div>
                    <div className="text-white text-xl font-bold">{formatOCTPrice(listing.price)}</div>
                    <div className="text-gray-400 text-sm">{formatPriceInUSD(parseFloat(formatOCTPrice(listing.price).split(' ')[0]), suiPrice)}</div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                <ShoppingCart className="w-4 h-4 mr-1" />
                Buy Now
              </Button>
            </DialogTrigger>
            <BuyModal 
              asset={listing} 
              onClose={() => {}} 
              onSuccess={handlePurchaseSuccess}
              suiPrice={suiPrice}
            />
          </Dialog>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <BackgroundBeamsWithCollision>
        <div className="relative z-10">
          {/* Header */}
          <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-white">OneChain Marketplace</h1>
                  <p className="text-gray-400 mt-1">Discover and trade real-world assets</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="text-gray-300 border-gray-600">
                    {listings.length} Assets Available
                  </Badge>
                  <ConnectButton />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {error ? (
              <div className="text-center py-12">
                <div className="text-red-400 mb-4">{error}</div>
                <Button onClick={loadMarketplaceListings} variant="outline" className="border-gray-600 text-gray-300">
                  Retry
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="grid" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 bg-gray-800">
                  <TabsTrigger value="grid" className="text-gray-300 data-[state=active]:text-white">Grid View</TabsTrigger>
                  <TabsTrigger value="carousel" className="text-gray-300 data-[state=active]:text-white">Carousel</TabsTrigger>
                </TabsList>
                
                <TabsContent value="grid">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {listings.map((listing, index) => (
                      <AssetCard key={listing.tokenId} listing={listing} index={index} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="carousel">
                  {listings.length > 0 && (
                    <div className="relative">
                      <div className="flex justify-center mb-8">
                        <div className="w-full max-w-md">
                          <AssetCard listing={listings[currentIndex]} index={0} />
                        </div>
                      </div>
                      
                      <div className="flex justify-center space-x-4">
                        <Button
                          onClick={prevSlide}
                          variant="outline"
                          size="sm"
                          className="border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Previous
                        </Button>
                        <div className="flex items-center space-x-2">
                          {listings.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentIndex(index)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentIndex ? 'bg-blue-600' : 'bg-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <Button
                          onClick={nextSlide}
                          variant="outline"
                          size="sm"
                          className="border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                          Next
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </BackgroundBeamsWithCollision>
    </div>
  );
};

export default Marketplace;
