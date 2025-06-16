import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { sql } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/roadmap-planners
 * Fetch all roadmap planners for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.user.sub;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Query the database for all roadmap planners for this user
    const { rows: roadmapRows } = await sql`
      SELECT * FROM roadmap_planners 
      WHERE user_id = ${userId}
      ORDER BY last_modified DESC
    `;
    
    // For each roadmap, get its phases
    const roadmapPlanners = await Promise.all(roadmapRows.map(async (roadmap) => {
      const { rows: phaseRows } = await sql`
        SELECT * FROM roadmap_phases 
        WHERE roadmap_id = ${roadmap.id}
        ORDER BY position
      `;
      
      // For each phase, get its tasks
      const phases = await Promise.all(phaseRows.map(async (phase) => {
        const { rows: taskRows } = await sql`
          SELECT * FROM roadmap_tasks 
          WHERE phase_id = ${phase.id}
          ORDER BY position
        `;
        
        const tasks = taskRows.map(task => ({
          id: task.id,
          title: task.title,
          completed: task.completed,
          notes: task.notes || '',
          dueDate: task.due_date ? task.due_date.toISOString().split('T')[0] : null
        }));
        
        return {
          id: phase.id,
          title: phase.title,
          description: phase.description || '',
          reflection: phase.reflection || '',
          tasks
        };
      }));
      
      return {
        id: roadmap.id,
        goal: {
          title: roadmap.goal_title,
          identity: roadmap.goal_identity,
          deadline: roadmap.goal_deadline ? roadmap.goal_deadline.toISOString().split('T')[0] : ''
        },
        phases,
        createdAt: roadmap.created_at.toISOString(),
        lastModified: roadmap.last_modified.toISOString()
      };
    }));
    
    return NextResponse.json({ roadmapPlanners });
  } catch (error) {
    console.error('Error fetching roadmap planners:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/roadmap-planners
 * Create a new roadmap planner
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.user.sub;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { goal } = await req.json();
    
    if (!goal || !goal.title) {
      return NextResponse.json({ error: 'Goal title is required' }, { status: 400 });
    }
    
    const roadmapId = `roadmap-${uuidv4()}`;
    const now = new Date();
    
    // Insert the new roadmap planner
    await sql`
      INSERT INTO roadmap_planners (
        id, user_id, goal_title, goal_identity, goal_deadline, created_at, last_modified
      ) VALUES (
        ${roadmapId}, ${userId}, ${goal.title}, ${goal.identity || ''}, 
        ${goal.deadline ? new Date(goal.deadline) : null}, 
        ${now}, ${now}
      )
    `;
    
    const roadmapPlanner = {
      id: roadmapId,
      goal,
      phases: [],
      createdAt: now.toISOString(),
      lastModified: now.toISOString()
    };
    
    return NextResponse.json({ roadmapPlanner });
  } catch (error) {
    console.error('Error creating roadmap planner:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 