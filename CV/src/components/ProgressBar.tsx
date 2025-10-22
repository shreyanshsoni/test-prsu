import React from 'react';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  // Determine width based on progress
  const width = `${progress}%`;
  
  // Determine color based on progress value
  let barColor = 'bg-blue-500';
  
  return (
    <div className="flex items-center space-x-3">
      <div className="w-32 bg-gray-200 rounded-full h-2.5">
        <div 
          className={`${barColor} h-2.5 rounded-full transition-all duration-500 ease-out`} 
          style={{ width }}
        ></div>
      </div>
      <span className="text-gray-700">{progress} %</span>
    </div>
  );
};

export default ProgressBar;