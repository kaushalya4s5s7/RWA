import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsTrigger, TabsList } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';
import { OneChainService } from '@/services/oneChainService';
import { useSuiWallet, ConnectButton } from '@/context/SuiWalletContext';

// Simple price utilities
const formatPriceInUSD = (suiAmount: number, suiPrice: number): string => {
  const usdValue = suiAmount * suiPrice;
  return `$${usdValue.toFixed(2)} USD`;
};

const formatSUIPrice = (mistAmount: string | number): string => {
  const suiAmount = typeof mistAmount === 'string' 
    ? parseFloat(mistAmount) / 1000000000
    : mistAmount / 1000000000;
  return `${suiAmount.toFixed(4)} SUI`;
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

const Marketplace: React.FC = () => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [showDetails, setShowDetails] = useState<MarketplaceListing | null>(null);
  const [suiPrice, setSuiPrice] = useState<number>(1.50); // Default SUI price in USD
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  
  const { account, isConnected, suiClient, signAndExecuteTransaction } = useSuiWallet();
  const oneChainService = new OneChainService(suiClient);

  useEffect(() => {
    loadMarketplaceListings();
  }, []);

  const loadMarketplaceListings = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Use OneChain service to fetch marketplace listings
      const result = await oneChainService.getMarketplaceListings();
      
      // Transform the data to match our interface
      const transformedListings: MarketplaceListing[] = result.map((listing: any, index: number) => {
        return {
          tokenId: listing.id || `listing-${index}`,
          name: listing.name || 'Unknown Asset',
          description: listing.description || 'No description available',
          image: listing.image || '/placeholder.svg',
          price: listing.price || '0',
          amount: listing.amount || 1,
          seller: listing.seller || 'Unknown',
          metadataURI: listing.metadataURI || '',
          attributes: listing.attributes || []
        };
      });
      
      setListings(transformedListings);
      console.log(`✅ Loaded ${transformedListings.length} marketplace listings from OneChain`);
      
    } catch (error: any) {
      console.error('❌ Error fetching marketplace listings:', error);
      setError('Failed to load marketplace listings');
      toast.error('Failed to load marketplace listings');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (listing: MarketplaceListing) => {
    if (!isConnected || !account) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const priceInMist = parseFloat(listing.price);
      await oneChainService.buyAsset(listing.tokenId, priceInMist, account.address, signAndExecuteTransaction);
      
      toast.success('Asset purchased successfully!');
      loadMarketplaceListings(); // Refresh listings
    } catch (error: any) {
      console.error('Error purchasing asset:', error);
      toast.error(`Failed to purchase asset: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen h-screen w-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading marketplace listings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen h-screen w-full bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadMarketplaceListings}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <BackgroundBeamsWithCollision>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">OneChain Marketplace</h1>
            <p className="text-xl text-gray-600 mb-6">Discover and trade Real World Assets on OneChain</p>
            
            {!isConnected && (
              <div className="mb-6">
                <ConnectButton />
              </div>
            )}
          </div>

          {/* Listings Grid */}
          {listings.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">No listings available at the moment.</p>
              <p className="text-gray-500 mt-2">Check back later for new assets!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <motion.div
                  key={listing.tokenId}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    <img
                      src={listing.image}
                      alt={listing.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{listing.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{listing.description}</p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{formatSUIPrice(listing.price)}</p>
                        <p className="text-sm text-gray-500">{formatPriceInUSD(parseFloat(listing.price) / 1000000000, suiPrice)}</p>
                      </div>
                      <Badge variant="secondary">Amount: {listing.amount}</Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowDetails(listing)}
                        variant="outline"
                        className="flex-1"
                      >
                        View Details
                      </Button>
                      <Button
                        onClick={() => handlePurchase(listing)}
                        disabled={!isConnected}
                        className="flex-1"
                      >
                        {!isConnected ? 'Connect Wallet' : 'Buy Now'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Details Modal */}
          {showDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{showDetails.name}</h2>
                    <Button variant="ghost" onClick={() => setShowDetails(null)}>✕</Button>
                  </div>
                  
                  <img
                    src={showDetails.image}
                    alt={showDetails.name}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  
                  <p className="text-gray-600 mb-4">{showDetails.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="font-semibold">Price</p>
                      <p className="text-blue-600">{formatSUIPrice(showDetails.price)}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Amount</p>
                      <p>{showDetails.amount}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Seller</p>
                      <p className="text-sm text-gray-600 break-all">{showDetails.seller}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Token ID</p>
                      <p className="text-sm text-gray-600 break-all">{showDetails.tokenId}</p>
                    </div>
                  </div>

                  {showDetails.attributes && showDetails.attributes.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Attributes</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {showDetails.attributes.map((attr, index) => (
                          <div key={index} className="bg-gray-50 p-2 rounded">
                            <p className="text-sm font-medium">{attr.trait_type}</p>
                            <p className="text-sm text-gray-600">{attr.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => handlePurchase(showDetails)}
                    disabled={!isConnected}
                    className="w-full"
                  >
                    {!isConnected ? 'Connect Wallet to Purchase' : 'Purchase Asset'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </BackgroundBeamsWithCollision>
    </div>
  );
};

export default Marketplace;
