import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, ChevronDown, ChevronUp, Calendar, Edit2, Save, Trash2 } from 'lucide-react';
import { Task } from '../types/types';

interface TaskItemProps {
  task: Task;
  isExpanded: boolean;
  onToggleCompleted: () => void;
  onToggleExpanded: () => void;
  onNoteChange: (note: string) => void;
  onUpdate: (updatedTask: Task) => void;
  onDelete?: () => void;
  isDark?: boolean;
  isDeleting?: boolean;
}

export default function TaskItem({
  task,
  isExpanded,
  onToggleCompleted,
  onToggleExpanded,
  onNoteChange,
  onUpdate,
  onDelete,
  isDark = false,
  isDeleting = false
}: TaskItemProps) {
  const [note, setNote] = useState(task.notes);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDueDate, setEditedDueDate] = useState(task.dueDate || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'unsaved' | 'saving' | 'saved'>('unsaved');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isContentChanged, setIsContentChanged] = useState(false);

  useEffect(() => {
    setNote(task.notes);
    if (task.notes && task.notes.trim() !== '') {
      setSaveStatus('saved');
      setIsContentChanged(false);
    } else {
      setSaveStatus('unsaved');
      setIsContentChanged(false);
    }
  }, [task.notes]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setNote(newValue);
    
    if (newValue !== task.notes) {
      setIsContentChanged(true);
      if (saveStatus === 'saved') {
        setSaveStatus('unsaved');
      }
    } else {
      setIsContentChanged(false);
    }
  };

  const handleNoteSave = () => {
    setIsSaving(true);
    setSaveStatus('saving');
    
    onNoteChange(note);
    
    setTimeout(() => {
      setIsSaving(false);
      setSaveStatus('saved');
      setIsContentChanged(false);
    }, 500);
  };

  const handleSaveEdit = async () => {
    setIsSavingEdit(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      await onUpdate({
        ...task,
        title: editedTitle,
        dueDate: editedDueDate || null
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved Notes';
      default:
        return 'Save Notes';
    }
  };

  const getSaveButtonClass = () => {
    if (isSaving) {
      return 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed';
    } 
    if (saveStatus === 'saved' && !isContentChanged) {
      return 'bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-800';
    }
    return 'bg-indigo-600 dark:bg-indigo-700 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600';
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;
    onDelete();
  };

  return (
    <div className={`border rounded-lg overflow-hidden transition-all duration-200 ${
      task.completed 
        ? 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700' 
        : 'bg-white dark:bg-dark-card border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center flex-1">
          <button 
            onClick={onToggleCompleted}
            className={`flex-shrink-0 mr-3 ${
              task.completed 
                ? 'text-teal-500 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-300' 
                : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'
            }`}
          >
            {task.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
          </button>
          {isEditing ? (
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-background text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700"
                disabled={isSavingEdit}
              />
              <input
                type="date"
                value={editedDueDate}
                onChange={(e) => setEditedDueDate(e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-background text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700"
                disabled={isSavingEdit}
              />
              <button
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="px-2 py-1 text-xs bg-indigo-600 dark:bg-indigo-700 text-white rounded hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSavingEdit ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSavingEdit}
                className="px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-between">
              <span className={`text-sm ${
                task.completed 
                  ? 'text-gray-500 dark:text-gray-400 line-through' 
                  : 'text-gray-800 dark:text-gray-200'
              }`}>
                {task.title}
              </span>
              <div className="flex items-center">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-400 dark:text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ml-2"
                >
                  <Edit2 size={16} />
                </button>
                {onDelete && (
                  <button
                    onClick={handleDeleteClick}
                    className="p-1 text-gray-400 dark:text-gray-600 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ml-1"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <svg className="animate-spin h-4 w-4 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {!isEditing && task.dueDate && (
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <Calendar size={14} className="mr-1" />
              {formatDate(task.dueDate)}
            </div>
          )}
          <button
            onClick={onToggleExpanded}
            className="p-1 text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
          <textarea
            value={note}
            onChange={handleNoteChange}
            placeholder="Add notes, reflections, or next steps..."
            className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700 min-h-[80px]"
          ></textarea>
          
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center">
              {note.trim() !== '' && (
                <button 
                  onClick={handleNoteSave}
                  disabled={isSaving || (saveStatus === 'saved' && !isContentChanged)}
                  className={`px-3 py-1 text-xs rounded flex items-center mr-2 transition-colors ${getSaveButtonClass()}`}
                >
                  <Save size={14} className="mr-1" />
                  {getSaveButtonText()}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 