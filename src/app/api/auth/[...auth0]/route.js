import { handleAuth, handleLogout } from '@auth0/nextjs-auth0';
import { getAuth0BaseUrl, validateRequiredEnvVars } from '../../../../lib/server/env';

// Set runtime to nodejs for Auth0 compatibility
export const runtime = 'nodejs';

// Validate environment variables before setting up Auth0
if (!validateRequiredEnvVars()) {
  console.error('Auth0 environment variables are missing. Please check your Amplify configuration.');
}

// Using the handleAuth with custom logout handler
export const GET = handleAuth({
  logout: handleLogout({ 
    returnTo: process.env.AUTH0_LOGOUT_URL || getAuth0BaseUrl()
  }),
});

export const POST = GET; 