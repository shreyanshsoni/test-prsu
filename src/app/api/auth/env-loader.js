// Environment loader for Amplify runtime
import { readFileSync } from 'fs';
import { join } from 'path';

export function loadEnvFile() {
  try {
    // Try to load .env file from the output directory
    const envPath = join(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf8');
    
    // Parse and set environment variables
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (value && !process.env[key]) {
          process.env[key] = value;
          console.log(`Loaded env var: ${key}`);
        }
      }
    });
    
    console.log('Environment file loaded successfully');
  } catch (error) {
    console.log('No .env file found or error loading:', error.message);
  }
}

// Load environment variables immediately
loadEnvFile();
