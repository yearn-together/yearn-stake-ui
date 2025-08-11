import React from 'react';
import { Rocket, Download, ExternalLink, CheckCircle } from 'lucide-react';

interface DeploymentStatusProps {
  contractAddress?: string;
  txHash?: string;
  isOwnershipTransferred: boolean;
  dappReady: boolean;
  onDownloadDapp: () => void;
  paymentCompleted: boolean;
  onShowDownload: () => void;
}

export const DeploymentStatus: React.FC<DeploymentStatusProps> = ({
  contractAddress,
  txHash,
  isOwnershipTransferred,
  dappReady,
  onDownloadDapp,
  paymentCompleted,
  onShowDownload
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 holographic-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center ai-glow animate-hologram">
            <Rocket className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div className="absolute -inset-1 border border-green-400/50 rounded-full animate-pulse-ring"></div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            🚀 AI Deployment Center
          </h3>
          <p className="text-white/60 text-sm">Real-time blockchain monitoring</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {contractAddress && (
          <div className="bg-white/5 rounded-xl p-4 border border-green-400/20 holographic-border">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400 animate-bounce" />
              <h4 className="font-semibold text-white flex items-center gap-2">
                🤖 <span className="text-green-400">AI Contract Deployed</span>
              </h4>
            </div>
            <p className="text-sm text-white/70 mb-2">🔗 Smart Contract Address:</p>
            <div className="flex items-center gap-2 p-3 bg-black/30 rounded-lg border border-green-400/30 ai-glow">
              <code className="text-green-400 text-sm font-mono flex-1 animate-pulse">
                {contractAddress}
              </code>
              <button 
                onClick={() => window.open(`https://etherscan.io/address/${contractAddress}`, '_blank')}
                className="text-blue-400 hover:text-blue-300 transition-colors ai-glow animate-pulse"
                title="View on Etherscan"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        
        {txHash && (
          <div className="bg-white/5 rounded-xl p-4 border border-blue-400/20 holographic-border">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400 animate-bounce delay-200" />
              <h4 className="font-semibold text-white flex items-center gap-2">
                ⚡ <span className="text-blue-400">AI Transaction Confirmed</span>
              </h4>
            </div>
            <p className="text-sm text-white/70 mb-2">🔐 Blockchain Transaction Hash:</p>
            <div className="flex items-center gap-2 p-3 bg-black/30 rounded-lg border border-blue-400/30 ai-glow">
              <code className="text-blue-400 text-sm font-mono flex-1 animate-pulse">
                {txHash}
              </code>
              <button 
                onClick={() => window.open(`https://etherscan.io/tx/${txHash}`, '_blank')}
                className="text-cyan-400 hover:text-cyan-300 transition-colors ai-glow animate-pulse"
                title="View on Etherscan"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        
        {isOwnershipTransferred && (
          <div className="bg-white/5 rounded-xl p-4 border border-purple-400/20 holographic-border">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400 animate-bounce delay-400" />
              <h4 className="font-semibold text-white flex items-center gap-2">
                👑 <span className="text-purple-400">AI Ownership Transferred</span>
              </h4>
            </div>
            <p className="text-sm text-white/70">
              🤖 AI has successfully transferred smart contract ownership to your wallet address.
            </p>
          </div>
        )}
        
        {paymentCompleted && (
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-blue-400/30 holographic-border animate-hologram">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                  🎉 <span className="text-cyan-400 animate-typewriter">AI DApp Ready!</span>
                </h4>
                <p className="text-sm text-white/90">
                  🤖 Complete AI admin configuration to download your intelligent staking DApp.
                </p>
              </div>
              <button
                onClick={onShowDownload}
                disabled={!dappReady}
                className={`
                  px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2 ai-glow
                  ${dappReady 
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white animate-hologram' 
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed animate-pulse'
                  }
                `}
              >
                <Download className="w-4 h-4" />
                {dappReady ? '🚀 Download AI DApp' : '⚙️ Configure AI First'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};