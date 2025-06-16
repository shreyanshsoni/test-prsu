import { useProgramManagement } from './useProgramManagement';
import { useState, useEffect } from 'react';

export function useApplicationChecklist() {
  const { checklist, handleUpdateStatus } = useProgramManagement();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (process.env.NODE_ENV === 'development') {
    console.warn = () => {};
  }

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return { checklist, handleUpdateStatus };
}   