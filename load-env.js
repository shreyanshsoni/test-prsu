// load-env.js
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local (optional - for local development)
const envFile = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envFile)) {
  // Silently load environment variables without logging them
  const envConfig = dotenv.parse(fs.readFileSync(envFile));
  
  // Set environment variables without logging
  for (const key in envConfig) {
    process.env[key] = envConfig[key];
  }
  console.log('Loaded environment variables from .env.local');
} else {
  console.log('No .env.local file found - using environment variables from Amplify');
}

// Verify critical environment variables
const requiredVars = [
  'AUTH0_SECRET',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET',
  'DATABASE_URL',
  'POSTGRES_URL'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn('Missing environment variables (will use defaults if available):', missingVars.join(', '));
  // Don't exit - let the app handle missing vars gracefully
} 