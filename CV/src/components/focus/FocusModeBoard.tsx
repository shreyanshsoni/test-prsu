import React from 'react';
import { Student } from '../../types';
import FocusColumn from './FocusColumn';

interface FocusModeBoardProps {
  students: Student[];
}

const FocusModeBoard: React.FC<FocusModeBoardProps> = ({ students }) => {
  const atRiskStudents = students.filter(student => student.status === 'At Risk');
  const needsAttentionStudents = students.filter(student => student.status === 'Needs Attention');
  const onTrackStudents = students.filter(student => student.status === 'On Track');

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Focus Mode</h1>
        <p className="text-gray-600 mt-2">Prioritize students who need attention or recognition</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FocusColumn
          title="At Risk"
          emoji="🔴"
          students={atRiskStudents}
          bgColor="bg-red-50"
          borderColor="border-red-200"
        />
        <FocusColumn
          title="Needs Attention"
          emoji="🟡"
          students={needsAttentionStudents}
          bgColor="bg-yellow-50"
          borderColor="border-yellow-200"
        />
        <FocusColumn
          title="On Track"
          emoji="🟢"
          students={onTrackStudents}
          bgColor="bg-green-50"
          borderColor="border-green-200"
        />
      </div>
    </div>
  );
};

export default FocusModeBoard;