import React from "react";
import { cn } from "@/lib/utils";
import { Spotlight } from "./ui/Spotlight";

const AboutRwa: React.FC = () => {
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-black/[0.96] antialiased">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 [background-size:40px_40px] select-none",
          "[background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]",
        )}
      />

      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl p-4 py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="bg-opacity-50 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-7xl">
            Real-World Assets on the Blockchain
          </h2>
          
          <p className="text-xl text-neutral-300 mb-6">
            Real-World Assets (RWAs) represent the next frontier in blockchain technology, 
            bringing the stability of traditional finance to the innovation of decentralized networks.
          </p>
          
          <p className="text-lg text-neutral-300 mb-8">
            By tokenizing physical and financial assets like real estate, commodities, and revenue streams, 
            we create new investment opportunities that were previously inaccessible to most investors.
          </p>
          
          <p className="text-lg text-neutral-300">
            Our marketplace connects asset owners seeking liquidity with investors looking for stable, 
            asset-backed returns — all secured by the transparency and immutability of blockchain technology.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutRwa;
