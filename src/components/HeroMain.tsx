"use client";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Lens } from "@/components/magicui/lens";

const Hero: React.FC = () => {
  const navigate = useNavigate();

  const handleExploreMarketplace = () => {
    navigate('/marketplace');
  };

  const handleLearnMore = () => {
    navigate('/about');
  };
  
  return (
    <section className="relative overflow-hidden h-screen flex items-center pl-8">
      {/* Background image with Lens effect */}
      <div className="absolute inset-0 z-0">
        <Lens
          zoomFactor={1.5}
          lensSize={170}
          isStatic={false}
          ariaLabel="Explore City View"
        >
          <img 
            src="https://images.pexels.com/photos/5845712/pexels-photo-5845712.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Manhattan Skyline" 
            className="w-full h-full object-cover"
          />
        </Lens>
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/30 pointer-events-none" />
      </div>
      
      <div className="relative z-10 max-w-2xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 drop-shadow-2xl">
          Tokenized Real-World Assets Marketplace
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8 drop-shadow-lg">
          Invest in high-quality, tokenized real-world assets including prime real estate, 
          commodities, and invoice financing opportunities through our secure blockchain platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            className={cn(
              "bg-blue-500 hover:bg-blue-600 text-white text-lg py-6 px-8"
            )}
            onClick={handleExploreMarketplace}
          >
            Explore Marketplace
          </Button>
          <Button 
            variant="outline" 
            className="border-blue-500 text-blue-400 hover:bg-blue-900/20 text-lg py-6 px-8"
            onClick={handleLearnMore}
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;