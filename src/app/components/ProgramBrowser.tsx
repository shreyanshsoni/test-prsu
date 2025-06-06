'use client'; // Mark this as a Client Component

import React, { useState, useEffect } from 'react';
import { useSprings, animated, to } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { Program } from '../types/types';
import ProgramCard from './ProgramCard';
import { Heart, X, ArrowLeft } from 'lucide-react';
import type { AnimatedComponent } from '@react-spring/web';
import { useTheme } from '../contexts/ThemeContext';

// Define card falling physics
const toPosition = (i: number) => ({
  x: 0,
  y: i * -4, // Slight vertical offset for stack effect
  scale: 1 - i * 0.05, // Each card slightly smaller
  rot: -10 + Math.random() * 20, // Random rotation
  delay: i * 100, // Stagger the animations
});

// Define falling animation
const from = (i: number) => ({
  x: 0,
  y: -1000, // Start from above
  scale: 1.5,
  rot: 0,
  delay: i * 100,
});

// Define proper types for animated components
const AnimatedArticle = animated.article as AnimatedComponent<'article'>;
const AnimatedDiv = animated.div as AnimatedComponent<'div'>;

interface ProgramBrowserProps {
  programs: Program[];
  onApprove: (program: Program) => void;
  onReject: (program: Program) => void;
  onGoBack?: () => void;
}

export default function ProgramBrowser({ programs, onApprove, onReject, onGoBack }: ProgramBrowserProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [gone] = useState<Set<number>>(new Set()); // Set of indices that have been swiped
  const [isMobile, setIsMobile] = useState(false);
  
  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Create springs for each card
  const [props, api] = useSprings(programs.length, i => ({
    ...toPosition(i),
    from: from(i),
  }));

  // Define the drag binding
  const bind = useDrag(({ 
    args: [index], 
    active, 
    movement: [mx], 
    direction: [xDir], 
    velocity 
  }) => {
    // Convert velocity to a number if it's an array
    const velocityX = typeof velocity === 'number' ? velocity : (Array.isArray(velocity) ? velocity[0] : 0);

    // Determine if card should be swiped away
    const trigger = velocityX > 0.2; 
    const dir = xDir < 0 ? -1 : 1;
    const isGone = !active && trigger;

    // If card is gone, add it to the gone set
    if (isGone) {
      gone.add(index);
      
      // Trigger approve/reject based on swipe direction
      if (dir > 0) {
        onApprove(programs[index]);
      } else {
        onReject(programs[index]);
      }
      }
      
    // Update the spring with new values
      api.start(i => {
      if (index !== i) return;
      
      // If card is gone, fly it out
      const isGoneCard = gone.has(index);
      const x = isGoneCard ? (200 + window.innerWidth) * dir : active ? mx : 0;
      const rot = mx / 100 + (isGoneCard ? dir * 10 * velocityX : 0);
      const scale = active ? 1.05 : 1;
      
          return {
        x,
        rot,
        scale,
            delay: undefined,
        config: { 
          friction: 50, 
          tension: active ? 800 : isGoneCard ? 200 : 500 
        },
        };
      });
  });

  return (
    <div className="relative w-full h-full flex flex-col items-center">
      {/* Back button */}
      {onGoBack && (
        <button 
          onClick={onGoBack} 
          className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10 p-1.5 sm:p-2 rounded-full bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text shadow-md dark:shadow-dark-border/30"
        >
          <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}

      {/* Card container */}
      <div className="relative w-full flex-grow flex items-center justify-center">
        {/* Cards */}
        {props.map(({ x, y, rot, scale }, i) => (
          <AnimatedDiv
              key={i}
                style={{
                  transform: to(
                [x, y, rot, scale], 
                (x, y, rot, scale) => 
                  `translate3d(${x}px,${y}px,0) rotate(${rot}deg) scale(${scale})`
                  ),
              zIndex: programs.length - i,
              position: 'absolute',
                }}
            className="w-[90%] sm:w-[80%] max-w-md h-[60vh] sm:h-[70vh] touch-none"
              >
            <ProgramCard
              program={programs[i]}
              isSwipeMode
              {...bind(i)}
            />
              </AnimatedDiv>
        ))}

        {/* Empty state when all cards are gone */}
        {gone.size === programs.length && (
          <div className="text-center p-4 sm:p-6 bg-light-card dark:bg-dark-card rounded-xl shadow-md dark:shadow-dark-border/30 mx-4">
            <h3 className="text-lg sm:text-xl font-semibold text-light-text dark:text-dark-text mb-2">No more programs</h3>
            <p className="text-sm sm:text-base text-light-muted dark:text-dark-muted mb-4">You've gone through all available programs</p>
            <button 
              onClick={onGoBack} 
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors text-sm sm:text-base"
            >
              Back to Search
            </button>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="flex justify-center gap-6 sm:gap-8 my-4 sm:my-6">
        <button
          onClick={() => {
            const index = programs.length - gone.size - 1;
            if (index < 0) return;
            
            gone.add(index);
            onReject(programs[index]);
            
            api.start(i => {
              if (i !== index) return;
              return {
                x: -200 - window.innerWidth,
                rot: -10,
                scale: 0.9,
                delay: undefined,
                config: { friction: 50, tension: 200 },
              };
            });
          }}
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-light-card dark:bg-dark-card shadow-lg dark:shadow-dark-border/30 flex items-center justify-center text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <X className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
        
        <button
          onClick={() => {
            const index = programs.length - gone.size - 1;
            if (index < 0) return;
            
            gone.add(index);
            onApprove(programs[index]);
            
            api.start(i => {
              if (i !== index) return;
              return {
                x: 200 + window.innerWidth,
                rot: 10,
                scale: 0.9,
                delay: undefined,
                config: { friction: 50, tension: 200 },
              };
            });
          }}
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-light-card dark:bg-dark-card shadow-lg dark:shadow-dark-border/30 flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
        >
          <Heart className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      </div>

      {/* Swipe directions help */}
      <div className="flex justify-center gap-16 mb-4">
        <div className="text-sm text-light-muted dark:text-dark-muted flex items-center">
          <X className="w-4 h-4 mr-1 text-red-500 dark:text-red-400" /> Swipe left to reject
        </div>
        <div className="text-sm text-light-muted dark:text-dark-muted flex items-center">
          <Heart className="w-4 h-4 mr-1 text-primary-600 dark:text-primary-400" /> Swipe right to save
        </div>
      </div>
    </div>
  );
}