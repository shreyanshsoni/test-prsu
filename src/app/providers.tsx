'use client';

import { Toaster } from 'react-hot-toast';
import { ProgramSearchProvider } from './contexts/ProgramSearchContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NameModal } from '../components/NameModal';
import { useNameModal } from '../hooks/useNameModal';

function NameModalWrapper() {
  const { shouldShowModal, isLoading, redirectTo, closeModal } = useNameModal();
  
  if (isLoading) {
    return null; // Don't show anything while loading
  }
  
  return (
    <NameModal 
      isOpen={shouldShowModal} 
      onClose={closeModal} // Pass the closeModal function
      redirectTo={redirectTo}
    />
  );
}

export default function Providers({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <ThemeProvider>
    <div className="flex flex-col min-h-screen">
      <ProgramSearchProvider>
        <main className="flex-grow">{children}</main>
        <Toaster position="bottom-right" />
        <NameModalWrapper />
      </ProgramSearchProvider>
    </div>
    </ThemeProvider>
  );
} 