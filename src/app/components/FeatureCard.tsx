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
      className="bg-light-card dark:bg-dark-card rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
    >
      <div className="p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full mb-2 sm:mb-3 md:mb-4 bg-gradient-to-br group-hover:scale-110 transition-transform duration-300 ease-in-out bg-opacity-10 group-hover:bg-opacity-20 bg-white dark:bg-opacity-5 dark:group-hover:bg-opacity-10">
          <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-light-card dark:bg-dark-card">
            {icon}
          </div>
        </div>
        <h3 className={`text-sm sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2 font-heading bg-gradient-to-r bg-clip-text text-transparent group-hover:-translate-y-0.5 transition-all duration-300 ease-in-out ${gradientColors}`}>
          {title}
        </h3>
        <p className="text-xs sm:text-sm md:text-base text-light-muted dark:text-dark-muted">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default FeatureCard; 