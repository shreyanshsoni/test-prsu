# Security Best Practices

This document outlines security best practices for the PRSU application, particularly around handling sensitive information like API keys, database credentials, and authentication secrets.

## Environment Variables

### DO NOT:
- ❌ Commit `.env` files to the repository
- ❌ Log environment variable values to the console
- ❌ Expose sensitive variables in client-side code
- ❌ Share secrets in Slack, email, or other communication tools

### DO:
- ✅ Use `.env.example` as a template without real values
- ✅ Store sensitive values in secure credential stores
- ✅ Use `NEXT_PUBLIC_` prefix ONLY for non-sensitive values needed client-side
- ✅ Rotate secrets regularly (every 90 days)

## Secret Management

### Local Development
- Store secrets in `.env.local` (never commit this file)
- Use different secrets for development vs. production

### CI/CD Pipeline
- Use GitHub Secrets or other secure credential stores
- Reference secrets using `${{ secrets.SECRET_NAME }}`
- Enable secret scanning in your repository

### Production
- Use AWS Secrets Manager, Parameter Store, or similar services
- Implement least-privilege access to secrets
- Enable audit logging for secret access

## Removing Sensitive Data from Git History

If sensitive data is accidentally committed:

1. Rotate the compromised secrets immediately
2. Use the provided script to remove secrets from Git history:
   ```bash
   # Run from repository root
   ./scripts/remove-env-files.sh
   ```
3. Force push changes to the repository:
   ```bash
   git push --force --all
   git push --force --tags
   ```
4. Notify all team members to re-clone the repository

## Security Checks

The repository includes several security measures:

- **GitLeaks**: Scans for secrets in code
- **Security Workflow**: Automatically checks for committed environment files
- **Server-side Environment Utility**: Safely accesses sensitive variables

## API Routes and Server Components

- Use the server-side environment utility in `src/lib/server/env.ts`
- Never log sensitive information
- Implement proper error handling without exposing secrets

## Client Components

- Never access sensitive environment variables directly
- Use API routes to perform operations requiring secrets
- Only use `NEXT_PUBLIC_` prefixed variables that are safe for exposure 