import React from 'react';
import { Check, Circle, Lock } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed' | 'locked';
}

interface ProgressBarProps {
  steps: Step[];
  currentStep: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Deployment Progress</h2>
        <div className="text-sm text-white/70">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-white/20">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-1000 ease-out"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
        
        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              {/* Step Circle */}
              <div className={`
                relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 mb-4
                ${step.status === 'completed' 
                  ? 'bg-gradient-to-r from-green-400 to-green-500 scale-110' 
                  : step.status === 'current'
                  ? 'bg-gradient-to-r from-blue-400 to-purple-400 scale-110 animate-pulse'
                  : step.status === 'locked'
                  ? 'bg-gray-600'
                  : 'bg-white/20'
                }
              `}>
                {step.status === 'completed' && (
                  <Check className="w-6 h-6 text-white animate-bounce" />
                )}
                {step.status === 'current' && (
                  <Circle className="w-6 h-6 text-white animate-spin" />
                )}
                {step.status === 'locked' && (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
                {step.status === 'pending' && (
                  <div className="w-3 h-3 bg-white/60 rounded-full" />
                )}
              </div>
              
              {/* Step Info */}
              <div className="text-center max-w-32">
                <h3 className={`
                  text-sm font-semibold mb-1 transition-colors duration-300
                  ${step.status === 'completed' || step.status === 'current' 
                    ? 'text-white' 
                    : 'text-white/60'
                  }
                `}>
                  {step.title}
                </h3>
                <p className="text-xs text-white/50 leading-tight">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};