import { RoadmapPlanner, PhaseData, Task, Goal } from '../types/types';
import { cache } from '../utils/cache';

/**
 * Fetch all roadmap planners for the current user
 */
export async function fetchRoadmapPlanners(): Promise<RoadmapPlanner[]> {
  try {
    const cacheKey = 'roadmap-planners';
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData as RoadmapPlanner[];
    }
    
    const response = await fetch('/api/roadmap-planners', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching roadmap planners: ${response.status}`);
    }
    
    const data = await response.json();
    const roadmapPlanners = data.roadmapPlanners || [];
    
    cache.set(cacheKey, roadmapPlanners, 5 * 60); // Cache for 5 minutes
    return roadmapPlanners;
  } catch (error) {
    console.error('Error fetching roadmap planners:', error);
    return [];
  }
}

/**
 * Fetch a specific roadmap planner
 */
export async function fetchRoadmapPlanner(id: string): Promise<RoadmapPlanner | null> {
  try {
    const cacheKey = `roadmap-planner:${id}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData as RoadmapPlanner;
    }
    
    const response = await fetch(`/api/roadmap-planners/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching roadmap planner: ${response.status}`);
    }
    
    const data = await response.json();
    const roadmapPlanner = data.roadmapPlanner;
    
    cache.set(cacheKey, roadmapPlanner, 5 * 60); // Cache for 5 minutes
    return roadmapPlanner;
  } catch (error) {
    console.error(`Error fetching roadmap planner ${id}:`, error);
    return null;
  }
}

/**
 * Create a new roadmap planner
 */
export async function createRoadmapPlanner(goal: Goal): Promise<RoadmapPlanner | null> {
  try {
    const response = await fetch('/api/roadmap-planners', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goal }),
    });
    
    if (!response.ok) {
      throw new Error(`Error creating roadmap planner: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Clear cache
    cache.clear('roadmap-planners');
    
    return data.roadmapPlanner;
  } catch (error) {
    console.error('Error creating roadmap planner:', error);
    return null;
  }
}

/**
 * Update a roadmap planner's goal
 */
export async function updateRoadmapGoal(roadmapId: string, goal: Goal): Promise<RoadmapPlanner | null> {
  try {
    const response = await fetch(`/api/roadmap-planners/${roadmapId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goal }),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating roadmap goal: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Clear cache
    cache.delete(`roadmap-planner:${roadmapId}`);
    cache.clear('roadmap-planners');
    
    return data.roadmapPlanner;
  } catch (error) {
    console.error(`Error updating roadmap goal ${roadmapId}:`, error);
    return null;
  }
}

/**
 * Delete a roadmap planner
 */
export async function deleteRoadmapPlanner(roadmapId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/roadmap-planners/${roadmapId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting roadmap planner: ${response.status}`);
    }
    
    // Clear cache
    cache.delete(`roadmap-planner:${roadmapId}`);
    cache.clear('roadmap-planners');
    
    return true;
  } catch (error) {
    console.error(`Error deleting roadmap planner ${roadmapId}:`, error);
    return false;
  }
}

/**
 * Add a new phase to a roadmap
 */
export async function addPhase(roadmapId: string, phase: Omit<PhaseData, 'id' | 'tasks'>): Promise<PhaseData | null> {
  try {
    const response = await fetch(`/api/roadmap-planners/${roadmapId}/phases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(phase),
    });
    
    if (!response.ok) {
      throw new Error(`Error adding phase: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Clear cache
    cache.delete(`roadmap-planner:${roadmapId}`);
    cache.clear('roadmap-planners');
    
    return data.phase;
  } catch (error) {
    console.error(`Error adding phase to roadmap ${roadmapId}:`, error);
    return null;
  }
}

/**
 * Add a task to a phase
 */
export async function addTask(phaseId: string, task: Omit<Task, 'id'>): Promise<Task | null> {
  try {
    const response = await fetch(`/api/roadmap-planners/phases/${phaseId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    
    if (!response.ok) {
      throw new Error(`Error adding task: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Clear all roadmap planner cache since we don't know the roadmap ID here
    cache.clear('roadmap-planner:');
    cache.clear('roadmap-planners');
    
    return data.task;
  } catch (error) {
    console.error(`Error adding task to phase ${phaseId}:`, error);
    return null;
  }
}

/**
 * Toggle task completion
 */
export async function toggleTaskCompletion(taskId: string, completed: boolean): Promise<Task | null> {
  try {
    const response = await fetch(`/api/roadmap-planners/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed }),
    });
    
    if (!response.ok) {
      throw new Error(`Error toggling task completion: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Clear all roadmap planner cache since we don't know the roadmap ID here
    cache.clear('roadmap-planner:');
    cache.clear('roadmap-planners');
    
    return data.task;
  } catch (error) {
    console.error(`Error toggling task completion ${taskId}:`, error);
    return null;
  }
}

/**
 * Update task notes
 */
export async function updateTaskNotes(taskId: string, notes: string): Promise<Task | null> {
  try {
    const response = await fetch(`/api/roadmap-planners/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes }),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating task notes: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Clear all roadmap planner cache
    cache.clear('roadmap-planner:');
    cache.clear('roadmap-planners');
    
    return data.task;
  } catch (error) {
    console.error(`Error updating task notes ${taskId}:`, error);
    return null;
  }
}

/**
 * Update task with multiple properties
 */
export async function updateTask(taskId: string, task: Partial<Task>): Promise<Task | null> {
  try {
    const response = await fetch(`/api/roadmap-planners/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating task: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Clear all roadmap planner cache
    cache.clear('roadmap-planner:');
    cache.clear('roadmap-planners');
    
    return data.task;
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    return null;
  }
}

/**
 * Update a phase's reflection
 */
export async function updatePhaseReflection(phaseId: string, reflection: string): Promise<boolean> {
  try {
    // First, get the roadmap ID for this phase
    const response = await fetch(`/api/roadmap-planners/phases/${phaseId}/roadmap`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error getting roadmap ID: ${response.status}`);
    }
    
    const { roadmapId } = await response.json();
    
    // Now update the reflection
    const updateResponse = await fetch(`/api/roadmap-planners/${roadmapId}/phases/${phaseId}/reflection`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reflection }),
    });
    
    if (!updateResponse.ok) {
      throw new Error(`Error updating phase reflection: ${updateResponse.status}`);
    }
    
    // Clear cache for the roadmap containing this phase
    cache.clear('roadmap-planners');
    
    return true;
  } catch (error) {
    console.error(`Error updating phase reflection for phase ${phaseId}:`, error);
    return false;
  }
} 

/**
 * Delete a phase from a roadmap
 */
export async function deletePhase(phaseId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/roadmap-planners/phases/${phaseId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting phase: ${response.status}`);
    }
    
    // Clear all roadmap planner cache
    cache.clear('roadmap-planner:');
    cache.clear('roadmap-planners');
    
    return true;
  } catch (error) {
    console.error(`Error deleting phase ${phaseId}:`, error);
    return false;
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/roadmap-planners/tasks/${taskId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting task: ${response.status}`);
    }
    
    // Clear all roadmap planner cache
    cache.clear('roadmap-planner:');
    cache.clear('roadmap-planners');
    
    return true;
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    return false;
  }
}

/**
 * Update a phase's title and description
 */
export async function updatePhase(phaseId: string, updates: { title?: string; description?: string }): Promise<boolean> {
  try {
    // First, get the roadmap ID for this phase
    const response = await fetch(`/api/roadmap-planners/phases/${phaseId}/roadmap`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error getting roadmap ID: ${response.status}`);
    }
    
    const { roadmapId } = await response.json();
    
    // Now update the phase
    const updateResponse = await fetch(`/api/roadmap-planners/${roadmapId}/phases/${phaseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!updateResponse.ok) {
      throw new Error(`Error updating phase: ${updateResponse.status}`);
    }
    
    // Clear cache for the roadmap containing this phase
    cache.delete(`roadmap-planner:${roadmapId}`);
    cache.clear('roadmap-planners');
    
    return true;
  } catch (error) {
    console.error(`Error updating phase ${phaseId}:`, error);
    return false;
  }
} 