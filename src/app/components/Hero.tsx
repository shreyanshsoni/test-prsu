'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';

const Hero: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();

  const handleStartPlan = () => {
    if (user) {
      window.location.href = '/';
    } else {
      window.location.href = '/api/auth/login?returnTo=/';
    }
  };

  return (
    <section className="relative min-h-screen pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-dark-background dark:to-primary-950/20 opacity-80"></div>
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto lg:mx-0"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-4 sm:mb-6 text-light-text dark:text-dark-text"
            >
              <span className="whitespace-nowrap">Own Your Journey.</span>
              <span className="whitespace-nowrap">Tell Your Story.</span>
              <span className="whitespace-nowrap">Shape Your Future.</span>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base sm:text-lg md:text-xl text-light-muted dark:text-dark-muted mb-6 sm:mb-10"
            >
              From summer programs to college apps, PRSU helps you turn ambition into action — 
              with a custom roadmap built just for you.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <Button 
                primary 
                className="px-6 sm:px-8 py-3 text-base sm:text-lg min-w-[140px]"
                onClick={handleStartPlan}
              >
                {user ? 'Go to Dashboard' : 'Start Your Plan'}
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative block"
          >
            <div className="rounded-2xl shadow-xl overflow-hidden mx-auto max-w-md lg:max-w-full">
              <Image
                src="https://images.pexels.com/photos/5905885/pexels-photo-5905885.jpeg"
                alt="Student planning their future"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto mt-16 md:mt-24"
        >
          <div className="bg-light-card dark:bg-dark-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-40 sm:h-48 w-full">
              <Image
                src="https://images.pexels.com/photos/5905624/pexels-photo-5905624.jpeg"
                alt="Summer Programs"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-light-text dark:text-dark-text">Summer Programs</h3>
              <p className="text-sm sm:text-base text-light-muted dark:text-dark-muted">Find enriching summer experiences</p>
            </div>
          </div>

          <div className="bg-light-card dark:bg-dark-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-40 sm:h-48 w-full">
              <Image
                src="https://images.pexels.com/photos/3759059/pexels-photo-3759059.jpeg"
                alt="Internships"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-light-text dark:text-dark-text">Internships</h3>
              <p className="text-sm sm:text-base text-light-muted dark:text-dark-muted">Discover real-world opportunities</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero; 