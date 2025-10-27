import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { useTheme } from '../../../contexts/ThemeContext';

interface StageDistributionChartProps {
  data: {
    Early: number;
    Mid: number;
    Late: number;
  };
}

const StageDistributionChart: React.FC<StageDistributionChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const chartData = [
    { stage: 'Early', percentage: data.Early, color: '#B0E3FF' },
    { stage: 'Mid', percentage: data.Mid, color: '#64B5F6' },
    { stage: 'Late', percentage: data.Late, color: '#1E88E5' }
  ];

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis 
            dataKey="stage" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Students']}
            labelStyle={{ color: isDark ? '#F3F4F6' : '#374151' }}
            contentStyle={{ 
              backgroundColor: isDark ? '#1F2937' : 'white', 
              border: isDark ? '1px solid #374151' : '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              color: isDark ? '#F3F4F6' : '#374151'
            }}
          />
          <Bar 
            dataKey="percentage" 
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StageDistributionChart;
