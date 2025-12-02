import { handleAuth } from '@auth0/nextjs-auth0/edge';

// Using the default Auth0 handler for v3.7.0 with edge runtime.
// This relies on Auth0's official configuration using environment variables.
// For multi-domain support, configure BOTH domains in the Auth0 Dashboard
// (Allowed Callback URLs, Logout URLs, and Web Origins) and avoid hardcoding
// AUTH0_BASE_URL to a single production domain.
export const GET = handleAuth();

export const POST = GET;