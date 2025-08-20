
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssetCard from './AssetCard';
import BuyModal from './BuyModal';

// Define asset types
const assetTypes = ['Real Estate', 'Commodities', 'Invoices'];

// Mock data for assets
const mockAssets = {
  'Real Estate': [
    {
      id: 're-1',
      title: 'Manhattan Luxury Condo',
      image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80',
      price: '250,000 USDC',
      tokenSymbol: 'MNHT',
      apy: '6.8%',
      location: 'Manhattan, NY',
      category: 'Real Estate',
      color: 'blue'
    },
    {
      id: 're-2',
      title: 'Central Park View Apartment',
      image: 'https://images.unsplash.com/photo-1551038247-3d9af20df552?auto=format&fit=crop&q=80',
      price: '180,000 USDC',
      tokenSymbol: 'CPVA',
      apy: '5.9%',
      location: 'Upper East Side, NY',
      category: 'Real Estate',
      color: 'blue'
    },
    {
      id: 're-3',
      title: 'SoHo Commercial Space',
      image: 'https://images.unsplash.com/photo-1494891848038-7bd202a2afeb?auto=format&fit=crop&q=80',
      price: '420,000 USDC',
      tokenSymbol: 'SOHO',
      apy: '7.2%',
      location: 'SoHo, NY',
      category: 'Real Estate',
      color: 'blue'
    },
    {
      id: 're-4',
      title: 'Brooklyn Brownstone',
      image: 'https://images.unsplash.com/photo-1524230572899-a752b3835840?auto=format&fit=crop&q=80',
      price: '320,000 USDC',
      tokenSymbol: 'BRWN',
      apy: '6.5%',
      location: 'Brooklyn, NY',
      category: 'Real Estate',
      color: 'blue'
    }
  ],
  'Commodities': [
    {
      id: 'com-1',
      title: 'Gold Bullion Reserve',
      image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80',
      price: '50,000 USDC',
      tokenSymbol: 'GOLD',
      apy: '3.2%',
      location: 'Secure Vault, Zurich',
      category: 'Commodities',
      color: 'orange'
    },
    {
      id: 'com-2',
      title: 'Silver Futures',
      image: 'https://images.unsplash.com/photo-1589216532372-1c2a367900d9?auto=format&fit=crop&q=80',
      price: '25,000 USDC',
      tokenSymbol: 'SLVR',
      apy: '4.1%',
      location: 'COMEX Warehouse',
      category: 'Commodities',
      color: 'orange'
    },
    {
      id: 'com-3',
      title: 'Natural Gas Reserve',
      image: 'https://images.unsplash.com/photo-1526306064415-3ff367895b1c?auto=format&fit=crop&q=80',
      price: '100,000 USDC',
      tokenSymbol: 'NGAS',
      apy: '8.3%',
      location: 'Texas, USA',
      category: 'Commodities',
      color: 'orange'
    },
    {
      id: 'com-4',
      title: 'Rare Earth Metals',
      image: 'https://images.unsplash.com/photo-1465661910194-1e4463bcfc8e?auto=format&fit=crop&q=80',
      price: '75,000 USDC',
      tokenSymbol: 'RARE',
      apy: '9.5%',
      location: 'Processing Facility, Australia',
      category: 'Commodities',
      color: 'orange'
    }
  ],
  'Invoices': [
    {
      id: 'inv-1',
      title: 'Global Tech Co. Invoice',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80',
      price: '20,000 USDC',
      tokenSymbol: 'GTCI',
      apy: '12.5%',
      location: 'Due in 30 days',
      category: 'Invoices',
      color: 'green'
    },
    {
      id: 'inv-2',
      title: 'Medical Supply Chain',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80',
      price: '35,000 USDC',
      tokenSymbol: 'MEDC',
      apy: '11.8%',
      location: 'Due in 45 days',
      category: 'Invoices',
      color: 'green'
    },
    {
      id: 'inv-3',
      title: 'Renewable Energy Project',
      image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80',
      price: '80,000 USDC',
      tokenSymbol: 'RENW',
      apy: '10.2%',
      location: 'Due in 60 days',
      category: 'Invoices',
      color: 'green'
    },
    {
      id: 'inv-4',
      title: 'Government Contract',
      image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80',
      price: '120,000 USDC',
      tokenSymbol: 'GOVT',
      apy: '9.7%',
      location: 'Due in 90 days',
      category: 'Invoices',
      color: 'green'
    }
  ]
};

const TabsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState(assetTypes[0]);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  
  const handleBuyClick = (asset: any) => {
    setSelectedAsset(asset);
    setShowBuyModal(true);
  };

  const handleCloseModal = () => {
    setShowBuyModal(false);
  };

  return (
    <section className="py-20 bg-marketplace-gray" id="marketplace">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse Tokenized Assets</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover and invest in a diverse range of tokenized real-world assets across multiple categories
          </p>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white shadow-md">
              {assetTypes.map((type) => (
                <TabsTrigger 
                  key={type} 
                  value={type}
                  className={
                    activeTab === type 
                      ? "data-[state=active]:bg-marketplace-blue data-[state=active]:text-white"
                      : ""
                  }
                >
                  {type}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {assetTypes.map((type) => (
            <TabsContent key={type} value={type} className="focus-visible:outline-none focus-visible:ring-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockAssets[type as keyof typeof mockAssets].map((asset) => (
                  <AssetCard 
                    key={asset.id}
                    asset={asset}
                    onBuyClick={() => handleBuyClick(asset)}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {showBuyModal && selectedAsset && (
        <BuyModal asset={selectedAsset} onClose={handleCloseModal} />
      )}
    </section>
  );
};

export default TabsSection;
