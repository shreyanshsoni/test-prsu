import React, { useState, useEffect } from 'react';
import { RoadmapPlanner } from '../types/types';
import { PlusCircle, Map, Calendar, Clock, ChevronRight, Trash2 } from 'lucide-react';
import CircularProgress from './CircularProgress';
import { useTheme } from '../contexts/ThemeContext';

interface RoadmapsListProps {
  roadmaps: RoadmapPlanner[];
  onSelectRoadmap: (id: string) => void;
  onCreateRoadmap: () => void;
  onDeleteRoadmap: (id: string) => void;
}

export default function RoadmapsList({
  roadmaps,
  onSelectRoadmap,
  onCreateRoadmap,
  onDeleteRoadmap
}: RoadmapsListProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isMobile, setIsMobile] = useState(false);
  
  // Check viewport size on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Calculate days remaining
  const daysRemaining = (deadline: string) => {
    const today = new Date();
    const targetDate = new Date(deadline);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent clicking through to the roadmap selection
    onDeleteRoadmap(id);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text flex items-center">
          <Map size={isMobile ? 20 : 24} className="mr-2 text-primary-600 dark:text-primary-400" />
          My Academic Roadmaps
        </h1>
        <button
          onClick={onCreateRoadmap}
          className="px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg flex items-center justify-center hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors text-sm sm:text-base"
        >
          <PlusCircle size={isMobile ? 16 : 18} className="mr-2" />
          New Roadmap
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {roadmaps.map((roadmap) => (
          <div
            key={roadmap.id}
            className="border border-light-border dark:border-dark-border rounded-lg bg-light-card dark:bg-dark-card shadow-sm hover:shadow-md transition-all cursor-pointer group"
            onClick={() => onSelectRoadmap(roadmap.id)}
          >
            <div className="p-3 sm:p-5">
              <div className="flex justify-between items-start">
                <div className="space-y-1 sm:space-y-2 flex-1 mr-2 min-w-0 overflow-hidden">
                  <h2 className="text-base sm:text-xl font-semibold text-light-text dark:text-dark-text flex items-center">
                    <Map size={isMobile ? 16 : 18} className="mr-2 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                    <span className="truncate block w-full">{roadmap.goal.title}</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted truncate">{roadmap.goal.identity}</p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-1 sm:space-y-0">
                    <div className="flex items-center text-xs sm:text-sm text-light-muted dark:text-dark-muted">
                      <Calendar size={isMobile ? 14 : 16} className="mr-1 text-primary-500 dark:text-primary-400 flex-shrink-0" />
                      <span>Due: {formatDate(roadmap.goal.deadline)}</span>
                    </div>
                    
                    <div className="flex items-center text-xs sm:text-sm">
                      <Clock 
                        size={isMobile ? 14 : 16} 
                        className={`mr-1 flex-shrink-0 ${
                          daysRemaining(roadmap.goal.deadline) < 30 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-light-muted dark:text-dark-muted'
                        }`} 
                      />
                      <span className={`${
                        daysRemaining(roadmap.goal.deadline) < 30 
                          ? 'text-red-600 dark:text-red-400 font-medium' 
                          : 'text-light-muted dark:text-dark-muted'
                      }`}>
                        {daysRemaining(roadmap.goal.deadline)} days remaining
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {/* Delete button - only visible on hover on desktop, always visible on mobile but smaller */}
                  <button 
                    onClick={(e) => handleDelete(e, roadmap.id)}
                    className="p-1 sm:p-2 text-light-muted dark:text-dark-muted hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-light-border dark:hover:bg-dark-border sm:opacity-0 sm:group-hover:opacity-100 transition-opacity mr-1 sm:mr-2"
                    aria-label="Delete roadmap"
                  >
                    <Trash2 size={isMobile ? 16 : 18} />
                  </button>
                  
                  {/* Progress indicator */}
                  <div className="mr-2 sm:mr-4">
                    <CircularProgress 
                      percentage={calculateRoadmapProgress(roadmap)}
                      size={isMobile ? 36 : 48}
                      strokeWidth={4}
                      color={getProgressColor(calculateRoadmapProgress(roadmap), isDark)}
                    />
                  </div>
                  
                  <ChevronRight size={isMobile ? 18 : 20} className="text-light-muted dark:text-dark-muted" />
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Add new roadmap button as card */}
        <div
          className="border border-dashed border-light-border dark:border-dark-border rounded-lg bg-light-card dark:bg-dark-card p-3 sm:p-5 hover:border-primary-300 dark:hover:border-primary-500 transition-all cursor-pointer"
          onClick={onCreateRoadmap}
        >
          <div className="flex items-center justify-center py-4 sm:py-6">
            <PlusCircle size={isMobile ? 20 : 24} className="mr-2 text-primary-500 dark:text-primary-400" />
            <span className="text-base sm:text-lg font-medium text-light-muted dark:text-dark-muted">Add a new roadmap</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate roadmap progress
function calculateRoadmapProgress(roadmap: RoadmapPlanner): number {
  if (!roadmap.phases.length) return 0;
  
  const totalTasks = roadmap.phases.reduce((acc, phase) => acc + phase.tasks.length, 0);
  const completedTasks = roadmap.phases.reduce(
    (acc, phase) => acc + phase.tasks.filter(task => task.completed).length, 
    0
  );
  
  return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
}

// Helper function to get appropriate color based on progress percentage
function getProgressColor(percentage: number, isDark: boolean = false): string {
  if (percentage >= 100) return isDark ? '#22c55e' : '#008000'; // green (success/completed)
  if (percentage >= 75) return isDark ? '#38bdf8' : '#0284c7';  // sky color (good progress)
  if (percentage >= 50) return isDark ? '#818cf8' : '#4f46e5';  // indigo (medium progress)
  if (percentage >= 25) return isDark ? '#fbbf24' : '#f59e0b';  // amber (getting started)
  return isDark ? '#ef4444' : '#dc2626';                        // red (needs attention)
} 