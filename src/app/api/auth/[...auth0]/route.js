import { handleAuth, handleLogin, handleLogout } from '@auth0/nextjs-auth0/edge';

// Helper to derive the correct base URL from the incoming request.
// This makes login/logout domain-aware so that:
// - Logging in on plan.goprsu.com keeps you on plan.goprsu.com
// - Logging in on plan.prsu.ai keeps you on plan.prsu.ai
function getBaseURL(request) {
  try {
    const url = new URL(request.url);
    const hostHeader = request.headers.get('host');
    const host = hostHeader || url.host;

    const isProduction = process.env.NODE_ENV === 'production';
    const protocol = isProduction ? 'https:' : url.protocol;

    return `${protocol}//${host}`;
  } catch (e) {
    // As a last resort, fall back to environment variables.
    // This should rarely be hit, but prevents total failure if URL parsing breaks.
    console.warn('Failed to derive base URL from request, falling back to env:', e);
    return (
      process.env.AUTH0_BASE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      'https://plan.goprsu.com'
    );
  }
}

// Custom Auth0 handler that overrides login/logout to be per-request-domain aware.
export const GET = handleAuth({
  async login(request) {
    const baseURL = getBaseURL(request);

    // Ensure Auth0 redirects back to the same domain that initiated login.
    return handleLogin(request, {
      authorizationParams: {
        redirect_uri: `${baseURL}/api/auth/callback`,
      },
    });
  },

  async logout(request) {
    const baseURL = getBaseURL(request);

    // Ensure logout sends the user back to the same domain's homepage.
    return handleLogout(request, {
      returnTo: baseURL,
    });
  },
});

export const POST = GET;