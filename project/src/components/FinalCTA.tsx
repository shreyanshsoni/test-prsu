import React, { useEffect, useState } from 'react';
import { ArrowRight, Search, Sparkles, Users } from 'lucide-react';

const FinalCTA = () => {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('final-cta-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="final-cta-section" className="relative py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center space-y-8 transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
        </div>
        
        {/* Floating Action Elements */}
        <div className="absolute top-1/4 left-8 hidden lg:block">
          <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-blue-400/30 animate-pulse">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="absolute top-1/3 right-8 hidden lg:block">
          <div className="w-16 h-16 bg-purple-500/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-purple-400/30 animate-pulse animation-delay-1000">
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 mt-20 pt-12 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="font-bold text-white">P</span>
              </div>
              <span className="text-xl font-bold">PRSU</span>
            </div>
            
            <div className="flex gap-8 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; 2025 PRSU. All rights reserved. Empowering students to own their journey.</p>
          </div>
        </div>
      </footer>
    </section>
  );
};

export default FinalCTA;