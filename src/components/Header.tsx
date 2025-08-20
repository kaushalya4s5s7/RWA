"use client";
import React from "react";
import { FloatingNav } from "./ui/floating-navbar";
import { IconHome, IconMessage, IconUser } from "@tabler/icons-react";

const Header = () => {
  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <IconHome className="h-4 w-4 text-neutral-500 dark:text-white" />
    },
    {
      name: "About",
      link: "/about",
      icon: <IconUser className="h-4 w-4 text-neutral-500 dark:text-white" />
    },
    {
      name: "Tokenize",
      link: "/issuer",
      icon: <IconMessage className="h-4 w-4 text-neutral-500 dark:text-white" />
    }
  ];

  // Only render on home page
  if (window.location.pathname !== '/') {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto">
        <FloatingNav navItems={navItems} />
      </div>
    </nav>
  );
};

export default Header;