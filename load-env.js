// load-env.js
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Check if we're in development or production
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
const isProduction = process.env.NODE_ENV === 'production';

console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

// In development: Load .env.local file
if (isDevelopment) {
  const envFile = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envFile)) {
    console.log('Loading environment variables from .env.local');
    const envConfig = dotenv.parse(fs.readFileSync(envFile));
    
    // Set environment variables without logging
    for (const key in envConfig) {
      process.env[key] = envConfig[key];
    }
  } else {
    console.error(`.env.local file not found at ${envFile}`);
    console.error('Please create .env.local file with required environment variables');
    process.exit(1);
  }
}

// In production: Use AWS Amplify environment variables
if (isProduction) {
  console.log('Production mode: Using AWS Amplify environment variables');
  console.log('Make sure all required environment variables are set in AWS Amplify Console');
}

// Verify critical environment variables (both dev and prod)
const requiredVars = [
  'AUTH0_SECRET',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET',
  'DATABASE_URL',
  'POSTGRES_URL'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  
  if (isDevelopment) {
    console.error('Please add these variables to your .env.local file');
  } else {
    console.error('Please add these variables to AWS Amplify Console environment variables');
  }
  
  process.exit(1);
} else {
  console.log('✅ All required environment variables are present');
} 