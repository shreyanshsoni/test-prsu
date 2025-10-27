'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StarryBackground } from '../../components/ui/StarryBackground';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Upload, Edit, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import LockedOverlay from '../../components/LockedOverlay';

export default function StudentOnboarding() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isLoading, isAuthenticated } = useAuth();
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
    if (isClient && !isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isClient, isLoading, isAuthenticated, router]);

  const handleUploadResume = () => {
    // This would eventually handle resume upload
    // For now, just proceed to profile creation
    router.push('/custom-user-profile');
  };

  const handleManualOnboarding = () => {
    // Go to profile creation page
    router.push('/custom-user-profile');
  };

  const handleMaybeLater = () => {
    // Skip profile creation and go to dashboard
    localStorage.setItem('skipProfileCreation', 'true');
    router.push('/students');
  };

  // Show nothing during SSR or while loading auth to prevent flashing
  if (!isClient || isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-gradient-to-b from-indigo-50 to-blue-100 dark:from-blue-950 dark:to-indigo-950">
      {theme === 'dark' && <StarryBackground />}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: fadeIn ? 1 : 0, y: fadeIn ? 0 : 20 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-2xl w-full mx-auto px-6 py-12 bg-white dark:bg-gray-900 rounded-xl shadow-xl z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-4">
            Complete Your Profile
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Choose how you'd like to set up your student profile
          </p>
        </div>

        <div className="space-y-6 mb-10">
          <LockedOverlay>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUploadResume}
              className="w-full flex items-center p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/50 dark:to-indigo-800/40 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-md hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 bg-indigo-500 dark:bg-indigo-600 rounded-full flex items-center justify-center mr-6">
                <Upload size={24} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400 mb-1">Upload Resume</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We'll extract your information from your resume
                </p>
              </div>
              <ArrowRight className="text-indigo-500 dark:text-indigo-400" />
            </motion.button>
          </LockedOverlay>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleManualOnboarding}
            className="w-full flex items-center p-6 bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/50 dark:to-violet-800/40 rounded-xl border border-violet-200 dark:border-violet-800 shadow-md hover:shadow-lg transition-all"
          >
            <div className="w-14 h-14 bg-violet-500 dark:bg-violet-600 rounded-full flex items-center justify-center mr-6">
              <Edit size={24} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-xl font-semibold text-violet-700 dark:text-violet-400 mb-1">Manual Onboarding</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Fill in your information step by step
              </p>
            </div>
            <ArrowRight className="text-violet-500 dark:text-violet-400" />
          </motion.button>
        </div>

        <div className="text-center">
          <button 
            onClick={handleMaybeLater}
            className="text-indigo-600 dark:text-indigo-400 underline font-medium hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </motion.div>
    </div>
  );
} 