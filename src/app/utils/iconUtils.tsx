import React from 'react';
import { Calendar, BookOpen, GraduationCap, CheckCircle2, Circle, Clock } from 'lucide-react';

// Define types for the parameters
type MilestoneType = 'deadline' | 'preparation' | 'prerequisite';
type StatusType = 'completed' | 'in_progress' | 'not_started';

// Update getMilestoneIcon function with type annotation and default case
export const getMilestoneIcon = (type: MilestoneType, desktopSize: string = '1.25rem', mobileSize: string = '1rem') => {
  const sizeClasses = `w-[${mobileSize}] h-[${mobileSize}] sm:w-[${desktopSize}] sm:h-[${desktopSize}]`;
  switch (type) {
    case 'deadline':
      return <Calendar className={`${sizeClasses} text-red-500`} aria-hidden="true" />;
    case 'preparation':
      return <BookOpen className={`${sizeClasses} text-blue-500`} aria-hidden="true" />;
    case 'prerequisite':
      return <GraduationCap className={`${sizeClasses} text-purple-500`} aria-hidden="true" />;
    default:
      return null;  // Return null for unmatched cases
  }
};

// Update getStatusIcon function to support different sizes for desktop and mobile
export const getStatusIcon = (status: StatusType, desktopSize: string = '1.25rem', mobileSize: string = '1rem') => {
  const sizeClasses = `w-[${mobileSize}] h-[${mobileSize}] sm:w-[${desktopSize}] sm:h-[${desktopSize}]`;
  switch (status) {
    case 'completed':
      return <CheckCircle2 className={`${sizeClasses} text-green-500`} aria-hidden="true" />;
    case 'in_progress':
      return <Clock className={`${sizeClasses} text-yellow-500`} aria-hidden="true" />;
    case 'not_started':
      return <Circle className={`${sizeClasses} text-gray-300`} aria-hidden="true" />;
    default:
      return null;  // Return null for unmatched cases
  }
};
