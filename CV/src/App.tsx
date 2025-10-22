import React, { useState } from 'react';
import Navigation from './components/Navigation';
import DashboardOverview from './components/dashboard/DashboardOverview';
import Header from './components/Header';
import Filters from './components/Filters';
import EnhancedStudentTable from './components/table/EnhancedStudentTable';
import FocusModeBoard from './components/focus/FocusModeBoard';
import GoalsOverview from './components/dashboard/GoalsOverview';
import { Student, FilterType, ViewMode } from './types';
import { students as initialStudents } from './data/students';

function App() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
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


  const renderContent = () => {
    if (currentView === 'dashboard') {
      return <DashboardOverview />;
    }
    
    if (currentView === 'goals') {
      return (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Academic Goals Overview</h1>
            <p className="text-gray-600 mt-2">Track student goal setting and completion across all categories</p>
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
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        focusModeEnabled={focusModeEnabled}
        onFocusModeToggle={() => setFocusModeEnabled(!focusModeEnabled)}
      />
      
      {renderContent()}
    </div>
  );
}

export default App;