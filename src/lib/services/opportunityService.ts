import { Program } from '../types/types';
// Keep mock data as fallback
import { programs } from '../../app/data/programs';

// Define a type for pagination
interface PaginationInfo {
  total: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

// Define the return type for fetchOpportunities
interface OpportunitiesResult {
  programs: Program[];
  pagination: PaginationInfo;
  fromMock?: boolean; // Indicate if the data came from mock data
}

// API response structure
interface ApiResponse {
  data: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

/**
 * Maps API database response to Program objects
 */
export function mapApiResponseToPrograms(apiData: any[]): Program[] {
  return apiData.map(item => ({
    id: item.id,
    title: item.title,
    organization: item.institute,
    description: item.description,
    deadline: item.end_date,
    location: item.location_string,
    type: Array.isArray(item.program_types) ? item.program_types[0] : 'Unknown',
    imageUrl: '/images/default-opportunity.jpg', // Default image
    eligibility: item.eligibility || 'No eligibility information available',
    stipend: item.has_stipend ? 'Yes' : 'No',
    field: Array.isArray(item.interests) ? item.interests[0] : 'General',
    degreeLevel: item.degree_level || '',
    requirements: item.requirements || 'No specific requirements',
    startDate: item.start_date
  }));
}

/**
 * Helper function to get mock data with pagination
 */
function getMockProgramData(page: number, limit: number): OpportunitiesResult {
  // Calculate pagination values from mock data
  const total = programs.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  // Get the slice of programs for the requested page
  const paginatedPrograms = programs.slice(startIndex, endIndex);
  
  return {
    programs: paginatedPrograms,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      itemsPerPage: limit
    },
    fromMock: true
  };
}

/**
 * Fetches opportunities with pagination support and automatic retries
 * @param page Current page number (1-indexed)
 * @param limit Number of items per page
 * @param retries Number of retries for connection issues
 * @returns Object containing programs and pagination info
 */
export async function fetchOpportunities(
  page: number = 1, 
  limit: number = 20,
  retries: number = 2
): Promise<OpportunitiesResult> {
  try {
    // Add cache busting query parameter
    const cacheBuster = new Date().getTime();
    // Make a real API call to the backend
    const response = await fetch(
      `/api/opportunities?page=${page}&limit=${limit}&_=${cacheBuster}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }
    );
    
    // If the response is not OK, throw an error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `API error: ${response.status} ${response.statusText}`
      );
    }
    
    // Parse the JSON response
    const apiResponse: ApiResponse = await response.json();
    
    // Check if the API returned an error
    if (apiResponse.error) {
      throw new Error(`API error: ${apiResponse.error}`);
    }
    
    // Map the data to our Program type
    const programs = mapApiResponseToPrograms(apiResponse.data);
    
    // Return in the expected format
    return {
      programs,
      pagination: {
        total: apiResponse.pagination.total,
        totalPages: apiResponse.pagination.totalPages,
        currentPage: apiResponse.pagination.page,
        itemsPerPage: apiResponse.pagination.limit
      }
    };
  } catch (error) {
    // Log the error
    console.error('Error fetching opportunities from API:', error);
    
    // If we have retries left and it's a network error, retry
    if (
      retries > 0 && 
      (error instanceof TypeError || 
       (error instanceof Error && error.message.includes('Failed to fetch')))
    ) {
      console.log(`Retrying fetchOpportunities (${retries} attempts left)...`);
      
      // Wait 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Retry with one less retry attempt
      return fetchOpportunities(page, limit, retries - 1);
    }
    
    // Fallback to mock data once retries are exhausted
    console.warn('Using mock data as fallback after failed API calls');
    return getMockProgramData(page, limit);
  }
}

// Export searchOpportunities as an alias to fetchOpportunities for backward compatibility
export const searchOpportunities = fetchOpportunities; 