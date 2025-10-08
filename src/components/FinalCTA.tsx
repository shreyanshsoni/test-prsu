'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const FinalCTA = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold mb-8">
          <Sparkles className="w-4 h-4" />
          Ready to Get Started?
        </div>
        
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
          Your Journey Starts <span className="text-yellow-300">Today</span>
        </h2>
        
        <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
          Join thousands of students who are already planning their futures with PRSU. 
          Take the first step towards achieving your academic and career goals.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a 
            href="/api/auth/login"
            className="group relative px-8 py-4 bg-white text-blue-600 rounded-2xl font-semibold text-lg transition-all duration-300 hover:bg-blue-50 hover:scale-105 hover:shadow-xl active:scale-95"
          >
            <span className="flex items-center gap-2">
              Start Your Plan
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
          </a>
          
          <a 
            href="#hero"
            className="px-8 py-4 text-white border-2 border-white/30 rounded-2xl font-semibold text-lg transition-all duration-300 hover:bg-white/10 hover:border-white/50 hover:scale-105"
            onClick={(e) => {
              e.preventDefault();
              const element = document.querySelector('#hero');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Learn More
          </a>
        </div>
        
        <div className="mt-12 text-blue-100 text-sm">
          <p>Free to use • No credit card required • Start planning in minutes</p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;