import React from 'react';
import { User, School, Award, Clock, Star, Target, Copy, Check } from 'lucide-react';
import { StudentData } from '../../types/student';
import { useTheme } from '../../../../contexts/ThemeContext';

interface PreviewCardProps {
  data: Partial<StudentData>;
  onCopy?: (format: string) => void;
  copiedFormat?: string | null;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({ data, onCopy, copiedFormat }) => {
  const { theme } = useTheme();
  const hasBasicInfo = data.gradeLevel || data.schoolType || data.gpa?.unweighted || data.gpa?.weighted;
  const hasAchievements = (data.standardizedTests?.length || 0) > 0 || (data.advancedClasses?.length || 0) > 0 || (data.academicAwards?.length || 0) > 0;
  const hasActivities = (data.extracurriculars?.length || 0) > 0 || (data.workExperience?.length || 0) > 0;
  const hasProjects = (data.projects?.length || 0) > 0 || (data.passions?.length || 0) > 0 || data.uniqueFact;
  const hasGoals = (data.careerGoals?.length || 0) > 0 || (data.collegeGoals?.length || 0) > 0;

  const formatForApplication = () => {
    let text = "Student Profile Summary\n\n";
    
    if (hasBasicInfo) {
      text += "Academic Background:\n";
      if (data.gradeLevel) text += `• Currently in ${data.gradeLevel}\n`;
      if (data.schoolType) text += `• Attending ${data.schoolType}\n`;
      if (data.gpa?.unweighted || data.gpa?.weighted) {
        text += `• GPA: ${data.gpa?.unweighted ? `${data.gpa.unweighted} (unweighted)` : ''}${data.gpa?.weighted ? ` / ${data.gpa.weighted} (weighted)` : ''}\n`;
      }
      if (data.classRank) text += `• Class Rank: ${data.classRank}\n`;
      text += "\n";
    }

    if (hasAchievements) {
      text += "Academic Achievements:\n";
      data.standardizedTests?.forEach(test => {
        text += `• ${test.type}: ${test.score}${test.date ? ` (${test.date})` : ''}\n`;
      });
      data.advancedClasses?.forEach(cls => {
        text += `• ${cls.type} ${cls.subject}${cls.score ? `: ${cls.score}` : ''}\n`;
      });
      data.academicAwards?.forEach(award => {
        text += `• ${award}\n`;
      });
      text += "\n";
    }

    if (hasActivities) {
      text += "Activities & Experience:\n";
      data.extracurriculars?.forEach(activity => {
        text += `• ${activity.title} - ${activity.role}`;
        if (activity.hoursPerWeek || activity.duration) {
          text += ` (${activity.hoursPerWeek ? activity.hoursPerWeek + ' hrs/week' : ''}${activity.duration ? ', ' + activity.duration : ''})`;
        }
        text += "\n";
      });
      data.workExperience?.forEach(work => {
        text += `• ${work.title} at ${work.company}${work.duration ? ` (${work.duration})` : ''}\n`;
      });
      text += "\n";
    }

    if (hasGoals) {
      text += "Goals & Interests:\n";
      data.careerGoals?.forEach(goal => {
        text += `• Career: ${goal}\n`;
      });
      data.collegeGoals?.forEach(goal => {
        text += `• Education: ${goal}\n`;
      });
      data.interests?.forEach(interest => {
        text += `• Exploring: ${interest}\n`;
      });
    }

    return text;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md mx-auto lg:sticky lg:top-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-3">
          <User className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">My Story So Far</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">Your profile is coming together!</p>
      </div>

      <div className="space-y-4">
        {/* Basic Info */}
        <div className={`p-3 rounded-lg border-2 ${hasBasicInfo ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
          <div className="flex items-center mb-2">
            <School className={`w-4 h-4 mr-2 ${hasBasicInfo ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
            <span className={`text-sm font-medium ${hasBasicInfo ? 'text-blue-800 dark:text-blue-200' : 'text-gray-600 dark:text-gray-400'}`}>
              Where I Am
            </span>
          </div>
          {hasBasicInfo ? (
            <div className="text-xs text-blue-700 dark:text-blue-300">
              {data.gradeLevel && <div>{data.gradeLevel}</div>}
              {data.schoolType && <div>{data.schoolType}</div>}
              {(data.gpa?.unweighted || data.gpa?.weighted) && (
                <div>GPA: {data.gpa?.unweighted || data.gpa?.weighted}</div>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400">Complete this section</div>
          )}
        </div>

        {/* Achievements */}
        <div className={`p-3 rounded-lg border-2 ${hasAchievements ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
          <div className="flex items-center mb-2">
            <Award className={`w-4 h-4 mr-2 ${hasAchievements ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`} />
            <span className={`text-sm font-medium ${hasAchievements ? 'text-emerald-800 dark:text-emerald-200' : 'text-gray-600 dark:text-gray-400'}`}>
              What I've Done
            </span>
          </div>
          {hasAchievements ? (
            <div className="text-xs text-emerald-700 dark:text-emerald-300">
              {(data.standardizedTests?.length || 0) + (data.advancedClasses?.length || 0) + (data.academicAwards?.length || 0)} achievements added
            </div>
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400">Add your accomplishments</div>
          )}
        </div>

        {/* Activities */}
        <div className={`p-3 rounded-lg border-2 ${hasActivities ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/50' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
          <div className="flex items-center mb-2">
            <Clock className={`w-4 h-4 mr-2 ${hasActivities ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400 dark:text-gray-500'}`} />
            <span className={`text-sm font-medium ${hasActivities ? 'text-orange-800 dark:text-orange-200' : 'text-gray-600 dark:text-gray-400'}`}>
              How I Spend Time
            </span>
          </div>
          {hasActivities ? (
            <div className="text-xs text-orange-700 dark:text-orange-300">
              {(data.extracurriculars?.length || 0) + (data.workExperience?.length || 0)} activities added
            </div>
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400">Share your activities</div>
          )}
        </div>

        {/* Projects */}
        <div className={`p-3 rounded-lg border-2 ${hasProjects ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
          <div className="flex items-center mb-2">
            <Star className={`w-4 h-4 mr-2 ${hasProjects ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'}`} />
            <span className={`text-sm font-medium ${hasProjects ? 'text-purple-800 dark:text-purple-200' : 'text-gray-600 dark:text-gray-400'}`}>
              What I'm Proud Of
            </span>
          </div>
          {hasProjects ? (
            <div className="text-xs text-purple-700 dark:text-purple-300">
              Projects and passions shared
            </div>
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400">Tell us what you're proud of</div>
          )}
        </div>

        {/* Goals */}
        <div className={`p-3 rounded-lg border-2 ${hasGoals ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
          <div className="flex items-center mb-2">
            <Target className={`w-4 h-4 mr-2 ${hasGoals ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`} />
            <span className={`text-sm font-medium ${hasGoals ? 'text-green-800 dark:text-green-200' : 'text-gray-600 dark:text-gray-400'}`}>
              What I'm Working Toward
            </span>
          </div>
          {hasGoals ? (
            <div className="text-xs text-green-700 dark:text-green-300">
              Goals and interests defined
            </div>
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400">Share your aspirations</div>
          )}
        </div>
      </div>

      {/* Copy Button - removed as requested */}
    </div>
  );
};