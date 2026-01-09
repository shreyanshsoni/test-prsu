-- Create student_contact_forms table
CREATE TABLE IF NOT EXISTS student_contact_forms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  school_name VARCHAR(255) NOT NULL,
  institute_id INTEGER REFERENCES institute_list(institute_id),
  country_code VARCHAR(10),
  phone VARCHAR(50),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add institute_id column if it doesn't exist (for existing tables)
ALTER TABLE student_contact_forms
ADD COLUMN IF NOT EXISTS institute_id INTEGER REFERENCES institute_list(institute_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_student_contact_forms_email ON student_contact_forms(email);
CREATE INDEX IF NOT EXISTS idx_student_contact_forms_school_name ON student_contact_forms(school_name);
CREATE INDEX IF NOT EXISTS idx_student_contact_forms_institute_id ON student_contact_forms(institute_id);
CREATE INDEX IF NOT EXISTS idx_student_contact_forms_created_at ON student_contact_forms(created_at);

-- Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_student_contact_forms_updated_at ON student_contact_forms;
CREATE TRIGGER update_student_contact_forms_updated_at
BEFORE UPDATE ON student_contact_forms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
