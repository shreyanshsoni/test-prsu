import { getAuth0 } from '../../../../lib/auth0';
import { getRuntimeBaseUrl } from '../../../../lib/server/getRuntimeBaseUrl';

/**
 * Dynamic Auth0 route handler for multi-domain support.
 * Handles login, logout, callback, and me endpoints.
 * 
 * Supports:
 * - plan.goprsu.com
 * - plan.prsu.ai
 * - localhost:3000 (development)
 */
export const GET = async (request, context) => {
  const auth0 = getAuth0(request);
  const baseURL = getRuntimeBaseUrl(request);
  
  // Get the auth action from the URL path (login, logout, callback, me)
  const { params } = context;
  const authParams = await params;
  const action = authParams.auth0?.[0];

  if (action === 'login') {
    const url = new URL(request.url);
    const rawReturnTo = url.searchParams.get('returnTo') || '/auth-check';
    const returnTo = rawReturnTo.startsWith('/') ? rawReturnTo : '/auth-check';

    return auth0.handleLogin(request, {
      authorizationParams: {
        redirect_uri: `${baseURL}/api/auth/callback`,
      },
      returnTo,
    });
  }

  if (action === 'callback') {
    console.log('Auth0 callback on baseURL', baseURL);
    return auth0.handleCallback(request, {
      redirectUri: `${baseURL}/api/auth/callback`,
    });
  }

  if (action === 'logout') {
    const url = new URL(request.url);
    const rawReturnTo = url.searchParams.get('returnTo');
    const safeReturnTo =
      rawReturnTo && rawReturnTo.startsWith('/') ? `${baseURL}${rawReturnTo}` : baseURL;

    return auth0.handleLogout(request, {
      returnTo: safeReturnTo,
    });
  }

  if (action === 'me') {
    return auth0.handleProfile(request);
  }

  // Default: use the standard handleAuth for any other actions
  return auth0.handleAuth()(request, context);
};

export const POST = GET;
