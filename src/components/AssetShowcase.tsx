"use client";
import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";

// Optimized asset collection with smaller, faster-loading images
const featuredAssets = [
  {
    title: "Manhattan Penthouse",
    category: "Real Estate",
    value: "$2.4M",
    thumbnail: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    title: "Gold Reserve",
    category: "Commodities", 
    value: "$850K",
    thumbnail: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    title: "Tech Portfolio",
    category: "Invoices",
    value: "$125K", 
    thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    title: "Glass Estate",
    category: "Real Estate",
    value: "$1.8M",
    thumbnail: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    title: "Tesla Shares",
    category: "Vehicles",
    value: "$135K",
    thumbnail: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    title: "Art Collection",
    category: "Art",
    value: "$2.1M",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    title: "Platinum Vault",
    category: "Commodities",
    value: "$1.2M",
    thumbnail: "https://images.unsplash.com/photo-1611095973362-4665d8b2f6a5?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    title: "Yacht Shares",
    category: "Vehicles",
    value: "$3.5M",
    thumbnail: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    title: "Diamond Fund",
    category: "Commodities",
    value: "$675K",
    thumbnail: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    title: "Wine Portfolio",
    category: "Collectibles",
    value: "$280K",
    thumbnail: "https://images.unsplash.com/photo-1566995541857-75a8ac7382c5?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    title: "Energy Plant",
    category: "Infrastructure",
    value: "$4.2M",
    thumbnail: "https://images.unsplash.com/photo-1548613053-22087dd8edb8?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    title: "Private Jet",
    category: "Vehicles",
    value: "$2.8M",
    thumbnail: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=200&h=200",
  }
];

// Optimized circular asset card with lazy loading and performance optimizations
const CircularAssetCard = React.memo(({ 
  asset, 
  index, 
  total,
  scrollProgress 
}: { 
  asset: typeof featuredAssets[0];
  index: number;
  total: number;
  scrollProgress: any;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasStartedLoading, setHasStartedLoading] = useState(false);
  
  // Calculate position in circle that starts from top-left and moves to center
  const angle = (2 * Math.PI / total) * index;
  
  // Circle starts small in top-left (20% from top, 10% from left) and moves to center while growing
  const circleX = useTransform(scrollProgress, [0, 0.5, 1], [10, 30, 50]); // percentage from left
  const circleY = useTransform(scrollProgress, [0, 0.5, 1], [20, 35, 50]); // percentage from top
  const radius = useTransform(scrollProgress, [0, 0.5, 1], [80, 180, 260]); // circle radius
  const cardScale = useTransform(scrollProgress, [0, 0.3, 1], [0.3, 0.7, 1]); // card size
  const rotation = useTransform(scrollProgress, [0, 1], [0, 360]); // rotation
  
  // Calculate individual card position
  const x = useTransform(
    [circleX, radius, rotation],
    ([cx, r, rot]: number[]) => cx + (Math.cos(angle + (rot * Math.PI) / 180) * r)
  );
  
  const y = useTransform(
    [circleY, radius, rotation],
    ([cy, r, rot]: number[]) => cy + (Math.sin(angle + (rot * Math.PI) / 180) * r)
  );

  // Start loading image when component is visible
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setHasStartedLoading(true);
    }, index * 100); // Stagger loading
    
    return () => clearTimeout(timer);
  }, [index]);
  
  return (
    <motion.div
      className="absolute will-change-transform pointer-events-auto"
      style={{
        left: x,
        top: y,
        scale: cardScale,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <motion.div 
        className="relative group cursor-pointer"
        whileHover={{ scale: 1.1, zIndex: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Main card */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-white shadow-lg border-2 border-white group-hover:border-blue-400 transition-all duration-300">
          {/* Loading placeholder */}
          {(!imageLoaded || !hasStartedLoading) && (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Optimized image */}
          {hasStartedLoading && (
            <img
              src={asset.thumbnail}
              alt={asset.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
        
        {/* Hover tooltip */}
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50">
          <div className="font-semibold">{asset.title}</div>
          <div className="text-blue-300">{asset.category}</div>
          <div className="font-bold text-green-400">{asset.value}</div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
        </div>
      </motion.div>
    </motion.div>
  );
});

// Premium Asset Showcase Section - Positioned below hero
const PremiumAssetShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  return (
    <section ref={containerRef} className="relative min-h-screen bg-gradient-to-br from-slate-50 to-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_70%)]"></div>
      
      {/* Section Header */}
      <div className="relative z-10 container mx-auto px-6 pt-20 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Premium Asset
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Collection
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            Discover high-value tokenized assets that move with your scroll. 
            Each asset represents real-world value on the blockchain.
          </p>
        </motion.div>
      </div>

      {/* Dynamic Circular Asset Display */}
      <div className="relative h-[80vh] w-full pointer-events-none">
        {/* Corner Accent */}
        <motion.div 
          className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Animated Assets */}
        {featuredAssets.map((asset, index) => (
          <CircularAssetCard
            key={asset.title}
            asset={asset}
            index={index}
            total={featuredAssets.length}
            scrollProgress={scrollYProgress}
          />
        ))}
        
        {/* Center Indicator */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={{
            scale: useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]),
            opacity: useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0, 1, 1])
          }}
        >
          <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-ping opacity-75"></div>
          </div>
        </motion.div>
      </div>

      {/* Progress Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex items-center justify-center space-x-2 text-gray-500 mb-6">
          <span className="text-sm">Scroll to see assets in motion</span>
          <motion.svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </motion.svg>
        </div>
        
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Explore All Assets
        </Button>
      </motion.div>
    </section>
  );
};

export default PremiumAssetShowcase;
