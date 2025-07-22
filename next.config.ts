import { NextConfig } from 'next';

const isDevelopment = process.env.NODE_ENV === 'development';

// Determine the correct base URL based on environment (local vs production)
// and handle both the Amplify URL and custom domain
const getBaseUrl = () => {
  if (isDevelopment) {
    return 'http://localhost:3000';
  }
  
  // In production, prefer environment variable (set in amplify.yml) or fall back to Amplify domain
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
  // Add output config for standalone
  output: 'standalone',
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