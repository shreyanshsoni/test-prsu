'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const VisionStatement: React.FC = () => {
  const [visionRef, visionInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  
  const [problemRef, problemInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section className="py-16 bg-light-background dark:bg-dark-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Problem Statement Box */}
        <motion.div
          ref={problemRef}
          initial={{ opacity: 0, y: 20 }}
          animate={problemInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/20 rounded-3xl p-8 md:p-12 shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-rose-700 dark:text-rose-300 mb-6 text-center">
            Problem Statement
          </h2>
          <p className="text-lg md:text-xl text-rose-600 dark:text-rose-200 leading-relaxed text-center">
            For many students the journey from high school to college and career is full of unknowns. Key information is scattered, deadlines are missed, and support often comes too late.
          </p>
        </motion.div>
        
        {/* Vision Statement Box */}
        <motion.div
          ref={visionRef}
          initial={{ opacity: 0, y: 20 }}
          animate={visionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-blue-100 dark:from-dark-card dark:to-primary-950/30 rounded-3xl p-8 md:p-12 shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 dark:text-primary-300 mb-6 text-center">
            Our Vision
          </h2>
          <p className="text-lg md:text-xl text-blue-800 dark:text-primary-200 leading-relaxed text-center">
            PRSU helps students map their academic and career path visually and intentionally—so they can discover opportunities, set goals, and take action early. We're building the tool we wish we had: something clear, motivating, and built for students.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default VisionStatement; 