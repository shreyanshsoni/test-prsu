// Setup database script for roadmap planner tables

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection string from next.config.ts
const databaseUrl = 'postgresql://neondb_owner:npg_MsBRLcZy14fT@ep-bitter-smoke-a56n6lnq-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

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