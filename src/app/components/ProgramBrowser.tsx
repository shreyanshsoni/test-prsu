'use client'; // Mark this as a Client Component

import React, { useState, useEffect } from 'react';
import { useSprings, animated, to, config } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { Program } from '../types/types';
import ProgramCard from './ProgramCard';
import { Heart, X, ArrowLeft } from 'lucide-react';
import type { AnimatedComponent } from '@react-spring/web';
import { useTheme } from '../contexts/ThemeContext';

// Generate random position within boundaries for natural card landing
const getRandomPosition = () => ({
  x: -25 + Math.random() * 50, // Smaller horizontal range for smaller cards
  y: -15 + Math.random() * 30,  // Smaller vertical range for smaller cards
  rot: -10 + Math.random() * 20, // Reduced rotation for smaller cards
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
  const [landed, setLanded] = useState<boolean[]>([]);
  const [randomPositions, setRandomPositions] = useState<Array<{x: number, y: number, rot: number}>>([]);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Keep a stable reference to the programs array
  const [stablePrograms, setStablePrograms] = useState<Program[]>([]);
  
  // Only update the stable programs when programs changes AND the stable array is empty
  useEffect(() => {
    if (stablePrograms.length === 0 && programs.length > 0) {
      console.log('Setting stable programs:', programs.length);
      setStablePrograms(programs);
    }
  }, [programs, stablePrograms.length]);
  
  // Use stablePrograms instead of props.programs for all operations
  const displayPrograms = stablePrograms.length > 0 ? stablePrograms : programs;

  // Track container size for responsive behavior
  useEffect(() => {
    const updateSize = () => {
      setContainerSize({
        width: window.innerWidth,
        height: window.innerHeight * 0.7 // Use 70% of viewport height
      });
    };
    
    // Initial size
    updateSize();
    
    // Update on resize
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Generate random positions for cards when component mounts or when new programs are added
  useEffect(() => {
    // Track previous length to detect additions vs removals
    let prevLen = randomPositions.length;
    if (programs.length <= prevLen) {
      // No new cards added, skip resetting to preserve current state
      return;
    }

    // Generate random positions for new cards only
    const newPositions = [...randomPositions];
    for (let i = prevLen; i < programs.length; i++) {
      newPositions[i] = getRandomPosition();
    }
    setRandomPositions(newPositions);

    // Preserve landed state for existing cards, initialise false for new ones
    setLanded(prev => {
      const updated = [...prev];
      for (let i = prevLen; i < programs.length; i++) {
        updated[i] = false;
      }
      return updated;
    });

    // Set landing timers only for the newly-added cards
    const timers = [] as NodeJS.Timeout[];
    for (let i = prevLen; i < programs.length; i++) {
      timers.push(
        setTimeout(() => {
          setLanded(prev => {
            const updated = [...prev];
            updated[i] = true;
            return updated;
          });
        }, 1000 + i * 400)
      );
    }

    return () => timers.forEach(timer => clearTimeout(timer));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programs.length]);

  // Create springs for each card
  const [props, api] = useSprings(displayPrograms.length, i => ({
    // Initial falling animation
    from: {
      x: 0,
      y: -1200 - i * 150, // Adjusted for smaller cards
      rot: -5 + Math.random() * 10,
      scale: 1.1,
      opacity: 1,
    },
    // Target position for landing
    to: {
      x: landed[i] ? randomPositions[i]?.x || 0 : 0,
      y: landed[i] ? randomPositions[i]?.y || 0 : -600 + i * 150, // Adjusted mid-air position
      rot: landed[i] ? randomPositions[i]?.rot || 0 : -5 + Math.random() * 10,
      scale: 1.0 - (i * 0.02), // Less shrinking for better visibility with smaller cards
      opacity: 1,
    },
    // Physics configuration for natural movement
    config: {
      mass: 1 + Math.random() * 0.6,        
      tension: 200 + Math.random() * 40,    
      friction: 20 + Math.random() * 5,    
    },
    delay: i * 180, // Staggered delay for cascade effect
  }));

  // Add a utility function for haptic feedback with different patterns
  const triggerHapticFeedback = (isAccept: boolean) => {
    // Check if vibration API is supported
    if ('vibrate' in navigator) {
      try {
        if (isAccept) {
          // Success pattern: one short vibration (iOS-friendly)
          navigator.vibrate(80);
        } else {
          // Rejection pattern: two short vibrations (iOS-friendly)
          navigator.vibrate([60, 50, 60]);
        }
      } catch (e) {
        // Silently fail if vibration fails
        console.log('Vibration not supported on this device');
      }
    }
  };

  // Define the drag binding
  const bind = useDrag(({ 
    args: [index], 
    active, 
    movement: [mx], 
    direction: [xDir], 
    velocity 
  }) => {
    // Don't allow swiping before card has landed
    if (!landed[index]) return;
    
    // Convert velocity to a number if it's an array
    const velocityX = typeof velocity === 'number' ? velocity : (Array.isArray(velocity) ? velocity[0] : 0);
    
    // Lower the threshold to make swipes more responsive
    const trigger = velocityX > 0.1; // Was 0.2, lower for more responsive swipes
    const dir = xDir < 0 ? -1 : 1;
    const isGone = !active && trigger;

    // If card is gone, add it to the gone set
    if (isGone) {
      gone.add(index);
      
      // Trigger approve/reject based on swipe direction
      if (dir > 0) {
        triggerHapticFeedback(true); // Success vibration
        onApprove(displayPrograms[index]);
      } else {
        triggerHapticFeedback(false); // Rejection vibration
        onReject(displayPrograms[index]);
      }
    }

    // Update the spring with new values
    api.start(i => {
      if (index !== i) return;
      
      // If card is gone, fly it out
      const isGoneCard = gone.has(index);
      
      // Calculate new positions based on drag status
      // Make cards fly out faster by increasing the multiplier
      const x = isGoneCard ? (300 + window.innerWidth) * dir : active ? mx : randomPositions[i]?.x || 0;
      const y = active ? randomPositions[i]?.y || 0 : randomPositions[i]?.y || 0;
      const rot = isGoneCard 
        ? dir * (20 + Math.random() * 10) 
        : active 
          ? mx / 50 + randomPositions[i]?.rot || 0 
          : randomPositions[i]?.rot || 0;
      
      const scale = active ? 1.05 : 1.0 - (i * 0.03); // Less shrinking for better visibility
      
      return {
        x,
        y,
        rot,
        scale,
        config: { 
          friction: isGoneCard ? 30 : active ? 20 : 30, // Lower friction for faster movement
          tension: isGoneCard ? 400 : active ? 300 : 200, // Higher tension for snappier animations
        }
      };
    });
  });

  // Apply "Bounce" effect when cards land
  useEffect(() => {
    landed.forEach((hasLanded, i) => {
      if (hasLanded && !gone.has(i)) {
        api.start(j => {
          if (i !== j) return;
          return {
            y: randomPositions[i]?.y, 
            config: { ...config.wobbly, friction: 14 }
          };
        });
      }
    });
  }, [landed, api, randomPositions, gone]);

  return (
    <div className="relative w-full h-full flex flex-col items-center overflow-hidden">
      {/* Card container - Full height and centered */}
      <div className="relative w-full flex-grow flex items-center justify-center" style={{ minHeight: '50vh' }}>
        {/* Cards */}
        {props.map(({ x, y, rot, scale, opacity }, i) => (
          <AnimatedDiv
            key={i}
            style={{
              transform: to(
                [x, y, rot, scale], 
                (x, y, rot, scale) => 
                  `translate3d(${x}px,${y}px,0) rotate(${rot}deg) scale(${scale})`
              ),
              opacity,
              zIndex: displayPrograms.length - i,
              position: 'absolute',
              touchAction: 'none', // Prevent touch scrolling while dragging
              backfaceVisibility: 'hidden', // Improve text rendering during transforms
              WebkitFontSmoothing: 'antialiased', // Better font rendering
              MozOsxFontSmoothing: 'grayscale', // Better font rendering in Firefox
            }}
            className="w-[65vw] sm:w-[55vw] md:w-[45vw] lg:w-[35vw] xl:w-[30vw] max-w-sm h-[50vh] sm:h-[50vh] md:h-[50vh] lg:h-[45vh] touch-none will-change-transform"
          >
            <ProgramCard
              program={displayPrograms[i]}
              isSwipeMode
              {...(landed[i] ? bind(i) : {})} // Only enable swiping after landing
            />
          </AnimatedDiv>
        ))}

        {/* Empty state when all cards are gone */}
        {gone.size === displayPrograms.length && (
          <div className="text-center p-8 bg-light-card dark:bg-dark-card rounded-xl shadow-md dark:shadow-dark-border/30">
            <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">No more programs</h3>
            <p className="text-light-muted dark:text-dark-muted mb-4">You've gone through all available programs</p>
            <button 
              onClick={onGoBack} 
              className="px-6 py-3 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
            >
              Back to Search
            </button>
          </div>
        )}
      </div>
      
      {/* Controls - only show after cards have landed */}
      {landed.some(Boolean) && (
        <div className="flex justify-center gap-4 sm:gap-8 my-3 sm:my-4 z-20">
          <button
            onClick={() => {
              // Find the first card (lowest index) that's landed and hasn't been swiped yet
              const index = [...Array(displayPrograms.length).keys()]
                .find(i => landed[i] && !gone.has(i));
                
              // Only proceed if we found a valid card
              if (index === undefined) return;
              
              triggerHapticFeedback(false); // Rejection vibration
              console.log('Rejecting card with index:', index, 'program:', displayPrograms[index].title);
              gone.add(index);
              onReject(displayPrograms[index]);
              
              api.start(i => {
                if (i !== index) return;
                return {
                  x: -300 - window.innerWidth, // Increase for faster animation
                  rot: -10 - Math.random() * 15,
                  scale: 0.9,
                  config: { friction: 30, tension: 400 }, // Faster physics
                };
              });
            }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-light-card dark:bg-dark-card shadow-lg dark:shadow-dark-border/30 flex items-center justify-center text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <X className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
          
          <button
            onClick={() => {
              // Find the first card (lowest index) that's landed and hasn't been swiped yet
              const index = [...Array(displayPrograms.length).keys()]
                .find(i => landed[i] && !gone.has(i));
                
              // Only proceed if we found a valid card
              if (index === undefined) return;
              
              triggerHapticFeedback(true); // Success vibration
              console.log('Approving card with index:', index, 'program:', displayPrograms[index].title);
              gone.add(index);
              onApprove(displayPrograms[index]);
              
              api.start(i => {
                if (i !== index) return;
                return {
                  x: 300 + window.innerWidth, // Increase for faster animation
                  rot: 10 + Math.random() * 15,
                  scale: 0.9,
                  config: { friction: 30, tension: 400 }, // Faster physics
                };
              });
            }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-light-card dark:bg-dark-card shadow-lg dark:shadow-dark-border/30 flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <Heart className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>
      )}
    </div>
  );
}