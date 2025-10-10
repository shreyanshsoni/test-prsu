'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const [isChangingTheme, setIsChangingTheme] = useState(false);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setIsChangingTheme(true); // Mark that we're changing theme
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  // Set theme directly
  const updateTheme = (newTheme: Theme) => {
    setIsChangingTheme(true); // Mark that we're changing theme
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // On initial mount, get theme from localStorage or default to light mode
  useEffect(() => {
    setMounted(true);
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Always default to light mode
      setTheme('light');
      localStorage.setItem('theme', 'light');
    }
  }, []);

  // This effect handles theme changes with synchronization
  useEffect(() => {
    if (!mounted || !isChangingTheme) return;
    
    const root = window.document.documentElement;
    
    // Step 1: Add a class that disables all transitions
    root.classList.add('disable-transitions');
    
    // Step 2: Apply the theme change 
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Step 3: Force a reflow to ensure all elements update at once
    // This is a bit of a hack but it forces the browser to apply all style changes immediately
    // eslint-disable-next-line no-unused-expressions
    root.scrollTop;
    
    // Step 4: Re-enable transitions after a short delay to ensure everything has updated
    setTimeout(() => {
      root.classList.remove('disable-transitions');
      setIsChangingTheme(false);
    }, 50);
  }, [theme, mounted, isChangingTheme]);

  // Add the global style for disabling transitions
  useEffect(() => {
    if (!mounted) return;
    
    // Create a style element for our transition disabling class
    const style = document.createElement('style');
    style.innerHTML = `
      .disable-transitions,
      .disable-transitions *,
      .disable-transitions *::before,
      .disable-transitions *::after {
        transition: none !important;
        animation: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [mounted]);

  const contextValue = {
    theme,
    toggleTheme,
    setTheme: updateTheme,
  };

  // Prevent flash of wrong theme while loading
  return (
    <ThemeContext.Provider value={contextValue}>
      {mounted && children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 