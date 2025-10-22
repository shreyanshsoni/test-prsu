import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

interface StatusBadgeProps {
  status: 'On Track' | 'Needs Attention' | 'At Risk';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const getStatusStyles = () => {
    switch (status) {
      case 'On Track':
        return isDark 
          ? 'bg-green-900/30 text-green-400 border-green-700' 
          : 'bg-green-100 text-green-800 border-green-200';
      case 'Needs Attention':
        return isDark 
          ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' 
          : 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'At Risk':
        return isDark 
          ? 'bg-red-900/30 text-red-400 border-red-700' 
          : 'bg-red-100 text-red-800 border-red-200';
      default:
        return isDark 
          ? 'bg-gray-900/30 text-gray-400 border-gray-700' 
          : 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'On Track':
        return '🟢';
      case 'Needs Attention':
        return '🟡';
      case 'At Risk':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles()}`}>
      <span className="mr-1">{getStatusIcon()}</span>
      {status}
    </span>
  );
};

export default StatusBadge;
