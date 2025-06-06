'use client'; // Mark this as a Client Component

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Filter, X, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image'; // Use Next.js Image component
import { Program } from '../types/types';
import { programs } from '../data/programs';
import ProgramBrowser from './ProgramBrowser';
import { useSprings } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import ProgramCard from './ProgramCard';
import { useRouter } from 'next/navigation';
import { rejectUserProgram } from '../services/userProgramService';
import { useRoadmapStore } from '../hooks/useRoadmapStore';
import { addProgramToRoadmap } from '../services/roadmapService';
import { useProgramSearch } from '../contexts/ProgramSearchContext';
import { useTheme } from '../contexts/ThemeContext';

interface ProgramSearchProps {
  onSaveProgram: (program: Program) => void;
  savedPrograms: Program[];
  isAuthenticated?: boolean;
}

export default function ProgramSearch({ onSaveProgram, savedPrograms, isAuthenticated = false }: ProgramSearchProps) {
  const router = useRouter();
  const { roadmaps, loadRoadmaps } = useRoadmapStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Use the context instead of local state for programs data
  const { 
    programs, 
    loading, 
    loadingProgress, 
    currentPage, 
    totalPages, 
    totalItems, 
    setCurrentPage,
    refreshPrograms 
  } = useProgramSearch();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    field: '',
    degreeLevel: '',
    organization: '',
  });
  const [viewMode, setViewMode] = useState<'list' | 'swipe'>('list');
  const [rejectedPrograms, setRejectedPrograms] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savingPrograms, setSavingPrograms] = useState<Set<string>>(new Set());
  const [rejectingPrograms, setRejectingPrograms] = useState<Set<string>>(new Set());
  const itemsPerPage = 21;

  // Function to check authentication and redirect if not authenticated
  const checkAuthAndProceed = (callback: () => void) => {
    if (!isAuthenticated) {
      // Redirect to login page
      router.push('/api/auth/login');
      return;
    }
    
    // If authenticated, proceed with the callback
    callback();
  };

  const handleRejectProgram = useCallback(async (program: Program) => {
    if (!isAuthenticated) {
      router.push('/api/auth/login');
      return;
    }
    
    // Set the program as being rejected
    setRejectingPrograms(prev => {
      const updated = new Set(prev);
      updated.add(program.id);
      return updated;
    });
    
    try {
    // First store the rejection in the database for authenticated users
      const success = await rejectUserProgram(program.id);
      
        if (success) {
          // Then update local state
          setRejectedPrograms(prev => {
            const updated = new Set(prev);
            updated.add(program.id);
            return updated;
          });
        }
    } catch (error) {
        console.error('Error rejecting program:', error);
    } finally {
      // Always remove from rejecting set when done
      setRejectingPrograms(prev => {
        const updated = new Set(prev);
        updated.delete(program.id);
        return updated;
      });
    }
  }, [isAuthenticated, router]);

  // Memoize filtered programs for better performance
  const filteredPrograms = useMemo(() => {
    return programs.filter(program => {
      // Skip null checks if the program is invalid
      if (!program) return false;
      
      // Basic search and filter matching
      const matchesSearch = searchTerm === '' || 
        ((program.title || '').toLowerCase().includes(searchTerm.toLowerCase())) ||
        ((program.description || '').toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilters = 
        (!filters.field || !program.field || program.field === filters.field) &&
        (!filters.degreeLevel || !program.degreeLevel || program.degreeLevel === filters.degreeLevel) &&
        (!filters.organization || !program.organization || program.organization === filters.organization);

      // For swipe view, filter out both rejected and saved programs
      if (viewMode === 'swipe') {
        if (rejectedPrograms.has(program.id) || savedPrograms.some(p => p.id === program.id)) {
          return false;
        }
      }

      return matchesSearch && matchesFilters;
    });
  }, [programs, searchTerm, filters, viewMode, rejectedPrograms, savedPrograms]);

  // Add a function to save a program to a roadmap using the store
  const handleSaveProgramToRoadmap = async (program: Program) => {
    if (!isAuthenticated) {
      router.push('/api/auth/login');
      return;
    }
    
    try {
      // Call the original onSaveProgram to handle UI updates
      await onSaveProgram(program);
      
      // If we have roadmaps available, try to add to the first one
      if (roadmaps.length > 0) {
        const firstRoadmap = roadmaps[0];
        
        // Check if the program is already in the roadmap
        const programExists = firstRoadmap.programs.some(p => p.id === program.id);
        if (!programExists) {
          // Add to the first roadmap (since we don't have UI to choose)
          await addProgramToRoadmap(firstRoadmap.id, program.id, program);
          
          // Refresh roadmaps data silently in the background
          loadRoadmaps(true);
        }
      }
      
      return true; // Return success
    } catch (error) {
      console.error('Error saving program to roadmap:', error);
      return false; // Return failure
    }
  };

  // Modify the handleProgramAction to use the new function
  const handleProgramAction = useCallback((program: Program, isRightSwipe: boolean) => {
    checkAuthAndProceed(async () => {
      if (isRightSwipe) {
        // Set the program as being saved
        setSavingPrograms(prev => {
          const updated = new Set(prev);
          updated.add(program.id);
          return updated;
        });
        
        try {
        // Use the new function that updates the store
          await handleSaveProgramToRoadmap(program);
        } finally {
          // Remove the program from the saving set when done
          setSavingPrograms(prev => {
            const updated = new Set(prev);
            updated.delete(program.id);
            return updated;
          });
        }
      } else {
        // Set the program as being rejected
        setRejectingPrograms(prev => {
          const updated = new Set(prev);
          updated.add(program.id);
          return updated;
        });
        
        try {
          // Store rejection in database
          const success = await rejectUserProgram(program.id);
          
          if (success) {
            // Update local state if successful
            setRejectedPrograms(prev => {
              const updated = new Set(prev);
              updated.add(program.id);
              return updated;
            });
          }
        } catch (error) {
          console.error('Error rejecting program:', error);
        } finally {
          // Remove from rejecting set when done
          setRejectingPrograms(prev => {
            const updated = new Set(prev);
            updated.delete(program.id);
            return updated;
          });
        }
      }
      
      // Move to the next card
      setCurrentIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        console.log(`Moving from card ${prevIndex} to ${nextIndex}. Total cards: ${filteredPrograms.length}`);
        
        // If we're at the end of the current batch, load more
        if (nextIndex >= filteredPrograms.length - 2 && currentPage < totalPages && !loading) {
          console.log('Near the end, loading more...');
          setCurrentPage(prevPage => prevPage + 1);
        }
        
        return nextIndex;
      });
    });
  }, [checkAuthAndProceed, handleSaveProgramToRoadmap, filteredPrograms.length, currentPage, totalPages, loading, setSavingPrograms, setRejectedPrograms, setRejectingPrograms]);

  // Update the Save button click handler
  const handleSaveButtonClick = (program: Program) => {
    if (!isAuthenticated) {
      router.push('/api/auth/login');
      return;
    }
    
    // Set the program as being saved
    setSavingPrograms(prev => {
      const updated = new Set(prev);
      updated.add(program.id);
      return updated;
    });
    
    // Call the save function
    handleSaveProgramToRoadmap(program)
      .finally(() => {
        // Remove the program from the saving set only when save is complete
        setSavingPrograms(prev => {
          const updated = new Set(prev);
          updated.delete(program.id);
          return updated;
        });
      });
  };

  // Memoize springs to prevent unnecessary recreations
  const [springs, api] = useSprings(
    // Only create springs for the visible cards to improve performance
    Math.min(filteredPrograms.length, 5), 
    i => ({
      x: 0,
      y: i * -10, // Increase stacking offset for more visible effect
      scale: 1 - i * 0.05, // Each card slightly smaller
      rot: -5 + Math.random() * 10, // More random rotation for natural feel
      zIndex: filteredPrograms.length - i, // Stack cards properly with z-index
      opacity: 1,
      config: { friction: 40, tension: 400 }
    }),
    [filteredPrograms.length > 0 ? filteredPrograms[0].id : null]
  );

  // Drag handler for swipe cards
  const bind = useDrag(({ 
    args: [index], 
    down, 
    movement: [mx], 
    direction: [xDir], 
    velocity 
  }) => {
    // Extract velocity for x axis as a number
    const velocityX = Array.isArray(velocity) ? velocity[0] : 0;
    // Determine if card should be swiped away
    const trigger = velocityX > 0.2; 
    const dir = xDir < 0 ? -1 : 1;
    const isGone = !down && trigger;

    // Update the spring animation for the dragged card
    api.start(i => {
      // Only animate the card being dragged
      if (i !== index) return;
      
      // If the card is swiped away
      if (isGone) {
        // Check auth immediately, don't wait for animation
        if (!isAuthenticated) {
          router.push('/api/auth/login');
          return;
        }
        
        // Process the swipe action after animation
        setTimeout(() => {
          handleProgramAction(filteredPrograms[currentIndex + index], dir === 1);
        }, 300);
        
        // Flying out animation
        return {
          x: (200 + window.innerWidth) * dir,
          rot: mx / 50 + (dir * 10),
          scale: 0.9,
          opacity: 0,
          config: { friction: 40, tension: 500, duration: 300 }
        };
      }
      
      // Otherwise, just drag the card
      return {
        x: down ? mx : 0,
        rot: down ? mx / 50 : 0,
        scale: down ? 1.05 : 1,
        opacity: 1,
        immediate: down,
        config: { friction: 50, tension: down ? 800 : 500 }
      };
    });
  });

  // Updated pagination controls handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Handler for directly setting page number
  const handleSetPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  // Handle search and filter actions - updates from the context approach
  const handleSearchOrFilterChange = () => {
    refreshPrograms();
  };

  return (
    <section className="h-full overflow-hidden flex flex-col">
      {/* CSS for the animated dots */}
      <style jsx global>{`
        @keyframes dot-up-down {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .saving-dot {
          display: inline-block;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: currentColor;
          margin: 0 1px;
        }
        .saving-dot:nth-child(1) {
          animation: dot-up-down 1s infinite 0.1s;
        }
        .saving-dot:nth-child(2) {
          animation: dot-up-down 1s infinite 0.2s;
        }
        .saving-dot:nth-child(3) {
          animation: dot-up-down 1s infinite 0.3s;
        }
      `}</style>

      {/* Header with title */}
      <header className="p-3 sm:p-5 border-b border-light-border dark:border-dark-border mb-3 sm:mb-6">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-lg sm:text-xl font-semibold text-light-text dark:text-dark-text">Program Search</h1>
          
          {/* View mode toggle - single button instead of two */}
          <button
            onClick={() => setViewMode(prev => prev === 'list' ? 'swipe' : 'list')}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors text-sm sm:text-base sm:whitespace-nowrap max-w-[120px] sm:max-w-none text-center"
          >
            Switch to<br className="sm:hidden" /> {viewMode === 'list' ? 'Swipe' : 'List'} View
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Search and filter UI - reorganized for mobile */}
        <div className="mb-4 sm:mb-6 px-3 sm:px-5 py-3 bg-light-card dark:bg-dark-card rounded-lg mx-2 sm:mx-4 shadow dark:shadow-dark-border/30">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            {/* Search input first on mobile */}
            <div className="relative w-full sm:w-80 order-1 sm:order-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-light-muted dark:text-dark-muted" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search programs..."
                className="w-full py-2 pl-10 pr-4 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text placeholder-light-muted dark:placeholder-dark-muted focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 text-sm sm:text-base"
              />
            </div>
            
            {/* Filters below on mobile */}
            <div className="flex flex-wrap gap-2 sm:gap-3 flex-1 order-2 sm:order-1">
              <select
                value={filters.field}
                onChange={(e) => setFilters({ ...filters, field: e.target.value })}
                className="px-2 sm:px-4 py-1.5 sm:py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 text-xs sm:text-sm flex-1"
              >
                <option value="">All Fields</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Business">Business</option>
                <option value="Medicine">Medicine</option>
                <option value="Arts">Arts</option>
              </select>
              <select
                value={filters.degreeLevel}
                onChange={(e) => setFilters({ ...filters, degreeLevel: e.target.value })}
                className="px-2 sm:px-4 py-1.5 sm:py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 text-xs sm:text-sm flex-1"
              >
                <option value="">All Degree Levels</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Graduate">Graduate</option>
                <option value="Doctoral">Doctoral</option>
                <option value="Certificate">Certificate</option>
              </select>
              <select
                value={filters.organization}
                onChange={(e) => setFilters({ ...filters, organization: e.target.value })}
                className="px-2 sm:px-4 py-1.5 sm:py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 text-xs sm:text-sm flex-1"
              >
                <option value="">All Organizations</option>
                <option value="Harvard University">Harvard University</option>
                <option value="MIT">MIT</option>
                <option value="Stanford University">Stanford University</option>
                <option value="Google">Google</option>
                <option value="NASA">NASA</option>
              </select>
            </div>
          </div>
          
          {/* Search button for mobile */}
          <button
            onClick={handleSearchOrFilterChange}
            className="mt-3 px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors text-sm w-full sm:hidden"
          >
            Search Programs
          </button>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary-500 dark:border-primary-400 mb-4"></div>
          <p className="text-primary-600 dark:text-primary-400 font-medium text-sm sm:text-base">{`Loading programs... ${loadingProgress}%`}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPrograms.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 text-light-muted dark:text-dark-muted">
            <X className="w-full h-full" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-light-text dark:text-dark-text mb-1">No programs found</h3>
          <p className="text-sm text-light-muted dark:text-dark-muted">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Program List View */}
      {!loading && filteredPrograms.length > 0 && viewMode === 'list' && (
        <div className="p-2 sm:p-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Only render the visible items for better performance */}
            {filteredPrograms.map((program) => {
              const isSaving = savingPrograms.has(program.id);
              const isRejecting = rejectingPrograms.has(program.id);
              return (
              <article key={program.id} className="bg-light-card dark:bg-dark-card rounded-lg shadow dark:shadow-dark-border/30 overflow-hidden">
                <div className="h-36 sm:h-48 relative">
                  <Image
                    src={program.imageUrl || "/images/default-opportunity.jpg"}
                    alt={(program.title || "No Title Available")}
                    fill
                    className="object-cover"
                    loading="lazy" // Add lazy loading for images
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3 sm:p-4">
                    <h3 className="text-white font-semibold text-base sm:text-lg line-clamp-2">{program.title || "No Title Available"}</h3>
                  </div>
                </div>

                <div className="p-3 sm:p-4">
                  <p className="text-light-muted dark:text-dark-muted text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">
                    {program.description || "No description available"}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <span className="text-xs sm:text-sm text-light-muted dark:text-dark-muted">
                      Deadline: {program.deadline
                        ? new Date(program.deadline).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })
                        : "N/A"}
                    </span>
                    <div className="flex gap-2 justify-end sm:justify-start">
                      {savedPrograms.some(p => p.id === program.id) ? (
                        <button
                          disabled
                          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                        >
                          Saved
                        </button>
                      ) : rejectedPrograms.has(program.id) ? (
                        <button
                          disabled
                          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                        >
                          Rejected
                        </button>
                      ) : (
                        <>
                          {!isSaving && (
                            <button
                              onClick={() => handleRejectProgram(program)}
                              disabled={isRejecting}
                              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium ${
                                isRejecting
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                                  : 'bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-600'
                              } transition-colors`}
                            >
                              {isRejecting ? (
                                <span className="flex items-center">
                                  Rejecting
                                  <span className="ml-1 inline-flex">
                                    <span className="saving-dot"></span>
                                    <span className="saving-dot"></span>
                                    <span className="saving-dot"></span>
                                  </span>
                                </span>
                              ) : (
                                'Reject'
                              )}
                            </button>
                          )}
                          {!isRejecting && (
                            <button
                              onClick={() => handleSaveButtonClick(program)}
                              disabled={isSaving}
                              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium ${
                                isSaving 
                                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                                  : 'bg-primary-600 dark:bg-primary-700 text-white hover:bg-primary-700 dark:hover:bg-primary-600'
                              } transition-colors`}
                            >
                              {isSaving ? (
                                <span className="flex items-center">
                                  Saving
                                  <span className="ml-1 inline-flex">
                                    <span className="saving-dot"></span>
                                    <span className="saving-dot"></span>
                                    <span className="saving-dot"></span>
                                  </span>
                                </span>
                              ) : (
                                'Save'
                              )}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </article>
              );
            })}
          </div>
          
          {/* List View Pagination Controls - Redesigned for mobile */}
          {filteredPrograms.length > 0 && (
            <div className="flex justify-center mt-6 sm:mt-10 mb-4 sm:mb-6">
              <div className="flex items-center bg-light-card dark:bg-dark-card p-1 sm:p-1.5 rounded-xl shadow-sm dark:shadow-dark-border/30">
                <button 
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-lg transition-all duration-200 ${
                    currentPage === 1 
                      ? 'text-light-muted dark:text-dark-muted cursor-not-allowed' 
                      : 'text-primary-600 dark:text-primary-400 hover:bg-light-border dark:hover:bg-dark-border hover:shadow-md'
                  }`}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              
                <div className="flex mx-1 sm:mx-2">
                  {/* Show fewer page numbers on mobile */}
                  {Array.from({ length: Math.min(totalPages, window.innerWidth < 640 ? 3 : 5) }, (_, i) => {
                    // Logic to show pagination numbers centered around current page
                    let pageNum;
                    const maxVisible = window.innerWidth < 640 ? 3 : 5;
                    
                    if (totalPages <= maxVisible) {
                      // If fewer pages than max visible, show all
                      pageNum = i + 1;
                    } else if (currentPage <= Math.ceil(maxVisible / 2)) {
                      // If near start, show first N pages
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - Math.floor(maxVisible / 2)) {
                      // If near end, show last N pages
                      pageNum = totalPages - (maxVisible - 1) + i;
                    } else {
                      // Otherwise show current page and appropriate number on each side
                      pageNum = currentPage - Math.floor(maxVisible / 2) + i;
                    }
                    
                    // Is this the current page?
                    const isCurrentPage = pageNum === currentPage;
                    
                    return (
                      <button
                        key={`page-${i}-${pageNum}`}
                        onClick={() => handleSetPage(pageNum)}
                        className={`flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                          isCurrentPage
                            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md transform scale-105'
                            : 'text-primary-700 dark:text-primary-400 hover:bg-light-border dark:hover:bg-dark-border'
                        }`}
                        aria-label={`Page ${pageNum}`}
                        aria-current={isCurrentPage ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              
                <button 
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-lg transition-all duration-200 ${
                    currentPage === totalPages 
                      ? 'text-light-muted dark:text-dark-muted cursor-not-allowed' 
                      : 'text-primary-600 dark:text-primary-400 hover:bg-light-border dark:hover:bg-dark-border hover:shadow-md'
                  }`}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Program Swipe View */}
      {filteredPrograms.length > 0 && viewMode === 'swipe' && (
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <ProgramBrowser 
            programs={filteredPrograms}
            onApprove={(program) => handleSaveProgramToRoadmap(program)}
            onReject={(program) => handleRejectProgram(program)}
            onGoBack={() => setViewMode('list')}
          />
        </div>
      )}
    </section>
  );
}