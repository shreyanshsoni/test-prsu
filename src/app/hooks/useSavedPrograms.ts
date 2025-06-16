import { useProgramManagement } from './useProgramManagement';

export function useSavedPrograms() {
  const { programs, handleSaveProgram, handleRemoveProgram } = useProgramManagement();

  return { programs, handleSaveProgram, handleRemoveProgram };
}