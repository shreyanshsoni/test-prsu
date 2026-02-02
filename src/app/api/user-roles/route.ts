import { NextRequest, NextResponse } from 'next/server';
import { getAuth0 } from '../../../lib/auth0';
import { executeQuery } from '../../../lib/db';

// GET endpoint to fetch user role
export async function GET(request: NextRequest) {
  try {
    const auth0 = getAuth0(request);
    const session = await auth0.getSession(request);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.sub;
    
    // Get user role from database
    const result = await executeQuery(
      'SELECT user_role FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    
    if (result.length === 0) {
      return NextResponse.json({ role: null }, { status: 200 });
    }
    
    return NextResponse.json({ role: result[0].user_role }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user role' },
      { status: 500 }
    );
  }
}

// POST endpoint to set user role
export async function POST(request: NextRequest) {
  try {
    const auth0 = getAuth0(request);
    const session = await auth0.getSession(request);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.sub;
    const { role } = await request.json();
    
    // Validate role
    if (!['student', 'counselor', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    
    // First, ensure the user exists in user_profiles table
    // If not, create them with the role
    const result = await executeQuery(`
      INSERT INTO user_profiles (user_id, user_role, profile_data) 
      VALUES ($1, $2, $3::jsonb)
      ON CONFLICT (user_id) 
      DO UPDATE SET user_role = $2, updated_at = NOW()
    `, [userId, role, JSON.stringify({})]);
    
    return NextResponse.json({ success: true, role }, { status: 200 });
  } catch (error) {
    console.error('Error setting user role:', error);
    return NextResponse.json(
      { error: 'Failed to set user role' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update user role (same as POST for now)
export async function PUT(request: NextRequest) {
  return POST(request);
}
