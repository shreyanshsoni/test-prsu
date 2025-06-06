"use client"; // Mark this as a Client Component

import React, { useState, useMemo } from "react";
import { Program } from "../types/types";
import { Trash2, Calendar, Clock, Building, ArrowUpDown } from "lucide-react";
import { formatDate } from '../utils/dateUtils';
import { useTheme } from '../contexts/ThemeContext';

interface SavedProgramsProps {
  programs: Program[];
  onRemoveProgram: (programId: string) => void;
}

type SortKey = "deadline" | "startDate" | "organization";

export default function SavedPrograms({ programs, onRemoveProgram }: SavedProgramsProps) {
  const [sortKey, setSortKey] = useState<SortKey>("deadline");
  const [deletingPrograms, setDeletingPrograms] = useState<Set<string>>(new Set());
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // ✅ Optimized sorting using useMemo to avoid unnecessary re-renders
  const sortedPrograms = useMemo(() => {
    return [...programs].sort((a, b) => {
      if (sortKey === "organization") return a.organization.localeCompare(b.organization);

      const dateA = a[sortKey] ? new Date(a[sortKey] as string).getTime() : 0;
      const dateB = b[sortKey] ? new Date(b[sortKey] as string).getTime() : 0;
      
      return dateA - dateB;
    });
  }, [programs, sortKey]);

  // Handle program deletion with loading state
  const handleDeleteProgram = async (programId: string) => {
    // Add the program to the deleting set
    setDeletingPrograms(prev => {
      const newSet = new Set(prev);
      newSet.add(programId);
      return newSet;
    });

    try {
      // Call the parent component's delete function
      await onRemoveProgram(programId);
    } finally {
      // Always remove from deleting set, even if there was an error
      setDeletingPrograms(prev => {
        const newSet = new Set(prev);
        newSet.delete(programId);
        return newSet;
      });
    }
  };

  return (
    <section className="h-full overflow-hidden flex flex-col">
      {/* ✅ Improved SEO with heading structure */}
      <header className="p-3 sm:p-4 border-b border-light-border dark:border-dark-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:mb-0 mb-2">
          <h1 className="text-xl font-semibold text-light-text dark:text-dark-text">My Selected Programs</h1>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-light-muted dark:text-dark-muted" aria-hidden="true" />
            <label htmlFor="sort" className="sr-only">Sort programs</label>
            <select
              id="sort"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="border border-light-border dark:border-dark-border rounded-lg px-2 sm:px-3 py-1 sm:py-2 bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-primary-500 dark:focus:ring-primary-400 text-sm"
              aria-label="Sort programs by"
            >
              <option value="deadline">Sort by Deadline</option>
              <option value="startDate">Sort by Start Date</option>
              <option value="organization">Sort by Institution</option>
            </select>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-light-card dark:bg-dark-card border-t border-light-border dark:border-dark-border">
        {programs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-16 sm:w-20 h-16 sm:h-20 mb-4 text-light-muted dark:text-dark-muted">
              <Calendar className="w-full h-full" />
            </div>
            <h2 className="text-lg font-medium text-light-text dark:text-dark-text mb-2">No Programs Saved Yet</h2>
            <p className="text-light-muted dark:text-dark-muted">
              Your saved programs will appear here. Browse and save programs from the Program Search tab.
            </p>
          </div>
        ) : (
        <ul className="space-y-3 sm:space-y-4 p-3 sm:p-4">
          {sortedPrograms.map((program) => {
            const formattedDate = formatDate(program.deadline);
            const isDeleting = deletingPrograms.has(program.id);
            
            return (
                <li key={program.id} className="border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card rounded-lg shadow dark:shadow-dark-border/30 p-3 sm:p-4">
                <article>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 mr-2">
                      {/* ✅ SEO-friendly heading */}
                        <h2 className="font-semibold text-base sm:text-lg mb-2 text-light-text dark:text-dark-text">{program.title}</h2>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-light-muted dark:text-dark-muted mb-2">
                        <div className="flex items-center gap-1">
                            <Building className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500 dark:text-primary-400 flex-shrink-0" aria-hidden="true" />
                          <span className="truncate">{program.organization}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500 dark:text-primary-400 flex-shrink-0" aria-hidden="true" />
                          <span>Due: {formattedDate}</span>
                        </div>
                        {program.startDate && (
                          <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500 dark:text-primary-400 flex-shrink-0" aria-hidden="true" />
                            <span>Starts: {formatDate(program.startDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <button
                        onClick={() => handleDeleteProgram(program.id)}
                          className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 p-1 sm:p-2 transition-colors"
                        aria-label={isDeleting ? `Deleting ${program.title}` : `Remove ${program.title}`}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                            <svg className="animate-spin h-5 w-5 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-4">
                      <h3 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base text-light-text dark:text-dark-text">Requirements</h3>
                    {Array.isArray(program.requirements) ? (
                        <ul className="list-disc list-inside text-xs sm:text-sm text-light-muted dark:text-dark-muted">
                        {program.requirements.map((req, index) => (
                          <li key={index} className="mb-1">{req}</li>
                        ))}
                      </ul>
                    ) : (
                        <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted">
                        {program.requirements || 'No specific requirements'}
                      </p>
                    )}
                  </div>

                    {program.field && (
                      <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                          {program.field}
                        </span>
                        {program.degreeLevel && (
                          <span className="text-xs px-2 py-1 rounded-full bg-light-border dark:bg-dark-border text-light-text dark:text-dark-text">
                            {program.degreeLevel}
                          </span>
                        )}
                      </div>
                    )}

                    {program.applicationUrl && (
                      <div className="mt-3 sm:mt-4">
                        <a 
                          href={program.applicationUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 text-sm bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
                        >
                          Apply Now
                        </a>
                      </div>
                    )}
                </article>
              </li>
            );
          })}
        </ul>
        )}
      </div>
    </section>
  );
}