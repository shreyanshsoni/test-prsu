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

    // Ensure new name columns exist (will be NULL for existing users by default)
    await client.query(`
      ALTER TABLE user_profiles
      ADD COLUMN IF NOT EXISTS first_name TEXT,
      ADD COLUMN IF NOT EXISTS last_name TEXT;
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