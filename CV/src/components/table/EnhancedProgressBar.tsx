import React from 'react';

interface EnhancedProgressBarProps {
  progress: number;
}

const EnhancedProgressBar: React.FC<EnhancedProgressBarProps> = ({ progress }) => {
  const getProgressColor = () => {
    if (progress <= 40) return 'bg-red-500';
    if (progress <= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getBackgroundColor = () => {
    if (progress <= 40) return 'bg-red-100';
    if (progress <= 70) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  return (
    <div className="flex items-center space-x-3">
      <div className={`w-24 ${getBackgroundColor()} rounded-full h-2`}>
        <div 
          className={`${getProgressColor()} h-2 rounded-full transition-all duration-500 ease-out`} 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <span className="text-sm font-medium text-gray-700 min-w-[3rem]">{progress}%</span>
    </div>
  );
};

export default EnhancedProgressBar;