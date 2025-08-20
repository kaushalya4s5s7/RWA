"use client";
import React from "react";
import { DraggableCardBody, DraggableCardContainer } from "@/components/ui/draggable-card";
import { TextReveal } from "@/components/magicui/text-reveal";

const assets = [
  {
    title: "Luxury Penthouse",
    description: "Premium residential property in downtown Manhattan",
    price: "$2.5M",
    yield: "8.2% APY",
    image: "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    className: "absolute top-10 left-[20%] rotate-[-5deg] lg:left-[30%]"
  },
  {
    title: "Commercial Complex",
    description: "Multi-tenant office space in Silicon Valley",
    price: "$5.8M",
    yield: "7.5% APY",
    image: "https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    className: "absolute top-40 left-[25%] rotate-[-7deg] lg:left-[35%]"
  },
  {
    title: "Industrial Warehouse",
    description: "Modern logistics facility near major port",
    price: "$3.2M",
    yield: "9.1% APY",
    image: "https://images.pexels.com/photos/236698/pexels-photo-236698.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    className: "absolute top-5 left-[40%] rotate-[8deg] lg:left-[45%]"
  },
  {
    title: "Retail Plaza",
    description: "Prime location shopping center",
    price: "$4.1M",
    yield: "8.7% APY",
    image: "https://images.pexels.com/photos/806880/pexels-photo-806880.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    className: "absolute top-32 left-[45%] rotate-[10deg] lg:left-[50%]"
  },
  {
    title: "Smart Apartments",
    description: "Tech-enabled residential complex",
    price: "$6.3M",
    yield: "7.8% APY",
    image: "https://images.pexels.com/photos/323705/pexels-photo-323705.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    className: "absolute top-20 right-[35%] rotate-[2deg]"
  },
  {
    title: "Hotel Property",
    description: "Beachfront luxury resort",
    price: "$8.5M",
    yield: "8.9% APY",
    image: "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    className: "absolute top-24 left-[35%] rotate-[-7deg] lg:left-[40%]"
  }
];

const Assets: React.FC = () => {
  return (    <section className="relative bg-white">
      <div className="mx-auto grid grid-cols-1 lg:grid-cols-2">
        {/* Text Reveal Section */}
        <div className="relative z-10">
          <TextReveal>
             we transform physical real estate into digital tokens, making premium properties accessible to a broader range of investors. 
          </TextReveal>
        </div>

        {/* Draggable Cards Section */}        <div className="relative">
          <div className="sticky top-0 h-screen">
            <DraggableCardContainer className="relative flex h-full w-full items-center justify-center overflow-hidden">
              <p className="absolute top-1/2 mx-auto max-w-xl -translate-y-3/4 text-center text-2xl md:text-3xl font-black text-gray-300/80 pointer-events-none">
                INVEST AND EARN HELL LOT
              </p>
              
              {assets.map((asset) => (
                <DraggableCardBody key={asset.title} className={asset.className}>
                  <div className="group relative">
                    <img
                      src={asset.image}
                      alt={asset.title}
                      className="pointer-events-none relative z-10 h-64 w-64 md:h-80 md:w-80 object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex flex-col justify-center items-center text-white p-6">
                      <h3 className="text-2xl font-bold mb-2">{asset.title}</h3>
                      <p className="text-gray-200 mb-4 text-center">{asset.description}</p>
                      <div className="flex gap-4">
                        <span className="bg-blue-500/20 px-4 py-2 rounded-full text-blue-200">
                          {asset.price}
                        </span>
                        <span className="bg-green-500/20 px-4 py-2 rounded-full text-green-200">
                          {asset.yield}
                        </span>
                      </div>
                    </div>
                  </div>
                </DraggableCardBody>
              ))}
            </DraggableCardContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Assets;