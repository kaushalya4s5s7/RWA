"use client";
import React from "react";
import { HeroParallax } from "./ui/hero-parallax";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const products = [
	{
		title: "Manhattan Luxury Penthouse",
		link: "#",
		thumbnail:
			"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80",
	},
	{
		title: "Invoice Batch #2024-05",
		link: "#",
		thumbnail:
			"https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg?auto=compress&cs=tinysrgb&w=600",
	},
	{
		title: "Gold Bullion Reserve",
		link: "#",
		thumbnail:
			"https://images.pexels.com/photos/8442330/pexels-photo-8442330.jpeg?auto=compress&cs=tinysrgb&w=600",
	},
	{
		title: "Modern Glass Estate",
		link: "#",
		thumbnail:
			"https://images.pexels.com/photos/7926955/pexels-photo-7926955.jpeg?auto=compress&cs=tinysrgb&w=600",
	},
	{
		title: "Historic District Residence",
		link: "#",
		thumbnail:
			"https://images.pexels.com/photos/3570244/pexels-photo-3570244.jpeg?auto=compress&cs=tinysrgb&w=600",
	},
	{
		title: "Smart City Complex",
		link: "#",
		thumbnail:
			"https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80",
	},
	{
		title: "Blockchain Towers",
		link: "#",
		thumbnail:
			"https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80",
	},
	{
		title: "Digital Asset Hub",
		link: "#",
		thumbnail:
			"https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80",
	},
	{
		title: "Token Valley Residence",
		link: "#",
		thumbnail:
			"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80",
	},
	{
		title: "Web3 Living Space",
		link: "#",
		thumbnail:
			"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80",
	},
	{
		title: "Crypto Heights",
		link: "#",
		thumbnail:
			"https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80",
	},
	{
		title: "DeFi District",
		link: "#",
		thumbnail:
			"https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80",
	},
	{
		title: "NFT Nexus",
		link: "#",
		thumbnail:
			"https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80",
	},
	{
		title: "Metaverse Manor",
		link: "#",
		thumbnail:
			"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80",
	},
	{
		title: "Blockchain Boulevard",
		link: "#",
		thumbnail:
			"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80",
	},
];

const Hero: React.FC = () => {
	return (
		<div className="relative">
			<div className="relative">
				<HeroParallax products={products} />
				<div className="absolute inset-0 " />
			</div>

			<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
				<div className="max-w-2xl text-center">
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-black mb-6">
						Tokenized Real-World Assets Marketplace
					</h1>
					<p className="text-lg md:text-xl text-gray-300 mb-8">
						Invest in high-quality, tokenized real-world assets including prime
						real estate, commodities, and invoice financing opportunities through
						our secure blockchain platform.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button
							className={cn(
								"bg-blue-500 hover:bg-blue-600 text-white text-lg py-6 px-8"
							)}
						>
							Explore Marketplace
						</Button>
						<Button
							variant="outline"
							className="border-blue-500 text-blue-400 hover:bg-blue-900/20 text-lg py-6 px-8"
						>
							Learn More
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Hero;
