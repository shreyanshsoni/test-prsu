'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, LogOut } from 'lucide-react';
import Link from 'next/link';
import ProfileAvatar from '../components/ProfileAvatar';

export default function ProfilePage() {
  const { user, error, isLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Prevent SSR issues
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em]"></div>
        <p className="ml-2 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-4">{error.message}</p>
          <Link 
            href="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-700 mb-4">Please log in to view your profile.</p>
          <div className="flex space-x-4">
            <Link 
              href="/"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
            <a 
              href="/api/auth/login" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Log In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">User Profile</h1>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-shrink-0">
                <ProfileAvatar 
                  picture={user.picture}
                  name={user.name || user.nickname || user.email}
                  size="5rem"
                />
              </div>
              
              <div className="flex-grow">
                <h2 className="text-2xl font-bold text-gray-800">
                  {user.name || user.nickname || user.email}
                </h2>
                <div className="mt-3 text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {user.sub?.includes('auth0') ? 'Email Login' : 'Google Login'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="mt-1 font-medium text-blue-600">{user.email || 'Not provided'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">Username</div>
                  <div className="mt-1 font-medium">{user.nickname || 'Not provided'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">Account Type</div>
                  <div className="mt-1 font-medium">{user.sub?.includes('auth0') ? 'Email Login' : 'Google'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">Last Updated</div>
                  <div className="mt-1 font-medium">
                    {user.updated_at 
                      ? new Date(user.updated_at).toLocaleDateString() 
                      : 'Unknown'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Account Actions</h3>
              <div className="flex flex-wrap gap-3">
                <a 
                  href="/api/auth/logout" 
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 