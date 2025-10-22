-- Adds first_name and last_name columns to user_profiles if they don't exist
-- Existing rows will have these columns as NULL by default

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Optionally backfill from profile_data if present (best-effort)
-- UPDATE user_profiles
-- SET first_name = COALESCE(first_name, (profile_data->>'firstName')),
--     last_name  = COALESCE(last_name,  (profile_data->>'lastName'))
-- WHERE (profile_data ? 'firstName') OR (profile_data ? 'lastName');


