import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRequestOrigin } from '../../../../lib/server/getRequestOrigin';

export async function GET(request: NextRequest) {
  const origin = getRequestOrigin(request);
  const url = new URL(request.url);

  const hostHeader = request.headers.get('host');
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');

  return NextResponse.json({
    url: request.url,
    origin,
    protocolFromUrl: url.protocol,
    hostFromUrl: url.host,
    hostHeader,
    forwardedHost,
    forwardedProto,
  });
}


