import React from 'react';
import { Calendar, BookOpen, GraduationCap, CheckCircle2, Circle, Clock } from 'lucide-react';

// Define types for the parameters
type MilestoneType = 'deadline' | 'preparation' | 'prerequisite';
type StatusType = 'completed' | 'in_progress' | 'not_started';

// Update getMilestoneIcon function with type annotation and default case
export const getMilestoneIcon = (type: MilestoneType) => {
  switch (type) {
    case 'deadline':
      return <Calendar className="w-5 h-5 text-red-500" aria-hidden="true" />;
    case 'preparation':
      return <BookOpen className="w-5 h-5 text-blue-500" aria-hidden="true" />;
    case 'prerequisite':
      return <GraduationCap className="w-5 h-5 text-purple-500" aria-hidden="true" />;
    default:
      return null;  // Return null for unmatched cases
  }
};

// Update getStatusIcon function with type annotation and default case
export const getStatusIcon = (status: StatusType) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-5 h-5 text-green-500" aria-hidden="true" />;
    case 'in_progress':
      return <Clock className="w-5 h-5 text-yellow-500" aria-hidden="true" />;
    case 'not_started':
      return <Circle className="w-5 h-5 text-gray-300" aria-hidden="true" />;
    default:
      return null;  // Return null for unmatched cases
  }
};
