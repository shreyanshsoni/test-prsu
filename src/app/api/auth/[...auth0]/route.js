import { handleAuth, handleLogin, handleLogout } from '@auth0/nextjs-auth0/edge';

// Helper to get base URL from request
function getBaseUrlFromRequest(request) {
  const url = new URL(request.url);
  const protocol = url.protocol;
  const host = request.headers.get('host') || url.host;
  
  // In production, ensure we use https
  const isProduction = process.env.NODE_ENV === 'production';
  const finalProtocol = isProduction && !protocol.startsWith('https') ? 'https:' : protocol;
  
  return `${finalProtocol}//${host}`;
}

// Using the handleAuth for v3.7.0 with edge runtime
// Configure Auth0 handlers to use dynamic base URL from request
export const GET = handleAuth({
  login: handleLogin({
    getLoginState: (req) => {
      // Ensure returnTo uses the current domain
      const baseUrl = getBaseUrlFromRequest(req);
      return {
        returnTo: baseUrl,
      };
    },
  }),
  logout: handleLogout({
    returnTo: (req) => {
      // Use the current domain for logout redirect
      return getBaseUrlFromRequest(req);
    },
  }),
});

export const POST = GET; 