import React from 'react';
import { ViewMode } from '../types';
import { BarChart3, Users, Target, User } from 'lucide-react';

interface NavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  focusModeEnabled: boolean;
  onFocusModeToggle: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onViewChange,
  focusModeEnabled,
  onFocusModeToggle
}) => {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-bold text-gray-900">PRSU</span>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => onViewChange('table')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                currentView === 'table'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Students</span>
            </button>
            <button
              onClick={() => onViewChange('goals')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                currentView === 'goals'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
              <span className="text-sm text-gray-600">Focus Mode</span>
              <button
                onClick={onFocusModeToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  focusModeEnabled ? 'bg-blue-600' : 'bg-gray-200'
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
          
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;