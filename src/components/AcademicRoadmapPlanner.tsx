import React, { useState, useEffect } from 'react';
import { RoadmapPlanner, Goal, Task } from '../types/types';
import RoadmapsList from './RoadmapsListNew';
import RoadmapDetail from './RoadmapDetail';
import NewRoadmapModal from './NewRoadmapModal';
import ConfirmationModal from './ConfirmationModal';
import { useTheme } from '../app/contexts/ThemeContext';
import { 
  fetchRoadmapPlanners, 
  createRoadmapPlanner,
  updateRoadmapGoal,
  deleteRoadmapPlanner,
  addPhase,
  addTask,
  toggleTaskCompletion,
  updateTaskNotes,
  updateTask,
  updatePhaseReflection,
  deletePhase,
  deleteTask,
  updatePhase
} from '../lib/services/roadmapPlannerService';
import { useAuth } from '../app/hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function AcademicRoadmapPlanner() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user, isLoading: isAuthLoading } = useAuth();
  const [roadmaps, setRoadmaps] = useState<RoadmapPlanner[]>([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [activePhase, setActivePhase] = useState<number>(0);
  
  // Initialize modal state based on URL search parameters
  const [isModalOpen, setIsModalOpen] = useState<boolean>(() => {
    // Only run in the client
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.get('openCreateModal') === 'true';
    }
    return false;
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    roadmapId: string | null;
    roadmapTitle: string;
  }>({
    isOpen: false,
    roadmapId: null,
    roadmapTitle: ''
  });
  
  // Add loading state for delete operation
  const [isDeletingRoadmap, setIsDeletingRoadmap] = useState(false);
  
  // Check for URL parameter changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleUrlChange = () => {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('openCreateModal') === 'true') {
          setIsModalOpen(true);
          
          // Remove the parameter without refreshing the page
          searchParams.delete('openCreateModal');
          window.history.replaceState(
            {}, 
            document.title, 
            window.location.pathname + (searchParams.toString() ? '?' + searchParams.toString() : '')
          );
        }
      };
      
      // Check on mount and when URL changes
      handleUrlChange();
      
      // Listen for popstate events (browser back/forward)
      window.addEventListener('popstate', handleUrlChange);
      return () => window.removeEventListener('popstate', handleUrlChange);
    }
  }, []);
  
  // Get the currently selected roadmap
  const selectedRoadmap = selectedRoadmapId 
    ? roadmaps.find(r => r.id === selectedRoadmapId) 
    : null;

  // Load roadmaps on component mount
  useEffect(() => {
    if (!isAuthLoading) {
      loadRoadmaps();
    }
  }, [isAuthLoading]);

  // Load roadmaps from the database
  const loadRoadmaps = async () => {
    setIsLoading(true);
    try {
      const data = await fetchRoadmapPlanners();
      setRoadmaps(data);
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRoadmap = (id: string) => {
    setSelectedRoadmapId(id);
    setActivePhase(0); // Reset active phase when selecting a new roadmap
  };

  const handleGoBack = () => {
    setSelectedRoadmapId(null);
  };

  const handlePhaseToggle = (index: number) => {
    // Just track the last clicked phase for reference
    setActivePhase(index);
    // The expansion state is now managed in the PhaseAccordion component
  };

  const handleTaskToggle = async (phaseIndex: number, taskIndex: number) => {
    if (!selectedRoadmapId || !selectedRoadmap) return;
    
    const phase = selectedRoadmap.phases[phaseIndex];
    const task = phase.tasks[taskIndex];
    
    try {
      await toggleTaskCompletion(task.id, !task.completed);
      
      // Update local state optimistically
    const updatedRoadmaps = [...roadmaps];
    const roadmapIndex = updatedRoadmaps.findIndex(r => r.id === selectedRoadmapId);
    
    if (roadmapIndex !== -1) {
      updatedRoadmaps[roadmapIndex].phases[phaseIndex].tasks[taskIndex].completed = 
        !updatedRoadmaps[roadmapIndex].phases[phaseIndex].tasks[taskIndex].completed;
      
      setRoadmaps(updatedRoadmaps);
    }
    } catch (error) {
      console.error('Error toggling task:', error);
      // If there's an error, reload the roadmap to get the correct state
      await loadRoadmaps();
    }
  };

  const handleTaskNoteUpdate = async (phaseIndex: number, taskIndex: number, note: string) => {
    if (!selectedRoadmapId || !selectedRoadmap) return;
    
    const phase = selectedRoadmap.phases[phaseIndex];
    const task = phase.tasks[taskIndex];
    
    try {
      await updateTaskNotes(task.id, note);
      
      // Update local state optimistically
    const updatedRoadmaps = [...roadmaps];
    const roadmapIndex = updatedRoadmaps.findIndex(r => r.id === selectedRoadmapId);
    
    if (roadmapIndex !== -1) {
      updatedRoadmaps[roadmapIndex].phases[phaseIndex].tasks[taskIndex].notes = note;
      setRoadmaps(updatedRoadmaps);
      }
    } catch (error) {
      console.error('Error updating task notes:', error);
      await loadRoadmaps();
    }
  };

  const handleAddTask = async (phaseIndex: number, taskTitle: string) => {
    if (!selectedRoadmapId || !selectedRoadmap) return;
    
    const phase = selectedRoadmap.phases[phaseIndex];
    
    try {
      const newTask = await addTask(phase.id, {
        title: taskTitle,
        completed: false,
        notes: '',
        dueDate: null
      });
      
      if (newTask) {
        // Update local state
        const updatedRoadmaps = [...roadmaps];
        const roadmapIndex = updatedRoadmaps.findIndex(r => r.id === selectedRoadmapId);
        
        if (roadmapIndex !== -1) {
          updatedRoadmaps[roadmapIndex].phases[phaseIndex].tasks.push(newTask);
      setRoadmaps(updatedRoadmaps);
        }
      }
    } catch (error) {
      console.error('Error adding task:', error);
      await loadRoadmaps();
    }
  };

  const handleAddPhase = async (title: string, description: string) => {
    if (!selectedRoadmapId) return;
    
    try {
      const newPhase = await addPhase(selectedRoadmapId, {
        title,
        description,
        reflection: ''
      });
      
      if (newPhase) {
        // Update local state optimistically
        const updatedRoadmaps = [...roadmaps];
        const roadmapIndex = updatedRoadmaps.findIndex(r => r.id === selectedRoadmapId);
        
        if (roadmapIndex !== -1) {
          // Add the new phase with an empty tasks array
          updatedRoadmaps[roadmapIndex].phases.push({
            ...newPhase,
            tasks: []
          });
      
      setRoadmaps(updatedRoadmaps);
      
      // Set the new phase as active
      setActivePhase(updatedRoadmaps[roadmapIndex].phases.length - 1);
    }
      }
    } catch (error) {
      console.error('Error adding phase:', error);
      // If there's an error, reload to ensure consistency
      await loadRoadmaps();
    }
  };

  const handleUpdateGoal = async (updatedGoal: Goal) => {
    if (!selectedRoadmapId) return;
    
    try {
      await updateRoadmapGoal(selectedRoadmapId, updatedGoal);
      
      // Update local state optimistically
    const updatedRoadmaps = [...roadmaps];
    const roadmapIndex = updatedRoadmaps.findIndex(r => r.id === selectedRoadmapId);
    
    if (roadmapIndex !== -1) {
      updatedRoadmaps[roadmapIndex].goal = updatedGoal;
      setRoadmaps(updatedRoadmaps);
    }
    } catch (error) {
      console.error('Error updating goal:', error);
      await loadRoadmaps();
    }
  };

  const handleCreateRoadmap = async (goal: Goal) => {
    try {
      const newRoadmap = await createRoadmapPlanner(goal);
      
      if (newRoadmap) {
        // Add the new roadmap to the list
        setRoadmaps(prev => [...prev, newRoadmap]);
    setSelectedRoadmapId(newRoadmap.id);
      }
    } catch (error) {
      console.error('Error creating roadmap:', error);
    } finally {
    setIsModalOpen(false);
    }
  };

  const handleDeleteRoadmap = (id: string) => {
    const roadmapToDelete = roadmaps.find(r => r.id === id);
    if (!roadmapToDelete) return;

    setDeleteConfirmation({
      isOpen: true,
      roadmapId: id,
      roadmapTitle: roadmapToDelete.goal.title
    });
  };

  const confirmDeleteRoadmap = async () => {
    if (!deleteConfirmation.roadmapId) return;

    setIsDeletingRoadmap(true);
    
    try {
      const success = await deleteRoadmapPlanner(deleteConfirmation.roadmapId);
      
      if (success) {
        // Remove the roadmap from the list
        setRoadmaps(prev => prev.filter(r => r.id !== deleteConfirmation.roadmapId));
    
    // If we're deleting the currently selected roadmap, go back to the list
    if (selectedRoadmapId === deleteConfirmation.roadmapId) {
      setSelectedRoadmapId(null);
    }
      } else {
        toast.error('Failed to delete roadmap');
      }
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      toast.error('An error occurred while deleting the roadmap');
    } finally {
    // Close the confirmation modal
    setDeleteConfirmation({
      isOpen: false,
      roadmapId: null,
      roadmapTitle: ''
    });
      setIsDeletingRoadmap(false);
    }
  };

  const cancelDeleteRoadmap = () => {
    setDeleteConfirmation({
      isOpen: false,
      roadmapId: null,
      roadmapTitle: ''
    });
  };

  const handleUpdateTask = async (phaseIndex: number, taskIndex: number, updatedTask: Task) => {
    if (!selectedRoadmapId || !selectedRoadmap) return;
    
    const phase = selectedRoadmap.phases[phaseIndex];
    const task = phase.tasks[taskIndex];
    
    try {
      const result = await updateTask(task.id, updatedTask);
      
      if (result) {
        // Update local state optimistically
        const updatedRoadmaps = [...roadmaps];
        const roadmapIndex = updatedRoadmaps.findIndex(r => r.id === selectedRoadmapId);
        
        if (roadmapIndex !== -1) {
          updatedRoadmaps[roadmapIndex].phases[phaseIndex].tasks[taskIndex] = {
            ...updatedRoadmaps[roadmapIndex].phases[phaseIndex].tasks[taskIndex],
            ...updatedTask
          };
          setRoadmaps(updatedRoadmaps);
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      await loadRoadmaps();
    }
  };

  const handleUpdateReflection = async (phaseIndex: number, reflection: string) => {
    if (!selectedRoadmapId || !selectedRoadmap) return;
    
    const phase = selectedRoadmap.phases[phaseIndex];
    
    try {
      const success = await updatePhaseReflection(phase.id, reflection);
      
      if (success) {
        // Update local state optimistically
        const updatedRoadmaps = [...roadmaps];
        const roadmapIndex = updatedRoadmaps.findIndex(r => r.id === selectedRoadmapId);
        
        if (roadmapIndex !== -1) {
          updatedRoadmaps[roadmapIndex].phases[phaseIndex].reflection = reflection;
          setRoadmaps(updatedRoadmaps);
        }
      } else {
        toast.error('Failed to save reflection');
      }
    } catch (error) {
      console.error('Error updating reflection:', error);
      toast.error('An error occurred while saving the reflection');
      // Reload to ensure consistency
      await loadRoadmaps();
    }
  };

  // Handle phase deletion
  const handleDeletePhase = async (phaseIndex: number, phaseId: string) => {
    if (!selectedRoadmapId) return;
    
    try {
      const success = await deletePhase(phaseId);
      
      if (success) {
        // Update local state optimistically
        const updatedRoadmaps = [...roadmaps];
        const roadmapIndex = updatedRoadmaps.findIndex(r => r.id === selectedRoadmapId);
        
        if (roadmapIndex !== -1) {
          // Remove the phase
          updatedRoadmaps[roadmapIndex].phases.splice(phaseIndex, 1);
          setRoadmaps(updatedRoadmaps);
          
          // If we deleted the active phase, set active phase to the previous one or 0
          if (phaseIndex === activePhase) {
            setActivePhase(Math.max(0, phaseIndex - 1));
          } else if (phaseIndex < activePhase) {
            // If we deleted a phase before the active one, decrement active phase
            setActivePhase(activePhase - 1);
          }
          
          toast.success('Phase deleted successfully');
        }
      }
    } catch (error) {
      console.error('Error deleting phase:', error);
      toast.error('Failed to delete phase');
      // If there's an error, reload to ensure consistency
      await loadRoadmaps();
    }
  };

  // Add handler for task deletion
  const handleDeleteTask = async (phaseIndex: number, taskIndex: number, taskId: string) => {
    if (!selectedRoadmap) return;
    
    try {
      const success = await deleteTask(taskId);
      
      if (success) {
        // Update local state optimistically
        const updatedRoadmaps = [...roadmaps];
        const roadmapIndex = updatedRoadmaps.findIndex(r => r.id === selectedRoadmapId);
        
        if (roadmapIndex !== -1) {
          // Remove the task from the phase
          const updatedPhases = [...updatedRoadmaps[roadmapIndex].phases];
          updatedPhases[phaseIndex].tasks.splice(taskIndex, 1);
          
          updatedRoadmaps[roadmapIndex].phases = updatedPhases;
          setRoadmaps(updatedRoadmaps);
          
          // Show success toast
          toast.success('Task deleted successfully', {
            duration: 3000,
            position: 'bottom-right',
          });
        }
      } else {
        toast.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('An error occurred while deleting the task');
    }
  };

  // Add handler for phase update
  const handleUpdatePhase = async (phaseIndex: number, phaseId: string, updates: { title?: string; description?: string }) => {
    if (!selectedRoadmap) return;
    
    try {
      const success = await updatePhase(phaseId, updates);
      
      if (success) {
        // Update local state optimistically
        const updatedRoadmaps = [...roadmaps];
        const roadmapIndex = updatedRoadmaps.findIndex(r => r.id === selectedRoadmapId);
        
        if (roadmapIndex !== -1) {
          // Update the phase
          const updatedPhases = [...updatedRoadmaps[roadmapIndex].phases];
          
          // Apply the updates
          if (updates.title !== undefined) {
            updatedPhases[phaseIndex].title = updates.title;
          }
          
          if (updates.description !== undefined) {
            updatedPhases[phaseIndex].description = updates.description;
          }
          
          updatedRoadmaps[roadmapIndex].phases = updatedPhases;
          setRoadmaps(updatedRoadmaps);
          
          // Show success toast
          toast.success('Phase updated successfully', {
            duration: 3000,
            position: 'bottom-right',
          });
        }
      } else {
        toast.error('Failed to update phase');
      }
    } catch (error) {
      console.error('Error updating phase:', error);
      toast.error('An error occurred while updating the phase');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 dark:border-primary-400"></div>
      </div>
    );
  }

  // If no user is logged in, show prompt to login
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-light-card dark:bg-dark-card p-8 rounded-lg shadow-md dark:shadow-dark-border/30 text-center">
          <h2 className="text-2xl font-bold mb-4 text-light-text dark:text-dark-text">Please Login</h2>
          <p className="mb-6 text-light-muted dark:text-dark-muted">
            You need to be logged in to create and manage your academic roadmaps.
          </p>
          <a 
            href="/api/auth/login" 
            className="px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600"
          >
            Login to Continue
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {selectedRoadmap ? (
        <RoadmapDetail
          roadmap={selectedRoadmap}
          activePhase={activePhase}
          onGoBack={handleGoBack}
          onPhaseToggle={handlePhaseToggle}
          onTaskToggle={handleTaskToggle}
          onTaskNoteUpdate={handleTaskNoteUpdate}
          onAddTask={handleAddTask}
          onUpdateGoal={handleUpdateGoal}
          onAddPhase={handleAddPhase}
          onUpdateTask={handleUpdateTask}
          onUpdateReflection={handleUpdateReflection}
          onDeletePhase={handleDeletePhase}
          onDeleteTask={handleDeleteTask}
          onUpdatePhase={handleUpdatePhase}
        />
      ) : (
        <RoadmapsList
          roadmaps={roadmaps}
          onSelectRoadmap={handleSelectRoadmap}
          onCreateRoadmap={() => setIsModalOpen(true)}
          onDeleteRoadmap={handleDeleteRoadmap}
        />
      )}
      
      <NewRoadmapModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateRoadmap={handleCreateRoadmap}
      />

      <ConfirmationModal 
        isOpen={deleteConfirmation.isOpen}
        title="Delete Roadmap"
        message={`Are you sure you want to delete "${deleteConfirmation.roadmapTitle}"? This action cannot be undone.`}
        confirmText={isDeletingRoadmap ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Deleting...
          </div>
        ) : "Delete"}
        cancelText="Cancel"
        onConfirm={confirmDeleteRoadmap}
        onCancel={cancelDeleteRoadmap}
        isDanger={true}
        isConfirmDisabled={isDeletingRoadmap}
      />
    </div>
  );
} 
