'use client'; // Mark this as a Client Component

import React, { useState } from 'react';
import { useSprings, animated, to } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { Program } from '../types/types';
import ProgramCard from './ProgramCard';
import { Heart, X, ArrowLeft } from 'lucide-react';
import type { AnimatedComponent } from '@react-spring/web';

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
  scale: 1,
  rot: 0,
  delay: i * 100,
});

// Define proper types for animated components
const AnimatedArticle = animated.article as AnimatedComponent<'article'>;
const AnimatedDiv = animated.div as AnimatedComponent<'div'>;

interface ProgramBrowserProps {
  programs: Program[];
  onSaveProgram: (program: Program) => void;
  onRejectProgram: (program: Program) => void;
}

export default function ProgramBrowser({ 
  programs, 
  onSaveProgram,
  onRejectProgram 
}: ProgramBrowserProps) {
  const [gone] = useState(() => new Set()); // Track removed cards
  const [savedPrograms, setSavedPrograms] = useState<Program[]>([]); // Saved programs list
  const [currentIndex, setCurrentIndex] = useState(programs.length - 1); // Current card index

  // Spring animations for cards
  const [springs, api] = useSprings(programs.length, i => ({
    ...toPosition(i),
    from: from(i),
  }));

  // Initialize card stack animation on mount
  React.useEffect(() => {
    api.start((i) => ({
      ...toPosition(i),
      from: from(i),
    }));
  }, [api]);

  const handleSwipe = (i: number, index: number, dir: number) => {
    if (i !== index) return;
    const x = (200 + window.innerWidth) * dir;
    gone.add(index);
    
    const program = programs[index];
    if (dir === 1) {
      // Add the program to savedPrograms
      setSavedPrograms((prev) => [...prev, program]);
      // Notify the parent component
      onSaveProgram(program);
    } else {
      // Notify the parent component
      onRejectProgram(program);
    }
    
    setCurrentIndex(prev => prev - 1);
    
    return {
      x,
      y: 0,
      rot: dir * 10,
      scale: 0.5,
      delay: undefined,
      config: { friction: 50, tension: 200 },
    };
  };

  // Gesture handling for card swipe
  const bind = useDrag(({ args: [index], active, movement: [mx], direction: [xDir], velocity: [vx] }) => {
    const trigger = vx > 0.2;
    const dir = xDir < 0 ? -1 : 1;

    if (!active && trigger) {
      gone.add(index);
      
      const program = programs[index];
      if (dir === 1) {
        // Add the program to savedPrograms
        setSavedPrograms((prev) => [...prev, program]);
        // Notify the parent component
        onSaveProgram(program);
      } else {
        // Notify the parent component
        onRejectProgram(program);
      }
      
      setCurrentIndex(prev => prev - 1);

      api.start(i => {
        if (i === index) {
          return {
            x: (200 + window.innerWidth) * dir,
            y: 800,
            rot: dir * 50,
            scale: 0.5,
            delay: undefined,
            config: { friction: 50, tension: 200 }
          };
        }
        return {
          ...toPosition(i),
          delay: undefined,
        };
      });
    } else {
      api.start(i => {
        if (i === index) {
          return {
            x: active ? mx : 0,
            y: active ? mx * -0.2 : 0,
            rot: active ? mx / 100 : 0,
            scale: active ? 1.1 : 1,
            delay: undefined,
            config: { friction: 50, tension: active ? 800 : 200 },
          };
        }
        return toPosition(i);
      });
    }
  });

  return (
    <main className="relative h-screen bg-gray-50" role="main">
      {/* Add semantic header */}
      <header className="sr-only">
        <h1>Program Browser</h1>
        <p>Browse and save available programs</p>
      </header>

      {/* Back button with better accessibility */}
      <nav className="absolute top-4 left-4 z-50" aria-label="Main navigation">
        <button 
          onClick={() => window.location.reload()}
          className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="Return to start"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="sr-only">Go back</span>
        </button>
      </nav>

      {/* Saved programs panel with ARIA labels */}
      <aside className="absolute top-4 right-4 z-50" aria-label="Saved programs">
        <div className="bg-white rounded-lg shadow-lg p-4 min-w-[250px] max-w-[300px] overflow-hidden" role="region">
          <h2 className="font-semibold mb-2 text-indigo-600">
            Saved Programs ({savedPrograms.length})
          </h2>
          <ul className="space-y-2 max-h-[300px] overflow-hidden">
            {savedPrograms.map(program => (
              <li 
                key={program.id} 
                className="p-2 bg-gray-50 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <article>
                  <h3 className="font-medium truncate">{program.title}</h3>
                  <p className="text-xs text-gray-500 truncate">{program.organization}</p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Cards container with better semantics */}
      <section 
        className="absolute inset-0 flex items-center justify-center"
        aria-label="Program cards"
      >
        {springs.map(({ x, y, rot, scale }, i) => {
          if (gone.has(i)) return null;
          
          return (
            <AnimatedArticle 
              key={i}
              className="absolute w-[500px] h-[500px]"
              style={{ x, y }}
              aria-label={`Program card ${i + 1} of ${springs.length}`}
            >
              <AnimatedDiv
                {...bind(i)}
                style={{
                  transform: to(
                    [rot, scale],
                    (rot, scale) => `rotateZ(${rot}deg) scale(${scale})`
                  ),
                  touchAction: 'none',
                }}
              >
                <ProgramCard program={programs[i]} />
              </AnimatedDiv>
            </AnimatedArticle>
          );
        })}
      </section>

      {/* Action buttons with better accessibility */}
      <div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-8"
        role="group"
        aria-label="Program actions"
      >
        <button
          className="bg-red-500 text-white p-4 rounded-full shadow-lg hover:bg-red-600 transition-colors transform hover:scale-110"
          onClick={() => currentIndex >= 0 && api.start(i => handleSwipe(i, currentIndex, -1))}
          aria-label="Reject program"
        >
          <X className="w-8 h-8" />
        </button>
        <button
          className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors transform hover:scale-110"
          onClick={() => currentIndex >= 0 && api.start(i => handleSwipe(i, currentIndex, 1))}
          aria-label="Save program"
        >
          <Heart className="w-8 h-8" />
        </button>
      </div>

      {/* Empty state with better semantics */}
      {currentIndex < 0 && (
        <section className="absolute inset-0 flex items-center justify-center" aria-label="No more programs">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">No More Programs</h2>
            <p className="text-gray-600 mb-6">You&apos;ve viewed all available programs.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-700 transition-colors"
              aria-label="Start over"
            >
              Start Over
            </button>
          </div>
        </section>
      )}
    </main>
  );
}