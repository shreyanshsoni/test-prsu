import { useState, useEffect } from 'react';
import { useAuth } from '../app/hooks/useAuth';
import { useUserRole } from '../app/hooks/useUserRole';

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  user_role: string | null;
}

export function useNameModal() {
  const { user, isAuthenticated } = useAuth();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Function to close the modal (can be called after successful name update)
  const closeModal = () => {
    setShouldShowModal(false);
  };

  useEffect(() => {
    const checkUserProfile = async () => {
      console.log('useNameModal - Checking profile. Auth:', isAuthenticated, 'User:', !!user, 'RoleLoading:', isRoleLoading, 'Role:', role);
      
      // Only check for names if user is authenticated AND has a role
      if (!isAuthenticated || !user || isRoleLoading || !role) {
        console.log('useNameModal - Skipping check, conditions not met');
        setIsLoading(false);
        return;
      }

      // Add a small delay to ensure all data is loaded
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        // Check if user needs to fill in names (only after role confirmation)
        const response = await fetch('/api/user-profile', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const profileData = await response.json();
          const profile = profileData.profile;
          
          console.log('useNameModal - Profile data:', profile);
          
          // Check if user has both first and last names
          const hasName = profile && 
            profile.first_name && 
            profile.last_name &&
            profile.first_name.trim() !== '' &&
            profile.last_name.trim() !== '';
          
          console.log('useNameModal - Has name:', hasName, 'First:', profile?.first_name, 'Last:', profile?.last_name);
          setShouldShowModal(!hasName);
        } else {
          console.error('Failed to fetch user profile:', response.statusText);
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
  }, [isAuthenticated, user, isRoleLoading, role]);

  return {
    shouldShowModal,
    isLoading,
    user,
    closeModal,
    redirectTo: role === 'counselor' ? '/counselor' : role === 'student' ? '/students' : '/student-onboarding'
  };
}
