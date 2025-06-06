'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const VisionStatement: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section className="py-8 sm:py-10 md:py-16 bg-light-background dark:bg-dark-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-blue-100 dark:from-dark-card dark:to-primary-950/30 rounded-xl sm:rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-12 shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-blue-900 dark:text-primary-300 mb-3 sm:mb-4 md:mb-6 text-center">
            Our Vision
          </h2>
          <p className="text-sm sm:text-base md:text-xl text-blue-800 dark:text-primary-200 leading-relaxed text-center">
            At PRSU, we take an empowering approach to academic planning. We believe that every student deserves access to opportunities, regardless of background or barriers. Our mission is to inspire confidence by blending personalized planning with visual storytelling—one roadmap at a time.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default VisionStatement; 