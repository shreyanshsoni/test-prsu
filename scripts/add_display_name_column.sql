-- Add display_name column to user_profiles and backfill
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Optional backfill from profile_data.name or email if present
UPDATE user_profiles
SET display_name = COALESCE(
  NULLIF(TRIM((profile_data->>'name')), ''),
  NULLIF(TRIM((profile_data->>'firstName')), '') ||
    CASE WHEN NULLIF(TRIM((profile_data->>'lastName')), '') IS NOT NULL THEN ' ' || TRIM((profile_data->>'lastName')) ELSE '' END,
  profile_data->>'email',
  display_name
)
WHERE (display_name IS NULL OR display_name = '')
  AND (
    (profile_data ? 'name') OR
    (profile_data ? 'firstName') OR
    (profile_data ? 'lastName') OR
    (profile_data ? 'email')
  );

-- Index for common lookups by display_name
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON user_profiles (display_name);


