import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { WhyThisMattersTooltip } from './WhyThisMattersTooltip';

interface ProgressIndicatorProps {
  currentStep: number;
  completedSections: boolean[];
  sectionTitles: string[];
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  completedSections,
  sectionTitles
}) => {
  const totalSteps = sectionTitles.length;
  const completedCount = completedSections.filter(Boolean).length;
  const progressPercentage = (completedCount / totalSteps) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      {/* Progress Bar */}
      <div className="relative mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="absolute -top-8 left-0 flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600">
            Level {completedCount} of {totalSteps}
          </span>
          <WhyThisMattersTooltip />
        </div>
        <div className="absolute -top-8 right-0 text-sm font-medium text-indigo-600">
          {Math.round(progressPercentage)}% Complete
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-center">
        {sectionTitles.map((title, index) => (
          <div key={index} className="flex flex-col items-center space-y-2">
            <div className={`transition-all duration-300 ${
              completedSections[index] 
                ? 'text-green-500' 
                : currentStep === index 
                  ? 'text-indigo-500' 
                  : 'text-gray-300'
            }`}>
              {completedSections[index] ? (
                <CheckCircle className="w-8 h-8" />
              ) : (
                <Circle className={`w-8 h-8 ${
                  currentStep === index ? 'fill-current' : ''
                }`} />
              )}
            </div>
            <span className={`text-xs font-medium text-center max-w-20 ${
              completedSections[index] 
                ? 'text-green-600' 
                : currentStep === index 
                  ? 'text-indigo-600' 
                  : 'text-gray-400'
            }`}>
              {title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};