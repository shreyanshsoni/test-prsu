import { Pool } from 'pg';

// Create a singleton pool for database connections with better error handling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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

// Export the pool as default
export default pool; 