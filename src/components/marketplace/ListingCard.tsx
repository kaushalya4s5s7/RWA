import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListingItem } from './types';

interface ListingCardProps extends ListingItem {
  onBuyClick: () => void;
}

const ListingCard: React.FC<ListingCardProps> = ({
  title,
  price,
  description,
  imageUrl,
  yield: yieldValue,
  tokenSymbol,
  onBuyClick,
}) => {
  return (
    <Card className="w-full bg-white shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          <img 
            src={imageUrl} 
            alt={title} 
            className="object-cover w-full h-full"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg mb-2 text-gray-900">{title}</CardTitle>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Price</span>
            <span className="font-medium text-gray-900">{price.toLocaleString()} {tokenSymbol}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Expected Yield</span>
            <span className="font-medium text-green-600">{yieldValue}%</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-0">
        <Button 
          onClick={onBuyClick}
          className="w-full bg-marketplace-blue hover:bg-marketplace-blue/90"
        >
          Buy Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ListingCard;
