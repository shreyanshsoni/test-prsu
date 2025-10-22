'use client';

import { Toaster } from 'react-hot-toast';
import { ProgramSearchProvider } from './contexts/ProgramSearchContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NameModal } from '../components/NameModal';
import { useNameModal } from '../hooks/useNameModal';

function NameModalWrapper() {
  const { shouldShowModal, isLoading } = useNameModal();
  
  if (isLoading) {
    return null; // Don't show anything while loading
  }
  
  return (
    <NameModal 
      isOpen={shouldShowModal} 
      onClose={() => {}} // Modal will close itself after successful save
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