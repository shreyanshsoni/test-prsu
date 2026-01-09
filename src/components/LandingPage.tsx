'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';

interface Institute {
  institute_id: number;
  institute_name: string;
  total_students: number;
}

interface LandingPageProps {
  onInstituteSubmit: (instituteId: number, secretKey: string) => void;
}

export default function LandingPage({ onInstituteSubmit }: LandingPageProps) {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [selectedInstitute, setSelectedInstitute] = useState<number | ''>('');
  const [secretKey, setSecretKey] = useState('');
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secretKeyError, setSecretKeyError] = useState(false);

  useEffect(() => {
    loadInstitutes();
  }, []);

  async function loadInstitutes() {
    try {
      const response = await fetch('/api/institutes');
      if (!response.ok) {
        throw new Error('Failed to load institutes');
      }
      const data = await response.json();
      setInstitutes(data.institutes || []);
    } catch (error) {
      console.error('Error loading institutes:', error);
      setError('Failed to load institutes. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }

  const handleContinue = async () => {
    // Validate all fields
    if (!selectedInstitute || !secretKey) {
      setError('Please select an institute and enter the secret key');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter both first name and last name');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // First API: Check institute with secret key
      const instituteResponse = await fetch('/api/institute-selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instituteId: selectedInstitute,
          secretKey: secretKey.trim(),
        }),
      });

      const instituteData = await instituteResponse.json();

      if (!instituteResponse.ok) {
        // Check if error is related to secret key
        const errorMessage = instituteData.error || 'Failed to submit institute selection';
        if (errorMessage.toLowerCase().includes('secret') || errorMessage.toLowerCase().includes('invalid')) {
          setSecretKeyError(true);
        }
        throw new Error(errorMessage);
      }
      
      // Clear secret key error on success
      setSecretKeyError(false);

      // Second API: Save first name and last name
      const nameResponse = await fetch('/api/update-user-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      });

      const nameData = await nameResponse.json();

      if (!nameResponse.ok) {
        throw new Error(nameData.error || 'Failed to save name');
      }

      // Both APIs succeeded - call the callback
      onInstituteSubmit(selectedInstitute, secretKey);
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit. Please try again.';
      setError(errorMessage);
      // Check if error is related to secret key
      if (errorMessage.toLowerCase().includes('secret') || errorMessage.toLowerCase().includes('invalid')) {
        setSecretKeyError(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/pexels-george-pak-7972949.jpg)' }}
      />
      <div className="absolute inset-0 backdrop-blur-md bg-white/40 dark:bg-gray-900/40" />
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-gray-700">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg p-2">
              <img 
                src="/P_Logo.png" 
                alt="PRSU Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-2">
            Welcome to PRSU
          </h1>
          <p className="text-center text-slate-600 dark:text-gray-300 mb-8">
            Select your institute to get started
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Choose Your Institute
              </label>
              <div className="relative">
                <select
                  value={selectedInstitute}
                  onChange={(e) => setSelectedInstitute(e.target.value ? parseInt(e.target.value) : '')}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white"
                >
                  <option value="">Select an institute...</option>
                  {institutes.map((institute) => (
                    <option key={institute.institute_id} value={institute.institute_id}>
                      {institute.institute_name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-400 pointer-events-none" />
              </div>
            </div>

            {selectedInstitute && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                    Secret Key
                  </label>
                  <div className="relative">
                    <input
                      type={showSecretKey ? 'text' : 'password'}
                      value={secretKey}
                      onChange={(e) => {
                        setSecretKey(e.target.value);
                        // Clear error when user starts typing
                        if (secretKeyError) {
                          setSecretKeyError(false);
                          setError(null);
                        }
                      }}
                      placeholder="Enter your secret key"
                      className={`w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-400 ${
                        secretKeyError
                          ? 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-slate-300 dark:border-gray-600 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400 hover:text-slate-600 dark:hover:text-gray-200 transition-colors focus:outline-none"
                      aria-label={showSecretKey ? 'Hide secret key' : 'Show secret key'}
                    >
                      {showSecretKey ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              onClick={handleContinue}
              disabled={!selectedInstitute || !firstName.trim() || !lastName.trim() || loading || submitting}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  Submitting
                  <span className="inline-flex ml-1 space-x-0.5">
                    <span 
                      className="inline-block animate-bounce" 
                      style={{ 
                        animationDelay: '0ms',
                        animationDuration: '1.4s',
                        animationIterationCount: 'infinite'
                      }}
                    >.</span>
                    <span 
                      className="inline-block animate-bounce" 
                      style={{ 
                        animationDelay: '0.2s',
                        animationDuration: '1.4s',
                        animationIterationCount: 'infinite'
                      }}
                    >.</span>
                    <span 
                      className="inline-block animate-bounce" 
                      style={{ 
                        animationDelay: '0.4s',
                        animationDuration: '1.4s',
                        animationIterationCount: 'infinite'
                      }}
                    >.</span>
                  </span>
                </span>
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-slate-800 dark:text-gray-200 text-sm mt-6 font-medium drop-shadow-sm">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

