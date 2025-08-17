import { handleAuth, handleLogout } from '@auth0/nextjs-auth0';
import { getAuth0BaseUrl } from '../../../../lib/server/env';

// Set runtime to nodejs for Auth0 compatibility
export const runtime = 'nodejs';

// Validate required environment variables
const validateAuth0Config = () => {
  const required = [
    'AUTH0_SECRET',
    'AUTH0_CLIENT_ID', 
    'AUTH0_CLIENT_SECRET',
    'AUTH0_ISSUER_BASE_URL'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing Auth0 environment variables:', missing);
    throw new Error(`Missing Auth0 configuration: ${missing.join(', ')}`);
  }
};

// Using the handleAuth with custom logout handler and error handling
export const GET = async (req, res) => {
  try {
    validateAuth0Config();
    
    return handleAuth({
      logout: handleLogout({ 
        returnTo: process.env.AUTH0_LOGOUT_URL || getAuth0BaseUrl()
      }),
    })(req, res);
  } catch (error) {
    console.error('Auth0 handler error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Authentication service unavailable',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

export const POST = GET; 