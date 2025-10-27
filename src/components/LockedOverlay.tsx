'use client';

import { Lock } from 'lucide-react';
import { useTheme } from '../app/contexts/ThemeContext';

interface LockedOverlayProps {
  children: React.ReactNode;
  className?: string;
}

export default function LockedOverlay({ children, className = '' }: LockedOverlayProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`relative ${className}`}>
      {/* Blurred content */}
      <div className="filter blur-sm pointer-events-none select-none">
        {children}
      </div>
      
      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 dark:bg-black/40 backdrop-blur-sm rounded-lg">
        <div className="text-center">
          {/* Lock icon */}
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg">
              <Lock className="w-8 h-8 text-gray-600 dark:text-gray-300" />
            </div>
          </div>
          
          {/* Tooltip text */}
          <div className="group relative">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg shadow-lg whitespace-nowrap z-50">
              We're working on something exciting - stay tuned
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
