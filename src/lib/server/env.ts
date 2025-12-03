/**
 * Server-side environment variables utility
 * 
 * This file provides safe access to sensitive environment variables that should
 * ONLY be used in server-side code (API routes, server components, etc.)
 * 
 * IMPORTANT: Never import this file in client components!
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

// Auth0 base URL (for server-side usage)
// Can accept a request to dynamically determine the base URL
export const getAuth0BaseUrl = (request?: { url?: string; headers?: Headers }): string => {
  // If request is provided, extract domain from it
  if (request) {
    try {
      if (request.url) {
        const url = new URL(request.url);
        const protocolFromUrl = url.protocol;
        const headers = request.headers;

        const hostHeader = headers?.get('host') || url.host;
        const forwardedProtoRaw = headers?.get('x-forwarded-proto');
        const forwardedProto = forwardedProtoRaw
          ? forwardedProtoRaw.split(',')[0].trim()
          : null;

        // In production, ensure we use https and respect proxy protocol when available.
        const isProduction = process.env.NODE_ENV === 'production';
        const finalProtocol =
          forwardedProto ||
          (isProduction && !protocolFromUrl.startsWith('https')
            ? 'https:'
            : protocolFromUrl);

        return `${finalProtocol}//${hostHeader}`;
      }
    } catch (e) {
      // If URL parsing fails, fall back to environment variables
      console.warn('Failed to parse URL from request, using environment variable:', e);
    }
  }
  
  // Fall back to environment variables only – never hardcode a production domain
  const envBase =
    process.env.AUTH0_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || '';

  if (!envBase) {
    console.error(
      'Unable to determine Auth0 base URL. Set AUTH0_BASE_URL or NEXT_PUBLIC_BASE_URL.',
    );
  }

  return envBase;
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