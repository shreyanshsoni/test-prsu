import { handleAuth, handleLogout } from '@auth0/nextjs-auth0';
import { getAuth0BaseUrl } from '../../../../lib/server/env';

// Set runtime to nodejs for Auth0 compatibility
export const runtime = 'nodejs';

// Using the handleAuth with custom logout handler
export const GET = async (req, res) => {
  try {
    console.log('Auth0 route accessed');
    console.log('AUTH0_SECRET:', process.env.AUTH0_SECRET ? 'SET' : 'MISSING');
    console.log('AUTH0_BASE_URL:', process.env.AUTH0_BASE_URL);
    console.log('AUTH0_ISSUER_BASE_URL:', process.env.AUTH0_ISSUER_BASE_URL);
    
    const handler = handleAuth({
      logout: handleLogout({ 
        returnTo: process.env.AUTH0_LOGOUT_URL || getAuth0BaseUrl()
      }),
    });
    
    return handler(req, res);
  } catch (error) {
    console.error('Auth0 Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Auth0 Error',
      message: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST = GET; 