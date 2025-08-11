import React, { useState } from 'react';
import { Download, CheckCircle, ExternalLink, Sparkles, Gift } from 'lucide-react';

interface DownloadSectionProps {
  contractAddress: string;
  onDownloadComplete: () => void;
}

export const DownloadSection: React.FC<DownloadSectionProps> = ({
  contractAddress,
  onDownloadComplete
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      const downloadUrl = `http://localhost:4000/api/finalize?contractAddress=${contractAddress}`;
      
      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `staking-dapp-${contractAddress.slice(0, 8)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Simulate download completion
      setTimeout(() => {
        setDownloadComplete(true);
        onDownloadComplete();
      }, 2000);
      
    } catch (error) {
      console.error('Download error:', error);
      alert(`Download failed: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-green-800 to-blue-900 rounded-3xl p-8 max-w-lg w-full mx-4 border border-green-400/30 shadow-2xl animate-slideUp">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce shadow-lg shadow-green-500/50">
            <Gift className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            DApp Ready!
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
          </h2>
          <p className="text-white/80">Your custom staking platform is ready for download</p>
        </div>

        {/* Success Details */}
        <div className="bg-white/10 rounded-2xl p-6 mb-6 border border-white/20">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-white">Contract Deployed Successfully</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-white">Payment Completed</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-white">Ownership Transferred</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-white">Admin Functions Configured</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Contract Address:</span>
              <div className="flex items-center gap-2">
                <code className="text-green-400 font-mono text-sm">{contractAddress.slice(0, 10)}...</code>
                <button 
                  onClick={() => window.open(`https://etherscan.io/address/${contractAddress}`, '_blank')}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Download Status */}
        {downloadComplete && (
          <div className="bg-green-500/20 rounded-2xl p-4 mb-6 border border-green-400/30 animate-slideDown">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-green-300 font-semibold">Download Complete!</p>
                <p className="text-green-400/70 text-sm">Your DApp package has been downloaded successfully</p>
              </div>
            </div>
          </div>
        )}

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`
            w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform
            ${isDownloading
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : downloadComplete
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:scale-105 shadow-lg shadow-blue-500/30 animate-glow'
            }
            text-white flex items-center justify-center gap-3
          `}
        >
          {isDownloading ? (
            <>
              <Download className="w-5 h-5 animate-bounce" />
              Downloading...
            </>
          ) : downloadComplete ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Downloaded Successfully
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download Staking DApp
            </>
          )}
        </button>

        {!downloadComplete && (
          <p className="text-center text-white/50 text-sm mt-4">
            Get your complete staking DApp with smart contracts, frontend, and documentation
          </p>
        )}

        {downloadComplete && (
          <div className="text-center mt-6">
            <p className="text-white/70 text-sm mb-2">🎉 Congratulations! Your staking DApp is ready to deploy.</p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-400 hover:text-blue-300 text-sm underline transition-colors"
            >
              Create Another DApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
};