import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { StudentData } from '../../types/student';
import { IntroScreen } from './IntroScreen';
import { ProgressIndicator } from './ProgressIndicator';
import { PreviewCard } from './PreviewCard';
import { Summary } from './Summary';
import { WhereIAm } from './sections/WhereIAm';
import { WhatIveDone } from './sections/WhatIveDone';
import { HowISpendTime } from './sections/HowISpendTime';
import { WhatImProudOf } from './sections/WhatImProudOf';
import { WhatImWorkingToward } from './sections/WhatImWorkingToward';
import { useUserProfile } from '../../../../hooks/useUserProfile';
import { useAuth } from '../../../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../../../contexts/ThemeContext';

export const StudentSnapshotFlow: React.FC = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    profileData,
    isLoading: isProfileLoading,
    error: profileError,
    updateProfileFields
  } = useUserProfile();
  
  // Track whether there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Use a ref to keep track of saving state to prevent infinite loops
  const isSavingRef = useRef(false);
  
  // Ref to track summary view
  const showingSummary = useRef(false);
  
  const [studentData, setStudentData] = useState<Partial<StudentData>>({
    gpa: { weighted: '', unweighted: '' },
    standardizedTests: [],
    advancedClasses: [],
    academicAwards: [],
    extracurriculars: [],
    workExperience: [],
    familyResponsibilities: [],
    projects: [],
    passions: [],
    careerGoals: [],
    collegeGoals: [],
    interests: [],
    opportunityTypes: []
  });
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Load saved profile data when available
  useEffect(() => {
    if (profileData && !isProfileLoading) {
      setStudentData(prevData => ({
        ...prevData,
        ...profileData
      }));
    }
  }, [profileData, isProfileLoading]);

  const sections = [
    { component: WhereIAm, title: 'Where I Am', key: 'whereIAm' },
    { component: WhatIveDone, title: 'What I\'ve Done', key: 'whatIveDone' },
    { component: HowISpendTime, title: 'Time & Activities', key: 'howISpendTime' },
    { component: WhatImProudOf, title: 'What I\'m Proud Of', key: 'whatImProudOf' },
    { component: WhatImWorkingToward, title: 'Working Toward', key: 'whatImWorkingToward' }
  ];

  const [completedSections, setCompletedSections] = useState<boolean[]>(
    new Array(sections.length).fill(false)
  );

  // Check if current section has data
  useEffect(() => {
    const checkSectionCompletion = () => {
      const newCompleted = [...completedSections];
      
      // Where I Am - basic info
      newCompleted[0] = !!(studentData.gradeLevel || studentData.schoolType || 
                          studentData.gpa?.unweighted || studentData.gpa?.weighted);
      
      // What I've Done - achievements
      newCompleted[1] = !!(studentData.standardizedTests?.length || 
                          studentData.advancedClasses?.length || 
                          studentData.academicAwards?.length);
      
      // How I Spend Time - activities
      newCompleted[2] = !!(studentData.extracurriculars?.length || 
                          studentData.workExperience?.length || 
                          studentData.familyResponsibilities?.length);
      
      // What I'm Proud Of - projects & passions
      newCompleted[3] = !!(studentData.projects?.length || 
                          studentData.passions?.length || 
                          studentData.uniqueFact);
      
      // What I'm Working Toward - goals
      newCompleted[4] = !!(studentData.careerGoals?.length || 
                          studentData.collegeGoals?.length || 
                          studentData.interests?.length || 
                          studentData.opportunityTypes?.length);
      
      setCompletedSections(newCompleted);
    };

    checkSectionCompletion();
  }, [studentData]);

  // Update local state without immediate database save
  const updateStudentData = (newData: Partial<StudentData>) => {
    // Only update local state for immediate UI feedback
    setStudentData(prev => ({ ...prev, ...newData }));
    setHasUnsavedChanges(true);
  };

  // Save data to database when transitioning between sections
  const saveData = async () => {
    // Prevent duplicate saves or infinite loops
    if (!hasUnsavedChanges || isSavingRef.current) return;
    
    try {
      // Mark as saving to prevent re-entry
      isSavingRef.current = true;
      
      const result = await updateProfileFields(studentData);
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
      console.error('Error saving profile data:', error);
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
    } finally {
      // Reset saving state
      isSavingRef.current = false;
    }
  };

  const nextStep = async () => {
    // If on last section and not completed, redirect to home instead of showing summary
    if (currentStep === sections.length - 1 && !isCompleted) {
      // Save data silently in the background before redirecting
      if (hasUnsavedChanges) {
        await saveData();
      }
      // Redirect to home page
      router.push('/students');
      return;
    }
    
    if (currentStep < sections.length) {
      // Save data silently in the background before moving to next step
      if (hasUnsavedChanges) {
        await saveData();
      }
      
      // Don't wait for save to complete - immediately update UI
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      // Save data silently in the background before moving to previous step
      if (hasUnsavedChanges) {
        saveData();
      }
      
      // Don't wait for save to complete - immediately update UI
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    // Save data silently when changing steps
    if (hasUnsavedChanges) {
      saveData();
    }
    
    // Don't wait for save to complete - immediately update UI
    setCurrentStep(step);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleStartFlow = () => {
    setShowIntro(false);
  };

  const handleSkipIntro = () => {
    // Save user preference to skip profile creation
    localStorage.setItem('skipProfileCreation', 'true');
    
    // Navigate to the students dashboard when "Remind me later" is clicked
    router.push('/students');
  };

  const isCompleted = completedSections.every(Boolean);

  const handleBackNavigation = () => {
    // If there are unsaved changes, save them before navigating
    if (hasUnsavedChanges && !isSavingRef.current) {
      saveData().then(() => {
        router.back();
      });
    } else {
      router.back();
    }
  };

  // Only show loading when initially fetching profile data, not during updates
  if (isAuthLoading || (isProfileLoading && !profileData)) {
    return (
      <div 
        style={theme === 'dark' ? {background: 'transparent'} : {}} 
        className="min-h-screen flex items-center justify-center p-8"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="dark:text-gray-200">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show intro screen first
  if (showIntro) {
    return <IntroScreen onStart={handleStartFlow} onSkip={handleSkipIntro} />;
  }

  // If all sections are completed and we're past the last section, show summary
  if (currentStep >= sections.length && isCompleted) {
    // Use a ref to prevent infinite loops when showing summary
    if (hasUnsavedChanges && !isSavingRef.current && !showingSummary.current) {
      showingSummary.current = true;
      saveData().then(() => {
        // Reset flag after save completes
        showingSummary.current = false;
      });
    }
    
    return (
      <div 
        style={theme === 'dark' ? {background: 'transparent'} : {}}
        className="min-h-screen py-8 px-4"
      >
        <Summary 
          data={studentData as StudentData} 
          onEdit={() => {
            showingSummary.current = false; // Reset flag when editing
            setCurrentStep(0);
          }} 
        />
      </div>
    );
  }

  const CurrentSection = currentStep < sections.length ? sections[currentStep].component : null;

  return (
    <div 
      style={theme === 'dark' ? {background: 'transparent'} : {}}
      className="min-h-screen py-8 px-4"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header with back button only */}
        <div className="flex justify-start items-center mb-6">
          <button
            onClick={handleBackNavigation}
            className="flex items-center p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator
          currentStep={currentStep}
          completedSections={completedSections}
          sectionTitles={sections.map(s => s.title)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {CurrentSection && (
              <div className="animate-fade-in">
                <CurrentSection
                  data={studentData}
                  onUpdate={updateStudentData}
                />
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 max-w-2xl mx-auto">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                  currentStep === 0
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm'
                }`}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </button>

              <div className="flex space-x-2">
                {sections.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToStep(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentStep
                        ? 'bg-indigo-500'
                        : completedSections[index]
                          ? 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextStep}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg"
              >
                {currentStep === sections.length - 1 && isCompleted ? 'View Summary' : 
                 currentStep === sections.length - 1 ? 'Finish Later' : 'Next'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>

          {/* Preview Sidebar */}
          <div className="lg:col-span-1">
            <PreviewCard
              data={studentData}
              onCopy={handleCopy}
              copiedFormat={copiedText}
              onSectionClick={goToStep}
              currentStep={currentStep}
            />
          </div>
        </div>
      </div>
    </div>
  );
};