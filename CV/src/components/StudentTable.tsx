import React from 'react';
import { Student } from '../types';
import StudentRow from './StudentRow';

interface StudentTableProps {
  students: Student[];
}

const StudentTable: React.FC<StudentTableProps> = ({ students }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="py-3 px-4 text-left">Student</th>
            <th className="py-3 px-2 text-center">Grade</th>
            <th className="py-3 px-2 text-left">College Goal</th>
            <th className="py-3 px-2 text-left">Last Activity</th>
            <th className="py-3 px-2 text-left">Progress</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <StudentRow key={student.id} student={student} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;