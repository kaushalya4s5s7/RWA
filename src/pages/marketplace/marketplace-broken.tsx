

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsTrigger, TabsList } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';
import BuyModal from '@/components/BuyModal';
import { OneChainService } from '@/services/oneChainService';
import { useSuiWallet } from '@/context/SuiWalletContext';

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
  price: string; // in Wei
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
  const [priceLoading, setPriceLoading] = useState(false);
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
        
        // Extract image URL with proper IPFS handling
        let imageUrl = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'; // fallback
        
        // Check for image in metadata - try different fields
        const candidateImage = metadata.image || 
                              (metadata.images && metadata.images[0]) || 
                              metadata.imageUrl;
                              
        if (candidateImage) {
          if (candidateImage.startsWith('ipfs://')) {
            // Convert IPFS URI to HTTP gateway
            const hash = candidateImage.replace('ipfs://', '');
            imageUrl = `https://gateway.pinata.cloud/ipfs/${hash}`;
            console.log(`Converting IPFS URI for token ${result.tokenIds[i]}:`, candidateImage, '→', imageUrl);
          } else if (candidateImage.startsWith('http')) {
            imageUrl = candidateImage;
          }
        }
        
        const listing: MarketplaceListing = {
          tokenId: result.tokenIds[i],
          name: metadata.name || `Asset ${result.tokenIds[i]}`,
          description: metadata.description || 'No description available',
          image: imageUrl,
          price: result.prices[i], // Price is already a string in Wei
          amount: result.amounts[i],
          seller: result.sellers[i],
          metadataURI: result.metadataURIs[i],
          metadata: metadata,
          attributes: metadata.attributes || []
        };
        
        transformedListings.push(listing);
      }
      
      setListings(transformedListings);
      
      if (transformedListings.length === 0) {
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
    // Reload listings after successful purchase
    loadMarketplaceListings();
    toast.success('Purchase completed! Refreshing marketplace...');
  };

  if (loading) {
    return (
      <div className="min-h-screen h-screen w-full bg-white flex items-center justify-center">
        <BackgroundBeamsWithCollision>
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <div className="text-black text-xl font-medium">Loading marketplace...</div>
            <div className="text-gray-600 text-sm">Please wait</div>
          </div>
        </BackgroundBeamsWithCollision>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen h-screen w-full bg-white flex items-center justify-center">
        <BackgroundBeamsWithCollision>
          <div className="flex flex-col items-center space-y-4 text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="text-black text-xl font-medium">Connection Error</div>
            <div className="text-gray-600 text-sm">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </BackgroundBeamsWithCollision>
      </div>
    );
  }

  // Filter listings by category
  const realEstateListings = listings?.filter(listing => {
    const assetType = listing.attributes?.find(attr => 
      attr.trait_type === 'Asset Type'
    )?.value;
    return assetType?.toLowerCase() === 'real estate';
  }) || [];

  const invoiceListings = listings?.filter(listing => {
    const assetType = listing.attributes?.find(attr => 
      attr.trait_type === 'Asset Type'
    )?.value;
    return assetType?.toLowerCase() === 'invoice';
  }) || [];

  const commodityListings = listings?.filter(listing => {
    const assetType = listing.attributes?.find(attr => 
      attr.trait_type === 'Asset Type'
    )?.value;
    return assetType?.toLowerCase() === 'commodity';
  }) || [];

  const stockListings = listings?.filter(listing => {
    const assetType = listing.attributes?.find(attr => 
      attr.trait_type === 'Asset Type'
    )?.value;
    return assetType?.toLowerCase() === 'stocks';
  }) || [];

  const carbonCreditListings = listings?.filter(listing => {
    const assetType = listing.attributes?.find(attr => 
      attr.trait_type === 'Asset Type'
    )?.value;
    return assetType?.toLowerCase() === 'carboncredit';
  }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50/30 to-gray-100">
      {/* Professional Header */}
      <header className="backdrop-blur-lg bg-white/90 border-b border-gray-200/60 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <span className="text-gray-600 hover:text-gray-900 cursor-pointer transition-colors">Explore</span>
                <span className="text-gray-600 hover:text-gray-900 cursor-pointer transition-colors">About</span>
                <span className="text-gray-600 hover:text-gray-900 cursor-pointer transition-colors">Help</span>
              </div>
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium">My Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Properties Carousel */}
      <div className="container mx-auto px-6 pt-8 pb-12">
        <FeaturedPropertiesCarousel 
          listings={listings.slice(0, 3)} 
          onSelectListing={setSelectedListing}
          onViewDetails={setShowDetails}
          octPrice={octPrice}
        />
        
        {/* See All Listings Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">See All Listings</h2>
              <p className="text-gray-600">Explore our complete collection of tokenized real-world assets</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={loadMarketplaceListings}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2"
                title="Refresh listings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Professional Tabs */}
        <Tabs defaultValue="realEstate" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="inline-flex bg-white/80 backdrop-blur-sm p-1 rounded-2xl shadow-lg border border-gray-200/50">
              <ProfessionalTab title="Real Estate" icon="🏘️" value="realEstate" />
              <ProfessionalTab title="Invoices" icon="📄" value="invoices" />
              <ProfessionalTab title="Commodities" icon="⚡" value="commodities" />
              <ProfessionalTab title="Stocks" icon="📈" value="stocks" />
              <ProfessionalTab title="Carbon Credits" icon="🌱" value="carbonCredits" />
            </TabsList>
          </div>

          <TabsContent value="realEstate">
            <ProfessionalListingsGrid 
              listings={realEstateListings} 
              category="Real Estate" 
              onSelectListing={setSelectedListing}
              octPrice={octPrice}
            />
          </TabsContent>
          <TabsContent value="invoices">
            <ProfessionalListingsGrid 
              listings={invoiceListings} 
              category="Invoices"
              onSelectListing={setSelectedListing}
              octPrice={octPrice}
            />
          </TabsContent>
          <TabsContent value="commodities">
            <ProfessionalListingsGrid 
              listings={commodityListings} 
              category="Commodities"
              onSelectListing={setSelectedListing}
              octPrice={octPrice}
            />
          </TabsContent>
          <TabsContent value="stocks">
            <ProfessionalListingsGrid 
              listings={stockListings} 
              category="Stocks"
              onSelectListing={setSelectedListing}
              octPrice={octPrice}
            />
          </TabsContent>
          <TabsContent value="carbonCredits">
            <ProfessionalListingsGrid 
              listings={carbonCreditListings} 
              category="Carbon Credits"
              onSelectListing={setSelectedListing}
              octPrice={octPrice}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Buy Modal */}
      {selectedListing && (
        <BuyModal
          asset={{
            tokenId: selectedListing.tokenId,
            name: selectedListing.name,
            description: selectedListing.description,
            price: selectedListing.price, // Price in Wei
            amount: selectedListing.amount,
            image: selectedListing.image,
            seller: selectedListing.seller,
            metadata: selectedListing.metadata
          }}
          onClose={() => setSelectedListing(null)}
          onSuccess={handlePurchaseSuccess}
          octPrice={octPrice}
        />
      )}

      {/* Details Modal */}
      {showDetails && (
        <ProfessionalExpandedDetail 
          listing={showDetails} 
          onClose={() => setShowDetails(null)}
          onBuy={(listing) => {
            setShowDetails(null);
            setSelectedListing(listing);
          }}
          octPrice={octPrice}
        />
      )}
    </div>
  );
};

// Featured Properties Carousel Component
const FeaturedPropertiesCarousel: React.FC<{ 
  listings: MarketplaceListing[];
  onSelectListing: (listing: MarketplaceListing) => void;
  onViewDetails: (listing: MarketplaceListing) => void;
  octPrice: number;
}> = ({ listings, onSelectListing, onViewDetails, octPrice }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % listings.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [listings.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % listings.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + listings.length) % listings.length);
  };

  if (listings.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-black shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(75,85,99,0.2),transparent_50%)]"></div>
      
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="flex flex-col lg:flex-row"
          >
            {/* Image Section */}
            <div className="lg:w-1/2 relative">
              <img
                src={listings[currentIndex].image}
                alt={listings[currentIndex].name}
                className="w-full h-64 lg:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              
              {/* Featured Badge */}
              <div className="absolute top-6 left-6">
                <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-full text-sm font-bold shadow-lg">
                  ⭐ FEATURED
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="lg:w-1/2 p-8 lg:p-12 text-white flex flex-col justify-center">
              <div className="mb-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  {listings[currentIndex].attributes.find(attr => attr.trait_type === 'Asset Type')?.value}
                </span>
              </div>
              
              <h3 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                {listings[currentIndex].name}
              </h3>
              
              <p className="text-lg text-gray-100 mb-6 leading-relaxed">
                {listings[currentIndex].description}
              </p>
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {formatPriceInUSD(parseFloat(listings[currentIndex].price) / Math.pow(10, 8), octPrice)}
                  </div>
                  <div className="text-gray-200 text-sm">
                    Price per token ({(parseFloat(listings[currentIndex].price) / Math.pow(10, 8)).toFixed(4)} oct)
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold">Token #{listings[currentIndex].tokenId}</div>
                  <div className="text-gray-200 text-sm">{listings[currentIndex].amount} Available</div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button 
                  onClick={() => onViewDetails(listings[currentIndex])}
                  className="flex-1 px-6 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold shadow-lg"
                >
                  View Details
                </button>
                <button 
                  onClick={() => onSelectListing(listings[currentIndex])}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 font-semibold shadow-lg"
                >
                  Invest Now
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {listings.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white shadow-lg' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Professional Tab Component
const ProfessionalTab: React.FC<{
  title: string;
  icon: string;
  value: string;
}> = ({ title, icon, value }) => (
  <TabsTrigger 
    value={value}
    className="px-6 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300 font-medium text-gray-700 data-[state=active]:text-gray-900"
  >
    <span className="mr-2 text-lg">{icon}</span>
    {title}
  </TabsTrigger>
);

// Professional Listings Grid
const ProfessionalListingsGrid: React.FC<{ 
  listings: MarketplaceListing[];
  category: string;
  onSelectListing: (listing: MarketplaceListing) => void;
  octPrice: number;
}> = ({ listings, category, onSelectListing, octPrice }) => {
  const [activeListing, setActiveListing] = useState<MarketplaceListing | null>(null);

  if (listings.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No {category} Available</h3>
        <p className="text-gray-600">Check back later for new listings in this category.</p>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {activeListing && (
          <ProfessionalExpandedDetail 
            listing={activeListing} 
            onClose={() => setActiveListing(null)}
            onBuy={(listing) => onSelectListing(listing)}
            octPrice={octPrice}
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.map((listing, index) => (
          <motion.div
            key={listing.tokenId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            layoutId={`listing-${listing.tokenId}`}
            onClick={() => setActiveListing(listing)}
            className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-200/50 hover:border-gray-300/50 overflow-hidden hover:scale-[1.02]"
          >
            <div className="relative overflow-hidden">
              <img 
                src={listing.image} 
                alt={listing.name}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 border border-gray-200/50">
                  {listing.attributes.find(attr => attr.trait_type === 'Asset Type')?.value}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="px-2 py-1 bg-blue-500/90 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-blue-400/50">
                  #{listing.tokenId}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors line-clamp-1">
                {listing.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                {listing.description}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">
                    {formatPriceInUSD(parseFloat(listing.price) / Math.pow(10, 8), octPrice)}
                  </p>
                  <p className="text-xs text-gray-500">Price per token ({(parseFloat(listing.price) / Math.pow(10, 8)).toFixed(4)} oct)</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">{listing.amount} Available</p>
                  <p className="text-xs text-gray-500">Tokens</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-gray-600">Available Now</span>
                </div>
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl hover:from-gray-900 hover:to-gray-800 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectListing(listing);
                  }}
                >
                  Buy Asset
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
};

// Professional Expanded Detail Component
const ProfessionalExpandedDetail: React.FC<{
  listing: MarketplaceListing;
  onClose: () => void;
  onBuy: (listing: MarketplaceListing) => void;
  octPrice: number;
}> = ({ listing, onClose, onBuy, octPrice }) => (
  <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex flex-col lg:flex-row h-full max-h-[90vh] overflow-y-auto">
        <div className="lg:w-1/2 relative">
          <img
            src={listing.image}
            alt={listing.name}
            className="w-full h-64 lg:h-full object-cover"
          />
          <div className="absolute bottom-6 left-6">
            <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 border border-gray-200/50">
              {listing.attributes.find(attr => attr.trait_type === 'Asset Type')?.value}
            </span>
          </div>
        </div>

        <div className="lg:w-1/2 p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{listing.name}</h2>
            
            <div className="mb-6">
              <div className="flex items-baseline space-x-4 mb-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">
                  {formatPriceInUSD(parseFloat(listing.price) / Math.pow(10, 8), octPrice)}
                </span>
                <span className="text-lg text-gray-500">Price per token</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Available Now</span>
                </div>
                <span>•</span>
                <span>{(parseFloat(listing.price) / Math.pow(10, 8)).toFixed(4)} oct per token</span>
                <span>•</span>
                <span>Seller: {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}</span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{listing.description}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Token ID - Always show first */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200/50">
                  <div className="text-blue-600 text-sm font-medium">Platform ID</div>
                  <div className="text-blue-900 font-semibold mt-1">#{listing.tokenId}</div>
                </div>
                {/* Available Amount */}
                <div className="bg-green-50 rounded-xl p-4 border border-green-200/50">
                  <div className="text-green-600 text-sm font-medium">Available Amount</div>
                  <div className="text-green-900 font-semibold mt-1">{listing.amount} tokens</div>
                </div>
                {/* Other attributes */}
                {listing.attributes?.map((attr) => (
                  <div key={attr.trait_type} className="bg-gray-50 rounded-xl p-4 border border-gray-200/50">
                    <div className="text-gray-500 text-sm font-medium">{attr.trait_type}</div>
                    <div className="text-gray-900 font-semibold mt-1">{attr.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button 
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
            <button 
              className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl hover:from-gray-900 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              onClick={() => onBuy(listing)}
            >
              Buy Asset
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

export default Marketplace;