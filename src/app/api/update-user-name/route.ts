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
    
    // Get the name data from the request body
    try {
      const { firstName, lastName } = await request.json();
      
      // Validate input
      if (!firstName || !lastName) {
        return NextResponse.json(
          { error: 'Both first name and last name are required' }, 
          { status: 400 }
        );
      }
      
      // Capitalize first letter of each name
      const capitalizeFirstLetter = (str: string) => {
        return str.trim().charAt(0).toUpperCase() + str.trim().slice(1).toLowerCase();
      };
      
      const formattedFirstName = capitalizeFirstLetter(firstName);
      const formattedLastName = capitalizeFirstLetter(lastName);
      
      // Update the user's first_name and last_name in the database
      const result = await sql`
        UPDATE user_profiles 
        SET first_name = ${formattedFirstName}, last_name = ${formattedLastName}
        WHERE user_id = ${userId}
        RETURNING first_name, last_name;
      `;
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'User profile not found' }, 
          { status: 404 }
        );
      }
      
      // Return success with updated names
      return NextResponse.json({ 
        success: true, 
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name
      }, { status: 200 });
      
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid request data format', 
          details: parseError instanceof Error ? parseError.message : String(parseError)
        }, 
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating user names:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update user names', 
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}
