'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import LandingPage from '../../components/LandingPage';
import ApprovalWaitingPage from '../../components/ApprovalWaitingPage';

type View = 'landing' | 'approval';

export default function ApprovalPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<View>('landing');
  const [instituteName, setInstituteName] = useState('');
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [fullName, setFullName] = useState(user?.name || user?.nickname || user?.email || 'User');
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Honor query status hints (from auth-check) but ALWAYS verify against database
  // URL parameter is only a hint - database status is the source of truth
  useEffect(() => {
    if (!isClient || isAuthLoading || !user) return;
    const statusParam = searchParams.get('status');
    
    // Always fetch actual status from database to verify
    fetch('/api/user-profile', {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => {
        const profile = data.profile;
        const actualStatus = profile?.verification_status || null;
        const isApproved = actualStatus === 'approved' || profile?.is_verified;
        const isRejected = actualStatus === 'rejected';
        const hasInstitute = profile?.institute_id !== null && profile?.institute_id !== undefined;
        
        // Set profile data
        if (profile?.first_name && profile?.last_name) {
          setFullName(`${profile.first_name} ${profile.last_name}`);
        } else if (user?.name || user?.nickname || user?.email) {
          setFullName(user?.name || user?.nickname || user?.email || 'User');
        }
        
        if (profile?.institute_name) {
          setInstituteName(profile.institute_name);
        } else {
          setInstituteName('Your Institute');
        }
        
        // Database status is ALWAYS the source of truth
        // If database says approved, redirect regardless of URL param
        if (isApproved) {
          router.replace('/students');
          return;
        }
        
        // If database says rejected, show rejected regardless of URL param
        if (isRejected) {
          setApprovalStatus('rejected');
          setView('approval');
          setIsLoading(false);
          hasCheckedRef.current = true;
          return;
        }
        
        // If database says pending (or has institute but status is pending)
        if (hasInstitute && (actualStatus === 'pending' || !actualStatus)) {
          setApprovalStatus('pending');
          setView('approval');
          setIsLoading(false);
          hasCheckedRef.current = true;
          return;
        }
        
        // If URL param says approved but database doesn't, ignore URL param
        if (statusParam === 'approved' && !isApproved) {
          // Database doesn't say approved, so don't redirect
          // Show appropriate view based on actual status
          if (isRejected) {
            setApprovalStatus('rejected');
            setView('approval');
          } else if (hasInstitute) {
            setApprovalStatus('pending');
            setView('approval');
          } else {
            setView('landing');
          }
          setIsLoading(false);
          hasCheckedRef.current = true;
          return;
        }
        
        // No institute - show landing page
        if (!hasInstitute) {
          setView('landing');
          setIsLoading(false);
          hasCheckedRef.current = true;
        }
      })
      .catch(err => {
        console.error('Error fetching profile:', err);
        setIsLoading(false);
      });
  }, [isClient, isAuthLoading, user, searchParams, router]);

  const checkApprovalStatus = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (hasCheckedRef.current && isLoading) {
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/user-profile', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const profile = data.profile;

        console.log('Approval page - Profile data:', {
          institute_id: profile?.institute_id,
          verification_status: profile?.verification_status,
          is_verified: profile?.is_verified,
          first_name: profile?.first_name,
          last_name: profile?.last_name
        });

        const hasInstitute = profile?.institute_id !== null && profile?.institute_id !== undefined;
        const status = profile?.verification_status || null;
        const isApproved = status === 'approved' || profile?.is_verified;
        const isRejected = status === 'rejected';

        console.log('Approval page - Status check:', {
          hasInstitute,
          status,
          isApproved,
          isRejected,
          institute_id: profile?.institute_id
        });

        // Set full name from profile (first_name + last_name) or fallback
        if (profile?.first_name && profile?.last_name) {
          setFullName(`${profile.first_name} ${profile.last_name}`);
        } else if (user?.name || user?.nickname || user?.email) {
          setFullName(user?.name || user?.nickname || user?.email || 'User');
        }

        // Set institute name from profile (now included in API response)
        if (profile?.institute_name) {
          setInstituteName(profile.institute_name);
        } else {
          setInstituteName('Your Institute');
        }

        // Routing decisions
        if (isApproved) {
          router.push('/students');
          return;
        }

        if (isRejected) {
          setApprovalStatus('rejected');
          setView('approval');
          return;
        }

        if (hasInstitute) {
          // Submitted and awaiting decision
          setApprovalStatus(status === 'pending' || !status ? 'pending' : status);
          setView('approval');
          return;
        }

        // New user with no institute yet
        setView('landing');
      }
    } catch (error) {
      console.error('Error checking approval status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router, user?.name, user?.nickname, user?.email]);

  // Check user's approval status on mount (only if not already handled by query param effect)
  useEffect(() => {
    // Skip if we already handled it via query params or if user is not loaded
    if (!isClient || isAuthLoading || !user) return;
    
    // If we already checked via query param effect, don't check again
    if (hasCheckedRef.current) return;
    
    // Only run checkApprovalStatus if no query param was present
    const statusParam = searchParams.get('status');
    if (!statusParam) {
      hasCheckedRef.current = true;
      checkApprovalStatus();
    }
  }, [isClient, isAuthLoading, user, searchParams, checkApprovalStatus]);
  
  // Handle unauthenticated users
  useEffect(() => {
    if (isClient && !isAuthLoading && !user) {
      // Not authenticated, redirect to login
      router.push('/api/auth/login?returnTo=/approval');
    }
  }, [isClient, isAuthLoading, user, router]);

  const handleInstituteSubmit = async (instituteId: number, secretKey: string) => {
    // After successful submission, immediately show approval waiting page
    try {
      setIsLoading(true);
      
      // Get user profile to check status (now includes institute_name)
      const profileResponse = await fetch('/api/user-profile', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const profile = profileData.profile;
        const status = profile?.verification_status || 'pending';
        setApprovalStatus(status as 'pending' | 'approved' | 'rejected');
        
        // Set full name from profile (first_name + last_name) or fallback
        if (profile?.first_name && profile?.last_name) {
          setFullName(`${profile.first_name} ${profile.last_name}`);
        } else {
          setFullName(user?.name || user?.nickname || user?.email || 'User');
        }
        
        // Set institute name from profile (now included in API response)
        if (profile?.institute_name) {
          setInstituteName(profile.institute_name);
        } else {
          setInstituteName('Your Institute');
        }
      }
      
      // Switch to approval view immediately
      setView('approval');
    } catch (error) {
      console.error('Error fetching approval status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (!isClient || isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/pexels-george-pak-7972949.jpg)' }}
        />
        <div className="absolute inset-0 backdrop-blur-md bg-white/40 dark:bg-gray-900/40" />
        <div className="text-center relative z-10">
          <div className="inline-block w-12 h-12 border-4 border-slate-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-800 dark:text-gray-200 mt-4 font-semibold drop-shadow-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      {view === 'landing' && (
        <LandingPage onInstituteSubmit={handleInstituteSubmit} />
      )}

      {view === 'approval' && (
        <ApprovalWaitingPage
          instituteName={instituteName || 'Your Institute'}
          fullName={fullName}
          approvalStatus={approvalStatus}
        />
      )}
    </div>
  );
}

