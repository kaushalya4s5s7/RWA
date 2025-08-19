import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('No wallet found. Please install MetaMask.');
      }

      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      await web3Provider.send("eth_requestAccounts", []);
      
      const web3Signer = web3Provider.getSigner();
      const walletAddress = await web3Signer.getAddress();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAddress(walletAddress);
      setIsConnected(true);

      // Store connection state
      localStorage.setItem('walletConnected', 'true');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setIsConnected(false);
    localStorage.removeItem('walletConnected');
  };

  // Auto-connect on load if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      const wasConnected = localStorage.getItem('walletConnected');
      if (wasConnected && window.ethereum) {
        try {
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await web3Provider.listAccounts();
          
          if (accounts.length > 0) {
            const web3Signer = web3Provider.getSigner();
            const walletAddress = await web3Signer.getAddress();

            setProvider(web3Provider);
            setSigner(web3Signer);
            setAddress(walletAddress);
            setIsConnected(true);
          }
        } catch (error) {
          console.error('Auto-connect failed:', error);
          localStorage.removeItem('walletConnected');
        }
      }
    };

    autoConnect();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== address) {
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [address]);

  const value: WalletContextType = {
    address,
    isConnected,
    provider,
    signer,
    connectWallet,
    disconnectWallet,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
