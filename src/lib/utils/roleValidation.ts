import { executeQuery } from '../db';

export interface UserRole {
  userId: string;
  role: 'student' | 'counselor' | 'admin' | null;
}

/**
 * Validates if a user has the required role
 */
export async function validateUserRole(userId: string, requiredRole: 'student' | 'counselor' | 'admin'): Promise<boolean> {
  try {
    const result = await executeQuery(
      'SELECT user_role FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    
    if (result.length === 0) {
      return false;
    }
    
    const userRole = result[0].user_role;
    return userRole === requiredRole;
  } catch (error) {
    console.error('Error validating user role:', error);
    return false;
  }
}

/**
 * Gets user role from database
 */
export async function getUserRole(userId: string): Promise<UserRole['role']> {
  try {
    const result = await executeQuery(
      'SELECT user_role FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    
    if (result.length === 0) {
      return null;
    }
    
    return result[0].user_role;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Middleware function to check if user has required role
 */
export async function requireRole(requiredRole: 'student' | 'counselor' | 'admin') {
  return async (userId: string) => {
    const hasRole = await validateUserRole(userId, requiredRole);
    if (!hasRole) {
      throw new Error(`Access denied. Required role: ${requiredRole}`);
    }
    return true;
  };
}

/**
 * Check if a counselor is assigned to a specific student
 */
export async function isCounselorAssignedToStudent(counselorUserId: string, studentUserId: string): Promise<boolean> {
  try {
    const result = await executeQuery(
      'SELECT id FROM counselor_student_assignments WHERE counselor_user_id = $1 AND student_user_id = $2 AND is_active = true',
      [counselorUserId, studentUserId]
    );
    
    return result.length > 0;
  } catch (error) {
    console.error('Error checking counselor assignment:', error);
    return false;
  }
}

/**
 * Get all students assigned to a counselor
 */
export async function getAssignedStudents(counselorUserId: string): Promise<string[]> {
  try {
    const result = await executeQuery(
      'SELECT student_user_id FROM counselor_student_assignments WHERE counselor_user_id = $1 AND is_active = true',
      [counselorUserId]
    );
    
    return result.map(row => row.student_user_id);
  } catch (error) {
    console.error('Error getting assigned students:', error);
    return [];
  }
}

