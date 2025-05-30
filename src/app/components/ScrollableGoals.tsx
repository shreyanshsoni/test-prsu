"use client"

import React from "react"
import { Goal } from "../types/types"
import { ScrollArea } from "./ui/scroll-area"
import { Separator } from "./ui/separator"
import { Calendar, CheckCircle2, Circle } from "lucide-react"

interface ScrollableGoalsProps {
  goalsByYear: { [year: string]: Goal[] }
  formatShortDate: (dateString: string) => string
  onSwitchToRoadmapPlanner?: (tab?: string) => void
  onToggleGoalCompletion?: (goalId: string, completed: boolean) => Promise<void>
  onSwitchToGoalsTab?: () => void
  isDarkTheme?: boolean
}

export function ScrollableGoals({ 
  goalsByYear, 
  formatShortDate, 
  onSwitchToRoadmapPlanner,
  onToggleGoalCompletion,
  onSwitchToGoalsTab,
  isDarkTheme = true
}: ScrollableGoalsProps) {
  // Dynamic styles based on theme
  const textColor = isDarkTheme ? "text-white" : "text-gray-800";
  const secondaryTextColor = isDarkTheme ? "text-white/70" : "text-gray-600";
  const buttonTextColor = isDarkTheme ? "text-white" : "text-blue-600";
  const iconColor = isDarkTheme ? "text-white" : "text-blue-600";
  const separatorColor = isDarkTheme ? "bg-indigo-400/30" : "bg-gray-200";
  const dateBackground = isDarkTheme ? "bg-indigo-500 bg-opacity-30" : "bg-blue-100";

  return (
    <>
      <ScrollArea className="h-[240px] w-full rounded-md">
        <div className="p-4">
          {Object.entries(goalsByYear).map(([year, goals]) => (
            <React.Fragment key={year}>
              <h3 className={`text-lg font-semibold ${textColor} mb-2`}>{year}</h3>
              <div className="space-y-2 mb-4">
                {goals.map(goal => (
                  <React.Fragment key={goal.id}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onToggleGoalCompletion?.(goal.id, goal.completed)}
                          className="focus:outline-none"
                          aria-label={goal.completed ? "Mark as incomplete" : "Mark as complete"}
                        >
                          {goal.completed ? (
                            <CheckCircle2 className={`w-4 h-4 ${iconColor}`} />
                          ) : (
                            <Circle className={`w-4 h-4 ${iconColor}`} />
                          )}
                        </button>
                        <span className={`${textColor} ${goal.completed ? 'line-through opacity-70' : ''}`}>{goal.title}</span>
                      </div>
                      
                      {goal.dueDate && (
                        <div className={`flex items-center ${dateBackground} px-2 py-0.5 rounded-md shrink-0 ${goal.completed ? 'line-through opacity-70' : ''}`}>
                          <Calendar className={`h-3 w-3 mr-1 ${isDarkTheme ? "" : "text-blue-600"}`} />
                          <span className={`text-xs font-medium ${isDarkTheme ? "" : "text-blue-600"}`}>{formatShortDate(goal.dueDate)}</span>
                        </div>
                      )}
                    </div>
                    <Separator className={`my-2 ${separatorColor}`} />
                  </React.Fragment>
                ))}
              </div>
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>
      
      {/* See All button at bottom right */}
      {onSwitchToGoalsTab && (
        <div className="flex justify-end mt-4">
          <button 
            onClick={() => onSwitchToGoalsTab()}
            className={`underline text-sm hover:opacity-80 transition-opacity ${buttonTextColor}`}
          >
            See All
          </button>
        </div>
      )}
    </>
  )
} 