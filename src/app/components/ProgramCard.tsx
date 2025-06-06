'use client';

import { useState, useEffect } from 'react';
import { Program } from '../types/types';
import { Calendar, MapPin, GraduationCap, DollarSign } from 'lucide-react';
import { animated } from '@react-spring/web';
import type { AnimatedComponent } from '@react-spring/web';
import Image from 'next/image'; // Use Next.js Image component
import { formatDate } from '../utils/dateUtils';
import { useTheme } from '../contexts/ThemeContext';

interface ProgramCardProps {
  program: Program;
  style?: React.CSSProperties;
  isSwipeMode?: boolean; // Add new prop to indicate swipe mode
  // Add additional props for bind
  [key: string]: any;
}

const AnimatedDiv = animated.div as AnimatedComponent<'div'>;

export default function ProgramCard({ program, style, isSwipeMode = false, ...props }: ProgramCardProps) {
  const [imageError, setImageError] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isMobile, setIsMobile] = useState(false);
  
  // Check viewport size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Function to handle image load error
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <AnimatedDiv
      {...props}
      style={{
        ...style,
        touchAction: 'none',
      }}
      className={`relative rounded-xl ${isSwipeMode ? 'w-full h-full' : 'w-full'} overflow-hidden shadow-lg dark:shadow-dark-border/30 bg-light-card dark:bg-dark-card`}
    >
      {/* Swipe mode UI */}
      {isSwipeMode ? (
        <div className="h-full flex flex-col">
          {/* Image */}
          <div className="h-1/2 relative bg-gray-100 dark:bg-dark-background">
            {!imageError ? (
              <Image
                src={program.imageUrl || "/images/default-opportunity.jpg"}
                alt={program.title || "Program"}
                fill
                className="object-cover"
                onError={handleImageError}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-light-background dark:bg-dark-background">
                <div className="text-light-muted dark:text-dark-muted text-sm sm:text-lg">Image unavailable</div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 flex-1 flex flex-col">
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-light-text dark:text-dark-text line-clamp-2">{program.title}</h3>
            
            <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted mb-3 sm:mb-4 line-clamp-3">
              {program.description || "No description available"}
            </p>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-auto">
              {program.location && (
                <div className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500 dark:text-primary-400 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-light-muted dark:text-dark-muted truncate">{program.location}</span>
                </div>
              )}
      
              {program.deadline && (
                <div className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500 dark:text-primary-400 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-light-muted dark:text-dark-muted truncate">
                    {formatDate(program.deadline)}
                  </span>
                </div>
              )}

              {program.degreeLevel && (
                <div className="flex items-center">
                  <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500 dark:text-primary-400 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-light-muted dark:text-dark-muted truncate">{program.degreeLevel}</span>
                </div>
              )}
              
              {program.cost !== undefined && (
                <div className="flex items-center">
                  <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500 dark:text-primary-400 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-light-muted dark:text-dark-muted truncate">
                    {program.cost === 0 ? "Free" : `$${program.cost.toLocaleString()}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // List mode UI - More compact
        <div className="flex flex-col h-full">
          <div className="h-36 sm:h-48 relative">
            {!imageError ? (
              <Image
                src={program.imageUrl || "/images/default-opportunity.jpg"}
                alt={program.title || "Program"}
                fill
                className="object-cover"
                onError={handleImageError}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-light-background dark:bg-dark-background">
                <div className="text-light-muted dark:text-dark-muted text-sm">Image unavailable</div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3 sm:p-4">
              <h3 className="text-white font-semibold text-base sm:text-lg line-clamp-2">{program.title}</h3>
            </div>
          </div>

          <div className="p-3 sm:p-4 flex-1 flex flex-col">
            <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted mb-3 sm:mb-4 line-clamp-3">
              {program.description || "No description available"}
            </p>
            
            <div className="mt-auto flex flex-wrap gap-1.5 sm:gap-2">
              {program.field && (
                <span className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                  {program.field}
                </span>
              )}
              {program.organization && (
                <span className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-light-border dark:bg-dark-border text-light-text dark:text-dark-text">
                  {program.organization}
                </span>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs sm:text-sm text-light-muted dark:text-dark-muted truncate">
                {program.deadline ? formatDate(program.deadline) : "No deadline"}
              </span>
              
              {program.cost !== undefined && (
                <span className="font-medium text-xs sm:text-sm text-light-text dark:text-dark-text">
                  {program.cost === 0 ? "Free" : `$${program.cost.toLocaleString()}`}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </AnimatedDiv>
  );
}