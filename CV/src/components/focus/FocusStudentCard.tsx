import React, { useState } from 'react';
import { Student } from '../../types';
import Sparkline from '../table/Sparkline';
import EnhancedProgressBar from '../table/EnhancedProgressBar';
import StudentDetailModal from '../modals/StudentDetailModal';
import { MessageSquare } from 'lucide-react';

interface FocusStudentCardProps {
  student: Student;
}

const FocusStudentCard: React.FC<FocusStudentCardProps> = ({ student }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div 
        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-start space-x-3 mb-3">
          <img 
            src={student.avatar} 
            alt={student.name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {student.name}
            </h3>
            <p className="text-xs text-gray-500">
              Grade {student.grade}
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Progress</span>
              <span className="text-xs font-medium text-gray-700">{student.progress}%</span>
            </div>
            <EnhancedProgressBar progress={student.progress} />
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs text-gray-500">Trend</span>
              <div className="mt-1">
                <Sparkline data={student.scoreHistory} />
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">Last Activity</span>
              <p className="text-xs font-medium text-gray-700">
                {student.lastActivity} days ago
              </p>
            </div>
          </div>
          
          <button 
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
          >
            <MessageSquare className="w-3 h-3" />
            <span>Add Note</span>
          </button>
        </div>
      </div>

      {showModal && (
        <StudentDetailModal
          student={student}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default FocusStudentCard;