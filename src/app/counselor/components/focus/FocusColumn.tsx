import React from 'react';
import { Student } from '../../../types/counselor';
import FocusStudentCard from './FocusStudentCard';
import { useTheme } from '../../../contexts/ThemeContext';

interface FocusColumnProps {
  title: string;
  emoji: string;
  students: Student[];
  bgColor: string;
  borderColor: string;
}

const FocusColumn: React.FC<FocusColumnProps> = ({ 
  title, 
  emoji, 
  students, 
  bgColor, 
  borderColor 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className={`${bgColor} ${borderColor} border rounded-xl p-4 min-h-[600px]`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-gray-900'} flex items-center`}>
          <span className="mr-2">{emoji}</span>
          {title}
        </h2>
        <span className={`${isDark ? 'bg-dark-card text-dark-text' : 'bg-white text-gray-600'} px-2 py-1 rounded-full text-sm font-medium`}>
          {students.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {students.map(student => (
          <FocusStudentCard key={student.id} student={student} />
        ))}
        
        {students.length === 0 && (
          <div className={`text-center py-8 ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
            <p className="text-sm">No students in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusColumn;
