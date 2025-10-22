import React from 'react';
import { Student } from '../../types';
import FocusStudentCard from './FocusStudentCard';

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
  return (
    <div className={`${bgColor} ${borderColor} border rounded-xl p-4 min-h-[600px]`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">{emoji}</span>
          {title}
        </h2>
        <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-600">
          {students.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {students.map(student => (
          <FocusStudentCard key={student.id} student={student} />
        ))}
        
        {students.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No students in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusColumn;