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

interface ProgramSearchProps {
  onSaveProgram: (program: Program) => void;
  savedPrograms: Program[];
  isAuthenticated?: boolean;
}

export default function ProgramSearch({ onSaveProgram, savedPrograms, isAuthenticated = false }: ProgramSearchProps) {
  const router = useRouter();
  const { roadmaps, loadRoadmaps } = useRoadmapStore();
  
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
    // Determine if card should be swiped away
    const trigger = velocity > 0.2; 
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
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
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
      <header className="p-5 border-b mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Program Search</h1>
          
          {/* View mode toggle - single button instead of two */}
          <button
            onClick={() => setViewMode(prev => prev === 'list' ? 'swipe' : 'list')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Switch to {viewMode === 'list' ? 'Swipe' : 'List'} View
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Search and filter UI - reorganized layout */}
        <div className="mb-6 px-5 py-3 bg-white rounded-lg mx-4">
          <div className="flex items-center gap-4">
            {/* Filters on the left - made smaller to fit one line */}
            <div className="flex flex-wrap gap-3 flex-1">
          <select
            value={filters.field}
                onChange={(e) => setFilters({ ...filters, field: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          >
                <option value="">All Organizations</option>
                <option value="Harvard University">Harvard University</option>
            <option value="MIT">MIT</option>
                <option value="Stanford University">Stanford University</option>
                <option value="Google">Google</option>
                <option value="NASA">NASA</option>
          </select>
            </div>
            
            {/* Search input on the right */}
            <div className="relative w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search programs..."
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-blue-600 font-medium">{`Loading programs... ${loadingProgress}%`}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPrograms.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-20 h-20 mb-4 text-gray-300">
            <X className="w-full h-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No programs found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Program List View */}
      {!loading && filteredPrograms.length > 0 && viewMode === 'list' && (
        <div className="p-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Only render the visible items for better performance */}
            {filteredPrograms.map((program) => {
              const isSaving = savingPrograms.has(program.id);
              const isRejecting = rejectingPrograms.has(program.id);
              return (
              <article key={program.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 relative">
                  <Image
                    src={program.imageUrl || "/images/default-opportunity.jpg"}
                    alt={(program.title || "No Title Available")}
                    fill
                    className="object-cover"
                    loading="lazy" // Add lazy loading for images
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <h3 className="text-white font-semibold text-lg">{program.title || "No Title Available"}</h3>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {program.description || "No description available"}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Deadline: {program.deadline
                        ? new Date(program.deadline).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })
                        : "N/A"}
                    </span>
                    <div className="flex gap-2">
                      {savedPrograms.some(p => p.id === program.id) ? (
                        <button
                          disabled
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-600"
                        >
                          Saved
                        </button>
                      ) : rejectedPrograms.has(program.id) ? (
                        <button
                          disabled
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-600"
                        >
                          Rejected
                        </button>
                      ) : (
                        <>
                            {!isSaving && (
                          <button
                                onClick={() => handleRejectProgram(program)}
                                disabled={isRejecting}
                                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                  isRejecting
                                    ? 'bg-red-100 text-red-600' 
                                    : 'bg-red-600 text-white hover:bg-red-700'
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
                                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                  isSaving 
                                    ? 'bg-blue-100 text-blue-600' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
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
          
          {/* List View Pagination Controls - Redesigned with cool blue shades */}
          {filteredPrograms.length > 0 && (
            <div className="flex justify-center mt-10 mb-6">
              <div className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-1.5 rounded-xl shadow-sm">
              <button 
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                  className={`flex items-center justify-center h-9 w-9 rounded-lg transition-all duration-200 ${
                    currentPage === 1 
                      ? 'text-indigo-300 cursor-not-allowed' 
                      : 'text-indigo-600 hover:bg-indigo-100 hover:shadow-md'
                  }`}
                  aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
                <div className="flex mx-2">
                  {/* Show page numbers with current page highlighted */}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    // Logic to show pagination numbers centered around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      // If 5 or fewer pages, show all
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      // If near start, show first 5 pages
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      // If near end, show last 5 pages
                      pageNum = totalPages - 4 + i;
                    } else {
                      // Otherwise show current page and 2 on each side
                      pageNum = currentPage - 2 + i;
                    }
                    
                    // Is this the current page?
                    const isCurrentPage = pageNum === currentPage;
                    
                    return (
                      <button
                        key={`page-${i}-${pageNum}`}
                        onClick={() => handleSetPage(pageNum)}
                        className={`flex items-center justify-center h-9 w-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isCurrentPage
                            ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md transform scale-105'
                            : 'text-indigo-800 hover:bg-indigo-100'
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
                  className={`flex items-center justify-center h-9 w-9 rounded-lg transition-all duration-200 ${
                    currentPage === totalPages 
                      ? 'text-indigo-300 cursor-not-allowed' 
                      : 'text-indigo-600 hover:bg-indigo-100 hover:shadow-md'
                  }`}
                  aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            </div>
          )}
        </div>
      )}

      {/* Program Swipe View */}
      {filteredPrograms.length > 0 && viewMode === 'swipe' && (
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {/* Display total count and current position */}
          <div className="absolute top-4 left-0 right-0 text-center text-sm font-medium text-gray-500">
            <span className="bg-white px-4 py-1 rounded-full shadow-sm">
              {Math.min(currentIndex + 1, filteredPrograms.length)} of {filteredPrograms.length} opportunities
            </span>
          </div>
          
          {/* Card Container - Make sure it has enough space for the cards */}
          <div className="relative w-[70vw] h-[65vh] max-w-[450px] max-h-[800px] perspective-1000 my-4">
            {/* Render the cards with stacking effect - map through filtered programs */}
            {filteredPrograms.slice(currentIndex, currentIndex + 3).map((program, i) => (
              <ProgramCard
                key={program.id}
                program={program}
                isSwipeMode={true}
                style={{
                  x: 0,
                  y: i * 8,
                  scale: 1 - i * 0.05,
                  rot: -2 + Math.random() * 4,
                  opacity: 1,
                  zIndex: 3 - i,
                  position: 'absolute',
                  top: i * 10,
                  left: 0,
                  right: 0,
                  margin: '0 auto'
                }}
                {...bind(i)}
              />
            ))}
            
            {/* Message when there are no more cards to show */}
            {filteredPrograms.length > 0 && currentIndex >= filteredPrograms.length && (
              <div className="absolute inset-0 flex items-center justify-center bg-white rounded-2xl shadow-lg p-6 text-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No more opportunities</h3>
                  <p className="text-gray-600 mb-4">You've gone through all available opportunities</p>
                  <button
                    onClick={() => {
                      setCurrentIndex(0);
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Swipe Controls - Only show if there are cards to display */}
          {filteredPrograms.length > 0 && currentIndex < filteredPrograms.length && (
            <div className="flex justify-center gap-8 mt-6 mb-4 z-10">
              {!savingPrograms.has(filteredPrograms[currentIndex].id) && !rejectingPrograms.has(filteredPrograms[currentIndex].id) && (
              <button
                onClick={() => {
                  if (filteredPrograms.length > 0 && currentIndex < filteredPrograms.length) {
                    // Check auth immediately
                    if (!isAuthenticated) {
                      router.push('/api/auth/login');
                      return;
                    }
                    
                    // Manually trigger swipe left animation
                    api.start(i => {
                      if (i !== 0) return;
                      return {
                        x: -1000,
                        rot: -10,
                        scale: 0.9,
                        opacity: 0,
                        config: { friction: 50, tension: 800, duration: 300 }
                      };
                    });
                      // Process the approval after a short delay to allow animation
                    setTimeout(() => {
                      handleProgramAction(filteredPrograms[currentIndex], false);
                    }, 300);
                  }
                }}
                className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              )}
              {rejectingPrograms.has(filteredPrograms[currentIndex].id) && (
                <button
                  disabled
                  className="w-16 h-16 rounded-full bg-red-50 shadow-lg flex items-center justify-center text-red-600 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="inline-flex">
                      <span className="saving-dot"></span>
                      <span className="saving-dot"></span>
                      <span className="saving-dot"></span>
                    </span>
                  </div>
                </button>
              )}
              {!rejectingPrograms.has(filteredPrograms[currentIndex].id) && (
              <button
                onClick={() => {
                  if (filteredPrograms.length > 0 && currentIndex < filteredPrograms.length) {
                    // Check auth immediately
                    if (!isAuthenticated) {
                      router.push('/api/auth/login');
                      return;
                    }
                      
                      const currentProgram = filteredPrograms[currentIndex];
                      const isSaving = savingPrograms.has(currentProgram.id);
                      
                      // Don't allow clicking if already saving
                      if (isSaving) return;
                    
                    // Manually trigger swipe right animation
                    api.start(i => {
                      if (i !== 0) return;
                      return {
                        x: 1000,
                        rot: 10,
                        scale: 0.9,
                        opacity: 0,
                        config: { friction: 50, tension: 800, duration: 300 }
                      };
                    });
                    // Process the approval after a short delay to allow animation
                    setTimeout(() => {
                        handleProgramAction(currentProgram, true);
                    }, 300);
                  }
                }}
                  disabled={filteredPrograms.length > 0 && savingPrograms.has(filteredPrograms[currentIndex].id)}
                  className={`w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center ${
                    filteredPrograms.length > 0 && savingPrograms.has(filteredPrograms[currentIndex].id)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-green-500 hover:bg-green-50'
                  } transition-colors`}
                >
                  {filteredPrograms.length > 0 && savingPrograms.has(filteredPrograms[currentIndex].id) ? (
                    <div className="flex items-center">
                      <span className="inline-flex">
                        <span className="saving-dot"></span>
                        <span className="saving-dot"></span>
                        <span className="saving-dot"></span>
                      </span>
                    </div>
                  ) : (
                <Heart className="w-8 h-8" />
                  )}
              </button>
              )}
            </div>
          )}

          {/* Swipe directions help */}
          <div className="flex justify-center gap-16 mb-2">
            <div className="text-sm text-gray-500 flex items-center">
              <X className="w-4 h-4 mr-1 text-red-500" /> Swipe left to reject
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <Heart className="w-4 h-4 mr-1 text-green-500" /> Swipe right to save
            </div>
          </div>
        </div>
      )}
    </div>
    </section>
  );
}