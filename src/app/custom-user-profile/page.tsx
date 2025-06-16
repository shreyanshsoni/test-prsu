'use client';

import React, { useEffect } from 'react';
import { StudentSnapshotFlow } from './src/components/StudentSnapshot/StudentSnapshotFlow';
import ProtectedRoute from '../components/ProtectedRoute';
import { useTheme } from '../contexts/ThemeContext';
import { StarryBackground } from '../components/ui/StarryBackground';

export default function CustomUserProfilePage() {
  const { theme } = useTheme();
  
  // Force dark background styles
  useEffect(() => {
    if (theme === 'dark') {
      // Create a style element for forced dark mode
      const style = document.createElement('style');
      style.setAttribute('id', 'dark-mode-force');
      style.innerHTML = `
        body {
          background-color: #111827 !important; /* bg-gray-900 */
        }
        
        .dark-content-wrapper {
          background-color: transparent !important;
        }
        
        .dark-content-wrapper * .min-h-screen {
          background-color: transparent !important;
          background-image: none !important;
        }
        
        .dark-content-wrapper * .bg-white {
          background-color: #1f2937 !important; /* bg-gray-800 */
        }
        
        .dark-content-wrapper * .bg-gray-50 {
          background-color: #374151 !important; /* bg-gray-700 */
        }
      `;
      document.head.appendChild(style);
      
      // Cleanup function
      return () => {
        const darkModeStyle = document.getElementById('dark-mode-force');
        if (darkModeStyle) {
          document.head.removeChild(darkModeStyle);
        }
      };
    }
  }, [theme]);
  
  return (
    <ProtectedRoute>
      <div className={theme === 'dark' ? 'dark-mode-global' : ''} style={{minHeight: '100vh'}}>
        {theme === 'dark' && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#111827', // bg-gray-900
            zIndex: -1
          }}>
            <StarryBackground />
          </div>
        )}
        <div className={theme === 'dark' ? 'dark-content-wrapper' : ''} style={{ position: 'relative', zIndex: 1 }}>
          <StudentSnapshotFlow />
        </div>
      </div>
    </ProtectedRoute>
  );
} 