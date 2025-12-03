import {
  handleAuth,
  handleLogin,
  handleLogout,
  handleCallback,
} from '@auth0/nextjs-auth0/edge';

// Helper to derive the correct base URL from the incoming request.
// This makes login/logout domain-aware so that:
// - Logging in on plan.goprsu.com keeps you on plan.goprsu.com
// - Logging in on plan.prsu.ai keeps you on plan.prsu.ai
//
// In production behind proxies (Amplify/CloudFront), we prefer x-forwarded-*
// headers so the base URL reflects the ORIGINAL host the user visited.
function getBaseURL(request) {
  try {
    const url = new URL(request.url);
    const headers = request.headers;

    const hostHeader = headers.get('host');
    const forwardedHost = headers.get('x-forwarded-host');
    const forwardedProtoRaw = headers.get('x-forwarded-proto');
    const forwardedProto = forwardedProtoRaw
      ? forwardedProtoRaw.split(',')[0].trim()
      : null;

    const isProduction = process.env.NODE_ENV === 'production';

    // Prefer proxy protocol/host when available, then fall back to request URL.
    // Never hardcode a production domain here – this must always reflect the
    // actual domain that initiated the request so multi-domain auth works.
    const protocol =
      forwardedProto ||
      (isProduction ? 'https' : url.protocol.replace(':', ''));
    const host = forwardedHost || hostHeader || url.host;

    // Minimal debug logging to help verify what the app sees in production.
    // This avoids logging any cookies or sensitive headers.
    console.log('Auth0 getBaseURL debug', {
      url: request.url,
      hostHeader,
      forwardedHost,
      forwardedProto,
      resolvedProtocol: protocol,
      resolvedHost: host,
    });

    return `${protocol}://${host}`;
  } catch (e) {
    // As a last resort, fall back to environment variables.
    // This should rarely be hit, but prevents total failure if URL parsing breaks.
    console.warn('Failed to derive base URL from request, falling back to env:', e);

    const envBase =
      process.env.AUTH0_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || '';

    if (!envBase) {
      // Surface a clear error rather than silently defaulting to the wrong domain.
      throw new Error(
        'Unable to determine Auth0 base URL from request or environment. ' +
          'Set AUTH0_BASE_URL or NEXT_PUBLIC_BASE_URL for a safe fallback.',
      );
    }

    return envBase;
  }
}

// Custom Auth0 handler that overrides login/logout to be per-request-domain aware.
export const GET = handleAuth({
  async login(request) {
    const baseURL = getBaseURL(request);

    const url = new URL(request.url);
    // Ensure returnTo is always a safe, same-origin relative path.
    const rawReturnTo = url.searchParams.get('returnTo') || '/';
    const returnTo = rawReturnTo.startsWith('/') ? rawReturnTo : '/';

    // Ensure Auth0 redirects back to the same domain that initiated login.
    return handleLogin(request, {
      authorizationParams: {
        redirect_uri: `${baseURL}/api/auth/callback`,
      },
      returnTo,
    });
  },

  async callback(request) {
    const baseURL = getBaseURL(request);

    // Helpful for verifying which domain the callback is landing on in production.
    console.log('Auth0 callback on baseURL', baseURL);

    return handleCallback(request);
  },

  async logout(request) {
    const baseURL = getBaseURL(request);

    const url = new URL(request.url);
    const rawReturnTo = url.searchParams.get('returnTo');

    // Only allow same-origin relative paths for returnTo; otherwise fall back
    // to the domain root to avoid open redirect issues.
    const safeReturnTo =
      rawReturnTo && rawReturnTo.startsWith('/') ? `${baseURL}${rawReturnTo}` : baseURL;

    // Ensure logout sends the user back to the same domain's homepage.
    return handleLogout(request, {
      returnTo: safeReturnTo,
    });
  },
});

export const POST = GET;