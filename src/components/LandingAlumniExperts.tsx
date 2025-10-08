'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

const LandingAlumniExperts = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const partners = [
    {
      name: 'Cornell University',
      logo: '/images/cornell-transparent.png',
      alt: 'Cornell University logo'
    },
    {
      name: 'Stanford',
      logo: '/images/stanford-transparent.png',
      alt: 'Stanford logo'
    },
    {
      name: 'Harvard Graduate School of Education',
      logo: '/images/harvard-transparent.png',
      alt: 'Harvard Graduate School of Education logo'
    }
  ];

  return (
    <motion.section 
      className="py-12 sm:py-16 md:py-20 bg-white dark:bg-transparent alumni-experts-animate"
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={containerVariants}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 
          variants={itemVariants}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 dark:text-white mb-8 sm:mb-12 md:mb-16 px-4"
        >
          Developed By Alumni And Experts From
        </motion.h2>
        
        <motion.div
          className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-16"
        >
          {partners.map((partner, index) => (
            <motion.div 
              key={index} 
              className="w-24 sm:w-32 md:w-40 h-12 sm:h-16 md:h-20 flex items-center justify-center transition-all duration-300 grayscale hover:grayscale-0 hover:scale-105"
              variants={itemVariants}
            >
              <Image 
                src={partner.logo} 
                alt={partner.alt} 
                width={160} 
                height={80} 
                className="max-w-full max-h-full object-contain" 
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default LandingAlumniExperts;
