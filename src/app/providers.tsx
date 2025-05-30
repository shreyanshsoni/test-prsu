'use client';

import { Toaster } from 'react-hot-toast';
import { ProgramSearchProvider } from './contexts/ProgramSearchContext';

export default function Providers({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <ProgramSearchProvider>
        <main className="flex-grow">{children}</main>
        <Toaster position="bottom-right" />
      </ProgramSearchProvider>
    </div>
  );
} 