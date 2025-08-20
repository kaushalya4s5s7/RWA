"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Diverse, high-quality asset collection for full circle display
const featuredAssets = [
  {
    title: "Manhattan Luxury Penthouse",
    category: "Real Estate",
    value: "$2.4M",
    link: "#",
    thumbnail: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Premium Gold Reserve",
    category: "Commodities", 
    value: "$850K",
    link: "#",
    thumbnail: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Tech Invoice Portfolio",
    category: "Invoices",
    value: "$125K", 
    link: "#",
    thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Modern Glass Estate",
    category: "Real Estate",
    value: "$1.8M",
    link: "#",
    thumbnail: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Tesla Model S Plaid",
    category: "Vehicles",
    value: "$135K",
    link: "#",
    thumbnail: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Fine Art Collection",
    category: "Art",
    value: "$2.1M",
    link: "#",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Platinum Bullion Vault",
    category: "Commodities",
    value: "$1.2M",
    link: "#",
    thumbnail: "https://images.unsplash.com/photo-1611095973362-4665d8b2f6a5?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Corporate Receivables",
    category: "Invoices",
    value: "$450K",
    link: "#",
    thumbnail: "https://images.unsplash.com/photo-1559526324-c1f275fbfa32?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Luxury Yacht Share",
    category: "Vehicles",
    value: "$3.5M",
    link: "#",
    thumbnail: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Diamond Investment",
    category: "Commodities",
    value: "$675K",
    link: "#",
    thumbnail: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Vintage Wine Collection",
    category: "Collectibles",
    value: "$280K",
    link: "#",
    thumbnail: "https://images.unsplash.com/photo-1566995541857-75a8ac7382c5?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Smart Energy Plant",
    category: "Infrastructure",
    value: "$4.2M",
    link: "#",
    thumbnail: "https://images.unsplash.com/photo-1548613053-22087dd8edb8?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Private Jet Shares",
    category: "Vehicles",
    value: "$2.8M",
    link: "#",
    thumbnail: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Rare Whiskey Casks",
    category: "Collectibles",
    value: "$420K",
    link: "#",
    thumbnail: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Tech Startup Equity",
    category: "Stocks",
    value: "$950K",
    link: "#",
    thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=400&h=400",
  },
  {
    title: "Carbon Credit Portfolio",
    category: "Carbon Credits",
    value: "$180K",
    link: "#",
    thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=400&h=400",
  }
];

// Circular motion asset card component for full circle
const CircularAssetCard = ({ 
  asset, 
  index, 
  total, 
  rotation 
}: { 
  asset: typeof featuredAssets[0];
  index: number;
  total: number;
  rotation: number;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Calculate position in full circle
  const angle = (2 * Math.PI / total) * index; // Full circle from 0 to 2π
  const radius = 280; // Distance from center
  
  // Apply rotation and calculate new position
  const rotatedAngle = angle + (rotation * Math.PI) / 180;
  const x = Math.cos(rotatedAngle) * radius;
  const y = Math.sin(rotatedAngle) * radius;
  
  return (
    <motion.div
      className="absolute"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.1, zIndex: 10 }}
    >
      <div className="w-24 h-24 rounded-full overflow-hidden bg-white shadow-xl border-4 border-white hover:border-blue-500 transition-all duration-300 group cursor-pointer">
        {!imageLoaded && (
          <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={asset.thumbnail}
          alt={asset.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        
        {/* Hover overlay with asset info */}
        <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center text-white text-xs p-2">
          <div className="font-semibold text-center mb-1 leading-tight">{asset.title}</div>
          <div className="text-blue-300 text-xs mb-1">{asset.category}</div>
          <div className="font-bold text-green-400">{asset.value}</div>
        </div>
        
        {/* Category badge */}
        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
          {asset.category}
        </div>
      </div>
    </motion.div>
  );
};
        
        {/* Asset image */}
        <img
          src={asset.thumbnail}
          alt={asset.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 rounded-full",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-full" />
        
        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-800">
            {asset.category}
          </span>
        </div>
        
        {/* Asset details */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
          <h3 className="text-white font-bold text-sm mb-1 line-clamp-1">
            {asset.title}
          </h3>
          <span className="text-white font-bold text-lg">{asset.value}</span>
        </div>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-full">
          <Button 
            size="sm" 
            className="bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow-lg text-xs px-3 py-1"
          >
            View
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const CircularAssetShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  // Transform scroll progress to rotation degrees
  const rotation = useTransform(scrollYProgress, [0, 1], [0, 360]);

  return (
    <section ref={containerRef} className="py-32 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Section Header */}
      <div className="container mx-auto px-6 text-center mb-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
        >
          Premium Asset Collection
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
        >
          Scroll to explore our curated selection of high-value tokenized assets
        </motion.p>
      </div>

      {/* Circular Asset Display */}
      <div className="relative h-[600px] w-full flex items-center justify-center">
        {/* Background circle indicator */}
        <div className="absolute w-[700px] h-[350px] border-2 border-dashed border-gray-200 rounded-full opacity-30"></div>
        
        {/* Central focal point */}
        <div className="absolute w-4 h-4 bg-gray-400 rounded-full z-10"></div>
        
        {/* Rotating assets */}
        <motion.div 
          className="relative w-full h-full"
          style={{ rotate: rotation }}
        >
          {featuredAssets.map((asset, index) => (
            <CircularAssetCard
              key={asset.title}
              asset={asset}
              index={index}
              total={featuredAssets.length}
              rotation={0} // Rotation is handled by parent container
            />
          ))}
        </motion.div>
        
        {/* Corner accent - positioned on right side */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
          <div className="w-16 h-32 bg-gradient-to-l from-gray-200 to-transparent rounded-l-full opacity-50"></div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center mt-16"
      >
        <div className="flex items-center justify-center space-x-2 text-gray-500 mb-8">
          <span className="text-sm">Scroll to rotate</span>
          <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
        
        <Button 
          size="lg" 
          className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Explore All Assets
        </Button>
      </motion.div>
    </section>
  );
};

export default CircularAssetShowcase;
