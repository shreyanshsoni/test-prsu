import React, { useState } from 'react';
import { Clock, Briefcase, Heart, Plus, X } from 'lucide-react';
import { StudentData } from '../../../types/student';
import { useTheme } from '../../../../../contexts/ThemeContext';

interface HowISpendTimeProps {
  data: Partial<StudentData>;
  onUpdate: (data: Partial<StudentData>) => void;
}

export const HowISpendTime: React.FC<HowISpendTimeProps> = ({ data, onUpdate }) => {
  const { theme } = useTheme();
  const [newActivity, setNewActivity] = useState({
    title: '', role: '', hoursPerWeek: '', duration: '', description: ''
  });
  const [newWork, setNewWork] = useState({
    title: '', company: '', duration: '', description: ''
  });
  const [newResponsibility, setNewResponsibility] = useState('');

  const addActivity = () => {
    if (newActivity.title && newActivity.role) {
      onUpdate({
        extracurriculars: [...(data.extracurriculars || []), newActivity]
      });
      setNewActivity({ title: '', role: '', hoursPerWeek: '', duration: '', description: '' });
    }
  };

  const removeActivity = (index: number) => {
    const activities = [...(data.extracurriculars || [])];
    activities.splice(index, 1);
    onUpdate({ extracurriculars: activities });
  };

  const addWork = () => {
    if (newWork.title && newWork.company) {
      onUpdate({
        workExperience: [...(data.workExperience || []), newWork]
      });
      setNewWork({ title: '', company: '', duration: '', description: '' });
    }
  };

  const removeWork = (index: number) => {
    const work = [...(data.workExperience || [])];
    work.splice(index, 1);
    onUpdate({ workExperience: work });
  };

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      onUpdate({
        familyResponsibilities: [...(data.familyResponsibilities || []), newResponsibility.trim()]
      });
      setNewResponsibility('');
    }
  };

  const removeResponsibility = (index: number) => {
    const responsibilities = [...(data.familyResponsibilities || [])];
    responsibilities.splice(index, 1);
    onUpdate({ familyResponsibilities: responsibilities });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mb-4">
          <Clock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">How I Spend My Time ⏰</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Tell us about your activities, work, and responsibilities</p>
        <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4 text-left">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            <strong>Your time tells your story!</strong> Whether you're leading a club, working part-time, 
            or helping at home - these experiences shape who you are. Colleges and employers want to see 
            how you spend your time outside of class because it shows your values and character. 💪
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Extracurriculars */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            🎭 Extracurricular Activities
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Sports, clubs, volunteer work, music, theater - anything you do outside of regular classes! 
            Leadership roles are great, but being a dedicated member matters too.
          </p>
          
          {/* Existing Activities */}
          {data.extracurriculars?.map((activity, index) => (
            <div key={index} className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-lg p-4 mb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 dark:text-white">{activity.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300">{activity.role}</p>
                  <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {activity.hoursPerWeek && <span>{activity.hoursPerWeek} hrs/week</span>}
                    {activity.duration && <span>{activity.duration}</span>}
                  </div>
                  {activity.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{activity.description}</p>
                  )}
                </div>
                <button
                  onClick={() => removeActivity(index)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add New Activity */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Activity name (e.g., Soccer Team, Drama Club)"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                  className="p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400"
                />
                <input
                  type="text"
                  placeholder="Your role (e.g., Captain, Member, Volunteer)"
                  value={newActivity.role}
                  onChange={(e) => setNewActivity({ ...newActivity, role: e.target.value })}
                  className="p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Hours per week (e.g., 5-10)"
                  value={newActivity.hoursPerWeek}
                  onChange={(e) => setNewActivity({ ...newActivity, hoursPerWeek: e.target.value })}
                  className="p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400"
                />
                <input
                  type="text"
                  placeholder="How long? (e.g., 2 years, Since 9th grade)"
                  value={newActivity.duration}
                  onChange={(e) => setNewActivity({ ...newActivity, duration: e.target.value })}
                  className="p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400"
                />
              </div>
              <textarea
                placeholder="What do you do? Any achievements or impact? (optional)"
                value={newActivity.description}
                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400"
                rows={2}
              />
              <button
                onClick={addActivity}
                className="flex items-center text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Activity
              </button>
            </div>
          </div>
        </div>

        {/* Work Experience */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            <Briefcase className="inline w-5 h-5 mr-2" />
            Work Experience
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Part-time jobs, internships, babysitting, tutoring - any paid work counts! 
            Work experience shows responsibility, time management, and real-world skills.
          </p>
          
          {/* Existing Work */}
          {data.workExperience?.map((work, index) => (
            <div key={index} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-4 mb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 dark:text-white">{work.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300">{work.company}</p>
                  {work.duration && <p className="text-sm text-gray-500 dark:text-gray-400">{work.duration}</p>}
                  {work.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{work.description}</p>
                  )}
                </div>
                <button
                  onClick={() => removeWork(index)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add New Work */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Job title (e.g., Cashier, Tutor, Intern)"
                  value={newWork.title}
                  onChange={(e) => setNewWork({ ...newWork, title: e.target.value })}
                  className="p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <input
                  type="text"
                  placeholder="Company/Organization"
                  value={newWork.company}
                  onChange={(e) => setNewWork({ ...newWork, company: e.target.value })}
                  className="p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
              <input
                type="text"
                placeholder="When? (e.g., Summer 2023, Weekends since 2022)"
                value={newWork.duration}
                onChange={(e) => setNewWork({ ...newWork, duration: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <textarea
                placeholder="What did you learn or accomplish? (optional)"
                value={newWork.description}
                onChange={(e) => setNewWork({ ...newWork, description: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                rows={2}
              />
              <button
                onClick={addWork}
                className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Work Experience
              </button>
            </div>
          </div>
        </div>

        {/* Family Responsibilities */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            <Heart className="inline w-5 h-5 mr-2" />
            Family Responsibilities
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Caring for siblings, helping grandparents, household duties - these count too! 
            These responsibilities show maturity and demonstrate your values.
          </p>
          
          {/* Existing Responsibilities */}
          {data.familyResponsibilities?.map((responsibility, index) => (
            <div key={index} className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 p-3 rounded-lg mb-2">
              <span className="font-medium text-gray-800 dark:text-white">{responsibility}</span>
              <button
                onClick={() => removeResponsibility(index)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Add New Responsibility */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g., Watching younger siblings, Caregiving for grandparent"
                value={newResponsibility}
                onChange={(e) => setNewResponsibility(e.target.value)}
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                onKeyPress={(e) => e.key === 'Enter' && addResponsibility()}
              />
              <button
                onClick={addResponsibility}
                className="flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium px-3"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};