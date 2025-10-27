import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useTheme } from '../app/contexts/ThemeContext';

interface NameModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string; // Optional redirect path after saving (deprecated - no longer used)
}

export const NameModal: React.FC<NameModalProps> = ({ isOpen, onClose, redirectTo }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim()) {
      setError('Both first name and last name are required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/update-user-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Success - close the modal and refresh the page to show the dashboard
        onClose();
        // Refresh the page to trigger re-checking of user profile
        window.location.reload();
      } else {
        setError(data.error || 'Failed to update names');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error updating names:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className={`relative max-w-md w-full mx-4 p-6 rounded-2xl shadow-2xl ${
        isDark 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      }`}>
        {/* Content */}
        <div className="text-center">
          {/* Welcome message */}
          <div className="mb-6">
            <h2 className={`text-2xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Welcome to PSRU
            </h2>
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Please Enter Your First And Last Name To Continue
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name inputs */}
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  required
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  required
                />
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <p className="text-red-500 text-sm text-left">{error}</p>
            )}
            
            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || !firstName.trim() || !lastName.trim()}
              className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                isLoading || !firstName.trim() || !lastName.trim()
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save & Continue
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
