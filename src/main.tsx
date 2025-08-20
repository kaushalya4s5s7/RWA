import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import '@mysten/dapp-kit/dist/index.css';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Configure network for OneChain
const { networkConfig } = createNetworkConfig({
  testnet: { url: import.meta.env.VITE_ONELABS_RPC }, // You may need to update this to OneChain RPC
  localnet: { url: getFullnodeUrl('localnet') },
});
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
      <WalletProvider>
        <App />
      </WalletProvider>
    </SuiClientProvider>
  </QueryClientProvider>
);
