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
    try {
      const origin = getRequestOrigin(request);
      const url = new URL(request.url);

      // Ensure returnTo is always a safe, same-origin relative path.
      const rawReturnTo = url.searchParams.get('returnTo') || '/';
      const returnTo = rawReturnTo.startsWith('/') ? rawReturnTo : '/';

      const redirectUri = `${origin}/api/auth/callback`;

      console.log('Auth0 login handler', {
        requestedHost: url.host,
        requestUrl: request.url,
        resolvedOrigin: origin,
        redirectUri,
        returnTo,
        headers: {
          host: request.headers.get('host'),
          'x-forwarded-host': request.headers.get('x-forwarded-host'),
          'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
        },
      });

      // Ensure Auth0 redirects back to the same domain that initiated login.
      return handleLogin(request, {
        authorizationParams: {
          redirect_uri: redirectUri,
        },
        returnTo,
      });
    } catch (error) {
      console.error('Auth0 login error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        requestUrl: request.url,
        headers: {
          host: request.headers.get('host'),
          'x-forwarded-host': request.headers.get('x-forwarded-host'),
          'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
        },
      });
      
      return new Response(
        JSON.stringify({
          error: 'Login failed',
          message: error.message,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },

  async callback(request) {
    try {
      const origin = getRequestOrigin(request);
      const url = new URL(request.url);

      console.log('Auth0 callback handler', {
        requestedHost: url.host,
        requestUrl: request.url,
        resolvedOrigin: origin,
        headers: {
          host: request.headers.get('host'),
          'x-forwarded-host': request.headers.get('x-forwarded-host'),
          'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
        },
      });

      return handleCallback(request);
    } catch (error) {
      console.error('Auth0 callback error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        requestUrl: request.url,
      });
      
      return new Response(
        JSON.stringify({
          error: 'Callback failed',
          message: error.message,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },

  async logout(request) {
    try {
      const origin = getRequestOrigin(request);
      const url = new URL(request.url);
      const rawReturnTo = url.searchParams.get('returnTo');

      // Only allow same-origin relative paths for returnTo; otherwise fall back
      // to the domain root to avoid open redirect issues.
      const safeReturnTo =
        rawReturnTo && rawReturnTo.startsWith('/') ? `${origin}${rawReturnTo}` : origin;

      console.log('Auth0 logout handler', {
        requestedHost: url.host,
        requestUrl: request.url,
        resolvedOrigin: origin,
        returnTo: safeReturnTo,
      });

      return handleLogout(request, {
        returnTo: safeReturnTo,
      });
    } catch (error) {
      console.error('Auth0 logout error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        requestUrl: request.url,
      });
      
      return new Response(
        JSON.stringify({
          error: 'Logout failed',
          message: error.message,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },
});

export const POST = GET;