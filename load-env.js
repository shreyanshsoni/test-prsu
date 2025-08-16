// load-env.js
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local
const envFile = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envFile)) {
  // Silently load environment variables without logging them
  const envConfig = dotenv.parse(fs.readFileSync(envFile));
  
  // Set environment variables without logging
  for (const key in envConfig) {
    process.env[key] = envConfig[key];
  }
} else {
  console.error(`.env.local file not found at ${envFile}`);
  process.exit(1);
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
  console.error('Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
} 