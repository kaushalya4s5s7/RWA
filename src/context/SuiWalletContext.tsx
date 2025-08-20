import React, { createContext, useContext, ReactNode } from 'react';
import { 
  ConnectButton, 
  useCurrentAccount, 
  useSignAndExecuteTransaction, 
  useConnectWallet, 
  useWallets,
  useSuiClient 
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';

interface SuiWalletContextType {
  account: any;
  address: string | null;
  isConnected: boolean;
  suiClient: SuiClient;
  signAndExecuteTransaction: any;
  connectWallet: any;
  wallets: any[];
}

const SuiWalletContext = createContext<SuiWalletContextType | undefined>(undefined);

export const useSuiWallet = () => {
  const context = useContext(SuiWalletContext);
  if (!context) {
    throw new Error('useSuiWallet must be used within a SuiWalletProvider');
  }
  return context;
};

interface SuiWalletProviderProps {
  children: ReactNode;
}

export const SuiWalletProvider: React.FC<SuiWalletProviderProps> = ({ children }) => {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { mutate: connectWallet } = useConnectWallet();
  const wallets = useWallets();
  const suiClient = useSuiClient();

  const isConnected = !!account;
  const address = account?.address || null;

  const value = {
    account,
    address,
    isConnected,
    suiClient,
    signAndExecuteTransaction,
    connectWallet,
    wallets,
  };

  return (
    <SuiWalletContext.Provider value={value}>
      {children}
    </SuiWalletContext.Provider>
  );
};

// Export the ConnectButton for easy use
export { ConnectButton };
