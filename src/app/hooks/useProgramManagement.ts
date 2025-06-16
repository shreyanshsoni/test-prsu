import { useState } from 'react';
import { Program, ChecklistItem } from '../types/types';

export function useProgramManagement() {
  const [programs, setPrograms] = useState<Program[]>([ /* ... initial program data ... */ ]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([ /* ... initial checklist data ... */ ]);

  const handleSaveProgram = (program: Program) => {
    setPrograms((prev) => [...prev, program]);
  };

  const handleRemoveProgram = (programId: string) => {
    setPrograms((prev) => prev.filter((program) => program.id !== programId));
  };

  const handleUpdateStatus = (taskId: string, status: 'not_started' | 'in_progress' | 'completed') => {
    setChecklist((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status } : task))
    );
  };

  return { programs, checklist, handleSaveProgram, handleRemoveProgram, handleUpdateStatus };
} 