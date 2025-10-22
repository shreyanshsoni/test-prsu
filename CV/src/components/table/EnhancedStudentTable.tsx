import React, { useState } from 'react';
import { Student } from '../../types';
import EnhancedProgressBar from './EnhancedProgressBar';
import Sparkline from './Sparkline';
import StatusBadge from './StatusBadge';
import StudentDetailModal from '../modals/StudentDetailModal';

interface EnhancedStudentTableProps {
  students: Student[];
}

const EnhancedStudentTable: React.FC<EnhancedStudentTableProps> = ({ students }) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roadmap Progress
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matrix Trend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student, index) => (
                <tr 
                  key={student.id} 
                  className={`hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        src={student.avatar} 
                        alt={student.name} 
                        className="w-10 h-10 rounded-full object-cover mr-4" 
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.roadmapStage} Stage</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-medium text-gray-900">{student.grade}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <EnhancedProgressBar progress={student.progress} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center">
                      <Sparkline data={student.scoreHistory} />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{student.lastActivity} days ago</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <StatusBadge status={student.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </>
  );
};

export default EnhancedStudentTable;