import { useState, useEffect } from 'react';
import { useAuth } from '../app/hooks/useAuth';

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  user_role: string | null;
}

export function useNameModal() {
  const { user, isAuthenticated } = useAuth();
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserProfile = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        // First, auto-assign student role
        const roleResponse = await fetch('/api/auto-assign-student-role', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          
          // Check if user needs to fill in names
          if (roleData.needs_name) {
            setShouldShowModal(true);
          } else {
            setShouldShowModal(false);
          }
        } else {
          console.error('Failed to assign student role:', roleResponse.statusText);
          setShouldShowModal(false);
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
        setShouldShowModal(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserProfile();
  }, [isAuthenticated, user]);

  return {
    shouldShowModal,
    isLoading,
    user
  };
}
