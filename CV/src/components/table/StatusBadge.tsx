import React from 'react';

interface StatusBadgeProps {
  status: 'On Track' | 'Needs Attention' | 'At Risk';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'On Track':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Needs Attention':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'At Risk':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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