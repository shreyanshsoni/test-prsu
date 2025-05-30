import React, { useState } from 'react';
import { X, Calendar, Target, User } from 'lucide-react';
import { Goal } from '../types/types';

interface NewRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoadmap: (goal: Goal) => void;
}

export default function NewRoadmapModal({
  isOpen,
  onClose,
  onCreateRoadmap
}: NewRoadmapModalProps) {
  const [goalTitle, setGoalTitle] = useState('');
  const [identity, setIdentity] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goalTitle.trim() || !identity.trim() || !deadline) {
      return; // Basic validation
    }
    
    setIsCreating(true);
    
    try {
      await onCreateRoadmap({
        title: goalTitle.trim(),
        identity: identity.trim(),
        deadline: deadline
      });
      
      // Reset form
      setGoalTitle('');
      setIdentity('');
      setDeadline('');
    } catch (error) {
      console.error('Error creating roadmap:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Create New Roadmap</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isCreating}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Target size={16} className="mr-1" />
              Academic Goal
            </label>
            <input
              type="text"
              placeholder="e.g. Get into Computer Science PhD Program"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
              disabled={isCreating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <User size={16} className="mr-1" />
              Identity/Role
            </label>
            <input
              type="text"
              placeholder="e.g. CS Major, International Student"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
              disabled={isCreating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Calendar size={16} className="mr-1" />
              Target Date
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
              disabled={isCreating}
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                'Create Roadmap'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 