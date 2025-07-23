import React from 'react';
import RoadmapOverview from './RoadmapOverview';
import PhaseAccordion from './PhaseAccordion';
import { RoadmapPlanner, Goal, PhaseData, Task } from '../types/types';
import { ArrowLeft } from 'lucide-react';
import AddPhaseButton from './AddPhaseButton';
import { useTheme } from '../app/contexts/ThemeContext';

interface RoadmapDetailProps {
  roadmap: RoadmapPlanner;
  activePhase: number;
  onGoBack: () => void;
  onPhaseToggle: (index: number) => void;
  onTaskToggle: (phaseIndex: number, taskIndex: number) => void;
  onTaskNoteUpdate: (phaseIndex: number, taskIndex: number, note: string) => void;
  onAddTask: (phaseIndex: number, taskTitle: string) => void;
  onUpdateGoal: (goal: Goal) => void;
  onAddPhase: (title: string, description: string) => void;
  onUpdateTask: (phaseIndex: number, taskIndex: number, updatedTask: Task) => void;
  onUpdateReflection: (phaseIndex: number, reflection: string) => void;
  onDeletePhase?: (phaseIndex: number, phaseId: string) => void;
  onDeleteTask?: (phaseIndex: number, taskIndex: number, taskId: string) => void;
  onUpdatePhase?: (phaseIndex: number, phaseId: string, updates: { title?: string; description?: string }) => void;
}

export default function RoadmapDetail({
  roadmap,
  activePhase,
  onGoBack,
  onPhaseToggle,
  onTaskToggle,
  onTaskNoteUpdate,
  onAddTask,
  onUpdateGoal,
  onAddPhase,
  onUpdateTask,
  onUpdateReflection,
  onDeletePhase,
  onDeleteTask,
  onUpdatePhase
}: RoadmapDetailProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Calculate overall progress
  const totalTasks = roadmap.phases.reduce((acc, phase) => acc + phase.tasks.length, 0);
  const completedTasks = roadmap.phases.reduce(
    (acc, phase) => acc + phase.tasks.filter(task => task.completed).length, 
    0
  );
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <button 
          onClick={onGoBack}
          className="mr-4 p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          aria-label="Go back to roadmaps list"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
          {roadmap.goal.title}
        </h1>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-3/4 space-y-6">
          <RoadmapOverview 
            goal={roadmap.goal.title}
            identity={roadmap.goal.identity}
            deadline={roadmap.goal.deadline}
            progress={progress}
            onUpdateGoal={onUpdateGoal}
          />
          
          {roadmap.phases.length > 0 ? (
            <PhaseAccordion 
              phases={roadmap.phases}
              activePhase={activePhase}
              onPhaseToggle={onPhaseToggle}
              onTaskToggle={onTaskToggle}
              onTaskNoteUpdate={onTaskNoteUpdate}
              onAddTask={onAddTask}
              onUpdateTask={onUpdateTask}
              onUpdateReflection={onUpdateReflection}
              onDeletePhase={onDeletePhase}
              onDeleteTask={onDeleteTask}
              onUpdatePhase={onUpdatePhase}
            />
          ) : (
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 text-center">
              <p className="text-gray-600 dark:text-dark-muted mb-4">No phases have been added to this roadmap yet.</p>
              <p className="text-gray-500 dark:text-dark-muted text-sm mb-6">
                Create your first phase to start organizing your journey toward your goal.
              </p>
            </div>
          )}
          
          {/* Add Phase Button */}
          <AddPhaseButton onAddPhase={onAddPhase} />
        </div>
        
        <div className="w-full lg:w-1/4">
          {/* ToolSidebar component removed but space preserved */}
        </div>
      </div>
    </div>
  );
} 
