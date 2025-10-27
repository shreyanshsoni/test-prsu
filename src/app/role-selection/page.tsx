'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { StarryBackground } from '../../components/ui/StarryBackground';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { UserCheck, Briefcase } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';

export default function RoleSelection() {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const { profileData, isLoading: isProfileLoading } = useUserProfile();
  const router = useRouter();
  const { theme } = useTheme();
  const [isClient, setIsClient] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Trigger fade-in animation after mounting
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // If not authenticated, redirect to login
    if (isClient && !isAuthLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isClient, isAuthLoading, isAuthenticated, router]);

  const handleRoleSelect = async (role: 'student' | 'counselor') => {
    try {
      // Save role to database
      const response = await fetch('/api/user-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error('Failed to save role');
      }

      // Also store in localStorage for immediate access (will be replaced by database check)
      localStorage.setItem('userRole', role);

      if (role === 'student') {
        // Check if the user has opted out of profile creation
        const hasOptedOut = localStorage.getItem('skipProfileCreation') === 'true';
        
        // Check if user has already filled in profile info
        const hasProfileData = profileData && 
          (profileData.gradeLevel || profileData.schoolType || profileData.gpa?.weighted || profileData.gpa?.unweighted);
        
        if (!hasOptedOut && !hasProfileData) {
          // If user is new and hasn't opted out, redirect to student onboarding
          router.push('/student-onboarding');
        } else {
          // Otherwise, go to dashboard
          router.push('/');
        }
      } else {
        // Redirect to counselor page
        router.push('/counselor');
      }
    } catch (error) {
      console.error('Error saving role:', error);
      // Fallback to localStorage if database save fails
      localStorage.setItem('userRole', role);
      
      if (role === 'student') {
        router.push('/');
      } else {
        router.push('/counselor');
      }
    }
  };

  // Show nothing during SSR or while loading auth to prevent flashing
  if (!isClient || isAuthLoading || !isAuthenticated || isProfileLoading) {
    return null;
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-gradient-to-b from-indigo-50 to-blue-100 dark:from-blue-950 dark:to-indigo-950">
      {theme === 'dark' && <StarryBackground />}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: fadeIn ? 1 : 0, y: fadeIn ? 0 : 20 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-3xl w-full mx-auto px-6 py-12 bg-white dark:bg-dark-card rounded-xl shadow-xl z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-4">
            Welcome to PRSU
          </h1>
          <p className="text-lg text-gray-600 dark:text-dark-text">
            Please select your role to continue
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect('student')}
            className="flex flex-col items-center p-8 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/50 dark:to-indigo-800/40 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-md hover:shadow-lg transition-all"
          >
            <div className="w-20 h-20 bg-indigo-500 dark:bg-indigo-600 rounded-full flex items-center justify-center mb-4">
              <UserCheck size={40} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400 mb-2">Student</h3>
            <p className="text-center text-gray-600 dark:text-dark-muted">
              Access your academic roadmaps, goals, and program applications
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect('counselor')}
            className="flex flex-col items-center p-8 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/50 dark:to-teal-800/40 rounded-xl border border-teal-200 dark:border-teal-800 shadow-md hover:shadow-lg transition-all"
          >
            <div className="w-20 h-20 bg-teal-500 dark:bg-teal-600 rounded-full flex items-center justify-center mb-4">
              <Briefcase size={40} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-teal-700 dark:text-teal-400 mb-2">Counselor</h3>
            <p className="text-center text-gray-600 dark:text-dark-muted">
              Provide guidance and support to students on their academic journey
            </p>
          </motion.button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You can change your role later in profile settings
          </p>
        </div>
      </motion.div>
    </div>
  );
} 