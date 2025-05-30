import React, { useState } from 'react';
import { ChevronDown, ChevronUp, PlusCircle, Save, Trash2, Pen } from 'lucide-react';
import { PhaseData, Task } from '../types/types';
import TaskItem from './TaskItem';
import ConfirmationModal from './ConfirmationModal';
import { updatePhase } from '../services/roadmapPlannerService';

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
      {phases.map((phase, index) => {
        const isExpanded = !!expandedPhases[index];
        const progress = calculatePhaseProgress(phase);
        const isEditing = !!isEditingPhase[index];
        
        // Initialize reflection state for this phase if needed
        if (isExpanded && reflections[index] === undefined && phase.reflection !== undefined) {
          // Set initial reflection from phase data
          setTimeout(() => {
            setReflections(prev => ({
              ...prev,
              [index]: phase.reflection || ''
            }));
            
            // Also set the save status to "saved" since we're loading existing data
            setReflectionSaveStatus(prev => ({
              ...prev,
              [index]: true
            }));
            
            // Mark as not changed (it matches the saved data)
            setReflectionChanged(prev => ({
              ...prev,
              [index]: false
            }));
          }, 0);
        }
        
        return (
          <div 
            key={phase.id}
            className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 ${
              isExpanded ? 'shadow-md' : ''
            }`}
          >
            <div className="px-6 py-4 flex justify-between items-center">
              {!isEditing ? (
            <button
                  className="flex items-center flex-1 focus:outline-none text-left"
              onClick={() => togglePhaseExpanded(index)}
            >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  progress === 100 
                    ? 'bg-teal-100 text-teal-600' 
                    : progress > 0 
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-gray-100 text-gray-500'
                }`}>
                  <span className="text-sm font-semibold">{index + 1}</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-800">{phase.title}</h3>
                  <p className="text-sm text-gray-500">{phase.description}</p>
                </div>
                </button>
              ) : (
                <div className="flex-1 flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    progress === 100 
                      ? 'bg-teal-100 text-teal-600' 
                      : progress > 0 
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-gray-100 text-gray-500'
                  }`}>
                    <span className="text-sm font-semibold">{index + 1}</span>
                  </div>
                  
                  <input
                    type="text"
                    value={phaseEditData[index]?.title || ''}
                    onChange={(e) => setPhaseEditData(prev => ({
                      ...prev,
                      [index]: { ...prev[index], title: e.target.value }
                    }))}
                    className="w-1/3 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="Phase title"
                  />
                  
                  <input
                    type="text"
                    value={phaseEditData[index]?.description || ''}
                    onChange={(e) => setPhaseEditData(prev => ({
                      ...prev,
                      [index]: { ...prev[index], description: e.target.value }
                    }))}
                    className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="Phase description (optional)"
                  />
                  
                  <button
                    onClick={() => handleCancelPhaseEdit(index)}
                    className="px-3 py-2 text-sm rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={() => handleUpdatePhase(index, phase.id)}
                    className="px-3 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors whitespace-nowrap"
                  >
                    Save
                  </button>
                </div>
              )}
              
              <div className="flex items-center ml-2">
                {!isEditing && (
                  <>
                    {!isUpdatingPhase[index] ? (
                      <button
                        onClick={(e) => handleEditPhaseClick(e, index, phase)}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
                        aria-label="Edit phase"
                      >
                        <Pen size={16} />
                      </button>
                    ) : (
                      <div className="p-2 flex justify-center">
                        <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
              </div>
                    )}
                    
                    {onDeletePhase && (
                      <button
                        onClick={(e) => handleDeletePhaseClick(e, index, phase.id, phase.title)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors focus:outline-none"
                        disabled={isDeletingPhase[index]}
                      >
                        {isDeletingPhase[index] ? (
                          <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    )}
                  </>
                )}

                {!isEditing && (
                  <>
                    <div className="ml-3 mr-3 text-sm">
                  <span className="font-medium">
                    {phase.tasks.filter(t => t.completed).length}/{phase.tasks.length}
                  </span>
                </div>
                    <button
                      onClick={() => togglePhaseExpanded(index)}
                      className="focus:outline-none"
                    >
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="h-1 w-full bg-gray-100">
              <div
                className={`h-full transition-all duration-500 ease-out ${
                  progress === 100 ? 'bg-teal-500' : 'bg-amber-500'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            {isExpanded && (
              <div className="px-6 py-4 border-t border-gray-100">
                <div className="space-y-3">
                  {phase.tasks.map((task, taskIndex) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      isExpanded={!!expandedTasks[task.id]}
                      onToggleCompleted={() => onTaskToggle(index, taskIndex)}
                      onToggleExpanded={() => toggleTaskExpanded(task.id)}
                      onUpdateNote={(note) => onTaskNoteUpdate(index, taskIndex, note)}
                      onUpdateTask={(updatedTask) => handleUpdateTask(index, taskIndex, updatedTask)}
                      onDeleteTask={onDeleteTask ? 
                        () => handleDeleteTaskClick(index, taskIndex, task.id, task.title) : 
                        undefined}
                      isDeletingTask={isDeletingTask[task.id]}
                    />
                  ))}
                  
                  <div className="flex items-center mt-4 space-x-2">
                    <input
                      type="text"
                      placeholder="Add a custom step..."
                      className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      value={newTaskTitles[index] || ''}
                      onChange={(e) => setNewTaskTitles(prev => ({
                        ...prev,
                        [index]: e.target.value
                      }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddTaskClick(index);
                        }
                      }}
                      disabled={isCreatingTask[index]}
                    />
                    <button
                      className="p-2 text-indigo-600 hover:text-indigo-800 rounded-lg hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleAddTaskClick(index)}
                      disabled={isCreatingTask[index]}
                    >
                      {isCreatingTask[index] ? (
                        <div className="flex items-center">
                          <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      ) : (
                        <PlusCircle size={20} />
                      )}
                    </button>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Phase Reflection</h4>
                    <textarea
                      placeholder={`Reflect on your journey in this ${phase.title} phase...`}
                      className="w-full p-3 border rounded-lg text-sm h-24 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      value={reflections[index] || ''}
                      onChange={(e) => handleReflectionChange(index, e.target.value)}
                    ></textarea>
                    
                    <div className="flex justify-end mt-2">
                      {(reflections[index] || reflectionChanged[index]) && (
                      <button
                        onClick={() => {
                          console.log('Save button clicked for phase', index);
                          handleSaveReflection(index);
                        }}
                        className={`px-3 py-1 text-xs rounded flex items-center transition-colors ${
                          reflectionSaveStatus[index] && !reflectionChanged[index]
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        <Save size={14} className="mr-1" />
                        {getReflectionButtonText(index)}
                      </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Add the ConfirmationModal component for phase deletion */}
      <ConfirmationModal 
        isOpen={phaseDeleteConfirmation.isOpen}
        title="Delete Phase"
        message={`Are you sure you want to delete phase "${phaseDeleteConfirmation.phaseTitle}"? This action cannot be undone and all tasks in this phase will be permanently deleted.`}
        confirmText={isConfirmingPhaseDelete ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Deleting...
          </div>
        ) : "Delete"}
        cancelText="Cancel"
        onConfirm={confirmDeletePhase}
        onCancel={cancelDeletePhase}
        isDangerous={true}
        isConfirmDisabled={isConfirmingPhaseDelete}
      />
      
      {/* Task delete confirmation modal */}
      <ConfirmationModal 
        isOpen={taskDeleteConfirmation.isOpen}
        title="Delete Task"
        message={`Are you sure you want to delete task "${taskDeleteConfirmation.taskTitle}"? This action cannot be undone.`}
        confirmText={isConfirmingTaskDelete ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Deleting...
          </div>
        ) : "Delete"}
        cancelText="Cancel"
        onConfirm={confirmDeleteTask}
        onCancel={cancelDeleteTask}
        isDangerous={true}
        isConfirmDisabled={isConfirmingTaskDelete}
      />
    </div>
  );
} 