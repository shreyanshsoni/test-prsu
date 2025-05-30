'use client'; // Mark this as a Client Component

import React, { useState, useEffect } from 'react';
import { Program, ChecklistItem } from '../types/types';
import { AlertCircle } from 'lucide-react';
import { getStatusIcon } from '../utils/iconUtils';

interface ApplicationChecklistProps {
  programs: Program[];
  checklist: ChecklistItem[];
  onUpdateStatus: (itemId: string, status: ChecklistItem['status']) => void;
}

export default function ApplicationChecklist({ programs, checklist, onUpdateStatus }: ApplicationChecklistProps) {
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
        <h2 className="text-xl font-medium text-gray-600 mb-2">No Programs Saved</h2>
        <p className="text-gray-500">Save programs to create checklists for application requirements.</p>
      </div>
    );
  }

  return (
    <section className="h-full overflow-hidden flex flex-col">
      {/* Header with title */}
      <header className="p-4 border-b mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">My Checklists</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programGroups.map(({ program, items }) => (
            <section key={program.id} className="bg-white rounded-lg shadow-md p-6">
              <header className="mb-6">
                <h2 className="text-xl font-semibold mb-2">
                  {program?.title || "No Title Available"}
                </h2>
                <p className="text-gray-600">
                  {program?.organization || "Unknown Organization"}
                </p>
              </header>

              <div className="space-y-6">
                {/* Standard Requirements */}
                <div>
                  <h3 className="font-medium mb-4">Standard Requirements</h3>
                  <ul className="space-y-3">
                    {items
                      .filter((item) => item.type === 'standard')
                      .map((item) => (
                        <li key={item.id}>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                              >
                                {getStatusIcon(item.status)}
                              </button>
                              <span>{item.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.deadline && getDaysUntilDeadline(item.deadline) <= 7 && (
                                <div className="flex items-center gap-1 text-red-500 text-sm">
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
                  <h3 className="font-medium mb-4">Program-Specific Requirements</h3>
                  <ul className="space-y-3">
                    {items
                      .filter((item) => item.type === 'program_specific')
                      .map((item) => {
                        const statusIcon = getStatusIcon(item.status);
                        return (
                          <li key={item.id}>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                                >
                                  {statusIcon}
                                </button>
                                <span>{item.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {item.deadline && getDaysUntilDeadline(item.deadline) <= 7 && (
                                  <div className="flex items-center gap-1 text-red-500 text-sm">
                                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                                    {getDaysUntilDeadline(item.deadline)} days left
                                  </div>
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}