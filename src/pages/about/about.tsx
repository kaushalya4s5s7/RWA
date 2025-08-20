"use client";
import React from "react";
import { motion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { IconHome, IconMessage, IconUser } from "@tabler/icons-react";

const About = () => {
  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <IconHome className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "About",
      link: "/about",
      icon: <IconUser className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Tokenize",
      link: "/issuer",
      icon: <IconMessage className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <FloatingNav navItems={navItems} />
        </div>
      </nav>

      <div className="h-screen">
        <LampContainer className="h-screen">
          <motion.h1
            initial={{ opacity: 0.5, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="mt-40 text-center text-4xl font-medium tracking-tight text-white md:text-7xl"
          ></motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-8 max-w-3xl text-center text-white/80"
          >
            <p className="mb-4 text-lg">
              Discover a revolutionary marketplace where traditional assets meet
              blockchain technology. Our platform enables the seamless trading of
              tokenized real-world assets, bringing unprecedented liquidity and
              accessibility to previously illiquid investments.
            </p>
          </motion.div>
        </LampContainer>
      </div>

      <div className="py-32 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-24"
          >
            <h2 className="text-4xl font-bold text-black mb-12 text-center">
              Understanding Our RWA Marketplace
            </h2>
            <div className="space-y-12 text-black/80">
              <div>
                <h3 className="text-2xl font-semibold text-black mb-4">
                  Tokenization Process
                </h3>
                <p className="text-lg leading-relaxed">
                  Our platform transforms traditional real-world assets into digital
                  tokens through a secure and compliant process. Each token
                  represents fractional ownership of the underlying asset, whether
                  it's real estate, art, commodities, or other valuable assets.
                  This transformation is backed by legal frameworks and smart
                  contracts, ensuring transparency and authenticity.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-black mb-4">
                  Market Benefits
                </h3>
                <p className="text-lg leading-relaxed">
                  By tokenizing real-world assets, we unlock unprecedented
                  liquidity and accessibility. Investors can trade fractional
                  ownership 24/7, diversify their portfolios with lower capital
                  requirements, and access previously exclusive investment
                  opportunities. Our marketplace reduces barriers to entry and
                  increases market efficiency.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-black mb-4">
                  Technology & Security
                </h3>
                <p className="text-lg leading-relaxed mb-4">
                  Our platform leverages advanced blockchain technology to ensure
                  security and reliability:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>Immutable ownership records and transaction history</li>
                  <li>Smart contracts for automated compliance and governance</li>
                  <li>Real-time settlement and reduced counterparty risk</li>
                  <li>Enhanced security through cryptographic protocols</li>
                  <li>Transparent pricing and market data</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-24"
          >
            <h2 className="text-4xl font-bold text-black mb-12 text-center">
              The Theory Behind RWA Tokenization
            </h2>
            <div className="space-y-12 text-black/80">
              <div>
                <h3 className="text-2xl font-semibold text-black mb-4">
                  Asset Fractionalization
                </h3>
                <p className="text-lg leading-relaxed">
                  Our platform utilizes advanced smart contract technology to
                  divide valuable assets into smaller, tradeable units. This
                  process democratizes access to premium investments while
                  maintaining the asset's integrity and legal structure. Each token
                  is backed by real-world value and regulatory compliance.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-black mb-4">
                  Market Mechanics
                </h3>
                <p className="text-lg leading-relaxed">
                  We've implemented sophisticated price discovery mechanisms and
                  automated market-making algorithms to ensure efficient trading.
                  Our order matching system provides deep liquidity pools and
                  minimal slippage, while maintaining transparency and fair pricing
                  for all participants.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-black mb-4">
                  Regulatory Framework
                </h3>
                <p className="text-lg leading-relaxed">
                  Our platform operates within established regulatory frameworks,
                  ensuring compliance with securities laws and KYC/AML requirements.
                  We maintain strong relationships with regulatory bodies and
                  implement robust compliance procedures to protect investor
                  interests.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-black mb-4">
                  Platform Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xl font-semibold text-black mb-4">
                      Advanced Trading Features
                    </h4>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                      <li>Real-time price feeds and market data</li>
                      <li>Advanced order types and execution algorithms</li>
                      <li>Cross-chain interoperability</li>
                      <li>Automated portfolio rebalancing</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-black mb-4">
                      Risk Management
                    </h4>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                      <li>Multi-signature security protocols</li>
                      <li>Insurance coverage for listed assets</li>
                      <li>Regular audits and compliance checks</li>
                      <li>Advanced fraud detection systems</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;