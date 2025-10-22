import { useState, useEffect } from 'react';
import { Student } from '../../types/counselor';

export interface CounselorStudentsData {
  students: Student[];
  isLoading: boolean;
  error: string | null;
}

export function useCounselorStudents() {
  const [data, setData] = useState<CounselorStudentsData>({
    students: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/counselor-students', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const result = await response.json();
      setData({
        students: result.students || [],
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching counselor students:', error);
      setData({
        students: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  return {
    ...data,
    refetch: fetchStudents
  };
}

