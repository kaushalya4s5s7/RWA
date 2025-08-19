// Temporary mock imports until SDK is properly installed
// This file provides type-safe interfaces while we migrate

export interface ConnectButtonProps {
  connectText?: string;
  connectedText?: string;
}

export const ConnectButton: React.FC<ConnectButtonProps> = ({ connectText = "Connect Wallet", connectedText = "Connected" }) => {
  return (
    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      {connectText}
    </button>
  );
};

export const useCurrentAccount = () => {
  return null; // Mock implementation
};

export const useSignAndExecuteTransaction = () => {
  return {
    mutate: (params: any, callbacks?: any) => {
      console.log('Mock signAndExecuteTransaction called', params);
      if (callbacks?.onSuccess) {
        callbacks.onSuccess({ success: true });
      }
    }
  };
};

export const useConnectWallet = () => {
  return {
    mutate: (walletName?: string) => {
      console.log('Mock connectWallet called', walletName);
    }
  };
};

export const useWallets = () => {
  return []; // Mock implementation
};

export const useSuiClient = () => {
  return {
    getOwnedObjects: async (params: any) => ({ data: [] }),
    getObject: async (params: any) => ({ data: null }),
  };
};

export const createNetworkConfig = (networks: any) => {
  return { networkConfig: networks };
};

export const SuiClientProvider: React.FC<{ children: React.ReactNode; networks: any; defaultNetwork: string }> = ({ children }) => {
  return <>{children}</>;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const getFullnodeUrl = (network: string) => {
  const urls = {
    mainnet: 'https://fullnode.mainnet.sui.io',
    testnet: 'https://fullnode.testnet.sui.io',
    localnet: 'http://localhost:9000',
  };
  return urls[network as keyof typeof urls] || urls.testnet;
};
