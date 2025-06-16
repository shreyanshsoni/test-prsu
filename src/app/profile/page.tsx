'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useUserProfile } from '../hooks/useUserProfile';
import { ProfilePage } from '../custom-user-profile/src/components/Profile/ProfilePage';
import { StudentData } from '../custom-user-profile/src/types/student';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { StarryBackground } from '../components/ui/StarryBackground';

export default function ProfilePageWrapper() {
  const { user, error, isLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const { 
    profileData,
    isLoading: isProfileLoading,
    updateProfileFields,
    fetchUserProfile
  } = useUserProfile();
  
  // Initialize student data with default values (important to match the structure used in StudentSnapshotFlow)
  const [studentData, setStudentData] = useState<Partial<StudentData>>({
    firstName: '',
    lastName: '',
    gradeLevel: '',
    schoolType: '',
    gpa: { weighted: '', unweighted: '' },
    classRank: '',
    standardizedTests: [],
    advancedClasses: [],
    academicAwards: [],
    extracurriculars: [],
    workExperience: [],
    familyResponsibilities: [],
    projects: [],
    passions: [],
    uniqueFact: '',
    careerGoals: [],
    collegeGoals: [],
    interests: [],
    opportunityTypes: []
  });

  // Track save state
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load profile data when the component mounts - force refresh the data
  useEffect(() => {
    if (isClient && user) {
      // Force refresh profile data
      fetchUserProfile(true);
    }
  }, [isClient, user, fetchUserProfile]);

  // Load profile data when it becomes available
  useEffect(() => {
    if (profileData && !isProfileLoading) {
      console.log("Loading profile data:", profileData);
      setStudentData(prevData => ({
        ...prevData,
        ...profileData
      }));
    }
  }, [profileData, isProfileLoading]);

  if (!isClient) {
    return null; // Prevent SSR issues
  }

  if (isLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:bg-gray-900 flex items-center justify-center">
        {theme === 'dark' && <StarryBackground />}
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="dark:text-gray-200">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        {theme === 'dark' && <StarryBackground />}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{error.message}</p>
          <Link 
            href="/"
            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        {theme === 'dark' && <StarryBackground />}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 dark:text-white">Authentication Required</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-4">Please log in to view your profile.</p>
          <div className="flex space-x-4">
            <Link 
              href="/"
              className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
            <a 
              href="/api/auth/login" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Log In
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Update function that saves changes to the backend
  const handleUpdateData = async (updatedData: StudentData) => {
    try {
      setIsSaving(true);
      const result = await updateProfileFields(updatedData, true);
      
      if (result) {
        setStudentData(updatedData);
        toast.success('Profile updated successfully', {
          position: 'bottom-right',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile', {
        position: 'bottom-right',
        duration: 3000
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Use the detailed ProfilePage component with proper data
  return (
    <div className={`${theme === 'dark' ? '!bg-gray-900' : ''} min-h-screen`} 
      style={theme === 'dark' ? {backgroundColor: '#111827'} : {}}>
      <style jsx global>{`
        html.dark body {
          background-color: #111827 !important; /* bg-gray-900 */
        }
        
        /* Add this to override any other background colors in dark mode */
        html.dark .min-h-screen.bg-gradient-to-br {
          background: #111827 !important;
          background-image: none !important;
        }
      `}</style>
      {theme === 'dark' && <StarryBackground />}
      <ProfilePage
        data={studentData}
        onUpdate={handleUpdateData}
        onBack={() => router.push('/')}
      />
    </div>
  );
} 