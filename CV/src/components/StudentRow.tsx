import React from 'react';
import { Student } from '../types';
import ProgressBar from './ProgressBar';

interface StudentRowProps {
  student: Student;
}

const StudentRow: React.FC<StudentRowProps> = ({ student }) => {
  const { name, avatar, grade, collegeGoal, lastActivity, progress } = student;

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
      <td className="py-4 pl-4 pr-2">
        <div className="flex items-center">
          <img 
            src={avatar} 
            alt={name} 
            className="w-10 h-10 rounded-full object-cover mr-4" 
          />
          <span className="font-medium">{name}</span>
        </div>
      </td>
      <td className="py-4 px-2 text-center">{grade}</td>
      <td className="py-4 px-2">{collegeGoal}</td>
      <td className="py-4 px-2">{lastActivity} days ago</td>
      <td className="py-4 px-2">
        <ProgressBar progress={progress} />
      </td>
    </tr>
  );
};

export default StudentRow;