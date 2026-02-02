/**
 * Derives the runtime base URL from the incoming request.
 * NEVER falls back to environment variables in production.
 * Works correctly behind AWS Amplify / CloudFront proxies.
 * 
 * This is the SINGLE canonical helper for multi-domain support.
 * Both plan.goprsu.com and plan.prsu.ai use this to derive their URLs.
 */
export function getRuntimeBaseUrl(request: { url: string; headers: Headers }): string {
  const url = new URL(request.url);
  const headers = request.headers;

  const hostHeader = headers.get('host');
  const forwardedHost = headers.get('x-forwarded-host');
  const forwardedProtoRaw = headers.get('x-forwarded-proto');
  const forwardedProto = forwardedProtoRaw
    ? forwardedProtoRaw.split(',')[0].trim()
    : null;

  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Protocol resolution: prefer x-forwarded-proto (from proxy), 
  // then default to https in production, or use URL protocol in dev
  const protocol = forwardedProto || (isProduction ? 'https' : url.protocol.replace(':', ''));

  // Host resolution: prefer x-forwarded-host (proxy), then host header, then URL host
  const host = forwardedHost || hostHeader || url.host;

  // Validate host exists - critical for multi-domain auth
  if (!host) {
    if (isDevelopment) {
      // Safe fallback only in development
      return 'http://localhost:3000';
    }
    throw new Error(
      'Unable to determine host from request. ' +
      'Ensure x-forwarded-host or host headers are set by AWS Amplify.'
    );
  }

  const origin = `${protocol}://${host}`;

  // Debug logging (non-sensitive) - only in dev or when explicitly enabled
  if (isDevelopment || process.env.DEBUG_AUTH === 'true') {
    console.log('getRuntimeBaseUrl', {
      resolvedOrigin: origin,
      hostHeader,
      forwardedHost,
      forwardedProto,
    });
  }

  return origin;
}
