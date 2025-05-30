import { AcademicRoadmapModel, Program } from '../types/types';

// Simple cache to prevent redundant API calls
const cache = {
  roadmaps: null as AcademicRoadmapModel[] | null,
  roadmapPrograms: {} as Record<string, Program[]>,
  lastFetch: 0,
  expiryTime: 60000, // 1 minute cache expiry
  
  // Check if cache is valid
  isValid() {
    return this.roadmaps !== null && Date.now() - this.lastFetch < this.expiryTime;
  },
  
  // Clear cache (used after mutations)
  clear() {
    this.roadmaps = null;
    this.roadmapPrograms = {};
    this.lastFetch = 0;
  }
};

/**
 * Fetch all roadmaps for the current user
 */
export async function fetchUserRoadmaps(forceRefresh = false): Promise<AcademicRoadmapModel[]> {
  // Return cached data if available and not forcing a refresh
  if (!forceRefresh && cache.isValid()) {
    console.log('Using cached roadmaps data');
    return cache.roadmaps || [];
  }
  
  try {
    console.log('Fetching user roadmaps...');
    const response = await fetch('/api/roadmaps', {
      // Add cache control headers
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        console.warn('User not authenticated');
        return [];
      }
      
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = errorData.error || '';
        console.error('Error details:', errorDetail);
      } catch (e) {
        errorDetail = response.statusText;
      }
      
      if (response.status === 500) {
        console.log('Server error, returning empty roadmaps list');
        return [];
      }
      
      throw new Error(`API error ${response.status}: ${errorDetail}`);
    }
    
    const data = await response.json();
    console.log(`Found ${data.roadmaps?.length || 0} roadmaps`);
    
    // Process each roadmap to ensure it has a createdAt property
    const processedRoadmaps = (data.roadmaps || []).map(roadmap => {
      // If roadmap doesn't have a createdAt date, add a default one
      if (!roadmap.createdAt) {
        console.warn(`Roadmap ${roadmap.id} missing createdAt, adding default date`);
        return {
          ...roadmap,
          createdAt: new Date().toISOString() // Use current date as fallback
        };
      }
      return roadmap;
    });
    
    // Update cache
    cache.roadmaps = processedRoadmaps;
    cache.lastFetch = Date.now();
    
    return processedRoadmaps;
  } catch (error) {
    console.error('Error fetching roadmaps:', error);
    return [];
  }
}

/**
 * Create a new roadmap
 */
export async function createRoadmap(data: { name: string }): Promise<AcademicRoadmapModel | null> {
  try {
    console.log('Creating roadmap:', data.name);
    if (!data.name || !data.name.trim()) {
      console.error('Error: Roadmap name is required');
      throw new Error('Roadmap name is required');
    }
    
    const createdAt = new Date().toISOString();
    
    const response = await fetch('/api/roadmaps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        name: data.name.trim(),
        createdAt // Explicitly send creation date to ensure it's saved
      }),
    });
    
    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = errorData.error || '';
        console.error('Error details:', errorDetail);
      } catch (e) {
        errorDetail = response.statusText;
      }
      
      throw new Error(`API error ${response.status}: ${errorDetail}`);
    }
    
    const responseData = await response.json();
    
    // Make sure the roadmap has a createdAt property
    const roadmap = responseData.roadmap;
    if (roadmap && !roadmap.createdAt) {
      roadmap.createdAt = createdAt;
    }
    
    // Clear cache after mutation
    cache.clear();
    
    console.log('Roadmap created:', roadmap);
    return roadmap || null;
  } catch (error) {
    console.error('Error creating roadmap:', error);
    return null;
  }
}

/**
 * Add a program to a roadmap
 */
export async function addProgramToRoadmap(
  roadmapId: string, 
  programId: string, 
  programData: Program
): Promise<boolean> {
  console.log(`Adding program ${programId} to roadmap ${roadmapId}...`);
  
  // Retry logic
  let retries = 2;
  while (retries >= 0) {
    try {
      const response = await fetch(`/api/roadmaps/${roadmapId}/programs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          programId,
          programData // Send the complete program data
        }),
      });
      
      if (!response.ok) {
        let errorDetail = '';
        try {
          const errorData = await response.json();
          errorDetail = errorData.error || '';
          
          // If it's because the program is already in the roadmap, log as info not error
          if (response.status === 400 && errorDetail.includes('already in this roadmap')) {
            console.log('Info: Program is already in the roadmap, considering operation successful');
            return true;
          } else {
            console.error('Error details:', errorDetail);
          }
        } catch (e) {
          errorDetail = response.statusText;
        }
        
        if (retries > 0) {
          console.log(`Retrying... (${retries} retries left)`);
          retries--;
          continue;
        }
        
        throw new Error(`API error ${response.status}: ${errorDetail}`);
      }
      
      // Clear cache after mutation
      cache.clear();
      
      console.log('Program added successfully');
      return true;
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying after error: ${error.message} (${retries} retries left)`);
        retries--;
      } else {
        console.error('Error adding program to roadmap:', error);
        return false;
      }
    }
  }
  
  return false;
}

/**
 * Remove a program from a roadmap
 */
export async function removeProgramFromRoadmap(roadmapId: string, programId: string): Promise<boolean> {
  try {
    console.log(`Removing program ${programId} from roadmap ${roadmapId}...`);
    const response = await fetch(`/api/roadmaps/${roadmapId}/programs/${programId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = errorData.error || '';
        console.error('Error details:', errorDetail);
      } catch (e) {
        errorDetail = response.statusText;
      }
      
      throw new Error(`API error ${response.status}: ${errorDetail}`);
    }
    
    // Clear cache after mutation
    cache.clear();
    
    console.log('Program removed successfully');
    return true;
  } catch (error) {
    console.error('Error removing program from roadmap:', error);
    return false;
  }
}

/**
 * Fetch programs in a specific roadmap
 */
export async function fetchRoadmapPrograms(roadmapId: string, forceRefresh = false): Promise<Program[]> {
  // Return cached data if available
  if (!forceRefresh && cache.roadmapPrograms[roadmapId]) {
    console.log(`Using cached programs for roadmap ${roadmapId}`);
    return cache.roadmapPrograms[roadmapId];
  }
  
  try {
    console.log(`Fetching programs for roadmap ${roadmapId}...`);
    const response = await fetch(`/api/roadmaps/${roadmapId}/programs`, {
      // Add cache control headers
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = errorData.error || '';
        console.error('Error details:', errorDetail);
      } catch (e) {
        errorDetail = response.statusText;
      }
      
      throw new Error(`API error ${response.status}: ${errorDetail}`);
    }
    
    const data = await response.json();
    console.log(`Found ${data.programs?.length || 0} programs in roadmap`);
    
    // Update cache
    cache.roadmapPrograms[roadmapId] = data.programs || [];
    
    return data.programs || [];
  } catch (error) {
    console.error('Error fetching roadmap programs:', error);
    return [];
  }
}

/**
 * Delete a roadmap
 */
export async function deleteRoadmap(roadmapId: string): Promise<boolean> {
  try {
    console.log(`Deleting roadmap ${roadmapId}...`);
    const response = await fetch(`/api/roadmaps/${roadmapId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = errorData.error || '';
        console.error('Error details:', errorDetail);
      } catch (e) {
        errorDetail = response.statusText;
      }
      
      throw new Error(`API error ${response.status}: ${errorDetail}`);
    }
    
    // Clear cache after mutation
    cache.clear();
    
    console.log('Roadmap deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting roadmap:', error);
    return false;
  }
}

/**
 * Sync multiple programs to the database in parallel
 */
export async function syncProgramsToDatabase(programs: Program[]): Promise<boolean> {
  try {
    console.log(`Syncing ${programs.length} programs to database...`);
    
    // Use Promise.all to sync all programs in parallel
    const results = await Promise.all(
      programs.map(program => syncProgramToDatabase(program))
    );
    
    // Check if all syncs were successful
    const allSuccessful = results.every(result => result === true);
    console.log(`Program sync ${allSuccessful ? 'completed successfully' : 'had some failures'}`);
    
    return allSuccessful;
  } catch (error) {
    console.error('Error syncing programs:', error);
    return false;
  }
}

/**
 * Sync a program to the database to ensure it exists with full data
 */
export async function syncProgramToDatabase(program: Program): Promise<boolean> {
  try {
    console.log(`Syncing program ${program.id} to database...`);
    const response = await fetch('/api/programs/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ program }),
    });
    
    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = errorData.error || '';
        console.error('Error details:', errorDetail);
      } catch (e) {
        errorDetail = response.statusText;
      }
      
      console.warn(`Failed to sync program ${program.id}: ${errorDetail}`);
      return false;
    }
    
    console.log(`Program ${program.id} synced successfully`);
    return true;
  } catch (error) {
    console.error('Error syncing program:', error);
    return false;
  }
}

/**
 * Create a new program and add it directly to a roadmap
 */
export async function createProgram(
  roadmapId: string,
  programData: { title: string; description: string; deadline: string }
): Promise<Program | null> {
  try {
    console.log('Creating new program for roadmap:', roadmapId);
    if (!programData.title || !programData.title.trim()) {
      console.error('Error: Program title is required');
      throw new Error('Program title is required');
    }
    
    // Create a unique ID for the program
    const programId = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Prepare the full program object
    const newProgram: Program = {
      id: programId,
      title: programData.title.trim(),
      description: programData.description.trim(),
      deadline: programData.deadline,
      // Set default values for other required fields
      organization: 'Custom Program',
      type: 'custom'
    };
    
    // Use the existing endpoint to add the program to the roadmap
    const response = await fetch(`/api/roadmaps/${roadmapId}/programs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        programId,
        programData: newProgram 
      }),
    });
    
    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = errorData.error || '';
        console.error('Error details:', errorDetail);
      } catch (e) {
        errorDetail = response.statusText;
      }
      
      throw new Error(`API error ${response.status}: ${errorDetail}`);
    }
    
    console.log('Program created:', newProgram);
    return newProgram;
  } catch (error) {
    console.error('Error creating program:', error);
    return null;
  }
} 