'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, Circle, BookOpen, Calendar, GraduationCap, 
  PlusCircle, Edit2, Trash2, Clock, Target, Layers 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  Goal, 
  GoalInput, 
  fetchGoals, 
  createGoal, 
  updateGoal, 
  deleteGoal, 
  toggleGoalCompletion 
} from '../lib/services/goalService';
import ConfirmationModal from './ConfirmationModal';
import { useTheme } from '../app/contexts/ThemeContext';

interface AcademicGoalsProps {
  initialShowForm?: boolean;
  onFormClose?: () => void;
  onGoalCreated?: (newGoal: Goal) => void;
  onGoalUpdated?: (updatedGoal: Goal) => void;
  onGoalDeleted?: (deletedGoalId: string) => void;
}

export default function AcademicGoals({
  initialShowForm = false,
  onFormClose,
  onGoalCreated,
  onGoalUpdated,
  onGoalDeleted
}: AcademicGoalsProps) {
  // Goals state
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // Form state
  const [showForm, setShowForm] = useState(initialShowForm);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  
  // Form field values
  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    dueDate: '',
    category: 'academic' as Goal['category'],
    priority: 'medium' as Goal['priority']
  });
  
  // Track which goal is currently being updated
  const [updatingGoalId, setUpdatingGoalId] = useState<string | null>(null);
  
  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    goalId: string | null;
    goalTitle: string;
  }>({
    isOpen: false,
    goalId: null,
    goalTitle: ''
  });
  
  // Uncontrolled form refs for better performance
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const dueDateRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const priorityRef = useRef<HTMLSelectElement>(null);
  
  // Add loading state for delete operation
  const [isDeletingGoal, setIsDeletingGoal] = useState(false);
  
  // Load goals on component mount
  useEffect(() => {
    loadGoals();
  }, []);
  
  // Load goals with optional filtering
  const loadGoals = async (filter?: { category?: string; completed?: boolean }) => {
    setIsLoading(true);
    try {
      const fetchedGoals = await fetchGoals(filter);
      setGoals(fetchedGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
      toast.error('Failed to load academic goals');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formValues.title.trim()) {
      toast.error('Goal title is required');
      return;
    }
    
      const goalData: GoalInput = {
      title: formValues.title,
      description: formValues.description || '',
      dueDate: formValues.dueDate || '',
      category: formValues.category || 'academic',
      priority: formValues.priority || 'medium'
    };
    
    // If we're editing, close the form immediately
    if (editingGoalId) {
      // Store the ID we're updating
      const idToUpdate = editingGoalId;
      
      // Close the form immediately
      resetForm();
      
      // Set updating state for the specific goal
      setUpdatingGoalId(idToUpdate);
      
      try {
        // Update existing goal
        const updatedGoal = await updateGoal(idToUpdate, goalData);
        if (updatedGoal) {
          setGoals(goals.map(goal => 
            goal.id === idToUpdate ? updatedGoal : goal
          ));
          toast.success('Goal updated successfully');
          if (onGoalUpdated) onGoalUpdated(updatedGoal);
        } else {
          toast.error('Failed to update goal');
        }
      } catch (error) {
        console.error('Error updating goal:', error);
        toast.error('An error occurred while updating the goal');
      } finally {
        // Clear updating state
        setUpdatingGoalId(null);
        }
      } else {
      // For new goals, keep the existing behavior
      setIsSavingGoal(true);
      
      try {
        // Create new goal
        const newGoal = await createGoal(goalData);
        if (newGoal) {
          setGoals([newGoal, ...goals]);
          toast.success('Goal created successfully');
          if (onGoalCreated) onGoalCreated(newGoal);
        } else {
          toast.error('Failed to create goal');
      }
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error saving goal:', error);
      toast.error('An error occurred while saving the goal');
    } finally {
      setIsSavingGoal(false);
      }
    }
  };
  
  // Reset form and close it
  const resetForm = () => {
    setFormValues({
      title: '',
      description: '',
      dueDate: '',
      category: 'academic',
      priority: 'medium'
    });
    
    setEditingGoalId(null);
    setShowForm(false);
    
    // Call the onFormClose prop if provided
    if (onFormClose) onFormClose();
  };
  
  // Start editing a goal
  const handleEdit = (goal: Goal) => {
    setEditingGoalId(goal.id);
    
    // Set form values using state
    setFormValues({
      title: goal.title,
      description: goal.description || '',
      dueDate: goal.dueDate || '',
      category: goal.category,
      priority: goal.priority
    });
    
    setShowForm(true);
  };
  
  // Delete a goal
  const handleDelete = (id: string) => {
    const goalToDelete = goals.find(goal => goal.id === id);
    if (!goalToDelete) return;

    setDeleteConfirmation({
      isOpen: true,
      goalId: id,
      goalTitle: goalToDelete.title
    });
  };

  const confirmDeleteGoal = async () => {
    if (!deleteConfirmation.goalId) return;
    
    // Close the confirmation modal immediately
    setDeleteConfirmation({
      isOpen: false,
      goalId: deleteConfirmation.goalId, // Keep the ID for reference
      goalTitle: deleteConfirmation.goalTitle
    });
    
    // Set deleting state for the specific goal
    setIsDeletingGoal(true);
    
    try {
      const success = await deleteGoal(deleteConfirmation.goalId);
      if (success) {
        setGoals(goals.filter(goal => goal.id !== deleteConfirmation.goalId));
        toast.success('Goal deleted successfully');
        if (onGoalDeleted) onGoalDeleted(deleteConfirmation.goalId);
      } else {
        toast.error('Failed to delete goal');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('An error occurred while deleting the goal');
    } finally {
      // Clear the goal ID and reset deleting state
      setDeleteConfirmation({
        isOpen: false,
        goalId: null,
        goalTitle: ''
      });
      setIsDeletingGoal(false);
    }
  };

  const cancelDeleteGoal = () => {
    setDeleteConfirmation({
      isOpen: false,
      goalId: null,
      goalTitle: ''
    });
  };
  
  // Toggle goal completion status
  const handleToggleCompletion = async (id: string, currentCompleted: boolean) => {
    try {
      const updatedGoal = await toggleGoalCompletion(id, !currentCompleted);
      if (updatedGoal) {
        setGoals(goals.map(goal => 
          goal.id === id ? { ...goal, completed: !currentCompleted } : goal
        ));
      }
    } catch (error) {
      console.error('Error toggling goal completion:', error);
      toast.error('Failed to update goal status');
    }
  };
  
  // Filter goals by category
  const handleFilter = (filter: string | null) => {
    setActiveFilter(filter);
    
    if (filter === 'completed') {
      loadGoals({ completed: true });
    } else if (filter === 'incomplete') {
      loadGoals({ completed: false });
    } else if (filter) {
      loadGoals({ category: filter });
    } else {
      loadGoals();
    }
  };
  
  // Category icon function for goals
  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'academic':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'extracurricular':
        return <Layers className="w-4 h-4 text-green-500" />;
      case 'career':
        return <Target className="w-4 h-4 text-purple-500" />;
      case 'personal':
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-blue-500" />;
    }
  };

  // Priority color function for goals
  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No due date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Check for initialShowForm changes
  useEffect(() => {
    if (initialShowForm) {
      setShowForm(true);
    }
  }, [initialShowForm]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">Academic Goals</h2>
        <button
          onClick={() => {
            setEditingGoalId(null);
            setShowForm(true);
          }}
          className="flex items-center gap-1 px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleFilter(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeFilter === null
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
              : 'bg-light-background dark:bg-dark-background text-light-muted dark:text-dark-muted hover:bg-light-border dark:hover:bg-dark-border'
          }`}
        >
          All
        </button>
        <button
          onClick={() => handleFilter('academic')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeFilter === 'academic'
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
              : 'bg-light-background dark:bg-dark-background text-light-muted dark:text-dark-muted hover:bg-light-border dark:hover:bg-dark-border'
          }`}
        >
          <BookOpen className="w-3 h-3" />
          Academic
        </button>
        <button
          onClick={() => handleFilter('extracurricular')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeFilter === 'extracurricular'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-light-background dark:bg-dark-background text-light-muted dark:text-dark-muted hover:bg-light-border dark:hover:bg-dark-border'
          }`}
        >
          <Layers className="w-3 h-3" />
          Extracurricular
        </button>
        <button
          onClick={() => handleFilter('career')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeFilter === 'career'
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
              : 'bg-light-background dark:bg-dark-background text-light-muted dark:text-dark-muted hover:bg-light-border dark:hover:bg-dark-border'
          }`}
        >
          <Target className="w-3 h-3" />
          Career
        </button>
        <button
          onClick={() => handleFilter('personal')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeFilter === 'personal'
              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
              : 'bg-light-background dark:bg-dark-background text-light-muted dark:text-dark-muted hover:bg-light-border dark:hover:bg-dark-border'
          }`}
        >
          <Clock className="w-3 h-3" />
          Personal
        </button>
        <button
          onClick={() => handleFilter('completed')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeFilter === 'completed'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-light-background dark:bg-dark-background text-light-muted dark:text-dark-muted hover:bg-light-border dark:hover:bg-dark-border'
          }`}
        >
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </button>
        <button
          onClick={() => handleFilter('incomplete')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeFilter === 'incomplete'
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
              : 'bg-light-background dark:bg-dark-background text-light-muted dark:text-dark-muted hover:bg-light-border dark:hover:bg-dark-border'
          }`}
        >
          <Circle className="w-3 h-3" />
          Incomplete
        </button>
      </div>

      {/* Goal form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-5 border-b border-light-border dark:border-dark-border">
              <h3 className="text-xl font-semibold text-light-text dark:text-dark-text">
                {editingGoalId ? 'Edit Goal' : 'Create New Goal'}
              </h3>
              <button 
                type="button" 
                onClick={resetForm}
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
              <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                  <label htmlFor="title" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1 flex items-center">
                    <Target size={16} className="mr-1 text-primary-500 dark:text-primary-400" />
                    Title <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                    value={formValues.title}
                    onChange={(e) => setFormValues({...formValues, title: e.target.value})}
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400"
                      required
                      autoFocus
                    />
                  </div>
              
                  <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1 flex items-center">
                    <Calendar size={16} className="mr-1 text-primary-500 dark:text-primary-400" />
                      Due Date
                    </label>
                    <input
                      id="dueDate"
                      type="date"
                    value={formValues.dueDate}
                    onChange={(e) => setFormValues({...formValues, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400"
                    />
                  </div>
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1 flex items-center">
                      <BookOpen size={16} className="mr-1 text-primary-500 dark:text-primary-400" />
                      Category
                    </label>
                    <select
                      id="category"
                      value={formValues.category}
                      onChange={(e) => setFormValues({...formValues, category: e.target.value as Goal['category']})}
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400"
                    >
                      <option value="academic">Academic</option>
                      <option value="extracurricular">Extracurricular</option>
                      <option value="career">Career</option>
                      <option value="personal">Personal</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1 flex items-center">
                      <Layers size={16} className="mr-1 text-primary-500 dark:text-primary-400" />
                      Priority
                    </label>
                    <select
                      id="priority"
                      value={formValues.priority}
                      onChange={(e) => setFormValues({...formValues, priority: e.target.value as Goal['priority']})}
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1 flex items-center">
                    <Layers size={16} className="mr-1 text-primary-500 dark:text-primary-400" />
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formValues.description}
                    onChange={(e) => setFormValues({...formValues, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400"
                  ></textarea>
                </div>
                
                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-light-text dark:text-dark-text bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-md hover:bg-light-border dark:hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSavingGoal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingGoal}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 dark:bg-primary-700 border border-transparent rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSavingGoal ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {editingGoalId ? 'Updating...' : 'Saving...'}
                      </>
                    ) : (
                      editingGoalId ? 'Update Goal' : 'Add Goal'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 dark:border-primary-400"></div>
        </div>
      )}

      {/* Goals list */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => (
            <div
              key={goal.id}
              className={`p-5 border border-light-border dark:border-dark-border rounded-lg bg-light-card dark:bg-dark-card shadow-sm hover:shadow-md transition-shadow ${
                goal.completed ? 'opacity-70' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => handleToggleCompletion(goal.id, goal.completed)}
                    className="mt-1 focus:outline-none"
                  >
                    {goal.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-light-muted dark:text-dark-muted" />
                    )}
                  </button>
                  <div>
                    <h3
                      className={`text-lg font-medium ${
                        goal.completed ? 'line-through text-light-muted dark:text-dark-muted' : 'text-light-text dark:text-dark-text'
                      }`}
                    >
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="text-sm text-light-muted dark:text-dark-muted mt-1">{goal.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  {updatingGoalId === goal.id ? (
                    <div className="p-1 flex justify-center">
                      <svg className="animate-spin h-4 w-4 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : (
                  <button
                    onClick={() => handleEdit(goal)}
                    className="p-1 text-light-muted dark:text-dark-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  )}
                  {isDeletingGoal && deleteConfirmation.goalId === goal.id ? (
                    <div className="p-1 flex justify-center">
                      <svg className="animate-spin h-4 w-4 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : (
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-1 text-light-muted dark:text-dark-muted hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {goal.category === 'academic' ? (
                      <BookOpen className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    ) : goal.category === 'career' ? (
                      <Target className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                    ) : goal.category === 'personal' ? (
                      <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    ) : (
                      <Layers className="w-4 h-4 text-green-500 dark:text-green-400" />
                    )}
                    <span className="capitalize text-light-muted dark:text-dark-muted">{goal.category}</span>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      goal.priority === 'high'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : goal.priority === 'medium'
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    }`}>
                      {goal.priority} priority
                    </span>
                  </div>
                </div>
                {goal.dueDate && (
                  <div className="text-light-muted dark:text-dark-muted flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(goal.dueDate)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && goals.length === 0 && (
        <div className="text-center py-16 bg-light-card dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border shadow-sm">
          <h3 className="text-xl font-medium text-light-muted dark:text-dark-muted mb-2">No goals found</h3>
          <p className="text-light-muted dark:text-dark-muted mb-4">
            {activeFilter 
              ? `No goals match the selected filter. Try a different filter or create a new goal.`
              : `Create your first academic goal to get started on your journey.`
            }
          </p>
          <button
            onClick={() => {
              setEditingGoalId(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors shadow-sm"
          >
            Add Your First Goal
          </button>
        </div>
      )}

      {/* Update ConfirmationModal */}
      <ConfirmationModal 
        isOpen={deleteConfirmation.isOpen}
        title="Delete Goal"
        message={`Are you sure you want to delete "${deleteConfirmation.goalTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteGoal}
        onCancel={cancelDeleteGoal}
        isDanger
      />
    </div>
  );
} 