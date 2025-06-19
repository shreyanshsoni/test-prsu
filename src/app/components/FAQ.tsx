'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
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

  const faqItems: FAQItem[] = [
    {
      question: "What is PRSU?",
      answer: "PRSU is a planning platform that helps students design their academic and career journey through a visual roadmap. It brings together curated opportunities, personalized prompts, and goal tracking to support better planning—on your own terms."
    },
    {
      question: "Who is PRSU for?",
      answer: "PRSU is built for high school and college students, especially those who haven't always had access to consistent advising, early exposure to opportunities, or clear guidance on what steps to take when."
    },
    {
      question: "What makes PRSU different?",
      answer: "Visually designed for students: No cluttered dashboards or endless forms.\n\nPlanning made personal: Set your goals, track your progress, and discover programs that match your interests.\n\nCurated and timely: See what matters when it matters—internships, scholarships, deadlines, and more."
    },
    {
      question: "What kinds of opportunities are on PRSU?",
      answer: "We feature high-impact, vetted opportunities including internships, fellowships, summer programs, and college access initiatives. Our content is designed to meet students where they are—across academic, career, and personal growth pathways."
    },
    {
      question: "Is PRSU free?",
      answer: "Yes, PRSU is currently free for students. We're focused on making this tool as accessible as possible while exploring partnerships with schools, nonprofits, and mission-aligned organizations to sustain and grow the platform."
    },
    {
      question: "What does PRSU stand for?",
      answer: "Our platform is pronounced \"Pursue\" because we believe students deserve the tools to pursue a future that's aligned with their story, their goals, and their potential."
    }
  ];

  return (
    <motion.section 
      className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900"
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={containerVariants}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 
          variants={itemVariants}
          className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-16"
        >
          FAQ's
        </motion.h2>
        
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {faqItems.map((item, index) => (
            <motion.div 
              key={index} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              variants={itemVariants}
            >
              <h3 className="text-xl font-semibold text-primary-600 dark:text-primary-400 mb-4">
                {item.question}
              </h3>
              <div className="text-gray-700 dark:text-gray-300">
                {item.answer.split('\n\n').map((paragraph, i) => (
                  <p key={i} className={i > 0 ? 'mt-4' : ''}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FAQ; 