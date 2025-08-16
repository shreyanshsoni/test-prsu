// Setup database script for roadmap planner tables

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Use environment variable for database connection
const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Error: POSTGRES_URL or DATABASE_URL environment variable is required');
  process.exit(1);
}

async function setupDatabase() {
  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    
    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'create_roadmap_tables.sql');
    const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Creating tables...');
    await client.query(sqlCommands);
    
    console.log('✅ Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    await client.end();
  }
}

setupDatabase(); 