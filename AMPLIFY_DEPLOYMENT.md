# Amplify Deployment Guide

This guide will help you deploy your Next.js application to AWS Amplify.

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Amplify CLI installed: `npm install -g @aws-amplify/cli`

## Step 1: Initialize Amplify

```bash
# Initialize Amplify in your project
amplify init

# Follow the prompts:
# - Enter a name for the project: [your-project-name]
# - Enter a name for the environment: dev
# - Choose your default editor: [your-editor]
# - Choose the type of app that you're building: web
# - What JavaScript framework are you using: Next.js
# - Source Directory Path: src
# - Distribution Directory Path: .next
# - Build Command: npm run build
# - Start Command: npm start
```

## Step 2: Add Hosting

```bash
# Add hosting to your app
amplify add hosting

# Choose: Amazon CloudFront and S3
# Select environment: dev
```

## Step 3: Configure Environment Variables

In the AWS Amplify Console:

1. Go to your app's settings
2. Navigate to "Environment variables"
3. Add the following variables from your `.env.example`:

### Required Environment Variables:
- `AUTH0_SECRET`
- `AUTH0_BASE_URL`
- `AUTH0_ISSUER_BASE_URL`
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`
- `AUTH0_SCOPE`
- `AUTH0_AUDIENCE`
- `AUTH0_ORGANIZATION`
- `POSTGRES_URL`
- `POSTGRES_HOST`
- `POSTGRES_DATABASE`
- `POSTGRES_USERNAME`
- `POSTGRES_PASSWORD`
- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_AUTH0_CLIENT_ID`
- `NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL`
- `NEXT_PUBLIC_AUTH0_SCOPE`
- `NEXT_PUBLIC_AUTH0_AUDIENCE`
- `NEXT_PUBLIC_AUTH0_ORGANIZATION`
- `NEXT_PUBLIC_AUTH0_LOGOUT_URL`
- `OPENAI_API_KEY` (if using AI features)

## Step 4: Deploy

```bash
# Push your changes to AWS
amplify push

# Or deploy directly
amplify publish
```

## Step 5: Configure Custom Domain (Optional)

1. In Amplify Console, go to "Domain management"
2. Add your custom domain
3. Configure DNS settings as instructed

## Step 6: Update Auth0 Configuration

1. Go to your Auth0 Dashboard
2. Update the following URLs in your Auth0 application:
   - Allowed Callback URLs: `https://your-amplify-app.amplifyapp.com/api/auth/callback`
   - Allowed Logout URLs: `https://your-amplify-app.amplifyapp.com`
   - Allowed Web Origins: `https://your-amplify-app.amplifyapp.com`

## Build Settings

The app is configured with:
- **Build Command**: `npm run build`
- **Output Directory**: `.next/standalone`
- **Node.js Version**: 18.x (recommended)

## Troubleshooting

### Common Issues:

1. **Build Failures**: Check that all environment variables are set correctly
2. **Database Connection**: Ensure your database is accessible from AWS
3. **Auth0 Issues**: Verify callback URLs and environment variables match

### Useful Commands:

```bash
# Check Amplify status
amplify status

# View logs
amplify console

# Remove Amplify (if needed)
amplify delete
```

## File Structure

Key files for Amplify deployment:
- `amplify.yml` - Build configuration
- `public/_headers` - Custom HTTP headers
- `public/_redirects` - URL redirects
- `next.config.ts` - Next.js configuration
- `.env.example` - Environment variables template
