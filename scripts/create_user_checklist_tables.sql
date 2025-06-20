-- User-specific custom checklist programs
CREATE TABLE IF NOT EXISTS user_checklist_programs (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User-specific checklist items
CREATE TABLE IF NOT EXISTS user_checklist_items (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    program_id VARCHAR(255) REFERENCES user_checklist_programs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status VARCHAR(32) NOT NULL,
    deadline DATE,
    type VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_checklist_programs_user_id ON user_checklist_programs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_checklist_items_user_id ON user_checklist_items(user_id); 