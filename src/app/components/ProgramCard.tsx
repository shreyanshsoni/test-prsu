'use client';

import { useState, useEffect } from 'react';
import { Program } from '../types/types';
import { Calendar, MapPin, GraduationCap, DollarSign, Heart, X } from 'lucide-react';
import { animated, to, useSpring } from '@react-spring/web';
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
  
  // Track the drag state to show appropriate indicators
  const [dragX, setDragX] = useState(0);
  
  // Add glowing effect spring animation
  const [glowSpring, glowApi] = useSpring(() => ({
    glow: 0,
    config: { tension: 120, friction: 14 }
  }));

  // Function to handle image load error
  const handleImageError = () => {
    setImageError(true);
  };
  
  // Extract the current drag position from event if available
  useEffect(() => {
    if (props.eventData && props.eventData.event && props.eventData.event.delta) {
      setDragX(props.eventData.event.delta[0]);
    } else if (props.args && props.args[1] && props.args[1].movement) {
      setDragX(props.args[1].movement[0]);
    }
    
    // Update glow effect based on drag position
    const dragDistance = Math.abs(dragX);
    const direction = dragX > 0 ? 1 : -1;
    const intensity = Math.min(dragDistance / 150, 1);
    
    glowApi.start({
      glow: intensity * direction
    });
  }, [props, dragX]);

  // Modify the original gesture handler to track position
  const originalOnMouseDown = props.onMouseDown;
  const enhancedOnMouseDown = (e: React.MouseEvent) => {
    // Reset drag position when starting a new drag
    setDragX(0);
    // Call the original handler
    if (originalOnMouseDown) originalOnMouseDown(e);
  };
  
  // Modify the original gesture handler to track position
  const originalOnTouchStart = props.onTouchStart;
  const enhancedOnTouchStart = (e: React.TouchEvent) => {
    // Reset drag position when starting a new drag
    setDragX(0);
    // Call the original handler
    if (originalOnTouchStart) originalOnTouchStart(e);
  };

  return (
    <AnimatedDiv
      {...props}
      onMouseDown={enhancedOnMouseDown}
      onTouchStart={enhancedOnTouchStart}
      style={{
        ...style,
        touchAction: 'none',
      }}
      className={`program-card relative rounded-xl ${isSwipeMode ? 'w-full h-full' : 'w-full'} overflow-hidden ${
        isSwipeMode ? 'shadow-xl dark:shadow-2xl shadow-black/20 dark:shadow-black/40' : 'shadow-lg dark:shadow-dark-border/30'
      } bg-light-card dark:bg-dark-card`}
    >
      {/* Swipe direction indicators - Only show in swipe mode */}
      {isSwipeMode && (
        <>
          {/* Left swipe (reject) indicator */}
          <animated.div
            style={{
              opacity: to([glowSpring.glow], glow => (glow < 0 ? Math.abs(glow) * 0.8 : 0)),
              transform: to([glowSpring.glow], glow => `scale(${1 + Math.abs(Math.min(glow, 0)) * 0.2})`),
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-red-500 dark:bg-red-600 text-white rounded-full p-3 shadow-lg"
          >
            <X className="w-5 h-5" />
          </animated.div>

          {/* Right swipe (approve) indicator */}
          <animated.div
            style={{
              opacity: to([glowSpring.glow], glow => (glow > 0 ? glow * 0.8 : 0)),
              transform: to([glowSpring.glow], glow => `scale(${1 + Math.max(glow, 0) * 0.2})`),
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-primary-500 dark:bg-primary-600 text-white rounded-full p-3 shadow-lg"
          >
            <Heart className="w-5 h-5" />
          </animated.div>

          {/* Card glow overlay based on swipe direction */}
          <animated.div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 5,
              mixBlendMode: 'overlay',
              background: to(
                [glowSpring.glow],
                glow => {
                  if (glow > 0) {
                    return `radial-gradient(circle at 70% 50%, rgba(79, 209, 197, ${glow * 0.3}), transparent 70%)`;
                  } else {
                    return `radial-gradient(circle at 30% 50%, rgba(239, 68, 68, ${Math.abs(glow) * 0.3}), transparent 70%)`;
                  }
                }
              ),
            }}
          />

          {/* Additional swipe border indicator */}
          <animated.div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 4, 
              borderWidth: '2px', // Thinner border for smaller cards
              borderStyle: 'solid',
              borderRadius: 'inherit',
              borderColor: to(
                [glowSpring.glow],
                glow => {
                  if (glow > 0) {
                    return `rgba(79, 209, 197, ${Math.max(glow * 0.6, 0)})`;
                  } else if (glow < 0) {
                    return `rgba(239, 68, 68, ${Math.max(Math.abs(glow) * 0.6, 0)})`;
                  }
                  return 'transparent';
                }
              ),
            }}
          />
        </>
      )}

      {/* Swipe mode UI */}
      {isSwipeMode ? (
        <div className="h-full flex flex-col">
          {/* Image */}
          <div className="h-2/5 relative bg-gray-100 dark:bg-dark-background">
            {!imageError ? (
              <Image
                src={program.imageUrl || "/images/default-opportunity.jpg"}
                alt={program.title || "Program"}
                fill
                className="object-cover"
                onError={handleImageError}
                priority={isSwipeMode} // Prioritize loading in swipe mode
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-light-background dark:bg-dark-background">
                <div className="text-light-muted dark:text-dark-muted text-sm font-medium">Image unavailable</div>
              </div>
            )}
            
            {/* Enhanced gradient overlay for better text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          {/* Content */}
          <div className="p-3 md:p-3.5 flex-1 flex flex-col bg-light-card dark:bg-dark-card">
            <h3 className="program-card-text text-base lg:text-base font-bold mb-1.5 text-light-text dark:text-dark-text tracking-tight leading-tight line-clamp-1">
              {program.title}
            </h3>
            
            <p className="program-card-text text-xs lg:text-xs mb-1.5 line-clamp-2 text-light-text dark:text-dark-text font-medium opacity-90">
              {program.description || "No description available"}
            </p>
            
            {/* Organization and field tags - more compact layout */}
            {(program.organization || program.field) && (
              <div className="flex flex-wrap gap-1 mb-1.5">
                {program.organization && (
                  <span className="program-card-text text-xs px-1.5 py-0.5 rounded-full bg-light-border dark:bg-dark-border text-light-text dark:text-dark-text font-medium line-clamp-1 max-w-full">
                    {program.organization}
                  </span>
                )}
                {program.field && (
                  <span className="program-card-text text-xs px-1.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium">
                    {program.field}
                  </span>
                )}
              </div>
            )}
            
            {/* Details section with improved readability */}
            <div className="grid grid-cols-2 gap-1.5 mt-auto bg-light-background/40 dark:bg-dark-background/40 p-1.5 rounded-md">
              {program.location && (
                <div className="flex items-center">
                  <MapPin className="w-3 h-3 text-primary-500 dark:text-primary-400 mr-1 flex-shrink-0" />
                  <span className="program-card-text text-2xs md:text-xs text-light-text dark:text-dark-text font-medium truncate">
                    {program.location}
                  </span>
                </div>
              )}
              
              {program.deadline && (
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 text-primary-500 dark:text-primary-400 mr-1 flex-shrink-0" />
                  <span className="program-card-text text-2xs md:text-xs text-light-text dark:text-dark-text font-medium truncate">
                    {formatDate(program.deadline)}
                  </span>
                </div>
              )}

              {program.degreeLevel && (
                <div className="flex items-center">
                  <GraduationCap className="w-3 h-3 text-primary-500 dark:text-primary-400 mr-1 flex-shrink-0" />
                  <span className="program-card-text text-2xs md:text-xs text-light-text dark:text-dark-text font-medium truncate">
                    {program.degreeLevel}
                  </span>
                </div>
              )}
              
              {program.cost !== undefined && (
                <div className="flex items-center">
                  <DollarSign className="w-3 h-3 text-primary-500 dark:text-primary-400 mr-1 flex-shrink-0" />
                  <span className="program-card-text text-2xs md:text-xs text-light-text dark:text-dark-text font-medium truncate">
                    {program.cost === 0 ? "Free" : `$${program.cost.toLocaleString()}`}
                  </span>
                </div>
              )}
            </div>
            
            {/* Swipe instruction overlay with improved readability */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center">
              <animated.div 
                style={{
                  opacity: to([glowSpring.glow], glow => 1 - Math.abs(glow)), // Fade out when swiping
                }}
                className="program-card-text text-xs text-light-text dark:text-dark-text bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm font-medium"
              >
                Swipe to accept or reject
              </animated.div>
            </div>
          </div>
        </div>
      ) : (
        // List mode UI - More compact
        <div className="flex flex-col h-full">
          <div className="h-48 relative">
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
                <div className="text-light-muted dark:text-dark-muted">Image unavailable</div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
              <h3 className="text-white font-semibold text-lg">{program.title}</h3>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <p className="text-light-muted dark:text-dark-muted text-sm mb-4 line-clamp-3">
              {program.description || "No description available"}
            </p>
            
            <div className="mt-auto flex flex-wrap gap-2">
              {program.field && (
                <span className="text-xs px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                  {program.field}
                </span>
              )}
              {program.organization && (
                <span className="text-xs px-2 py-1 rounded-full bg-light-border dark:bg-dark-border text-light-text dark:text-dark-text">
                  {program.organization}
                </span>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-light-muted dark:text-dark-muted">
                {program.deadline ? formatDate(program.deadline) : "No deadline"}
              </span>
              
              {program.cost !== undefined && (
                <span className="font-medium text-sm text-light-text dark:text-dark-text">
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