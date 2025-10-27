'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useUserRole } from '../hooks/useUserRole';
import HomeClientComponent from '../HomeClientComponent';
import { useTheme } from '../contexts/ThemeContext';
import { NameModal } from '../../components/NameModal';

export default function StudentsPage() {
  console.log('Students page - Component rendering');
  
  const { user, userRole, isLoading: isAuthLoading } = useAuth();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const { theme } = useTheme();
  const [isClient, setIsClient] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [isCheckingNames, setIsCheckingNames] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if user needs to enter names
  useEffect(() => {
    const checkUserNames = async () => {
      console.log('Students page - Starting name check:', {
        isClient,
        user: !!user,
        role,
        isAuthLoading,
        isRoleLoading
      });
      
      if (!isClient || !user || !role || role !== 'student' || isAuthLoading || isRoleLoading) {
        console.log('Students page - Skipping name check due to conditions not met');
        return;
      }
      
      console.log('Students page - All conditions met, proceeding with API call');

      // Check if user just completed profile creation (skip name modal)
      const skipProfileCreation = localStorage.getItem('skipProfileCreation');
      
      setIsCheckingNames(true);
      try {
        console.log('Students page - Making API call to /api/user-profile');
        const response = await fetch('/api/user-profile', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Students page - API response status:', response.status);
        
        if (response.ok) {
          const profileData = await response.json();
          const profile = profileData.profile;
          
          console.log('Students page - Profile data:', profile);
          console.log('Students page - Skip flag:', skipProfileCreation);
          
          // Check if user has both first and last names
          const hasName = profile && 
            profile.first_name && 
            profile.last_name &&
            profile.first_name.trim() !== '' &&
            profile.last_name.trim() !== '';
          
          console.log('Students page - Has name:', hasName);
          
          // Only skip name modal if user has names
          if (hasName) {
            // Clear the flag if it exists
            if (skipProfileCreation === 'true') {
              localStorage.removeItem('skipProfileCreation');
            }
            console.log('Students page - Skipping name modal (user has names)');
            // Don't show name modal
          } else {
            // User doesn't have names, show modal (regardless of skip flag)
            console.log('Students page - Showing name modal (user missing names)');
            setShowNameModal(true);
          }
        }
      } catch (error) {
        console.error('Error checking user names:', error);
      } finally {
        setIsCheckingNames(false);
      }
    };

    checkUserNames();
  }, [isClient, user, userRole, role, isAuthLoading, isRoleLoading]);

  // Handle redirects based on authentication and role
  useEffect(() => {
    console.log('Students page - Redirect useEffect triggered:', {
      isClient,
      isAuthLoading,
      isRoleLoading,
      user: !!user,
      role
    });
    // Only run once authentication and role checking is complete
    if (isClient && !isAuthLoading && !isRoleLoading) {
      if (!user) {
        // User not logged in, redirect to home
        console.log('User not logged in, redirecting to home');
        setShouldRedirect(true);
        router.push('/');
        return;
      }

      // User is logged in, check role from database
      const currentRole = userRole || role;
      
      if (currentRole === 'counselor') {
        // User is counselor, redirect to counselor page
        console.log('User is counselor, redirecting to counselor page');
        setShouldRedirect(true);
        router.push('/counselor');
      } else if (currentRole === 'student') {
        // User is student - let the global NameModal handle name checking
        console.log('User is student, showing dashboard');
      } else {
        // User has no role yet, default to student
        console.log('No role found, treating as student');
      }
    }
  }, [isClient, isAuthLoading, isRoleLoading, user, userRole, role, router]);

  // Show nothing during SSR or while loading auth/role to prevent flashing
  if (!isClient || isAuthLoading || isRoleLoading) {
    return null;
  }

  // If we need to redirect, show nothing while the redirect happens
  if (shouldRedirect) {
    return null;
  }

  // If user is logged in and is a student, show the dashboard
  const currentRole = userRole || role;
  if (user && (currentRole === 'student' || !currentRole)) {
    return (
      <>
        <HomeClientComponent user={user} />
        {/* Name Modal */}
        <NameModal
          isOpen={showNameModal}
          onClose={() => setShowNameModal(false)}
          redirectTo="/students"
        />
      </>
    );
  }
  
  // If user is logged in but not a student, show loading while redirecting
  if (user && currentRole === 'counselor') {
    return null;
  }

  // If user is not logged in or not a student, show nothing (will redirect)
  return null;
}
