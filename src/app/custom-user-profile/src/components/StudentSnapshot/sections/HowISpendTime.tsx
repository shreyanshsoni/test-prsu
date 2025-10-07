import React, { useState } from 'react';
import { Clock, Briefcase, Heart, Plus, X, Copy, Check, Save } from 'lucide-react';
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
  const [activityErrors, setActivityErrors] = useState<{ titleMissing: boolean; roleMissing: boolean }>({ titleMissing: false, roleMissing: false });
  const [activityGeneralError, setActivityGeneralError] = useState<string>('');
  const [workErrors, setWorkErrors] = useState<{ titleMissing: boolean; companyMissing: boolean }>({ titleMissing: false, companyMissing: false });
  const [workGeneralError, setWorkGeneralError] = useState<string>('');
  const [respMissing, setRespMissing] = useState<boolean>(false);
  const [respGeneralError, setRespGeneralError] = useState<string>('');
  const [copyStatus, setCopyStatus] = useState({
    activities: false,
    work: false,
    responsibilities: false
  });

  const addActivity = () => {
    const missingTitle = !newActivity.title;
    const missingRole = !newActivity.role;
    if (missingTitle || missingRole) {
      setActivityErrors({ titleMissing: missingTitle, roleMissing: missingRole });
      setActivityGeneralError('Fill all required fields to continue');
      return;
    }
    setActivityErrors({ titleMissing: false, roleMissing: false });
    setActivityGeneralError('');
    onUpdate({
      extracurriculars: [...(data.extracurriculars || []), newActivity]
    });
    setNewActivity({ title: '', role: '', hoursPerWeek: '', duration: '', description: '' });
  };

  const removeActivity = (index: number) => {
    const activities = [...(data.extracurriculars || [])];
    activities.splice(index, 1);
    onUpdate({ extracurriculars: activities });
  };

  const addWork = () => {
    const missingTitle = !newWork.title;
    const missingCompany = !newWork.company;
    if (missingTitle || missingCompany) {
      setWorkErrors({ titleMissing: missingTitle, companyMissing: missingCompany });
      setWorkGeneralError('Fill all required fields to continue');
      return;
    }
    setWorkErrors({ titleMissing: false, companyMissing: false });
    setWorkGeneralError('');
    onUpdate({
      workExperience: [...(data.workExperience || []), newWork]
    });
    setNewWork({ title: '', company: '', duration: '', description: '' });
  };

  const removeWork = (index: number) => {
    const work = [...(data.workExperience || [])];
    work.splice(index, 1);
    onUpdate({ workExperience: work });
  };

  const addResponsibility = () => {
    const value = newResponsibility.trim();
    if (!value) {
      setRespMissing(true);
      setRespGeneralError('Fill all required fields to continue');
      return;
    }
    setRespMissing(false);
    setRespGeneralError('');
    onUpdate({
      familyResponsibilities: [...(data.familyResponsibilities || []), value]
    });
    setNewResponsibility('');
  };

  const removeResponsibility = (index: number) => {
    const responsibilities = [...(data.familyResponsibilities || [])];
    responsibilities.splice(index, 1);
    onUpdate({ familyResponsibilities: responsibilities });
  };

  const copyToClipboard = (section: 'activities' | 'work' | 'responsibilities') => {
    let textToCopy = '';
    
    if (section === 'activities' && data.extracurriculars) {
      textToCopy = data.extracurriculars.map(activity => 
        `${activity.title} - ${activity.role}${activity.hoursPerWeek ? ` (${activity.hoursPerWeek} hrs/week)` : ''}${activity.duration ? `, ${activity.duration}` : ''}${activity.description ? `\n${activity.description}` : ''}`
      ).join('\n\n');
    } else if (section === 'work' && data.workExperience) {
      textToCopy = data.workExperience.map(work => 
        `${work.title} at ${work.company}${work.duration ? ` (${work.duration})` : ''}${work.description ? `\n${work.description}` : ''}`
      ).join('\n\n');
    } else if (section === 'responsibilities' && data.familyResponsibilities) {
      textToCopy = data.familyResponsibilities.join('\n');
    }
    
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopyStatus({ ...copyStatus, [section]: true });
        
        setTimeout(() => {
          setCopyStatus({ ...copyStatus, [section]: false });
        }, 2000);
      });
    }
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">🎭 Extracurricular Activities</h3>
            <button 
              onClick={() => copyToClipboard('activities')}
              className="p-1.5 text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Copy activities"
            >
              {copyStatus.activities ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
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
                  onChange={(e) => {
                    const v = e.target.value;
                    setNewActivity({ ...newActivity, title: v });
                    if (v) {
                      const next = { ...activityErrors, titleMissing: false };
                      setActivityErrors(next);
                      if (!next.titleMissing && !next.roleMissing) setActivityGeneralError('');
                    }
                  }}
                  className={`p-2 border ${activityErrors.titleMissing ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500 dark:focus:ring-orange-400'} bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2`}
                />
                <input
                  type="text"
                  placeholder="Your role (e.g., Captain, Member, Volunteer)"
                  value={newActivity.role}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNewActivity({ ...newActivity, role: v });
                    if (v) {
                      const next = { ...activityErrors, roleMissing: false };
                      setActivityErrors(next);
                      if (!next.titleMissing && !next.roleMissing) setActivityGeneralError('');
                    }
                  }}
                  className={`p-2 border ${activityErrors.roleMissing ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500 dark:focus:ring-orange-400'} bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2`}
                />
              </div>
              {activityGeneralError && (
                <p className="text-red-600 text-sm mt-2">{activityGeneralError}</p>
              )}
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
                className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-sm transition-colors"
              >
                <Save className="w-4 h-4 mr-2 text-white" />
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Work Experience */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            <Briefcase className="inline w-5 h-5 mr-2" />
            Work Experience
          </h3>
            <button 
              onClick={() => copyToClipboard('work')}
              className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Copy work experience"
            >
              {copyStatus.work ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
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
                  onChange={(e) => {
                    const v = e.target.value;
                    setNewWork({ ...newWork, title: v });
                    if (v) {
                      const next = { ...workErrors, titleMissing: false };
                      setWorkErrors(next);
                      if (!next.titleMissing && !next.companyMissing) setWorkGeneralError('');
                    }
                  }}
                  className={`p-2 border ${workErrors.titleMissing ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'} bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2`}
                />
                <input
                  type="text"
                  placeholder="Company/Organization"
                  value={newWork.company}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNewWork({ ...newWork, company: v });
                    if (v) {
                      const next = { ...workErrors, companyMissing: false };
                      setWorkErrors(next);
                      if (!next.titleMissing && !next.companyMissing) setWorkGeneralError('');
                    }
                  }}
                  className={`p-2 border ${workErrors.companyMissing ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'} bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2`}
                />
              </div>
              {workGeneralError && (
                <p className="text-red-600 text-sm mt-2">{workGeneralError}</p>
              )}
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
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors"
              >
                <Save className="w-4 h-4 mr-2 text-white" />
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Family Responsibilities */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            <Heart className="inline w-5 h-5 mr-2" />
            Family Responsibilities
          </h3>
            <button 
              onClick={() => copyToClipboard('responsibilities')}
              className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Copy responsibilities"
            >
              {copyStatus.responsibilities ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
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
                className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm transition-colors"
              >
                <Save className="w-4 h-4 mr-2 text-white" />
                Save
              </button>
            </div>
            {respGeneralError && (
              <p className="text-red-600 text-sm mt-2">{respGeneralError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};