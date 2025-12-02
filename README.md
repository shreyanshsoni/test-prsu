This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started 

### Setup Environment

1. Create a `.env.local`  file based on the template below:

```
# Auth0 Configuration
AUTH0_SECRET='your-auth0-secret'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-tenant-name.auth0.com'
AUTH0_CLIENT_ID='your-auth0-client-id'
AUTH0_CLIENT_SECRET='your-auth0-client-secret'
AUTH0_LOGOUT_URL='http://localhost:3000'

# PostgreSQL Database (Vercel Postgres or custom PostgreSQL)
POSTGRES_URL="postgres://username:password@host:port/database"
POSTGRES_PRISMA_URL="postgres://username:password@host:port/database?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgres://username:password@host:port/database"
POSTGRES_USER="username"
POSTGRES_PASSWORD="password"
POSTGRES_HOST="localhost"
POSTGRES_DATABASE="academic_planner"

# Database Initialization
DB_INIT_TOKEN="your-secure-token-for-db-initialization"

# Node Environment
NODE_ENV="development"
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

### Database Setup

The application uses PostgreSQL for storing user profiles. You need to set up a PostgreSQL database with the following options:

1. Use a local PostgreSQL installation, or a cloud-based option like Vercel Postgres
2. Configure your `.env.local` file with the appropriate connection strings
3. Initialize the database by visiting `/api/init-db` in development mode, or using the token-protected endpoint in production

### Run Development Server

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **Auth0 Authentication**: Secure user authentication
- **User Profiles**: Each user has their own unique profile
- **Persistent Storage**: User data is stored in PostgreSQL and associated with their Auth0 ID
- **Auto-saving**: Profile changes are automatically saved to the database
- **Offline Mode**: Users can still use the application without logging in, but changes won't be saved

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
