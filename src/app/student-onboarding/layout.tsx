'use client';

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function StudentOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      {children}
    </div>
  );
} 