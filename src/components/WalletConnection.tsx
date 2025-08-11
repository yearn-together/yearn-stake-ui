import React, { useState, useEffect } from 'react';
import { Wallet, CheckCircle, AlertCircle } from 'lucide-react';

interface WalletConnectionProps {
  onConnectionChange: (connected: boolean, address?: string) => void;
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({ onConnectionChange }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to continue');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      setAddress(account);
      setIsConnected(true);
      onConnectionChange(true, account);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress('');
    onConnectionChange(false);
  };

  useEffect(() => {
    // Check if wallet is already connected
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
            onConnectionChange(true, accounts[0]);
          }
        });
    }
  }, [onConnectionChange]);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 holographic-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`
              w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ai-glow
              ${isConnected 
                ? 'bg-gradient-to-r from-green-400 to-green-500 animate-hologram' 
                : 'bg-gradient-to-r from-orange-400 to-red-400 animate-pulse'
              }
            `}>
              {isConnected ? (
                <CheckCircle className="w-7 h-7 text-white animate-pulse" />
              ) : (
                <AlertCircle className="w-7 h-7 text-white animate-bounce" />
              )}
            </div>
            {isConnected && (
              <div className="absolute -inset-2 border-2 border-green-400/50 rounded-full animate-pulse-ring"></div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              {isConnected ? (
                <>
                  🤖 <span className="text-green-400">AI Wallet Interface</span>
                </>
              ) : (
                <>
                  🔗 <span className="animate-typewriter">Connect AI Wallet</span>
                </>
              )}
            </h3>
            <p className="text-sm text-white/70">
              {isConnected 
                ? (
                  <span className="font-mono text-green-400">
                    🔐 {address.slice(0, 8)}...{address.slice(-6)}
                  </span>
                ) : (
                  <span className="animate-pulse">
                    🚀 Initialize AI-powered wallet connection
                  </span>
                )
              }
            </p>
          </div>
        </div>
        
        <button
          onClick={isConnected ? disconnectWallet : connectWallet}
          disabled={isConnecting}
          className={`
            px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ai-glow
            ${isConnected
              ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white animate-pulse'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white animate-hologram'
            }
            ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isConnecting ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              🤖 AI Connecting...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              {isConnected ? '🔌 Disconnect AI' : '🚀 Connect AI Wallet'}
            </div>
          )}
        </button>
      </div>
    </div>
  );
};