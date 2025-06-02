import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string | React.ReactNode;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
  isConfirmDisabled?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isDanger = false,
  isConfirmDisabled = false
}: ConfirmationModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
          <h3 className="text-lg font-medium text-light-text dark:text-dark-text">{title}</h3>
          <button 
            onClick={onCancel} 
            className="text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-light-muted dark:text-dark-muted">{message}</p>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border transition-colors border border-light-border dark:border-dark-border rounded-md"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isConfirmDisabled}
              className={`px-4 py-2 rounded-md text-white transition-colors ${
                isDanger 
                  ? 'bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600' 
                  : 'bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-600'
              } ${isConfirmDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 