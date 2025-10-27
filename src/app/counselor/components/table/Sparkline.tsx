import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Lock } from 'lucide-react';

interface SparklineProps {
  data: Array<{ date: string; score: number }>;
}

const Sparkline: React.FC<SparklineProps> = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className={`w-16 h-8 rounded flex items-center justify-center border ${isDark ? 'bg-dark-border/50 border-dark-border' : 'bg-gray-100 border-gray-200'}`}>
      <Lock className={`w-4 h-4 ${isDark ? 'text-dark-muted' : 'text-gray-400'}`} />
    </div>
  );
};

export default Sparkline;
