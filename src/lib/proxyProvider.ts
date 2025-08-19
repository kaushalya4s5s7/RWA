// Custom Web3 provider that uses the proxy API to avoid CORS issues
import { ethers } from 'ethers';

class ProxyJsonRpcProvider extends ethers.providers.JsonRpcProvider {
  private proxyUrl: string;

  constructor(proxyUrl: string, network?: ethers.providers.Networkish) {
    // Use a dummy URL for the parent constructor
    super('https://onlyassets-server.onrender.com', network);
    this.proxyUrl = proxyUrl;
  }

  async send(method: string, params: Array<any>): Promise<any> {
    const body = {
      method: method,
      params: params,
      id: this.generateId(),
      jsonrpc: "2.0"
    };

    console.log(`🔗 Sending RPC request via proxy: ${method}`, params);

    try {
      const response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        const error = new Error(result.error.message || 'Unknown RPC error');
        (error as any).code = result.error.code;
        (error as any).data = result.error.data;
        throw error;
      }

      console.log(`✅ RPC response received: ${method}`, result.result);
      return result.result;
      
    } catch (error) {
      console.error(`❌ RPC request failed: ${method}`, error);
      throw error;
    }
  }

  private generateId(): number {
    return Math.floor(Math.random() * 1000000);
  }
}

// Create provider instance for Hedera testnet via proxy
export const createProxyProvider = (networkName: 'testnet' | 'mainnet' = 'testnet') => {
  const proxyUrl = `/api/hashio-proxy`;
  
  // Hedera network configuration
  const network = {
    name: `hedera-${networkName}`,
    chainId: networkName === 'testnet' ? 296 : 295,
    ensAddress: undefined,
  };

  const provider = new ProxyJsonRpcProvider(proxyUrl, network);
  
  console.log(`🌐 Created proxy provider for Hedera ${networkName}:`, {
    proxyUrl,
    chainId: network.chainId,
    name: network.name
  });

  return provider;
};

// Export the provider instance
export const hederaProxyProvider = createProxyProvider();

// Helper function to create contract instance with proxy provider
export const createContractWithProxy = (
  address: string, 
  abi: any[], 
  signerOrProvider?: ethers.Signer | ethers.providers.Provider
) => {
  const provider = signerOrProvider || hederaProxyProvider;
  return new ethers.Contract(address, abi, provider);
};

export default ProxyJsonRpcProvider;
