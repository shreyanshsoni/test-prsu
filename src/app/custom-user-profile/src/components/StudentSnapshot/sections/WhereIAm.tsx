import React from 'react';
import { GraduationCap, School, Trophy } from 'lucide-react';
import { StudentData } from '../../../types/student';
import { useTheme } from '../../../../../contexts/ThemeContext';

interface WhereIAmProps {
  data: Partial<StudentData>;
  onUpdate: (data: Partial<StudentData>) => void;
}

export const WhereIAm: React.FC<WhereIAmProps> = ({ data, onUpdate }) => {
  const { theme } = useTheme();
  const handleInputChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleGPAChange = (type: 'weighted' | 'unweighted', value: string) => {
    onUpdate({
      gpa: {
        ...data.gpa,
        [type]: value
      }
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
          <School className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Where I Am 🎒</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Let's start with the basics about your academic journey</p>
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Why this matters:</strong> This helps us understand your current academic context. 
            Don't worry if you don\'t have all the numbers - we're just getting to know you! 
            Every student's journey is different, and that\'s what makes your story unique.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Grade Level */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            What grade are you in?
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">This helps us tailor advice and opportunities to your timeline</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['9th Grade', '10th Grade', '11th Grade', '12th Grade'].map((grade) => (
              <button
                key={grade}
                onClick={() => handleInputChange('gradeLevel', grade)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  data.gradeLevel === grade
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300'
                }`}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>

        {/* School Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            What type of school do you attend?
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Each school type has unique strengths - we want to highlight what makes yours special
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['Public School', 'Private School', 'Charter School', 'Homeschool', 'Other'].map((type) => (
              <button
                key={type}
                onClick={() => handleInputChange('schoolType', type)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  data.schoolType === type
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* GPA */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            <GraduationCap className="inline w-4 h-4 mr-1" />
            What's your GPA? (Optional - we know not everyone tracks this!)
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Numbers don't tell your whole story, but they can be helpful context. If your school doesn't use GPA or you're not sure, that's totally fine - just skip this!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Unweighted GPA (out of 4.0)</label>
              <input
                type="text"
                placeholder="e.g., 3.7"
                value={data.gpa?.unweighted || ''}
                onChange={(e) => handleGPAChange('unweighted', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Weighted GPA (if your school uses this)</label>
              <input
                type="text"
                placeholder="e.g., 4.2"
                value={data.gpa?.weighted || ''}
                onChange={(e) => handleGPAChange('weighted', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Class Rank */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            <Trophy className="inline w-4 h-4 mr-1" />
            Class rank (if known - totally optional!)
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Some schools share this, others don't. If you know it, great! If not, no worries at all.
          </p>
          <input
            type="text"
            placeholder="e.g., Top 10% or 15 out of 300"
            value={data.classRank || ''}
            onChange={(e) => handleInputChange('classRank', e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};