import React, { useState } from 'react';
import { ChevronDown, ChevronUp, PlusCircle, Save, Trash2, Pen } from 'lucide-react';
import { PhaseData, Task } from '../types/types';
import TaskItem from './TaskItem';
import ConfirmationModal from './ConfirmationModal';
import { updatePhase } from '../services/roadmapPlannerService';
import { useTheme } from '../contexts/ThemeContext';

interface PhaseAccordionProps {
  phases: PhaseData[];
  activePhase: number;
  onPhaseToggle: (index: number) => void;
  onTaskToggle: (phaseIndex: number, taskIndex: number) => void;
  onTaskNoteUpdate: (phaseIndex: number, taskIndex: number, note: string) => void;
  onAddTask: (phaseIndex: number, taskTitle: string) => void;
  onUpdateTask: (phaseIndex: number, taskIndex: number, updatedTask: Task) => void;
  onUpdateReflection?: (phaseIndex: number, reflection: string) => void;
  onDeletePhase?: (phaseIndex: number, phaseId: string) => void;
  onDeleteTask?: (phaseIndex: number, taskIndex: number, taskId: string) => void;
  onUpdatePhase?: (phaseIndex: number, phaseId: string, updates: { title?: string; description?: string }) => void;
}

export default function PhaseAccordion({
  phases,
  activePhase,
  onPhaseToggle,
  onTaskToggle,
  onTaskNoteUpdate,
  onAddTask,
  onUpdateTask,
  onUpdateReflection,
  onDeletePhase,
  onDeleteTask,
  onUpdatePhase
}: PhaseAccordionProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [newTaskTitles, setNewTaskTitles] = useState<{ [key: number]: string }>({});
  const [expandedTasks, setExpandedTasks] = useState<{ [key: string]: boolean }>({});
  // Keep track of expanded phases
  const [expandedPhases, setExpandedPhases] = useState<{ [key: number]: boolean }>({
    [activePhase]: true // Initialize with active phase expanded
  });
  // Manage reflection text for each phase
  const [reflections, setReflections] = useState<{ [key: number]: string }>({});
  // Track reflection save status
  const [reflectionSaveStatus, setReflectionSaveStatus] = useState<{ [key: number]: boolean }>({});
  // Track if content has changed since last save
  const [reflectionChanged, setReflectionChanged] = useState<{ [key: number]: boolean }>({});
  // Add loading state for task creation
  const [isCreatingTask, setIsCreatingTask] = useState<{ [key: number]: boolean }>({});
  // Add state for tracking which phase is being deleted
  const [isDeletingPhase, setIsDeletingPhase] = useState<{ [key: number]: boolean }>({});
  // Add state for phase deletion confirmation
  const [phaseDeleteConfirmation, setPhaseDeleteConfirmation] = useState<{
    isOpen: boolean;
    phaseIndex: number | null;
    phaseId: string | null;
    phaseTitle: string;
  }>({
    isOpen: false,
    phaseIndex: null,
    phaseId: null,
    phaseTitle: ''
  });
  // Add state for task deletion
  const [isDeletingTask, setIsDeletingTask] = useState<{ [key: string]: boolean }>({});
  // Add state for task deletion confirmation
  const [taskDeleteConfirmation, setTaskDeleteConfirmation] = useState<{
    isOpen: boolean;
    phaseIndex: number | null;
    taskIndex: number | null;
    taskId: string | null;
    taskTitle: string;
  }>({
    isOpen: false,
    phaseIndex: null,
    taskIndex: null,
    taskId: null,
    taskTitle: ''
  });
  // Add states to track if the confirmation buttons are being clicked
  const [isConfirmingPhaseDelete, setIsConfirmingPhaseDelete] = useState(false);
  const [isConfirmingTaskDelete, setIsConfirmingTaskDelete] = useState(false);
  // Add state for tracking which phase is being edited
  const [isEditingPhase, setIsEditingPhase] = useState<{ [key: number]: boolean }>({});
  
  // Add state for phase edit form
  const [phaseEditData, setPhaseEditData] = useState<{ [key: number]: { title: string; description: string } }>({});
  
  // Track if phase update is in progress
  const [isUpdatingPhase, setIsUpdatingPhase] = useState<{ [key: number]: boolean }>({});

  const calculatePhaseProgress = (phase: PhaseData) => {
    if (phase.tasks.length === 0) return 0;
    const completedTasks = phase.tasks.filter(task => task.completed).length;
    return (completedTasks / phase.tasks.length) * 100;
  };

  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Toggle phase expansion independently
  const togglePhaseExpanded = (index: number) => {
    setExpandedPhases(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
    onPhaseToggle(index);
  };

  const handleAddTaskClick = async (phaseIndex: number) => {
    const taskTitle = newTaskTitles[phaseIndex]?.trim();
    if (taskTitle) {
      setIsCreatingTask(prev => ({ ...prev, [phaseIndex]: true }));
      try {
        await onAddTask(phaseIndex, taskTitle);
        setNewTaskTitles(prev => ({
          ...prev,
          [phaseIndex]: ''
        }));
      } finally {
        setIsCreatingTask(prev => ({ ...prev, [phaseIndex]: false }));
      }
    }
  };

  const handleUpdateTask = (phaseIndex: number, taskIndex: number, updatedTask: Task) => {
    // Call the parent component's update function
    onUpdateTask(phaseIndex, taskIndex, updatedTask);
  };

  // Handle reflection text change
  const handleReflectionChange = (phaseIndex: number, text: string) => {
    setReflections(prev => ({
      ...prev,
      [phaseIndex]: text
    }));

    // Mark as changed if it was previously saved
    if (reflectionSaveStatus[phaseIndex]) {
      setReflectionChanged(prev => ({
        ...prev,
        [phaseIndex]: true
      }));
    }
  };

  // Handle saving reflection
  const handleSaveReflection = (phaseIndex: number) => {
    console.log('Saving reflection for phase', phaseIndex);
    
    const reflectionText = reflections[phaseIndex]?.trim() === '' ? null : (reflections[phaseIndex] || '');
    
    // If onUpdateReflection is not provided, just update local state
    if (!onUpdateReflection) {
      console.log('No onUpdateReflection provided, saving locally only');
      
      // Store in local component state
      setReflections(prev => ({
        ...prev,
        [phaseIndex]: reflectionText || ''
      }));
      
      // Update UI state to show saved
      setReflectionSaveStatus(prev => ({
        ...prev,
        [phaseIndex]: true
      }));
      
      setReflectionChanged(prev => ({
        ...prev,
        [phaseIndex]: false
      }));
      
      return;
    }
    
    // If we have an update function, use it
    try {
      onUpdateReflection(phaseIndex, reflectionText);
      
      // Update save status
      setReflectionSaveStatus(prev => ({
        ...prev,
        [phaseIndex]: true
      }));
      
      setReflectionChanged(prev => ({
        ...prev,
        [phaseIndex]: false
      }));
    } catch (error) {
      console.error('Error saving reflection:', error);
    }
  };

  // Get button text based on save status
  const getReflectionButtonText = (phaseIndex: number) => {
    return reflectionSaveStatus[phaseIndex] && !reflectionChanged[phaseIndex] 
      ? 'Saved Reflection' 
      : 'Save Reflection';
  };

  // Handle phase deletion button click
  const handleDeletePhaseClick = (e: React.MouseEvent, phaseIndex: number, phaseId: string, phaseTitle: string) => {
    e.stopPropagation(); // Prevent phase expansion toggle
    
    if (!onDeletePhase) return;
    
    // Open confirmation modal instead of browser confirm
    setPhaseDeleteConfirmation({
      isOpen: true,
      phaseIndex,
      phaseId,
      phaseTitle
    });
  };
  
  // Confirm phase deletion
  const confirmDeletePhase = async () => {
    if (!onDeletePhase || phaseDeleteConfirmation.phaseIndex === null || phaseDeleteConfirmation.phaseId === null) return;
    
    const phaseIndex = phaseDeleteConfirmation.phaseIndex;
    const phaseId = phaseDeleteConfirmation.phaseId;
    
    // Set confirming state to show spinner in button
    setIsConfirmingPhaseDelete(true);
    
    // Set the deletion state
    setIsDeletingPhase(prev => ({ ...prev, [phaseIndex]: true }));
    
    // Close the confirmation modal
    setPhaseDeleteConfirmation({
      isOpen: false,
      phaseIndex: null,
      phaseId: null,
      phaseTitle: ''
    });
    
    try {
      await onDeletePhase(phaseIndex, phaseId);
    } finally {
      setIsDeletingPhase(prev => ({ ...prev, [phaseIndex]: false }));
      setIsConfirmingPhaseDelete(false);
    }
  };
  
  // Cancel phase deletion
  const cancelDeletePhase = () => {
    setPhaseDeleteConfirmation({
      isOpen: false,
      phaseIndex: null,
      phaseId: null,
      phaseTitle: ''
    });
  };

  // Handle task deletion button click
  const handleDeleteTaskClick = (phaseIndex: number, taskIndex: number, taskId: string, taskTitle: string) => {
    if (!onDeleteTask) return;
    
    // Open confirmation modal
    setTaskDeleteConfirmation({
      isOpen: true,
      phaseIndex,
      taskIndex,
      taskId,
      taskTitle
    });
  };
  
  // Confirm task deletion
  const confirmDeleteTask = async () => {
    if (!onDeleteTask || 
        taskDeleteConfirmation.phaseIndex === null || 
        taskDeleteConfirmation.taskIndex === null || 
        taskDeleteConfirmation.taskId === null) return;
    
    const phaseIndex = taskDeleteConfirmation.phaseIndex;
    const taskIndex = taskDeleteConfirmation.taskIndex;
    const taskId = taskDeleteConfirmation.taskId;
    
    // Set confirming state to show spinner in button
    setIsConfirmingTaskDelete(true);
    
    // Set the deletion state
    setIsDeletingTask(prev => ({ ...prev, [taskId]: true }));
    
    // Close the confirmation modal
    setTaskDeleteConfirmation({
      isOpen: false,
      phaseIndex: null,
      taskIndex: null,
      taskId: null,
      taskTitle: ''
    });
    
    try {
      await onDeleteTask(phaseIndex, taskIndex, taskId);
    } finally {
      setIsDeletingTask(prev => ({ ...prev, [taskId]: false }));
      setIsConfirmingTaskDelete(false);
    }
  };
  
  // Cancel task deletion
  const cancelDeleteTask = () => {
    setTaskDeleteConfirmation({
      isOpen: false,
      phaseIndex: null,
      taskIndex: null,
      taskId: null,
      taskTitle: ''
    });
  };

  // Handle edit phase button click
  const handleEditPhaseClick = (e: React.MouseEvent, phaseIndex: number, phase: PhaseData) => {
    e.stopPropagation(); // Prevent phase expansion toggle
    
    // Initialize the edit form with current phase data
    setPhaseEditData(prev => ({
      ...prev,
      [phaseIndex]: {
        title: phase.title,
        description: phase.description || ''
      }
    }));
    
    setIsEditingPhase(prev => ({
      ...prev,
      [phaseIndex]: true
    }));
  };
  
  // Handle phase update
  const handleUpdatePhase = async (phaseIndex: number, phaseId: string) => {
    const updates = phaseEditData[phaseIndex];
    
    if (!updates) return;
    
    // Exit edit mode immediately
    setIsEditingPhase(prev => ({
      ...prev,
      [phaseIndex]: false
    }));
    
    // Set updating state
    setIsUpdatingPhase(prev => ({
      ...prev,
      [phaseIndex]: true
    }));
    
    try {
      // Update directly in the database
      const success = await updatePhase(phaseId, updates);
      
      if (success && onUpdatePhase) {
        // Notify parent component of the update
        onUpdatePhase(phaseIndex, phaseId, updates);
      }
    } catch (error) {
      console.error('Error updating phase:', error);
    } finally {
      // Clear updating state
      setIsUpdatingPhase(prev => ({
        ...prev,
        [phaseIndex]: false
      }));
    }
  };
  
  // Handle cancelling phase edit
  const handleCancelPhaseEdit = (phaseIndex: number) => {
    setIsEditingPhase(prev => ({
      ...prev,
      [phaseIndex]: false
    }));
  };

  return (
    <div className="space-y-4">
      {phases.map((phase, phaseIndex) => {
        const isExpanded = expandedPhases[phaseIndex] || false;
        const phaseProgress = calculatePhaseProgress(phase);
        const isDeleteButtonDisabled = isDeletingPhase[phaseIndex];
        const isEditMode = isEditingPhase[phaseIndex] || false;
        const isUpdating = isUpdatingPhase[phaseIndex] || false;
        
        return (
          <div 
            key={phase.id}
            className="bg-white dark:bg-dark-card rounded-xl shadow-sm overflow-hidden transition-all duration-300 shadow-md"
          >
            <div 
              className="px-6 py-4 flex justify-between items-center"
              onClick={() => togglePhaseExpanded(phaseIndex)}
            >
              <button className="flex items-center flex-1 focus:outline-none text-left">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-400">
                  <span className="text-sm font-semibold">{phaseIndex + 1}</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">{phase.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-dark-muted">
                    {phase.tasks.length} {phase.tasks.length === 1 ? 'task' : 'tasks'}
                  </p>
                </div>
                </button>
              
              <div className="flex items-center ml-2">
                {/* Edit button */}
                {!isEditMode && (
                  <button
                    onClick={(e) => handleEditPhaseClick(e, phaseIndex, phase)}
                    className="p-2 text-gray-400 dark:text-dark-muted hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none"
                    aria-label="Edit phase"
                    title="Edit phase"
                  >
                    <Pen size={16} />
                  </button>
                )}
                  
                {/* Delete button */}
                {!isEditMode && (
                  <button
                    onClick={(e) => handleDeletePhaseClick(e, phaseIndex, phase.id, phase.title)}
                    className="p-2 text-gray-400 dark:text-dark-muted hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    disabled={isDeleteButtonDisabled}
                    aria-label="Delete phase"
                    title="Delete phase"
                  >
                    {isDeletingPhase[phaseIndex] ? (
                      <div className="animate-spin h-4 w-4">
                        <svg className="h-4 w-4 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
              </div>
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                )}

                {/* Task count & progress info */}
                    <div className="ml-3 mr-3 text-sm">
                  <span className="font-medium">{phase.tasks.filter(t => t.completed).length}/{phase.tasks.length}</span>
                </div>
                
                {/* Expand/collapse button */}
                    <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePhaseExpanded(phaseIndex);
                  }}
                      className="focus:outline-none"
                    >
                  {isExpanded ? (
                    <ChevronUp className="text-gray-400 dark:text-dark-muted" size={20} />
                  ) : (
                    <ChevronDown className="text-gray-400 dark:text-dark-muted" size={20} />
                  )}
                    </button>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="h-1 w-full bg-gray-100 dark:bg-dark-border">
              <div
                className="h-full transition-all duration-500 ease-out bg-teal-500 dark:bg-teal-400"
                style={{ width: `${phaseProgress}%` }}
              ></div>
            </div>
            
            {/* Description edit field */}
            {isEditMode && (
              <div 
                className="px-4 pb-4 pt-0"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Add title input field */}
                <div className="mb-3">
                  <label htmlFor={`phase-title-${phaseIndex}`} className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
                    Phase Title
                  </label>
                  <input
                    id={`phase-title-${phaseIndex}`}
                    type="text"
                    value={phaseEditData[phaseIndex]?.title || phase.title || ''}
                    onChange={(e) => setPhaseEditData({
                      ...phaseEditData,
                      [phaseIndex]: {
                        ...phaseEditData[phaseIndex],
                        title: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-background text-gray-800 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    placeholder="Enter phase title..."
                  />
                </div>
                
                <label htmlFor={`phase-description-${phaseIndex}`} className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
                  Description
                </label>
                <textarea
                  id={`phase-description-${phaseIndex}`}
                  value={phaseEditData[phaseIndex]?.description || phase.description || ''}
                  onChange={(e) => setPhaseEditData({
                    ...phaseEditData,
                    [phaseIndex]: {
                      ...phaseEditData[phaseIndex],
                      description: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-background text-gray-800 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  rows={3}
                  placeholder="Enter phase description..."
                />
                
                {/* Save and Cancel buttons for edit mode */}
                <div className="flex justify-end gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleUpdatePhase(phaseIndex, phase.id)}
                    className="px-3 py-1 bg-indigo-600 dark:bg-indigo-700 text-white text-sm rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving
                      </span>
                      ) : (
                      'Save'
                      )}
                    </button>
                  <button
                    onClick={() => handleCancelPhaseEdit(phaseIndex)}
                    className="px-3 py-1 bg-white dark:bg-dark-background border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text text-sm rounded-md hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {isExpanded && !isEditMode && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-dark-border">
                {/* Description */}
                {phase.description && (
                  <div className="mb-4 text-gray-700 dark:text-dark-text">
                    {phase.description}
                  </div>
                )}
                
                {/* Tasks list */}
                <div className="space-y-3">
                  {phase.tasks.length > 0 ? (
                    <ul className="space-y-3">
                  {phase.tasks.map((task, taskIndex) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                          isExpanded={expandedTasks[task.id] || false}
                          onToggleCompleted={() => onTaskToggle(phaseIndex, taskIndex)}
                      onToggleExpanded={() => toggleTaskExpanded(task.id)}
                          onNoteChange={(note) => onTaskNoteUpdate(phaseIndex, taskIndex, note)}
                          onUpdate={(updatedTask) => handleUpdateTask(phaseIndex, taskIndex, updatedTask)}
                          onDelete={() => handleDeleteTaskClick(phaseIndex, taskIndex, task.id, task.title)}
                          isDark={isDark}
                          isDeleting={isDeletingTask[task.id] || false}
                    />
                  ))}
                    </ul>
                  ) : (
                    <div className="h-2"></div>
                  )}
                  
                  {/* Add task input */}
                  <div className="mt-4 flex items-center space-x-2">
                    <input
                      type="text"
                      value={newTaskTitles[phaseIndex] || ''}
                      onChange={(e) => setNewTaskTitles({
                        ...newTaskTitles,
                        [phaseIndex]: e.target.value
                      })}
                      placeholder="Add a custom step..."
                      className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:border-dark-border dark:bg-dark-background dark:text-dark-text"
                    />
                    <button
                      onClick={() => handleAddTaskClick(phaseIndex)}
                      disabled={!newTaskTitles[phaseIndex]?.trim() || isCreatingTask[phaseIndex]}
                      className="p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreatingTask[phaseIndex] ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                      ) : (
                        <PlusCircle size={20} />
                      )}
                    </button>
                  </div>
                  </div>
                  
                {/* Reflection section */}
                {onUpdateReflection && (
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-dark-border">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">Phase Reflection</h4>
                    <textarea
                      value={reflections[phaseIndex] === undefined ? (phase.reflection || '') : reflections[phaseIndex]}
                      onChange={(e) => handleReflectionChange(phaseIndex, e.target.value)}
                      placeholder={`Reflect on your journey in this ${phase.title} phase...`}
                      className="w-full p-3 border rounded-lg text-sm h-24 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:border-dark-border dark:bg-dark-background dark:text-dark-text"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => handleSaveReflection(phaseIndex)}
                        className={`px-3 py-1 text-xs rounded flex items-center transition-colors
                          ${reflectionSaveStatus[phaseIndex] && !reflectionChanged[phaseIndex]
                            ? 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
                            : 'bg-indigo-600 dark:bg-indigo-700 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600'
                        }`}
                      >
                        <Save className="w-4 h-4 mr-1" />
                        {getReflectionButtonText(phaseIndex)}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      
      {/* Confirmation Modals */}
      <ConfirmationModal 
        isOpen={phaseDeleteConfirmation.isOpen}
        title="Delete Phase"
        message={`Are you sure you want to delete the phase "${phaseDeleteConfirmation.phaseTitle}"? This will also delete all tasks in this phase.`}
        confirmText={isConfirmingPhaseDelete ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Deleting...
          </div>
        ) : "Delete Phase"}
        cancelText="Cancel"
        onConfirm={confirmDeletePhase}
        onCancel={cancelDeletePhase}
        isDanger={true}
      />
      
      <ConfirmationModal 
        isOpen={taskDeleteConfirmation.isOpen}
        title="Delete Task"
        message={`Are you sure you want to delete the task "${taskDeleteConfirmation.taskTitle}"?`}
        confirmText={isConfirmingTaskDelete ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Deleting...
          </div>
        ) : "Delete Task"}
        cancelText="Cancel"
        onConfirm={confirmDeleteTask}
        onCancel={cancelDeleteTask}
        isDanger={true}
      />
    </div>
  );
} 