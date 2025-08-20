// OneChain Service - Replaces Hedera functionality using Sui SDK
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';

// OneChain Contract Package IDs (from our successful deployments)
export // OneChain contract addresses and IDs
const ONECHAIN_CONTRACTS = {
  // Core package IDs - updated to match successful CLI calls
  ADMIN: '0xf80c253bc01793cb6d8815c38b9b6a665bacf9f2b2e32d29a39598a39fd51b29',
  ISSUER_REGISTRY: '0x2b8f314190ecb97381c1b8a5efa62f8e21e9becaf637d82f538f5c00ce5932a0',
  MARKETPLACE: '0x0c7a73e60f5ed8905b6e27eead169c75a9f410a4668e32e12c08d9dfbe9c7bfd',
  RWA_ASSET: '0xa8812fbbd23a212d5ff03c9d1f7e1cb9164d95fde56d659cb75623bbf0a9b941',
  
  // Core object IDs (actual deployed object instances) - UPDATED
  ISSUER_REGISTRY_OBJECT: '0x5cb11f0d91fca68482f8fce83902d00f9b364fdd40080784ad171ec3137e17a7', // NEW issuer registry object
  MARKETPLACE_OBJECT: '0xb18514fa9c08de270a6df05ce2ecf06ba225218e4b10bebd595b8227bc46cdf9', // NEW marketplace object
  
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
      // Default object IDs if not provided - UPDATED with new contract objects
      const defaultIssuerCapId = issuerCapId || '0x613da218834f4948ca4279fa0c981371e221b3b13726c3d86155957619a6372d';
      const defaultRegistryId = issuerRegistryId || '0x5cb11f0d91fca68482f8fce83902d00f9b364fdd40080784ad171ec3137e17a7';
      
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
              console.log('🔍 Created objects:', createdObjects);
              
              // Look for the RWAAssetNFT object
              const nftObject = createdObjects.find((obj: any) => 
                obj.owner && 'AddressOwner' in obj.owner && 
                obj.objectType && obj.objectType.includes('RWAAssetNFT')
              );
              
              console.log('🎯 Found NFT Object:', nftObject);
              
              const objectId = nftObject?.reference?.objectId;
              console.log('📋 Extracted Object ID:', objectId);
              
              resolve({
                success: true,
                objectId: objectId,
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
   * Create and Auto-List NFT using optimized sequential transactions
   * Since Move contracts transfer assets immediately, we use fast sequential calls
   */
  async createAndListNFT(
    data: TokenCreationData,
    marketplacePrice: number, // Price in MIST for marketplace listing
    signerAddress: string,
    signAndExecuteTransaction: any,
    issuerCapId?: string,
    issuerRegistryId?: string
  ): Promise<{ success: boolean; objectId?: string; error?: string }> {
    try {
      console.log('� Creating NFT and Auto-Listing (Optimized Sequential)');
      
      // Step 1: Create NFT first
      const createResult = await this.createNFT(data, signerAddress, signAndExecuteTransaction, issuerCapId, issuerRegistryId);
      
      if (!createResult.success || !createResult.objectId) {
        return createResult;
      }
      
      console.log('✅ NFT Created:', createResult.objectId);
      
      // Step 2: List the created NFT immediately
      console.log('📋 Auto-listing NFT on marketplace...');
      const listResult = await this.listAsset(createResult.objectId, marketplacePrice, signerAddress, signAndExecuteTransaction, issuerRegistryId);
      
      if (!listResult.success) {
        console.warn('⚠️  NFT created but listing failed:', listResult.error);
        // Still return success since NFT was created
        return {
          success: true, 
          objectId: createResult.objectId,
          error: `NFT created successfully, but auto-listing failed: ${listResult.error}`
        };
      }
      
      console.log('🎯 NFT Created and Listed Successfully');
      
      return {
        success: true,
        objectId: createResult.objectId,
      };
      
    } catch (error: any) {
      console.error('❌ Error in Create+List NFT:', error);
      return {
        success: false,
        error: error.message || 'Failed to create and list NFT',
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
      
      // Default object IDs if not provided - UPDATED with new contract objects
      const defaultIssuerCapId = issuerCapId || '0x613da218834f4948ca4279fa0c981371e221b3b13726c3d86155957619a6372d';
      const defaultRegistryId = issuerRegistryId || '0x5cb11f0d91fca68482f8fce83902d00f9b364fdd40080784ad171ec3137e17a7';
      
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
            onSuccess: async (result: any) => {
              console.log('✅ FT created successfully!', result);
              
              let objectId = null;
              
              // Method 1: Try objectChanges first (most reliable for newly created objects)
              if (result.objectChanges) {
                console.log('📋 Checking objectChanges:', result.objectChanges);
                const createdChange = result.objectChanges.find((change: any) => 
                  change.type === 'created' && 
                  change.objectType && 
                  change.objectType.includes('RWAAssetFT')
                );
                if (createdChange) {
                  objectId = createdChange.objectId;
                  console.log('🎯 Found FT via objectChanges:', objectId);
                }
              }
              
              // Method 2: Try effects.created (fallback if objectChanges doesn't work)
              if (!objectId && result.effects?.created) {
                console.log('� Checking effects.created:', result.effects.created);
                const createdObj = result.effects.created.find((obj: any) => 
                  obj.owner?.AddressOwner === signerAddress &&
                  obj.objectType && obj.objectType.includes('RWAAssetFT')
                );
                if (createdObj) {
                  objectId = createdObj.reference?.objectId;
                  console.log('🎯 Found FT via effects.created:', objectId);
                }
              }
              
              // Method 3: Query transaction details using digest (most reliable)
              if (!objectId && result.digest) {
                try {
                  console.log('🔍 Querying transaction details for digest:', result.digest);
                  const txDetails = await this.suiClient.getTransactionBlock({
                    digest: result.digest,
                    options: {
                      showEffects: true,
                      showObjectChanges: true,
                    }
                  });
                  
                  console.log('📋 Transaction details:', txDetails);
                  
                  // Look in objectChanges first
                  if (txDetails.objectChanges) {
                    const createdFT = txDetails.objectChanges.find((change: any) => 
                      change.type === 'created' && 
                      change.objectType?.includes('RWAAssetFT') &&
                      change.sender === signerAddress
                    ) as any;
                    if (createdFT) {
                      objectId = createdFT.objectId;
                      console.log('🎯 Found FT via transaction objectChanges:', objectId);
                    }
                  }
                  
                  // Look in effects.created if objectChanges didn't work
                  if (!objectId && txDetails.effects?.created) {
                    const createdObj = txDetails.effects.created.find((obj: any) => 
                      obj.owner?.AddressOwner === signerAddress &&
                      obj.objectType?.includes('RWAAssetFT')
                    );
                    if (createdObj) {
                      objectId = createdObj.reference?.objectId;
                      console.log('🎯 Found FT via transaction effects.created:', objectId);
                    }
                  }
                } catch (error) {
                  console.warn('⚠️ Could not query transaction details:', error);
                }
              }
              
              // Method 4: Query user's owned objects but filter by creation time
              if (!objectId) {
                try {
                  console.log('🔄 Querying user owned objects to find the newest FT...');
                  const ownedObjects = await this.suiClient.getOwnedObjects({
                    owner: signerAddress,
                    filter: {
                      StructType: `${ONECHAIN_CONTRACTS.RWA_ASSET}::rwaasset::RWAAssetFT`,
                    },
                    options: {
                      showContent: true,
                      showType: true,
                    },
                  });
                  
                  console.log('📋 Found FT objects:', ownedObjects.data?.length || 0);
                  
                  if (ownedObjects.data && ownedObjects.data.length > 0) {
                    // Sort by version (higher version = newer) and get the most recent
                    const sortedFTs = ownedObjects.data.sort((a, b) => 
                      parseInt(b.data?.version || '0') - parseInt(a.data?.version || '0')
                    );
                    const newestFT = sortedFTs[0];
                    objectId = newestFT.data?.objectId;
                    console.log('🎯 Found newest FT by version:', objectId, 'version:', newestFT.data?.version);
                    
                    // Additional verification: check if this FT was created recently
                    if (newestFT.data?.content) {
                      const ftFields = (newestFT.data.content as any)?.fields;
                      console.log('📋 Newest FT fields:', {
                        metadata_uri: ftFields?.metadata_uri,
                        total_supply: ftFields?.total_supply,
                        asset_type_index: ftFields?.asset_type_index
                      });
                    }
                  }
                } catch (error) {
                  console.warn('⚠️ Could not query owned objects:', error);
                }
              }
              
              // Method 5: Final fallback - use digest if nothing else works
              if (!objectId) {
                objectId = result.digest;
                console.log('⚠️ Using digest as fallback ID (will need manual extraction):', objectId);
              }
              
              console.log('📋 Final Extracted Object ID:', objectId);
              
              resolve({
                success: true,
                objectId: objectId,
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
   * Create and Auto-List FT using optimized sequential transactions
   * Since Move contracts transfer assets immediately, we use fast sequential calls
   */
  async createAndListFT(
    data: TokenCreationData,
    marketplacePrice: number, // Price in MIST for marketplace listing
    signerAddress: string,
    signAndExecuteTransaction: any,
    issuerCapId?: string,
    issuerRegistryId?: string
  ): Promise<{ success: boolean; objectId?: string; error?: string }> {
    try {
      console.log('� Creating FT and Auto-Listing (Optimized Sequential)');
      
      // Step 1: Create FT first
      const createResult = await this.createFT(data, signerAddress, signAndExecuteTransaction, issuerCapId, issuerRegistryId);
      
      if (!createResult.success || !createResult.objectId) {
        return createResult;
      }
      
      console.log('✅ FT Created:', createResult.objectId);
      
      // Step 2: List the created FT immediately with total supply information
      console.log('📋 Auto-listing FT on marketplace...');
      const totalSupply = data.amount; // The total supply from FT creation
      const quantityToList = data.amount; // List all tokens by default
      const listResult = await this.listAssetFT(createResult.objectId, marketplacePrice, signerAddress, signAndExecuteTransaction, issuerRegistryId, quantityToList, totalSupply);
      
      if (!listResult.success) {
        console.warn('⚠️  FT created but listing failed:', listResult.error);
        // Still return success since FT was created
        return {
          success: true,
          objectId: createResult.objectId,
          error: `FT created successfully, but auto-listing failed: ${listResult.error}`
        };
      }
      
      console.log('🎯 FT Created and Listed Successfully');
      
      return {
        success: true,
        objectId: createResult.objectId,
      };
      
    } catch (error: any) {
      console.error('❌ Error in Create+List FT:', error);
      return {
        success: false,
        error: error.message || 'Failed to create and list FT',
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
      
      // Default issuer registry if not provided - UPDATED with new contract object
      const defaultRegistryId = issuerRegistryId || '0x5cb11f0d91fca68482f8fce83902d00f9b364fdd40080784ad171ec3137e17a7';
      
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
   * List FT asset for sale in marketplace  
   */
  async listAssetFT(
    tokenId: string,
    price: number,
    sellerAddress: string,
    signAndExecuteTransaction: any,
    issuerRegistryId?: string,
    quantityToList?: number, // How many units to list for sale
    totalSupply?: number // Total supply of the FT
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const tx = new Transaction();
      
      // Set gas budget to match successful CLI calls
      tx.setGasBudget(100000000); // 100M MIST = 0.1 SUI
      
      // Default issuer registry if not provided - use the correct NEW registry object
      const defaultRegistryId = issuerRegistryId || '0x5cb11f0d91fca68482f8fce83902d00f9b364fdd40080784ad171ec3137e17a7';
      
      // Default values if not provided
      const defaultQuantityToList = quantityToList || 1000; // List all tokens by default
      const defaultTotalSupply = totalSupply || 1000; // Assume same as quantity if not provided
      
      console.log('🏪 Listing FT Asset:', {
        tokenId,
        price,
        quantityToList: defaultQuantityToList,
        totalSupply: defaultTotalSupply,
        marketplace: ONECHAIN_CONTRACTS.MARKETPLACE_OBJECT,
        registry: defaultRegistryId
      });
      
      // Call the list_asset_ft function with ALL required parameters
      tx.moveCall({
        target: `${ONECHAIN_CONTRACTS.MARKETPLACE}::marketplace::list_asset_ft`,
        arguments: [
          tx.object(ONECHAIN_CONTRACTS.MARKETPLACE_OBJECT), // marketplace
          tx.object(defaultRegistryId), // issuer registry
          tx.object(tokenId), // the FT asset object
          tx.pure.u64(price), // price per unit
          tx.pure.u64(defaultQuantityToList), // quantity to list
          tx.pure.u64(defaultTotalSupply), // total supply
          tx.object('0x6'), // clock object
        ],
      });

      return new Promise((resolve) => {
        signAndExecuteTransaction(
          { transaction: tx },
          {
            onSuccess: (result: any) => {
              console.log('✅ FT Listed successfully!', result);
              resolve({
                success: true,
              });
            },
            onError: (error: any) => {
              console.error('Error listing FT asset:', error);
              resolve({
                success: false,
                error: error.message || 'Failed to list FT asset',
              });
            },
          }
        );
      });
    } catch (error: any) {
      console.error('Error listing FT asset:', error);
      return {
        success: false,
        error: error.message || 'Failed to list FT asset',
      };
    }
  }

  /**
   * Buy asset from marketplace - Updated to match marketplace contract
   */
async buyAsset(
    assetId: string,
    price: number, // Total price in MIST (kept for compatibility)
    signerAddress: string,
    signAndExecuteTransaction: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const tx = new Transaction();
      tx.setGasBudget(100000000);

      // Find user's OCT coins for payment
      const ownedOctCoins = await this.suiClient.getCoins({
        owner: signerAddress,
        coinType: ONECHAIN_CONTRACTS.OCT_COIN_TYPE,
      });

      if (!ownedOctCoins.data || ownedOctCoins.data.length === 0) {
        return { success: false, error: 'No OCT coins found for payment. Please ensure you have OCT tokens.' };
      }

      // Use the first available OCT coin - the marketplace contract handles the payment logic
      const paymentCoin = ownedOctCoins.data[0];
      console.log(`💰 Using payment coin: ${paymentCoin.coinObjectId} with balance: ${paymentCoin.balance}`);

      // Call buy_asset function with the ORIGINAL asset ID (the contract expects this as the listings table key):
      // The contract logic:
      // 1. Looks up listing using asset_id in listings table
      // 2. Finds actual asset in escrow using the same asset_id as key
      // 3. Transfers the escrow asset to buyer
      console.log(`🛒 Attempting to buy asset: ${assetId}`);
      tx.moveCall({
        target: `${ONECHAIN_CONTRACTS.MARKETPLACE}::marketplace::buy_asset`,
        arguments: [
          tx.object(ONECHAIN_CONTRACTS.MARKETPLACE_OBJECT), // marketplace object
          tx.pure.id(assetId), // CORRECT: original asset ID (key for both listings and escrow tables)
          tx.object(paymentCoin.coinObjectId), // payment coin object
        ],
      });

      return new Promise((resolve) => {
        signAndExecuteTransaction(
          { transaction: tx },
          {
            onSuccess: (result: any) => {
              console.log('✅ Asset purchased successfully!');
              console.log('📦 Transaction result:', result);
              resolve({ success: true });
            },
            onError: (error: any) => {
              console.error('❌ Purchase failed:', error);
              // Parse Move abort errors for better user experience
              let errorMessage = 'Failed to purchase asset';
              if (error.message && error.message.includes('MoveAbort')) {
                if (error.message.includes(', 6)')) {
                  errorMessage = 'This asset is no longer available for purchase.';
                } else if (error.message.includes(', 5)')) {
                  errorMessage = 'Insufficient payment amount.';
                } else if (error.message.includes(', 4)')) {
                  errorMessage = 'Marketplace is currently paused.';
                }
              }
              resolve({ 
                success: false, 
                error: errorMessage
              });
            },
          }
        );
      });
    } catch (error: any) {
      console.error('❌ Error in buyAsset:', error);
      return { success: false, error: error.message || 'Failed to construct purchase transaction' };
    }
  }

  /**
   * Buy specific quantity of FT tokens from marketplace
   */
  async buyAssetFT(
    assetId: string,
    quantity: number,
    pricePerUnit: number,
    signerAddress: string,
    signAndExecuteTransaction: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const tx = new Transaction();
      tx.setGasBudget(100000000);

      // Find user's OCT coins for payment
      const ownedOctCoins = await this.suiClient.getCoins({
        owner: signerAddress,
        coinType: ONECHAIN_CONTRACTS.OCT_COIN_TYPE,
      });

      if (!ownedOctCoins.data || ownedOctCoins.data.length === 0) {
        return { success: false, error: 'No OCT coins found for payment. Please ensure you have OCT tokens.' };
      }

      // Use the first available OCT coin
      const paymentCoin = ownedOctCoins.data[0];
      console.log(`💰 Using payment coin: ${paymentCoin.coinObjectId} with balance: ${paymentCoin.balance}`);
      console.log(`🛒 Attempting to buy ${quantity} FT tokens of asset: ${assetId}`);

      // Calculate expected cost for debugging
      const totalCost = pricePerUnit * quantity;
      console.log(`💵 Price per unit: ${pricePerUnit} MIST (${pricePerUnit / 1000000000} OCT)`);
      console.log(`💵 Total cost: ${totalCost} MIST (${totalCost / 1000000000} OCT)`);
      console.log(`💰 Payment coin balance: ${paymentCoin.balance} MIST (${parseInt(paymentCoin.balance) / 1000000000} OCT)`);
      console.log(`✅ Sufficient balance: ${parseInt(paymentCoin.balance) >= totalCost}`);
      
      // Log all transaction arguments for debugging
      console.log(`🔍 Transaction arguments:`);
      console.log(`  - Marketplace: ${ONECHAIN_CONTRACTS.MARKETPLACE_OBJECT}`);
      console.log(`  - Asset ID: ${assetId}`);
      console.log(`  - Quantity: ${quantity}`);
      console.log(`  - Payment coin: ${paymentCoin.coinObjectId}`);

      tx.moveCall({
        target: `${ONECHAIN_CONTRACTS.MARKETPLACE}::marketplace::buy_asset_ft`,
        arguments: [
          tx.object(ONECHAIN_CONTRACTS.MARKETPLACE_OBJECT), // marketplace object
          tx.pure.id(assetId), // asset ID
          tx.pure.u64(quantity), // quantity to buy
          tx.object(paymentCoin.coinObjectId), // payment coin object
        ],
        typeArguments: [], // No type arguments needed since OCT is hardcoded in the function
      });

      return new Promise((resolve) => {
        signAndExecuteTransaction(
          { transaction: tx },
          {
            onSuccess: (result: any) => {
              console.log('✅ FT tokens purchased successfully!');
              console.log('📦 Transaction result:', result);
              resolve({ success: true });
            },
            onError: (error: any) => {
              console.error('❌ FT purchase failed:', error);
              console.error('❌ Full error details:', JSON.stringify(error, null, 2));
              
              let errorMessage = 'Failed to purchase FT tokens';
              
              // Try to extract more specific error information
              if (error.cause) {
                console.error('❌ Error cause:', JSON.stringify(error.cause, null, 2));
              }
              
              if (error.message) {
                console.error('❌ Error message:', error.message);
                if (error.message.includes('MoveAbort')) {
                  if (error.message.includes(', 6)')) {
                    errorMessage = 'This asset is no longer available for purchase.';
                  } else if (error.message.includes(', 8)')) {
                    errorMessage = 'Insufficient quantity available.';
                  } else if (error.message.includes(', 5)')) {
                    errorMessage = 'Insufficient payment amount.';
                  } else if (error.message.includes(', 10)')) {
                    errorMessage = 'Quantity must be greater than zero.';
                  } else if (error.message.includes(', 4)')) {
                    errorMessage = 'Marketplace is currently paused.';
                  } else if (error.message.includes(', 6)')) {
                    errorMessage = 'Listing not found.';
                  } else {
                    errorMessage = `Transaction failed: ${error.message}`;
                  }
                } else {
                  errorMessage = error.message;
                }
              }
              
              resolve({ 
                success: false, 
                error: errorMessage
              });
            },
          }
        );
      });
    } catch (error: any) {
      console.error('❌ Error in buyAssetFT:', error);
      return { success: false, error: error.message || 'Failed to construct FT purchase transaction' };
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
   * Get user's FT balances from marketplace
   */
  async getUserFTBalances(userAddress: string): Promise<any[]> {
    try {
      console.log('🔄 Fetching FT balances for user:', userAddress);
      
      // First, get all FT assets from marketplace listings to check user's balances
      const marketplaceListings = await this.getMarketplaceListings();
      const ftListings = marketplaceListings.filter(listing => !listing.isNft);
      
      console.log('📊 Found FT listings in marketplace:', ftListings.length);
      
      const ftBalances = [];

      for (const listing of ftListings) {
        try {
          console.log(`🔍 Checking balance for FT asset: ${listing.tokenId}`);
          
          // Try to get user's balance for this FT asset using dev inspect
          const result = await this.suiClient.devInspectTransactionBlock({
            sender: userAddress,
            transactionBlock: (() => {
              const tx = new Transaction();
              tx.moveCall({
                target: `${ONECHAIN_CONTRACTS.MARKETPLACE}::marketplace::get_ft_balance`,
                arguments: [
                  tx.object(ONECHAIN_CONTRACTS.MARKETPLACE_OBJECT),
                  tx.pure.id(listing.tokenId),
                  tx.pure.address(userAddress),
                ],
              });
              return tx;
            })(),
          });

          console.log(`📦 Balance result for ${listing.tokenId}:`, result);

          if (result.results && result.results[0] && result.results[0].returnValues) {
            const returnValue = result.results[0].returnValues[0];
            if (returnValue && returnValue.length > 0) {
              // Parse the balance from bytes
              let balance = 0;
              if (typeof returnValue[0] === 'number') {
                balance = returnValue[0];
              } else if (Array.isArray(returnValue[0])) {
                // Handle byte array format
                const bytes = returnValue[0] as number[];
                balance = bytes[0] || 0;
              }
              
              console.log(`💰 User has ${balance} tokens of ${listing.name}`);
              
              if (balance > 0) {
                ftBalances.push({
                  ...listing,
                  user_balance: balance,
                  type: 'FT',
                  // Add additional metadata for dashboard display
                  metadata_uri: listing.metadataURI,
                  asset_id: listing.tokenId,
                  price_per_unit: listing.pricePerToken
                });
              }
            }
          }
        } catch (error) {
          console.warn(`⚠️ Could not get balance for asset ${listing.tokenId}:`, error);
          // Continue to next asset if this one fails
        }
      }

      console.log('✅ Final FT balances found:', ftBalances.length);
      return ftBalances;
    } catch (error) {
      console.error('❌ Error fetching user FT balances:', error);
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
   * Get metadata URI from escrow tables (fallback method from old marketplace)
   */
  private async getMetadataFromEscrow(assetId: string): Promise<string | null> {
    try {
      // 1. Fetch the Marketplace object
      const marketplace = await this.suiClient.getObject({
        id: ONECHAIN_CONTRACTS.MARKETPLACE_OBJECT,
        options: { showContent: true }
      });

      // 2. Get the nft_escrow and ft_escrow table IDs
      const fields = (marketplace.data?.content as any)?.fields;
      const nftEscrowTableId = fields?.nft_escrow?.fields?.id?.id;
      const ftEscrowTableId = fields?.ft_escrow?.fields?.id?.id;

      if (!nftEscrowTableId && !ftEscrowTableId) {
        console.log('No escrow tables found in marketplace');
        return null;
      }

      // 3. Try NFT escrow first
      if (nftEscrowTableId) {
        try {
          const nftInEscrow = await this.suiClient.getDynamicFieldObject({
            parentId: nftEscrowTableId,
            name: { 
              type: '0x2::object::ID', 
              value: assetId 
            }
          });

          const metadata_uri = (nftInEscrow.data?.content as any)?.fields?.value?.fields?.metadata_uri;
          if (metadata_uri) {
            console.log(`Found NFT metadata_uri from escrow:`, metadata_uri);
            return metadata_uri;
          }
        } catch (e) {
          // NFT not found in escrow, try FT escrow
        }
      }

      // 4. Try FT escrow
      if (ftEscrowTableId) {
        try {
          const ftInEscrow = await this.suiClient.getDynamicFieldObject({
            parentId: ftEscrowTableId,
            name: { 
              type: '0x2::object::ID', 
              value: assetId 
            }
          });

          const metadata_uri = (ftInEscrow.data?.content as any)?.fields?.value?.fields?.metadata_uri;
          if (metadata_uri) {
            console.log(`Found FT metadata_uri from escrow:`, metadata_uri);
            return metadata_uri;
          }
        } catch (e) {
          // FT not found in escrow either
        }
      }

      console.log(`No metadata found in escrow for asset ${assetId}`);
      return null;

    } catch (error) {
      console.error(`Error fetching metadata from escrow for ${assetId}:`, error);
      return null;
    }
  }

  /**
   * Get marketplace listings
   */
   async getMarketplaceListings(): Promise<any[]> {
    try {
      console.log('🔄 Fetching marketplace listings...');
      
      // 1. Fetch marketplace object
      const marketplaceObject = await this.suiClient.getObject({
        id: ONECHAIN_CONTRACTS.MARKETPLACE_OBJECT,
        options: { showContent: true },
      });

      // 2. Extract listings table ID
      const fields = (marketplaceObject.data?.content as any)?.fields;
      if (!fields?.listings?.fields?.id?.id) {
        console.log('⚠️ No listings table found');
        return [];
      }
      
      const listingsTableId = fields.listings.fields.id.id;

      // 3. Fetch dynamic fields (all listings)
      const dynamicFields = await this.suiClient.getDynamicFields({ parentId: listingsTableId });
      if (!dynamicFields.data || dynamicFields.data.length === 0) {
        console.log('📋 No listings found');
        return [];
      }

      console.log(`📊 Found ${dynamicFields.data.length} listings to process`);

      // 4. Process each listing
      const listingsPromises = dynamicFields.data.map(async (field, index) => {
        try {
          const listingObj = await this.suiClient.getObject({ id: field.objectId, options: { showContent: true } });
          
          const listingFields = (listingObj.data?.content as any)?.fields?.value?.fields;
          
          if (!listingFields || !listingFields.asset_id) {
            return null;
          }

          const assetId = listingFields.asset_id;
          
          // Since the asset is listed, it's in escrow - try to get it from there
          let assetFields = null;
          let metadataURI = '';
          
          // First try to get the asset from the original location (might still be there for some assets)
          try {
            const assetObj = await this.suiClient.getObject({ id: assetId, options: { showContent: true } });
            assetFields = (assetObj.data?.content as any)?.fields;
            if (assetFields) {
              metadataURI = assetFields.metadata_uri;
              console.log(`✅ Found asset at original location: ${assetId}`);
            }
          } catch (e) {
            console.log(`📦 Asset ${assetId} not at original location, checking escrow...`);
          }
          
          // If not found at original location, get it from escrow
          if (!assetFields) {
            console.log(`🔍 Asset ${assetId} is in escrow, fetching from marketplace escrow tables...`);
            
            // Get marketplace object to access escrow tables
            const marketplaceObj = await this.suiClient.getObject({
              id: ONECHAIN_CONTRACTS.MARKETPLACE_OBJECT,
              options: { showContent: true },
            });
            
            const marketplaceFields = (marketplaceObj.data?.content as any)?.fields;
            const ftEscrowTableId = marketplaceFields?.ft_escrow?.fields?.id?.id;
            const nftEscrowTableId = marketplaceFields?.nft_escrow?.fields?.id?.id;
            
            // Try FT escrow first (since we know it's an FT from our CLI check)
            if (ftEscrowTableId) {
              try {
                const ftInEscrow = await this.suiClient.getDynamicFieldObject({
                  parentId: ftEscrowTableId,
                  name: { 
                    type: '0x2::object::ID', 
                    value: assetId 
                  }
                });
                
                assetFields = (ftInEscrow.data?.content as any)?.fields?.value?.fields;
                if (assetFields) {
                  metadataURI = assetFields.metadata_uri;
                  console.log(`✅ Found asset in FT escrow: ${assetId}`);
                  console.log(`🔗 Metadata URI from FT escrow: ${metadataURI}`);
                }
              } catch (e) {
                console.log(`📦 Asset ${assetId} not in FT escrow, trying NFT escrow...`);
              }
            }
            
            // Try NFT escrow if not found in FT escrow
            if (!assetFields && nftEscrowTableId) {
              try {
                const nftInEscrow = await this.suiClient.getDynamicFieldObject({
                  parentId: nftEscrowTableId,
                  name: { 
                    type: '0x2::object::ID', 
                    value: assetId 
                  }
                });
                
                assetFields = (nftInEscrow.data?.content as any)?.fields?.value?.fields;
                if (assetFields) {
                  metadataURI = assetFields.metadata_uri;
                  console.log(`✅ Found asset in NFT escrow: ${assetId}`);
                  console.log(`🔗 Metadata URI from NFT escrow: ${metadataURI}`);
                }
              } catch (e) {
                console.log(`❌ Asset ${assetId} not found in NFT escrow either`);
              }
            }
          }
          
          if (!assetFields) {
            console.warn(`⚠️ Skipping listing: asset ${assetId} not found in original location or escrow`);
            return null;
          }

          // Ensure metadataURI is set from the assetFields we found
          if (!metadataURI && assetFields.metadata_uri) {
            metadataURI = assetFields.metadata_uri;
          }
          console.log(`🔗 Final metadata URI for ${assetId}: ${metadataURI || 'Not found'}`);

          // Fetch metadata from IPFS if available
          let metadata: any = {};
          if (metadataURI && metadataURI.startsWith('ipfs://')) {
            console.log(`📥 Fetching metadata from IPFS for ${assetId}...`);
            const hash = metadataURI.replace('ipfs://', '');
            try {
              const response = await fetch(`${import.meta.env.VITE_PINATA_GATEWAY}${hash}`);
              if (response.ok) {
                metadata = await response.json();
                console.log(`✅ Successfully fetched metadata for ${assetId}:`, metadata);
              } else {
                console.warn(`⚠️ Failed to fetch metadata: HTTP ${response.status}`);
              }
            } catch (metadataError) {
              console.error(`❌ Error fetching metadata from IPFS:`, metadataError);
            }
          }

          // Get total supply and available tokens info from the correct fields
          const totalSupply = assetFields.total_supply || listingFields.total_supply || 1;
          const availableTokens = listingFields.available_quantity || totalSupply; 
          const pricePerToken = listingFields.price_per_unit?.toString() || '0'; // Fixed: use price_per_unit from contract
          
          console.log(`💰 Price extraction for ${assetId}:`, {
            listingFields,
            price_per_unit: listingFields.price_per_unit,
            pricePerToken,
            totalSupply,
            availableTokens
          });
          
          // Transform the data for the frontend
          const transformedData = {
            tokenId: assetId,
            name: metadata.name || 'Unnamed Asset',
            description: metadata.description || 'No description.',
            image: metadata.image ? `${import.meta.env.VITE_PINATA_GATEWAY}${metadata.image.replace('ipfs://', '')}` : '/placeholder.svg',
            price: pricePerToken,
            pricePerToken: pricePerToken, // Individual token price
            totalSupply: totalSupply, // Total tokens minted
            amount: availableTokens, // Available tokens for purchase
            availableTokens: availableTokens, // Alias for clarity
            seller: listingFields.seller || '',
            metadataURI: metadataURI,
            isNft: !assetFields.total_supply,
            attributes: metadata.attributes || [],
            // Additional metadata for display
            assetType: metadata.assetType || 'Unknown',
            baseCurrency: metadata.baseCurrency || 'OCT',
            pricePerTokenOCT: metadata.pricePerTokenOCT || 1,
            tokenRewards: metadata.tokenRewards || 0,
          };
          
          console.log(`📦 Final transformed data for ${assetId}:`, transformedData);
          return transformedData;
        } catch (e) {
          console.error(`❌ Error processing listing ${field.objectId}:`, e);
          return null;
        }
      });

      // 5. Wait for all listings to be processed
      const listings = (await Promise.all(listingsPromises)).filter(item => item !== null);
      console.log(`✅ Successfully processed ${listings.length}/${dynamicFields.data.length} marketplace listings`);
      
      if (listings.length > 0) {
        console.log('📋 Sample listing data:', listings[0]);
      }
      
      return listings;

    } catch (error) {
      console.error('❌ Critical error occurred while fetching marketplace listings:', error);
      console.error('Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      throw new Error(`Failed to fetch listings from the blockchain: ${(error as Error).message}`);
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
    // Use the same registry ID as other functions
    issuerRegistryId: string = '0x5cb11f0d91fca68482f8fce83902d00f9b364fdd40080784ad171ec3137e17a7'
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
          tx.pure(new Uint8Array(new TextEncoder().encode(name))), // 3. Pass name as vector<u8>
          tx.pure(new Uint8Array(new TextEncoder().encode(metadataURI))), // 4. Pass metadata URI as vector<u8>
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
   * Get user's OCT wallet balance (simplified version for dashboard analytics)
   */
  async getUserOCTBalance(address: string): Promise<number> {
    try {
      console.log('💰 Getting OCT balance for dashboard:', address);
      
      // Try to get balance using the most reliable method
      const octBalance = await this.suiClient.getBalance({
        owner: address,
        coinType: ONECHAIN_CONTRACTS.OCT_COIN_TYPE,
      });
      
      if (octBalance && octBalance.totalBalance) {
        const balanceInOCT = parseFloat(octBalance.totalBalance) / 1000000000; // Convert from MIST to OCT
        console.log('✅ OCT balance found:', balanceInOCT, 'OCT');
        return balanceInOCT;
      }
      
      // If no balance found, try alternative coin types
      for (const coinType of [
        ONECHAIN_CONTRACTS.OCT_COIN_TYPE_ALT1,
        ONECHAIN_CONTRACTS.OCT_COIN_TYPE_ALT2,
        ONECHAIN_CONTRACTS.SUI_COIN_TYPE // Fallback to SUI if OCT not available
      ]) {
        try {
          const balance = await this.suiClient.getBalance({
            owner: address,
            coinType: coinType,
          });
          
          if (balance && balance.totalBalance) {
            const balanceValue = parseFloat(balance.totalBalance) / 1000000000;
            console.log(`✅ Balance found with ${coinType}:`, balanceValue);
            return balanceValue;
          }
        } catch (error) {
          console.log(`❌ Failed to get balance with ${coinType}`);
        }
      }
      
      console.log('⚠️ No OCT balance found, returning 0');
      return 0;
    } catch (error) {
      console.error('Error getting OCT balance:', error);
      return 0; // Return 0 if we can't fetch balance
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
