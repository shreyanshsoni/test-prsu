import React, { useEffect, useState } from 'react';

interface CircularProgressProps {
  percentage: number;
  size: number;
  strokeWidth: number;
  color: string;
}

export default function CircularProgress({
  percentage,
  size,
  strokeWidth,
  color
}: CircularProgressProps) {
  // State to animate the percentage
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  
  // Constrain percentage to 0-100
  const validPercentage = Math.min(100, Math.max(0, percentage));
  
  // Calculate radius and circumference
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;
  
  // Animate the percentage when it changes
  useEffect(() => {
    // Start from current value for smoother transitions on updates
    setAnimatedPercentage(0);
    
    // Animate to the new percentage
    const timeout = setTimeout(() => {
      setAnimatedPercentage(validPercentage);
    }, 50);
    
    return () => clearTimeout(timeout);
  }, [validPercentage]);
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="#e5e7eb" // gray-200
        strokeWidth={strokeWidth}
      />
      
      {/* Progress circle with animation */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
      />
      
      {/* Percentage text with matching color */}
      <text
        x="50%"
        y="50%"
        dy=".3em"
        textAnchor="middle"
        fill={color} // Use the same color as the progress circle
        fontSize={size * 0.28}
        fontWeight="bold"
        style={{ transition: 'fill 0.3s ease' }}
      >
        {Math.round(animatedPercentage)}%
      </text>
    </svg>
  );
} 