import React, { useId } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ListingItem } from "./types";
import { CATEGORY_ICONS } from "./constants";

interface ExpandableListingCardProps extends ListingItem {
  onClick: () => void;
  isExpanded?: boolean;
  onBuy?: () => void;
}

const ExpandableListingCard: React.FC<ExpandableListingCardProps> = ({
  id,
  title,
  price,
  imageUrl,
  priceToken,
  category,
  network,
  type,
  earnXP,
  assetNumber,
  onClick,
  isExpanded
}) => {
  const elementId = useId();

  return (
    <motion.div
      layoutId={`card-${title}-${elementId}`}
      onClick={onClick}
      className="grid grid-cols-7 gap-4 px-6 py-4 items-center"
    >
      {/* Asset Name */}
      <div className="col-span-2 flex items-center gap-4">
        <img
          src={imageUrl} // Replace with actual asset image
          alt={title}
          className="h-12 w-12 rounded-lg object-cover"
        />
        <div>
          <h3 className="font-medium text-gray-900">
            {title}
          </h3>
          {assetNumber && (
            <p className="text-sm text-gray-500">#{assetNumber}</p>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="text-marketplace-blue font-medium">
        {price.toLocaleString()} {priceToken}
      </div>     
      
       {/* Category with Icon */}
      <div className="flex items-center gap-2">
        <span>{category}</span>
        <img
          src={CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]}
          alt={`${category} icon`}
          className="h-5 w-5 object-contain"
        />
      </div>

      {/* Type */}
      <div className="text-gray-600">
        {type}
      </div>

      {/* Earn XP */}
      <div className="text-green-600">
        Earn up to {earnXP.toLocaleString()} XP
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            // Handle buy action
          }}
          className="px-3 py-1.5 text-sm rounded-full font-medium bg-marketplace-blue text-white hover:bg-marketplace-blue/90"
        >
          Buy
        </Button>
        <Button 
          className="px-3 py-1.5 text-black text-sm rounded-full font-medium bg-gray-100 hover:bg-gray-200"
        >
          View Details
        </Button>
      </div>
    </motion.div>
  );
};

export default ExpandableListingCard;
