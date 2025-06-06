'use client';

import React from 'react';
import Image from 'next/image';
import { Mail, Instagram } from 'lucide-react';

const NewFooter: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 dark:bg-dark-background dark:border-t dark:border-dark-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-2 sm:mb-3 md:mb-4 flex justify-center">
            <div className="relative flex-shrink-0">
              <Image 
                src="/fulllogo_transparent_nobuffer.png" 
                alt="PRSU Logo" 
                width={160}
                height={45}
                className="h-8 sm:h-10 md:h-12 w-auto object-contain"
                style={{ objectPosition: 'center bottom' }}
              />
            </div>
          </div>
          <p className="text-sm sm:text-base md:text-lg max-w-md mx-auto mb-3 sm:mb-4 md:mb-6 px-2">
              Your academic journey, reimagined. 
              Plan smarter, achieve more.
            </p>
          
          <div className="flex items-center space-x-4 sm:space-x-6 md:space-x-8 mb-3 md:mb-4">
            <a 
              href="mailto:getprsu@gmail.com"
              className="text-gray-300 hover:text-white transition-colors p-1.5 sm:p-2 rounded-full hover:bg-gray-800"
              aria-label="Email us at getprsu@gmail.com"
            >
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </a>
            
            <a 
              href="https://www.instagram.com/prsuhq?igsh=NWVheG1kd2R1NXly"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-pink-400 transition-colors p-1.5 sm:p-2 rounded-full hover:bg-gray-800"
              aria-label="Follow us on Instagram @prsuhq"
            >
              <Instagram className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-dark-border pt-3 sm:pt-4 md:pt-6 mt-3 sm:mt-4 md:mt-6 text-xs sm:text-sm text-center">
          <p>&copy; 2025 PRSU Academic Planner. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter; 