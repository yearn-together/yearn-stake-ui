import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Settings, CheckCircle, Edit3, Plus, Trash2, Copy, Check, X, Zap, RefreshCw, Download } from 'lucide-react';
import { PaymentSection } from './PaymentSection';
import { DownloadSection } from './DownloadSection';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  hasJsonEditor?: boolean;
  jsonData?: any;
  hasContractForm?: boolean;
  hasConfirmation?: boolean;
  confirmationData?: {
    functionId: string;
    config: any;
    action: 'add' | 'update' | 'delete';
    index?: number;
  };
  hasActionButtons?: boolean;
  actionButtons?: {
    label: string;
    action: string;
    variant: 'primary' | 'secondary' | 'success' | 'danger';
  }[];
  hasQuickButtons?: boolean;
  quickButtons?: {
    label: string;
    action: string;
    variant: 'primary' | 'secondary' | 'success';
  }[];
}

interface AdminFunction {
  id: string;
  label: string;
  prompt: string;
  defaultConfig: any;
  status: 'pending' | 'active' | 'completed';
  allowMultiple: boolean;
  configurations: any[];
}

interface AdminChatBotProps {
  onFunctionComplete: (functionId: string, config: any, action?: 'add' | 'update' | 'delete', index?: number) => void;
  completedFunctions: string[];
  functionConfigurations: { [key: string]: any[] };
  onContractGenerated?: (config: any) => void;
}

export const AdminChatBot: React.FC<AdminChatBotProps> = ({ 
  onFunctionComplete, 
  completedFunctions,
  functionConfigurations,
  onContractGenerated
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "🚀 **Welcome to the Yearn Staking DApp Builder!**\n\nI'll help you create and configure your staking contract. Let's start:\n\n**Step 1:** Create your contract first, then configure admin functions.\n\nChoose an option to begin:",
      timestamp: new Date(),
      hasQuickButtons: true,
      quickButtons: [
        { label: '💠 Create Contract', action: 'create_contract', variant: 'primary' },
        { label: '📊 View Status', action: 'status', variant: 'secondary' }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentFunction, setCurrentFunction] = useState<string | null>(null);
  const [editingJson, setEditingJson] = useState<string>('');
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [pendingExecution, setPendingExecution] = useState<any>(null);
  const [multipleEntryMode, setMultipleEntryMode] = useState(false);
  const [pendingConfigurations, setPendingConfigurations] = useState<any[]>([]);
  const [contractConfig, setContractConfig] = useState<any>(null);
  const [contractAddress, setContractAddress] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isOwnershipTransferring, setIsOwnershipTransferring] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [ownershipTransferred, setOwnershipTransferred] = useState(false);
  const [showContractForm, setShowContractForm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [contractFormData, setContractFormData] = useState({
    yYearnToken: '',
    sYearnToken: '',
    pYearnToken: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Backend API base URL
  const API_BASE = 'http://localhost:4000/api';

  const adminFunctions: AdminFunction[] = [
    {
      id: 'setReferralRewardTiers',
      label: '🟢 Set Referral Rewards',
      prompt: 'Configure referral reward tiers with different percentages for various levels.',
      defaultConfig: [
        {
          "startLevel": 1,
          "endLevel": 5,
          "rewardPercent": 1000,
          "rewardToken": "0x0000000000000000000000000000000000000000"
        },
        {
          "startLevel": 6,
          "endLevel": 10,
          "rewardPercent": 500,
          "rewardToken": "0x0000000000000000000000000000000000000000"
        }
      ],
      status: completedFunctions.includes('setReferralRewardTiers') ? 'completed' : 'pending',
      allowMultiple: false,
      configurations: functionConfigurations.setReferralRewardTiers || []
    },
    {
      id: 'createPackage',
      label: '🟦 Create Package',
      prompt: 'Create staking packages with different durations, APR, and terms.',
      defaultConfig: {
        "durationYears": 1,
        "apr": 1200,
        "monthlyUnstake": false,
        "isActive": true,
        "minStakeAmount": "1000000000000000000",
        "monthlyPrincipalReturnPercent": 0,
        "monthlyAPRClaimable": true,
        "claimableInterval": 2592000,
        "stakeMultiple": "1000000000000000000"
      },
      status: completedFunctions.includes('createPackage') ? 'completed' : 'pending',
      allowMultiple: true,
      configurations: functionConfigurations.createPackage || []
    },
    {
      id: 'addValidComposition',
      label: '🟨 Add Token Composition',
      prompt: 'Define valid token compositions as percentage arrays.',
      defaultConfig: [50, 30, 20],
      status: completedFunctions.includes('addValidComposition') ? 'completed' : 'pending',
      allowMultiple: true,
      configurations: functionConfigurations.addValidComposition || []
    },
    {
      id: 'setStarLevelTiers',
      label: '🟣 Set Star Levels',
      prompt: 'Configure star level tiers with different reward percentages.',
      defaultConfig: [
        { "level": 1, "rewardPercent": 2500 },
        { "level": 2, "rewardPercent": 2000 },
        { "level": 3, "rewardPercent": 1500 },
        { "level": 4, "rewardPercent": 1000 },
        { "level": 5, "rewardPercent": 500 }
      ],
      status: completedFunctions.includes('setStarLevelTiers') ? 'completed' : 'pending',
      allowMultiple: false,
      configurations: functionConfigurations.setStarLevelTiers || []
    },
    {
      id: 'setMaxStarLevel',
      label: '🔵 Set Max Star Level',
      prompt: 'Set the maximum achievable star level.',
      defaultConfig: 5,
      status: completedFunctions.includes('setMaxStarLevel') ? 'completed' : 'pending',
      allowMultiple: false,
      configurations: functionConfigurations.setMaxStarLevel || []
    },
    {
      id: 'setMaxReferralLevel',
      label: '🔴 Set Max Referral Level',
      prompt: 'Set the maximum referral level depth.',
      defaultConfig: 15,
      status: completedFunctions.includes('setMaxReferralLevel') ? 'completed' : 'pending',
      allowMultiple: false,
      configurations: functionConfigurations.setMaxReferralLevel || []
    },
    {
      id: 'setGoldenStarConfig',
      label: '⭐ Set Golden Star Config',
      prompt: 'Configure Golden Star special achievement requirements and rewards.',
      defaultConfig: {
        "minReferrals": 10,
        "timeWindow": 2592000,
        "rewardPercent": 1000,
        "rewardDuration": 31536000,
        "rewardCapMultiplier": 10
      },
      status: completedFunctions.includes('setGoldenStarConfig') ? 'completed' : 'pending',
      allowMultiple: false,
      configurations: functionConfigurations.setGoldenStarConfig || []
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickButton = async (action: string) => {
    if (action.startsWith('function_')) {
      const functionId = action.replace('function_', '');
      handleFunctionSelect(functionId);
    } else if (action === 'create_contract') {
      handleCreateContract();
    } else if (action === 'status') {
      handleStatus();
    } else if (action === 'default') {
      handleDefaultConfig();
    } else if (action === 'customize') {
      handleCustomizeConfig();
    } else if (action === 'multiple') {
      handleMultipleMode();
    }
  };

  const handleCreateContract = async () => {
    setShowContractForm(true);
    addBotMessage(
      "📋 **Contract Creation Form**\n\nPlease fill in the details below to create your staking contract:",
      {
        hasContractForm: true
      }
    );
  };

  const handleContractFormSubmit = async () => {
    const prompt = `Create a staking project using yYearn: ${contractFormData.yYearnToken}, sYearn: ${contractFormData.sYearnToken}, pYearn: ${contractFormData.pYearnToken}`;
    
    setShowContractForm(false);
    addBotMessage("🔧 **Generating Contract Configuration...**\n\nAnalyzing your requirements and creating the optimal contract setup...");
    
    try {
      const response = await fetch(`${API_BASE}/chatLocal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: prompt }] 
        })
      });

      const data = await response.json();
      
      if (data?.config) {
        setContractConfig(data.config);
        onContractGenerated?.(data.config);
        
        addBotMessage(
          `✅ **Contract Configuration Generated!**\n\n**Tokens:**\n- yYearn: ${contractFormData.yYearnToken}\n- sYearn: ${contractFormData.sYearnToken}\n- pYearn: ${contractFormData.pYearnToken}\n\n\`\`\`json\n${JSON.stringify(data.config, null, 2)}\n\`\`\`\n\nReady to deploy your contract?`,
          {
            hasActionButtons: true,
            actionButtons: [
              { label: '🚀 Deploy Contract', action: 'deploy_contract', variant: 'success' },
              { label: '✏️ Edit Details', action: 'edit_contract_form', variant: 'secondary' }
            ]
          }
        );
      } else {
        addBotMessage("❌ **Configuration Generation Failed**\n\nPlease try again or contact support.");
      }
    } catch (error) {
      addBotMessage(`❌ **Error:** ${error.message}\n\nPlease check your connection and try again.`);
    }
  };

  const handleContractFormCancel = () => {
    setShowContractForm(false);
    addBotMessage("❌ **Contract Creation Cancelled**\n\nYou can try again anytime by clicking the 'Create Contract' button.");
  };

  const handleDeployContract = async () => {
    if (!contractConfig) {
      addBotMessage("❌ **No Configuration Found**\n\nPlease generate a contract configuration first.");
      return;
    }

    setIsDeploying(true);
    addBotMessage("🚀 **Deploying Contract...**\n\nSubmitting to blockchain. This may take a few minutes...");

    try {
      const response = await fetch(`${API_BASE}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractConfig)
      });

      const data = await response.json();

      if (data?.success && data.contractAddress) {
        setContractAddress(data.contractAddress);
        setTxHash(data.txHash || data.transactionHash || '');
        
        // Update parent component with deployment info
        onContractGenerated?.({
          ...contractConfig,
          contractAddress: data.contractAddress,
          txHash: data.txHash || data.transactionHash || ''
        });
        
        addBotMessage(
          `🎉 **Contract Deployed Successfully!**\n\n**Contract Address:** \`${data.contractAddress}\`\n${data.txHash ? `**Transaction Hash:** \`${data.txHash}\`\n` : ''}\nNow you need to complete payment and configure admin functions:`,
          {
            hasActionButtons: true,
            actionButtons: [
              { label: '📊 View Status', action: 'status', variant: 'secondary' }
            ]
          }
        );
        
        // Show external payment section
        setTimeout(() => {
          setShowPayment(true);
        }, 1000);
      } else {
        addBotMessage(`❌ **Deployment Failed:** ${data.detail || 'Unknown error'}\n\nPlease try again.`);
      }
    } catch (error) {
      addBotMessage(`❌ **Deployment Error:** ${error.message}\n\nPlease check your connection and try again.`);
    } finally {
      setIsDeploying(false);
    }
  };

  const handlePaymentComplete = () => {
    setPaymentCompleted(true);
    setShowPayment(false);
    addBotMessage("✅ **Payment Completed!**\n\nPayment successful and ownership transferred. You can now configure admin functions.");
  };

  const handleOwnershipTransferred = () => {
    setOwnershipTransferred(true);
    addBotMessage(
      `🎉 **Ownership Transferred Successfully!**\n\nContract ownership has been transferred to your wallet. You can now configure admin functions:`,
      {
        hasQuickButtons: true,
        quickButtons: [
          { label: '⚙️ Configure Admin Functions', action: 'start_admin', variant: 'primary' },
          { label: '📊 View Status', action: 'status', variant: 'secondary' }
        ]
      }
    );
  };

  const handleDownloadReady = () => {
    addBotMessage("🎉 **All Admin Functions Completed!**\n\nYour staking DApp is ready for download. The download section will appear outside the chat.");
  };

  const handleDownloadComplete = () => {
    setShowDownload(false);
    addBotMessage("✅ **Download Complete!**\n\nYour staking DApp has been downloaded successfully. You can now deploy it to your preferred hosting platform.");
  };

  const handleExecuteAdminFunction = async () => {
    if (!pendingExecution) return;

    setIsExecuting(true);
    const func = adminFunctions.find(f => f.id === pendingExecution.functionId);
    
    addBotMessage(`🚀 **Executing ${func?.label}...**\n\nSubmitting transaction to blockchain...`);

    try {
      const response = await fetch(`${API_BASE}/admin/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: pendingExecution.functionId,
          payload: pendingExecution.config
        })
      });

      const result = await response.json();

      if (result.success || result.message?.includes('success')) {
        // Execute the function locally
        if (Array.isArray(pendingExecution.config)) {
          pendingExecution.config.forEach((config: any) => {
            onFunctionComplete(pendingExecution.functionId, config, 'add');
          });
        } else {
          onFunctionComplete(
            pendingExecution.functionId, 
            pendingExecution.config, 
            pendingExecution.action,
            pendingExecution.index
          );
        }

        addBotMessage(
          `✅ **${func?.label} Executed Successfully!**\n\n${result.message || 'Function completed successfully.'}\n\nContinue with other configurations or check status.`,
          {
            hasQuickButtons: true,
            quickButtons: [
              { label: '📊 View Status', action: 'status', variant: 'secondary' },
              { label: '⚙️ Configure More', action: 'start_admin', variant: 'primary' }
            ]
          }
        );
        
        // Check if all functions are completed
        const allCompleted = adminFunctions.every(f => 
          completedFunctions.includes(f.id) || f.id === pendingExecution.functionId
        );
        
        if (allCompleted) {
          setTimeout(() => {
            handleDownloadReady();
          }, 2000);
        }
      } else {
        addBotMessage(`❌ **Execution Failed:** ${result.error || result.message || 'Unknown error'}\n\nPlease try again.`);
      }
    } catch (error) {
      addBotMessage(`❌ **Execution Error:** ${error.message}\n\nPlease check your connection and try again.`);
    } finally {
      setIsExecuting(false);
      setPendingExecution(null);
      setPendingConfigurations([]);
      setMultipleEntryMode(false);
      setCurrentFunction(null);
    }
  };

  const handleActionButton = (action: string) => {
    if (action === 'deploy_contract') {
      handleDeployContract();
    } else if (action === 'confirm_execute') {
      handleExecuteAdminFunction();
    } else if (action === 'cancel_execute') {
      setPendingExecution(null);
      addBotMessage("❌ **Execution Cancelled**\n\nYou can continue with other configurations.");
    } else if (action === 'add_more') {
      handleAddMore();
    } else if (action === 'submit_all') {
      handleSubmitAll();
    } else if (action === 'cancel_multiple') {
      handleCancelMultiple();
    } else if (action === 'start_admin') {
      handleStartAdmin();
    } else if (action === 'edit_contract_form') {
      handleCreateContract(); // Show form again for editing
    } else if (action === 'final_status') {
      handleFinalStatus();
    } else if (action === 'restart') {
      handleRestart();
    }
  };

  const handleFinalStatus = () => {
    let content = `🎯 **Final Project Status**\n\n`;
    
    if (contractAddress) {
      content += `✅ **Contract:** \`${contractAddress}\`\n`;
    }
    if (txHash) {
      content += `✅ **Transaction:** \`${txHash}\`\n`;
    }
    content += `✅ **Payment:** ${paymentCompleted ? 'Completed' : 'Pending'}\n`;
    content += `✅ **Ownership:** ${ownershipTransferred ? 'Transferred' : 'Pending'}\n`;
    content += `✅ **Admin Functions:** ${completedFunctions.length}/7 completed\n`;
    content += `✅ **DApp:** Ready for download\n\n`;
    content += `🚀 **Your staking platform is ready!**`;

    addBotMessage(content);
  };

  const handleRestart = () => {
    // Reset all states
    setContractConfig(null);
    setContractAddress('');
    setTxHash('');
    setPaymentCompleted(false);
    setOwnershipTransferred(false);
    setCurrentFunction(null);
    setPendingExecution(null);
    setPendingConfigurations([]);
    setMultipleEntryMode(false);
    
    addBotMessage(
      "🔄 **Starting New Project**\n\nWelcome back! Let's create another staking DApp:",
      {
        hasQuickButtons: true,
        quickButtons: [
          { label: '💠 Create Contract', action: 'create_contract', variant: 'primary' },
          { label: '📊 View Status', action: 'status', variant: 'secondary' }
        ]
      }
    );
  };

  const handleStartAdmin = () => {
    if (!ownershipTransferred) {
      addBotMessage("⚠️ **Ownership Transfer Required**\n\nPlease complete payment and ownership transfer before configuring admin functions.");
      return;
    }

    addBotMessage(
      `⚙️ **Admin Configuration Center**\n\nYour contract is deployed at: \`${contractAddress}\`\n\nSelect a function to configure:`,
      {
        hasQuickButtons: true,
        quickButtons: adminFunctions.slice(0, 3).map(func => ({
          label: func.label,
          action: `function_${func.id}`,
          variant: func.status === 'completed' ? 'success' : 'primary' as any
        }))
      }
    );

    // Add second row of buttons
    setTimeout(() => {
      addBotMessage(
        "**More Functions:**",
        {
          hasQuickButtons: true,
          quickButtons: adminFunctions.slice(3).map(func => ({
            label: func.label,
            action: `function_${func.id}`,
            variant: func.status === 'completed' ? 'success' : 'primary' as any
          }))
        }
      );
    }, 500);
  };

  const handleDefaultConfig = () => {
    const func = adminFunctions.find(f => f.id === currentFunction);
    if (!func) return;

    if (multipleEntryMode) {
      setPendingConfigurations(prev => [...prev, func.defaultConfig]);
      const currentCount = pendingConfigurations.length + 1;
      
      addBotMessage(
        `✅ **Default Configuration ${currentCount} Added!**\n\nWhat would you like to do next?`,
        {
          hasActionButtons: true,
          actionButtons: [
            { label: '➕ Add Another', action: 'add_more', variant: 'primary' },
            { label: '🚀 Submit All', action: 'submit_all', variant: 'success' },
            { label: '❌ Cancel All', action: 'cancel_multiple', variant: 'danger' }
          ]
        }
      );
    } else {
      addBotMessage(
        `📋 **Default Configuration for ${func.label}**\n\n\`\`\`json\n${JSON.stringify(func.defaultConfig, null, 2)}\n\`\`\``,
        {
          hasActionButtons: true,
          actionButtons: [
            { label: '✅ Confirm & Execute', action: 'confirm_execute', variant: 'success' },
            { label: '❌ Cancel', action: 'cancel_execute', variant: 'danger' }
          ]
        }
      );
      
      setPendingExecution({
        functionId: currentFunction,
        config: func.defaultConfig,
        action: 'add'
      });
    }
  };

  const handleCustomizeConfig = () => {
    const func = adminFunctions.find(f => f.id === currentFunction);
    if (!func) return;

    addBotMessage(`🎨 **Customize ${func.label}**\n\nHere's the configuration you can modify:`);
    
    const jsonMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: '',
      timestamp: new Date(),
      hasJsonEditor: true,
      jsonData: func.defaultConfig
    };
    
    setTimeout(() => {
      setMessages(prev => [...prev, jsonMessage]);
    }, 500);
  };

  const handleMultipleMode = () => {
    const func = adminFunctions.find(f => f.id === currentFunction);
    if (!func) return;

    setMultipleEntryMode(true);
    addBotMessage(`📝 **Multiple Entry Mode Activated**\n\nYou can now add multiple configurations for ${func.label}. Let's start with the first one:`);
    
    const jsonMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: '',
      timestamp: new Date(),
      hasJsonEditor: true,
      jsonData: func.defaultConfig
    };
    
    setTimeout(() => {
      setMessages(prev => [...prev, jsonMessage]);
    }, 500);
  };

  const handleAddMore = () => {
    const func = adminFunctions.find(f => f.id === currentFunction);
    if (!func) return;

    let nextConfig = { ...func.defaultConfig };
    
    // Auto-generate next logical configuration
    if (currentFunction === 'createPackage') {
      const durations = [1, 2, 3, 5];
      const aprs = [1200, 1500, 1800, 2400];
      const nextIndex = pendingConfigurations.length;
      
      nextConfig = {
        ...nextConfig,
        durationYears: durations[nextIndex] || durations[0],
        apr: aprs[nextIndex] || aprs[0]
      };
    }

    addBotMessage(`➕ **Adding Configuration ${pendingConfigurations.length + 1}**\n\nHere's the suggested configuration for the next entry:`);
    
    const jsonMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: '',
      timestamp: new Date(),
      hasJsonEditor: true,
      jsonData: nextConfig
    };
    
    setTimeout(() => {
      setMessages(prev => [...prev, jsonMessage]);
    }, 500);
  };

  const handleSubmitAll = () => {
    if (pendingConfigurations.length === 0) {
      addBotMessage("❌ No configurations to submit. Please add at least one configuration first.");
      return;
    }

    const func = adminFunctions.find(f => f.id === currentFunction);
    if (!func) return;

    let content = `🚀 **Ready to Submit ${pendingConfigurations.length} Configuration${pendingConfigurations.length > 1 ? 's' : ''}**\n\n`;
    content += `**${func.label}** - ${pendingConfigurations.length} entries:\n\n`;
    
    pendingConfigurations.forEach((config, index) => {
      content += `**${index + 1}.** ${config.name || config.description || `Configuration ${index + 1}`}\n`;
    });
    
    content += `\n⚠️ **This will execute ${pendingConfigurations.length} transaction${pendingConfigurations.length > 1 ? 's' : ''} on the blockchain and cannot be undone.**`;

    addBotMessage(content, {
      hasActionButtons: true,
      actionButtons: [
        { label: '✅ Confirm & Execute All', action: 'confirm_execute', variant: 'success' },
        { label: '❌ Cancel', action: 'cancel_execute', variant: 'danger' }
      ]
    });
    
    setPendingExecution({
      functionId: currentFunction!,
      config: pendingConfigurations,
      action: 'add_multiple'
    });
  };

  const handleCancelMultiple = () => {
    setPendingConfigurations([]);
    setMultipleEntryMode(false);
    setCurrentFunction(null);
    addBotMessage("❌ **Multiple Entry Mode Cancelled**\n\nAll pending configurations have been discarded. You can start over or select a different function.");
  };

  const handleStatus = () => {
    const completedCount = completedFunctions.length;
    const totalFunctions = adminFunctions.length;
    
    let content = `📊 **System Status**\n\n`;
    
    if (contractAddress) {
      content += `✅ **Contract Deployed:** \`${contractAddress}\`\n`;
      if (txHash) {
        content += `✅ **Transaction Hash:** \`${txHash}\`\n`;
      }
      content += `💳 **Payment:** ${paymentCompleted ? '✅ Completed' : '⏳ Pending'}\n`;
      content += `🔄 **Ownership:** ${ownershipTransferred ? '✅ Transferred' : '⏳ Pending'}\n\n`;
    } else {
      content += `⏳ **Contract:** Not deployed yet\n\n`;
    }
    
    content += `**Admin Functions (${completedCount}/${totalFunctions} completed):**\n\n`;
    
    adminFunctions.forEach(func => {
      const status = func.status === 'completed' ? '✅' : '⏳';
      const configCount = func.configurations.length;
      content += `${status} ${func.label}`;
      if (configCount > 0) {
        content += ` (${configCount} config${configCount > 1 ? 's' : ''})`;
      }
      content += '\n';
    });
    
    const quickButtons = [];
    
    if (contractAddress && !paymentCompleted) {
      quickButtons.push({ label: '💳 Complete Payment', action: 'start_payment', variant: 'success' });
    }
    
    if (ownershipTransferred && completedCount < totalFunctions) {
      quickButtons.push({ label: '⚙️ Configure Functions', action: 'start_admin', variant: 'primary' });
    }
    
    if (ownershipTransferred) {
      quickButtons.push({ label: '📥 Download DApp', action: 'download_dapp', variant: 'success' });
    }
    
    if (quickButtons.length > 0) {
      addBotMessage(content, {
        hasQuickButtons: true,
        quickButtons
      });
    } else {
      addBotMessage(content);
    }
  };

  const handleFunctionSelect = (functionId: string) => {
    const func = adminFunctions.find(f => f.id === functionId);
    if (!func) return;

    setCurrentFunction(functionId);
    setPendingConfigurations([]);
    setMultipleEntryMode(false);
    
    let content = `🔧 **${func.label} Configuration**\n\n${func.prompt}\n\n`;
    
    if (func.configurations.length > 0) {
      content += `**Current Configurations (${func.configurations.length}):**\n`;
      func.configurations.forEach((config, index) => {
        content += `${index + 1}. ${config.name || config.description || `Configuration ${index + 1}`}\n`;
      });
      content += '\n';
    }
    
    const quickButtons = [
      { label: '📋 Use Default', action: 'default', variant: 'secondary' as any },
      { label: '🎨 Customize', action: 'customize', variant: 'primary' as any }
    ];
    
    if (func.allowMultiple) {
      quickButtons.push({ label: '📝 Multiple Mode', action: 'multiple', variant: 'primary' as any });
    }
    
    addBotMessage(content, {
      hasQuickButtons: true,
      quickButtons
    });
  };

  const handleJsonEdit = (jsonData: any) => {
    setEditingJson(JSON.stringify(jsonData, null, 2));
    setShowJsonEditor(true);
  };

  const handleJsonSave = () => {
    try {
      const parsedJson = JSON.parse(editingJson);
      setShowJsonEditor(false);
      
      if (multipleEntryMode) {
        setPendingConfigurations(prev => [...prev, parsedJson]);
        
        const currentCount = pendingConfigurations.length + 1;
        
        addBotMessage(
          `✅ **Configuration ${currentCount} Added Successfully!**\n\n**Current Batch:** ${currentCount} configuration${currentCount > 1 ? 's' : ''} ready\n\nWhat would you like to do next?`,
          {
            hasActionButtons: true,
            actionButtons: [
              { label: '➕ Add Another', action: 'add_more', variant: 'primary' },
              { label: '🚀 Submit All', action: 'submit_all', variant: 'success' },
              { label: '❌ Cancel All', action: 'cancel_multiple', variant: 'danger' }
            ]
          }
        );
      } else {
        addBotMessage(
          `✅ **Configuration Ready for Execution**\n\n\`\`\`json\n${JSON.stringify(parsedJson, null, 2)}\n\`\`\`\n\n⚠️ **This will execute on the blockchain and cannot be undone.**`,
          {
            hasActionButtons: true,
            actionButtons: [
              { label: '✅ Confirm & Execute', action: 'confirm_execute', variant: 'success' },
              { label: '❌ Cancel', action: 'cancel_execute', variant: 'danger' }
            ]
          }
        );
        
        setPendingExecution({
          functionId: currentFunction!,
          config: parsedJson,
          action: 'add'
        });
      }
    } catch (error) {
      alert('Invalid JSON format. Please check your syntax.');
    }
  };

  const addBotMessage = (content: string, options?: Partial<Message>) => {
    const botMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content,
      timestamp: new Date(),
      ...options
    };
    setMessages(prev => [...prev, botMessage]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Handle user input
    setTimeout(() => {
      addBotMessage("💡 **Tip:** Use the buttons above for faster navigation!\n\nType 'help' for available commands or use the quick action buttons.");
      setIsTyping(false);
    }, 1000);
  };

  const completedCount = completedFunctions.length;
  const totalFunctions = adminFunctions.length;

  return (
    <>
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 h-[700px] flex flex-col border border-white/20 holographic-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center ai-glow animate-hologram">
              <Zap className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div className="absolute -inset-1 border border-blue-400/50 rounded-full animate-pulse-ring"></div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              🤖 AI Staking Assistant
            </h3>
            <p className="text-sm text-white/60">
              {contractAddress ? (
                <span className="font-mono text-green-400">
                  🔗 Contract: {contractAddress.slice(0, 12)}...
                </span>
              ) : (
                <span className="animate-pulse">
                  🚀 AI Ready - Awaiting Instructions
                </span>
              )}
              {contractAddress && ` • ${completedCount}/${totalFunctions} functions completed`}
              {multipleEntryMode && ` • 🔄 AI Batch Mode (${pendingConfigurations.length} pending)`}
            </p>
          </div>
        </div>
        
        {contractAddress && (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden border border-white/30">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500 animate-hologram"
                style={{ width: `${(completedCount / totalFunctions) * 100}%` }}
              />
            </div>
            <span className="text-sm text-green-400 font-semibold">
              {Math.round((completedCount / totalFunctions) * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Function Status Buttons */}
      {contractAddress && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 p-3 bg-black/20 rounded-xl border border-white/10">
          {adminFunctions.map((func) => (
            <button
              key={func.id}
              onClick={() => handleFunctionSelect(func.id)}
              className={`
                relative p-2 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 ai-glow
                ${func.status === 'completed' 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30 animate-hologram' 
                  : currentFunction === func.id
                  ? 'bg-blue-500/30 text-blue-200 border border-blue-400 animate-hologram'
                  : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20 animate-pulse'
                }
              `}
            >
              {func.status === 'completed' && <CheckCircle className="w-3 h-3 absolute top-1 right-1 animate-bounce" />}
              <div className="truncate">{func.label}</div>
              {func.configurations.length > 0 && (
                <div className="text-xs text-green-400 font-semibold">({func.configurations.length})</div>
              )}
            </button>
          ))}
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            <div className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.type === 'bot' && (
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center ai-glow animate-hologram">
                    <Bot className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div className="absolute -inset-1 border border-blue-400/30 rounded-full animate-pulse-ring"></div>
                </div>
              )}
              
              <div className={`
                max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed
                ${message.type === 'user' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white ai-glow' 
                  : 'bg-white/20 text-white/90 border border-white/20 holographic-border'
                }
              `}>
                <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
              </div>
              
              {message.type === 'user' && (
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 ai-glow animate-pulse border border-white/30">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Quick Buttons */}
            {message.hasQuickButtons && message.quickButtons && (
              <div className="mt-3 ml-12 flex flex-wrap gap-2">
                {message.quickButtons.map((button, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickButton(button.action)}
                    className={`
                      px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 ai-glow
                      ${button.variant === 'success' 
                        ? 'bg-green-500 hover:bg-green-600 text-white animate-hologram' 
                        : button.variant === 'primary'
                        ? 'bg-blue-500 hover:bg-blue-600 text-white animate-hologram'
                        : 'bg-gray-500 hover:bg-gray-600 text-white animate-pulse'
                      }
                    `}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            {message.hasActionButtons && message.actionButtons && (
              <div className="mt-3 ml-12 flex flex-wrap gap-2">
                {message.actionButtons.map((button, index) => (
                  <button
                    key={index}
                    onClick={() => handleActionButton(button.action)}
                    disabled={isExecuting || isDeploying}
                    className={`
                      px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ai-glow
                      ${button.variant === 'success' 
                        ? 'bg-green-500 hover:bg-green-600 text-white animate-hologram' 
                        : button.variant === 'danger'
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                        : button.variant === 'primary'
                        ? 'bg-blue-500 hover:bg-blue-600 text-white animate-hologram'
                        : 'bg-gray-500 hover:bg-gray-600 text-white animate-pulse'
                      }
                    `}
                  >
                    {(isExecuting || isDeploying || isPaymentProcessing || isOwnershipTransferring) && 
                     (button.action.includes('execute') || button.action.includes('payment') || button.action.includes('ownership')) ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        {button.action.includes('payment') ? '🤖 AI Processing...' : 
                         button.action.includes('ownership') ? 'Transferring...' : 'Executing...'}
                      </div>
                    ) : button.action === 'confirm_download' ? (
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        {button.label}
                      </div>
                    ) : (
                      button.label
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Contract Creation Form */}
            {message.hasContractForm && (
              <div className="mt-3 ml-12">
                <div className="bg-black/30 rounded-xl p-6 border border-white/20 max-w-2xl holographic-border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-semibold flex items-center gap-2 text-lg">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center ai-glow">
                        <Settings className="w-3 h-3 text-white" />
                      </div>
                      🤖 AI Contract Generator
                    </h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        🔷 yYearn Token Address
                      </label>
                      <input
                        type="text"
                        value={contractFormData.yYearnToken}
                        onChange={(e) => setContractFormData(prev => ({ ...prev, yYearnToken: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 font-mono text-sm ai-glow holographic-border"
                        placeholder="0x..."
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-200"></div>
                        🔶 sYearn Token Address
                      </label>
                      <input
                        type="text"
                        value={contractFormData.sYearnToken}
                        onChange={(e) => setContractFormData(prev => ({ ...prev, sYearnToken: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 font-mono text-sm ai-glow holographic-border"
                        placeholder="0x..."
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-400"></div>
                        🔸 pYearn Token Address
                      </label>
                      <input
                        type="text"
                        value={contractFormData.pYearnToken}
                        onChange={(e) => setContractFormData(prev => ({ ...prev, pYearnToken: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-3 text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 font-mono text-sm ai-glow holographic-border"
                        placeholder="0x..."
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleContractFormCancel}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors ai-glow"
                    >
                      ❌ Cancel
                    </button>
                    <button
                      onClick={handleContractFormSubmit}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-2 px-4 rounded-lg transition-all ai-glow animate-hologram"
                      disabled={!contractFormData.yYearnToken || !contractFormData.sYearnToken || !contractFormData.pYearnToken}
                    >
                      🤖 Generate AI Contract
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* JSON Editor */}
            {message.hasJsonEditor && (
              <div className="mt-3 ml-12">
                <div className="bg-black/30 rounded-xl p-4 border border-white/20 holographic-border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold flex items-center gap-2 text-lg">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center ai-glow animate-pulse">
                        <Edit3 className="w-3 h-3 text-white" />
                      </div>
                      🧠 AI Configuration Editor
                    </h4>
                    <button
                      onClick={() => handleJsonEdit(message.jsonData)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs transition-colors ai-glow animate-hologram"
                    >
                      ✏️ Edit JSON
                    </button>
                  </div>
                  <pre className="text-green-400 text-xs overflow-x-auto bg-black/50 p-3 rounded-lg border border-green-400/30">
                    {JSON.stringify(message.jsonData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center ai-glow animate-hologram">
                <Bot className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="absolute -inset-1 border border-blue-400/30 rounded-full animate-pulse-ring"></div>
            </div>
            <div className="bg-white/20 p-3 rounded-2xl border border-white/20 holographic-border">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
              </div>
              <div className="text-xs text-white/60 mt-1">🤖 AI thinking...</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="🤖 Chat with AI Assistant or use buttons above..."
          className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors ai-glow holographic-border"
        />
        <button
          onClick={handleSend}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105 ai-glow animate-hologram"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* JSON Editor Modal */}
      {showJsonEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col border border-white/20 holographic-border ai-glow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center ai-glow animate-pulse">
                  <Edit3 className="w-3 h-3 text-white" />
                </div>
                🧠 AI Configuration Editor
              </h3>
              <button
                onClick={() => setShowJsonEditor(false)}
                className="text-white/60 hover:text-white text-xl ai-glow"
              >
                ✕
              </button>
            </div>
            
            <textarea
              value={editingJson}
              onChange={(e) => setEditingJson(e.target.value)}
              className="flex-1 bg-black/50 border border-white/20 rounded-lg p-4 text-green-400 font-mono text-sm resize-none focus:outline-none focus:border-blue-400 holographic-border"
              placeholder="🤖 Enter AI-optimized JSON configuration..."
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowJsonEditor(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors ai-glow"
              >
                ❌ Cancel
              </button>
              <button
                onClick={handleJsonSave}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-2 px-4 rounded-lg transition-all ai-glow animate-hologram"
              >
                🚀 AI Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
    {/* External Payment Section */}
    {showPayment && contractAddress && (
      <PaymentSection
        contractAddress={contractAddress}
        walletAddress={window.ethereum?.selectedAddress || ''}
        onPaymentComplete={handlePaymentComplete}
        onOwnershipTransferred={handleOwnershipTransferred}
      />
    )}
    
    {/* External Download Section */}
    {showDownload && contractAddress && (
      <DownloadSection
        contractAddress={contractAddress}
        onDownloadComplete={handleDownloadComplete}
      />
    )}
    </>
  );
};