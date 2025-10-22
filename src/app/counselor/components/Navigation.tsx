import React, { useState, useRef, useEffect } from 'react';
import { ViewMode } from '../../../types/counselor';
import { BarChart3, Users, Target, User, LogOut, Settings } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../../components/ui/ThemeToggle';

interface NavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  focusModeEnabled: boolean;
  onFocusModeToggle: () => void;
  onLogout?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onViewChange,
  focusModeEnabled,
  onFocusModeToggle,
  onLogout
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          <div className="flex items-center -ml-20">
            <img 
              src={isDark ? "/light_mode_logo.png" : "/dark_mode_logo.png"}
              alt="PRSU Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : `${isDark ? 'text-dark-text hover:text-dark-text hover:bg-dark-border' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => onViewChange('table')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                currentView === 'table'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : `${isDark ? 'text-dark-text hover:text-dark-text hover:bg-dark-border' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Students</span>
            </button>
            <button
              onClick={() => onViewChange('goals')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                currentView === 'goals'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : `${isDark ? 'text-dark-text hover:text-dark-text hover:bg-dark-border' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Goals</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {currentView === 'table' && (
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>Focus Mode</span>
              <button
                onClick={onFocusModeToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  focusModeEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-dark-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    focusModeEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}
          
          <ThemeToggle />
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-8 h-8 ${isDark ? 'bg-dark-border hover:bg-dark-background' : 'bg-gray-300 hover:bg-gray-400'} rounded-full flex items-center justify-center transition-colors`}
              title="Account"
            >
              <User className={`w-4 h-4 ${isDark ? 'text-dark-text' : 'text-gray-600'}`} />
            </button>
            
            {isDropdownOpen && (
              <div className={`absolute right-1/2 transform translate-x-1/2 mt-2 w-48 ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} border rounded-lg shadow-lg z-50`}>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      // Add account/profile functionality here
                    }}
                    className={`w-full px-4 py-2 text-left text-sm ${isDark ? 'text-dark-text hover:bg-dark-border' : 'text-gray-700 hover:bg-gray-100'} flex items-center space-x-2`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Account</span>
                  </button>
                  {onLogout && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onLogout();
                      }}
                      className={`w-full px-4 py-2 text-left text-sm ${isDark ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'} flex items-center space-x-2`}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
