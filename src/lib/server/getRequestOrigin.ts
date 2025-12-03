export function getRequestOrigin(request: { url: string; headers: Headers }): string {
  const url = new URL(request.url);
  const headers = request.headers;

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
  const host = forwardedHost || hostHeader || url.host;

  const origin = `${protocol}://${host}`;

  console.log('getRequestOrigin debug', {
    url: request.url,
    hostHeader,
    forwardedHost,
    forwardedProto,
    resolvedProtocol: protocol,
    resolvedHost: host,
    resolvedOrigin: origin,
  });

  return origin;
}


