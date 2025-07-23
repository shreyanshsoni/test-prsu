'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Program } from '../types/types';
import { searchOpportunities } from '../../lib/services/opportunityService';

type ProgramSearchContextType = {
  programs: Program[];
  loading: boolean;
  loadingProgress: number;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  setCurrentPage: (page: number) => void;
  refreshPrograms: () => Promise<void>;
};

const ProgramSearchContext = createContext<ProgramSearchContextType | null>(null);

export const useProgramSearch = () => {
  const context = useContext(ProgramSearchContext);
  if (!context) {
    throw new Error('useProgramSearch must be used within a ProgramSearchProvider');
  }
  return context;
};

export const ProgramSearchProvider = ({ children }: { children: ReactNode }) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [cachedPages, setCachedPages] = useState<Map<number, Program[]>>(new Map());
  const itemsPerPage = 21;

  const loadOpportunities = async (page: number) => {
    // Check if we already have this page cached
    if (cachedPages.has(page)) {
      console.log(`Loading page ${page} from cache`);
      setPrograms(cachedPages.get(page) || []);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadingProgress(0);
    
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.floor(Math.random() * 10) + 1;
      });
    }, 200);
    
    try {
      const result = await searchOpportunities(page, itemsPerPage);
      
      // Check if we're getting data from mock
      if (result.fromMock) {
        console.log('Using mock data due to API connectivity issues');
      }
      
      // Cache the results
      setCachedPages(prev => {
        const updated = new Map(prev);
        updated.set(page, result.programs);
        return updated;
      });
      
      // Set the programs
      setPrograms(result.programs);
      
      // Update pagination info
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.total);
      
      // Complete the loading progress
      setLoadingProgress(100);
      
      // Clear interval if it hasn't already been cleared
      clearInterval(progressInterval);
      
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Short delay before hiding loading indicator to ensure progress animation completes
      setTimeout(() => {
        setLoading(false);
      }, 300);
    } catch (error) {
      console.error('Error loading opportunities:', error);
      
      // Clear progress indicators
      clearInterval(progressInterval);
      setLoadingProgress(0);
      setLoading(false);
      
      // Use empty program list in case of complete failure
      if (programs.length === 0) {
        // Start with empty state on initial load failure
        setPrograms([]);
        setTotalPages(1);
        setTotalItems(0);
      }
      // Otherwise keep existing data (don't replace it)
    }
  };

  // Load opportunities when page changes
  useEffect(() => {
    loadOpportunities(currentPage);
  }, [currentPage]);

  // Force refresh programs (invalidate cache for current page)
  const refreshPrograms = async () => {
    // Remove the current page from cache
    setCachedPages(prev => {
      const updated = new Map(prev);
      updated.delete(currentPage);
      return updated;
    });
    
    // Load fresh data
    await loadOpportunities(currentPage);
  };

  return (
    <ProgramSearchContext.Provider
      value={{
        programs,
        loading,
        loadingProgress,
        currentPage,
        totalPages,
        totalItems,
        setCurrentPage,
        refreshPrograms
      }}
    >
      {children}
    </ProgramSearchContext.Provider>
  );
}; 