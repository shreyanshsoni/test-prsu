'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useUserRole } from './hooks/useUserRole';
import { useRouter } from 'next/navigation';
import HomeClientComponent from './HomeClientComponent';
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
  const { user, isLoading: isAuthLoading } = useAuth();
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
    // Only run once authentication and role loading are complete and we're on the client
    if (isClient && !isAuthLoading && !isRoleLoading) {
      if (user) {
        // User is logged in, check for role from database
        console.log('User logged in, role from database:', role);
        
        if (!role) {
          console.log('No role found, redirecting to role selection');
          setShouldRedirect(true);
          router.push('/role-selection');
        } else if (role === 'counselor') {
          console.log('User is counselor, redirecting to counselor page');
          setShouldRedirect(true);
          router.push('/counselor');
        } else if (role === 'student') {
          console.log('User is student, showing student dashboard');
          // Student stays on main page (HomeClientComponent)
        }
      }
    }
  }, [isClient, isAuthLoading, isRoleLoading, user, role, router]);

  // Show nothing during SSR or while loading auth/role to prevent flashing
  if (!isClient || isAuthLoading || isRoleLoading) {
    return null;
  }

  // If we need to redirect, show nothing while the redirect happens
  if (shouldRedirect) {
    return null;
  }

  // If user is logged in and has a student role, show the dashboard
  if (user && role === 'student') {
    return <HomeClientComponent user={user} />;
  }
  
  // If user is logged in but no role (and not redirecting yet), show loading
  if (user && !role) {
    // Trigger redirect just in case the useEffect didn't catch it
    setTimeout(() => {
      router.push('/role-selection');
    }, 0);
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


