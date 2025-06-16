import { handleAuth, handleLogout } from '@auth0/nextjs-auth0';

// Set runtime to nodejs for Auth0 compatibility
export const runtime = 'nodejs';

// Using the handleAuth with custom logout handler
export const GET = handleAuth({
  logout: handleLogout({ 
    returnTo: process.env.AUTH0_LOGOUT_URL || process.env.AUTH0_BASE_URL
  }),
});
export const POST = GET; 