'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradientColors: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  gradientColors,
}) => {
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
    >
      <div className="p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-full mb-4 bg-gradient-to-br group-hover:scale-110 transition-transform duration-300 ease-in-out bg-opacity-10 group-hover:bg-opacity-20 bg-white">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white">
            {icon}
          </div>
        </div>
        <h3 className={`text-xl font-semibold mb-2 font-heading bg-gradient-to-r bg-clip-text text-transparent group-hover:-translate-y-0.5 transition-all duration-300 ease-in-out ${gradientColors}`}>
          {title}
        </h3>
        <p className="text-gray-600">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default FeatureCard; 