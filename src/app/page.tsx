'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import HomeClientComponent from './HomeClientComponent';
import NewNavbar from './components/NewNavbar';
import Hero from './components/Hero';
import VisionStatement from './components/VisionStatement';
import FeatureCards from './components/FeatureCards';
import ProgressTracker from './components/ProgressTracker';
import Partners from './components/Partners';
import NewFooter from './components/NewFooter';

export default function Home() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show nothing during SSR or while loading auth to prevent flashing
  if (!isClient || isAuthLoading) {
    return null;
  }

  if (user) {
    return <HomeClientComponent user={user} />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <NewNavbar />
      
      <main className="flex-grow">
        <Hero />
        <VisionStatement />
        <FeatureCards />
        <ProgressTracker completed={7} total={15} />
        <Partners />
      </main>
      
      <NewFooter />
    </div>
  );
}

