import React, { useState } from 'react';
import { Student } from '../../../types/counselor';
import EnhancedProgressBar from './EnhancedProgressBar';
import Sparkline from './Sparkline';
import StatusBadge from './StatusBadge';
import StudentDetailModal from '../modals/StudentDetailModal';
import { useTheme } from '../../../contexts/ThemeContext';

interface EnhancedStudentTableProps {
  students: Student[];
}

const EnhancedStudentTable: React.FC<EnhancedStudentTableProps> = ({ students }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  return (
    <>
      <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
            <thead className={isDark ? 'bg-dark-border' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-dark-muted' : 'text-gray-500'} uppercase tracking-wider`}>
                  Student
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium ${isDark ? 'text-dark-muted' : 'text-gray-500'} uppercase tracking-wider`}>
                  Grade
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-dark-muted' : 'text-gray-500'} uppercase tracking-wider`}>
                  Roadmap Progress
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium ${isDark ? 'text-dark-muted' : 'text-gray-500'} uppercase tracking-wider`}>
                  Matrix Trend
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-dark-muted' : 'text-gray-500'} uppercase tracking-wider`}>
                  Last Activity
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium ${isDark ? 'text-dark-muted' : 'text-gray-500'} uppercase tracking-wider`}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody className={`${isDark ? 'bg-dark-card' : 'bg-white'} divide-y divide-gray-200 dark:divide-dark-border`}>
              {students.map((student, index) => (
                <tr 
                  key={student.id} 
                  className={`${isDark ? 'hover:bg-dark-border' : 'hover:bg-gray-50'} cursor-pointer transition-colors duration-150 ${
                    index % 2 === 0 ? (isDark ? 'bg-dark-card' : 'bg-white') : (isDark ? 'bg-dark-background' : 'bg-gray-50/30')
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
                        <div className={`text-sm font-medium ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>{student.name}</div>
                        <div className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>{student.roadmapStage} Stage</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`text-sm font-medium ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>{student.grade}</span>
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
                    <span className={`text-sm ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>{student.lastActivity} days ago</span>
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
