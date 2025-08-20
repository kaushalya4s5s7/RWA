import React from "react";
import { VelocityScroll } from "@/components/magicui/scroll-based-velocity";

const TextCarousel: React.FC = () => {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-white py-16">
      <VelocityScroll 
        className="text-neutral-700" 
        defaultVelocity={0.2} 
        numRows={2}
      >
        Premium Real Estate • Tokenization • Smart Investing • Global Opportunities • 
      </VelocityScroll>
      
      {/* Gradient overlays */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white via-white/90 to-transparent"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white via-white/90 to-transparent"></div>
    </div>
  );
};

export default TextCarousel;