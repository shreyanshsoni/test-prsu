'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import ProfileAvatar from './ProfileAvatar';

export default function Navbar() {
  const { user, isLoading, error } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href={user ? '/?tab=search' : '/'} className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">Academic Planner</span>
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
              Home
            </Link>
            
            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-2">
                    {user.picture && (
                      <Link href="/profile" aria-label="View profile">
                        <ProfileAvatar 
                          picture={user.picture}
                          name={user.name || user.nickname || user.email || 'User'}
                          size="2rem"
                        />
                      </Link>
                    )}
                    <a 
                      href="/api/auth/logout"
                      className="px-3 py-2 rounded-md text-sm font-medium bg-white text-indigo-600 hover:bg-gray-100"
                    >
                      Logout
                    </a>
                  </div>
                ) : (
                  <a 
                    href="/api/auth/login"
                    className="px-3 py-2 rounded-md text-sm font-medium bg-white text-indigo-600 hover:bg-gray-100"
                  >
                    Login
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 