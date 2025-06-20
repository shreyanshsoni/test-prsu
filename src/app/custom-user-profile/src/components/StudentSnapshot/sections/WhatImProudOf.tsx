import React, { useState } from 'react';
import { Star, Code, Music, Plus, X, Copy, Check } from 'lucide-react';
import { StudentData } from '../../../types/student';
import { useTheme } from '../../../../../contexts/ThemeContext';

interface WhatImProudOfProps {
  data: Partial<StudentData>;
  onUpdate: (data: Partial<StudentData>) => void;
}

export const WhatImProudOf: React.FC<WhatImProudOfProps> = ({ data, onUpdate }) => {
  const { theme } = useTheme();
  const [newProject, setNewProject] = useState({
    title: '', description: '', skills: []
  });
  const [newPassion, setNewPassion] = useState('');
  const [projectSkill, setProjectSkill] = useState('');
  const [copyStatus, setCopyStatus] = useState({
    projects: false,
    passions: false
  });

  const addProject = () => {
    if (newProject.title && newProject.description) {
      onUpdate({
        projects: [...(data.projects || []), newProject]
      });
      setNewProject({ title: '', description: '', skills: [] });
    }
  };

  const removeProject = (index: number) => {
    const projects = [...(data.projects || [])];
    projects.splice(index, 1);
    onUpdate({ projects });
  };

  const addSkillToProject = () => {
    if (projectSkill.trim()) {
      setNewProject({
        ...newProject,
        skills: [...newProject.skills, projectSkill.trim()]
      });
      setProjectSkill('');
    }
  };

  const removeSkillFromProject = (index: number) => {
    const skills = [...newProject.skills];
    skills.splice(index, 1);
    setNewProject({ ...newProject, skills });
  };

  const addPassion = () => {
    if (newPassion.trim()) {
      onUpdate({
        passions: [...(data.passions || []), newPassion.trim()]
      });
      setNewPassion('');
    }
  };

  const removePassion = (index: number) => {
    const passions = [...(data.passions || [])];
    passions.splice(index, 1);
    onUpdate({ passions });
  };

  const copyToClipboard = (section: 'projects' | 'passions') => {
    let textToCopy = '';
    
    if (section === 'projects' && data.projects) {
      textToCopy = data.projects.map(project => 
        `${project.title}${project.skills && project.skills.length > 0 ? `\nSkills: ${project.skills.join(', ')}` : ''}${project.description ? `\n${project.description}` : ''}`
      ).join('\n\n');
    } else if (section === 'passions' && data.passions) {
      textToCopy = data.passions.join('\n');
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
          <Star className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">What I'm Proud Of ✨</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Share your projects, passions, and what makes you unique</p>
        <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-left">
          <p className="text-sm text-purple-800 dark:text-purple-200">
            <strong>This is where you shine!</strong> Whether it's a coding project, art you've created, 
            research you've done, or something you taught yourself - these personal projects show your 
            curiosity and initiative. Don't worry if it seems "small" - passion projects reveal who you really are! 🌟
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Projects */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            <Code className="inline w-5 h-5 mr-2" />
            Independent Projects & Research
          </h3>
            <button 
              onClick={() => copyToClipboard('projects')}
              className="p-1.5 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Copy projects"
            >
              {copyStatus.projects ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Apps you've built, research you've done, art you've created, businesses you've started, 
            YouTube channels, blogs - anything you've worked on outside of class assignments!
          </p>
          
          {/* Existing Projects */}
          {data.projects?.map((project, index) => (
            <div key={index} className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-lg p-4 mb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 dark:text-white">{project.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">{project.description}</p>
                  {project.skills && project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.skills.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeProject(index)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add New Project */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Project title (e.g., Personal Website, Science Fair Project)"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              />
              <textarea
                placeholder="What did you create? What problem did it solve? What impact did it have? Be specific!"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                rows={3}
              />
              
              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Skills you used or learned (optional)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newProject.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 text-xs rounded-full"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkillFromProject(index)}
                        className="ml-1 text-purple-500 hover:text-purple-700 dark:text-purple-300 dark:hover:text-purple-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., JavaScript, Research, Design, Leadership"
                    value={projectSkill}
                    onChange={(e) => setProjectSkill(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    onKeyPress={(e) => e.key === 'Enter' && addSkillToProject()}
                  />
                  <button
                    onClick={addSkillToProject}
                    className="px-3 py-2 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/70"
                  >
                    Add
                  </button>
                </div>
              </div>

              <button
                onClick={addProject}
                className="flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Project
              </button>
            </div>
          </div>
        </div>

        {/* Passions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            <Music className="inline w-5 h-5 mr-2" />
            My Passions & Hobbies
          </h3>
            <button 
              onClick={() => copyToClipboard('passions')}
              className="p-1.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Copy passions"
            >
              {copyStatus.passions ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            What gets you excited? What do you do in your free time? Photography, gaming, cooking, 
            reading, hiking - these interests make you who you are and often connect to future goals!
          </p>
          
          {/* Existing Passions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            {data.passions?.map((passion, index) => (
              <div key={index} className="flex items-center justify-between bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800/50 p-3 rounded-lg">
                <span className="font-medium text-gray-800 dark:text-white">{passion}</span>
                <button
                  onClick={() => removePassion(index)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Passion */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="What are you passionate about? (e.g., Photography, Cooking, Gaming)"
                value={newPassion}
                onChange={(e) => setNewPassion(e.target.value)}
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400"
                onKeyPress={(e) => e.key === 'Enter' && addPassion()}
              />
              <button
                onClick={addPassion}
                className="flex items-center text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium px-3"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Unique Fact */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            💎 One Thing People Wouldn't Expect About Me
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            This is your chance to share something unique, surprising, or interesting! Maybe you speak 
            three languages, you've lived in different countries, you can solve a Rubik's cube in under 
            a minute, or you've read every book in a series. What makes you memorable?
          </p>
          <textarea
            placeholder="Share something unique, surprising, or interesting about yourself..."
            value={data.uniqueFact || ''}
            onChange={(e) => onUpdate({ uniqueFact: e.target.value })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};