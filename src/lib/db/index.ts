import { Pool } from 'pg';
import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    // Log connection attempt
    console.log('Creating database connection pool...');
    
    if (!process.env.POSTGRES_URL) {
      console.error('POSTGRES_URL environment variable is not defined');
      throw new Error('Database connection string is not configured');
    }
    
    // Create a connection pool
    try {
      // The pg module uses new Pool(), not createPool()
      pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
      console.log('Database connection pool created successfully');
    } catch (error) {
      console.error('Failed to create database connection pool:', error);
      throw error;
    }
  }
  return pool;
}

export async function executeQuery<T>(query: string, params?: any[]): Promise<T[]> {
  try {
    console.log(`Executing query: ${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`);
    console.log('Params:', params);

    // Use Vercel's sql helper in production/development
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      console.log('Using Vercel SQL client');
      const result = await sql.query(query, params || []);
      console.log(`Query completed. Rows returned: ${result.rows.length}`);
      return result.rows as T[];
    }

    // Use direct pool for local development if not on Vercel
    console.log('Using direct PostgreSQL pool');
    const client = await getDbPool().connect();
    try {
      const result = await client.query(query, params);
      console.log(`Query completed. Rows returned: ${result.rowCount}`);
      return result.rows as T[];
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Read the schema file with path that works in production and development
    let schemaContent: string;
    try {
      const schemaPath = path.join(process.cwd(), 'src', 'lib', 'db', 'schema.sql');
      console.log('Reading schema from:', schemaPath);
      schemaContent = fs.readFileSync(schemaPath, 'utf8');
    } catch (readError) {
      console.error('Error reading schema file:', readError);
      throw readError;
    }
    
    // Split into statements and execute each one
    const statements = schemaContent.split(';')
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim());
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}`);
      await executeQuery(statement);
    }
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
} 