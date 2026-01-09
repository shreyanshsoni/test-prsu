'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useUserRole } from '../hooks/useUserRole';
import HomeClientComponent from '../HomeClientComponent';
import { useTheme } from '../contexts/ThemeContext';

export default function StudentsPage() {
  console.log('Students page - Component rendering');
  
  const { user, userRole, isLoading: isAuthLoading } = useAuth();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const { theme } = useTheme();
  const [isClient, setIsClient] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);


  // Check approval status
  const checkApprovalStatus = async () => {
    try {
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
        
        // Check if user has selected an institute
        if (!profile?.institute_id) {
          // No institute selected, redirect to approval page
          console.log('No institute selected, redirecting to approval page');
          setShouldRedirect(true);
          router.push('/approval');
          return;
        }
        
        // Check verification status
        const verificationStatus = profile.verification_status || 'pending';
        if (verificationStatus !== 'approved') {
          // Not approved, redirect to approval page
          console.log('User not approved, redirecting to approval page');
          setShouldRedirect(true);
          router.push('/approval');
          return;
        }
        
        // User is approved, can access dashboard
      }
    } catch (error) {
      console.error('Error checking approval status:', error);
    }
  };

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
      } else if (currentRole === 'student' || !currentRole) {
        // Check approval status for students
        checkApprovalStatus();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, isAuthLoading, isRoleLoading, user, userRole, role]);

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
    return <HomeClientComponent user={user} />;
  }
  
  // If user is logged in but not a student, show loading while redirecting
  if (user && currentRole === 'counselor') {
    return null;
  }

  // If user is not logged in or not a student, show nothing (will redirect)
  return null;
}
