import { cache } from '../utils/cache';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  dueDate: string;
  category: 'academic' | 'extracurricular' | 'career' | 'personal';
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface GoalInput {
  title: string;
  description?: string;
  dueDate?: string;
  category: 'academic' | 'extracurricular' | 'career' | 'personal';
  priority?: 'low' | 'medium' | 'high';
}

export interface GoalUpdateInput {
  title?: string;
  description?: string;
  dueDate?: string;
  category?: 'academic' | 'extracurricular' | 'career' | 'personal';
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

// Fetch all goals for the current user
export async function fetchGoals(options?: {
  category?: string;
  completed?: boolean;
}): Promise<Goal[]> {
  try {
    // Build query string for filters
    let url = '/api/goals';
    const params = new URLSearchParams();
    
    if (options?.category) {
      params.append('category', options.category);
    }
    
    if (options?.completed !== undefined) {
      params.append('completed', options.completed.toString());
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    // Use cache key that includes the filters
    const cacheKey = `goals:${params.toString()}`;
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return cachedData as Goal[];
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching goals: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the data to match the Goal interface
    const goals = data.goals.map((goal: any) => ({
      id: goal.id,
      userId: goal.user_id,
      title: goal.title,
      description: goal.description || '',
      dueDate: goal.due_date || '',
      category: goal.category,
      completed: goal.completed,
      priority: goal.priority || 'medium',
      createdAt: goal.created_at,
      updatedAt: goal.updated_at
    }));
    
    // Cache the results for 5 minutes
    cache.set(cacheKey, goals, 5 * 60);
    
    return goals;
  } catch (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
}

// Fetch a specific goal by ID
export async function fetchGoalById(goalId: string): Promise<Goal | null> {
  try {
    const cacheKey = `goal:${goalId}`;
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return cachedData as Goal;
    }
    
    const response = await fetch(`/api/goals/${goalId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching goal: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform to match the Goal interface
    const goal: Goal = {
      id: data.goal.id,
      userId: data.goal.user_id,
      title: data.goal.title,
      description: data.goal.description || '',
      dueDate: data.goal.due_date || '',
      category: data.goal.category,
      completed: data.goal.completed,
      priority: data.goal.priority || 'medium',
      createdAt: data.goal.created_at,
      updatedAt: data.goal.updated_at
    };
    
    // Cache the goal for 5 minutes
    cache.set(cacheKey, goal, 5 * 60);
    
    return goal;
  } catch (error) {
    console.error(`Error fetching goal ${goalId}:`, error);
    return null;
  }
}

// Create a new goal
export async function createGoal(goalData: GoalInput): Promise<Goal | null> {
  try {
    const response = await fetch('/api/goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: goalData.title,
        description: goalData.description || '',
        dueDate: goalData.dueDate || '',
        category: goalData.category,
        priority: goalData.priority || 'medium'
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error creating goal: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Clear all goal-related caches since we have a new goal
    cache.clear('goals:');
    
    return data.goal;
  } catch (error) {
    console.error('Error creating goal:', error);
    return null;
  }
}

// Update an existing goal
export async function updateGoal(goalId: string, updates: GoalUpdateInput): Promise<Goal | null> {
  try {
    const response = await fetch(`/api/goals/${goalId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating goal: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Clear specific goal cache and all goals lists
    cache.delete(`goal:${goalId}`);
    cache.clear('goals:');
    
    return data.goal;
  } catch (error) {
    console.error(`Error updating goal ${goalId}:`, error);
    return null;
  }
}

// Delete a goal
export async function deleteGoal(goalId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/goals/${goalId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting goal: ${response.status}`);
    }
    
    // Clear specific goal cache and all goals lists
    cache.delete(`goal:${goalId}`);
    cache.clear('goals:');
    
    return true;
  } catch (error) {
    console.error(`Error deleting goal ${goalId}:`, error);
    return false;
  }
}

// Toggle goal completion status
export async function toggleGoalCompletion(goalId: string, completed: boolean): Promise<Goal | null> {
  return updateGoal(goalId, { completed });
} 
