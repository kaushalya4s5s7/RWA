// OneChain Service - Replaces Hedera functionality using Sui SDK
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';

// OneChain Contract Package IDs (from our successful deployments)
export // OneChain contract addresses and IDs
const ONECHAIN_CONTRACTS = {
  // Core package IDs - updated to match successful CLI calls
  ADMIN: '0xca67e096a90cd0efbeb7255346be54ab7707b149882475c447daae6caef1d5af',
  ISSUER_REGISTRY: '0xe460db5069b62b397782c4f638911d1ae852d5c154ef3968be52e53d3179c2af',
  MARKETPLACE: '0x346a89f2b25089791f7d909ac5fdc52e80ad92ff26f929ba2c541269b5e21312',
  RWA_ASSET: '0xa535ba1ca80032203a344533fbffe4d9a9f2359322ef205d476ca8d0c710e8ca',
   ISSUER_REGISTRY_OBJECT : '0x6c858122a388ebfaf088b1ba78293b74d1d634b1ea40d6e97c47bed32d96f622',
  // Core object IDs
  MARKETPLACE_OBJECT: '0x3333e19caa3cb65c719c5abb69d6b836b88c57729e5decdcad0e51feaaef8b16',
  
  // OneChain framework package ID - corrected for OneChain
  ONE_FRAMEWORK: '0x2', // OneChain framework package ID
  
  // Try multiple OCT coin type variations
  OCT_COIN_TYPE: '0x2::oct::OCT', // Standard format
  OCT_COIN_TYPE_ALT1: '0x1::oct::OCT', // Alternative package
  OCT_COIN_TYPE_ALT2: '0x0::oct::OCT', // Alternative package
  OCT_COIN_TYPE_ALT3: 'oct::OCT', // Without package prefix
  
  OCT_COIN_STRUCT: '0x2::coin::Coin<0x2::oct::OCT>', // Full OCT coin struct type
  OCT_COIN_STRUCT_ALT1: '0x2::coin::Coin<0x1::oct::OCT>',
  OCT_COIN_STRUCT_ALT2: '0x2::coin::Coin<0x0::oct::OCT>',
  
  // Also check for SUI gas coins as backup
  SUI_COIN_TYPE: '0x2::sui::SUI',
  SUI_COIN_STRUCT: '0x2::coin::Coin<0x2::sui::SUI>'
};

// Debug export to verify package IDs are loaded correctly
console.log('🔧 OneChain Service Loaded with Package IDs:', ONECHAIN_CONTRACTS);

export interface TokenCreationData {
  name: string;
  description: string;
  metadataURI: string;
  amount: number;
  price: number;
  assetType: string;
}

export interface OneChainConfig {
  network: 'testnet' | 'mainnet';
  rpcUrl?: string;
}

export class OneChainService {
  private suiClient: SuiClient;
  private config: OneChainConfig;

  constructor(suiClient: SuiClient, config: OneChainConfig = { network: 'testnet' }) {
    this.suiClient = suiClient;
    this.config = config;
  }

  /**
   * Create RWA NFT on OneChain
   */
  async createNFT(
    data: TokenCreationData,
    signerAddress: string,
    signAndExecuteTransaction: any,
    issuerCapId?: string,
    issuerRegistryId?: string
  ): Promise<{ success: boolean; objectId?: string; error?: string }> {
    try {
      // Default object IDs if not provided
      const defaultIssuerCapId = issuerCapId || '0x233290230d46ecc0985e073a1c17604bd2a0dcd33010a0cbc5cde49abd6da4b6';
      const defaultRegistryId = issuerRegistryId || '0x63e4eabad8715cb099d6a24084af925a51a6fb0f34e45cdc2f504c18f677a34e';
      
      const tx = new Transaction();
      
      // Set gas budget to match successful CLI calls
      tx.setGasBudget(100000000); // 100M MIST = 0.1 SUI
      
      // Get asset type index from string
      const assetTypeIndex = this.getAssetTypeIndex(data.assetType);
      
      // Call the mint_asset_nft function
      tx.moveCall({
        target: `${ONECHAIN_CONTRACTS.RWA_ASSET}::rwaasset::mint_asset_nft`,
        arguments: [
          tx.object(defaultIssuerCapId), // IssuerCap reference
          tx.pure.string(data.metadataURI), // metadata_uri
          tx.pure.u8(assetTypeIndex), // asset_type_index
          tx.pure.u64(data.price * 100), // valuation (convert to cents)
          tx.pure.bool(false), // has_maturity
          tx.pure.u64(0), // maturity (not used if has_maturity is false)
          tx.pure.bool(false), // has_apy
          tx.pure.u64(0), // apy (not used if has_apy is false)
          tx.object(defaultRegistryId), // IssuerRegistry reference
        ],
      });

      // Debug: Log the transaction structure before signing
      console.log('📋 NFT Transaction before signing:', JSON.stringify(tx, null, 2));
      console.log('⛽ Gas budget set to:', 100000000);

      return new Promise((resolve) => {
        signAndExecuteTransaction(
          { transaction: tx },
          {
            onSuccess: (result: any) => {
              console.log('✅ NFT created successfully!', result);
              
              // Extract the created object ID from the result
              const createdObjects = result.effects?.created || [];
              const nftObject = createdObjects.find((obj: any) => 
                obj.owner && typeof obj.owner === 'object' && 'AddressOwner' in obj.owner
              );
              
              resolve({
                success: true,
                objectId: nftObject?.reference?.objectId,
              });
            },
            onError: (error: any) => {
              console.error('Error creating NFT:', error);
              resolve({
                success: false,
                error: error.message || 'Failed to create NFT',
              });
            },
          }
        );
      });
    } catch (error: any) {
      console.error('Error creating NFT:', error);
      return {
        success: false,
        error: error.message || 'Failed to create NFT',
      };
    }
  }

  /**
   * Create RWA FT (Fungible Token) on OneChain
   */
  async createFT(
    data: TokenCreationData,
    signerAddress: string,
    signAndExecuteTransaction: any,
    issuerCapId?: string,
    issuerRegistryId?: string
  ): Promise<{ success: boolean; objectId?: string; error?: string }> {
    try {
      // Debug logging
      console.log('🎯 Creating FT with package:', ONECHAIN_CONTRACTS.RWA_ASSET);
      console.log('📦 Full target:', `${ONECHAIN_CONTRACTS.RWA_ASSET}::rwaasset::mint_asset_ft`);
      
      // Default object IDs if not provided
      const defaultIssuerCapId = issuerCapId || '0x233290230d46ecc0985e073a1c17604bd2a0dcd33010a0cbc5cde49abd6da4b6';
      const defaultRegistryId = issuerRegistryId || '0x63e4eabad8715cb099d6a24084af925a51a6fb0f34e45cdc2f504c18f677a34e';
      
      const tx = new Transaction();
      
      // Set gas budget to match successful CLI calls
      tx.setGasBudget(100000000); // 100M MIST = 0.1 SUI
      
      // Get asset type index from string
      const assetTypeIndex = this.getAssetTypeIndex(data.assetType);
      
      // Call the mint_asset_ft function
      tx.moveCall({
        target: `${ONECHAIN_CONTRACTS.RWA_ASSET}::rwaasset::mint_asset_ft`,
        arguments: [
          tx.object(defaultIssuerCapId), // IssuerCap reference
          tx.pure.string(data.metadataURI), // metadata_uri
          tx.pure.u8(assetTypeIndex), // asset_type_index
          tx.pure.u64(data.amount), // total_supply
          tx.object(defaultRegistryId), // IssuerRegistry reference
        ],
      });

      // Debug: Log the transaction structure before signing
      console.log('📋 Transaction before signing:', JSON.stringify(tx, null, 2));
      console.log('⛽ Gas budget set to:', 100000000);

      return new Promise((resolve) => {
        signAndExecuteTransaction(
          { transaction: tx },
          {
            onSuccess: (result: any) => {
              console.log('✅ FT created successfully!', result);
              
              // Extract the created object ID from the result
              const createdObjects = result.effects?.created || [];
              const ftObject = createdObjects.find((obj: any) => 
                obj.owner && typeof obj.owner === 'object' && 'AddressOwner' in obj.owner
              );
              
              resolve({
                success: true,
                objectId: ftObject?.reference?.objectId,
              });
            },
            onError: (error: any) => {
              console.error('Error creating FT:', error);
              resolve({
                success: false,
                error: error.message || 'Failed to create FT',
              });
            },
          }
        );
      });
    } catch (error: any) {
      console.error('Error creating FT:', error);
      return {
        success: false,
        error: error.message || 'Failed to create FT',
      };
    }
  }

  /**
   * List asset for sale in marketplace  
   */
  async listAsset(
    tokenId: string,
    price: number,
    sellerAddress: string,
    signAndExecuteTransaction: any,
    issuerRegistryId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const tx = new Transaction();
      
      // Set gas budget to match successful CLI calls
      tx.setGasBudget(100000000); // 100M MIST = 0.1 SUI
      
      // Default issuer registry if not provided
      const defaultRegistryId = issuerRegistryId || '0x63e4eabad8715cb099d6a24084af925a51a6fb0f34e45cdc2f504c18f677a34e';
      
      // Call the list_asset_nft function with exact CLI structure
      tx.moveCall({
        target: `${ONECHAIN_CONTRACTS.MARKETPLACE}::marketplace::list_asset_nft`,
        arguments: [
          tx.object(ONECHAIN_CONTRACTS.MARKETPLACE_OBJECT), // marketplace object
          tx.object(defaultRegistryId), // issuer registry
          tx.object(tokenId), // asset NFT object (will be transferred to escrow)
          tx.pure.u64(price), // price in OCT base units
          tx.object('0x6'), // clock object (OneChain system clock)
        ],
      });

      return new Promise((resolve) => {
        signAndExecuteTransaction(
          { transaction: tx },
          {
            onSuccess: (result: any) => {
              console.log('✅ Asset listed successfully for sale with OCT pricing!', result);
              resolve({ success: true });
            },
            onError: (error: any) => {
              console.error('Error listing asset with OCT:', error);
              resolve({
                success: false,
                error: error.message || 'Failed to list asset with OCT',
              });
            },
          }
        );
      });
    } catch (error: any) {
      console.error('Error listing asset with OCT:', error);
      return {
        success: false,
        error: error.message || 'Failed to list asset with OCT',
      };
    }
  }

  /**
   * Buy asset from marketplace (legacy function - use purchaseAsset instead)
   */
async buyAsset(
    assetId: string,
    price: number, // Total price in MIST
    signerAddress: string,
    signAndExecuteTransaction: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const tx = new Transaction();
      tx.setGasBudget(100000000);

      const ownedOctCoins = await this.suiClient.getCoins({
        owner: signerAddress,
        coinType: ONECHAIN_CONTRACTS.OCT_COIN_TYPE,
      });

      if (!ownedOctCoins.data || ownedOctCoins.data.length === 0) {
        return { success: false, error: 'No OCT coins found for payment.' };
      }

      const mainOctCoin = ownedOctCoins.data[0];
      const [paymentCoin] = tx.splitCoins(tx.object(mainOctCoin.coinObjectId), [tx.pure.u64(price)]);

      tx.moveCall({
        target: `${ONECHAIN_CONTRACTS.MARKETPLACE}::marketplace::buy_asset`,
        arguments: [
          tx.object(ONECHAIN_CONTRACTS.MARKETPLACE_OBJECT),
          tx.pure.id(assetId),
          paymentCoin,
        ],
        typeArguments: [ONECHAIN_CONTRACTS.OCT_COIN_TYPE],
      });

      return new Promise((resolve) => {
        signAndExecuteTransaction(
          { transaction: tx },
          {
            onSuccess: (result: any) => resolve({ success: true }),
            onError: (error: any) => resolve({ success: false, error: error.message || 'Transaction failed' }),
          }
        );
      });
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to construct transaction' };
    }
  }
  /**
   * Get user's assets
   */
  async getUserAssets(userAddress: string): Promise<any[]> {
    try {
      // Query user's owned objects
      const ownedObjects = await this.suiClient.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: `${ONECHAIN_CONTRACTS.RWA_ASSET}::rwaasset::RWAAssetNFT`,
        },
        options: {
          showContent: true,
          showType: true,
        },
      });

      return ownedObjects.data || [];
    } catch (error) {
      console.error('Error fetching user assets:', error);
      return [];
    }
  }

  /**
   * Request tokens from OneChain faucet
   */
  async requestFaucetTokens(address: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🚿 Requesting gas tokens from faucet for:', address);
      
      // Request gas tokens (this includes OCT for purchases)
      const gasResponse = await fetch('https://faucet-testnet.onelabs.cc/v1/gas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FixedAmountRequest: {
            recipient: address,
          },
        }),
      });
      
      console.log('💨 Gas faucet response status:', gasResponse.status);
      
      if (gasResponse.ok) {
        const responseData = await gasResponse.text();
        console.log('✅ Gas faucet response:', responseData);
        console.log('✅ Faucet tokens requested successfully');
        return { success: true };
      } else {
        return { 
          success: false, 
          error: `Gas faucet request failed with status: ${gasResponse.status}` 
        };
      }
    } catch (error: any) {
      console.error('❌ Faucet request error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to request faucet tokens' 
      };
    }
  }

  /**
   * Check wallet balance and available coins using Mysten Labs SDK patterns
   */
  async checkWalletBalance(address: string): Promise<any> {
    try {
      console.log('🔍 Checking wallet balance for:', address);
      
      // Method 1: Use getAllCoins (recommended by Mysten Labs SDK)
      console.log('=== Method 1: Using getAllCoins (Mysten SDK Standard) ===');
      const allCoins = await this.suiClient.getAllCoins({
        owner: address,
      });
      
      console.log('🪙 getAllCoins result:', allCoins);
      console.log('� Total coins found via getAllCoins:', allCoins.data?.length || 0);
      
      if (allCoins.data && allCoins.data.length > 0) {
        console.log('� Coins found via getAllCoins:');
        allCoins.data.forEach((coin, index) => {
          console.log(`  Coin ${index + 1}:`, {
            coinType: coin.coinType,
            coinObjectId: coin.coinObjectId,
            balance: coin.balance,
            version: coin.version,
            digest: coin.digest,
          });
        });
      }
      
      // Method 2: Use getCoins for specific OCT coin type
      console.log('=== Method 2: Using getCoins for OCT specifically ===');
      try {
        const octCoins = await this.suiClient.getCoins({
          owner: address,
          coinType: ONECHAIN_CONTRACTS.OCT_COIN_TYPE,
        });
        
        console.log('🎯 OCT coins via getCoins:', octCoins);
        console.log('📊 OCT coins found:', octCoins.data?.length || 0);
        
        if (octCoins.data && octCoins.data.length > 0) {
          octCoins.data.forEach((coin, index) => {
            console.log(`  OCT Coin ${index + 1}:`, {
              coinType: coin.coinType,
              coinObjectId: coin.coinObjectId,
              balance: coin.balance,
            });
          });
        }
      } catch (error) {
        console.log('❌ Error getting OCT coins via getCoins:', error);
      }
      
      // Method 3: Use getAllBalances (another Mysten SDK method)
      console.log('=== Method 3: Using getAllBalances ===');
      try {
        const allBalances = await this.suiClient.getAllBalances({
          owner: address,
        });
        
        console.log('💰 All Balances via getAllBalances:', allBalances);
        
        if (allBalances && allBalances.length > 0) {
          console.log('📊 Available coin types and balances:');
          allBalances.forEach((balance, index) => {
            console.log(`  ${index + 1}. ${balance.coinType}: ${balance.totalBalance} (${balance.coinObjectCount} objects)`);
          });
        }
      } catch (error) {
        console.log('❌ Error getting all balances:', error);
      }
      
      // Method 4: Try specific balance for OCT
      console.log('=== Method 4: Using getBalance for OCT ===');
      try {
        const octBalance = await this.suiClient.getBalance({
          owner: address,
          coinType: ONECHAIN_CONTRACTS.OCT_COIN_TYPE,
        });
        console.log('💰 OCT Balance via getBalance:', octBalance);
      } catch (error) {
        console.log('❌ Could not get OCT balance via getBalance:', error);
      }
      
      return {
        totalCoins: allCoins.data?.length || 0,
        coins: allCoins.data || [],
        address: address
      };
    } catch (error) {
      console.error('Error checking wallet balance:', error);
      return null;
    }
  }

  /**
   * Purchase asset from marketplace
   */
  async purchaseAsset(
    tokenId: string,
    price: number,
    buyerAddress: string,
    signAndExecuteTransaction: any,
    octCoinId?: string // Optional OCT coin ID, if not provided, will find one
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const tx = new Transaction();
      
      // Set gas budget to match successful CLI calls
      tx.setGasBudget(100000000); // 100M MIST = 0.1 SUI
      
      // First, check wallet balance and contents
      console.log('🔍 Checking wallet contents before purchase...');
      await this.checkWalletBalance(buyerAddress);
      
      // If no OCT coin provided, we need to find one owned by the user
      let paymentCoin: string;
      
      if (octCoinId) {
        paymentCoin = octCoinId;
      } else {
        // Find user's OCT coins using Mysten Labs SDK standard methods
        console.log('🔍 Searching for OCT coins...');
        console.log('👤 Buyer address:', buyerAddress);
        console.log('🪙 Looking for coin type:', ONECHAIN_CONTRACTS.OCT_COIN_TYPE);
        
        // Strategy 1: Use getCoins method (recommended by Mysten Labs SDK)
        console.log('=== Strategy 1: Using getCoins for OCT (Mysten SDK Standard) ===');
        try {
          const octCoinsResult = await this.suiClient.getCoins({
            owner: buyerAddress,
            coinType: ONECHAIN_CONTRACTS.OCT_COIN_TYPE,
          });
          
          console.log('📦 getCoins result for OCT:', octCoinsResult);
          console.log('📊 OCT coins found via getCoins:', octCoinsResult.data?.length || 0);
          
          if (octCoinsResult.data && octCoinsResult.data.length > 0) {
            // Use the first OCT coin found
            paymentCoin = octCoinsResult.data[0].coinObjectId;
            console.log('✅ Found OCT coin via getCoins:', paymentCoin);
            console.log('✅ OCT coin balance:', octCoinsResult.data[0].balance);
            console.log('✅ OCT coin type:', octCoinsResult.data[0].coinType);
          }
        } catch (error) {
          console.log('❌ Error with getCoins for OCT:', error);
        }
        
        // Strategy 2: Use getAllCoins and filter for OCT
        if (!paymentCoin) {
          console.log('=== Strategy 2: Using getAllCoins and filtering ===');
          try {
            const allCoinsResult = await this.suiClient.getAllCoins({
              owner: buyerAddress,
            });
            
            console.log('📦 getAllCoins result:', allCoinsResult);
            console.log('📊 Total coins found:', allCoinsResult.data?.length || 0);
            
            if (allCoinsResult.data && allCoinsResult.data.length > 0) {
              // Log all coin types for debugging
              console.log('🔍 All coin types found:');
              allCoinsResult.data.forEach((coin, index) => {
                console.log(`  Coin ${index + 1}: ${coin.coinType} (balance: ${coin.balance})`);
              });
              
              // Filter for OCT coins
              const octCoins = allCoinsResult.data.filter(coin => {
                const coinType = coin.coinType;
                return coinType && (
                  coinType === ONECHAIN_CONTRACTS.OCT_COIN_TYPE ||
                  coinType.includes('oct::OCT') || 
                  coinType.includes('0x2::oct::OCT') ||
                  coinType.toLowerCase().includes('oct')
                );
              });
              
              console.log('🎯 Filtered OCT coins found:', octCoins.length);
              
              if (octCoins.length > 0) {
                paymentCoin = octCoins[0].coinObjectId;
                console.log('✅ Found OCT coin via getAllCoins filter:', paymentCoin);
                console.log('✅ OCT coin type:', octCoins[0].coinType);
                console.log('✅ OCT coin balance:', octCoins[0].balance);
              } else {
                // Look for any coins that might be payment coins
                console.log('🔄 No OCT found, checking for other potential payment coins...');
                const possiblePaymentCoins = allCoinsResult.data.filter(coin => 
                  coin.coinType.includes('0x2::') && parseInt(coin.balance) > 0
                );
                
                if (possiblePaymentCoins.length > 0) {
                  paymentCoin = possiblePaymentCoins[0].coinObjectId;
                  console.log('⚠️ Using alternative coin as payment:', paymentCoin);
                  console.log('⚠️ Alternative coin type:', possiblePaymentCoins[0].coinType);
                  console.log('⚠️ Alternative coin balance:', possiblePaymentCoins[0].balance);
                }
              }
            }
          } catch (error) {
            console.log('❌ Error with getAllCoins:', error);
          }
        }
        
        if (!paymentCoin) {
          return {
            success: false,
            error: 'Unable to find valid OCT coin',
          };
        }
      }
      
      // Call the buy_asset function with exact CLI structure
      tx.moveCall({
        target: `${ONECHAIN_CONTRACTS.MARKETPLACE}::marketplace::buy_asset`,
        arguments: [
          tx.object(ONECHAIN_CONTRACTS.MARKETPLACE_OBJECT), // marketplace object
          tx.pure.id(tokenId), // asset ID as object::ID
          tx.object(paymentCoin), // OCT payment coin object
        ],
        typeArguments: [ONECHAIN_CONTRACTS.OCT_COIN_TYPE], // OCT coin type
      });

      return new Promise((resolve) => {
        signAndExecuteTransaction(
          { transaction: tx },
          {
            onSuccess: (result: any) => {
              console.log('✅ Asset purchased successfully with OCT!', result);
              resolve({ success: true });
            },
            onError: (error: any) => {
              console.error('Error purchasing asset with OCT:', error);
              resolve({
                success: false,
                error: error.message || 'Failed to purchase asset with OCT',
              });
            },
          }
        );
      });
    } catch (error: any) {
      console.error('Error purchasing asset with OCT:', error);
      return {
        success: false,
        error: error.message || 'Failed to purchase asset with OCT',
      };
    }
  }

  /**
   * Get marketplace listings
   */
   async getMarketplaceListings(): Promise<any[]> {
    try {
      console.log('Fetching REAL marketplace listings with corrected logic...');
      
      const marketplaceObject = await this.suiClient.getObject({
        id: ONECHAIN_CONTRACTS.MARKETPLACE_OBJECT,
        options: { showContent: true },
      });

      const fields = (marketplaceObject.data?.content as any)?.fields;
      if (!fields?.listings?.fields?.id?.id) {
        console.log('No listings table found in the marketplace object.');
        return []; // Return empty if no table
      }
      const listingsTableId = fields.listings.fields.id.id;
      console.log('Listings Table ID:', listingsTableId);

      const dynamicFields = await this.suiClient.getDynamicFields({ parentId: listingsTableId });
      if (!dynamicFields.data || dynamicFields.data.length === 0) {
        console.log('The listings table is currently empty.');
        return []; // Return empty if no listings
      }
      console.log(`Found ${dynamicFields.data.length} raw listing(s).`);

      const listingsPromises = dynamicFields.data.map(async (field) => {
        try {
          const listingObj = await this.suiClient.getObject({ id: field.objectId, options: { showContent: true } });
          
          // CORRECTED PATH: The actual listing data is inside fields.value.fields
          const listingFields = (listingObj.data?.content as any)?.fields?.value?.fields;
          
          if (!listingFields || !listingFields.asset_id) {
            console.warn('Skipping a listing object because it has no asset_id field.', listingObj);
            return null;
          }

          const assetId = listingFields.asset_id;
          const assetObj = await this.suiClient.getObject({ id: assetId, options: { showContent: true } });
          const assetFields = (assetObj.data?.content as any)?.fields;
          
          if (!assetFields) return null;

          const metadataURI = assetFields.metadata_uri || '';
          let metadata: any = {};
          if (metadataURI && metadataURI.startsWith('ipfs://')) {
            const hash = metadataURI.replace('ipfs://', '');
            const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`);
            if (response.ok) {
              metadata = await response.json();
            }
          }

          // Transform the data for the frontend
          return {
            tokenId: assetId,
            name: metadata.name || 'Unnamed Asset',
            description: metadata.description || 'No description.',
            image: metadata.image ? `https://gateway.pinata.cloud/ipfs/${metadata.image.replace('ipfs://', '')}` : '/placeholder.svg',
            price: listingFields.price?.toString() || '0',
            amount: assetFields.total_supply || 1,
            seller: listingFields.seller || '',
            metadataURI: metadataURI,
            isNft: !assetFields.total_supply,
            attributes: metadata.attributes || [],
          };
        } catch (e) {
          console.error(`Error processing listing ${field.objectId}:`, e);
          return null;
        }
      });

      const listings = (await Promise.all(listingsPromises)).filter(item => item !== null);
      console.log('✅ Successfully processed real on-chain listings:', listings);
      return listings;

    } catch (error) {
      console.error('❌ A critical error occurred while fetching marketplace listings:', error);
      throw new Error("Failed to fetch listings from the blockchain.");
    }
  }
  
  /**
   * Get mock marketplace listings for testing
   */
  private getMockListings(): any[] {
    console.log('Returning mock marketplace listings for testing');
    
    return [
      {
        tokenId: '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
        name: 'Luxury Apartment in Downtown',
        description: 'A premium 3-bedroom apartment in the heart of the city with stunning views and modern amenities.',
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
        price: '1000000000',
        amount: 100,
        seller: '0xuser123456789abcdef123456789abcdef123456789abcdef123456789abcdef',
        metadataURI: 'ipfs://QmXyZ123456789abcdef123456789abcdef123456789abcdef123456',
        isNft: false,
        attributes: [
          { trait_type: 'Type', value: 'Real Estate' },
          { trait_type: 'Location', value: 'Downtown' },
          { trait_type: 'Size', value: '1500 sq ft' },
          { trait_type: 'Bedrooms', value: '3' }
        ]
      },
      {
        tokenId: '0x234567890abcdef234567890abcdef234567890abcdef234567890abcdef2345',
        name: 'Commercial Invoice #INV-2023-001',
        description: 'Tokenized invoice for commercial goods delivery with 30-day payment terms.',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1472&q=80',
        price: '500000000000',
        amount: 10,
        seller: '0xuser234567890abcdef234567890abcdef234567890abcdef234567890abcdef',
        metadataURI: 'ipfs://QmXyZ234567890abcdef234567890abcdef234567890abcdef234567',
        isNft: false,
        attributes: [
          { trait_type: 'Type', value: 'Invoice' },
          { trait_type: 'Due Date', value: '2023-12-31' },
          { trait_type: 'Payment Terms', value: 'Net 30' },
          { trait_type: 'Status', value: 'Outstanding' }
        ]
      },
      {
        tokenId: '0x345678901abcdef345678901abcdef345678901abcdef345678901abcdef3456',
        name: 'Carbon Credit Bundle - Rainforest Protection',
        description: 'Verified carbon credits from rainforest conservation projects in the Amazon.',
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1474&q=80',
        price: '300000000000',
        amount: 50,
        seller: '0xuser345678901abcdef345678901abcdef345678901abcdef345678901abcdef',
        metadataURI: 'ipfs://QmXyZ345678901abcdef345678901abcdef345678901abcdef345678',
        isNft: false,
        attributes: [
          { trait_type: 'Type', value: 'Carbon Credit' },
          { trait_type: 'Project', value: 'Amazon Rainforest Conservation' },
          { trait_type: 'Certification', value: 'Verified Carbon Standard' },
          { trait_type: 'Vintage', value: '2023' }
        ]
      },
      {
        tokenId: '0x456789012abcdef456789012abcdef456789012abcdef456789012abcdef4567',
        name: 'Beachfront Villa in Bali',
        description: 'Exclusive beachfront property with private access to pristine beaches and luxury amenities.',
        image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
        price: '2000000000000',
        amount: 20,
        seller: '0xuser456789012abcdef456789012abcdef456789012abcdef456789012abcdef',
        metadataURI: 'ipfs://QmXyZ456789012abcdef456789012abcdef456789012abcdef456789',
        isNft: false,
        attributes: [
          { trait_type: 'Type', value: 'Real Estate' },
          { trait_type: 'Location', value: 'Bali, Indonesia' },
          { trait_type: 'Size', value: '3200 sq ft' },
          { trait_type: 'Bedrooms', value: '4' }
        ]
      },
      {
        tokenId: '0x567890123abcdef567890123abcdef567890123abcdef567890123abcdef5678',
        name: 'Corporate Bond - Tech Innovation Fund',
        description: 'Corporate bond for technology innovation with 5% annual yield and 3-year maturity.',
        image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
        price: '100000000000',
        amount: 200,
        seller: '0xuser567890123abcdef567890123abcdef567890123abcdef567890123abcdef',
        metadataURI: 'ipfs://QmXyZ567890123abcdef567890123abcdef567890123abcdef567890',
        isNft: false,
        attributes: [
          { trait_type: 'Type', value: 'Invoice' },
          { trait_type: 'Yield', value: '5%' },
          { trait_type: 'Maturity', value: '3 years' },
          { trait_type: 'Risk Rating', value: 'A-' }
        ]
      }
    ];
  }

  /**
   * Check if user is authorized issuer
   */
  async isAuthorizedIssuer(userAddress: string): Promise<boolean> {
    try {
      // Query issuer registry to check if user is authorized
      const registry = await this.suiClient.getObject({
        id: ONECHAIN_CONTRACTS.ISSUER_REGISTRY,
        options: {
          showContent: true,
          showType: true,
        },
      });

      // Check if user is in the authorized issuers list
      // This depends on your issuer registry structure
      return true; // Implement based on your registry structure
    } catch (error) {
      console.error('Error checking issuer authorization:', error);
      return false;
    }
  }

  /**
   * Admin Functions for OneChain Management
   */

  /**
   * Add authorized issuer to the platform
   */
  async addIssuer(
    issuerAddress: string,
    name: string, // Added name parameter
    metadataURI: string,
    signerAddress: string,
    signAndExecuteTransaction: any,
    // It's good practice to pass the registry ID instead of hardcoding
    issuerRegistryId: string = '0x6c858122a388ebfaf088b1ba78293b74d1d634b1ea40d6e97c47bed32d96f622'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const tx = new Transaction();
      // Set gas budget to avoid null gasData
      tx.setGasBudget(100000000); // 100M MIST = 0.1 SUI

      // Ensure correct argument types for add_issuer
      tx.moveCall({
        // Verify this is the correct package ID containing the issuer_registry module
        target: `${ONECHAIN_CONTRACTS.ISSUER_REGISTRY}::issuer_registry::add_issuer`, 
        arguments: [
          tx.object(issuerRegistryId),    // 1. Pass the IssuerRegistry object
          tx.pure.address(issuerAddress), // 2. Pass the issuer's address
          tx.pure.string(name),           // 3. Pass the issuer's name
          tx.pure.string(metadataURI),    // 4. Pass the metadata URI
        ],
      });

      return new Promise((resolve) => {
        signAndExecuteTransaction(
          { transaction: tx },
          {
            onSuccess: (result: any) => {
              console.log('✅ Issuer added successfully!', result);
              resolve({ success: true });
            },
            onError: (error: any) => {
              console.error('Error adding issuer:', error);
              resolve({
                success: false,
                error: error.message || 'Failed to add issuer',
              });
            },
          }
        );
      });
    } catch (error: any) {
      console.error('Error adding issuer:', error);
      return {
        success: false,
        error: error.message || 'Failed to add issuer',
      };
    }
  }

  /**
   * Remove authorized issuer from the platform
   */
  async removeIssuer(
    issuerAddress: string,
    signerAddress: string,
    signAndExecuteTransaction: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${ONECHAIN_CONTRACTS.ADMIN}::admin::remove_issuer`,
        arguments: [
          tx.pure.address(issuerAddress),
        ],
      });

      return new Promise((resolve) => {
        signAndExecuteTransaction(
          { transaction: tx },
          {
            onSuccess: (result: any) => {
              console.log('✅ Issuer removed successfully!', result);
              resolve({ success: true });
            },
            onError: (error: any) => {
              console.error('Error removing issuer:', error);
              resolve({
                success: false,
                error: error.message || 'Failed to remove issuer',
              });
            },
          }
        );
      });
    } catch (error: any) {
      console.error('Error removing issuer:', error);
      return {
        success: false,
        error: error.message || 'Failed to remove issuer',
      };
    }
  }

  /**
   * Pause marketplace operations
   */
  async pauseMarketplace(
    signerAddress: string,
    signAndExecuteTransaction: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${ONECHAIN_CONTRACTS.ADMIN}::admin::pause_marketplace`,
        arguments: [],
      });

      return new Promise((resolve) => {
        signAndExecuteTransaction(
          { transaction: tx },
          {
            onSuccess: (result: any) => {
              console.log('✅ Marketplace paused successfully!', result);
              resolve({ success: true });
            },
            onError: (error: any) => {
              console.error('Error pausing marketplace:', error);
              resolve({
                success: false,
                error: error.message || 'Failed to pause marketplace',
              });
            },
          }
        );
      });
    } catch (error: any) {
      console.error('Error pausing marketplace:', error);
      return {
        success: false,
        error: error.message || 'Failed to pause marketplace',
      };
    }
  }

  /**
   * Resume marketplace operations
   */
  async resumeMarketplace(
    signerAddress: string,
    signAndExecuteTransaction: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${ONECHAIN_CONTRACTS.ADMIN}::admin::resume_marketplace`,
        arguments: [],
      });

      return new Promise((resolve) => {
        signAndExecuteTransaction(
          { transaction: tx },
          {
            onSuccess: (result: any) => {
              console.log('✅ Marketplace resumed successfully!', result);
              resolve({ success: true });
            },
            onError: (error: any) => {
              console.error('Error resuming marketplace:', error);
              resolve({
                success: false,
                error: error.message || 'Failed to resume marketplace',
              });
            },
          }
        );
      });
    } catch (error: any) {
      console.error('Error resuming marketplace:', error);
      return {
        success: false,
        error: error.message || 'Failed to resume marketplace',
      };
    }
  }

  /**
   * Get all authorized issuers from the registry
   */
  async getAuthorizedIssuers(): Promise<{
    addresses: string[];
    count: number;
    metadata: Record<string, string>;
  }> {
    try {
      // Query issuer registry contract
      const registry = await this.suiClient.getObject({
        id: ONECHAIN_CONTRACTS.ISSUER_REGISTRY_OBJECT,
        options: {
          showContent: true,
          showType: true,
        },
      });
      console.log('[getAuthorizedIssuers] Raw registry object:', registry);

      if (!registry || !registry.data) {
        console.log('[getAuthorizedIssuers] Registry object missing data field.');
        return { addresses: [], count: 0, metadata: {} };
      }

      const content = registry.data.content;
      console.log('[getAuthorizedIssuers] Registry content:', content);



      // Defensive: log all keys and types
      if (content) {
        console.log('[getAuthorizedIssuers] content keys:', Object.keys(content));
        if ('fields' in content) {
          console.log('[getAuthorizedIssuers] content.fields keys:', Object.keys(content.fields));
        }
      }

      let addresses: string[] = [];
      let metadata: Record<string, string> = {};
      let count = 0;

      // SuiParsedData can be { dataType: 'moveObject', type, fields } or { dataType: 'package', ... }
      let fields: any = undefined;
      if (content && 'fields' in content) {
        fields = (content as any).fields;
      }

      if (fields && fields.issuers) {
        const issuersVector = fields.issuers;
        console.log('[getAuthorizedIssuers] issuers vector:', issuersVector);
        if (Array.isArray(issuersVector)) {
          addresses = issuersVector.map((issuer: any) => {
            console.log('[getAuthorizedIssuers] issuer entry:', issuer);
            if (issuer && issuer.fields && issuer.fields.issuer) {
              return issuer.fields.issuer;
            }
            return null;
          }).filter(Boolean);
          count = addresses.length;
        } else {
          console.log('[getAuthorizedIssuers] issuers vector is not an array:', issuersVector);
        }
      } else {
        console.log('[getAuthorizedIssuers] issuers field not found in fields:', fields);
      }

      if (fields && fields.metadata) {
        metadata = fields.metadata;
        console.log('[getAuthorizedIssuers] metadata:', metadata);
      }

      console.log('[getAuthorizedIssuers] Final parsed:', { addresses, count, metadata });
      return { addresses, count, metadata };
    } catch (error) {
      console.error('Error fetching authorized issuers:', error);
      return {
        addresses: [],
        count: 0,
        metadata: {},
      };
    }
  }

  /**
   * Check if marketplace is paused
   */
  async isMarketplacePaused(): Promise<boolean> {
    try {
      // Query marketplace contract for pause status
      const marketplace = await this.suiClient.getObject({
        id: ONECHAIN_CONTRACTS.MARKETPLACE_OBJECT,
        options: {
          showContent: true,
          showType: true,
        },
      });

      // Check marketplace pause status
      // This implementation depends on your marketplace structure
      return false; // Default to not paused
    } catch (error) {
      console.error('Error checking marketplace status:', error);
      return false;
    }
  }

  /**
   * Get platform metrics and statistics
   */
  async getPlatformMetrics(): Promise<{
    totalIssuers: number;
    totalAssets: number;
    totalVolume: number;
    marketplaceStatus: boolean;
  }> {
    try {
      const issuers = await this.getAuthorizedIssuers();
      const marketplacePaused = await this.isMarketplacePaused();

      return {
        totalIssuers: issuers.count,
        totalAssets: 0, // Implement asset counting
        totalVolume: 0, // Implement volume calculation
        marketplaceStatus: !marketplacePaused,
      };
    } catch (error) {
      console.error('Error fetching platform metrics:', error);
      return {
        totalIssuers: 0,
        totalAssets: 0,
        totalVolume: 0,
        marketplaceStatus: true,
      };
    }
  }

  /**
   * Helper method to convert asset type string to index
   */
  private getAssetTypeIndex(assetType: string): number {
    const assetTypes: { [key: string]: number } = {
      'RealEstate': 0,
      'Invoice': 1,
      'Gold': 2,
      'Stocks': 3,
      'CarbonCredit': 4,
      'Custom': 5
    };
    
    return assetTypes[assetType] || 5; // Default to Custom if not found
  }
}
