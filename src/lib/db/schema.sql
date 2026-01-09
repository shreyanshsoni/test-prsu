-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Institute list (schools)
CREATE TABLE IF NOT EXISTS institute_list (
  institute_id SERIAL PRIMARY KEY,
  institute_name VARCHAR(255) NOT NULL UNIQUE,
  total_students INTEGER NOT NULL DEFAULT 0,
  institute_secret_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_institute_list_secret_key ON institute_list(institute_secret_key);

-- Trigger to automatically update the updated_at column for institute_list
CREATE TRIGGER update_institute_list_updated_at
BEFORE UPDATE ON institute_list
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- User profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  profile_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add institute + verification columns
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS institute_id INTEGER REFERENCES institute_list(institute_id),
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verified_by TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_institute ON user_profiles(institute_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_institute_status ON user_profiles(institute_id, verification_status);

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Keep is_verified aligned with verification_status
CREATE OR REPLACE FUNCTION set_is_verified_from_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_verified = (NEW.verification_status = 'approved');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_is_verified_from_status_trigger ON user_profiles;
CREATE TRIGGER set_is_verified_from_status_trigger
BEFORE INSERT OR UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION set_is_verified_from_status();

-- Trigger/function to keep institute_list.total_students in sync with approved students
CREATE OR REPLACE FUNCTION sync_institute_student_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.institute_id IS NOT NULL AND NEW.verification_status = 'approved' THEN
      UPDATE institute_list SET total_students = total_students + 1 WHERE institute_id = NEW.institute_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle institute change or status change
    IF OLD.institute_id IS NOT NULL AND OLD.verification_status = 'approved' THEN
      UPDATE institute_list SET total_students = total_students - 1 WHERE institute_id = OLD.institute_id;
    END IF;
    IF NEW.institute_id IS NOT NULL AND NEW.verification_status = 'approved' THEN
      UPDATE institute_list SET total_students = total_students + 1 WHERE institute_id = NEW.institute_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.institute_id IS NOT NULL AND OLD.verification_status = 'approved' THEN
      UPDATE institute_list SET total_students = total_students - 1 WHERE institute_id = OLD.institute_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_institute_student_counts_trigger ON user_profiles;
CREATE TRIGGER sync_institute_student_counts_trigger
AFTER INSERT OR UPDATE OR DELETE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION sync_institute_student_counts();

-- Counselor to institute mapping (optional multi-institute support)
CREATE TABLE IF NOT EXISTS counselor_institutes (
  id SERIAL PRIMARY KEY,
  counselor_user_id TEXT NOT NULL,
  institute_id INTEGER NOT NULL REFERENCES institute_list(institute_id),
  is_primary BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_counselor_institutes_unique ON counselor_institutes(counselor_user_id, institute_id);
CREATE INDEX IF NOT EXISTS idx_counselor_institutes_institute ON counselor_institutes(institute_id);