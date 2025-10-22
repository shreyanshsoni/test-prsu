-- Add completion status fields to roadmap tables
-- This script adds completion tracking at both roadmap and phase levels

-- Add completion status to roadmap_planners table
ALTER TABLE roadmap_planners 
ADD COLUMN IF NOT EXISTS completion_status VARCHAR(20) DEFAULT 'in_progress' 
CHECK (completion_status IN ('in_progress', 'completed', 'paused', 'cancelled'));

-- Add completion date to roadmap_planners table
ALTER TABLE roadmap_planners 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add completion status to roadmap_phases table
ALTER TABLE roadmap_phases 
ADD COLUMN IF NOT EXISTS completion_status VARCHAR(20) DEFAULT 'in_progress' 
CHECK (completion_status IN ('in_progress', 'completed', 'paused', 'cancelled'));

-- Add completion date to roadmap_phases table
ALTER TABLE roadmap_phases 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_roadmap_planners_completion_status ON roadmap_planners(completion_status);
CREATE INDEX IF NOT EXISTS idx_roadmap_phases_completion_status ON roadmap_phases(completion_status);
CREATE INDEX IF NOT EXISTS idx_roadmap_planners_completed_at ON roadmap_planners(completed_at);
CREATE INDEX IF NOT EXISTS idx_roadmap_phases_completed_at ON roadmap_phases(completed_at);

-- Create a function to automatically update roadmap completion when all phases are completed
CREATE OR REPLACE FUNCTION check_roadmap_completion()
RETURNS TRIGGER AS $$
DECLARE
    roadmap_id UUID;
    total_phases INTEGER;
    completed_phases INTEGER;
BEGIN
    -- Get the roadmap_id from the phase
    IF TG_OP = 'UPDATE' THEN
        roadmap_id := NEW.roadmap_id;
    ELSIF TG_OP = 'INSERT' THEN
        roadmap_id := NEW.roadmap_id;
    END IF;
    
    -- Count total phases and completed phases for this roadmap
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN completion_status = 'completed' THEN 1 END)
    INTO total_phases, completed_phases
    FROM roadmap_phases 
    WHERE roadmap_id = roadmap_id;
    
    -- If all phases are completed, mark the roadmap as completed
    IF total_phases > 0 AND completed_phases = total_phases THEN
        UPDATE roadmap_planners 
        SET 
            completion_status = 'completed',
            completed_at = NOW()
        WHERE id = roadmap_id;
    -- If not all phases are completed, mark roadmap as in_progress
    ELSIF completed_phases < total_phases THEN
        UPDATE roadmap_planners 
        SET 
            completion_status = 'in_progress',
            completed_at = NULL
        WHERE id = roadmap_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update roadmap completion when phase status changes
DROP TRIGGER IF EXISTS trigger_check_roadmap_completion ON roadmap_phases;
CREATE TRIGGER trigger_check_roadmap_completion
    AFTER INSERT OR UPDATE OF completion_status ON roadmap_phases
    FOR EACH ROW
    EXECUTE FUNCTION check_roadmap_completion();

-- Create a function to automatically update phase completion when all tasks are completed
CREATE OR REPLACE FUNCTION check_phase_completion()
RETURNS TRIGGER AS $$
DECLARE
    phase_id UUID;
    total_tasks INTEGER;
    completed_tasks INTEGER;
BEGIN
    -- Get the phase_id from the task
    IF TG_OP = 'UPDATE' THEN
        phase_id := NEW.phase_id;
    ELSIF TG_OP = 'INSERT' THEN
        phase_id := NEW.phase_id;
    END IF;
    
    -- Count total tasks and completed tasks for this phase
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN completed = true THEN 1 END)
    INTO total_tasks, completed_tasks
    FROM roadmap_tasks 
    WHERE phase_id = phase_id;
    
    -- If all tasks are completed, mark the phase as completed
    IF total_tasks > 0 AND completed_tasks = total_tasks THEN
        UPDATE roadmap_phases 
        SET 
            completion_status = 'completed',
            completed_at = NOW()
        WHERE id = phase_id;
    -- If not all tasks are completed, mark phase as in_progress
    ELSIF completed_tasks < total_tasks THEN
        UPDATE roadmap_phases 
        SET 
            completion_status = 'in_progress',
            completed_at = NULL
        WHERE id = phase_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update phase completion when task completion changes
DROP TRIGGER IF EXISTS trigger_check_phase_completion ON roadmap_tasks;
CREATE TRIGGER trigger_check_phase_completion
    AFTER INSERT OR UPDATE OF completed ON roadmap_tasks
    FOR EACH ROW
    EXECUTE FUNCTION check_phase_completion();

-- Update existing records to have proper completion status
UPDATE roadmap_planners 
SET completion_status = 'in_progress' 
WHERE completion_status IS NULL;

UPDATE roadmap_phases 
SET completion_status = 'in_progress' 
WHERE completion_status IS NULL;

COMMENT ON COLUMN roadmap_planners.completion_status IS 'Overall completion status of the roadmap: in_progress, completed, paused, cancelled';
COMMENT ON COLUMN roadmap_planners.completed_at IS 'Timestamp when the roadmap was marked as completed';
COMMENT ON COLUMN roadmap_phases.completion_status IS 'Completion status of the phase: in_progress, completed, paused, cancelled';
COMMENT ON COLUMN roadmap_phases.completed_at IS 'Timestamp when the phase was marked as completed';
