"use client";
import React, { useId } from "react";
import { VideoText } from "@/components/magicui/video-text";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Secure Tokenization",
    description: "Assets are securely tokenized using blockchain technology, ensuring transparent and immutable ownership records.",
  },
  {
    title: "Fractional Ownership",
    description: "Own a fraction of premium real-world assets that were previously accessible only to institutional investors.",
  },
  {
    title: "Stable Returns",
    description: "Generate consistent returns backed by the performance of tangible assets in the real world.",
  },
  {
    title: "Regulatory Compliance",
    description: "All listed assets comply with relevant regulations and undergo thorough due diligence.",
  },
  {
    title: "Premium Properties",
    description: "Access high-value real estate opportunities in prime locations worldwide.",
  },
  {
    title: "Liquid Investments",
    description: "Trade your asset tokens easily on our secondary marketplace with enhanced liquidity.",
  }
];

const Grid = ({
  pattern,
  size,
}: {
  pattern?: number[][];
  size?: number;
}) => {
  const p = pattern ?? [
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
  ];
  return (
    <div className="pointer-events-none absolute left-1/2 top-0 -ml-20 -mt-2 h-full w-full [mask-image:linear-gradient(white,transparent)]">
      <div className="absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-zinc-900/30 from-zinc-100/30 to-zinc-300/30 dark:to-zinc-900/30 opacity-100">
        <GridPattern
          width={size ?? 20}
          height={size ?? 20}
          x="-12"
          y="4"
          squares={p}
          className="absolute inset-0 h-full w-full mix-blend-overlay dark:fill-white/10 dark:stroke-white/10 stroke-black/10 fill-black/10"
        />
      </div>
    </div>
  );
};

const GridPattern = ({ width, height, x, y, squares, ...props }: any) => {
  const patternId = useId();

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y]: number[]) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}`}
              width={width + 1}
              height={height + 1}
              x={x * width}
              y={y * height}
            />
          ))}
        </svg>
      )}
    </svg>
  );
};

const Features: React.FC = () => {
  return (    <section className="py-8 bg-white flex flex-col">
      {/* Title section with VideoText */}
      <div className="h-[25vh] relative overflow-hidden mb-6">
        <VideoText
          src="/waves.mp4"
          fontSize={4}
          fontWeight={800}
          className="w-full h-full bg-white px-4"
        >
          WHY CHOOSE OUR RWA MARKETPLACE
        </VideoText>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bridging traditional finance with blockchain technology to democratize access to premium real-world assets
          </p>
        </div>
      </div>      {/* New Grid Features Section */}
      <div className="py-4 lg:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="relative bg-gradient-to-b dark:from-neutral-900 from-neutral-100 dark:to-neutral-950 to-white p-8 rounded-3xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <Grid size={20} />
              <p className="text-lg font-bold text-neutral-800 dark:text-white relative z-20">
                {feature.title}
              </p>
              <p className="text-neutral-600 dark:text-neutral-400 mt-4 text-base font-normal relative z-20">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
