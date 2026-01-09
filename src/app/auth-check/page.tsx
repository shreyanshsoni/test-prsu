'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

/**
 * Lightweight client-side gate that decides where to send the user right after login.
 * Rules:
 * - If not logged in -> send to Auth0 login with returnTo=/auth-check
 * - If approved (verification_status=approved or is_verified true) -> /students
 * - If rejected -> /approval?status=rejected
 * - If pending and institute selected -> /approval?status=pending
 * - If no institute yet -> /approval
 */
export default function AuthCheckPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function run() {
      if (isAuthLoading) return;

      if (!user) {
        router.replace('/api/auth/login?returnTo=/auth-check');
        return;
      }

      try {
        const res = await fetch('/api/user-profile', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          // If profile fetch fails, fall back to approval flow
          router.replace('/approval');
          return;
        }

        const data = await res.json();
        const profile = data.profile || {};
        const hasInstitute =
          profile.institute_id !== null && profile.institute_id !== undefined;
        const status = profile.verification_status || null;
        const isApproved = status === 'approved' || profile.is_verified;
        const isRejected = status === 'rejected';

        if (isApproved) {
          router.replace('/students');
          return;
        }

        if (isRejected) {
          router.replace('/approval?status=rejected');
          return;
        }

        if (hasInstitute) {
          router.replace('/approval?status=pending');
          return;
        }

        // New user, no institute yet
        router.replace('/approval');
      } catch (e) {
        console.error('AuthCheck error:', e);
        router.replace('/approval');
      }
    }

    run();
  }, [isAuthLoading, user, router]);

  // Minimal placeholder while deciding
  return null;
}

