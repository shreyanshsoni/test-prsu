import { NextConfig } from 'next';

const isDevelopment = process.env.NODE_ENV === 'development';

// Determine the correct base URL based on environment (local vs production)
const getBaseUrl = () => {
  if (isDevelopment) {
    return 'http://localhost:3000';
  }
  
  // In production, use environment variables or fallback
  return process.env.NEXT_PUBLIC_BASE_URL || 
         process.env.AUTH0_BASE_URL || 
         'https://plan.goprsu.com';
};

const config: NextConfig = {
  // Remove static export - Auth0 requires API routes
  // output: 'export',
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com', 'dummyimage.com'],
  },
  // Remove trailing slash for SSR
  trailingSlash: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Remove standalone output for Amplify hosting
  // output: 'standalone',
  
  // Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.auth0.com https://*.auth0.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.auth0.com https://*.auth0.com/oauth/token; frame-src 'self' https://*.auth0.com; object-src 'none'; base-uri 'self'; form-action 'self' https://*.auth0.com;"
          }
        ]
      }
    ]
  },
  
  // Add environment variables - ONLY non-sensitive ones that are needed client-side
  env: {
    // Public URLs and non-sensitive configuration
    NEXT_PUBLIC_BASE_URL: getBaseUrl(),
    // Non-sensitive Auth0 configuration (needed for client-side Auth0 SDK)
    NEXT_PUBLIC_AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || '',
    NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL || '',
    NEXT_PUBLIC_AUTH0_SCOPE: process.env.AUTH0_SCOPE || 'openid profile email',
    NEXT_PUBLIC_AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || '',
    NEXT_PUBLIC_AUTH0_ORGANIZATION: process.env.AUTH0_ORGANIZATION || '',
    // Public app URLs
    NEXT_PUBLIC_AUTH0_LOGOUT_URL: process.env.AUTH0_LOGOUT_URL || 'https://plan.goprsu.com',
  },
};

export default config;