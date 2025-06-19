'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useRouter } from 'next/navigation';
import HomeClientComponent from './HomeClientComponent';
import NewNavbar from './components/NewNavbar';
import Hero from './components/Hero';
import VisionStatement from './components/VisionStatement';
import FeatureCards from './components/FeatureCards';
import ProgressTracker from './components/ProgressTracker';
import Partners from './components/Partners';
import FAQ from './components/FAQ';
import NewFooter from './components/NewFooter';
import { useTheme } from './contexts/ThemeContext';
import { StarryBackground } from './components/ui/StarryBackground';

export default function Home() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { theme } = useTheme();
  const [isClient, setIsClient] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle redirects based on authentication and role
  useEffect(() => {
    // Only run once authentication is complete and we're on the client
    if (isClient && !isAuthLoading) {
      if (user) {
        // User is logged in, check for role
        const userRole = localStorage.getItem('userRole');
        console.log('User logged in, role from localStorage:', userRole);
        
        if (!userRole) {
          console.log('No role found, redirecting to role selection');
          setShouldRedirect(true);
          router.push('/role-selection');
        }
      }
    }
  }, [isClient, isAuthLoading, user, router]);

  // Show nothing during SSR or while loading auth to prevent flashing
  if (!isClient || isAuthLoading) {
    return null;
  }

  // If we need to redirect, show nothing while the redirect happens
  if (shouldRedirect) {
    return null;
  }

  // If user is logged in and has a role, show the dashboard
  if (user && localStorage.getItem('userRole')) {
    return <HomeClientComponent user={user} />;
  }
  
  // If user is logged in but no role (and not redirecting yet), show loading
  if (user) {
    // Trigger redirect just in case the useEffect didn't catch it
    setTimeout(() => {
      router.push('/role-selection');
    }, 0);
    return null;
  }

  // If user is not logged in, show the landing page
  return (
    <div className="min-h-screen flex flex-col font-sans">
      {theme === 'dark' && <StarryBackground />}
      <NewNavbar />
      
      <main className="flex-grow">
        <Hero />
        <VisionStatement />
        <FeatureCards />
        <ProgressTracker completed={7} total={15} />
        <Partners />
        <FAQ />
      </main>
      
      <NewFooter />
    </div>
  );
}


