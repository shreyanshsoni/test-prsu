import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface UserRole {
  role: 'student' | 'counselor' | 'admin' | null;
  isLoading: boolean;
  error: string | null;
}

export function useUserRole() {
  const { user, isLoading: authLoading } = useAuth();
  const [roleData, setRoleData] = useState<UserRole>({
    role: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchUserRole();
    } else if (!authLoading && !user) {
      setRoleData({
        role: null,
        isLoading: false,
        error: null
      });
    }
  }, [authLoading, user]);

  const fetchUserRole = async () => {
    try {
      setRoleData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/user-roles', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user role');
      }

      const data = await response.json();
      setRoleData({
        role: data.role,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRoleData({
        role: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const setUserRole = async (role: 'student' | 'counselor' | 'admin') => {
    try {
      setRoleData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/user-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error('Failed to set user role');
      }

      const data = await response.json();
      setRoleData({
        role: data.role,
        isLoading: false,
        error: null
      });

      return true;
    } catch (error) {
      console.error('Error setting user role:', error);
      setRoleData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
      return false;
    }
  };

  return {
    ...roleData,
    setUserRole,
    refetch: fetchUserRole
  };
}


