import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Student } from '../../types';
import { X, CheckCircle, Circle, Calendar, TrendingUp, Plus, CreditCard as Edit3 } from 'lucide-react';
import CustomRadarChart from '../dashboard/RadarChart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';

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
  const [notes, setNotes] = useState(student.counselorNotes);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [recentNotes, setRecentNotes] = useState([
    { id: '1', text: 'Excellent progress on Stanford application. Strong academic performance.', date: '2024-03-01', author: 'Ms. Johnson' },
    { id: '2', text: 'Discussed backup school options. Student seems confident in current path.', date: '2024-02-15', author: 'Ms. Johnson' },
    { id: '3', text: 'Parent meeting scheduled for next week to discuss financial aid options.', date: '2024-02-01', author: 'Ms. Johnson' }
  ]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    // Auto-save functionality would go here
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note = {
        id: Date.now().toString(),
        text: newNote.trim(),
        date: new Date().toISOString().split('T')[0],
        author: 'Current User'
      };
      setRecentNotes([note, ...recentNotes.slice(0, 2)]);
      setNewNote('');
      setIsAddingNote(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <img 
                    src={student.avatar} 
                    alt={student.name}
                    className="w-15 h-15 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
                    <p className="text-gray-600">Grade {student.grade}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Roadmap Journey */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    Roadmap Journey
                  </h3>
                  <div className="space-y-4">
                    {student.milestones.map((milestone, index) => (
                      <div key={milestone.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {milestone.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${
                            milestone.completed ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {milestone.name}
                          </h4>
                          {milestone.dateCompleted && (
                            <p className="text-xs text-gray-500 mt-1">
                              Completed {format(new Date(milestone.dateCompleted), 'MMM d, yyyy')}
                            </p>
                          )}
                          {milestone.description && (
                            <p className="text-xs text-gray-600 mt-1">{milestone.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Matrix Breakdown */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">PRSU Matrix Breakdown</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <CustomRadarChart data={student.matrixScores} individual={true} />
                  </div>
                </section>

                {/* Score History */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Score History
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={student.scoreHistory}>
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => format(new Date(date), 'MMM d')}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          domain={[0, 100]}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                          formatter={(value) => [`${value}%`, 'Score']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#10B981" 
                          strokeWidth={3}
                          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                {/* Recent Activity */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {student.recentActivity.length > 0 ? (
                      student.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(activity.date), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No recent activity</p>
                    )}
                  </div>
                </section>

                {/* Academic Goals */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    🎯 Academic Goals
                  </h3>
                  <div className="space-y-3">
                    {student.academicGoals.length > 0 ? (
                      student.academicGoals.map((goal) => (
                        <div key={goal.id} className={`p-3 rounded-lg border ${
                          goal.status === 'Completed' 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-yellow-50 border-yellow-200'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`text-sm font-medium ${
                                goal.status === 'Completed' ? 'text-green-900' : 'text-yellow-900'
                              }`}>
                                {goal.title}
                              </h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  goal.category === 'Academic' ? 'bg-blue-100 text-blue-800' :
                                  goal.category === 'Extracurricular' ? 'bg-green-100 text-green-800' :
                                  goal.category === 'Career' ? 'bg-purple-100 text-purple-800' :
                                  'bg-pink-100 text-pink-800'
                                }`}>
                                  {goal.category}
                                </span>
                                <span className="text-xs text-gray-500">
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
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No academic goals set yet</p>
                    )}
                  </div>
                </section>

                {/* Counselor Notes */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    📝 Counselor Notes
                  </h3>
                  
                  {/* Recent Notes Display */}
                  <div className="space-y-3 mb-4">
                    {recentNotes.slice(0, 3).map((note) => (
                      <div key={note.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-gray-800 mb-2">{note.text}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{note.author}</span>
                          <span>{format(new Date(note.date), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    ))}
                    
                    {recentNotes.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No notes yet</p>
                    )}
                  </div>
                  
                  {/* Add New Note Section */}
                  {!isAddingNote ? (
                    <button
                      onClick={() => setIsAddingNote(true)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Note</span>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onBlur={() => {
                          if (newNote.trim()) {
                            handleAddNote();
                          } else {
                            setIsAddingNote(false);
                          }
                        }}
                        className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add a note about this student..."
                        autoFocus
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">Press Enter to save, or click outside to cancel</p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setNewNote('');
                              setIsAddingNote(false);
                            }}
                            className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddNote}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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