'use client'; // Mark this as a Client Component

import React, { useState, useEffect } from 'react';
import { Program, ChecklistItem } from '../types/types';
import { AlertCircle } from 'lucide-react';
import { getStatusIcon } from '../utils/iconUtils';
import { useTheme } from '../contexts/ThemeContext';

interface ApplicationChecklistProps {
  programs: Program[];
  checklist: ChecklistItem[];
  onUpdateStatus: (itemId: string, status: ChecklistItem['status']) => void;
}

export default function ApplicationChecklist({ programs, checklist, onUpdateStatus }: ApplicationChecklistProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const getDaysUntilDeadline = (deadline: string) => {
    const currentDate = new Date();
    const deadlineDate = new Date(deadline);
    const days = Math.ceil((deadlineDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Group checklist items by program
  const programGroups = programs.map(program => ({
    program,
    items: checklist.filter(item => item.programId === program.id)
  }));

  if (programs.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-medium text-light-text dark:text-dark-text mb-2">No Programs Saved</h2>
        <p className="text-light-muted dark:text-dark-muted">Save programs to create checklists for application requirements.</p>
      </div>
    );
  }

  return (
    <section className="h-full overflow-hidden flex flex-col">
      {/* Header with title */}
      <header className="p-4 border-b border-light-border dark:border-dark-border mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-light-text dark:text-dark-text">My Checklists</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 bg-light-card dark:bg-dark-card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programGroups.map(({ program, items }) => (
            <section key={program.id} className="border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card rounded-lg shadow dark:shadow-dark-border/30 p-6">
              <header className="mb-6">
                <h2 className="text-xl font-semibold mb-2 text-light-text dark:text-dark-text">
                  {program?.title || "No Title Available"}
                </h2>
                <p className="text-light-muted dark:text-dark-muted">
                  {program?.organization || "Unknown Organization"}
                </p>
              </header>

              <div className="space-y-6">
                {/* Standard Requirements */}
                <div>
                  <h3 className="font-medium mb-4 text-light-text dark:text-dark-text">Standard Requirements</h3>
                  <ul className="space-y-3">
                    {items
                      .filter((item) => item.type === 'standard')
                      .map((item) => (
                        <li key={item.id}>
                          <div className="flex items-center justify-between p-3 border border-light-border dark:border-dark-border bg-gray-100/80 dark:bg-gray-800/80 rounded-lg">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => {
                                  const nextStatusMap: Record<ChecklistItem['status'], ChecklistItem['status']> = {
                                    not_started: 'in_progress',
                                    in_progress: 'completed',
                                    completed: 'not_started',
                                  };
                                  const nextStatus = nextStatusMap[item.status];
                                  onUpdateStatus(item.id, nextStatus);
                                }}
                                aria-label={`Update status of ${item.title}`}
                                className="focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 rounded-full"
                              >
                                {getStatusIcon(item.status)}
                              </button>
                              <span className="text-light-text dark:text-dark-text">{item.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.deadline && getDaysUntilDeadline(item.deadline) <= 7 && (
                                <div className="flex items-center gap-1 text-red-500 dark:text-red-400 text-sm">
                                  <AlertCircle className="w-4 h-4" aria-hidden="true" />
                                  {getDaysUntilDeadline(item.deadline)} days left
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>

                {/* Program-Specific Requirements */}
                <div>
                  <h3 className="font-medium mb-4 text-light-text dark:text-dark-text">Program-Specific Requirements</h3>
                  <ul className="space-y-3">
                    {items
                      .filter((item) => item.type === 'program_specific')
                      .map((item) => {
                        const statusIcon = getStatusIcon(item.status);
                        return (
                          <li key={item.id}>
                            <div className="flex items-center justify-between p-3 border border-light-border dark:border-dark-border bg-gray-100/80 dark:bg-gray-800/80 rounded-lg">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => {
                                    const nextStatusMap: Record<ChecklistItem['status'], ChecklistItem['status']> = {
                                      not_started: 'in_progress',
                                      in_progress: 'completed',
                                      completed: 'not_started',
                                    };
                                    const nextStatus = nextStatusMap[item.status];
                                    onUpdateStatus(item.id, nextStatus);
                                  }}
                                  aria-label={`Update status of ${item.title}`}
                                  className="focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 rounded-full"
                                >
                                  {statusIcon}
                                </button>
                                <span className="text-light-text dark:text-dark-text">{item.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {item.deadline && getDaysUntilDeadline(item.deadline) <= 7 && (
                                  <div className="flex items-center gap-1 text-red-500 dark:text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                                    {getDaysUntilDeadline(item.deadline)} days left
                                  </div>
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })}

                    {items.filter((item) => item.type === 'program_specific').length === 0 && (
                      <li className="text-light-muted dark:text-dark-muted text-sm italic">
                        No program-specific requirements found
                      </li>
                    )}
                  </ul>
                </div>

                {/* Application Progress Section */}
                <div>
                  <h3 className="font-medium mb-4 text-light-text dark:text-dark-text">Application Progress</h3>
                  <div className="border border-light-border dark:border-dark-border bg-gray-100/80 dark:bg-gray-800/80 rounded-lg p-4">
                    {items.length > 0 ? (
                      <div>
                        <div className="h-2 w-full bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-600 dark:bg-primary-500 transition-all duration-500"
                            style={{ 
                              width: `${Math.round((items.filter(item => item.status === 'completed').length / items.length) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-sm text-light-muted dark:text-dark-muted">
                          <span>
                            {items.filter(item => item.status === 'completed').length} of {items.length} completed
                          </span>
                          <span>
                            {Math.round((items.filter(item => item.status === 'completed').length / items.length) * 100)}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-light-muted dark:text-dark-muted text-sm italic">
                        No checklist items available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}