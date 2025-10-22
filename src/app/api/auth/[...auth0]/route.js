import { handleAuth } from '@auth0/nextjs-auth0/edge';

// Using the handleAuth for v3.7.0 with edge runtime
export const GET = handleAuth();

export const POST = GET; 