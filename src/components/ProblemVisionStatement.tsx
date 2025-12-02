'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Eye, Target } from 'lucide-react';

const ProblemVisionStatement = () => {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        console.log('Problem Vision section in view:', entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('problem-vision-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="problem-vision-section" className="py-16 sm:py-24 bg-white dark:bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-16 items-center">
          {/* Problem Statement */}
          <div className={`problem-vision-animate ${
            inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full font-semibold mb-6">
              <AlertTriangle className="w-4 h-4" />
              The Problem
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Students are navigating their futures without a clear roadmap
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Too many students miss out on life-changing opportunities because they don't know they exist or when to apply. Without proper guidance, the college and career planning process feels overwhelming and inaccessible.
            </p>
          </div>

          {/* Vision Statement */}
          <div className={`problem-vision-animate ${
            inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-semibold mb-6">
              <Eye className="w-4 h-4" />
              Our Vision
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Every student deserves a personalized path to success
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4 sm:mb-6">
              We envision a world where every student has access to a clear, visual roadmap that connects their ambitions to actionable steps. PRSU empowers students to transform uncertainty into confidence and dreams into achievements.
            </p>
          </div>
        </div>
        
        {/* Centered CTA Button */}
        <div className="text-center mt-12 sm:mt-20">
          <a 
            href="/api/auth/login?returnTo=/students?tab=search"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm sm:text-base"
          >
            <Target className="w-4 h-4 sm:w-5 sm:h-5" />
            Start Your Journey
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProblemVisionStatement;