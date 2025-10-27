import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Student } from '../../../types/counselor';
import { X, CheckCircle, Circle, Calendar, TrendingUp, Plus, Edit2, Trash2, Loader2, Lock as LockIcon } from 'lucide-react';
import CustomRadarChart from '../dashboard/RadarChart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { useTheme } from '../../../contexts/ThemeContext';

interface StudentDetailModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ 
  student, 
  isOpen, 
  onClose 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [notes, setNotes] = useState(student.counselorNotes);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [recentNotes, setRecentNotes] = useState(() => {
    const notes = student.counselorNotes || [];
    return notes.map((note: any, index: number) => ({
      ...note,
      id: note.id || `note-${index}-${Date.now()}`
    }));
  });

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  // Function to fetch fresh notes data (only for initial load)
  const refreshNotes = async () => {
    setIsLoadingNotes(true);
    try {
      const response = await fetch(`/api/counselor-notes?studentId=${student.id}`);
      if (response.ok) {
        const result = await response.json();
        const processedNotes = result.notes.map((note: any, index: number) => ({
          ...note,
          id: note.id || `note-${index}-${Date.now()}`
        }));
        setRecentNotes(processedNotes);
      }
    } catch (error) {
      console.error('Error refreshing notes:', error);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  // Function to refresh notes silently (for edit/delete operations)
  const refreshNotesSilently = async () => {
    try {
      const response = await fetch(`/api/counselor-notes?studentId=${student.id}`);
      if (response.ok) {
        const result = await response.json();
        const processedNotes = result.notes.map((note: any, index: number) => ({
          ...note,
          id: note.id || `note-${index}-${Date.now()}`
        }));
        setRecentNotes(processedNotes);
      }
    } catch (error) {
      console.error('Error refreshing notes:', error);
    }
  };

  // Refresh notes when modal opens
  useEffect(() => {
    if (isOpen) {
      refreshNotes();
    }
  }, [isOpen, student.id]);

  // Add new note
  const handleAddNote = async () => {
    if (!newNote.trim() || isSaving) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/counselor-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentUserId: student.id,
          noteText: newNote.trim()
        })
      });

      if (response.ok) {
        setNewNote('');
        setIsAddingNote(false);
        // Refresh notes from server silently
        await refreshNotesSilently();
      } else {
        throw new Error('Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      // Fallback: add locally
      const fallbackNote = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: newNote.trim(),
        date: new Date().toISOString(),
        author: 'Current User',
        isOwnNote: true
      };
      setRecentNotes([fallbackNote, ...recentNotes]);
      setNewNote('');
      setIsAddingNote(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Edit note
  const handleEditNote = (noteId: string, currentText: string) => {
    setEditingNoteId(noteId);
    setEditingNoteText(currentText);
  };

  const handleSaveEdit = async () => {
    if (!editingNoteId || !editingNoteText.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/counselor-notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteId: editingNoteId,
          noteText: editingNoteText.trim()
        })
      });

      if (response.ok) {
        setEditingNoteId(null);
        setEditingNoteText('');
        // Refresh notes from server silently
        await refreshNotesSilently();
      } else {
        throw new Error('Failed to update note');
      }
    } catch (error) {
      console.error('Error updating note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete note
  const handleDeleteClick = async (noteId: string) => {
    setIsDeleting(noteId);
    
    try {
      const response = await fetch(`/api/counselor-notes?noteId=${noteId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Refresh notes from server silently
        await refreshNotesSilently();
      } else {
        throw new Error('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  // Cancel operations
  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingNoteText('');
  };

  // Keyboard shortcuts
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div key="main-modal" className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className={`fixed right-0 top-0 bottom-0 w-full max-w-2xl ${isDark ? 'bg-dark-card' : 'bg-white'} shadow-xl overflow-hidden`}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-dark-border' : 'border-gray-200'}`}>
                <div className="flex items-center space-x-4">
                  {student.avatar ? (
                    <img 
                      src={student.avatar} 
                      alt={student.name}
                      className="w-15 h-15 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-15 h-15 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-xl font-medium text-white">
                        {student.name.split(' ').map((n: string) => n.charAt(0)).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>{student.name}</h2>
                    <p className={`${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>Grade {student.grade}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 ${isDark ? 'hover:bg-dark-border' : 'hover:bg-gray-100'} rounded-full transition-colors`}
                >
                  <X className={`w-6 h-6 ${isDark ? 'text-dark-muted' : 'text-gray-500'}`} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 min-h-0 max-h-full">
                {/* Brief Overview */}
                  <section>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-4`}>Brief Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Tasks Completed */}
                    <div className={`${isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'} rounded-lg p-4 border`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        <h4 className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-900'}`}>Tasks Completed</h4>
                      </div>
                      <div className={`text-2xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
                        {student.taskCompletion?.completed || 0}/{student.taskCompletion?.total || 0}
                      </div>
                      <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-700'} mt-1`}>Tasks Across Roadmaps</p>
                    </div>

                    {/* Roadmap Progress */}
                    <div className={`${isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'} rounded-lg p-4 border`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <h4 className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-900'}`}>Roadmap Progress</h4>
                      </div>
                      <div className={`text-2xl font-bold ${isDark ? 'text-green-300' : 'text-green-900'}`}>
                        {student.roadmapStats?.completed || 0}/{student.roadmapStats?.total || 0}
                      </div>
                      <p className={`text-xs ${isDark ? 'text-green-400' : 'text-green-700'} mt-1`}>Roadmaps Completed</p>
                          </div>

                    {/* Current Stage */}
                    <div className={`${isDark ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-200'} rounded-lg p-4 border`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <h4 className={`text-sm font-medium ${isDark ? 'text-purple-400' : 'text-purple-900'}`}>Current Stage</h4>
                          </div>
                      <div className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-900'}`}>
                        {student.roadmapStage || 'Early'}
                        </div>
                      <p className={`text-xs ${isDark ? 'text-purple-400' : 'text-purple-700'} mt-1`}>
                        {student.progress}% Complete
                      </p>
                    </div>
                    </div>
                  </section>

                {/* Matrix Breakdown */}
                {student.matrixScores && (
                  <section>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-4`}>PRSU Matrix Breakdown</h3>
                    <div className={`${isDark ? 'bg-dark-background' : 'bg-gray-50'} rounded-lg p-4`}>
                      <CustomRadarChart data={student.matrixScores} individual={true} />
                    </div>
                  </section>
                )}

                {/* Score History */}
                  <section>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-4 flex items-center`}>
                      <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                      Score History
                    </h3>
                  <div className={`${isDark ? 'bg-dark-background' : 'bg-gray-50'} rounded-lg p-4 h-48 flex items-center justify-center border-2 border-dashed ${isDark ? 'border-dark-border' : 'border-gray-300'}`}>
                    <div className="flex flex-col items-center space-y-3">
                      <LockIcon className={`w-12 h-12 ${isDark ? 'text-dark-muted' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>Score History Locked</span>
                    </div>
                    </div>
                  </section>

                {/* Academic Goals */}
                <section>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-4 flex items-center`}>
                    🎯 Academic Goals
                  </h3>
                  <div className={`${isDark ? 'bg-dark-background' : 'bg-gray-50'} rounded-lg p-4 max-h-80 overflow-y-auto`}>
                    {student.academicGoals && student.academicGoals.length > 0 ? (
                      <div className="space-y-3">
                        {student.academicGoals.map((goal: any) => {
                          // Get category-specific colors
                          const getCategoryColors = (category: string) => {
                            switch (category.toLowerCase()) {
                              case 'academic':
                                return {
                                  bg: isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200',
                                  text: isDark ? 'text-blue-400' : 'text-blue-800',
                                  badge: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                                };
                              case 'career':
                                return {
                                  bg: isDark ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-200',
                                  text: isDark ? 'text-purple-400' : 'text-purple-800',
                                  badge: isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800'
                                };
                              case 'extracurricular':
                                return {
                                  bg: isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200',
                                  text: isDark ? 'text-green-400' : 'text-green-800',
                                  badge: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                                };
                              case 'personal':
                                return {
                                  bg: isDark ? 'bg-orange-900/30 border-orange-700' : 'bg-orange-50 border-orange-200',
                                  text: isDark ? 'text-orange-400' : 'text-orange-800',
                                  badge: isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-800'
                                };
                              default:
                                return {
                                  bg: isDark ? 'bg-gray-900/30 border-gray-700' : 'bg-gray-50 border-gray-200',
                                  text: isDark ? 'text-gray-400' : 'text-gray-800',
                                  badge: isDark ? 'bg-gray-900/30 text-gray-400' : 'bg-gray-100 text-gray-800'
                                };
                            }
                          };

                          const categoryColors = getCategoryColors(goal.category);
                          const statusColors = goal.status === 'Completed' 
                            ? (isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200')
                            : (isDark ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200');

                          return (
                            <div key={goal.id} className={`p-3 rounded-lg border ${statusColors}`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className={`text-sm font-medium ${
                                    goal.status === 'Completed' ? (isDark ? 'text-green-400' : 'text-green-900') : (isDark ? 'text-yellow-400' : 'text-yellow-900')
                                  }`}>
                                    {goal.title}
                                  </h4>
                                  
                                  {goal.description && (
                                    <p className={`text-xs ${isDark ? 'text-dark-muted' : 'text-gray-600'} mt-1 line-clamp-2`}>
                                      {goal.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center space-x-2 mt-2">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors.badge}`}>
                                      {goal.category}
                                    </span>
                                    
                                    {goal.priority && (
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                        goal.priority === 'high' ? (isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800') :
                                        goal.priority === 'medium' ? (isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800') :
                                        (isDark ? 'bg-gray-900/30 text-gray-400' : 'bg-gray-100 text-gray-800')
                                      }`}>
                                        {goal.priority}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center justify-between mt-2">
                                    <span className={`text-xs ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                                      Created {format(new Date(goal.dateCreated), 'MMM d, yyyy')}
                                    </span>
                                    {goal.dateCompleted && (
                                      <span className="text-xs text-green-600">
                                        Completed {format(new Date(goal.dateCompleted), 'MMM d, yyyy')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex-shrink-0 ml-3">
                                  {goal.status === 'Completed' ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-yellow-500" />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12">
                        <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-500'} italic`}>
                          No goals yet!
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Counselor Notes */}
                <section>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-4 flex items-center`}>
                    📝 Counselor Notes
                  </h3>
                  
                  <div className={`${isDark ? 'bg-dark-background' : 'bg-gray-50'} rounded-lg p-4 max-h-80 overflow-y-auto`}>
                    {isLoadingNotes ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                      </div>
                    ) : recentNotes.length > 0 ? (
                      <div className="space-y-3">
                        {recentNotes.map((note: any, index: number) => {
                          const isOwnNote = note.isOwnNote;
                          const isEditing = editingNoteId === note.id;
                          const isDeletingThis = isDeleting === note.id;
                          
                          return (
                            <div 
                              key={`note-${note.id}-${index}`} 
                              className={`${
                                isOwnNote 
                                  ? (isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200')
                                  : (isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200')
                              } border rounded-lg p-3 relative`}
                            >
                              
                              {isEditing ? (
                                <div className="space-y-3">
                                  <textarea
                                    value={editingNoteText}
                                    onChange={(e) => setEditingNoteText(e.target.value)}
                                    className={`w-full h-20 p-2 border ${
                                      isDark ? 'border-dark-border bg-dark-background text-dark-text' : 'border-gray-300 bg-white text-gray-800'
                                    } rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                    placeholder="Edit your note..."
                                    autoFocus
                                    disabled={isSaving}
                                  />
                                  <div className="flex justify-end space-x-2">
                                    <button
                                      onClick={handleCancelEdit}
                                      disabled={isSaving}
                                      className={`px-3 py-1 text-xs ${
                                        isDark ? 'text-dark-muted hover:text-dark-text' : 'text-gray-600 hover:text-gray-800'
                                      } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={handleSaveEdit}
                                      disabled={isSaving}
                                      className={`px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-1 ${
                                        isSaving ? 'opacity-50 cursor-not-allowed' : ''
                                      }`}
                                    >
                                      {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                                      <span>Save</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className={`text-sm ${isDark ? 'text-dark-text' : 'text-gray-800'} mb-3`}>
                                    {note.text}
                                  </p>
                                  <div className={`flex justify-between items-center text-xs ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                                    <div className="flex flex-col">
                                      <span>{note.author}</span>
                                      <span>{format(new Date(note.date), 'MMM d, yyyy')}</span>
                                    </div>
                                    {isOwnNote && (
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => handleEditNote(note.id, note.text)}
                                          disabled={isSaving || isDeletingThis}
                                          className={`p-2 rounded-lg hover:bg-opacity-20 transition-colors ${
                                            isDark ? 'hover:bg-green-400 text-green-400' : 'hover:bg-green-600 text-green-600'
                                          } ${isSaving || isDeletingThis ? 'opacity-50 cursor-not-allowed' : ''}`}
                                          title="Edit note"
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteClick(note.id)}
                                          disabled={isSaving || isDeletingThis}
                                          className={`p-2 rounded-lg hover:bg-opacity-20 transition-colors ${
                                            isDark ? 'hover:bg-red-400 text-red-400' : 'hover:bg-red-600 text-red-600'
                                          } ${isSaving || isDeletingThis ? 'opacity-50 cursor-not-allowed' : ''}`}
                                          title="Delete note"
                                        >
                                          {isDeletingThis ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                          ) : (
                                            <Trash2 className="w-4 h-4" />
                                          )}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : !isLoadingNotes ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        {/* Add Note Form - Show above button when adding */}
                        {isAddingNote && (
                          <div className="w-full space-y-3">
                            <textarea
                              value={newNote}
                              onChange={(e) => setNewNote(e.target.value)}
                              onKeyPress={handleKeyPress}
                              className={`w-full h-24 p-3 border ${isDark ? 'border-dark-border bg-dark-background text-dark-text' : 'border-gray-300 bg-white text-gray-800'} rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                              placeholder="Add a note about this student..."
                              autoFocus
                              disabled={isSaving}
                            />
                            <div className="flex justify-end">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setNewNote('');
                                    setIsAddingNote(false);
                                  }}
                                  disabled={isSaving}
                                  className={`px-3 py-1 text-xs ${isDark ? 'text-dark-muted hover:text-dark-text' : 'text-gray-600 hover:text-gray-800'} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleAddNote}
                                  disabled={isSaving}
                                  className={`px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-1 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                                  <span>Save Note</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Add Your First Note Button */}
                        {!isAddingNote && (
                          <button
                            onClick={() => setIsAddingNote(true)}
                            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium ${isDark ? 'text-blue-400 bg-blue-900/30 border-blue-700 hover:bg-blue-900/50' : 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100'} border rounded-lg transition-colors`}
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Your First Note</span>
                          </button>
                        )}
                      </div>
                    ) : null}
                  
                    {/* Add New Note Section */}
                    {!isLoadingNotes && recentNotes.length > 0 && !isAddingNote && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => setIsAddingNote(true)}
                          className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium ${isDark ? 'text-blue-400 bg-blue-900/30 border-blue-700 hover:bg-blue-900/50' : 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100'} border rounded-lg transition-colors`}
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add New Note</span>
                        </button>
                      </div>
                    )}
                    
                    {/* Add New Note Form */}
                    {!isLoadingNotes && recentNotes.length > 0 && isAddingNote && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                        <textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className={`w-full h-24 p-3 border ${isDark ? 'border-dark-border bg-dark-background text-dark-text' : 'border-gray-300 bg-white text-gray-800'} rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          placeholder="Add a note about this student..."
                          autoFocus
                          disabled={isSaving}
                        />
                        <div className="flex justify-end">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setNewNote('');
                                setIsAddingNote(false);
                              }}
                              disabled={isSaving}
                              className={`px-3 py-1 text-xs ${isDark ? 'text-dark-muted hover:text-dark-text' : 'text-gray-600 hover:text-gray-800'} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleAddNote}
                              disabled={isSaving}
                              className={`px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-1 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                              <span>Save Note</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StudentDetailModal;
