import { executeQuery } from '../db';
import { StudentData } from '../../app/custom-user-profile/src/types/student';

interface UserProfileRecord {
  id: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  profile_data: StudentData;
}

export const userProfileService = {
  /**
   * Gets a user profile by Auth0 user ID
   */
  async getProfileByUserId(userId: string): Promise<StudentData | null> {
    try {
      console.log(`Getting profile for user: ${userId}`);
      const query = 'SELECT profile_data FROM user_profiles WHERE user_id = $1';
      const results = await executeQuery<UserProfileRecord>(query, [userId]);
      
      if (results.length === 0) {
        console.log(`No profile found for user: ${userId}`);
        return null;
      }
      
      console.log('Successfully retrieved user profile');
      return results[0].profile_data;
    } catch (error) {
      console.error(`Error getting user profile for ${userId}:`, error);
      throw new Error(`Failed to get user profile: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Creates a new user profile or fully replaces an existing one
   */
  async createOrUpdateProfile(userId: string, profileData: Partial<StudentData>): Promise<void> {
    try {
      console.log(`Creating/updating profile for user: ${userId}`);
      
      // Sanitize the data by converting to JSON string and parsing back
      // This ensures circular references are removed and the data is serializable
      const sanitizedData = JSON.parse(JSON.stringify(profileData || {}));
      
      // Use proper JSON casting for PostgreSQL
      const query = `
        INSERT INTO user_profiles (user_id, profile_data) 
        VALUES ($1, $2::jsonb)
        ON CONFLICT (user_id) 
        DO UPDATE SET profile_data = $2::jsonb, updated_at = NOW()
      `;
      
      console.log('Executing createOrUpdateProfile query');
      await executeQuery(query, [userId, sanitizedData]);
      console.log(`Profile successfully created/updated for user: ${userId}`);
    } catch (error) {
      console.error(`Error creating/updating user profile for ${userId}:`, error);
      throw new Error(`Failed to create/update user profile: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Updates specific fields of an existing user profile
   */
  async updateProfileFields(userId: string, fieldsToUpdate: Partial<StudentData>): Promise<void> {
    try {
      console.log(`Updating profile fields for user: ${userId}`);
      console.log('Fields to update:', Object.keys(fieldsToUpdate));
      
      // Get the current profile first
      let currentProfile = await this.getProfileByUserId(userId);
      
      // Sanitize the incoming fields
      const sanitizedFields = JSON.parse(JSON.stringify(fieldsToUpdate || {}));
      
      // If no profile exists, create a new one with just these fields
      if (!currentProfile) {
        console.log(`No existing profile found for ${userId}, creating new one`);
        await this.createOrUpdateProfile(userId, sanitizedFields);
        return;
      }
      
      // Ensure currentProfile is not null before merging
      currentProfile = currentProfile || {};
      
      // Merge the current profile with the updates
      const updatedProfile = {
        ...currentProfile,
        ...sanitizedFields
      };
      
      // Update the profile with the merged data
      await this.createOrUpdateProfile(userId, updatedProfile);
      console.log(`Profile fields successfully updated for user: ${userId}`);
    } catch (error) {
      console.error(`Error updating profile fields for ${userId}:`, error);
      throw new Error(`Failed to update profile fields: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Deletes a user profile
   */
  async deleteProfile(userId: string): Promise<void> {
    try {
      console.log(`Deleting profile for user: ${userId}`);
      const query = 'DELETE FROM user_profiles WHERE user_id = $1';
      await executeQuery(query, [userId]);
      console.log(`Profile successfully deleted for user: ${userId}`);
    } catch (error) {
      console.error(`Error deleting profile for ${userId}:`, error);
      throw new Error(`Failed to delete profile: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}; 