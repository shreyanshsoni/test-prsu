-- Add career_blurb column to roadmap_planners table
ALTER TABLE roadmap_planners ADD COLUMN IF NOT EXISTS career_blurb TEXT;

-- Update the trigger function to ensure it preserves the career_blurb value
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
