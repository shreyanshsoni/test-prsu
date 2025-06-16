-- Roadmap Planner tables for Academic Planner app

-- Roadmap Planner table
CREATE TABLE IF NOT EXISTS roadmap_planners (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    goal_title TEXT NOT NULL,
    goal_identity TEXT NOT NULL,
    goal_deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Phases table
CREATE TABLE IF NOT EXISTS roadmap_phases (
    id VARCHAR(255) PRIMARY KEY,
    roadmap_id VARCHAR(255) REFERENCES roadmap_planners(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    position INT NOT NULL, -- to maintain order
    reflection TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS roadmap_tasks (
    id VARCHAR(255) PRIMARY KEY,
    phase_id VARCHAR(255) REFERENCES roadmap_phases(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    due_date DATE,
    position INT NOT NULL, -- to maintain order
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_roadmap_planners_user_id ON roadmap_planners(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_phases_roadmap_id ON roadmap_phases(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_phase_id ON roadmap_tasks(phase_id);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last_modified automatically
CREATE OR REPLACE TRIGGER update_roadmap_planners_last_modified
BEFORE UPDATE ON roadmap_planners
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 