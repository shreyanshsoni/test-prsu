# Role-Based Access Control System

This document describes the implementation of a comprehensive role-based access control system for the PRSU Academic Planner.

## Overview

The system now supports three user roles:
- **Student**: Regular users who can create profiles and take assessments
- **Counselor**: Users who can view student data and manage assignments
- **Admin**: System administrators (future use)

## Database Schema

### User Profiles Table
```sql
-- Added user_role column to existing user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN user_role VARCHAR(20) CHECK (user_role IN ('student', 'counselor', 'admin'));
```

### Counselor-Student Assignments Table
```sql
CREATE TABLE counselor_student_assignments (
  id SERIAL PRIMARY KEY,
  counselor_user_id TEXT NOT NULL,
  student_user_id TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  
  CONSTRAINT unique_counselor_student UNIQUE (counselor_user_id, student_user_id)
);
```

### Counselor Assessments Table
```sql
CREATE TABLE counselor_assessments (
  id SERIAL PRIMARY KEY,
  student_user_id TEXT NOT NULL,
  counselor_user_id TEXT NOT NULL,
  assessment_session_id TEXT NOT NULL,
  
  -- Assessment Results (System-Generated Only)
  assessment_data JSONB NOT NULL,
  calculated_scores JSONB NOT NULL,
  
  -- PRSU Matrix Scores (System-Calculated)
  matrix_scores JSONB NOT NULL,
  readiness_zones JSONB NOT NULL,
  overall_stage VARCHAR(20) NOT NULL CHECK (overall_stage IN ('Early', 'Mid', 'Late', 'Insufficient Data')),
  
  -- Scoring Details
  total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 1200),
  area_scores JSONB NOT NULL,
  
  -- Metadata
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT unique_assessment_session UNIQUE (student_user_id, assessment_session_id)
);
```

## API Endpoints

### User Roles
- `GET /api/user-roles` - Get current user's role
- `POST /api/user-roles` - Set user's role

### Counselor Assignments
- `GET /api/counselor-assignments` - Get students assigned to counselor
- `POST /api/counselor-assignments` - Assign student to counselor
- `DELETE /api/counselor-assignments` - Remove student assignment

## Components

### Hooks
- `useUserRole()` - Custom hook for role management
- `useAuth()` - Existing authentication hook

### Pages
- `role-selection/page.tsx` - Role selection interface
- `counselor/page.tsx` - Counselor dashboard with role validation
- `page.tsx` - Main page with role-based routing

### Components
- `CounselorAssignments.tsx` - Student assignment management
- `Navigation.tsx` - Updated with role-based navigation

## Security Features

### Server-Side Validation
- All role checks are performed server-side
- Database-level constraints ensure data integrity
- API endpoints validate user roles before processing

### Access Control
- Counselors can only access assigned students
- Students cannot access counselor features
- Role changes require authentication

## Migration

To apply the database changes:

```bash
# Run the migration script
node scripts/migrate_user_roles.js
```

Or manually run the SQL:

```bash
# Apply the schema changes
psql $POSTGRES_URL -f scripts/add_user_role_column.sql
```

## Usage

### Setting User Role
```typescript
const { setUserRole } = useUserRole();

// Set user as counselor
await setUserRole('counselor');
```

### Checking User Role
```typescript
const { role, isLoading } = useUserRole();

if (role === 'counselor') {
  // Show counselor features
}
```

### Server-Side Role Validation
```typescript
import { validateUserRole } from '../lib/utils/roleValidation';

// In API route
const isCounselor = await validateUserRole(userId, 'counselor');
if (!isCounselor) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

## Routing Logic

### Main Page (`/`)
- Authenticated users with `student` role → Show student dashboard
- Authenticated users with `counselor` role → Redirect to `/counselor`
- Authenticated users with no role → Redirect to `/role-selection`
- Unauthenticated users → Show landing page

### Counselor Page (`/counselor`)
- Only accessible to users with `counselor` role
- Redirects to role selection if role is not counselor

### Role Selection (`/role-selection`)
- Allows users to select their role
- Saves role to database
- Redirects to appropriate page based on role

## Future Enhancements

1. **Admin Role**: Add admin functionality for system management
2. **Role Permissions**: Granular permissions within roles
3. **Audit Logging**: Track role changes and access
4. **Bulk Assignment**: Assign multiple students to counselors
5. **Role Templates**: Predefined role configurations

## Troubleshooting

### Common Issues

1. **Role not saving**: Check database connection and user authentication
2. **Access denied**: Verify user has correct role in database
3. **Redirect loops**: Ensure role loading completes before routing

### Debug Commands

```sql
-- Check user roles
SELECT user_id, user_role FROM user_profiles;

-- Check counselor assignments
SELECT * FROM counselor_student_assignments WHERE is_active = true;

-- Check assessment data
SELECT student_user_id, overall_stage, total_score FROM counselor_assessments;
```

