import { NextRequest, NextResponse } from 'next/server';
import { getAuth0 } from '../../../lib/auth0';
import { userProfileService } from '../../../lib/services/userProfileService';

// GET endpoint to fetch user profile
export async function GET(request: NextRequest) {
  try {
    // Get Auth0 instance with dynamic baseURL for multi-domain support
    const auth0 = getAuth0(request);
    const session = await auth0.getSession(request);
    
    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.sub;
    
    // Get the user profile from the database
    const profile = await userProfileService.getProfileByUserId(userId);
    
    // Also get the first_name and last_name from the user_profiles table
    const profileRecord = await userProfileService.getProfileRecordByUserId(userId);
    
    // If profile doesn't exist, return an empty object (not an error)
    if (!profile && !profileRecord) {
      return NextResponse.json({ profile: {} }, { status: 200 });
    }
    
    // Combine profile_data with first_name and last_name
    const hasInstitute = profileRecord?.institute_id !== null && profileRecord?.institute_id !== undefined;
    const combinedProfile = {
      ...profile,
      first_name: profileRecord?.first_name || null,
      last_name: profileRecord?.last_name || null,
      user_role: profileRecord?.user_role || null,
      display_name: profileRecord?.display_name || null,
      institute_id: profileRecord?.institute_id || null,
      institute_name: profileRecord?.institute_name || null,
      // Only expose verification_status when an institute has been selected to avoid
      // treating brand-new users as pending before they submit the form
      verification_status: hasInstitute ? (profileRecord?.verification_status || 'pending') : null,
      is_verified: profileRecord?.is_verified || false
    };
    
    // Return the combined profile
    return NextResponse.json({ profile: combinedProfile }, { status: 200 });
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
  try {
    // Get Auth0 instance with dynamic baseURL for multi-domain support
    const auth0 = getAuth0(request);
    const session = await auth0.getSession(request);
    
    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.sub;
    
    // Get the profile data from the request body
    try {
      const profileData = await request.json();
      
      // Update only specified fields
      await userProfileService.updateProfileFields(userId, profileData);
      
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
  try {
    // Get Auth0 instance with dynamic baseURL for multi-domain support
    const auth0 = getAuth0(request);
    const session = await auth0.getSession(request);
    
    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.sub;
    
    // Get the profile data from the request body
    try {
      const profileData = await request.json();
      
      // Replace the entire profile
      await userProfileService.createOrUpdateProfile(userId, profileData);
      
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
  try {
    // Get Auth0 instance with dynamic baseURL for multi-domain support
    const auth0 = getAuth0(request);
    const session = await auth0.getSession(request);
    
    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.sub;
    
    // Delete the profile
    await userProfileService.deleteProfile(userId);
    
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
