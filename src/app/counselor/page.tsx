'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { useUserRole } from '../hooks/useUserRole';
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
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const { students, isLoading: isStudentsLoading, error: studentsError } = useCounselorStudents();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isClient, setIsClient] = useState(false);

  // State for counselor dashboard
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [focusModeEnabled, setFocusModeEnabled] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<FilterType>('All');
  const [searchTerm, setSearchTerm] = useState('');

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
        console.log('User is not a counselor, redirecting to role selection');
        router.push('/role-selection');
      }
    }
  }, [isClient, isLoading, isRoleLoading, isAuthenticated, role, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const renderContent = () => {
    if (currentView === 'dashboard') {
      return <DashboardOverview />;
    }
    
    if (currentView === 'goals') {
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
        currentView={currentView}
        onViewChange={setCurrentView}
        focusModeEnabled={focusModeEnabled}
        onFocusModeToggle={() => setFocusModeEnabled(!focusModeEnabled)}
        onLogout={handleLogout}
      />
      
      {renderContent()}
    </div>
  );
} 