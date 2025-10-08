'use client';

import React, { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';

const NewFooter: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Logo Section */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center">
              <img 
                src="/light_mode_logo.png" 
                alt="PRSU Logo" 
                width={140}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-sm leading-relaxed text-gray-300">
              Your academic journey, reimagined. Plan smarter, achieve more.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Home', href: '#hero' },
                { name: 'Roadmap', href: '#roadmap-section' },
                { name: 'Goals', href: '#progress-tracker-section' },
                { name: 'Programs', href: '#value-pillars-section' }
              ].map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-gray-300 hover:text-indigo-400 transition-colors duration-200 text-sm"
                    onClick={(e) => {
                      if (link.href.startsWith('#')) {
                        e.preventDefault();
                        const element = document.querySelector(link.href);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }
                    }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Help Center', href: '#' },
                { name: 'Blog', href: '#' },
                { name: 'FAQ', href: '#faq-section' },
                { name: 'Contact Us', href: '#' }
              ].map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-gray-300 hover:text-indigo-400 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Stay Updated - Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Stay Updated
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              Get the latest updates on academic planning and opportunities.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm backdrop-blur-sm"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-r-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center gap-2 text-sm font-medium"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
            <p className="text-xs text-gray-400">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-300">
              © {new Date().getFullYear()} PRSU Academic Planner. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a 
                href="#" 
                className="text-gray-300 hover:text-indigo-400 transition-colors duration-200 text-sm"
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className="text-gray-300 hover:text-indigo-400 transition-colors duration-200 text-sm"
              >
                Terms of Service
              </a>
              <a 
                href="#" 
                className="text-gray-300 hover:text-indigo-400 transition-colors duration-200 text-sm"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;
