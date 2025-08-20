import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListingGrid from './ListingGrid';
import { MarketData } from './types';

interface MarketTabsProps {
  marketData: MarketData;
}

const MarketTabs: React.FC<MarketTabsProps> = ({ marketData }) => {
  return (
    <Tabs defaultValue="realEstate" className="w-full bg-white rounded-xl p-4">
      <TabsList className="max-w-2xl mx-auto grid grid-cols-3 gap-3 h-16 p-0 mb-8 bg-gray-50/50 rounded-lg">
        <TabsTrigger 
          value="realEstate"
          className="group relative w-full h-full overflow-hidden rounded-lg border border-gray-100 transition-all 
          hover:bg-marketplace-blue/5
          data-[state=active]:border-transparent data-[state=active]:shadow-lg
          data-[state=active]:bg-white"
        >
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60" 
              alt="Real Estate" 
              className="w-full h-full object-cover opacity-20"
            />
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <span className="text-gray-800 text-sm font-medium group-hover:text-marketplace-blue group-data-[state=active]:text-marketplace-blue">Real Estate</span>
            <span className="text-gray-500 text-xs mt-0.5 group-hover:text-marketplace-blue/70 group-data-[state=active]:text-marketplace-blue/70">Premium Properties</span>
          </div>
        </TabsTrigger>
        
        <TabsTrigger 
          value="invoices"
          className="group relative w-full h-full overflow-hidden rounded-lg border border-gray-100 transition-all 
          hover:bg-marketplace-blue/5
          data-[state=active]:border-transparent data-[state=active]:shadow-lg
          data-[state=active]:bg-white"
        >
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop&q=60" 
              alt="Invoices" 
              className="w-full h-full object-cover opacity-20"
            />
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <span className="text-gray-800 text-sm font-medium group-hover:text-marketplace-blue group-data-[state=active]:text-marketplace-blue">Invoices</span>
            <span className="text-gray-500 text-xs mt-0.5 group-hover:text-marketplace-blue/70 group-data-[state=active]:text-marketplace-blue/70">Corporate Finance</span>
          </div>
        </TabsTrigger>
        
        <TabsTrigger 
          value="commodities"
          className="group relative w-full h-full overflow-hidden rounded-lg border border-gray-100 transition-all 
          hover:bg-marketplace-blue/5
          data-[state=active]:border-transparent data-[state=active]:shadow-lg
          data-[state=active]:bg-white"
        >
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=60" 
              alt="Commodities" 
              className="w-full h-full object-cover opacity-20"
            />
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <span className="text-gray-800 text-sm font-medium group-hover:text-marketplace-blue group-data-[state=active]:text-marketplace-blue">Commodities</span>
            <span className="text-gray-500 text-xs mt-0.5 group-hover:text-marketplace-blue/70 group-data-[state=active]:text-marketplace-blue/70">Physical Assets</span>
          </div>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="realEstate">
        <ListingGrid items={marketData.realEstate} />
      </TabsContent>

      <TabsContent value="invoices">
        <ListingGrid items={marketData.invoices} />
      </TabsContent>

      <TabsContent value="commodities">
        <ListingGrid items={marketData.commodities} />
      </TabsContent>
    </Tabs>
  );
};

export default MarketTabs;
