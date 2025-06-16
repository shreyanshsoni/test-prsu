import { Program } from '../types/types';
import { mapApiResponseToPrograms } from './opportunityService';

/**
 * Helper function to implement retry logic with exponential backoff
 */
async function fetchWithRetry(
  url: string, 
  options: RequestInit = {}, 
  maxRetries: number = 3
): Promise<Response> {
  let retries = 0;
  let lastError: Error;
  
  // Ensure URL is properly formatted
  const apiUrl = url.startsWith('/') ? url : `/${url}`;

  while (retries < maxRetries) {
    try {
      // Add cache: 'no-store' to prevent caching issues
      const response = await fetch(apiUrl, {
        ...options,
        cache: 'no-store',
        headers: {
          ...options.headers,
          'Content-Type': 'application/json',
        }
      });
      
      return response;
    } catch (error) {
      console.error(`Fetch attempt ${retries + 1} failed:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      retries++;
      
      if (retries >= maxRetries) break;
      
      // Exponential backoff: 500ms, 1500ms, 3500ms, etc.
      const delay = Math.pow(2, retries) * 500 - 500;
      console.log(`Retrying in ${delay}ms (attempt ${retries + 1} of ${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Fetches the logged-in user's saved programs
 */
export async function fetchUserSavedPrograms(): Promise<Program[]> {
  try {
    console.log('Fetching user saved programs...');
    const response = await fetchWithRetry('/api/user-programs');
    
    if (!response.ok) {
      if (response.status === 401) {
        console.warn('User not authenticated');
        return [];
      }
      
      // Try to get the error message from the response
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = errorData.error || '';
      } catch (e) {
        // If we can't parse the JSON, just use the status text
        errorDetail = response.statusText;
      }
      
      throw new Error(`API error ${response.status}: ${errorDetail}`);
    }
    
    const data = await response.json();
    console.log(`Found ${data.savedPrograms?.length || 0} saved programs`);
    
    // If no saved programs, return empty array
    if (!data.savedPrograms || data.savedPrograms.length === 0) {
      return [];
    }
    
    return mapApiResponseToPrograms(data.savedPrograms);
  } catch (error) {
    console.error('Error fetching saved programs:', error);
    return [];
  }
}

/**
 * Saves a program for the logged-in user
 */
export async function saveUserProgram(programId: string): Promise<boolean> {
  try {
    console.log(`Saving program ${programId}...`);
    
    const response = await fetchWithRetry('/api/user-programs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programId,
        status: 'saved',
      }),
    });
    
    if (!response.ok) {
      // Try to get the error message from the response
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = errorData.error || '';
      } catch (e) {
        // If we can't parse the JSON, just use the status text
        errorDetail = response.statusText;
      }
      
      // Throw a more detailed error
      throw new Error(`API error ${response.status}: ${errorDetail}`);
    }
    
    console.log(`Program ${programId} saved successfully`);
    return true;
  } catch (error) {
    console.error('Error saving program:', error);
    return false;
  }
}

/**
 * Marks a program as rejected for the logged-in user
 */
export async function rejectUserProgram(programId: string): Promise<boolean> {
  try {
    console.log(`Rejecting program ${programId}...`);
    
    const response = await fetchWithRetry('/api/user-programs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programId,
        status: 'rejected',
      }),
    });
    
    if (!response.ok) {
      // Try to get the error message from the response
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = errorData.error || '';
      } catch (e) {
        // If we can't parse the JSON, just use the status text
        errorDetail = response.statusText;
      }
      
      throw new Error(`API error ${response.status}: ${errorDetail}`);
    }
    
    console.log(`Program ${programId} rejected successfully`);
    return true;
  } catch (error) {
    console.error('Error rejecting program:', error);
    return false;
  }
}

/**
 * Removes a program from the user's saved list
 */
export async function removeUserProgram(programId: string): Promise<boolean> {
  try {
    console.log(`Removing program ${programId}...`);
    
    const response = await fetchWithRetry(`/api/user-programs?programId=${programId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      // Try to get the error message from the response
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = errorData.error || '';
      } catch (e) {
        // If we can't parse the JSON, just use the status text
        errorDetail = response.statusText;
      }
      
      throw new Error(`API error ${response.status}: ${errorDetail}`);
    }
    
    console.log(`Program ${programId} removed successfully`);
    return true;
  } catch (error) {
    console.error('Error removing program:', error);
    return false;
  }
} 