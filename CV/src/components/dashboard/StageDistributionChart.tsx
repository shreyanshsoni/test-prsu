import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface StageDistributionChartProps {
  data: {
    Early: number;
    Mid: number;
    Late: number;
  };
}

const StageDistributionChart: React.FC<StageDistributionChartProps> = ({ data }) => {
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
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Students']}
            labelStyle={{ color: '#374151' }}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Bar 
            dataKey="percentage" 
            fill="#1E88E5"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StageDistributionChart;