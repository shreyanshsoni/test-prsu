import React, { useState } from 'react';
import { Target, Compass, Plus, X } from 'lucide-react';
import { StudentData } from '../../../types/student';
import { useTheme } from '../../../../../contexts/ThemeContext';

interface WhatImWorkingTowardProps {
  data: Partial<StudentData>;
  onUpdate: (data: Partial<StudentData>) => void;
}

export const WhatImWorkingToward: React.FC<WhatImWorkingTowardProps> = ({ data, onUpdate }) => {
  const { theme } = useTheme();
  const [newCareerGoal, setNewCareerGoal] = useState('');
  const [newCollegeGoal, setNewCollegeGoal] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newOpportunityType, setNewOpportunityType] = useState('');
  const [careerError, setCareerError] = useState<string>('');
  const [collegeError, setCollegeError] = useState<string>('');
  const [interestError, setInterestError] = useState<string>('');
  const [oppTypeError, setOppTypeError] = useState<string>('');

  const addCareerGoal = () => {
    const v = newCareerGoal.trim();
    if (!v) {
      setCareerError('Fill all required fields to continue');
      return;
    }
    setCareerError('');
    onUpdate({
      careerGoals: [...(data.careerGoals || []), v]
    });
    setNewCareerGoal('');
  };

  const removeCareerGoal = (index: number) => {
    const goals = [...(data.careerGoals || [])];
    goals.splice(index, 1);
    onUpdate({ careerGoals: goals });
  };

  const addCollegeGoal = () => {
    const v = newCollegeGoal.trim();
    if (!v) {
      setCollegeError('Fill all required fields to continue');
      return;
    }
    setCollegeError('');
    onUpdate({
      collegeGoals: [...(data.collegeGoals || []), v]
    });
    setNewCollegeGoal('');
  };

  const removeCollegeGoal = (index: number) => {
    const goals = [...(data.collegeGoals || [])];
    goals.splice(index, 1);
    onUpdate({ collegeGoals: goals });
  };

  const addInterest = () => {
    const v = newInterest.trim();
    if (!v) {
      setInterestError('Fill all required fields to continue');
      return;
    }
    setInterestError('');
    onUpdate({
      interests: [...(data.interests || []), v]
    });
    setNewInterest('');
  };

  const removeInterest = (index: number) => {
    const interests = [...(data.interests || [])];
    interests.splice(index, 1);
    onUpdate({ interests });
  };

  const addOpportunityType = () => {
    const v = newOpportunityType.trim();
    if (!v) {
      setOppTypeError('Fill all required fields to continue');
      return;
    }
    setOppTypeError('');
    onUpdate({
      opportunityTypes: [...(data.opportunityTypes || []), v]
    });
    setNewOpportunityType('');
  };

  const removeOpportunityType = (index: number) => {
    const types = [...(data.opportunityTypes || [])];
    types.splice(index, 1);
    onUpdate({ opportunityTypes: types });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">What I'm Working Toward 🎯</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Share your goals, interests, and the opportunities you're seeking</p>
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 text-left">
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>Dream big!</strong> Your goals help us understand what motivates you and where you want to go. 
            It's totally okay if you\'re not 100% sure yet - most students change their minds, and that's normal! 
            Share what excites you right now. 🚀
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Career Goals */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            🚀 Career Goals & Aspirations
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            What do you want to do after school? This could be a specific job, a field you want to work in, 
            or even "help people" or "solve problems." Don't stress if you're unsure - just share what interests you!
          </p>
          
          {/* Existing Career Goals */}
          <div className="space-y-2 mb-4">
            {data.careerGoals?.map((goal, index) => (
              <div key={index} className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 p-3 rounded-lg">
                <span className="font-medium text-gray-800 dark:text-white">{goal}</span>
                <button
                  onClick={() => removeCareerGoal(index)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Career Goal */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g., Software Engineer, Doctor, Teacher, Entrepreneur, Help the environment"
                value={newCareerGoal}
                onChange={(e) => {
                  const v = e.target.value;
                  setNewCareerGoal(v);
                  if (v) setCareerError('');
                }}
                className={`flex-1 p-2 border ${careerError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-green-500 dark:focus:ring-green-400'} bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2`}
                onKeyPress={(e) => e.key === 'Enter' && addCareerGoal()}
              />
              <button
                onClick={addCareerGoal}
                className="flex items-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium px-3"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </button>
            </div>
            {careerError && (
              <p className="text-red-600 text-sm mt-2">{careerError}</p>
            )}
          </div>
        </div>

        {/* College Goals */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            🎓 College & Education Goals
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            What do you want from your college experience? This could be about what you want to study, 
            the type of school you prefer, or what you hope to get out of college beyond just a degree.
          </p>
          
          {/* Existing College Goals */}
          <div className="space-y-2 mb-4">
            {data.collegeGoals?.map((goal, index) => (
              <div key={index} className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 p-3 rounded-lg">
                <span className="font-medium text-gray-800 dark:text-white">{goal}</span>
                <button
                  onClick={() => removeCollegeGoal(index)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New College Goal */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g., Study Computer Science, Attend a small liberal arts college, Graduate debt-free"
                value={newCollegeGoal}
                onChange={(e) => {
                  const v = e.target.value;
                  setNewCollegeGoal(v);
                  if (v) setCollegeError('');
                }}
                className={`flex-1 p-2 border ${collegeError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'} bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2`}
                onKeyPress={(e) => e.key === 'Enter' && addCollegeGoal()}
              />
              <button
                onClick={addCollegeGoal}
                className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium px-3"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </button>
            </div>
            {collegeError && (
              <p className="text-red-600 text-sm mt-2">{collegeError}</p>
            )}
          </div>
        </div>

        {/* Areas of Interest */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            <Compass className="inline w-5 h-5 mr-2" />
            Areas I Want to Explore
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            What subjects, fields, or topics make you curious? These don't have to be your major - 
            just things you'd like to learn more about or explore in college and beyond.
          </p>
          
          {/* Existing Interests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            {data.interests?.map((interest, index) => (
              <div key={index} className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 p-3 rounded-lg">
                <span className="font-medium text-gray-800 dark:text-white">{interest}</span>
                <button
                  onClick={() => removeInterest(index)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Interest */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g., Environmental Science, Creative Writing, Robotics, Psychology"
                value={newInterest}
                onChange={(e) => {
                  const v = e.target.value;
                  setNewInterest(v);
                  if (v) setInterestError('');
                }}
                className={`flex-1 p-2 border ${interestError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500 dark:focus:ring-purple-400'} bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2`}
                onKeyPress={(e) => e.key === 'Enter' && addInterest()}
              />
              <button
                onClick={addInterest}
                className="flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium px-3"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </button>
            </div>
            {interestError && (
              <p className="text-red-600 text-sm mt-2">{interestError}</p>
            )}
          </div>
        </div>

        {/* Opportunity Types */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            🌟 Types of Opportunities I'm Looking For
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            What kinds of experiences would help you grow? This helps us understand what you're hoping 
            to gain and what types of programs or opportunities might be a good fit for you.
          </p>
          
          {/* Existing Opportunity Types */}
          <div className="space-y-2 mb-4">
            {data.opportunityTypes?.map((type, index) => (
              <div key={index} className="flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 p-3 rounded-lg">
                <span className="font-medium text-gray-800 dark:text-white">{type}</span>
                <button
                  onClick={() => removeOpportunityType(index)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Opportunity Type */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g., Internships, Mentorship, Study abroad, Research opportunities"
                value={newOpportunityType}
                onChange={(e) => {
                  const v = e.target.value;
                  setNewOpportunityType(v);
                  if (v) setOppTypeError('');
                }}
                className={`flex-1 p-2 border ${oppTypeError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-yellow-500 dark:focus:ring-yellow-400'} bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2`}
                onKeyPress={(e) => e.key === 'Enter' && addOpportunityType()}
              />
              <button
                onClick={addOpportunityType}
                className="flex items-center text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 font-medium px-3"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </button>
            </div>
            {oppTypeError && (
              <p className="text-red-600 text-sm mt-2">{oppTypeError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};