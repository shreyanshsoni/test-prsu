import React, { useState, useEffect } from 'react';
import { User, Camera, Save, X, Check, AlertCircle, Edit3, Undo2, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { StudentData } from '../../types/student';
import { EditableSection } from './EditableSection';
import { PersonalInfoSection } from './PersonalInfoSection';
import { ConfirmationModal } from './ConfirmationModal';
import { useAuth } from '../../../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useUserProfile } from '../../../../hooks/useUserProfile';
import { ProfileSection } from './ProfileSection';
import { useTheme } from '../../../../contexts/ThemeContext';

interface ProfilePageProps {
  data: StudentData;
  onUpdate: (data: StudentData) => void;
  onBack?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ data, onUpdate, onBack }) => {
  const { theme } = useTheme();
  const [editingData, setEditingData] = useState<StudentData>(data);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    academicProfile: true,
    activities: false,
    achievements: false,
    goals: false,
  });

  const { user, isAuthenticated } = useAuth();
  const { updateProfileFields } = useUserProfile();

  // Personal info state
  const [personalInfo, setPersonalInfo] = useState({
    name: 'Student', // Default, will be updated from database
    email: user?.email || 'example@email.com',
    profilePicture: user?.picture || null,
    firstName: '',
    lastName: ''
  });

  // Reset editing data when props data changes
  useEffect(() => {
    // Ensure we have a fresh copy of data for editing
    const dataCopy = JSON.parse(JSON.stringify(data || {}));
    setEditingData(dataCopy);
    setHasUnsavedChanges(false); // Reset unsaved changes when data is updated from parent
  }, [data]);

  // Update personal info when user data changes
  useEffect(() => {
    const updatePersonalInfo = async () => {
      if (!user) return;
      
      let displayName = 'Student'; // Default fallback
      let firstName = '';
      let lastName = '';
      
      // Fetch database names if authenticated
      if (isAuthenticated) {
        try {
          const response = await fetch('/api/user-profile', {
            credentials: 'include', // Include session cookies
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            const profile = data.profile;
            
            // Use database first_name and last_name (should always exist due to name modal)
            if (profile && profile.first_name && profile.last_name) {
              displayName = `${profile.first_name} ${profile.last_name}`;
              firstName = profile.first_name;
              lastName = profile.last_name;
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
      
      setPersonalInfo({
        name: displayName,
        email: user.email || personalInfo.email,
        profilePicture: user.picture || personalInfo.profilePicture,
        firstName,
        lastName
      });
    };
    
    updatePersonalInfo();
  }, [user, isAuthenticated]);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(editingData) !== JSON.stringify(data);
    setHasUnsavedChanges(hasChanges);
  }, [editingData, data]);

  // Auto-save functionality - now with a longer delay to avoid frequent saves
  useEffect(() => {
    if (hasUnsavedChanges && saveStatus === 'idle' && isAuthenticated) {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
      
      const timeout = setTimeout(() => {
        handleAutoSave();
      }, 5000); // Increased to 5 seconds to reduce frequency of saves
      
      setAutoSaveTimeout(timeout);
    }

    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [hasUnsavedChanges, editingData]);

  // Prevent navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleAutoSave = async () => {
    if (!hasUnsavedChanges || !isAuthenticated) return;
    
    // Don't show saving indicator for auto-save, just silently save
    try {
      // Update in database
      const result = await updateProfileFields(editingData);
      
      // Update parent component state
      onUpdate(editingData);
      
      setHasUnsavedChanges(false);
      
      // Show a small success toast in bottom right
      if (result) {
        toast.success('Changes saved', {
          position: 'bottom-right',
          duration: 2000,
          style: { 
            background: '#10B981', 
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '14px'
          },
          icon: '✓',
        });
      }
    } catch (error) {
      console.error('Error auto-saving profile:', error);
      // Show error toast in bottom right
      toast.error('Failed to save changes', {
        position: 'bottom-right',
        duration: 3000,
        style: {
          background: '#EF4444',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '14px'
        },
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!isAuthenticated) {
      // Update parent component state without showing warning
      onUpdate(editingData);
      return;
    }
    
    setSaveStatus('saving');
    try {
      // Update in database
      const result = await updateProfileFields(editingData, true);
      
      // Update parent component state
      onUpdate(editingData);
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      
      // Show a small success toast in bottom right
      if (result) {
        toast.success('Profile updated', {
          position: 'bottom-right',
          duration: 2000,
          style: { 
            background: '#10B981', 
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '14px'
          },
          icon: '✓',
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile', {
        position: 'bottom-right',
        duration: 3000,
        style: {
          background: '#EF4444',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '14px'
        },
      });
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleRevertChanges = () => {
    setEditingData(data);
    setSaveStatus('idle');
    
    // Show a confirmation toast
    toast('Changes reverted', {
      position: 'bottom-right',
      duration: 2000,
      style: { 
        background: '#6B7280', 
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '14px'
      },
      icon: '↩️',
    });
  };

  const handleNavigation = (navigationFn: () => void) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(() => navigationFn);
      setShowConfirmModal(true);
    } else {
      navigationFn();
    }
  };

  const confirmNavigation = () => {
    if (pendingNavigation) {
      pendingNavigation();
    }
    setShowConfirmModal(false);
    setPendingNavigation(null);
  };

  const updateSection = (sectionKey: keyof StudentData, value: any) => {
    setEditingData(prev => ({
      ...prev,
      [sectionKey]: value
    }));
  };

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving': return 'Saving...';
      case 'saved': return 'Saved!';
      case 'error': return 'Error - Retry';
      default: return 'Save Changes';
    }
  };

  const getSaveButtonIcon = () => {
    switch (saveStatus) {
      case 'saving': return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />;
      case 'saved': return <Check className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Save className="w-4 h-4" />;
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const handleInputChange = (
    field: keyof StudentData,
    value: any,
    nestedField?: string,
    index?: number,
    subfield?: string
  ) => {
    const updatedData = { ...editingData };

    if (nestedField && typeof index === 'number' && subfield) {
      // Handle nested arrays with objects (like extracurriculars[0].role)
      if (!updatedData[field]) {
        updatedData[field] = [];
      }
      
      const targetArray = updatedData[field] as any[];
      if (!targetArray[index]) {
        targetArray[index] = {};
      }
      
      targetArray[index][subfield] = value;
    } else if (nestedField && typeof index === 'number') {
      // Handle nested arrays (like standardizedTests[0])
      if (!updatedData[field]) {
        updatedData[field] = [];
      }
      
      const targetArray = updatedData[field] as any[];
      targetArray[index] = value;
    } else if (nestedField) {
      // Handle nested objects (like gpa.weighted)
      if (!updatedData[field]) {
        updatedData[field] = {};
      }
      
      (updatedData[field] as any)[nestedField] = value;
    } else {
      // Handle direct fields
      updatedData[field] = value;
    }

    setEditingData(updatedData);
  };

  const addItem = (field: keyof StudentData) => {
    const updatedData = { ...editingData };
    const currentArray = (updatedData[field] as any[]) || [];
    
    let newItem = {};
    
    // Set appropriate default structure based on field type
    switch(field) {
      case 'extracurriculars':
        newItem = { name: '', role: '', description: '', timeCommitment: '', years: [] };
        break;
      case 'workExperience':
        newItem = { position: '', employer: '', description: '', startDate: '', endDate: '' };
        break;
      case 'familyResponsibilities':
        newItem = { description: '', timeCommitment: '' };
        break;
      case 'projects':
        newItem = { name: '', description: '', skills: [] };
        break;
      case 'standardizedTests':
        newItem = { test: '', score: '', date: '' };
        break;
      case 'advancedClasses':
        newItem = { name: '', grade: '', level: '' };
        break;
      case 'academicAwards':
        newItem = { name: '', date: '', description: '' };
        break;
      case 'interests':
      case 'careerGoals':
      case 'collegeGoals':
      case 'opportunityTypes':
      case 'passions':
        newItem = '';
        break;
      default:
        newItem = {};
    }
    
    updatedData[field] = [...currentArray, newItem];
    setEditingData(updatedData);
  };

  const removeItem = (field: keyof StudentData, index: number) => {
    const updatedData = { ...editingData };
    const currentArray = updatedData[field] as any[];
    
    if (currentArray && Array.isArray(currentArray)) {
      currentArray.splice(index, 1);
      setEditingData(updatedData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:!bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-6">
            {onBack && (
              <button
                onClick={() => handleNavigation(onBack)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors mr-2"
                aria-label="Go back"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mr-4 flex items-center justify-center overflow-hidden">
                {personalInfo.profilePicture ? (
                  <img 
                    src={personalInfo.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <User className={`w-6 h-6 text-white ${personalInfo.profilePicture ? 'hidden' : ''}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Profile</h1>
                <p className="text-gray-600 dark:text-gray-300">{personalInfo.email}</p>
              </div>
            </div>
          </div>

          {/* Auto-save status - only show if explicitly saving/error, not during auto-save */}
          {saveStatus !== 'idle' && (
            <div className={`flex items-center text-sm mb-4 ${
              saveStatus === 'saved' ? 'text-green-600 dark:text-green-400' :
              saveStatus === 'error' ? 'text-red-600 dark:text-red-400' :
              'text-blue-600 dark:text-blue-400'
            }`}>
              {getSaveButtonIcon()}
              <span className="ml-2">
                {saveStatus === 'saving' && 'Saving your changes...'}
                {saveStatus === 'saved' && 'Changes saved successfully'}
                {saveStatus === 'error' && 'Failed to save changes'}
              </span>
            </div>
          )}

          {/* Save/Revert Actions */}
          {hasUnsavedChanges && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-800 dark:text-blue-200 text-sm flex-1">You have unsaved changes</span>
              <div className="flex gap-2">
                <button
                  onClick={handleRevertChanges}
                  className="flex items-center px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white text-sm transition-colors"
                >
                  <Undo2 className="w-4 h-4 mr-1" />
                  Revert
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={saveStatus === 'saving'}
                  className={`flex items-center px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    saveStatus === 'saving'
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : saveStatus === 'error'
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                  }`}
                >
                  {getSaveButtonIcon()}
                  <span className="ml-2">{getSaveButtonText()}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Personal Information */}
        <PersonalInfoSection
          personalInfo={personalInfo}
          onUpdate={setPersonalInfo}
          readOnly={!isAuthenticated}
        />

        {/* Academic Information Sections */}
        <div className="space-y-6">
          <EditableSection
            title="Where I Am"
            description="Your current academic standing and school information"
            icon="🎒"
            data={{
              gradeLevel: editingData.gradeLevel,
              schoolType: editingData.schoolType,
              gpa: editingData.gpa,
              classRank: editingData.classRank
            }}
            onUpdate={(newData) => {
              Object.keys(newData).forEach(key => {
                updateSection(key as keyof StudentData, newData[key]);
              });
            }}
            fields={[
              {
                key: 'gradeLevel',
                label: 'Grade Level',
                type: 'select',
                options: ['9th Grade', '10th Grade', '11th Grade', '12th Grade']
              },
              {
                key: 'schoolType',
                label: 'School Type',
                type: 'select',
                options: ['Public School', 'Private School', 'Charter School', 'Homeschool', 'Other']
              },
              {
                key: 'gpa.weighted',
                label: 'Weighted GPA',
                type: 'text',
                placeholder: 'e.g., 4.2'
              },
              {
                key: 'gpa.unweighted',
                label: 'Unweighted GPA',
                type: 'text',
                placeholder: 'e.g., 3.7'
              },
              {
                key: 'classRank',
                label: 'Class Rank (if known)',
                type: 'text',
                placeholder: 'e.g., Top 10% or 15 out of 300'
              }
            ]}
          />

          <EditableSection
            title="What I've Done"
            description="Your academic achievements and test scores"
            icon="📚"
            data={{
              standardizedTests: editingData.standardizedTests,
              advancedClasses: editingData.advancedClasses,
              academicAwards: editingData.academicAwards
            }}
            onUpdate={(newData) => {
              Object.keys(newData).forEach(key => {
                updateSection(key as keyof StudentData, newData[key]);
              });
            }}
            fields={[
              {
                key: 'standardizedTests',
                label: 'Standardized Tests',
                type: 'array',
                arrayType: 'object',
                objectFields: [
                  { key: 'type', label: 'Test Type', type: 'select', options: ['SAT', 'ACT', 'PSAT', 'AP', 'Other'] },
                  { key: 'score', label: 'Score', type: 'text', placeholder: 'e.g., 1450, 32, 5' },
                  { key: 'date', label: 'Date', type: 'text', placeholder: 'e.g., March 2024, Fall 2023' }
                ]
              },
              {
                key: 'advancedClasses',
                label: 'Advanced Classes',
                type: 'array',
                arrayType: 'object',
                objectFields: [
                  { key: 'type', label: 'Class Type', type: 'select', options: ['AP', 'IB', 'Dual Enrollment', 'Honors'] },
                  { key: 'subject', label: 'Subject', type: 'text', placeholder: 'e.g., Calculus, Biology, English' },
                  { key: 'score', label: 'Score', type: 'text', placeholder: 'e.g., A, 95, 4.0' }
                ]
              },
              {
                key: 'academicAwards',
                label: 'Academic Awards',
                type: 'array',
                arrayType: 'string',
                placeholder: 'e.g., Honor Roll, National Merit Scholar, Math Competition Winner'
              }
            ]}
          />

          <EditableSection
            title="How I Spend My Time"
            description="Your activities, work experience, and responsibilities"
            icon="⏰"
            data={{
              extracurriculars: editingData.extracurriculars,
              workExperience: editingData.workExperience,
              familyResponsibilities: editingData.familyResponsibilities
            }}
            onUpdate={(newData) => {
              Object.keys(newData).forEach(key => {
                updateSection(key as keyof StudentData, newData[key]);
              });
            }}
            fields={[
              {
                key: 'extracurriculars',
                label: 'Extracurricular Activities',
                type: 'array',
                arrayType: 'object',
                objectFields: [
                  { key: 'title', label: 'Activity', type: 'text', placeholder: 'e.g., Soccer Team, Drama Club, Student Council' },
                  { key: 'role', label: 'Role', type: 'text', placeholder: 'e.g., Captain, Member, President' },
                  { key: 'hoursPerWeek', label: 'Hours/Week', type: 'text', placeholder: 'e.g., 5-10, 15' },
                  { key: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g., 2 years, Since 9th grade' },
                  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'What do you do? Any achievements or impact?' }
                ]
              },
              {
                key: 'workExperience',
                label: 'Work Experience',
                type: 'array',
                arrayType: 'object',
                objectFields: [
                  { key: 'title', label: 'Job Title', type: 'text', placeholder: 'e.g., Cashier, Tutor, Intern' },
                  { key: 'company', label: 'Company', type: 'text', placeholder: 'e.g., McDonald\'s, Local Library, Tech Startup' },
                  { key: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g., Summer 2023, Weekends since 2022' },
                  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'What did you learn or accomplish?' }
                ]
              },
              {
                key: 'familyResponsibilities',
                label: 'Family Responsibilities',
                type: 'array',
                arrayType: 'string',
                placeholder: 'e.g., Watching younger siblings, Caregiving for grandparent'
              }
            ]}
          />

          <EditableSection
            title="What I'm Proud Of"
            description="Your projects, passions, and unique qualities"
            icon="✨"
            data={{
              projects: editingData.projects,
              passions: editingData.passions,
              uniqueFact: editingData.uniqueFact
            }}
            onUpdate={(newData) => {
              Object.keys(newData).forEach(key => {
                updateSection(key as keyof StudentData, newData[key]);
              });
            }}
            fields={[
              {
                key: 'projects',
                label: 'Projects',
                type: 'array',
                arrayType: 'object',
                objectFields: [
                  { key: 'title', label: 'Project Title', type: 'text', placeholder: 'e.g., Personal Website, Science Fair Project' },
                  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'What did you create? What problem did it solve? What impact did it have?' },
                  { key: 'skills', label: 'Skills', type: 'array', arrayType: 'string', placeholder: 'e.g., Research, Design, Leadership' }
                ]
              },
              {
                key: 'passions',
                label: 'Passions & Hobbies',
                type: 'array',
                arrayType: 'string',
                placeholder: 'e.g., Photography, Cooking, Gaming, Reading'
              },
              {
                key: 'uniqueFact',
                label: 'Something Unique About Me',
                type: 'textarea',
                placeholder: 'Share something unique, surprising, or interesting about yourself...'
              }
            ]}
          />

          <EditableSection
            title="What I'm Working Toward"
            description="Your goals, interests, and aspirations"
            icon="🎯"
            data={{
              careerGoals: editingData.careerGoals,
              collegeGoals: editingData.collegeGoals,
              interests: editingData.interests,
              opportunityTypes: editingData.opportunityTypes
            }}
            onUpdate={(newData) => {
              Object.keys(newData).forEach(key => {
                updateSection(key as keyof StudentData, newData[key]);
              });
            }}
            fields={[
              {
                key: 'careerGoals',
                label: 'Career Goals',
                type: 'array',
                arrayType: 'string',
                placeholder: 'e.g., Software Engineer, Doctor, Teacher, Entrepreneur'
              },
              {
                key: 'collegeGoals',
                label: 'College Goals',
                type: 'array',
                arrayType: 'string',
                placeholder: 'e.g., Study Computer Science, Attend a small liberal arts college'
              },
              {
                key: 'interests',
                label: 'Areas to Explore',
                type: 'array',
                arrayType: 'string',
                placeholder: 'e.g., Environmental Science, Creative Writing, Robotics'
              },
              {
                key: 'opportunityTypes',
                label: 'Opportunity Types',
                type: 'array',
                arrayType: 'string',
                placeholder: 'e.g., Internships, Mentorship, Study abroad, Research opportunities'
              }
            ]}
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <ConfirmationModal
          title="Unsaved Changes"
          message="You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost."
          confirmLabel="Leave Page"
          cancelLabel="Stay"
          onConfirm={() => confirmNavigation()}
          onCancel={() => {
            setShowConfirmModal(false);
            setPendingNavigation(null);
          }}
        />
      )}
    </div>
  );
};