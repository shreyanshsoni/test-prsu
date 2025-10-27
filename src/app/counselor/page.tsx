'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { useUserRole } from '../hooks/useUserRole';
import { NameModal } from '../../components/NameModal';
import { useCounselorStudents } from '../hooks/useCounselorStudents';
import { useTheme } from '../contexts/ThemeContext';
import { StarryBackground } from '../../components/ui/StarryBackground';

// Import counselor components from new location
import Navigation from './components/Navigation';
import DashboardOverview from './components/dashboard/DashboardOverview';
import Header from './components/Header';
import Filters from './components/Filters';
import EnhancedStudentTable from './components/table/EnhancedStudentTable';
import GoalsOverview from './components/dashboard/GoalsOverview';
import FocusModeBoard from './components/focus/FocusModeBoard';

// Import types and data
import { Student, FilterType, ViewMode } from '../../types/counselor';

export default function CounselorDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const [showNameModal, setShowNameModal] = useState(false);
  const [hasName, setHasName] = useState(true); // Default to true to prevent premature modal
  const [isNameLoading, setIsNameLoading] = useState(false);
  const { students, isLoading: isStudentsLoading, error: studentsError } = useCounselorStudents();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isClient, setIsClient] = useState(false);

  // Function to check if user has names (only called after role confirmation)
  const checkUserNames = async () => {
    setIsNameLoading(true);
    try {
      const response = await fetch('/api/user-profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const profileData = await response.json();
        const profile = profileData.profile;
        
        // Check if user has both first and last names
        const hasName = profile && 
          profile.first_name && 
          profile.last_name &&
          profile.first_name.trim() !== '' &&
          profile.last_name.trim() !== '';
        
        setHasName(hasName);
        if (!hasName) {
          setShowNameModal(true);
        }
      }
    } catch (error) {
      console.error('Error checking user names:', error);
    } finally {
      setIsNameLoading(false);
    }
  };

  // Get current tab from URL, default to 'dashboard'
  const currentTab = searchParams.get('tab') || 'dashboard';
  
  // State for counselor dashboard
  const [focusModeEnabled, setFocusModeEnabled] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<FilterType>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Handle tab changes by updating URL
  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    if (tab === 'dashboard') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    router.push(`/counselor?${params.toString()}`);
  };

  // Filter students based on selected filters
  const filteredStudents = students.filter(student => {
    const gradeMatch = selectedGrade === 'All' || student.grade === selectedGrade;
    const searchMatch = searchTerm === '' || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.collegeGoal.toLowerCase().includes(searchTerm.toLowerCase());
    return gradeMatch && searchMatch;
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Check if user is authenticated and has the counselor role
    if (isClient && !isLoading && !isRoleLoading) {
      if (!isAuthenticated) {
        router.push('/');
        return;
      }

      // Check role from database instead of localStorage
      if (role !== 'counselor') {
        router.push('/');
        return;
      }

      // Check if user has first and last names (only after confirming counselor role)
      checkUserNames();
    }
  }, [isClient, isLoading, isRoleLoading, isAuthenticated, role, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const renderContent = () => {
    if (currentTab === 'dashboard') {
      return <DashboardOverview />;
    }
    
    if (currentTab === 'goals') {
      return (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>Academic Goals Overview</h1>
            <p className={`${isDark ? 'text-dark-muted' : 'text-gray-600'} mt-2`}>Track student goal setting and completion across all categories</p>
          </div>
          <GoalsOverview students={filteredStudents} />
        </div>
      );
    }
    
    if (currentTab === 'students') {
      if (focusModeEnabled) {
        return <FocusModeBoard students={filteredStudents} />;
      }
      
      return (
        <div className="max-w-7xl mx-auto px-6">
          <Header />
          <Filters
            selectedGrade={selectedGrade}
            searchTerm={searchTerm}
            onGradeChange={setSelectedGrade}
            onSearchChange={setSearchTerm}
          />
          <EnhancedStudentTable students={filteredStudents} />
        </div>
      );
    }
    
    // Default fallback
    return <DashboardOverview />;
  };

  if (!isClient || isLoading || isRoleLoading || isStudentsLoading || !isAuthenticated || role !== 'counselor') {
    return null;
  }

  // Show error state if there's an error fetching students
  if (studentsError) {
    return (
      <div className={`min-h-screen relative ${isDark ? 'bg-dark-background' : 'bg-gray-50'}`}>
        {isDark && <StarryBackground />}
        <div className="flex items-center justify-center min-h-screen">
          <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} border rounded-xl shadow-sm p-8 max-w-md mx-4`}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-4`}>
              Error Loading Students
            </h2>
            <p className={`${isDark ? 'text-dark-muted' : 'text-gray-600'} mb-4`}>
              {studentsError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className={`px-4 py-2 ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg transition-colors`}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative ${isDark ? 'bg-dark-background' : 'bg-gray-50'}`}>
      {isDark && <StarryBackground />}
      
      <Navigation
        currentTab={currentTab}
        onTabChange={handleTabChange}
        focusModeEnabled={focusModeEnabled}
        onFocusModeToggle={() => setFocusModeEnabled(!focusModeEnabled)}
        onLogout={handleLogout}
      />
      
      {renderContent()}
      
      {/* Name Modal */}
      <NameModal
        isOpen={showNameModal}
        onClose={() => setShowNameModal(false)}
        redirectTo="/counselor"
      />
    </div>
  );
} 