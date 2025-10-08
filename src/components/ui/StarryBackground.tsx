'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '../../app/contexts/ThemeContext';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  delay: number;
  size: number;
  type: 'bright' | 'dim' | 'fast' | 'slow' | 'blue' | 'pulsing' | 'sparkling';
}

export const StarryBackground: React.FC = () => {
  const { theme } = useTheme();
  const [stars, setStars] = useState<Star[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // Generate random stars and shooting stars when mounting in dark mode
  useEffect(() => {
    setMounted(true);
    
    if (theme === 'dark') {
      const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
      
      // Create static twinkling stars
      const newStars: Star[] = [];
      for (let i = 0; i < 100; i++) {
        newStars.push({
          id: i,
          x: Math.random() * windowWidth,
          y: Math.random() * windowHeight,
          size: Math.random() * 3 + 0.5, // 0.5-3.5px - more varied sizes
          opacity: Math.random() * 0.7 + 0.1,
        });
      }
      setStars(newStars);

      // Generate different types of shooting stars
      const generateShootingStar = () => {
        const newShootingStars: ShootingStar[] = [];
        
        // Generate 1-2 shooting stars per batch
        const numStars = Math.floor(Math.random() * 2) + 1;
        
        for (let i = 0; i < numStars; i++) {
          // Random start and end positions anywhere on screen
          const startX = Math.random() * windowWidth;
          const startY = Math.random() * windowHeight;
          const endX = Math.random() * windowWidth;
          const endY = Math.random() * windowHeight;
          
          // Random shooting star type (removed yellow and orange)
          const types: ShootingStar['type'][] = ['bright', 'dim', 'fast', 'slow', 'blue', 'pulsing', 'sparkling'];
          const type = types[Math.floor(Math.random() * types.length)];
          
          // Size and duration based on type
          let size, duration;
          switch (type) {
            case 'bright':
              size = Math.random() * 2 + 2; // 2-4px - larger
              duration = Math.random() * 1000 + 1200; // 1.2-2.2 seconds
              break;
            case 'dim':
              size = Math.random() * 1 + 0.5; // 0.5-1.5px - smaller
              duration = Math.random() * 1500 + 1000; // 1-2.5 seconds
              break;
            case 'fast':
              size = Math.random() * 1.5 + 0.5; // 0.5-2px
              duration = Math.random() * 800 + 600; // 0.6-1.4 seconds - faster
              break;
            case 'slow':
              size = Math.random() * 2 + 1; // 1-3px
              duration = Math.random() * 2000 + 2000; // 2-4 seconds - slower
              break;
            case 'blue':
              size = Math.random() * 2 + 1; // 1-3px
              duration = Math.random() * 1200 + 1000; // 1-2.2 seconds
              break;
            case 'pulsing':
              size = Math.random() * 2 + 1; // 1-3px
              duration = Math.random() * 1500 + 1200; // 1.2-2.7 seconds
              break;
            case 'sparkling':
              size = Math.random() * 1.5 + 0.5; // 0.5-2px
              duration = Math.random() * 1000 + 800; // 0.8-1.8 seconds
              break;
            default:
              size = Math.random() * 1.5 + 0.5; // 0.5-2px
              duration = Math.random() * 1500 + 1000; // 1-2.5 seconds
          }
          
          newShootingStars.push({
            id: Date.now() + i,
            startX,
            startY,
            endX,
            endY,
            duration,
            delay: Math.random() * 1000, // 0-1 seconds delay
            size,
            type,
          });
        }
        
        setShootingStars(prev => [...prev, ...newShootingStars]);
      };

      // Initial batch
      generateShootingStar();
      
      // Generate new shooting stars every 2-4 seconds
      const interval = setInterval(generateShootingStar, Math.random() * 2000 + 2000);
      
      // Clean up old shooting stars every 3 seconds
      const cleanupInterval = setInterval(() => {
        setShootingStars(prev => prev.filter(star => 
          Date.now() - star.id < (star.duration + star.delay + 500)
        ));
      }, 3000);

      return () => {
        clearInterval(interval);
        clearInterval(cleanupInterval);
      };
    } else {
      setStars([]);
      setShootingStars([]);
    }
  }, [theme]);
  
  if (!mounted || theme !== 'dark') return null;
  
  return (
    <div 
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{
        zIndex: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      {/* Static twinkling stars */}
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
            boxShadow: `0 0 ${star.size * 3}px rgba(255, 255, 255, ${star.opacity}), 0 0 ${star.size * 6}px rgba(255, 255, 255, ${star.opacity * 0.5})`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}
        />
      ))}

      {/* Different types of shooting stars */}
      {shootingStars.map(star => {
        const deltaX = star.endX - star.startX;
        const deltaY = star.endY - star.startY;
        
        // Get color and glow based on type
        let backgroundColor, glowColor, animationClass;
        switch (star.type) {
          case 'bright':
            backgroundColor = 'white';
            glowColor = 'rgba(255,255,255,1)';
            animationClass = 'shootingStarMove';
            break;
          case 'dim':
            backgroundColor = 'rgba(255,255,255,0.6)';
            glowColor = 'rgba(255,255,255,0.4)';
            animationClass = 'shootingStarMove';
            break;
          case 'fast':
            backgroundColor = 'white';
            glowColor = 'rgba(255,255,255,0.9)';
            animationClass = 'shootingStarMove';
            break;
          case 'slow':
            backgroundColor = 'white';
            glowColor = 'rgba(255,255,255,0.8)';
            animationClass = 'shootingStarMove';
            break;
          case 'blue':
            backgroundColor = '#87CEEB';
            glowColor = 'rgba(135,206,235,0.8)';
            animationClass = 'shootingStarMove';
            break;
          case 'pulsing':
            backgroundColor = 'white';
            glowColor = 'rgba(255,255,255,0.8)';
            animationClass = 'shootingStarPulse';
            break;
          case 'sparkling':
            backgroundColor = 'white';
            glowColor = 'rgba(255,255,255,0.9)';
            animationClass = 'shootingStarSparkle';
            break;
          default:
            backgroundColor = 'white';
            glowColor = 'rgba(255,255,255,0.8)';
            animationClass = 'shootingStarMove';
        }
        
        return (
          <div key={star.id} className="absolute shooting-star-container">
            {/* Shooting star with type-specific styling */}
            <div
              className={`absolute shooting-star ${star.type}`}
              style={{
                left: `${star.startX}px`,
                top: `${star.startY}px`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                background: backgroundColor,
                borderRadius: '50%',
                boxShadow: `0 0 ${star.size * 2}px ${glowColor}, 0 0 ${star.size * 4}px ${glowColor.replace('0.8', '0.4')}`,
                animation: `${animationClass} ${star.duration}ms linear ${star.delay}ms forwards`,
                '--end-x': `${deltaX}px`,
                '--end-y': `${deltaY}px`,
              } as React.CSSProperties & { '--end-x': string; '--end-y': string; }}
            />
          </div>
        );
      })}
    </div>
  );
};