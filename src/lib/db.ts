import { Pool } from 'pg';
import { getDatabaseUrl } from './server/env';

// Create a singleton pool for database connections with better error handling
const pool = new Pool({
  connectionString: getDatabaseUrl(),
  ssl: {
    rejectUnauthorized: false
  },
  // Add connection timeout
  connectionTimeoutMillis: 10000,
  // Add idle timeout
  idleTimeoutMillis: 30000,
  // Maximum number of clients the pool should contain
  max: 20
});

// Add event listeners for connection issues
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

// Wrapper function to get a client with retry logic
export async function getClientWithRetry(maxRetries = 3) {
  let retries = 0;
  let lastError;

  while (retries < maxRetries) {
    try {
      const client = await pool.connect();
      return client;
    } catch (error) {
      console.error(`DB connection attempt ${retries + 1} failed:`, error);
      lastError = error;
      retries++;
      
      if (retries >= maxRetries) break;
      
      // Exponential backoff
      const delay = Math.pow(2, retries) * 500;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Generic query execution function
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  const client = await getClientWithRetry();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

// Database initialization function
export async function initializeDatabase(): Promise<void> {
  const client = await getClientWithRetry();
  try {
    // Shared timestamp trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create institute_list table
    await client.query(`
      CREATE TABLE IF NOT EXISTS institute_list (
        institute_id SERIAL PRIMARY KEY,
        institute_name VARCHAR(255) NOT NULL UNIQUE,
        total_students INTEGER NOT NULL DEFAULT 0,
        institute_secret_key TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_institute_list_secret_key ON institute_list(institute_secret_key);
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_institute_list_updated_at ON institute_list;
      CREATE TRIGGER update_institute_list_updated_at
      BEFORE UPDATE ON institute_list
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create user_profiles table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        profile_data JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Ensure name and institute/verification columns exist
    await client.query(`
      ALTER TABLE user_profiles
      ADD COLUMN IF NOT EXISTS first_name TEXT,
      ADD COLUMN IF NOT EXISTS last_name TEXT,
      ADD COLUMN IF NOT EXISTS institute_id INTEGER REFERENCES institute_list(institute_id),
      ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS verified_by TEXT,
      ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_profiles_institute ON user_profiles(institute_id);
      CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(verification_status);
      CREATE INDEX IF NOT EXISTS idx_user_profiles_institute_status ON user_profiles(institute_id, verification_status);
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
      CREATE TRIGGER update_user_profiles_updated_at
      BEFORE UPDATE ON user_profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Keep is_verified aligned with verification_status
    await client.query(`
      CREATE OR REPLACE FUNCTION set_is_verified_from_status()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.is_verified = (NEW.verification_status = 'approved');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS set_is_verified_from_status_trigger ON user_profiles;
      CREATE TRIGGER set_is_verified_from_status_trigger
      BEFORE INSERT OR UPDATE ON user_profiles
      FOR EACH ROW
      EXECUTE FUNCTION set_is_verified_from_status();
    `);

    // Keep institute_list.total_students in sync with approved students
    await client.query(`
      CREATE OR REPLACE FUNCTION sync_institute_student_counts()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          IF NEW.institute_id IS NOT NULL AND NEW.verification_status = 'approved' THEN
            UPDATE institute_list SET total_students = total_students + 1 WHERE institute_id = NEW.institute_id;
          END IF;
          RETURN NEW;
        ELSIF TG_OP = 'UPDATE' THEN
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
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS sync_institute_student_counts_trigger ON user_profiles;
      CREATE TRIGGER sync_institute_student_counts_trigger
      AFTER INSERT OR UPDATE OR DELETE ON user_profiles
      FOR EACH ROW
      EXECUTE FUNCTION sync_institute_student_counts();
    `);

    // Counselor to institute mapping (supports multi-institute counselors if needed)
    await client.query(`
      CREATE TABLE IF NOT EXISTS counselor_institutes (
        id SERIAL PRIMARY KEY,
        counselor_user_id TEXT NOT NULL,
        institute_id INTEGER NOT NULL REFERENCES institute_list(institute_id),
        is_primary BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_counselor_institutes_unique ON counselor_institutes(counselor_user_id, institute_id);
      CREATE INDEX IF NOT EXISTS idx_counselor_institutes_institute ON counselor_institutes(institute_id);
    `);

    // Create roadmap_planners table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS roadmap_planners (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create roadmap_phases table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS roadmap_phases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        roadmap_id UUID REFERENCES roadmap_planners(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create roadmap_tasks table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS roadmap_tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phase_id UUID REFERENCES roadmap_phases(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('Database tables initialized successfully');
  } finally {
    client.release();
  }
}

// Export the pool as default
export default pool; 