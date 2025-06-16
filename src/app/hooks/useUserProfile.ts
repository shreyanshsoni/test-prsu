'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { StudentData } from '../custom-user-profile/src/types/student';
import { toast } from 'react-hot-toast';

export function useUserProfile() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [profileData, setProfileData] = useState<Partial<StudentData> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSilentlySaving, setIsSilentlySaving] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch user profile from the API
  const fetchUserProfile = useCallback(async (showLoader = true) => {
    if (!isClient || !isAuthenticated || !user) {
      return;
    }

    if (showLoader) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/user-profile`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setProfileData(data.profile);
    } catch (err) {
      console.error('Error fetching user profile data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch profile data'));
      if (showLoader) {
        toast.error('Failed to load your profile data. Please try again later.');
      }
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  }, [isClient, isAuthenticated, user]);

  // Update specific fields of the user profile
  const updateProfileFields = useCallback(async (fieldsToUpdate: Partial<StudentData>, showFeedback = false) => {
    if (!isClient || !isAuthenticated || !user) {
      if (showFeedback) {
        toast.error('You need to be logged in to update your profile.');
      }
      return false;
    }

    // For silent background saves, use a separate state
    if (showFeedback) {
      setIsLoading(true);
    } else {
      setIsSilentlySaving(true);
    }
    setError(null);

    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/user-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include',
        body: JSON.stringify(fieldsToUpdate)
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      // Update local state with the new fields
      setProfileData(prev => prev ? { ...prev, ...fieldsToUpdate } : fieldsToUpdate);
      
      // Only show success toast if feedback is requested
      if (showFeedback) {
        toast.success('Profile updated successfully');
      }
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      
      // Only show error toast if feedback is requested
      if (showFeedback) {
        toast.error('Failed to update your profile. Please try again later.');
      }
      return false;
    } finally {
      if (showFeedback) {
        setIsLoading(false);
      } else {
        setIsSilentlySaving(false);
      }
    }
  }, [isClient, isAuthenticated, user]);

  // Replace the entire profile
  const replaceFullProfile = useCallback(async (newProfile: Partial<StudentData>, showFeedback = false) => {
    if (!isClient || !isAuthenticated || !user) {
      if (showFeedback) {
        toast.error('You need to be logged in to update your profile.');
      }
      return false;
    }

    if (showFeedback) {
      setIsLoading(true);
    } else {
      setIsSilentlySaving(true);
    }
    setError(null);

    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/user-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include',
        body: JSON.stringify(newProfile)
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      // Replace local state with the new profile
      setProfileData(newProfile);
      
      // Only show success toast if feedback is requested
      if (showFeedback) {
        toast.success('Profile updated successfully');
      }
      return true;
    } catch (err) {
      console.error('Error replacing profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to replace profile'));
      
      // Only show error toast if feedback is requested
      if (showFeedback) {
        toast.error('Failed to update your profile. Please try again later.');
      }
      return false;
    } finally {
      if (showFeedback) {
        setIsLoading(false);
      } else {
        setIsSilentlySaving(false);
      }
    }
  }, [isClient, isAuthenticated, user]);

  // Delete the user profile
  const deleteProfile = useCallback(async (showFeedback = true) => {
    if (!isClient || !isAuthenticated || !user) {
      if (showFeedback) {
        toast.error('You need to be logged in to delete your profile.');
      }
      return false;
    }

    if (showFeedback) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/user-profile`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      // Clear local state
      setProfileData(null);
      
      // Only show success toast if feedback is requested
      if (showFeedback) {
        toast.success('Profile deleted successfully');
      }
      return true;
    } catch (err) {
      console.error('Error deleting profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete profile'));
      
      // Only show error toast if feedback is requested  
      if (showFeedback) {
        toast.error('Failed to delete your profile. Please try again later.');
      }
      return false;
    } finally {
      if (showFeedback) {
        setIsLoading(false);
      }
    }
  }, [isClient, isAuthenticated, user]);

  // Fetch profile data when the component mounts and user authentication is ready
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchUserProfile(false); // Don't show loader on initial load
    }
  }, [isAuthLoading, isAuthenticated, fetchUserProfile]);

  return {
    profileData,
    isLoading,
    isSilentlySaving,
    error,
    fetchUserProfile,
    updateProfileFields,
    replaceFullProfile,
    deleteProfile
  };
} 