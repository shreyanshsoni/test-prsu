'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/Button';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { ThemeToggle } from './ui/ThemeToggle';

const NewNavbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

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

  const handleGetStarted = () => {
    if (user) {
      // If user is already logged in, redirect to dashboard
      window.location.href = '/?tab=search';
    } else {
      // If not logged in, redirect to login using direct URL
      window.location.href = '/api/auth/login?returnTo=/?tab=search';
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center">
            <a href={user ? '/?tab=search' : '/'} className="flex items-center">
              <Image 
                src="/fulllogo_transparent_nobuffer.png" 
                alt="PRSU Logo" 
                width={200}
                height={60}
                className="h-14 w-auto object-contain"
              />
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {user ? (
              <a href="/api/auth/logout">
                <Button primary className="px-5 py-2">
                  Logout
                </Button>
              </a>
            ) : (
              <Button 
                primary 
                className="px-5 py-2 text-lg"
                onClick={handleGetStarted}
              >
                <span>Get Started</span>
                <span className="ml-2">→</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NewNavbar; 