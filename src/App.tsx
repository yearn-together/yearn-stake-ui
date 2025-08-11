import React, { useState, useEffect } from 'react';
import { ProgressBar } from './components/ProgressBar';
import { WalletConnection } from './components/WalletConnection';
import { AdminChatBot } from './components/AdminChatBot';
import { DeploymentStatus } from './components/DeploymentStatus';
import { PaymentSection } from './components/PaymentSection';
import { DownloadSection } from './components/DownloadSection';
import { Zap } from 'lucide-react';

// Global declarations for TypeScript
declare global {
  interface Window {
    ethereum: any;
  }
}

interface Step {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed' | 'locked';
}

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [contractConfig, setContractConfig] = useState<any>(null);
  const [contractAddress, setContractAddress] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [completedFunctions, setCompletedFunctions] = useState<string[]>([]);
  const [isOwnershipTransferred, setIsOwnershipTransferred] = useState(false);
  const [dappReady, setDappReady] = useState(false);
  const [functionConfigurations, setFunctionConfigurations] = useState<{ [key: string]: any[] }>({
    setReferralRewardTiers: [],
    createPackage: [],
    addValidComposition: [],
    setStarLevelTiers: [],
    setMaxStarLevel: [],
    setMaxReferralLevel: [],
    setGoldenStarConfig: []
  });
  const [showDownload, setShowDownload] = useState(false);

  const steps: Step[] = [
    {
      id: 'connect',
      title: 'Connect Wallet',
      description: 'Connect your MetaMask wallet',
      status: walletConnected ? 'completed' : currentStep === 0 ? 'current' : 'pending'
    },
    {
      id: 'build',
      title: 'Build & Deploy',
      description: 'Create and deploy your contract',
      status: contractAddress ? 'completed' : currentStep === 1 ? 'current' : walletConnected ? 'pending' : 'locked'
    },
    {
      id: 'admin',
      title: 'Admin Setup',
      description: 'Execute admin functions',
      status: completedFunctions.length === 7 ? 'completed' : currentStep === 2 ? 'current' : contractAddress ? 'pending' : 'locked'
    },
    {
      id: 'payment',
      title: 'Payment & Transfer',
      description: 'Pay fee and transfer ownership',
      status: isOwnershipTransferred ? 'completed' : currentStep === 3 ? 'current' : completedFunctions.length === 7 ? 'pending' : 'locked'
    },
    {
      id: 'complete',
      title: 'Download DApp',
      description: 'Get your staking DApp',
      status: dappReady ? 'completed' : currentStep === 4 ? 'current' : isOwnershipTransferred ? 'pending' : 'locked'
    }
  ];

  const handleWalletConnection = (connected: boolean, address?: string) => {
    setWalletConnected(connected);
    if (address) {
      setWalletAddress(address);
    }
    if (connected && currentStep === 0) {
      setCurrentStep(1);
    }
  };

  const handleContractGenerated = (config: any) => {
    setContractConfig(config);
    
    // Update contract address and tx hash if provided
    if (config.contractAddress) {
      setContractAddress(config.contractAddress);
    }
    if (config.txHash) {
      setTxHash(config.txHash);
    }
    
    if (currentStep === 1) {
      // Move to admin setup step after contract deployment
      if (config.contractAddress) {
        setCurrentStep(2);
      }
    }
  };

  const handleFunctionExecute = (functionId: string, config: any, action: 'add' | 'update' | 'delete' = 'add', index?: number) => {
    // Update function configurations
    setFunctionConfigurations(prev => {
      const updated = { ...prev };
      
      if (action === 'add') {
        updated[functionId] = [...(updated[functionId] || []), config];
      } else if (action === 'update' && index !== undefined) {
        updated[functionId] = updated[functionId].map((item, i) => i === index ? config : item);
      } else if (action === 'delete' && index !== undefined) {
        updated[functionId] = updated[functionId].filter((_, i) => i !== index);
      }
      
      return updated;
    });
    
    // Mark function as completed if not already
    if (!completedFunctions.includes(functionId)) {
      setCompletedFunctions(prev => [...prev, functionId]);
    }
    
    // Check if all functions are completed
    const allFunctionsCompleted = Object.keys(functionConfigurations).every(key => 
      completedFunctions.includes(key) || key === functionId
    );
    
    if (allFunctionsCompleted && currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePaymentAndTransfer = () => {
    // Simulate payment and ownership transfer
    setTimeout(() => {
      setIsOwnershipTransferred(true);
      setCurrentStep(4);
      setTimeout(() => {
        setDappReady(true);
      }, 1000);
    }, 3000);
  };

  const handleDownloadDapp = () => {
    // Simulate DApp download
    alert('DApp package downloaded successfully!');
  };

  useEffect(() => {
    if (completedFunctions.length === 7 && currentStep === 2) {
      setCurrentStep(3);
    }
  }, [completedFunctions.length, currentStep]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Neural Network Background */}
        <div className="neural-network">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i}>
              <div
                className="neural-node animate-neural-pulse"
                style={{
                  left: `${10 + (i * 6)}%`,
                  top: `${20 + Math.sin(i) * 30}%`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
              {i < 14 && (
                <div
                  className="neural-connection animate-data-flow"
                  style={{
                    left: `${10 + (i * 6)}%`,
                    top: `${20 + Math.sin(i) * 30}%`,
                    width: '6%',
                    transform: `rotate(${Math.atan2(
                      (20 + Math.sin(i + 1) * 30) - (20 + Math.sin(i) * 30),
                      6
                    )}rad)`,
                    animationDelay: `${i * 0.3}s`
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-float delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-float delay-2000"></div>
          
          {/* Floating AI Elements */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-32 h-32 border-2 border-blue-400/30 rounded-full animate-pulse-ring"></div>
              <div className="absolute inset-4 w-24 h-24 border border-purple-400/40 rounded-full animate-pulse-ring delay-500"></div>
              <div className="absolute inset-8 w-16 h-16 border border-cyan-400/50 rounded-full animate-pulse-ring delay-1000"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center ai-glow animate-pulse">
                <Zap className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div className="absolute -inset-2 border-2 border-cyan-400/50 rounded-full animate-pulse-ring"></div>
            </div>
            <div className="text-left">
              <h1 className="text-5xl font-bold text-white drop-shadow-2xl">
                AI-Powered Staking
              </h1>
              <div className="text-2xl font-semibold text-cyan-300 drop-shadow-lg mt-2">
                No-Code DApp Builder
              </div>
            </div>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-cyan-400/30">
              <p className="text-xl text-white leading-relaxed">
                🤖 <span className="font-semibold text-cyan-300">Artificial Intelligence</span> meets 
                <span className="font-semibold text-blue-300"> Blockchain Technology</span>. 
                Create professional staking platforms with our 
                <span className="font-semibold text-cyan-200"> AI-driven builder</span> - 
                no coding required, just pure innovation.
              </p>
              
              <div className="flex items-center justify-center gap-8 mt-4 text-sm text-cyan-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
                  <span>Zero Code</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-600"></div>
                  <span>Instant Deploy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-900"></div>
                  <span>Full Ownership</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Features Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-cyan-400/40 animate-float">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mb-4 ai-glow">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">🧠 AI Smart Contracts</h3>
            <p className="text-cyan-100 text-sm">
              Our AI analyzes your requirements and generates optimized smart contracts with advanced features automatically.
            </p>
          </div>
          
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/40 animate-float delay-500">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-4 ai-glow">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">⚡ Instant Configuration</h3>
            <p className="text-blue-100 text-sm">
              AI-powered configuration system that sets up complex staking parameters, rewards, and governance in seconds.
            </p>
          </div>
          
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-green-400/40 animate-float delay-1000">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mb-4 ai-glow">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">🚀 Auto-Deploy</h3>
            <p className="text-green-100 text-sm">
              Automated deployment pipeline that handles blockchain interactions, testing, and optimization without human intervention.
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBar steps={steps} currentStep={currentStep} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <WalletConnection onConnectionChange={handleWalletConnection} />
            
            {/* AI Documentation Section */}
            <div className="bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-400/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center ai-glow animate-pulse">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -inset-1 border border-cyan-400/50 rounded-full animate-pulse-ring"></div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    AI-Powered Staking Revolution
                  </h3>
                  <p className="text-cyan-300 text-sm">Powered by Advanced Machine Learning</p>
                </div>
              </div>
              
              <div className="space-y-4 text-white">
                <div>
                  <h4 className="font-semibold text-cyan-200 mb-2 flex items-center gap-2">
                    🤖 <span>AI-Driven No-Code Solution</span>
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Our advanced AI system analyzes blockchain patterns, optimizes smart contract architecture, 
                    and generates production-ready staking platforms. Machine learning algorithms ensure 
                    maximum security, efficiency, and user experience.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-blue-200 mb-2 flex items-center gap-2">
                    ⚡ <span className="text-blue-400">Neural Network Features</span>
                  </h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
                      AI-optimized multi-token staking algorithms
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-100"></div>
                      Machine learning reward distribution system
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse delay-200"></div>
                      Neural network referral optimization
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse delay-300"></div>
                      AI-powered golden star achievement engine
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse delay-400"></div>
                      Intelligent APR calculation and optimization
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-500"></div>
                      Automated ownership transfer protocols
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-green-200 mb-2 flex items-center gap-2">
                    🧠 <span className="text-green-400">AI Process Flow</span>
                  </h4>
                  <div className="text-gray-300 text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center text-xs font-bold text-white ai-glow animate-pulse">1</span>
                      <span>AI analyzes wallet and token compatibility</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-xs font-bold text-white ai-glow animate-pulse delay-200">2</span>
                      <span>Neural networks generate optimized smart contracts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-xs font-bold text-white ai-glow animate-pulse delay-400">3</span>
                      <span>AI handles payment processing and ownership transfer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-xs font-bold text-white ai-glow animate-pulse delay-600">4</span>
                      <span>Machine learning configures advanced parameters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center text-xs font-bold text-white ai-glow animate-pulse delay-800">5</span>
                      <span>AI generates complete DApp with frontend & backend</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-400/40">
                  <h4 className="font-semibold text-cyan-200 mb-2 flex items-center gap-2">
                    🎯 <span>AI-Powered Innovation For</span>
                  </h4>
                  <p className="text-gray-300 text-sm">
                    🚀 <strong>DeFi Pioneers</strong> leveraging AI for competitive advantage<br/>
                    🏛️ <strong>DAOs</strong> seeking automated governance solutions<br/>
                    👥 <strong>Token Communities</strong> wanting intelligent reward systems<br/>
                    💡 <strong>Entrepreneurs</strong> building next-generation financial products
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Yearn Staking Builder Chat */}
            {walletConnected && (
              <AdminChatBot 
                onFunctionComplete={handleFunctionExecute}
                completedFunctions={completedFunctions}
                functionConfigurations={functionConfigurations}
                onContractGenerated={handleContractGenerated}
              />
            )}
            
            {/* Deployment Status */}
            {contractAddress && (
              <DeploymentStatus
                contractAddress={contractAddress}
                txHash={txHash}
                isOwnershipTransferred={isOwnershipTransferred}
                dappReady={dappReady}
                onDownloadDapp={handleDownloadDapp}
                paymentCompleted={paymentCompleted}
                onShowDownload={() => setShowDownload(true)}
              />
            )}
          </div>
        </div>
      </div>
    </div>

  );
}

export default App;