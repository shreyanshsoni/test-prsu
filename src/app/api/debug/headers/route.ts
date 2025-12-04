import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRequestOrigin } from '../../../../lib/server/getRequestOrigin';

/**
 * Header Validation Endpoint
 * 
 * This endpoint validates that CloudFront/Amplify is forwarding the required headers correctly:
 * - Host: Should match the public domain (not localhost or internal hostnames)
 * - X-Forwarded-Host: Should match the public domain (or be absent, in which case Host is used)
 * - X-Forwarded-Proto: Should be 'https' for TLS viewers
 * 
 * Usage:
 *   GET /api/debug/headers
 * 
 * Returns validation results with pass/fail status for each header check.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const headers = request.headers;

  // Extract header values
  const hostHeader = headers.get('host') || null;
  const forwardedHost = headers.get('x-forwarded-host') || null;
  const forwardedProtoRaw = headers.get('x-forwarded-proto') || null;
  const forwardedProto = forwardedProtoRaw
    ? forwardedProtoRaw.split(',')[0].trim()
    : null;

  // Get all headers for debugging
  const allHeaders: Record<string, string> = {};
  headers.forEach((value, key) => {
    allHeaders[key] = value;
  });

  // Validation checks
  const checks = {
    host: {
      value: hostHeader,
      present: hostHeader !== null,
      isValid: hostHeader !== null && 
               !hostHeader.includes('localhost') && 
               !hostHeader.includes('127.0.0.1') &&
               !hostHeader.match(/^\d+\.\d+\.\d+\.\d+$/) && // Not just an IP
               !hostHeader.includes('.amplifyapp.com') && // Not internal Amplify hostname
               !hostHeader.includes('.cloudfront.net'), // Not CloudFront hostname
      issues: [] as string[],
    },
    xForwardedHost: {
      value: forwardedHost,
      present: forwardedHost !== null,
      isValid: forwardedHost === null || ( // Can be absent (falls back to Host)
        forwardedHost !== 'localhost' &&
        !forwardedHost.includes('127.0.0.1') &&
        !forwardedHost.match(/^\d+\.\d+\.\d+\.\d+$/) &&
        !forwardedHost.includes('.amplifyapp.com') &&
        !forwardedHost.includes('.cloudfront.net')
      ),
      issues: [] as string[],
    },
    xForwardedProto: {
      value: forwardedProto,
      present: forwardedProto !== null,
      isValid: forwardedProto === null || forwardedProto === 'https', // Should be https or absent
      issues: [] as string[],
    },
  };

  // Detailed issue reporting
  if (checks.host.present) {
    if (checks.host.value?.includes('localhost')) {
      checks.host.issues.push('Host contains "localhost" - should be your public domain');
    }
    if (checks.host.value?.includes('127.0.0.1')) {
      checks.host.issues.push('Host contains "127.0.0.1" - should be your public domain');
    }
    if (checks.host.value?.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      checks.host.issues.push('Host is just an IP address - should be your public domain');
    }
    if (checks.host.value?.includes('.amplifyapp.com')) {
      checks.host.issues.push('Host is an internal Amplify hostname - should be your public domain');
    }
    if (checks.host.value?.includes('.cloudfront.net')) {
      checks.host.issues.push('Host is a CloudFront hostname - should be your public domain');
    }
  } else {
    checks.host.issues.push('Host header is missing');
  }

  if (checks.xForwardedHost.present) {
    if (checks.xForwardedHost.value === 'localhost') {
      checks.xForwardedHost.issues.push('X-Forwarded-Host is "localhost" - should match your public domain or be absent');
    }
    if (checks.xForwardedHost.value?.includes('127.0.0.1')) {
      checks.xForwardedHost.issues.push('X-Forwarded-Host contains "127.0.0.1" - should match your public domain or be absent');
    }
    if (checks.xForwardedHost.value?.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      checks.xForwardedHost.issues.push('X-Forwarded-Host is just an IP address - should match your public domain or be absent');
    }
    if (checks.xForwardedHost.value?.includes('.amplifyapp.com')) {
      checks.xForwardedHost.issues.push('X-Forwarded-Host is an internal Amplify hostname - should match your public domain or be absent');
    }
    if (checks.xForwardedHost.value?.includes('.cloudfront.net')) {
      checks.xForwardedHost.issues.push('X-Forwarded-Host is a CloudFront hostname - should match your public domain or be absent');
    }
    // Check if X-Forwarded-Host matches Host (good practice)
    if (checks.xForwardedHost.value && checks.host.value && 
        checks.xForwardedHost.value !== checks.host.value) {
      checks.xForwardedHost.issues.push(`X-Forwarded-Host (${checks.xForwardedHost.value}) doesn't match Host (${checks.host.value}) - this may cause issues`);
    }
  }

  if (checks.xForwardedProto.present) {
    if (checks.xForwardedProto.value !== 'https') {
      checks.xForwardedProto.issues.push(`X-Forwarded-Proto is "${checks.xForwardedProto.value}" - should be "https" for TLS viewers`);
    }
  } else {
    checks.xForwardedProto.issues.push('X-Forwarded-Proto is missing - will default to https in production, but explicit header is recommended');
  }

  // Get resolved origin using the same logic as the app
  const resolvedOrigin = getRequestOrigin(request);

  // Overall validation status
  const allChecksPass = 
    checks.host.isValid &&
    checks.xForwardedHost.isValid &&
    checks.xForwardedProto.isValid;

  // Determine which header will be used for origin resolution
  const originResolution = {
    protocol: forwardedProto || (process.env.NODE_ENV === 'production' ? 'https' : url.protocol.replace(':', '')),
    host: forwardedHost || hostHeader || url.host,
    source: forwardedHost ? 'X-Forwarded-Host' : (hostHeader ? 'Host' : 'URL.host'),
  };

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    overallStatus: allChecksPass ? 'PASS' : 'FAIL',
    requestUrl: request.url,
    resolvedOrigin,
    originResolution,
    checks: {
      host: {
        ...checks.host,
        status: checks.host.isValid ? 'PASS' : 'FAIL',
      },
      xForwardedHost: {
        ...checks.xForwardedHost,
        status: checks.xForwardedHost.isValid ? 'PASS' : 'FAIL',
        note: forwardedHost === null 
          ? 'Header is absent (acceptable - will fall back to Host header)'
          : 'Header is present',
      },
      xForwardedProto: {
        ...checks.xForwardedProto,
        status: checks.xForwardedProto.isValid ? 'PASS' : 'WARN',
        note: forwardedProto === null
          ? 'Header is absent (will default to https in production)'
          : 'Header is present',
      },
    },
    allHeaders,
    recommendations: generateRecommendations(checks, allChecksPass),
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

function generateRecommendations(
  checks: {
    host: { isValid: boolean; issues: string[] };
    xForwardedHost: { isValid: boolean; issues: string[] };
    xForwardedProto: { isValid: boolean; issues: string[] };
  },
  allPass: boolean
): string[] {
  const recommendations: string[] = [];

  if (allPass) {
    recommendations.push('✅ All header checks passed! Your CloudFront/Amplify configuration looks correct.');
    return recommendations;
  }

  if (!checks.host.isValid) {
    recommendations.push('❌ CRITICAL: Host header is invalid. Check your CloudFront origin request policy.');
    recommendations.push('   → Ensure Host header is forwarded without modification from the viewer.');
    recommendations.push('   → Do NOT override Host with localhost or internal hostnames.');
  }

  if (!checks.xForwardedHost.isValid) {
    recommendations.push('❌ CRITICAL: X-Forwarded-Host header is invalid.');
    recommendations.push('   → Either remove X-Forwarded-Host from your origin request policy (let it be absent),');
    recommendations.push('   → Or ensure it matches the public domain from the viewer request.');
    recommendations.push('   → Do NOT set X-Forwarded-Host to a fixed value like localhost.');
  }

  if (!checks.xForwardedProto.isValid) {
    recommendations.push('⚠️  WARNING: X-Forwarded-Proto should be "https" for TLS viewers.');
    recommendations.push('   → Ensure your CloudFront origin request policy includes X-Forwarded-Proto.');
    recommendations.push('   → CloudFront should automatically set this to "https" for HTTPS viewers.');
  }

  recommendations.push('');
  recommendations.push('📖 How to fix in AWS Amplify/CloudFront:');
  recommendations.push('   1. Go to AWS Amplify Console → Your App → Rewrites and redirects');
  recommendations.push('   2. Or configure CloudFront Origin Request Policy:');
  recommendations.push('      - Include: Host, X-Forwarded-Host, X-Forwarded-Proto');
  recommendations.push('      - Behavior: Forward from viewer (do not override)');
  recommendations.push('   3. For custom CloudFront distributions:');
  recommendations.push('      - Use "Managed-CORS-S3Origin" or create custom policy');
  recommendations.push('      - Ensure headers are forwarded, not set to fixed values');

  return recommendations;
}

