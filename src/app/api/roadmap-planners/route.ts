import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';
import { sql } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/roadmap-planners
 * Fetch all roadmap planners for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
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
          completionStatus: task.completion_status || 'in_progress',
          completedAt: task.completed_at ? task.completed_at.toISOString() : null,
          recentActivity: task.recent_activity ? task.recent_activity.toISOString() : null,
          notes: task.notes || '',
          dueDate: task.due_date ? task.due_date.toISOString().split('T')[0] : null
        }));
        
        return {
          id: phase.id,
          title: phase.title,
          description: phase.description || '',
          reflection: phase.reflection || '',
          completionStatus: phase.completion_status || 'in_progress',
          completedAt: phase.completed_at ? phase.completed_at.toISOString() : null,
          recentActivity: phase.recent_activity ? phase.recent_activity.toISOString() : null,
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
        careerBlurb: roadmap.career_blurb || '',
        completionStatus: roadmap.completion_status || 'in_progress',
        completedAt: roadmap.completed_at ? roadmap.completed_at.toISOString() : null,
        recentActivity: roadmap.recent_activity ? roadmap.recent_activity.toISOString() : null,
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
    const session = await getSession(req);
    const userId = session?.user.sub;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { goal, phases = [] } = await req.json();
    
    if (!goal || !goal.title) {
      return NextResponse.json({ error: 'Goal title is required' }, { status: 400 });
    }
    
    const roadmapId = `roadmap-${uuidv4()}`;
    const now = new Date();
    
    // Insert the new roadmap planner
    await sql`
      INSERT INTO roadmap_planners (
        id, user_id, goal_title, goal_identity, goal_deadline, career_blurb, created_at, last_modified
      ) VALUES (
        ${roadmapId}, ${userId}, ${goal.title}, ${goal.identity || ''}, 
        ${goal.deadline ? new Date(goal.deadline) : null},
        ${goal.careerBlurb || ''},
        ${now}, ${now}
      )
    `;
    
    // Insert phases if provided
    const createdPhases = [];
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      const phaseId = `phase-${uuidv4()}`;
      
             // Insert phase
       await sql`
         INSERT INTO roadmap_phases (
           id, roadmap_id, title, description, reflection, position, created_at
         ) VALUES (
           ${phaseId}, ${roadmapId}, ${phase.title}, ${phase.description || ''}, 
           ${phase.reflection || ''}, ${i}, ${now}
         )
       `;
       
       // Insert tasks for this phase
       const phaseTasks = [];
       for (let j = 0; j < phase.tasks.length; j++) {
         const task = phase.tasks[j];
         const taskId = `task-${uuidv4()}`;
         
         await sql`
           INSERT INTO roadmap_tasks (
             id, phase_id, title, notes, due_date, completed, position, created_at
           ) VALUES (
             ${taskId}, ${phaseId}, ${task.title}, ${task.notes || ''}, 
             ${task.dueDate ? new Date(task.dueDate) : null}, 
             ${task.completed || false}, ${j}, ${now}
           )
         `;
        
        phaseTasks.push({
          id: taskId,
          title: task.title,
          completed: task.completed || false,
          notes: task.notes || '',
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null
        });
      }
      
      createdPhases.push({
        id: phaseId,
        title: phase.title,
        description: phase.description || '',
        reflection: phase.reflection || '',
        tasks: phaseTasks
      });
    }
    
    const roadmapPlanner = {
      id: roadmapId,
      goal,
      careerBlurb: goal.careerBlurb || '',
      phases: createdPhases,
      createdAt: now.toISOString(),
      lastModified: now.toISOString()
    };
    
    return NextResponse.json({ roadmapPlanner });
  } catch (error) {
    console.error('Error creating roadmap planner:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 