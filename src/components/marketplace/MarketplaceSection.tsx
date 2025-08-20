import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListingGrid from './ListingGrid';

// Sample data with realistic images
const SAMPLE_LISTINGS = {
  realEstate: [
    {
      id: '1',
      title: 'Luxury Apartment Complex',
      price: 500000,
      priceToken: 'USDC',
      description: 'Premium real estate investment opportunity in downtown area with high rental yield.',
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&h=300&fit=crop',
      category: 'Real Estate',
      network: {
        name: 'Ethereum',
        logo: '/images/ethereum-logo.svg'
      },
      type: 'Asset NFT (ERC721)',
      tier: 'Premium',
      earnXP: 38280,
      yield: 9.6,
    },    {
      id: '2',
      title: 'Commercial Office Space',
      price: 750000,
      priceToken: 'USDC',
      description: 'Prime location office building with long-term corporate tenants.',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&h=300&fit=crop',
      category: 'Real Estate',
      network: {
        name: 'Ethereum',
        logo: '/images/ethereum-logo.svg'
      },
      type: 'Asset NFT (ERC721)',
      tier: 'Premium',
      earnXP: 42500,
      yield: 9.2,
    },    {
      id: '3',
      title: 'Residential Development',
      price: 300000,
      priceToken: 'USDC',
      description: 'New residential development project in growing suburban area.',
      imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&h=300&fit=crop',
      category: 'Real Estate',
      network: {
        name: 'Ethereum',
        logo: '/images/ethereum-logo.svg'
      },
      type: 'Asset NFT (ERC721)',
      tier: 'Standard',
      earnXP: 25000,
      yield: 7.8,
    }
  ],  invoices: [
    {
      id: '4',
      title: 'Tech Corp Invoice Bundle',
      price: 100000,
      priceToken: 'USDC',
      description: 'High-yield invoice financing opportunity from Fortune 500 tech companies.',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&h=300&fit=crop',
      category: 'Invoices',
      network: {
        name: 'Polygon',
        logo: '/images/polygon-logo.svg'
      },
      type: 'Asset NFT (ERC721)',
      tier: 'Premium',
      earnXP: 45000,
      yield: 12,
    },    {
      id: '5',
      title: 'Healthcare Receivables',
      price: 75000,
      priceToken: 'USDC',
      description: 'Medical facility receivables with government backing.',
      imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&h=300&fit=crop',
      category: 'Invoices',
      network: {
        name: 'Polygon',
        logo: '/images/polygon-logo.svg'
      },
      type: 'Asset NFT (ERC721)',
      tier: 'Standard',
      earnXP: 35000,
      yield: 11.5,
    },    {
      id: '6',
      title: 'Manufacturing Invoices',
      price: 150000,
      priceToken: 'USDC',
      description: 'Industrial manufacturing sector invoice portfolio.',
      imageUrl: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=500&h=300&fit=crop',
      category: 'Invoices',
      network: {
        name: 'Polygon',
        logo: '/images/polygon-logo.svg'
      },
      type: 'Asset NFT (ERC721)',
      tier: 'Standard',
      earnXP: 30000,
      yield: 10.8,
    }
  ],
  commodities: [
    {
      id: '7',
      title: 'Gold Mining Operation',
      price: 250000,
      priceToken: 'USDC',
      description: 'Tokenized shares of an operational gold mine with monthly yield distributions.',
      imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=500&h=300&fit=crop',
      category: 'Commodities',
      network: {
        name: 'Ethereum',
        logo: '/images/ethereum-logo.svg'
      },
      type: 'Asset NFT (ERC721)',
      tier: 'Premium',
      earnXP: 40000,
      yield: 10,
    },    {
      id: '8',
      title: 'Solar Farm Project',
      price: 180000,
      priceToken: 'USDC',
      description: 'Renewable energy infrastructure with guaranteed power purchase agreements.',
      imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=300&fit=crop',
      category: 'Commodities',
      network: {
        name: 'Ethereum',
        logo: '/images/ethereum-logo.svg'
      },
      type: 'Asset NFT (ERC721)',
      tier: 'Premium',
      earnXP: 35000,
      yield: 9.5,
    },
    {
      id: '9',
      title: 'Agricultural Land',
      price: 200000,
      priceToken: 'USDC',
      description: 'Premium farmland with established crop production.',
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&h=300&fit=crop',
      category: 'Commodities',
      network: {
        name: 'Ethereum',
        logo: '/images/ethereum-logo.svg'
      },
      type: 'Asset NFT (ERC721)',
      tier: 'Standard',
      earnXP: 32000,
      yield: 8.7,
    }
  ],
};

const MarketplaceSection: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">RWA Marketplace</h1>
        
        <Tabs defaultValue="realEstate" className="w-full">
          <TabsList className="w-full justify-start grid grid-cols-3 gap-4 h-48 p-0 mb-8">
            <TabsTrigger 
              value="realEstate"
              className="relative w-full h-full overflow-hidden rounded-xl border border-gray-200 transition-all data-[state=active]:border-marketplace-blue"
            >
              <div className="absolute inset-0 z-0">
                <img 
                  src="/images/real-estate-bg.jpg" 
                  alt="Real Estate" 
                  className="w-full h-full object-cover brightness-[0.7]"
                />
              </div>
              <div className="relative z-10 flex flex-col items-center justify-center h-full bg-black/30 hover:bg-black/40 transition-colors">
                <span className="text-white text-xl font-semibold">Real Estate</span>
                <span className="text-white/80 text-sm mt-2">Premium Properties</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="invoices"
              className="relative w-full h-full overflow-hidden rounded-xl border border-gray-200 transition-all data-[state=active]:border-marketplace-blue"
            >
              <div className="absolute inset-0 z-0">
                <img 
                  src="/images/invoices-bg.jpg" 
                  alt="Invoices" 
                  className="w-full h-full object-cover brightness-[0.7]"
                />
              </div>
              <div className="relative z-10 flex flex-col items-center justify-center h-full bg-black/30 hover:bg-black/40 transition-colors">
                <span className="text-white text-xl font-semibold">Invoices</span>
                <span className="text-white/80 text-sm mt-2">Corporate Finance</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="commodities"
              className="relative w-full h-full overflow-hidden rounded-xl border border-gray-200 transition-all data-[state=active]:border-marketplace-blue"
            >
              <div className="absolute inset-0 z-0">
                <img 
                  src="/images/commodities-bg.jpg" 
                  alt="Commodities" 
                  className="w-full h-full object-cover brightness-[0.7]"
                />
              </div>
              <div className="relative z-10 flex flex-col items-center justify-center h-full bg-black/30 hover:bg-black/40 transition-colors">
                <span className="text-white text-xl font-semibold">Commodities</span>
                <span className="text-white/80 text-sm mt-2">Physical Assets</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="realEstate">
            <ListingGrid items={SAMPLE_LISTINGS.realEstate} />
          </TabsContent>

          <TabsContent value="invoices">
            <ListingGrid items={SAMPLE_LISTINGS.invoices} />
          </TabsContent>

          <TabsContent value="commodities">
            <ListingGrid items={SAMPLE_LISTINGS.commodities} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MarketplaceSection;
