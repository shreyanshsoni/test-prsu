import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../lib/db';

// GET endpoint to fetch all institutes
export async function GET(request: NextRequest) {
  try {
    const institutes = await executeQuery(
      'SELECT institute_id, institute_name, total_students, created_at FROM institute_list ORDER BY institute_name ASC'
    );
    
    return NextResponse.json({ institutes }, { status: 200 });
  } catch (error) {
    console.error('Error fetching institutes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch institutes' },
      { status: 500 }
    );
  }
}

