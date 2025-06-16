import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { sql } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid';

// Helper function to ensure user_goals table exists
async function ensureUserGoalsTableExists() {
  try {
    // Check if user_goals table exists
    const { rows: tables } = await sql`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = 'user_goals'
    `;

    if (tables.length === 0) {
      console.log('Creating user_goals table...');
      
      // Create user_goals table
      await sql`
        CREATE TABLE IF NOT EXISTS user_goals (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          due_date TEXT,
          category TEXT NOT NULL,
          completed BOOLEAN DEFAULT FALSE,
          priority TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Create indexes for better performance
      await sql`CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_user_goals_category ON user_goals(category)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_user_goals_completed ON user_goals(completed)`;
    }
  } catch (error) {
    console.error('Error ensuring user_goals table exists:', error);
  }
}

// GET handler - retrieve all goals for the current user
export async function GET(req: NextRequest) {
  try {
    // Ensure table exists
    await ensureUserGoalsTableExists();
    
    const session = await getSession();
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const userId = session.user.sub;
    
    // Get optional filter query parameters
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get('category');
    const completed = searchParams.get('completed');
    
    try {
      let goalsQuery;
      
      // Apply filters if present
      if (category && completed !== null) {
        const completedBool = completed === 'true';
        goalsQuery = await sql`
          SELECT * FROM user_goals
          WHERE user_id = ${userId}
          AND category = ${category}
          AND completed = ${completedBool}
          ORDER BY created_at DESC
        `;
      } else if (category) {
        goalsQuery = await sql`
          SELECT * FROM user_goals
          WHERE user_id = ${userId}
          AND category = ${category}
          ORDER BY created_at DESC
        `;
      } else if (completed !== null) {
        const completedBool = completed === 'true';
        goalsQuery = await sql`
          SELECT * FROM user_goals
          WHERE user_id = ${userId}
          AND completed = ${completedBool}
          ORDER BY created_at DESC
        `;
      } else {
        goalsQuery = await sql`
          SELECT * FROM user_goals
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
        `;
      }
      
      return NextResponse.json({ goals: goalsQuery.rows });
    } catch (err) {
      console.error('SQL error retrieving goals:', err);
      return NextResponse.json(
        { error: "Database error: " + err.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled error retrieving goals:', error);
    return NextResponse.json(
      { error: "Failed to retrieve goals: " + error.message },
      { status: 500 }
    );
  }
}

// POST handler - create a new goal
export async function POST(req: NextRequest) {
  try {
    // Ensure table exists
    await ensureUserGoalsTableExists();
    
    const session = await getSession();
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const userId = session.user.sub;
    
    try {
      const { title, description, dueDate, category, priority } = await req.json();
      
      // Validate input
      if (!title || typeof title !== 'string') {
        return NextResponse.json(
          { error: "Goal title is required" },
          { status: 400 }
        );
      }
      
      if (!category || typeof category !== 'string') {
        return NextResponse.json(
          { error: "Goal category is required" },
          { status: 400 }
        );
      }

      // Create new goal
      const goalId = uuidv4();
      const createdAt = new Date().toISOString();
      const updatedAt = createdAt;

      await sql`
        INSERT INTO user_goals (
          id, user_id, title, description, due_date, 
          category, completed, priority, created_at, updated_at
        )
        VALUES (
          ${goalId}, ${userId}, ${title}, ${description || ''}, ${dueDate || null}, 
          ${category}, false, ${priority || 'medium'}, ${createdAt}, ${updatedAt}
        )
      `;

      // Return the created goal
      return NextResponse.json({
        goal: {
          id: goalId,
          userId,
          title,
          description: description || '',
          dueDate: dueDate || null,
          category,
          completed: false,
          priority: priority || 'medium',
          createdAt,
          updatedAt
        }
      }, { status: 201 });
    } catch (err) {
      console.error('SQL error creating goal:', err);
      return NextResponse.json(
        { error: "Database error: " + err.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled error creating goal:', error);
    return NextResponse.json(
      { error: "Failed to create goal: " + error.message },
      { status: 500 }
    );
  }
} 