import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';
import { executeQuery } from '../../../lib/db';

// POST endpoint to select an institute and verify secret key
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.sub;
    const { instituteId, secretKey } = await request.json();
    
    if (!instituteId || !secretKey) {
      return NextResponse.json(
        { error: 'Institute ID and secret key are required' },
        { status: 400 }
      );
    }
    
    // Verify the secret key matches the institute
    const instituteResult = await executeQuery(
      'SELECT institute_id, institute_name, institute_secret_key FROM institute_list WHERE institute_id = $1',
      [instituteId]
    );
    
    if (instituteResult.length === 0) {
      return NextResponse.json(
        { error: 'Institute not found' },
        { status: 404 }
      );
    }
    
    const institute = instituteResult[0];
    
    if (institute.institute_secret_key !== secretKey) {
      return NextResponse.json(
        { error: 'Invalid secret key' },
        { status: 401 }
      );
    }
    
    // Update user profile with institute and set status to pending
    await executeQuery(
      `UPDATE user_profiles 
       SET institute_id = $1, 
           verification_status = 'pending',
           updated_at = NOW()
       WHERE user_id = $2`,
      [instituteId, userId]
    );
    
    // If user doesn't exist, create them
    const existingUser = await executeQuery(
      'SELECT user_id FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    
    if (existingUser.length === 0) {
      const displayName = session.user.sub?.includes('auth0') 
        ? (session.user.nickname || session.user.name || session.user.email || 'User')
        : (session.user.name?.split(' ')[0] || 'User');
      
      await executeQuery(
        `INSERT INTO user_profiles (user_id, profile_data, display_name, user_role, institute_id, verification_status)
         VALUES ($1, $2::jsonb, $3, 'student', $4, 'pending')`,
        [userId, JSON.stringify({}), displayName, instituteId]
      );
    }
    
    return NextResponse.json({
      success: true,
      institute: {
        id: institute.institute_id,
        name: institute.institute_name
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error selecting institute:', error);
    return NextResponse.json(
      { error: 'Failed to select institute' },
      { status: 500 }
    );
  }
}

