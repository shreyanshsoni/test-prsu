import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Add connection timeout and retry logic
const executeQueryWithRetry = async (query: string, params: any[] = [], retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await sql.query(query, params);
      return result;
    } catch (error: any) {
      console.error(`Query attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) throw error;
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters - support both cursor and page-based
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const cursor = searchParams.get('cursor') || null; // ISO timestamp for cursor-based pagination
    const offset = (page - 1) * limit;
    
    // Filter parameters
    const searchTerm = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    
    
    // Build the base query with optimized student name handling
    let baseQuery = `
      SELECT 
        ug.id,
        ug.title,
        ug.description,
        ug.category,
        ug.completed,
        ug.priority,
        ug.created_at,
        ug.updated_at,
        CONCAT(COALESCE(up.first_name, ''), ' ', COALESCE(up.last_name, '')) as student_name
      FROM user_goals ug
      JOIN user_profiles up ON ug.user_id = up.user_id
      WHERE up.user_role = 'student'
    `;
    
    const queryParams: any[] = [];
    let paramCount = 0;
    
    // Add search filter (enhanced for better matching)
    if (searchTerm) {
      paramCount++;
      // Enhanced search: search in goal title, description, student first name, last name, and full name
      baseQuery += ` AND (
        LOWER(ug.title) LIKE LOWER($${paramCount}) OR 
        LOWER(ug.description) LIKE LOWER($${paramCount}) OR 
        LOWER(up.first_name) LIKE LOWER($${paramCount}) OR 
        LOWER(up.last_name) LIKE LOWER($${paramCount}) OR 
        LOWER(CONCAT(up.first_name, ' ', up.last_name)) LIKE LOWER($${paramCount}) OR
        LOWER(CONCAT(up.last_name, ' ', up.first_name)) LIKE LOWER($${paramCount})
      )`;
      queryParams.push(`%${searchTerm}%`);
    }
    
    // Add category filter
    if (category && category !== 'All') {
      paramCount++;
      baseQuery += ` AND LOWER(ug.category) = LOWER($${paramCount})`;
      queryParams.push(category);
    }
    
    // Add status filter
    if (status && status !== 'All') {
      if (status === 'Completed') {
        baseQuery += ` AND ug.completed = true`;
      } else if (status === 'Incomplete') {
        baseQuery += ` AND ug.completed = false`;
      }
    }
    
    // Add cursor-based pagination if cursor is provided
    if (cursor) {
      paramCount++;
      baseQuery += ` AND (
        CASE WHEN ug.completed = true 
          THEN COALESCE(ug.updated_at, ug.created_at) 
          ELSE COALESCE(ug.created_at, '1970-01-01'::timestamp)
        END < $${paramCount}
      )`;
      queryParams.push(cursor);
    }
    
    // Order by: completed goals first (by updated_at DESC), then incomplete goals (by created_at DESC)
    // Add NULL handling and secondary sort for consistency
    baseQuery += ` ORDER BY 
      CASE WHEN ug.completed = true THEN 0 ELSE 1 END,
      CASE WHEN ug.completed = true 
        THEN COALESCE(ug.updated_at, ug.created_at) 
        ELSE COALESCE(ug.created_at, '1970-01-01'::timestamp)
      END DESC,
      ug.id DESC
    `;
    
    // Add pagination - use cursor-based if cursor provided, otherwise use offset
    paramCount++;
    baseQuery += ` LIMIT $${paramCount}`;
    queryParams.push(limit);
    
    if (!cursor) {
      paramCount++;
      baseQuery += ` OFFSET $${paramCount}`;
      queryParams.push(offset);
    }
    
    // Execute the query with retry
    const goalsResult = await executeQueryWithRetry(baseQuery, queryParams);
    
    // Get total count for pagination info (simplified)
    let countQuery = `
      SELECT COUNT(*) as total
      FROM user_goals ug
      JOIN user_profiles up ON ug.user_id = up.user_id
      WHERE up.user_role = 'student'
    `;
    
    const countParams: any[] = [];
    let countParamCount = 0;
    
    // Add same filters for count (enhanced search)
    if (searchTerm) {
      countParamCount++;
      countQuery += ` AND (
        LOWER(ug.title) LIKE LOWER($${countParamCount}) OR 
        LOWER(ug.description) LIKE LOWER($${countParamCount}) OR 
        LOWER(up.first_name) LIKE LOWER($${countParamCount}) OR 
        LOWER(up.last_name) LIKE LOWER($${countParamCount}) OR 
        LOWER(CONCAT(up.first_name, ' ', up.last_name)) LIKE LOWER($${countParamCount}) OR
        LOWER(CONCAT(up.last_name, ' ', up.first_name)) LIKE LOWER($${countParamCount})
      )`;
      countParams.push(`%${searchTerm}%`);
    }
    
    if (category && category !== 'All') {
      countParamCount++;
      countQuery += ` AND LOWER(ug.category) = LOWER($${countParamCount})`;
      countParams.push(category);
    }
    
    if (status && status !== 'All') {
      if (status === 'Completed') {
        countQuery += ` AND ug.completed = true`;
      } else if (status === 'Incomplete') {
        countQuery += ` AND ug.completed = false`;
      }
    }
    
    const countResult = await executeQueryWithRetry(countQuery, countParams);
    const totalGoals = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalGoals / limit);
    
    // Transform the data with date validation
    const transformedGoals = goalsResult.rows.map((goal: any) => {
      // Validate and format dates
      let dateCreated: string;
      let dateCompleted: string | undefined;
      
      try {
        const createdDate = new Date(goal.created_at);
        if (isNaN(createdDate.getTime())) {
          console.warn('Invalid created_at date for goal:', goal.id, goal.created_at);
          dateCreated = new Date().toISOString(); // Fallback to current date
        } else {
          dateCreated = createdDate.toISOString();
        }
        
        if (goal.completed && goal.updated_at) {
          const completedDate = new Date(goal.updated_at);
          if (isNaN(completedDate.getTime())) {
            console.warn('Invalid updated_at date for goal:', goal.id, goal.updated_at);
            dateCompleted = undefined;
          } else {
            dateCompleted = completedDate.toISOString();
          }
        }
      } catch (error) {
        console.error('Date parsing error for goal:', goal.id, error);
        dateCreated = new Date().toISOString();
        dateCompleted = undefined;
      }
      
      return {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        status: goal.completed ? 'Completed' : 'Incomplete',
        dateCreated,
        dateCompleted,
        priority: goal.priority,
        studentName: goal.student_name,
        studentAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(goal.student_name)}&background=random`
      };
    });
    
    // Calculate next cursor for cursor-based pagination
    let nextCursor = null;
    if (transformedGoals.length > 0 && transformedGoals.length === limit) {
      const lastGoal = transformedGoals[transformedGoals.length - 1];
      nextCursor = lastGoal.dateCompleted || lastGoal.dateCreated;
    }
    
    return NextResponse.json({
      goals: transformedGoals,
      pagination: {
        currentPage: page,
        totalPages,
        totalGoals,
        hasMore: page < totalPages,
        limit,
        nextCursor
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching paginated goals:', error);
    
    // Handle specific timeout errors
    if (error instanceof Error && error.message.includes('ETIMEDOUT')) {
      return NextResponse.json(
        { 
          error: 'Database connection timeout',
          message: 'The database is currently experiencing high load. Please try again in a moment.',
          retryAfter: 30
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch goals',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
