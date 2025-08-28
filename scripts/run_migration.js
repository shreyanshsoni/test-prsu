// Run migration script to add career_blurb column
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Get database URL from .env file
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Running migration to add career_blurb column...');
    
    // Read and execute the SQL file
    const sql = fs.readFileSync(path.join(__dirname, 'add_career_blurb_column.sql'), 'utf8');
    await client.query(sql);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
