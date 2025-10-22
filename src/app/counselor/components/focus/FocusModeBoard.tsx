import React from 'react';
import { Student } from '../../../types/counselor';
import FocusColumn from './FocusColumn';
import { useTheme } from '../../../contexts/ThemeContext';

interface FocusModeBoardProps {
  students: Student[];
}

const FocusModeBoard: React.FC<FocusModeBoardProps> = ({ students }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const atRiskStudents = students.filter(student => student.status === 'At Risk');
  const needsAttentionStudents = students.filter(student => student.status === 'Needs Attention');
  const onTrackStudents = students.filter(student => student.status === 'On Track');

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>Focus Mode</h1>
        <p className={`${isDark ? 'text-dark-muted' : 'text-gray-600'} mt-2`}>Prioritize students who need attention or recognition</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FocusColumn
          title="At Risk"
          emoji="🔴"
          students={atRiskStudents}
          bgColor={isDark ? 'bg-red-900/20' : 'bg-red-50'}
          borderColor={isDark ? 'border-red-800' : 'border-red-200'}
        />
        <FocusColumn
          title="Needs Attention"
          emoji="🟡"
          students={needsAttentionStudents}
          bgColor={isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'}
          borderColor={isDark ? 'border-yellow-800' : 'border-yellow-200'}
        />
        <FocusColumn
          title="On Track"
          emoji="🟢"
          students={onTrackStudents}
          bgColor={isDark ? 'bg-green-900/20' : 'bg-green-50'}
          borderColor={isDark ? 'border-green-800' : 'border-green-200'}
        />
      </div>
    </div>
  );
};

export default FocusModeBoard;
