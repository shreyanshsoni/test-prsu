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
  // Add environment variables
  env: {
    AUTH0_SECRET: '035C08832FF8B4F6822A2011DBF59AEF',
    // Use dynamic base URL that supports both custom domain and Amplify domain
    AUTH0_BASE_URL: getBaseUrl(),
    AUTH0_ISSUER_BASE_URL: 'https://dev-rd6ngmdjrin41op1.us.auth0.com',
    AUTH0_CLIENT_ID: 'bKTISFkk7y8t6U8hUEwcPR79aqTRDE4B',
    AUTH0_CLIENT_SECRET: 'uWrDx8ww-SxviAaAQIAw1l8KV2HoWa1pJ0DlbzbTR_H-AN-Bewg1dVHAdsCcKT5n',
    AUTH0_SCOPE: 'openid profile email',
    AUTH0_AUDIENCE: '',
    AUTH0_ORGANIZATION: '',
    DATABASE_URL: 'postgresql://neondb_owner:npg_MsBRLcZy14fT@ep-bitter-smoke-a56n6lnq-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require',
    POSTGRES_URL: 'postgresql://neondb_owner:npg_MsBRLcZy14fT@ep-bitter-smoke-a56n6lnq-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require',
    // Force direct logout URL without recursion
    AUTH0_LOGOUT_URL: 'https://plan.goprsu.com'
  },
};

export default config;