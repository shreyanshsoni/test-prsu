'use client';

import React from 'react';
import { Map, Target, Lock, Brain } from 'lucide-react';
import FeatureCard from './FeatureCard';

const FeatureCards: React.FC = () => {
  const features = [
    {
      title: 'Roadmap Planner',
      description: 'Build your academic plan step-by-step',
      icon: <Map className="w-8 h-8 text-indigo-600" />,
      color: 'from-indigo-500 to-purple-600',
    },
    {
      title: 'Smart Goals',
      description: 'Set and track academic goals',
      icon: <Target className="w-8 h-8 text-purple-600" />,
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Academic Safety',
      description: 'Your data and path are always secure',
      icon: <Lock className="w-8 h-8 text-blue-600" />,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'AI-Powered Insights',
      description: 'Personalized guidance to boost your learning',
      icon: <Brain className="w-8 h-8 text-pink-600" />,
      color: 'from-pink-500 to-rose-600',
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              gradientColors={feature.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards; 