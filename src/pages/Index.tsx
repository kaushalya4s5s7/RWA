import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HeroMain from '@/components/HeroMain';
import AboutRwa from '@/components/AboutRwa';
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import Features from '@/components/Features';
import Assets from '@/components/Assets';
import TextCarousel from '@/components/textCarousel';
import TabsSection from '@/components/TabsSection';
import Footer from '@/components/Footer';
import AssetShowcase from '@/components/Hero_New';

const Index: React.FC = () => {  return (
    <>
    <SmoothCursor />
    <div className="min-h-screen flex flex-col">
      <Header/>
      <main className="flex-1">
        <HeroMain />
        <AssetShowcase />
        <Features />
        <Assets />
        <TextCarousel />
        <AboutRwa />
      </main>
      <Footer />
    </div>
    </>
  );
};

export default Index;
