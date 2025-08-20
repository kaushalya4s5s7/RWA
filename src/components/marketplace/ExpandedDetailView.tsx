import React, { useId } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ListingItem } from "./types";
import { CloseIcon } from "./CloseIcon";

interface ExpandedDetailViewProps extends ListingItem {
  onClose: () => void;
}

export const ExpandedDetailView: React.FC<ExpandedDetailViewProps> = ({
  id,
  title,
  price,
  description,
  imageUrl,
  yield: yieldValue,
  tokenSymbol,
  onClose,
}) => {
  const elementId = useId();

  return (
    <div className="p-4">
      <motion.button
        key={`close-${id}-${elementId}`}
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className="flex absolute top-4 right-4 lg:top-8 lg:right-8 items-center justify-center bg-white rounded-full h-8 w-8 shadow-lg hover:scale-110 active:scale-95"
        onClick={onClose}
      >
        <CloseIcon />
      </motion.button>      <motion.div
        layoutId={`card-${id}-${elementId}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="w-full max-w-[500px] max-h-[90vh] flex flex-col bg-white sm:rounded-3xl overflow-hidden shadow-xl"
      >
        <motion.div 
          layoutId={`image-${id}-${elementId}`}
          transition={{ duration: 0.3 }}
        >
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-64 object-cover"
          />
        </motion.div>        <div className="flex flex-col p-6 overflow-y-auto">
          <div className="flex justify-between items-start">
            <div>
              <motion.h3
                layoutId={`title-${id}-${elementId}`}
                transition={{ duration: 0.3 }}
                className="text-xl font-semibold text-gray-900"
              >
                {title}
              </motion.h3>
              <motion.div
                layoutId={`price-${id}-${elementId}`}
                transition={{ duration: 0.3 }}
                className="text-marketplace-blue text-lg font-semibold mt-2"
              >
                {price.toLocaleString()} {tokenSymbol}
              </motion.div>
              <motion.p
                layoutId={`yield-${id}-${elementId}`}
                transition={{ duration: 0.3 }}
                className="text-green-600 font-medium"
              >
                {yieldValue}% Expected Yield
              </motion.p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-6 text-gray-600"
          >
            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
            <p className="text-sm leading-relaxed">{description}</p>
            
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-gray-900">Investment Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: 0.2 }}
                  className="bg-gray-50 p-3 rounded-lg"
                >
                  <div className="text-gray-600">Minimum Investment</div>
                  <div className="font-medium text-gray-900">1,000 USDC</div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: 0.3 }}
                  className="bg-gray-50 p-3 rounded-lg"
                >
                  <div className="text-gray-600">Lock-up Period</div>
                  <div className="font-medium text-gray-900">12 months</div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: 0.4 }}
                  className="bg-gray-50 p-3 rounded-lg"
                >
                  <div className="text-gray-600">Distribution</div>
                  <div className="font-medium text-gray-900">Monthly</div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: 0.5 }}
                  className="bg-gray-50 p-3 rounded-lg"
                >
                  <div className="text-gray-600">Total Supply</div>
                  <div className="font-medium text-gray-900">100,000 Tokens</div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExpandedDetailView;
