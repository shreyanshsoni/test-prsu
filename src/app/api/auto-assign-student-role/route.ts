import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user from Auth0
    const session = await getSession(request);
    
    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.sub;
    
    // Check if user already exists in user_profiles
    const existingUser = await sql`
      SELECT user_id, user_role, first_name, last_name 
      FROM user_profiles 
      WHERE user_id = ${userId}
    `;
    
    if (existingUser.rows.length === 0) {
      // User doesn't exist - create new record with student role
      await sql`
        INSERT INTO user_profiles (user_id, user_role, first_name, last_name, profile_data)
        VALUES (${userId}, 'student', NULL, NULL, '{}'::jsonb)
      `;
      
      return NextResponse.json({ 
        success: true, 
        action: 'created',
        user_role: 'student',
        needs_name: true
      }, { status: 200 });
    } else {
      // User exists - update role to student if it's null
      const user = existingUser.rows[0];
      
      if (!user.user_role) {
        await sql`
          UPDATE user_profiles 
          SET user_role = 'student'
          WHERE user_id = ${userId}
        `;
      }
      
      // Check if names are missing
      const needsName = !user.first_name || !user.last_name;
      
      return NextResponse.json({ 
        success: true, 
        action: 'updated',
        user_role: 'student',
        needs_name: needsName,
        first_name: user.first_name,
        last_name: user.last_name
      }, { status: 200 });
    }
    
  } catch (error) {
    console.error('Error auto-assigning student role:', error);
    return NextResponse.json(
      { 
        error: 'Failed to assign student role', 
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}
