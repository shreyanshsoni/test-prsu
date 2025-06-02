'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const NewFooter: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 dark:bg-dark-background dark:border-t dark:border-dark-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image 
                src="/fulllogo_transparent_nobuffer.png" 
                alt="PRSU Logo" 
                width={140}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="mb-4">
              Your academic journey, reimagined. 
              Plan smarter, achieve more.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white dark:text-dark-text">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link></li>
              <li><Link href="/roadmap" className="hover:text-indigo-400 transition-colors">Roadmap</Link></li>
              <li><Link href="/goals" className="hover:text-indigo-400 transition-colors">Goals</Link></li>
              <li><Link href="/programs" className="hover:text-indigo-400 transition-colors">Programs</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white dark:text-dark-text">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/support" className="hover:text-indigo-400 transition-colors">Help Center</Link></li>
              <li><Link href="/blog" className="hover:text-indigo-400 transition-colors">Blog</Link></li>
              <li><Link href="/faq" className="hover:text-indigo-400 transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white dark:text-dark-text">Stay Updated</h3>
            <p className="mb-2">Subscribe to our newsletter</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="px-3 py-2 bg-gray-800 dark:bg-dark-card text-white rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary-500 flex-grow"
              />
              <button className="bg-primary-600 px-3 py-2 rounded-r-md hover:bg-primary-700 transition-colors text-white">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-dark-border pt-6 mt-6 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} PRSU Academic Planner. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter; 