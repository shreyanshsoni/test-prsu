-- Add completion status and recent activity tracking to roadmap tables
-- This script adds completion tracking to tasks and recent activity tracking to all tables

-- Add completion status to roadmap_tasks table
ALTER TABLE roadmap_tasks 
ADD COLUMN IF NOT EXISTS completion_status VARCHAR(20) DEFAULT 'in_progress' 
CHECK (completion_status IN ('in_progress', 'completed', 'paused', 'cancelled'));

-- Add completion date to roadmap_tasks table
ALTER TABLE roadmap_tasks 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add recent activity tracking to roadmap_planners table
ALTER TABLE roadmap_planners 
ADD COLUMN IF NOT EXISTS recent_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add recent activity tracking to roadmap_phases table
ALTER TABLE roadmap_phases 
ADD COLUMN IF NOT EXISTS recent_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add recent activity tracking to roadmap_tasks table
ALTER TABLE roadmap_tasks 
ADD COLUMN IF NOT EXISTS recent_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_completion_status ON roadmap_tasks(completion_status);
CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_completed_at ON roadmap_tasks(completed_at);
CREATE INDEX IF NOT EXISTS idx_roadmap_planners_recent_activity ON roadmap_planners(recent_activity);
CREATE INDEX IF NOT EXISTS idx_roadmap_phases_recent_activity ON roadmap_phases(recent_activity);
CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_recent_activity ON roadmap_tasks(recent_activity);

-- Create a function to update recent activity timestamp
CREATE OR REPLACE FUNCTION update_recent_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the recent_activity timestamp to current time
    NEW.recent_activity = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for roadmap_planners to update recent_activity on any change
DROP TRIGGER IF EXISTS trigger_update_roadmap_recent_activity ON roadmap_planners;
CREATE TRIGGER trigger_update_roadmap_recent_activity
    BEFORE UPDATE ON roadmap_planners
    FOR EACH ROW
    EXECUTE FUNCTION update_recent_activity();

-- Create triggers for roadmap_phases to update recent_activity on any change
DROP TRIGGER IF EXISTS trigger_update_phase_recent_activity ON roadmap_phases;
CREATE TRIGGER trigger_update_phase_recent_activity
    BEFORE UPDATE ON roadmap_phases
    FOR EACH ROW
    EXECUTE FUNCTION update_recent_activity();

-- Create triggers for roadmap_tasks to update recent_activity on any change
DROP TRIGGER IF EXISTS trigger_update_task_recent_activity ON roadmap_tasks;
CREATE TRIGGER trigger_update_task_recent_activity
    BEFORE UPDATE ON roadmap_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_recent_activity();

-- Update the existing task completion trigger to also handle completion_status
CREATE OR REPLACE FUNCTION check_task_completion()
RETURNS TRIGGER AS $$
DECLARE
    phase_id UUID;
    total_tasks INTEGER;
    completed_tasks INTEGER;
BEGIN
    -- Get the phase_id from the task
    IF TG_OP = 'UPDATE' THEN
        phase_id := NEW.phase_id;
        
        -- If completion_status is being set to 'completed', also set completed = true
        IF NEW.completion_status = 'completed' AND OLD.completion_status != 'completed' THEN
            NEW.completed = true;
            NEW.completed_at = NOW();
        -- If completion_status is being set to anything other than 'completed', set completed = false
        ELSIF NEW.completion_status != 'completed' AND OLD.completion_status = 'completed' THEN
            NEW.completed = false;
            NEW.completed_at = NULL;
        END IF;
        
    ELSIF TG_OP = 'INSERT' THEN
        phase_id := NEW.phase_id;
        
        -- If completion_status is 'completed', set completed = true
        IF NEW.completion_status = 'completed' THEN
            NEW.completed = true;
            NEW.completed_at = NOW();
        END IF;
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
            completed_at = NOW(),
            recent_activity = NOW()
        WHERE id = phase_id;
    -- If not all tasks are completed, mark phase as in_progress
    ELSIF completed_tasks < total_tasks THEN
        UPDATE roadmap_phases 
        SET 
            completion_status = 'in_progress',
            completed_at = NULL,
            recent_activity = NOW()
        WHERE id = phase_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the existing trigger to use the new function
DROP TRIGGER IF EXISTS trigger_check_task_completion ON roadmap_tasks;
CREATE TRIGGER trigger_check_task_completion
    AFTER INSERT OR UPDATE OF completed, completion_status ON roadmap_tasks
    FOR EACH ROW
    EXECUTE FUNCTION check_task_completion();

-- Update existing records to have proper completion status and recent activity
UPDATE roadmap_tasks 
SET completion_status = CASE 
    WHEN completed = true THEN 'completed'
    ELSE 'in_progress'
END,
recent_activity = COALESCE(recent_activity, created_at)
WHERE completion_status IS NULL;

UPDATE roadmap_planners 
SET recent_activity = COALESCE(recent_activity, created_at)
WHERE recent_activity IS NULL;

UPDATE roadmap_phases 
SET recent_activity = COALESCE(recent_activity, created_at)
WHERE recent_activity IS NULL;

COMMENT ON COLUMN roadmap_tasks.completion_status IS 'Completion status of the task: in_progress, completed, paused, cancelled';
COMMENT ON COLUMN roadmap_tasks.completed_at IS 'Timestamp when the task was marked as completed';
COMMENT ON COLUMN roadmap_planners.recent_activity IS 'Timestamp of the most recent activity on this roadmap';
COMMENT ON COLUMN roadmap_phases.recent_activity IS 'Timestamp of the most recent activity on this phase';
COMMENT ON COLUMN roadmap_tasks.recent_activity IS 'Timestamp of the most recent activity on this task';
