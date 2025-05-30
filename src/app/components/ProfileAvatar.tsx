'use client';

import React from 'react';

interface ProfileAvatarProps {
  picture?: string | null;
  name?: string | null;
  size?: string;
  className?: string;
}

/**
 * Client component that displays a profile avatar with a letter fallback
 */
export default function ProfileAvatar({ picture, name, size = '2rem', className = '' }: ProfileAvatarProps) {
  // Extract first letter for fallback
  const firstLetter = name && name.length > 0 ? name.charAt(0).toUpperCase() : 'U';
  
  // Generate a pastel color based on the first letter
  const getLetterColor = (char: string): string => {
    const charCode = char.toLowerCase().charCodeAt(0) - 97;
    const hue = (charCode * 25) % 360;
    return `hsl(${hue}, 70%, 80%)`;
  };
  
  const bgColor = getLetterColor(firstLetter);
  
  // Always render the letter avatar as a fallback
  if (!picture) {
    return (
      <div
        className={`rounded-full flex items-center justify-center text-white ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: bgColor,
          fontSize: `calc(${size} * 0.4)`,
        }}
      >
        {firstLetter}
      </div>
    );
  }
  
  // If we have a picture, render the image with a letter fallback
  return (
    <div className={className} style={{ position: 'relative', width: size, height: size }}>
      <img
        src={picture}
        alt={name || 'User'}
        className="rounded-full w-full h-full object-cover"
        onError={(e) => {
          // Hide the image on error
          e.currentTarget.style.display = 'none';
          
          // Show the fallback
          const fallback = e.currentTarget.nextElementSibling;
          if (fallback) {
            (fallback as HTMLElement).style.display = 'flex';
          }
        }}
      />
      
      {/* Hidden fallback that shows when image fails */}
      <div
        className="rounded-full flex items-center justify-center text-white absolute top-0 left-0 w-full h-full"
        style={{
          backgroundColor: bgColor,
          fontSize: `calc(${size} * 0.4)`,
          display: 'none'
        }}
      >
        {firstLetter}
      </div>
    </div>
  );
} 