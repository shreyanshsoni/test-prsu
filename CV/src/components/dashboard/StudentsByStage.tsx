import React from 'react';
import { Student } from '../../types';

interface StudentsByStageProps {
  students: Student[];
}

const StudentsByStage: React.FC<StudentsByStageProps> = ({ students }) => {
  const studentsByStage = students.reduce((acc, student) => {
    if (!acc[student.roadmapStage]) {
      acc[student.roadmapStage] = [];
    }
    acc[student.roadmapStage].push(student);
    return acc;
  }, {} as Record<string, Student[]>);

  const stageOrder = ['Early', 'Mid', 'Late'];
  const stageEmojis = {
    'Early': '🌱',
    'Mid': '🌿', 
    'Late': '🌳'
  };

  return (
    <div className="space-y-6">
      {stageOrder.map((stage) => {
        const stageStudents = studentsByStage[stage] || [];
        return (
          <div key={stage}>
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <span className="mr-2">{stageEmojis[stage]}</span>
              {stage} Stage ({stageStudents.length})
            </h3>
            <div className="space-y-2">
              {stageStudents.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No students in this stage</p>
              ) : (
                stageStudents.slice(0, 4).map((student) => (
                  <div key={student.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <img 
                        src={student.avatar} 
                        alt={student.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Grade {student.grade} • {student.progress}% complete
                      </p>
                    </div>
                  </div>
                ))
              )}
              {stageStudents.length > 4 && (
                <p className="text-xs text-gray-500 pl-10">
                  +{stageStudents.length - 4} more students
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StudentsByStage;