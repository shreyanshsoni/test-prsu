'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Program, ChecklistItem, AcademicYear } from '../types/types';
import { ListChecks, CalendarClock, PlusCircle, X, Map, Plus, FolderPlus, Loader2, Calendar, Sparkles } from 'lucide-react';
import { GoalInput, Goal, toggleGoalCompletion } from '../lib/services/goalService';
import { ScrollableGoals } from './ScrollableGoals';
import { useTheme } from '../app/contexts/ThemeContext';
import AIRoadmapBuilder from './AIRoadmapBuilder';
import Tooltip from './ui/Tooltip';

interface UserDashboardProps {
  savedPrograms: Program[];
  checklist: ChecklistItem[];
  academicYears: AcademicYear[];
  onUpdateAcademicYears?: (years: AcademicYear[]) => void;
  onSwitchToRoadmapPlanner?: (tab?: string) => void;
  onSwitchToGoalsTab?: () => void;
  onCreateGoal?: (goalData: GoalInput) => Promise<boolean>;
  academicGoals?: Goal[];
  isLoadingGoals?: boolean;
  onToggleGoalCompletion?: (goalId: string, completed: boolean) => Promise<void>;
}

const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px !important;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f0f0f0 !important;
    border-radius: 10px !important;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #888 !important;
    border-radius: 10px !important;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #555 !important;
  }
  
  .dark .custom-scrollbar::-webkit-scrollbar-track {
    background: #1e293b !important;
  }
  .dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #475569 !important;
  }
  .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #64748b !important;
  }
  
  /* Apply to ScrollableGoals container */
  .goals-container .scrollable-content::-webkit-scrollbar {
    width: 8px !important;
  }
  .goals-container .scrollable-content::-webkit-scrollbar-track {
    background: #f0f0f0 !important;
    border-radius: 10px !important;
  }
  .goals-container .scrollable-content::-webkit-scrollbar-thumb {
    background: #888 !important;
    border-radius: 10px !important;
  }
  .goals-container .scrollable-content::-webkit-scrollbar-thumb:hover {
    background: #555 !important;
  }
  
  .dark .goals-container .scrollable-content::-webkit-scrollbar-track {
    background: #1e293b !important;
  }
  .dark .goals-container .scrollable-content::-webkit-scrollbar-thumb {
    background: #475569 !important;
  }
  .dark .goals-container .scrollable-content::-webkit-scrollbar-thumb:hover {
    background: #64748b !important;
  }
`;

export default function UserDashboard({
  savedPrograms,
  checklist,
  academicYears,
  onUpdateAcademicYears,
  onSwitchToRoadmapPlanner,
  onSwitchToGoalsTab,
  onCreateGoal,
  academicGoals = [],
  isLoadingGoals = false,
  onToggleGoalCompletion
}: UserDashboardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newYear, setNewYear] = useState<string>("");
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [showAIRoadmapModal, setShowAIRoadmapModal] = useState(false);
  const [showAIRoadmapBuilder, setShowAIRoadmapBuilder] = useState(false);
  const [aiRoadmapForm, setAiRoadmapForm] = useState({
    interests: '',
    futureJob: '',
    targetDate: ''
  });
  const [customInterests, setCustomInterests] = useState('');
  const [customFutureJob, setCustomFutureJob] = useState('');
  const [milestones, setMilestones] = useState<{
    title: string;
    description: string;
    date: string;
    type: string;
  }[]>([{ title: "", description: "", date: "", type: "deadline" }]);
  
  // Use refs to store form state without causing re-renders
  const formRefs = useRef<{
    year: string;
    milestones: {
      title: string;
      description: string;
      date: string;
      type: string;
    }[];
  }>({
    year: "",
    milestones: [{ title: "", description: "", date: "", type: "deadline" }]
  });
  
  // State to track if we're in the browser (for createPortal)
  const [isBrowser, setIsBrowser] = useState(false);
  
  // Goal form refs
  const goalTitleRef = useRef<HTMLInputElement>(null);
  const goalDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const goalDueDateRef = useRef<HTMLInputElement>(null);
  const goalCategoryRef = useRef<HTMLSelectElement>(null);
  const goalPriorityRef = useRef<HTMLSelectElement>(null);
  
  // Set isBrowser to true once the component mounts
  useEffect(() => {
    setIsBrowser(true);
    
    // Initialize refs with current state values
    formRefs.current = {
      year: newYear,
      milestones: [...milestones]
    };
  }, []);
  
  // Disable body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      
      // Reset form refs when modal opens
      formRefs.current = {
        year: newYear,
        milestones: JSON.parse(JSON.stringify(milestones))
      };
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen]);
  
  // Calculate completed tasks
  const completedTasks = checklist.filter(item => item.status === 'completed').length;
  const totalTasks = checklist.length;
  
  // Calculate completed milestones
  const completedMilestones = academicYears.reduce((count, year) => {
    return count + year.milestones.filter(milestone => milestone.completed).length;
  }, 0);
  
  const totalMilestones = academicYears.reduce((count, year) => {
    return count + year.milestones.length;
  }, 0);

  // Get upcoming deadlines (sort by date and take the first 3)
  const upcomingDeadlines = [...checklist]
    .filter(item => item.deadline && item.status !== 'completed')
    .sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    })
    .slice(0, 3);

  const addMilestone = (e?: React.MouseEvent) => {
    e?.preventDefault();
    
    // Add new milestone to refs without causing re-render
    formRefs.current.milestones.push({ 
      title: "", 
      description: "", 
      date: "", 
      type: "deadline" 
    });
    
    // Update state (this will cause a render)
    setMilestones([...formRefs.current.milestones]);
  };

  const removeMilestone = (index: number, e?: React.MouseEvent) => {
    e?.preventDefault();
    
    // Remove milestone from refs
    formRefs.current.milestones = formRefs.current.milestones.filter((_, i) => i !== index);
    
    // Update state
    setMilestones([...formRefs.current.milestones]);
  };

  const handleCreateRoadmap = () => {
    // Get the current values from refs
    const { year, milestones: currentMilestones } = formRefs.current;
    
    if (!year) return;
    
    const yearNum = parseInt(year);
    if (isNaN(yearNum)) return;
    
    const validMilestones = currentMilestones.filter(m => m.title.trim() !== "");
    if (validMilestones.length === 0) return;
    
    const newAcademicYear: AcademicYear = {
      year: yearNum,
      milestones: validMilestones.map((m, index) => ({
        id: `new-${Date.now()}-${index}`,
        title: m.title,
        description: m.description,
        date: m.date,
        type: m.type as "deadline" | "preparation" | "prerequisite",
        completed: false,
      })),
    };
    
    const updatedYears = [...academicYears, newAcademicYear].sort((a, b) => a.year - b.year);
    
    if (onUpdateAcademicYears) {
      onUpdateAcademicYears(updatedYears);
    }
    
    // Reset form
    setNewYear("");
    setMilestones([{ title: "", description: "", date: "", type: "deadline" }]);
    formRefs.current = {
      year: "",
      milestones: [{ title: "", description: "", date: "", type: "deadline" }]
    };
    setIsModalOpen(false);
  };

  // Modified handler to use onSwitchToRoadmapPlanner if provided
  const handleCreateRoadmapClick = () => {
    if (onSwitchToRoadmapPlanner) {
      onSwitchToRoadmapPlanner(); // Switch to roadmap planner tab
    } else {
      setIsModalOpen(true); // Fallback to opening the old modal
    }
  };

  // Handle goal form submission
  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goalTitleRef.current?.value.trim()) {
      return;
    }
    
    if (!onCreateGoal) {
      setShowGoalForm(false);
      return;
    }
    
    setIsSavingGoal(true);
    
    try {
      const goalData: GoalInput = {
        title: goalTitleRef.current.value,
        description: goalDescriptionRef.current?.value || '',
        dueDate: goalDueDateRef.current?.value || '',
        category: (goalCategoryRef.current?.value as 'academic' | 'extracurricular' | 'career' | 'personal') || 'academic',
        priority: (goalPriorityRef.current?.value as 'low' | 'medium' | 'high') || 'medium'
      };
      
      const success = await onCreateGoal(goalData);
      
      if (success) {
        // Close the form
        setShowGoalForm(false);
      }
    } catch (error) {
      console.error('Error saving goal:', error);
    } finally {
      setIsSavingGoal(false);
    }
  };

  // AI Roadmap Builder functions
  const handleAIRoadmapSubmit = () => {
    // Prepare final form data with custom inputs
    let finalInterests = aiRoadmapForm.interests;
    let finalFutureJob = aiRoadmapForm.futureJob;
    
    // If "other" is selected, use the custom text input
    if (aiRoadmapForm.interests === 'other' && customInterests.trim()) {
      finalInterests = customInterests.trim();
    }
    
    if (aiRoadmapForm.futureJob === 'other' && customFutureJob.trim()) {
      finalFutureJob = customFutureJob.trim();
    }
    
    // Check if all required fields are filled
    if (finalInterests && finalFutureJob && aiRoadmapForm.targetDate) {
      // Store the final answers in the form state
      setAiRoadmapForm({
        ...aiRoadmapForm,
        interests: finalInterests,
        futureJob: finalFutureJob
      });
      
      setShowAIRoadmapModal(false);
      setShowAIRoadmapBuilder(true);
    }
  };

  const resetAIRoadmapForm = () => {
    setAiRoadmapForm({
      interests: '',
      futureJob: '',
      targetDate: ''
    });
    setCustomInterests('');
    setCustomFutureJob('');
  };

  const closeAIRoadmapModal = () => {
    setShowAIRoadmapModal(false);
    resetAIRoadmapForm();
  };
  
  // Close goal form
  const closeGoalForm = () => {
    setShowGoalForm(false);
  };

  // Modal component to be rendered in portal
  const Modal = () => {
    // Handle year input change (now modifies the ref directly)
    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Update ref without causing re-render
      formRefs.current.year = e.target.value;
    };
    
    // Handle milestone field change (now modifies the ref directly)
    const handleMilestoneFieldChange = (index: number, field: string, value: string) => {
      // Ensure the milestone exists
      if (formRefs.current.milestones[index]) {
        // Use type safe approach with conditional
        if (field === 'title' || field === 'description' || field === 'date' || field === 'type') {
        formRefs.current.milestones[index][field] = value;
        }
      }
    };

    // Handle form submission with preventDefault
    const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Update the state once on form submission
      setNewYear(formRefs.current.year);
      setMilestones([...formRefs.current.milestones]);
      
      // Process the form after state is updated
      setTimeout(() => {
        handleCreateRoadmap();
      }, 10);
    };

    return (
      <div 
        className="fixed top-0 left-0 right-0 bottom-0 min-h-[100vh] min-w-[100vw] w-screen h-screen overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn"
        style={{ 
          position: 'fixed',
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          height: '100vh',
          width: '100vw' 
        }}
        onClick={(e) => {
          // Close modal only if clicking outside the form
          if (e.target === e.currentTarget) {
            setIsModalOpen(false);
          }
        }}
      >
        <div className="bg-light-card dark:bg-dark-card rounded-lg w-full max-w-md overflow-hidden shadow-xl" onClick={e => e.stopPropagation()}>
          {/* Modal header */}
          <div className="px-6 py-4 border-b border-light-border dark:border-dark-border flex justify-between items-center bg-primary-50">
            <h2 className="text-xl font-semibold text-primary-700 dark:text-primary-400 flex items-center">
              <Map className="h-5 w-5 mr-2" /> 
              New Roadmap
            </h2>
            <button 
              type="button"
              className="text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(false);
              }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleFormSubmit} onClick={e => e.stopPropagation()}>
            <div className="px-6 py-6">
              {/* Year Input */}
              <div className="mb-6">
                <label htmlFor="academic-year" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                  Academic Year
                </label>
                <input
                  type="number"
                  id="academic-year"
                  placeholder="e.g. 2025"
                  className="w-full px-4 py-2 bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 shadow-sm"
                  defaultValue={formRefs.current.year}
                  onChange={handleYearChange}
                  min="2000"
                  max="2100"
                />
              </div>
              
              {/* Milestones */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text">
                    Milestones
                  </label>
                  <button
                    type="button"
                    onClick={(e) => addMilestone(e)}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 font-medium flex items-center"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add milestone
                  </button>
                </div>
                
                <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                  {formRefs.current.milestones.map((milestone, index) => (
                    <div 
                      key={`milestone-${index}`}
                      className="bg-light-card dark:bg-dark-card rounded-md p-4 border border-light-border dark:border-dark-border shadow-sm hover:border-primary-200 dark:hover:border-primary-700 transition-colors"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-medium text-primary-600 dark:text-primary-400">Milestone {index + 1}</span>
                        {formRefs.current.milestones.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => removeMilestone(index, e)}
                            className="text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text focus:outline-none"
                            aria-label="Remove milestone"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Milestone title"
                          className="w-full px-3 py-2 bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 shadow-sm"
                          defaultValue={milestone.title}
                          onChange={(e) => handleMilestoneFieldChange(index, 'title', e.target.value)}
                        />
                        
                        <div className="flex gap-3">
                          <div className="w-1/2">
                            <input
                              type="date"
                              className="w-full px-3 py-2 bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 shadow-sm"
                              defaultValue={milestone.date}
                              onChange={(e) => handleMilestoneFieldChange(index, 'date', e.target.value)}
                            />
                          </div>
                          <div className="w-1/2">
                            <select
                              className="w-full px-3 py-2 bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 appearance-none"
                              defaultValue={milestone.type}
                              onChange={(e) => handleMilestoneFieldChange(index, 'type', e.target.value)}
                            >
                              <option value="deadline">Deadline</option>
                              <option value="preparation">Preparation</option>
                              <option value="prerequisite">Prerequisite</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {formRefs.current.milestones.length === 0 && (
                  <div className="text-center py-8 text-light-muted dark:text-dark-muted bg-light-background dark:bg-dark-background rounded-md border border-dashed border-light-border dark:border-dark-border">
                    <FolderPlus className="h-10 w-10 mx-auto mb-2 text-light-muted dark:text-dark-muted" />
                    <p>No milestones added yet</p>
                    <p className="text-xs mt-1">Click &quot;Add milestone&quot; to get started</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 bg-light-background dark:bg-dark-background border-t border-light-border dark:border-dark-border flex justify-end space-x-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border text-light-text dark:text-dark-text text-sm font-medium rounded-md hover:bg-light-border dark:hover:bg-dark-border focus:outline-none focus:ring-2 focus:ring-light-border dark:focus:ring-dark-border shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 dark:bg-primary-700 border border-transparent text-white text-sm font-medium rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Create Roadmap
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Group academic goals by year
  const groupGoalsByYear = () => {
    const groupedGoals: { [year: number]: Goal[] } = {};
    
    // Current year and next few years
    const currentYear = new Date().getFullYear();
    
    // Initialize with a few default years
    for (let i = 0; i <= 5; i++) {
      groupedGoals[currentYear + i] = [];
    }
    
    // Group goals by year from due date
    academicGoals.forEach(goal => {
      if (goal.dueDate) {
        const year = new Date(goal.dueDate).getFullYear();
        if (!groupedGoals[year]) {
          groupedGoals[year] = [];
        }
        groupedGoals[year].push(goal);
      }
    });
    
    // Filter out years with no goals
    return Object.fromEntries(
      Object.entries(groupedGoals)
        .filter(([_, goals]) => goals.length > 0)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
    );
  };
  
  // Format date to display day and month only (e.g., "15 Jun")
  const formatShortDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    } catch (error) {
      return '';
    }
  };

  const goalsByYear = groupGoalsByYear();

  // Handle toggling goal completion locally if no external handler provided
  const handleToggleGoalCompletion = async (goalId: string, currentCompleted: boolean) => {
    try {
      // Use external handler if provided
      if (onToggleGoalCompletion) {
        await onToggleGoalCompletion(goalId, currentCompleted);
        return;
      }
      
      // Otherwise handle locally
      const updatedGoal = await toggleGoalCompletion(goalId, !currentCompleted);
      if (updatedGoal) {
        // Update local state for the goals
        const updatedGoals = academicGoals.map(goal => 
          goal.id === goalId ? { ...goal, completed: !currentCompleted } : goal
        );
        // We can't directly update academicGoals since it's passed as a prop,
        // but the parent will refresh when API call completes
      }
    } catch (error) {
      console.error('Error toggling goal completion:', error);
    }
  };

  return (
    <div className="flex flex-col space-y-8">
      {/* Inject custom scrollbar styles */}
      <style jsx global>{scrollbarStyles}</style>
      
      {/* Hero Section */}
      <div className="mb-2">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-4xl font-bold text-primary-700 dark:text-primary-400">Start Your Academic Journey</h1>
          <Tooltip content="Track your progress, deadlines, goals, and roadmap in one place." />
        </div>
        <p className="text-lg text-light-muted dark:text-dark-muted">
          Discover and track academic programs that match your interests and goals.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Your Progress Section */}
        <div className="bg-light-card dark:bg-dark-card rounded-lg shadow dark:shadow-dark-border/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">Your Progress</h2>
            <ListChecks className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          
          <div className="space-y-4">
            <div className="border-b border-light-border dark:border-dark-border pb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-light-muted dark:text-dark-muted">Tasks Completed</span>
                <span className="text-sm font-medium text-light-text dark:text-dark-text">{completedTasks}/{totalTasks}</span>
              </div>
            </div>
            
            <div className="border-b border-light-border dark:border-dark-border pb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-light-muted dark:text-dark-muted">Milestones Completed</span>
                <span className="text-sm font-medium text-light-text dark:text-dark-text">{completedMilestones}/{totalMilestones}</span>
              </div>
            </div>
            
            <div>
              <div className="flex flex-col mb-1">
                <span className="text-sm text-light-muted dark:text-dark-muted">Saved Programs</span>
                {savedPrograms.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {savedPrograms.slice(0, 3).map(program => (
                      <div key={program.id} className="text-sm text-primary-600 dark:text-primary-400">
                        {program.title}
                      </div>
                    ))}
                    {savedPrograms.length > 3 && (
                      <div className="text-sm text-light-muted dark:text-dark-muted">
                        +{savedPrograms.length - 3} more
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-light-muted dark:text-dark-muted mt-1">No programs saved yet</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines Section */}
        <div className="bg-primary-600 dark:bg-primary-900 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Upcoming Deadlines</h2>
            <CalendarClock className="h-5 w-5 text-white" />
          </div>
          
          <div className="flex-grow">
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-4">
                {upcomingDeadlines.map(item => (
                  <div key={item.id} className="border-b border-primary-500/30 dark:border-primary-700/30 pb-3 last:border-0">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{item.title}</span>
                      {item.deadline && (
                        <span className="text-xs text-primary-200 dark:text-primary-300 mt-1">
                          Due: {new Date(item.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-white/70">
                <CalendarClock className="h-10 w-10 mb-2 text-white/50" />
                <span>No upcoming deadlines</span>
              </div>
            )}
          </div>
        </div>

        {/* Academic Journey Section */}
        <div className="bg-light-card dark:bg-dark-card rounded-lg shadow dark:shadow-dark-border/30 p-6 goals-container">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">Journey Goals</h2>
            <button 
              onClick={() => setShowGoalForm(true)}
              className="p-1 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/50 text-primary-600 dark:text-primary-400 transition-colors focus:outline-none"
              aria-label="Add goal"
              title="Add goal"
            >
              <PlusCircle className="h-5 w-5" />
            </button>
          </div>
          
          {isLoadingGoals ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-400" />
            </div>
          ) : Object.keys(goalsByYear).length > 0 ? (
            <ScrollableGoals 
              goalsByYear={goalsByYear}
              formatShortDate={formatShortDate}
              onSwitchToRoadmapPlanner={onSwitchToRoadmapPlanner}
              onToggleGoalCompletion={handleToggleGoalCompletion}
              onSwitchToGoalsTab={onSwitchToGoalsTab}
              isDarkTheme={isDark}
              className="scrollable-content custom-scrollbar"
            />
          ) : (
            <div className="text-center py-4 text-light-muted dark:text-dark-muted">
              <p>No goals found with due dates.</p>
              <p className="text-sm mt-1">Add goals with due dates to see them here.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Create New Roadmap Section */}
      <div 
        className="bg-light-card dark:bg-dark-card rounded-lg shadow dark:shadow-dark-border/30 p-6 border-2 border-dashed transition-colors w-full mx-auto"
        style={{ borderColor: isDark ? '#1e40af' : '#3b82f6' }}
      >
        <div className="flex flex-col items-center justify-center text-center py-4">
          <Sparkles className="h-10 w-10 text-primary-500 dark:text-primary-400 mb-3" />
          <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">AI Roadmap Builder</h2>
          <p className="text-light-muted dark:text-dark-muted mb-4 max-w-md">
            Answer a few questions to get a personalized academic roadmap tailored to your goals.
          </p>
          <button 
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            onClick={() => setShowAIRoadmapModal(true)}
          >
            <Sparkles className="w-5 h-5" />
            AI Roadmap Builder
          </button>
        </div>
      </div>

      {/* Goal form modal */}
      {showGoalForm && isBrowser && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-5 border-b border-light-border dark:border-dark-border">
              <h3 className="text-xl font-semibold text-light-text dark:text-dark-text">
                Create New Goal
              </h3>
              <button 
                type="button" 
                onClick={closeGoalForm}
                className="text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Form content */}
            <div className="p-5">
              <form onSubmit={handleGoalSubmit} className="space-y-5">
                <div>
                  <label htmlFor="goal-title" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                    Title <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <input
                    id="goal-title"
                    ref={goalTitleRef}
                    type="text"
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400"
                    required
                    autoFocus
                  />
                </div>
                
                <div>
                  <label htmlFor="goal-dueDate" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                    Due Date
                  </label>
                  <input
                    id="goal-dueDate"
                    ref={goalDueDateRef}
                    type="date"
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="goal-category" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                      Category
                    </label>
                    <select
                      id="goal-category"
                      ref={goalCategoryRef}
                      defaultValue="academic"
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400"
                    >
                      <option value="academic">Academic</option>
                      <option value="extracurricular">Extracurricular</option>
                      <option value="career">Career</option>
                      <option value="personal">Personal</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="goal-priority" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                      Priority
                    </label>
                    <select
                      id="goal-priority"
                      ref={goalPriorityRef}
                      defaultValue="medium"
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="goal-description" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                    Description
                  </label>
                  <textarea
                    id="goal-description"
                    ref={goalDescriptionRef}
                    rows={3}
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400"
                  ></textarea>
                </div>
                
                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeGoalForm}
                    className="px-4 py-2 text-sm font-medium text-light-text dark:text-dark-text bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-md hover:bg-light-border dark:hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSavingGoal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingGoal}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 dark:bg-primary-700 border border-transparent rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSavingGoal ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Add Goal'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      , document.body)}

      {/* Modal Portal */}
      {isModalOpen && isBrowser && createPortal(<Modal />, document.body)}

      {/* AI Roadmap Builder Modal */}
      {showAIRoadmapModal && isBrowser && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl max-w-lg w-full mx-auto">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
                  Let's build your personalized academic journey!
                </h2>
                <p className="text-light-muted dark:text-dark-muted">
                  Answer these 3 questions and watch AI create your custom roadmap.
                </p>
              </div>

              <div className="space-y-4">
                {/* Interests Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                    What are some of your interests or things you enjoy?
                  </label>
                  <select
                    value={aiRoadmapForm.interests}
                    onChange={(e) => setAiRoadmapForm({...aiRoadmapForm, interests: e.target.value})}
                    className="w-full px-4 py-3 border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                  >
                    <option value="" disabled>Select an interest...</option>
                    <option value="Technology">Technology</option>
                    <option value="Arts & Humanities">Arts & Humanities (like music, literature, history)</option>
                    <option value="Healthcare & Medicine">Healthcare & Medicine</option>
                    <option value="Business & Entrepreneurship">Business & Entrepreneurship</option>
                    <option value="Science & Engineering">Science & Engineering</option>
                    <option value="Social Sciences">Social Sciences (like psychology, sociology)</option>
                    <option value="Environment & Sustainability">Environment & Sustainability</option>
                    <option value="other">Other (please tell us)</option>
                    <option value="I'm not sure">I'm not sure</option>
                  </select>
                  
                  {/* Conditional text input for Other interests */}
                  {aiRoadmapForm.interests === 'other' && (
                    <input
                      type="text"
                      placeholder="Please specify your interests..."
                      value={customInterests}
                      onChange={(e) => setCustomInterests(e.target.value)}
                      className="w-full mt-3 px-4 py-3 border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  )}
                </div>

                {/* Future Job Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                    What kind of future job do you think you might like?
                  </label>
                  <select
                    value={aiRoadmapForm.futureJob}
                    onChange={(e) => setAiRoadmapForm({...aiRoadmapForm, futureJob: e.target.value})}
                    className="w-full px-4 py-3 border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                  >
                    <option value="" disabled>Select a future job...</option>
                    <option value="Leader or Manager">Leader or Manager</option>
                    <option value="Tech Expert">Tech Expert</option>
                    <option value="Creative">Creative (like designer, artist)</option>
                    <option value="Entrepreneur">Entrepreneur (starting your own business)</option>
                    <option value="Researcher or Scientist">Researcher or Scientist</option>
                    <option value="Helping or Support role">Helping or Support role</option>
                    <option value="other">Other (please tell us)</option>
                    <option value="I'm not sure">I'm not sure</option>
                  </select>
                  
                  {/* Conditional text input for Other future job */}
                  {aiRoadmapForm.futureJob === 'other' && (
                    <input
                      type="text"
                      placeholder="Please specify your desired job..."
                      value={customFutureJob}
                      onChange={(e) => setCustomFutureJob(e.target.value)}
                      className="w-full mt-3 px-4 py-3 border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  )}
                </div>

                {/* Target Date */}
                <div>
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                    What is your target timeline or date for achieving this goal?
                  </label>
                  <input
                    type="date"
                    value={aiRoadmapForm.targetDate}
                    onChange={(e) => setAiRoadmapForm({...aiRoadmapForm, targetDate: e.target.value})}
                    className="w-full px-4 py-3 border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:text-white [&::-webkit-calendar-picker-indicator]:dark:invert"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={closeAIRoadmapModal}
                  className="flex-1 px-4 py-3 border-2 border-light-border dark:border-dark-border text-light-text dark:text-dark-text font-medium rounded-xl hover:bg-light-background dark:hover:bg-dark-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAIRoadmapSubmit}
                  disabled={
                    !aiRoadmapForm.interests || 
                    !aiRoadmapForm.futureJob || 
                    !aiRoadmapForm.targetDate ||
                    (aiRoadmapForm.interests === 'other' && !customInterests.trim()) ||
                    (aiRoadmapForm.futureJob === 'other' && !customFutureJob.trim())
                  }
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Generate AI Roadmap
                </button>
              </div>
            </div>
          </div>
        </div>
      , document.body)}

      {/* Full-screen AI Roadmap Builder */}
      {showAIRoadmapBuilder && isBrowser && createPortal(
        <AIRoadmapBuilder 
          onClose={() => setShowAIRoadmapBuilder(false)} 
          userPreferences={{
            interests: aiRoadmapForm.interests === 'other' ? customInterests : aiRoadmapForm.interests,
            futureJob: aiRoadmapForm.futureJob === 'other' ? customFutureJob : aiRoadmapForm.futureJob,
            targetDate: aiRoadmapForm.targetDate
          }}
        />
      , document.body)}
    </div>
  );
} 
