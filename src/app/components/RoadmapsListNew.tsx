import React from 'react';
import { RoadmapPlanner } from '../types/types';
import { PlusCircle, Map, Calendar, Clock, ChevronRight, Trash2 } from 'lucide-react';
import CircularProgress from './CircularProgress';

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Map size={24} className="mr-2 text-indigo-600" />
          My Academic Roadmaps
        </h1>
        <button
          onClick={onCreateRoadmap}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle size={18} className="mr-2" />
          New Roadmap
        </button>
      </div>

      <div className="space-y-4">
        {roadmaps.map((roadmap) => (
          <div
            key={roadmap.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group"
            onClick={() => onSelectRoadmap(roadmap.id)}
          >
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Map size={18} className="mr-2 text-indigo-600" />
                    {roadmap.goal.title}
                  </h2>
                  <p className="text-sm text-gray-600">{roadmap.goal.identity}</p>
                  
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={16} className="mr-1 text-indigo-500" />
                      <span>Due: {formatDate(roadmap.goal.deadline)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Clock size={16} className="mr-1 text-amber-500" />
                      <span className={`${daysRemaining(roadmap.goal.deadline) < 30 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                        {daysRemaining(roadmap.goal.deadline)} days remaining
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {/* Delete button - only visible on hover */}
                  <button 
                    onClick={(e) => handleDelete(e, roadmap.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity mr-2"
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
                      color={getProgressColor(calculateRoadmapProgress(roadmap))}
                    />
                  </div>
                  
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Add new roadmap button as card */}
        <div
          className="bg-white rounded-xl shadow-sm overflow-hidden border-2 border-dashed border-gray-200 p-5 hover:border-indigo-300 transition-all cursor-pointer"
          onClick={onCreateRoadmap}
        >
          <div className="flex items-center justify-center py-6">
            <PlusCircle size={24} className="mr-2 text-indigo-500" />
            <span className="text-lg font-medium text-gray-600">Add a new roadmap</span>
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
function getProgressColor(percentage: number): string {
  if (percentage >= 100) return '#008000'; // pure green (success/completed)
  if (percentage >= 75) return '#0284c7';  // sky-600 (good progress)
  if (percentage >= 50) return '#4f46e5';  // indigo-600 (medium progress)
  if (percentage >= 25) return '#f59e0b';  // amber-500 (getting started)
  return '#dc2626';                        // red-600 (needs attention)
} 