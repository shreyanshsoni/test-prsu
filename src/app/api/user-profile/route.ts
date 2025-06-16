import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { userProfileService } from '../../../lib/services/userProfileService';

// Set runtime to Node.js for Auth0
export const runtime = 'nodejs';

// GET endpoint to fetch user profile
export async function GET(request: NextRequest) {
  console.log('GET /api/user-profile - Starting request');
  try {
    // Get the authenticated user from Auth0
    console.log('Fetching Auth0 session');
    const session = await getSession();
    
    // Check if the user is authenticated
    if (!session || !session.user) {
      console.log('No authenticated user found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.sub;
    console.log(`User authenticated: ${userId}`);
    
    // Get the user profile from the database
    console.log(`Fetching profile for user: ${userId}`);
    const profile = await userProfileService.getProfileByUserId(userId);
    
    // If profile doesn't exist, return an empty object (not an error)
    if (!profile) {
      console.log(`No profile found for user: ${userId}`);
      return NextResponse.json({ profile: {} }, { status: 200 });
    }
    
    console.log('Profile found, returning to client');
    // Return the profile
    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch user profile',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}

// POST endpoint to create or update user profile
export async function POST(request: NextRequest) {
  console.log('POST /api/user-profile - Starting request');
  try {
    // Get the authenticated user from Auth0
    console.log('Fetching Auth0 session');
    const session = await getSession();
    
    // Check if the user is authenticated
    if (!session || !session.user) {
      console.log('No authenticated user found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.sub;
    console.log(`User authenticated: ${userId}`);
    
    // Get the profile data from the request body
    try {
      console.log('Parsing request body');
      const profileData = await request.json();
      console.log(`Received data for user ${userId}:`, JSON.stringify(profileData).substring(0, 200) + '...');
      
      // Update only specified fields
      console.log('Updating profile fields');
      await userProfileService.updateProfileFields(userId, profileData);
      
      console.log('Profile updated successfully');
      // Return success
      return NextResponse.json({ success: true }, { status: 200 });
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
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update user profile', 
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}

// PUT endpoint to replace entire user profile
export async function PUT(request: NextRequest) {
  console.log('PUT /api/user-profile - Starting request');
  try {
    // Get the authenticated user from Auth0
    console.log('Fetching Auth0 session');
    const session = await getSession();
    
    // Check if the user is authenticated
    if (!session || !session.user) {
      console.log('No authenticated user found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.sub;
    console.log(`User authenticated: ${userId}`);
    
    // Get the profile data from the request body
    try {
      console.log('Parsing request body');
      const profileData = await request.json();
      console.log(`Received data for user ${userId}:`, JSON.stringify(profileData).substring(0, 200) + '...');
      
      // Replace the entire profile
      console.log('Replacing full profile');
      await userProfileService.createOrUpdateProfile(userId, profileData);
      
      console.log('Profile replaced successfully');
      // Return success
      return NextResponse.json({ success: true }, { status: 200 });
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
    console.error('Error replacing user profile:', error);
    return NextResponse.json(
      { 
        error: 'Failed to replace user profile', 
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}

// DELETE endpoint to delete user profile
export async function DELETE(request: NextRequest) {
  console.log('DELETE /api/user-profile - Starting request');
  try {
    // Get the authenticated user from Auth0
    console.log('Fetching Auth0 session');
    const session = await getSession();
    
    // Check if the user is authenticated
    if (!session || !session.user) {
      console.log('No authenticated user found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.sub;
    console.log(`User authenticated: ${userId}`);
    
    // Delete the profile
    console.log(`Deleting profile for user: ${userId}`);
    await userProfileService.deleteProfile(userId);
    
    console.log('Profile deleted successfully');
    // Return success
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user profile:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete user profile',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
} 