"use client"; // Mark this as a Client Component

import React, { useState, useMemo } from "react";
import { Program } from "../types/types";
import { Trash2, Calendar, Clock, Building, ArrowUpDown } from "lucide-react";
import { formatDate } from '../utils/dateUtils';

interface SavedProgramsProps {
  programs: Program[];
  onRemoveProgram: (programId: string) => void;
}

type SortKey = "deadline" | "startDate" | "organization";

export default function SavedPrograms({ programs, onRemoveProgram }: SavedProgramsProps) {
  const [sortKey, setSortKey] = useState<SortKey>("deadline");
  const [deletingPrograms, setDeletingPrograms] = useState<Set<string>>(new Set());

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
      <header className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">My Selected Programs</h1>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500" aria-hidden="true" />
            <label htmlFor="sort" className="sr-only">Sort programs</label>
            <select
              id="sort"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="border rounded-lg px-3 py-2"
              aria-label="Sort programs by"
            >
              <option value="deadline">Sort by Deadline</option>
              <option value="startDate">Sort by Start Date</option>
              <option value="organization">Sort by Institution</option>
            </select>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-4">
          {sortedPrograms.map((program) => {
            const formattedDate = formatDate(program.deadline);
            const isDeleting = deletingPrograms.has(program.id);
            
            return (
              <li key={program.id} className="bg-white rounded-lg shadow-md p-4">
                <article>
                  <div className="flex items-start justify-between">
                    <div>
                      {/* ✅ SEO-friendly heading */}
                      <h2 className="font-semibold text-lg mb-2">{program.title}</h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4" aria-hidden="true" />
                          <span>{program.organization}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" aria-hidden="true" />
                          <span>Due: {formattedDate}</span>
                        </div>
                        {program.startDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" aria-hidden="true" />
                            <span>Starts: {formatDate(program.startDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteProgram(program.id)}
                        className="text-red-500 hover:text-red-600 p-2"
                        aria-label={isDeleting ? `Deleting ${program.title}` : `Remove ${program.title}`}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                        <Trash2 className="w-5 h-5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Requirements</h3>
                    {Array.isArray(program.requirements) ? (
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {program.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-600">
                        {program.requirements || 'No specific requirements'}
                      </p>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}