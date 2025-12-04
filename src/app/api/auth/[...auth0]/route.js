import {
  handleAuth,
  handleLogin,
  handleLogout,
  handleCallback,
} from '@auth0/nextjs-auth0/edge';
import { getRequestOrigin } from '../../../../lib/server/getRequestOrigin';

// Custom Auth0 handler that overrides login/logout to be per-request-domain aware.
export const GET = handleAuth({
  async login(request) {
    const origin = getRequestOrigin(request);
    const url = new URL(request.url);

    // Ensure returnTo is always a safe, same-origin relative path.
    const rawReturnTo = url.searchParams.get('returnTo') || '/';
    const returnTo = rawReturnTo.startsWith('/') ? rawReturnTo : '/';

    const redirectUri = `${origin}/api/auth/callback`;

    console.log('Auth0 login handler', {
      requestedHost: url.host,
      resolvedOrigin: origin,
      redirectUri,
      returnTo,
    });

    // Ensure Auth0 redirects back to the same domain that initiated login.
    return handleLogin(request, {
      authorizationParams: {
        redirect_uri: redirectUri,
      },
      returnTo,
    });
  },

  async callback(request) {
    const origin = getRequestOrigin(request);
    const url = new URL(request.url);

    console.log('Auth0 callback handler', {
      requestedHost: url.host,
      resolvedOrigin: origin,
    });

    return handleCallback(request);
  },

  async logout(request) {
    const origin = getRequestOrigin(request);
    const url = new URL(request.url);
    const rawReturnTo = url.searchParams.get('returnTo');

    // Only allow same-origin relative paths for returnTo; otherwise fall back
    // to the domain root to avoid open redirect issues.
    const safeReturnTo =
      rawReturnTo && rawReturnTo.startsWith('/') ? `${origin}${rawReturnTo}` : origin;

    console.log('Auth0 logout handler', {
      requestedHost: url.host,
      resolvedOrigin: origin,
      returnTo: safeReturnTo,
    });

    return handleLogout(request, {
      returnTo: safeReturnTo,
    });
  },
});

export const POST = GET;