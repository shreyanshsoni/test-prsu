import React, { useState } from 'react';
import { Copy, Check, Download, Share2, FileText, List, Briefcase } from 'lucide-react';
import { StudentData } from '../../types/student';
import { useTheme } from '../../../../contexts/ThemeContext';

interface SummaryProps {
  data: StudentData;
  onEdit: () => void;
}

export const Summary: React.FC<SummaryProps> = ({ data, onEdit }) => {
  const { theme } = useTheme();
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatForParagraph = () => {
    let text = `I am a ${data.gradeLevel || 'high school'} student`;
    if (data.schoolType) text += ` at a ${data.schoolType.toLowerCase()}`;
    
    if (data.gpa?.unweighted || data.gpa?.weighted) {
      text += ` with a ${data.gpa?.unweighted || data.gpa?.weighted} GPA`;
    }
    
    text += ". ";

    if (data.standardizedTests?.length || data.advancedClasses?.length) {
      text += "Academically, I have ";
      const achievements = [];
      if (data.standardizedTests?.length) {
        achievements.push(`scored ${data.standardizedTests.map(t => `${t.score} on the ${t.type}`).join(', ')}`);
      }
      if (data.advancedClasses?.length) {
        achievements.push(`taken ${data.advancedClasses.length} advanced courses including ${data.advancedClasses.slice(0, 3).map(c => `${c.type} ${c.subject}`).join(', ')}`);
      }
      text += achievements.join(' and ') + ". ";
    }

    if (data.extracurriculars?.length) {
      text += `Outside of academics, I am involved in ${data.extracurriculars.map(a => `${a.title} as ${a.role}`).join(', ')}. `;
    }

    if (data.workExperience?.length) {
      text += `I have work experience as ${data.workExperience.map(w => `${w.title} at ${w.company}`).join(' and ')}. `;
    }

    if (data.projects?.length) {
      text += `I have independently worked on projects including ${data.projects.map(p => p.title).join(', ')}. `;
    }

    if (data.careerGoals?.length || data.collegeGoals?.length) {
      text += "Looking forward, ";
      const goals = [];
      if (data.careerGoals?.length) {
        goals.push(`I aspire to pursue a career in ${data.careerGoals.join(' or ')}`);
      }
      if (data.collegeGoals?.length) {
        goals.push(`my educational goals include ${data.collegeGoals.join(' and ')}`);
      }
      text += goals.join(' and ') + ".";
    }

    return text;
  };

  const formatForBullets = () => {
    let text = "STUDENT PROFILE\n\n";
    
    text += "ACADEMIC BACKGROUND\n";
    if (data.gradeLevel) text += `• Grade Level: ${data.gradeLevel}\n`;
    if (data.schoolType) text += `• School Type: ${data.schoolType}\n`;
    if (data.gpa?.unweighted || data.gpa?.weighted) {
      text += `• GPA: ${data.gpa?.unweighted ? `${data.gpa.unweighted} (unweighted)` : ''}${data.gpa?.weighted ? ` / ${data.gpa.weighted} (weighted)` : ''}\n`;
    }
    if (data.classRank) text += `• Class Rank: ${data.classRank}\n`;
    
    if (data.standardizedTests?.length || data.advancedClasses?.length || data.academicAwards?.length) {
      text += "\nACADEMIC ACHIEVEMENTS\n";
      data.standardizedTests?.forEach(test => {
        text += `• ${test.type}: ${test.score}${test.date ? ` (${test.date})` : ''}\n`;
      });
      data.advancedClasses?.forEach(cls => {
        text += `• ${cls.type} ${cls.subject}${cls.score ? `: ${cls.score}` : ''}\n`;
      });
      data.academicAwards?.forEach(award => {
        text += `• ${award}\n`;
      });
    }

    if (data.extracurriculars?.length || data.workExperience?.length) {
      text += "\nACTIVITIES & EXPERIENCE\n";
      data.extracurriculars?.forEach(activity => {
        text += `• ${activity.title} - ${activity.role}`;
        if (activity.hoursPerWeek || activity.duration) {
          text += ` (${activity.hoursPerWeek ? activity.hoursPerWeek + ' hrs/week' : ''}${activity.duration ? ', ' + activity.duration : ''})`;
        }
        if (activity.description) text += `\n  ${activity.description}`;
        text += "\n";
      });
      data.workExperience?.forEach(work => {
        text += `• ${work.title} at ${work.company}${work.duration ? ` (${work.duration})` : ''}\n`;
        if (work.description) text += `  ${work.description}\n`;
      });
    }

    if (data.projects?.length || data.passions?.length) {
      text += "\nPROJECTS & INTERESTS\n";
      data.projects?.forEach(project => {
        text += `• ${project.title}: ${project.description}\n`;
        if (project.skills?.length) {
          text += `  Skills: ${project.skills.join(', ')}\n`;
        }
      });
      data.passions?.forEach(passion => {
        text += `• Passionate about: ${passion}\n`;
      });
    }

    if (data.careerGoals?.length || data.collegeGoals?.length || data.interests?.length) {
      text += "\nGOALS & ASPIRATIONS\n";
      data.careerGoals?.forEach(goal => {
        text += `• Career Goal: ${goal}\n`;
      });
      data.collegeGoals?.forEach(goal => {
        text += `• Education Goal: ${goal}\n`;
      });
      data.interests?.forEach(interest => {
        text += `• Want to explore: ${interest}\n`;
      });
    }

    return text;
  };

  const formatForCommonApp = () => {
    return formatForParagraph().replace(/\. /g, '.\n\n');
  };

  const formats = [
    {
      name: 'Application Paragraph',
      icon: FileText,
      description: 'Perfect for college applications and essays',
      format: formatForParagraph(),
      key: 'paragraph'
    },
    {
      name: 'Bullet Point Format',
      icon: List,
      description: 'Great for resumes and quick reference',
      format: formatForBullets(),
      key: 'bullets'
    },
    {
      name: 'Common App Style',
      icon: Briefcase,
      description: 'Formatted for Common Application',
      format: formatForCommonApp(),
      key: 'commonapp'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full mb-4">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Your Story is Complete! 🎉</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          You've built an amazing profile that showcases who you are. Now you can copy it in different formats 
          or continue to edit and refine it anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {formats.map((format) => (
          <div key={format.key} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg mr-3">
                <format.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">{format.name}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{format.description}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4 max-h-40 overflow-y-auto">
              <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                {format.format.slice(0, 200)}...
              </pre>
            </div>

            <div className="flex flex-col space-y-2">
              <button
                onClick={() => copyToClipboard(format.format, format.key)}
                className="flex items-center justify-center px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all"
              >
                {copiedFormat === format.key ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied to clipboard
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to clipboard
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          What's Next?
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Your profile helps us match you with relevant opportunities and builds a foundation for your applications.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={onEdit}
            className="flex items-center justify-center px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
          >
            Edit Your Profile
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center px-4 py-3 border border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
          >
            Explore Opportunities
          </button>
        </div>
      </div>
    </div>
  );
};