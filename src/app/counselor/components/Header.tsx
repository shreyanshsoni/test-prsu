import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Header: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>Student Progress</h1>
        <p className={`${isDark ? 'text-dark-muted' : 'text-gray-600'} mt-2`}>Monitor and manage student college preparation progress</p>
      </div>
    </div>
  );
};

export default Header;
