'use client';

import React, { useEffect } from 'react';
import { StudentSnapshotFlow } from './src/components/StudentSnapshot/StudentSnapshotFlow';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useTheme } from '../contexts/ThemeContext';
import { StarryBackground } from '../../components/ui/StarryBackground';

export default function CustomUserProfilePage() {
  const { theme } = useTheme();
  
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{minHeight: '100vh'}}>
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
        <div style={{ position: 'relative', zIndex: 1 }}>
          <StudentSnapshotFlow />
        </div>
      </div>
    </ProtectedRoute>
  );
} 