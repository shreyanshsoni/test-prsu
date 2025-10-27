import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface NameCheckResult {
  hasName: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useNameCheck() {
  const { user, isLoading: authLoading } = useAuth();
  const [nameCheck, setNameCheck] = useState<NameCheckResult>({
    hasName: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    if (!authLoading && user) {
      checkUserName();
    } else if (!authLoading && !user) {
      setNameCheck({
        hasName: false,
        isLoading: false,
        error: null
      });
    }
  }, [authLoading, user]);

  const checkUserName = async () => {
    try {
      setNameCheck(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/user-profile', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      
      // Check if user has both first and last names
      const hasName = data.profile && 
        data.profile.first_name && 
        data.profile.last_name &&
        data.profile.first_name.trim() !== '' &&
        data.profile.last_name.trim() !== '';

      setNameCheck({
        hasName,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error checking user name:', error);
      setNameCheck({
        hasName: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  return {
    ...nameCheck,
    refetch: checkUserName
  };
}
