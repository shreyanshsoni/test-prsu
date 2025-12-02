'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useUserRole } from './hooks/useUserRole';
import { useTheme } from './contexts/ThemeContext';
import ThemeToggle from '../components/ui/ThemeToggle';
import LandingHero from '../components/LandingHero';
import PronunciationSection from '../components/PronunciationSection';
import ProblemVisionStatement from '../components/ProblemVisionStatement';
import InteractiveRoadmap from '../components/InteractiveRoadmap';
import StudentJourney from '../components/StudentJourney';
import ValuePillars from '../components/ValuePillars';
import ProgressTracker from '../components/ProgressTracker';
import LandingAlumniExperts from '../components/LandingAlumniExperts';
import FAQSection from '../components/FAQSection';
import NewFooter from '../components/NewFooter';
import { StarryBackground } from '../components/ui/StarryBackground';

export default function Home() {
  const { user, userRole, isLoading: isAuthLoading } = useAuth();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const { theme } = useTheme();
  const [isClient, setIsClient] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Handle redirects based on authentication and role
  useEffect(() => {
    // Only run once authentication and role checking is complete
    if (isClient && !isAuthLoading) {
      // If a logout is in progress, don't redirect based on potentially
      // stale auth state that might still be present during the redirect.
      let isLoggingOut = false;
      try {
        if (typeof window !== 'undefined') {
          isLoggingOut = window.sessionStorage.getItem('appLoggingOut') === 'true';
        }
      } catch (e) {
        isLoggingOut = false;
      }

      if (isLoggingOut) {
        return;
      }

      if (!user) {
        // User not logged in, show landing page
        return;
      }

      // User is logged in, check role from database
      // Use userRole from useAuth if available, fallback to role from useUserRole
      const currentRole = userRole || role;
      
      if (currentRole === 'counselor') {
        // User is counselor, redirect to counselor page
        console.log('User is counselor, redirecting to counselor page');
        setShouldRedirect(true);
        router.push('/counselor');
      } else if (currentRole === 'student') {
        // User is student, redirect to students dashboard
        console.log('User is student, redirecting to students dashboard');
        setShouldRedirect(true);
        router.push('/students');
      } else {
        // User has no role yet, default to student
        console.log('No role found, treating as student');
        setShouldRedirect(true);
        router.push('/students');
      }
    }
  }, [isClient, isAuthLoading, user, userRole, role, router]);

  // Show nothing during SSR or while loading auth to prevent flashing
  if (!isClient || isAuthLoading) {
    return null;
  }

  // If we need to redirect, show nothing while the redirect happens
  if (shouldRedirect) {
    return null;
  }

  // If user is logged in, redirect appropriately
  if (user && userRole) {
    return null; // Will redirect via useEffect
  }
  
  // If user is logged in, show loading while redirecting
  if (user) {
    return null;
  }

  // If user is not logged in, show the complete landing page
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative">
      {/* Starry background for dark mode */}
      <StarryBackground />
      {/* Mobile-responsive navbar */}
      <div className={`fixed left-0 right-0 z-50 navbar-transition ${
        scrolled 
          ? 'top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm' 
          : 'top-2 sm:top-6 bg-transparent'
      }`}>
        <div className={`container mx-auto px-4 sm:px-6 lg:px-8 navbar-transition ${
          scrolled ? 'py-3 sm:py-4' : 'py-0'
        }`}>
          <div className="flex justify-between items-center">
            <div className={`flex items-center navbar-transition ${
              scrolled ? 'ml-0' : 'ml-4 sm:ml-16'
            }`}>
              <a href="/" className="flex items-center">
                <img 
                  src={theme === 'dark' ? '/light_mode_logo.png' : '/dark_mode_logo.png'} 
                  alt={`PRSU Logo (${theme} mode)`} 
                  width={200}
                  height={60}
                  className={`w-auto object-contain navbar-transition ${
                    scrolled ? 'h-8 sm:h-10' : 'h-10 sm:h-14'
                  }`}
                />
              </a>
            </div>
            <div className={`navbar-transition ${
              scrolled ? 'mr-0' : 'mr-4 sm:mr-16'
            }`}>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
      
      <main>
        <LandingHero />
        <PronunciationSection />
        <ProblemVisionStatement />
        <InteractiveRoadmap />
        <StudentJourney />
        <ValuePillars />
        <ProgressTracker />
        <LandingAlumniExperts />
        <FAQSection />
      </main>
      
      <NewFooter />
    </div>
  );
}


