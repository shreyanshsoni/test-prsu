import React, { useState } from 'react';
import { Student } from '../../../types/counselor';
import { useTheme } from '../../../contexts/ThemeContext';

interface StudentsByStageProps {
  students: Student[];
}

const StudentsByStage: React.FC<StudentsByStageProps> = ({ students }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  
  const studentsByStage = students.reduce((acc, student) => {
    // Use roadmapStage (based on completion percentage)
    const stage = (student as any).roadmapStage || 'Early';
    if (!acc[stage]) {
      acc[stage] = [];
    }
    acc[stage].push(student);
    return acc;
  }, {} as Record<string, Student[]>);

  const stageOrder = ['Early', 'Mid', 'Late'];
  const stageEmojis = {
    'Early': '🌱',
    'Mid': '🌿', 
    'Late': '🌳'
  };

  const toggleStageExpansion = (stage: string) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stage)) {
      newExpanded.delete(stage);
    } else {
      newExpanded.add(stage);
    }
    setExpandedStages(newExpanded);
  };

  return (
    <div className="space-y-6">
      {stageOrder.map((stage) => {
        const stageStudents = studentsByStage[stage] || [];
        const isExpanded = expandedStages.has(stage);
        const showAllStudents = isExpanded || stageStudents.length <= 4;
        const studentsToShow = showAllStudents ? stageStudents : stageStudents.slice(0, 4);
        
        return (
          <div key={stage}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-medium ${isDark ? 'text-dark-text' : 'text-gray-900'} flex items-center`}>
                <span className="mr-2">{stageEmojis[stage]}</span>
                {stage} Stage ({stageStudents.length})
              </h3>
              {stageStudents.length > 4 && (
                <button
                  onClick={() => toggleStageExpansion(stage)}
                  className={`text-xs px-2 py-1 rounded-md transition-colors ${
                    isDark 
                      ? 'text-dark-muted hover:text-dark-text hover:bg-dark-card' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {isExpanded ? 'Show Less' : `+${stageStudents.length - 4} more`}
                </button>
              )}
            </div>
            
            <div className={`space-y-2 ${!showAllStudents ? '' : 'max-h-96 overflow-y-auto'}`}>
              {stageStudents.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-500'} italic`}>No students in this stage</p>
              ) : (
                studentsToShow.map((student) => {
                  const studentData = student as any;
                  const rawGrade = studentData.grade || 'N/A';
                  const progress = studentData.progress || 0;
                  const totalRoadmaps = studentData.totalRoadmaps || 0;
                  const completedRoadmaps = studentData.completedRoadmaps || 0;
                  
                  // Extract grade number from "10th Grade" -> "10"
                  let grade = 'N/A';
                  if (rawGrade && rawGrade !== 'N/A') {
                    const gradeMatch = rawGrade.match(/(\d+)/);
                    grade = gradeMatch ? gradeMatch[1] : 'N/A';
                  }
                  
                  // Calculate completion percentage
                  const completionText = totalRoadmaps > 0 
                    ? `${Math.round((completedRoadmaps / totalRoadmaps) * 100)}% complete`
                    : 'No roadmaps';
                  
                  return (
                    <div key={student.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-opacity-50 transition-colors">
                      <div className="flex-shrink-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                          isDark ? 'bg-dark-card text-dark-text' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isDark ? 'text-dark-text' : 'text-gray-900'} truncate`}>
                          {student.name}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                          Grade {grade} • {completionText}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StudentsByStage;
