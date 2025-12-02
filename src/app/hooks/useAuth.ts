'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Types for user data
export interface UserProfile {
  sub: string;
  name?: string;
  nickname?: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
  [key: string]: any;
}

// Key used in sessionStorage to track logout state across redirects
const LOGOUT_FLAG_KEY = 'appLoggingOut';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  
  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Skip if not on client side
    if (!isClient) return;

    async function fetchUserProfile() {
      try {
        setIsLoading(true);
        setError(null);

        // Use window.location.origin to get the absolute URL
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          credentials: 'include' // Important for cookies
        });
        
        if (response.status === 401) {
          // User is not authenticated, but this isn't an error.
          // Also clear any pending logout flag since logout is now confirmed.
          setUser(null);
          setUserRole(null);
          try {
            if (typeof window !== 'undefined') {
              window.sessionStorage.removeItem(LOGOUT_FLAG_KEY);
            }
          } catch (e) {
            // Ignore storage errors
          }
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          // Handle other error statuses
          let errorMessage = 'Failed to fetch user data';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            // If JSON parsing fails, use status text
            errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();

        // If a logout is in progress, don't rehydrate user state from a
        // potentially stale /api/auth/me response. Treat the user as logged out
        // on the client until a fresh, post-logout check confirms otherwise.
        let isLoggingOut = false;
        try {
          if (typeof window !== 'undefined') {
            isLoggingOut = window.sessionStorage.getItem(LOGOUT_FLAG_KEY) === 'true';
          }
        } catch (e) {
          // If sessionStorage is unavailable, fall back to normal behavior
          isLoggingOut = false;
        }

        if (isLoggingOut) {
          setUser(null);
          setUserRole(null);
          return;
        }

        setUser(data.user);
        setUserRole(data.role || null);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        // Only show toast for network errors to avoid spamming the user
        if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
          toast.error('Network error. Check your connection.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserProfile();
  }, [isClient]); // Add isClient as a dependency

  const login = () => {
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      window.location.href = `${baseUrl}/api/auth/login`;
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      // Mark that a logout is in progress so subsequent page loads don't
      // immediately redirect based on stale auth state.
      try {
        window.sessionStorage.setItem(LOGOUT_FLAG_KEY, 'true');
      } catch (e) {
        // Ignore storage errors and proceed with best-effort logout
      }

      // Clear auth state immediately to prevent race conditions
      setUser(null);
      setUserRole(null);
      
      // Redirect to logout endpoint with returnTo parameter to ensure proper redirect after logout
      const baseUrl = window.location.origin;
      const returnTo = encodeURIComponent('/');
      window.location.href = `${baseUrl}/api/auth/logout?returnTo=${returnTo}`;
    }
  };

  const isAuthenticated = !!user;
  
  return {
    user,
    userRole,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout
  };
} 