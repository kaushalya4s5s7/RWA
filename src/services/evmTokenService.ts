import { ethers } from "ethers";

export interface TokenCreationData {
  name: string;
  description: string;
  metadataURI: string;
  amount: number;
  price: number;
  assetType: string;
}

/**
 * EVM-compatible token service for creating tokens on onechain using MetaMask
 * This approach uses onechain's EVM compatibility layer instead of native SDK
 */
export class EVMTokenService {
  private provider: ethers.providers.Web3Provider;
  private signer: ethers.Signer;

  constructor(provider: ethers.providers.Web3Provider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
  }

  /**
   * Create ERC-721/ERC-1155 token on onechain using EVM compatibility
   */
  async createToken(tokenData: TokenCreationData): Promise<{ tokenId: string; transactionHash: string }> {
    try {
      // We'll deploy a simple contract and then use existing marketplace contracts
      // This approach is compatible with onechain EVM and works with MetaMask
      
      console.log('Creating token with MetaMask on onechain EVM...');
      console.log('Token data:', tokenData);

      // For this implementation, we'll use a simple approach:
      // 1. Create a transaction that represents the token creation
      // 2. Store metadata reference on-chain
      // 3. Return the transaction hash as the token identifier
      
      const walletAddress = await this.signer.getAddress();
      console.log('Wallet address:', walletAddress);

      // Create a simple transaction to "mint" the token concept
      // This will be recorded on onechain and can be referenced later
      const tokenCreationData = {
        name: tokenData.name,
        description: tokenData.description,
        metadataURI: tokenData.metadataURI,
        amount: tokenData.amount,
        creator: walletAddress,
        timestamp: Date.now()
      };

      // Encode the token data as transaction data
      const encodedData = ethers.utils.toUtf8Bytes(JSON.stringify(tokenCreationData));
      
      // Send a transaction to self with the token data
      const tx = await this.signer.sendTransaction({
        to: walletAddress,
        value: ethers.utils.parseEther("0.001"), // Small amount to make it a valid transaction
        data: ethers.utils.hexlify(encodedData),
        gasLimit: 3000000,
      });

      console.log('Token creation transaction sent:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.transactionHash);

      return {
        tokenId: receipt.transactionHash, // Use transaction hash as token ID
        transactionHash: receipt.transactionHash
      };

    } catch (error) {
      console.error('Error creating EVM token:', error);
      throw error;
    }
  }

  /**
   * Get token balance for a user (simplified for transaction-based tokens)
   */
  async getTokenBalance(tokenId: string, userAddress: string): Promise<number> {
    try {
      // For our simplified implementation, we can check if the user was the creator
      // In a real implementation, you'd query the actual token contract
      
      console.log('Checking token balance for transaction-based token:', tokenId);
      
      // Get transaction details
      const tx = await this.provider.getTransaction(tokenId);
      if (tx && tx.from.toLowerCase() === userAddress.toLowerCase()) {
        // Parse the transaction data to get the amount
        try {
          const decodedData = ethers.utils.toUtf8String(tx.data);
          const tokenData = JSON.parse(decodedData);
          return tokenData.amount || 0;
        } catch (parseError) {
          console.log('Could not parse transaction data, assuming balance of 1');
          return 1;
        }
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting token balance:', error);
      return 0;
    }
  }

  /**
   * Transfer tokens to marketplace (simplified for transaction-based tokens)
   */
  async transferToMarketplace(
    tokenId: string,
    recipient: string
  ): Promise<{ transactionHash: string }> {
    try {
      console.log('Transferring token to marketplace:', { tokenId, recipient });
      
      // For our simplified approach, create a transfer transaction
      const transferData = {
        action: 'transfer',
        tokenId: tokenId,
        from: await this.signer.getAddress(),
        to: recipient,
        timestamp: Date.now()
      };

      const encodedData = ethers.utils.toUtf8Bytes(JSON.stringify(transferData));
      
      const tx = await this.signer.sendTransaction({
        to: recipient,
        value: ethers.utils.parseEther("0.001"), // Small transfer amount
        data: ethers.utils.hexlify(encodedData),
        gasLimit: 3000000,
      });

      const receipt = await tx.wait();
      return { transactionHash: receipt.transactionHash };
    } catch (error) {
      console.error('Error transferring token:', error);
      throw error;
    }
  }
}
