import React from 'react';
import { CheckCircle, Users, BookOpen, Heart } from 'lucide-react';

interface RadarChartProps {
  data: {
    clarity: number;
    engagement: number;
    preparation: number;
    support: number;
  };
  individual?: boolean;
}

const CustomRadarChart: React.FC<RadarChartProps> = ({ data, individual = false }) => {
  const categories = [
    { 
      name: 'Clarity', 
      score: data.clarity, 
      icon: CheckCircle, 
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100',
      description: 'How clear they are about their goals'
    },
    { 
      name: 'Engagement', 
      score: data.engagement, 
      icon: Users, 
      color: 'bg-green-500',
      lightColor: 'bg-green-100',
      description: 'How involved they are in activities'
    },
    { 
      name: 'Preparation', 
      score: data.preparation, 
      icon: BookOpen, 
      color: 'bg-purple-500',
      lightColor: 'bg-purple-100',
      description: 'How ready they are academically'
    },
    { 
      name: 'Support', 
      score: data.support, 
      icon: Heart, 
      color: 'bg-pink-500',
      lightColor: 'bg-pink-100',
      description: 'The help and resources they have'
    }
  ];

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const IconComponent = category.icon;
        return (
          <div key={category.name} className="flex items-center space-x-4">
            <div className={`${category.lightColor} p-3 rounded-full flex-shrink-0`}>
              <IconComponent className={`w-5 h-5 text-gray-700`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-gray-900">{category.name}</h4>
                <span className="text-sm font-bold text-gray-900">{category.score}%</span>
              </div>
              {!individual && (
                <p className="text-xs text-gray-500 mb-2">{category.description}</p>
              )}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`${category.color} h-2 rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${category.score}%` }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CustomRadarChart;