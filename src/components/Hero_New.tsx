"use client";
import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "./ui/button";

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

// Fixed circular motion - individual assets rotate around center
const CircularAssetCard = React.memo(({ 
  asset, 
  index, 
  total, 
  rotation 
}: { 
  asset: typeof featuredAssets[0];
  index: number;
  total: number;
  rotation: any; // MotionValue from framer-motion
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Use useTransform to convert MotionValue to number and calculate position
  const angle = useTransform(rotation, (latest: number) => 
    (2 * Math.PI / total) * index + (latest * Math.PI) / 180
  );
  const radius = 160; // Fixed distance from center
  
  // Calculate position relative to container center using MotionValue
  const x = useTransform(angle, (latest: number) => Math.cos(latest) * radius);
  const y = useTransform(angle, (latest: number) => Math.sin(latest) * radius);
  
  return (
    <motion.div
      className="absolute"
      style={{
        left: '50%',
        top: '50%',
        x: useTransform(x, (latest: number) => latest - 32), // Offset by half card size
        y: useTransform(y, (latest: number) => latest - 32),
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      whileHover={{ scale: 1.15, zIndex: 10 }}
    >
      <div className="group relative">
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:border-blue-400">
          {!imageLoaded && (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={asset.thumbnail}
            alt={asset.title}
            className={`w-full h-full object-cover transition-all duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        </div>
        
        {/* Enhanced hover tooltip */}
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white text-xs rounded-xl p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 backdrop-blur-sm">
          <div className="font-semibold text-center mb-1">{asset.title}</div>
          <div className="text-blue-300 text-xs mb-1">{asset.category}</div>
          <div className="font-bold text-green-400">{asset.value}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
        </div>
      </div>
    </motion.div>
  );
});

const PremiumAssetShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  // Smooth rotation based on scroll - assets orbit around fixed center
  const rotation = useTransform(scrollYProgress, [0, 1], [0, 360]);

  return (
    <section ref={containerRef} className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden relative">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.05),transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(147,51,234,0.05),transparent_60%)]"></div>
      
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[600px]">
          
          {/* Left Side - Fixed Circular Asset Display */}
          <div className="relative flex items-center justify-center h-[500px]">
            {/* Subtle background circle - shows the orbit path */}
            <div className="absolute w-[360px] h-[360px] border border-dashed border-gray-200/50 rounded-full"></div>
            
            {/* Central focal point - fixed center */}
            <div className="absolute w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full z-20 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-ping opacity-30"></div>
            </div>
            
            {/* Fixed container for orbiting assets */}
            <div className="relative w-full h-full">
              {featuredAssets.map((asset, index) => (
                <CircularAssetCard
                  key={asset.title}
                  asset={asset}
                  index={index}
                  total={featuredAssets.length}
                  rotation={rotation}
                />
              ))}
            </div>
          </div>

          {/* Right Side - Premium Content Area */}
          <div className="space-y-8">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                ✨ Premium Assets Portfolio
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Real-World Assets
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  Tokenized & Verified
                </span>
              </h2>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Experience the future of asset ownership. Each token represents verified, 
                high-value real-world assets backed by blockchain technology and smart contracts.
              </p>
            </motion.div>

            {/* Feature Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 gap-6"
            >
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="text-2xl font-bold text-gray-900 mb-1">$12.5M+</div>
                <div className="text-sm text-gray-600">Total Asset Value</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="text-2xl font-bold text-gray-900 mb-1">98.7%</div>
                <div className="text-sm text-gray-600">Verification Rate</div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Explore Portfolio
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-gray-300 hover:border-blue-300 hover:bg-blue-50 px-8 py-3 text-base font-semibold rounded-xl transition-all duration-300"
              >
                Learn More
              </Button>
            </motion.div>

            {/* Floating Elements */}
            <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-xl opacity-40 animate-pulse"></div>
            <div className="absolute bottom-20 right-5 w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-lg opacity-30 animate-bounce"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumAssetShowcase;
