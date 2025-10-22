import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../../contexts/ThemeContext';

interface SparklineProps {
  data: Array<{ date: string; score: number }>;
}

const Sparkline: React.FC<SparklineProps> = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className="w-16 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke={isDark ? '#60A5FA' : '#42A5F5'} 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Sparkline;
