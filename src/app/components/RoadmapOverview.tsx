import React, { useState } from 'react';
import { Calendar, Target, User, Edit2, Clock } from 'lucide-react';

interface RoadmapOverviewProps {
  goal: string;
  identity: string;
  deadline: string;
  progress: number;
  onUpdateGoal: (goal: { title: string; identity: string; deadline: string }) => void;
}

export default function RoadmapOverview({
  goal,
  identity,
  deadline,
  progress,
  onUpdateGoal
}: RoadmapOverviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoal, setEditedGoal] = useState(goal);
  const [editedIdentity, setEditedIdentity] = useState(identity);
  const [editedDeadline, setEditedDeadline] = useState(deadline);

  const handleSave = () => {
    onUpdateGoal({
      title: editedGoal,
      identity: editedIdentity,
      deadline: editedDeadline
    });
    setIsEditing(false);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Calculate days remaining
  const daysRemaining = () => {
    const today = new Date();
    const targetDate = new Date(deadline);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-700 opacity-90"></div>
        <div className="relative p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-3 text-white">
              {isEditing ? (
                <input
                  type="text"
                  value={editedGoal}
                  onChange={(e) => setEditedGoal(e.target.value)}
                  className="w-full px-3 py-2 text-xl font-bold bg-white/10 backdrop-blur-sm rounded border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Enter your goal"
                />
              ) : (
                <h2 className="text-xl font-bold flex items-center">
                  <Target size={20} className="mr-2" />
                  {goal}
                </h2>
              )}

              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User size={16} className="mr-2 flex-shrink-0" />
                    <input
                      type="text"
                      value={editedIdentity}
                      onChange={(e) => setEditedIdentity(e.target.value)}
                      className="w-full px-3 py-1 text-sm bg-white/10 backdrop-blur-sm rounded border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Your identity"
                    />
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2 flex-shrink-0" />
                    <input
                      type="date"
                      value={editedDeadline}
                      onChange={(e) => setEditedDeadline(e.target.value)}
                      className="w-full px-3 py-1 text-sm bg-white/10 backdrop-blur-sm rounded border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-sm">
                  <p className="flex items-center">
                    <User size={16} className="mr-2" />
                    {identity}
                  </p>
                  <p className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    {formatDate(deadline)}
                  </p>
                  <p className="flex items-center text-indigo-100">
                    <Clock size={16} className="mr-2" />
                    {daysRemaining()} days remaining
                  </p>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-white text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-50"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-indigo-700 text-white rounded-md text-sm font-medium hover:bg-indigo-800"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-white opacity-80 hover:opacity-100 rounded-full hover:bg-white/10"
              >
                <Edit2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full bg-indigo-200">
          <div
            className="h-full bg-teal-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-sm font-medium text-gray-700">
            Overall Progress: {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  );
} 