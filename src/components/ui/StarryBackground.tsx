'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '../../app/contexts/ThemeContext';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export const StarryBackground: React.FC = () => {
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
      for (let i = 0; i < 100; i++) {
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
  
  if (!mounted || theme !== 'dark') return null;
  
  return (
    <div 
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{
        zIndex: 0,  // Lower z-index to ensure it stays behind content
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
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
  );
}; 