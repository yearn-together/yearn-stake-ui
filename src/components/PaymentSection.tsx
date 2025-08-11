import React, { useState } from 'react';
import { CreditCard, CheckCircle, Loader, Zap } from 'lucide-react';

interface PaymentSectionProps {
  contractAddress: string;
  walletAddress: string;
  onPaymentComplete: () => void;
  onOwnershipTransferred: () => void;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  contractAddress,
  walletAddress,
  onPaymentComplete,
  onOwnershipTransferred
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing (replace with actual payment logic)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      onPaymentComplete();
      
      // Automatically start ownership transfer after payment
      setIsTransferring(true);
      
      /*const response = await fetch('http://localhost:4000/api/admin/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'transferOwnership',
          payload: { newOwner: walletAddress }
        })
      });

      const result = await response.json();

      if (result.success || result.message?.includes('success')) {
        onOwnershipTransferred();
      } else {
        throw new Error(result.error || result.message || 'Ownership transfer failed');
      }*/
    } catch (error) {
      console.error('Payment/Transfer error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setIsTransferring(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-md w-full mx-4 border border-white/20 shadow-2xl animate-slideUp">
        {/* Glowing Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg shadow-yellow-500/50">
            <CreditCard className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Complete Payment</h2>
          <p className="text-white/70">Finalize your staking DApp deployment</p>
        </div>

        {/* Payment Details */}
        <div className="bg-white/10 rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white/80">Setup Fee:</span>
            <span className="text-3xl font-bold text-white">0.1 ETH</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Contract:</span>
              <span className="text-white/80 font-mono">{contractAddress.slice(0, 10)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Transfer to:</span>
              <span className="text-white/80 font-mono">{walletAddress.slice(0, 10)}...</span>
            </div>
          </div>
        </div>

        {/* Status Display */}
        {(isProcessing || isTransferring) && (
          <div className="bg-blue-500/20 rounded-2xl p-4 mb-6 border border-blue-400/30">
            <div className="flex items-center gap-3">
              <Loader className="w-5 h-5 text-blue-400 animate-spin" />
              <div>
                <p className="text-blue-300 font-semibold">
                  {isProcessing && !isTransferring ? 'Processing Payment...' : 'Transferring Ownership...'}
                </p>
                <p className="text-blue-400/70 text-sm">
                  {isProcessing && !isTransferring ? 'Please confirm in your wallet' : 'Executing blockchain transaction'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing || isTransferring}
          className={`
            w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform
            ${isProcessing || isTransferring
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 hover:scale-105 shadow-lg shadow-green-500/30 animate-glow'
            }
            text-white flex items-center justify-center gap-3
          `}
        >
          {isProcessing || isTransferring ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              {isProcessing && !isTransferring ? 'Processing...' : 'Transferring...'}
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Pay 0.1 ETH & Transfer Ownership
            </>
          )}
        </button>

        <p className="text-center text-white/50 text-sm mt-4">
          This will complete your DApp setup and transfer contract ownership to your wallet
        </p>
      </div>
    </div>
  );
};