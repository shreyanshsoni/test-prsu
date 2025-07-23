'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export const PersistentStarryBackground: React.FC = () => {
  const { theme } = useTheme();
  const [stars, setStars] = useState<Star[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // Generate random stars only once when mounting in dark mode
  useEffect(() => {
    setMounted(true);
    
    if (theme === 'dark') {
      const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
      
      // Create more stars for better coverage
      const newStars: Star[] = [];
      for (let i = 0; i < 150; i++) {
        newStars.push({
          id: i,
          x: Math.random() * windowWidth,
          y: Math.random() * windowHeight,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.7 + 0.1,
        });
      }
      setStars(newStars);
    } else {
      setStars([]);
    }
  }, [theme]);
  
  // Add a global style for the fixed background
  useEffect(() => {
    if (mounted && theme === 'dark') {
      // Create a style element for our background
      const style = document.createElement('style');
      style.innerHTML = `
        body.dark-mode-active {
          background-color: #111827 !important;
          position: relative;
        }
        
        body.dark-mode-active::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #111827;
          z-index: -1;
        }
      `;
      document.head.appendChild(style);
      
      // Add class to body
      document.body.classList.add('dark-mode-active');
      
      return () => {
        document.body.classList.remove('dark-mode-active');
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      };
    }
  }, [mounted, theme]);
  
  // If not mounted or not dark theme, return null
  if (!mounted || theme !== 'dark') return null;
  
  return (
    <>
      <div 
        className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#111827', // bg-gray-900
        }}
      />
      <div 
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{
          zIndex: 0,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        {stars.map(star => (
          <div 
            key={star.id}
            className="absolute rounded-full bg-white animate-pulse-slow"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              left: `${star.x}px`,
              top: `${star.y}px`,
              opacity: star.opacity,
              boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.opacity})`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
    </>
  );
}; 