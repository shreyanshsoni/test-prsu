import React, { useState } from 'react';
import { Plus, X, Save } from 'lucide-react';
import { useTheme } from '../app/contexts/ThemeContext';

interface AddPhaseButtonProps {
  onAddPhase: (title: string, description: string) => void;
}

export default function AddPhaseButton({ onAddPhase }: AddPhaseButtonProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    setIsCreating(true);
    
    try {
      await onAddPhase(title.trim(), description.trim());
      
      // Reset form and collapse
      setTitle('');
      setDescription('');
      setIsExpanded(false);
    } catch (error) {
      console.error('Error adding phase:', error);
    } finally {
      setIsCreating(false);
    }
  };
  
  if (isExpanded) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-5 border border-gray-300 dark:border-dark-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text">Add New Phase</h3>
          <button 
            onClick={() => setIsExpanded(false)}
            className="text-gray-400 dark:text-dark-muted hover:text-gray-600 dark:hover:text-dark-text p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border"
            disabled={isCreating}
          >
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="phase-title" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
                Phase Title
              </label>
              <input
                id="phase-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Research & Exploration"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-background text-gray-800 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
                required
                disabled={isCreating}
              />
            </div>
            
            <div>
              <label htmlFor="phase-description" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
                Description
              </label>
              <textarea
                id="phase-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of this phase..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-background text-gray-800 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 h-20"
                disabled={isCreating}
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="px-4 py-2 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text rounded-md text-sm hover:bg-gray-100 dark:hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-md text-sm flex items-center hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Add Phase
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
  
  return (
    <button 
      onClick={() => setIsExpanded(true)}
      className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
    >
      <Plus size={20} className="mr-2" />
      <span className="font-medium">Add New Phase</span>
    </button>
  );
} 
