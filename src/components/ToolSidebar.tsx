import React from 'react';
import { BookOpen, FileText, BookMarked, Mail, PenTool } from 'lucide-react';
import { ToolType } from '../types/types';

interface ToolSidebarProps {
  activePhase: number;
}

export default function ToolSidebar({ activePhase }: ToolSidebarProps) {
  const phaseTools: { [key: number]: ToolType[] } = {
    0: ['journal', 'resources'],
    1: ['journal', 'resources', 'resume'],
    2: ['journal', 'resources', 'resume', 'statement'],
    3: ['journal', 'resources', 'resume', 'statement', 'recommendations'],
    4: ['journal', 'resources']
  };

  const availableTools = phaseTools[activePhase] || ['journal', 'resources'];

  const toolDetails: { [key in ToolType]: { icon: React.ReactNode; title: string; description: string } } = {
    journal: {
      icon: <PenTool size={20} className="text-purple-500" />,
      title: 'Journal Prompts',
      description: 'Reflect on your academic journey and aspirations'
    },
    resume: {
      icon: <FileText size={20} className="text-blue-500" />,
      title: 'Resume Builder',
      description: 'Create and refine your academic resume'
    },
    statement: {
      icon: <BookOpen size={20} className="text-amber-500" />,
      title: 'Statement Workshop',
      description: 'Craft compelling personal and academic statements'
    },
    recommendations: {
      icon: <Mail size={20} className="text-green-500" />,
      title: 'Recommendation Tracker',
      description: 'Manage your letter of recommendation requests'
    },
    resources: {
      icon: <BookMarked size={20} className="text-indigo-500" />,
      title: 'Resources',
      description: 'Access helpful guides and materials'
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Phase Tools</h3>
      
      <div className="space-y-3">
        {availableTools.map((tool) => (
          <div 
            key={tool}
            className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-start">
              <div className="p-2 rounded-md bg-gray-50 mr-3">
                {toolDetails[tool].icon}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-800">{toolDetails[tool].title}</h4>
                <p className="text-xs text-gray-500 mt-1">{toolDetails[tool].description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 