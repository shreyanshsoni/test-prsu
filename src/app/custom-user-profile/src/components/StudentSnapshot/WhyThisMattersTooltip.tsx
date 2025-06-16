import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';

interface WhyThisMattersTooltipProps {
  className?: string;
}

export const WhyThisMattersTooltip: React.FC<WhyThisMattersTooltipProps> = ({ className = '' }) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="flex items-center justify-center w-6 h-6 bg-indigo-100 dark:bg-indigo-900/60 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full text-indigo-600 dark:text-indigo-300 transition-colors"
        aria-label="Why this matters"
      >
        <Info className="w-4 h-4" />
      </button>
      
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
          <div className="text-left">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/60 rounded-full flex items-center justify-center mr-2">
                <span className="text-blue-600 dark:text-blue-300 text-sm">💡</span>
              </div>
              <span className="font-semibold text-gray-800 dark:text-white text-sm">Why This Matters</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              You'll be able to use this profile when applying to programs, scholarships, and internships. 
              It's not about being impressive — it's about being intentional.
            </p>
          </div>
          
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};