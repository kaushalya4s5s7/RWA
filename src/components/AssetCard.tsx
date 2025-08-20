
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AssetProps {
  asset: {
    id: string;
    title: string;
    image: string;
    price: string;
    tokenSymbol: string;
    apy: string;
    location: string;
    category: string;
    color: string;
  };
  onBuyClick: () => void;
}

const AssetCard: React.FC<AssetProps> = ({ asset, onBuyClick }) => {
  let colorClass = {
    blue: "bg-marketplace-lightBlue text-marketplace-blue",
    green: "bg-marketplace-lightGreen text-marketplace-green",
    orange: "bg-marketplace-lightOrange text-marketplace-orange",
  }[asset.color] || "bg-marketplace-lightBlue text-marketplace-blue";

  return (
    <Card className="overflow-hidden border asset-card">
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={asset.image}
          alt={asset.title}
          className="h-full w-full object-cover transition-transform"
          onLoad={() => console.log('✅ Image loaded successfully:', asset.image)}
          onError={(e) => {
            console.log('❌ Image failed to load:', asset.image);
            console.log('Error event:', e);
            // Set fallback image
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop';
          }}
        />
        <Badge className={`absolute top-3 right-3 ${colorClass}`}>
          {asset.category}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{asset.title}</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">{asset.tokenSymbol}</span>
          <span className="text-sm font-medium text-marketplace-blue">{asset.price}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xs text-gray-500">APY</span>
            <span className="ml-2 text-sm font-semibold text-marketplace-green">{asset.apy}</span>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-500">Location</span>
            <span className="ml-2 text-sm">{asset.location}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full bg-marketplace-blue hover:bg-marketplace-blue/90 text-white"
          onClick={onBuyClick}
        >
          Buy Token
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AssetCard;
