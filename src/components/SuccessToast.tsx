'use client';

import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SuccessToastProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ isOpen, onClose, message = 'Thank you! Your message has been submitted successfully.' }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blurred Background */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Toast Content - Square */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-80 h-80 mx-4 animate-fade-in-scale flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          {/* Animated Checkmark Circle */}
          <div className="relative">
            {/* Outer ring animation */}
            <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400 animate-scale-in" />
            </div>
          </div>
          
          {/* Success Message */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Success!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessToast;
