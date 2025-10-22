import React from 'react';
import { RoadmapPlanner } from '../types/types';
import { PlusCircle, Map, Calendar, Clock, ChevronRight, Trash2, Sparkles, Lock } from 'lucide-react';
import CircularProgress from './CircularProgress';
import { useTheme } from '../app/contexts/ThemeContext';
import Tooltip from './ui/Tooltip';

interface RoadmapsListProps {
  roadmaps: RoadmapPlanner[];
  onSelectRoadmap: (id: string) => void;
  onCreateRoadmap: () => void;
  onDeleteRoadmap: (id: string) => void;
  onAIBuildRoadmap?: () => void;
}

export default function RoadmapsList({
  roadmaps,
  onSelectRoadmap,
  onCreateRoadmap,
  onDeleteRoadmap,
  onAIBuildRoadmap
}: RoadmapsListProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Format date for display - using string manipulation to avoid timezone issues
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No due date';
    
    try {
      // Parse the date string directly without creating Date objects
      const parts = dateString.split('-');
      if (parts.length !== 3) return 'Invalid date';
      
      const year = parts[0];
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      
      // Validate the parsed values
      if (isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
        return 'Invalid date';
      }
      
      // Month names array
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      // Format as "January 15, 2024"
      return `${monthNames[month - 1]} ${day}, ${year}`;
    } catch (error) {
      return 'Invalid date';
    }
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text flex items-center">
            <Map size={24} className="mr-2 text-primary-600 dark:text-primary-400" />
            My Academic Roadmaps
          </h1>
          <Tooltip content="Plan your journey manually or generate an AI roadmap." />
        </div>
        <div className="flex items-center space-x-3">
          {onAIBuildRoadmap && (
            <button
              onClick={onAIBuildRoadmap}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 text-white rounded-lg flex items-center hover:from-blue-700 hover:to-cyan-700 dark:hover:from-blue-600 dark:hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transform"
            >
              <Sparkles size={18} className="mr-2" />
              AI-Roadmap Builder
            </button>
          )}
          <div className="relative group">
            <button
              disabled
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg flex items-center transition-all duration-200 shadow-sm opacity-60 cursor-not-allowed filter blur-sm"
            >
              <PlusCircle size={18} className="mr-2" />
              New Roadmap
              <Lock className="w-4 h-4 ml-2 text-gray-500 dark:text-gray-400" />
            </button>
            
            {/* Tooltip text - only shows on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg shadow-lg whitespace-nowrap z-50">
              We're working on something exciting - stay tuned
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {roadmaps.map((roadmap) => (
          <div
            key={roadmap.id}
            className="border border-light-border dark:border-dark-border rounded-lg bg-light-card dark:bg-dark-card shadow-sm hover:shadow-md transition-all cursor-pointer group"
            onClick={() => onSelectRoadmap(roadmap.id)}
          >
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-light-text dark:text-dark-text flex items-center">
                    <Map size={18} className="mr-2 text-primary-600 dark:text-primary-400" />
                    {roadmap.goal.title}
                  </h2>
                  <p className="text-sm text-light-muted dark:text-dark-muted">{roadmap.goal.identity}</p>
                  
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center text-sm text-light-muted dark:text-dark-muted">
                      <Calendar size={16} className="mr-1 text-primary-500 dark:text-primary-400" />
                      <span>Due: {formatDate(roadmap.goal.deadline)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Clock size={16} className="mr-1 text-amber-500 dark:text-amber-400" />
                      <span className={`${daysRemaining(roadmap.goal.deadline) < 30 ? 'text-red-600 dark:text-red-400 font-medium' : 'text-light-muted dark:text-dark-muted'}`}>
                        {daysRemaining(roadmap.goal.deadline)} days remaining
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {/* Delete button - only visible on hover */}
                  <button 
                    onClick={(e) => handleDelete(e, roadmap.id)}
                    className="p-2 text-light-muted dark:text-dark-muted hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-light-border dark:hover:bg-dark-border opacity-0 group-hover:opacity-100 transition-opacity mr-2"
                    aria-label="Delete roadmap"
                  >
                    <Trash2 size={18} />
                  </button>
                  
                  {/* Progress indicator */}
                  <div className="mr-4">
                    <CircularProgress 
                      percentage={calculateRoadmapProgress(roadmap)}
                      size={48}
                      strokeWidth={4}
                      color={getProgressColor(calculateRoadmapProgress(roadmap), isDark)}
                    />
                  </div>
                  
                  <ChevronRight size={20} className="text-light-muted dark:text-dark-muted" />
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Add new roadmap button as card */}
        <div
          className="border border-dashed border-light-border dark:border-dark-border rounded-lg bg-light-card dark:bg-dark-card p-5 hover:border-primary-300 dark:hover:border-primary-500 transition-all cursor-pointer"
          onClick={onCreateRoadmap}
        >
          <div className="flex items-center justify-center py-6">
            <PlusCircle size={24} className="mr-2 text-primary-500 dark:text-primary-400" />
            <span className="text-lg font-medium text-light-muted dark:text-dark-muted">Add a new roadmap</span>
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
