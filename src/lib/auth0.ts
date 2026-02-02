/**
 * Shared Auth0 configuration for multi-domain support.
 * 
 * This module provides Auth0 instances configured with dynamic baseURL
 * derived from the incoming request. This enables authentication to work
 * correctly on multiple domains (plan.goprsu.com, plan.prsu.ai).
 * 
 * Usage:
 *   import { getAuth0 } from '@/lib/auth0';
 *   const auth0 = getAuth0(request);
 *   const session = await auth0.getSession(request);
 */

import { initAuth0 } from '@auth0/nextjs-auth0/edge';
import { getRuntimeBaseUrl } from './server/getRuntimeBaseUrl';

/**
 * Creates an Auth0 instance configured for the current request's domain.
 * This is required for multi-domain authentication support.
 * 
 * @param request - The incoming request object with url and headers
 * @returns Auth0 instance configured for this request's domain
 */
export function getAuth0(request: { url: string; headers: Headers }) {
  const baseURL = getRuntimeBaseUrl(request);
  
  return initAuth0({
    baseURL,
    secret: process.env.AUTH0_SECRET,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
  });
}

/**
 * Gets the Auth0 session for the current request.
 * Convenience wrapper that creates the Auth0 instance and gets the session.
 * 
 * @param request - The incoming request object
 * @returns The session object or null if not authenticated
 */
export async function getSessionFromRequest(request: { url: string; headers: Headers }) {
  const auth0 = getAuth0(request);
  return auth0.getSession(request);
}
