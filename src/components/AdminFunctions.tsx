import React, { useState } from 'react';
import { Settings, Star, Users, Package, Coins, Crown, Shield } from 'lucide-react';

interface AdminFunction {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  color: string;
}

interface AdminFunctionsProps {
  onFunctionExecute: (functionId: string) => void;
  executingFunction: string | null;
}

export const AdminFunctions: React.FC<AdminFunctionsProps> = ({ 
  onFunctionExecute, 
  executingFunction 
}) => {
  const [functions] = useState<AdminFunction[]>([
    {
      id: 'setStarLevelTiers',
      name: 'Set Star Level Tiers',
      description: 'Configure star level rewards and requirements',
      icon: <Star className="w-5 h-5" />,
      status: 'pending',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      id: 'setReferralRewardTiers',
      name: 'Set Referral Rewards',
      description: 'Define referral reward structure',
      icon: <Users className="w-5 h-5" />,
      status: 'pending',
      color: 'from-green-400 to-blue-500'
    },
    {
      id: 'createPackage',
      name: 'Create Package',
      description: 'Set up staking packages with different terms',
      icon: <Package className="w-5 h-5" />,
      status: 'pending',
      color: 'from-blue-400 to-purple-500'
    },
    {
      id: 'addValidComposition',
      name: 'Add Token Composition',
      description: 'Define valid token compositions for staking',
      icon: <Coins className="w-5 h-5" />,
      status: 'pending',
      color: 'from-purple-400 to-pink-500'
    },
    {
      id: 'setMaxStarLevel',
      name: 'Set Max Star Level',
      description: 'Configure maximum achievable star level',
      icon: <Crown className="w-5 h-5" />,
      status: 'pending',
      color: 'from-pink-400 to-red-500'
    },
    {
      id: 'setMaxReferralLevel',
      name: 'Set Max Referral Level',
      description: 'Set maximum referral level depth',
      icon: <Shield className="w-5 h-5" />,
      status: 'pending',
      color: 'from-red-400 to-yellow-500'
    },
    {
      id: 'setGoldenStarConfig',
      name: 'Set Golden Star Config',
      description: 'Configure golden star special rewards',
      icon: <Star className="w-5 h-5" />,
      status: 'pending',
      color: 'from-yellow-400 to-yellow-600'
    }
  ]);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">Admin Functions</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {functions.map((func) => (
          <div
            key={func.id}
            className={`
              relative group p-4 rounded-xl transition-all duration-300 cursor-pointer
              ${executingFunction === func.id 
                ? 'bg-gradient-to-r ' + func.color + ' scale-105' 
                : 'bg-white/10 hover:bg-white/20 hover:scale-105'
              }
            `}
            onClick={() => !executingFunction && onFunctionExecute(func.id)}
          >
            <div className="flex items-start gap-3">
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                ${executingFunction === func.id 
                  ? 'bg-white/20' 
                  : 'bg-gradient-to-r ' + func.color
                }
              `}>
                {executingFunction === func.id ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <div className="text-white">{func.icon}</div>
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">{func.name}</h4>
                <p className="text-sm text-white/70">{func.description}</p>
              </div>
              
              {executingFunction === func.id && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"></div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-white/5 rounded-xl">
        <p className="text-sm text-white/70 text-center">
          Execute all admin functions to complete the setup. Each function will be processed sequentially.
        </p>
      </div>
    </div>
  );
};