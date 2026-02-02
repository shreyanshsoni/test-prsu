/**
 * Server-side environment variables utility
 * 
 * This file provides safe access to sensitive environment variables that should
 * ONLY be used in server-side code (API routes, server components, etc.)
 * 
 * IMPORTANT: Never import this file in client components!
 * 
 * NOTE: For runtime base URL resolution, use getRuntimeBaseUrl from 
 * src/lib/server/getRuntimeBaseUrl.ts instead. It derives the URL from
 * request headers to support multi-domain authentication.
 */

// Load environment variables from .env file
import 'dotenv/config';

// Auth0 sensitive variables
export const getAuth0Secret = (): string => {
  const secret = process.env.AUTH0_SECRET;
  if (!secret) {
    console.error('AUTH0_SECRET environment variable is not defined');
  }
  return secret || '';
};

export const getAuth0ClientSecret = (): string => {
  const secret = process.env.AUTH0_CLIENT_SECRET;
  if (!secret) {
    console.error('AUTH0_CLIENT_SECRET environment variable is not defined');
  }
  return secret || '';
};

// Database connection variables
export const getDatabaseUrl = (): string => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL environment variable is not defined');
  }
  return url || '';
};

export const getPostgresUrl = (): string => {
  const url = process.env.POSTGRES_URL;
  if (!url) {
    console.error('POSTGRES_URL environment variable is not defined');
  }
  return url || '';
};

// API keys
export const getOpenRouterApiKey = (): string => {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    console.error('OPENROUTER_API_KEY environment variable is not defined');
  }
  return key || '';
};

// Helper to validate that all required environment variables are set
export const validateRequiredEnvVars = (): boolean => {
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
    return false;
  }

  return true;
};
