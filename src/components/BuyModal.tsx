import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { OneChainService } from '@/services/oneChainService';
import { useSuiWallet } from '@/context/SuiWalletContext';

interface BuyModalProps {
  asset: {
    tokenId: string;
    name: string;
    description?: string;
    price: string; // Price per token in MIST (OCT base units)
    amount: number; // Available amount
    image?: string;
    seller: string;
    metadata?: any;
  };
  onClose: () => void;
  onSuccess?: () => void;
  octPrice: number; // OCT price in USD for display
}

const BuyModal: React.FC<BuyModalProps> = ({ asset, onClose, onSuccess, octPrice }) => {
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const { account, suiClient, signAndExecuteTransaction } = useSuiWallet();

  const formatOCTPrice = (mistAmount: string | number): string => {
    const octAmount = typeof mistAmount === 'string' 
      ? parseFloat(mistAmount) / 1000000000
      : mistAmount / 1000000000;
    return `${octAmount.toFixed(4)} OCT`;
  };

  const formatPriceInUSD = (octAmount: number, octPrice: number): string => {
    const usdValue = octAmount * octPrice;
    return `$${usdValue.toFixed(2)} USD`;
  };

  const handlePurchase = async () => {
    if (!account?.address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('=== OCT PURCHASE ===');
      console.log('Token ID:', asset.tokenId);
      console.log('Amount:', quantity);
      console.log('Price per token (MIST):', asset.price);
      
      // Price is already in MIST (OCT base units: 1 OCT = 10^9 MIST)
      const priceInMIST = parseInt(asset.price);
      const totalPriceInMIST = priceInMIST * quantity;
      
      console.log('Total payment (MIST):', totalPriceInMIST);

      const oneChainService = new OneChainService(suiClient);

      console.log('Calling OneChain purchaseAsset...');
      console.log('Parameters:', { 
        tokenId: asset.tokenId, 
        price: totalPriceInMIST, 
        buyerAddress: account.address 
      });
      
      const result = await oneChainService.purchaseAsset(
        asset.tokenId,
        totalPriceInMIST,
        account.address,
        signAndExecuteTransaction
      );

      if (result.success) {
        toast.dismiss();
        toast.success('Purchase successful! Asset purchased with OCT.');
        
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        throw new Error(result.error || 'Transaction failed');
      }

    } catch (error: any) {
      console.error('Purchase failed:', error);
      toast.dismiss();
      
      if (error.code === 4001 || error.message?.includes('User rejected')) {
        toast.error('Transaction cancelled by user');
      } else {
        toast.error(`Purchase failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate total cost in OCT for UI display (asset.price comes in MIST format 10^9)
  const pricePerTokenOCT = parseFloat(asset.price) / Math.pow(10, 9); // Convert MIST to OCT for display
  const totalCostOCT = pricePerTokenOCT * quantity;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Purchase Asset</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {asset.image && (
              <img
                src={asset.image}
                alt={asset.name}
                className="w-full h-48 object-cover rounded-xl"
              />
            )}

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{asset.name}</h3>
              {asset.description && (
                <p className="text-gray-600 text-sm mb-4">{asset.description}</p>
              )}
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200/50">
                  <div className="text-blue-600 text-sm font-medium">Platform ID</div>
                  <div className="text-blue-900 font-semibold mt-1">#{asset.tokenId}</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200/50">
                  <div className="text-green-600 text-sm font-medium">Available</div>
                  <div className="text-green-900 font-semibold mt-1">{asset.amount} tokens</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200/50 mb-4">
                <div className="text-gray-600 text-sm font-medium">Price per Token</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {formatPriceInUSD(pricePerTokenOCT, octPrice)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {pricePerTokenOCT.toFixed(4)} OCT each
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity to Purchase
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  disabled={quantity <= 1 || isProcessing}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={asset.amount}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(asset.amount, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                  disabled={isProcessing}
                />
                <button
                  onClick={() => setQuantity(Math.min(asset.amount, quantity + 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  disabled={quantity >= asset.amount || isProcessing}
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum: {asset.amount} tokens available
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200/50">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Total Cost:</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900 block">
                    {formatPriceInUSD(totalCostOCT, octPrice)}
                  </span>
                  <span className="text-sm text-gray-600">
                    {totalCostOCT.toFixed(4)} OCT
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {quantity} token{quantity > 1 ? 's' : ''} × {formatPriceInUSD(pricePerTokenOCT, octPrice)} each
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200/50">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-yellow-600 mt-0.5">⚠️</div>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Important Notice:</p>
                  <p>This is a real blockchain transaction. Ensure you have sufficient OCT in your wallet to complete the purchase.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <Button
              onClick={handlePurchase}
              disabled={isProcessing || quantity <= 0 || quantity > asset.amount}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : `Buy ${quantity} Token${quantity > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyModal;
