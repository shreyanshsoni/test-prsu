import type { NextRequest } from 'next/server';

type RequestLike = Request | NextRequest | { url: string; headers: Headers; nextUrl?: { origin: string } };

/**
 * Get the correct request URL, accounting for proxies/CloudFront.
 * Next.js edge runtime sometimes shows localhost:3000 in request.url,
 * so we reconstruct it from headers when available.
 */
export function getRequestUrl(request: RequestLike): string {
  const headers = (request as any).headers as Headers;
  const nextReq = request as any;
  
  // Try to use nextUrl if available (more reliable in Next.js)
  if (nextReq.nextUrl) {
    const nextUrl = nextReq.nextUrl;
    const protocol = nextUrl.protocol || 'https:';
    const host = nextUrl.host || headers.get('host') || headers.get('x-forwarded-host');
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      return `${protocol}//${host}${nextUrl.pathname}${nextUrl.search}`;
    }
  }
  
  // Fall back to reconstructing from headers
  const forwardedHost = headers.get('x-forwarded-host');
  const hostHeader = headers.get('host');
  const forwardedProto = headers.get('x-forwarded-proto');
  
  const host = forwardedHost || hostHeader;
  const protocol = forwardedProto ? `${forwardedProto}:` : 'https:';
  const originalUrl = new URL((request as any).url);
  
  if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    return `${protocol}//${host}${originalUrl.pathname}${originalUrl.search}`;
  }
  
  // Last resort: use the original request.url
  return (request as any).url;
}

export function getRequestOrigin(request: RequestLike): string {
  const url = new URL((request as any).url);
  const headers = (request as any).headers as Headers;

  const hostHeader = headers.get('host');
  const forwardedHost = headers.get('x-forwarded-host');
  const forwardedProtoRaw = headers.get('x-forwarded-proto');
  const forwardedProto = forwardedProtoRaw
    ? forwardedProtoRaw.split(',')[0].trim()
    : null;

  const isProduction = process.env.NODE_ENV === 'production';

  // Protocol: x-forwarded-proto → https (prod) → url.protocol (dev)
  const protocol =
    forwardedProto ||
    (isProduction ? 'https' : url.protocol.replace(':', ''));

  // Host: x-forwarded-host → host → url.host
  let host = forwardedHost || hostHeader || url.host;

  // If we still don't have a host (very rare), fall back to Next.js origin or URL origin
  if (!host) {
    const nextReq = request as any;
    if (nextReq.nextUrl?.origin) {
      const nextOrigin = nextReq.nextUrl.origin;
      console.warn('getRequestOrigin fallback to nextUrl.origin', { nextOrigin });
      return nextOrigin;
    }
    console.warn('getRequestOrigin fallback to URL origin only', { url: url.toString() });
    return url.origin;
  }

  const origin = `${protocol}://${host}`;

  console.log('getRequestOrigin debug', {
    url: (request as any).url,
    hostHeader,
    forwardedHost,
    forwardedProto,
    resolvedProtocol: protocol,
    resolvedHost: host,
    resolvedOrigin: origin,
  });

  return origin;
}
