# Auth0 Multi-Domain Configuration Guide

## Overview
This application now supports authentication on both `plan.goprsu.com` and `plan.prsu.ai` domains. Users will stay on the domain they logged in from.

## Code Changes Completed

### 1. Dynamic Auth0 Handler
- Updated `src/app/api/auth/[...auth0]/route.js` to detect domain from request
- Login and logout handlers now use the current request's domain

### 2. Dynamic Base URL Helper
- Updated `src/lib/server/env.ts` to accept request parameter
- `getAuth0BaseUrl()` now extracts domain from request when available

### 3. Next.js Config Updates
- Removed hardcoded domain fallbacks in `next.config.ts`
- Configuration now supports dynamic domain detection

### 4. Client-Side Auth
- Already using `window.location.origin` (no changes needed)
- Automatically works with any domain

## Required: Auth0 Dashboard Configuration

You **must** configure the following in your Auth0 Dashboard for multi-domain support to work:

### Step 1: Add Allowed Callback URLs
1. Go to Auth0 Dashboard → Applications → Your Application → Settings
2. Find "Allowed Callback URLs"
3. Add both domains (comma-separated):
   ```
   https://plan.goprsu.com/api/auth/callback, https://plan.prsu.ai/api/auth/callback
   ```

### Step 2: Add Allowed Logout URLs
1. In the same Settings page, find "Allowed Logout URLs"
2. Add both domains (comma-separated):
   ```
   https://plan.goprsu.com, https://plan.prsu.ai
   ```

### Step 3: Add Allowed Web Origins
1. Find "Allowed Web Origins (CORS)"
2. Add both domains (comma-separated):
   ```
   https://plan.goprsu.com, https://plan.prsu.ai
   ```

### Step 4: Save Changes
- Click "Save Changes" at the bottom of the Settings page

## Environment Variables

### Production Environment
Set the `AUTH0_BASE_URL` environment variable to one of your domains (as a fallback):
```
AUTH0_BASE_URL=https://plan.goprsu.com
```
Or:
```
AUTH0_BASE_URL=https://plan.prsu.ai
```

The application will automatically detect and use the current request's domain, but this serves as a fallback.

## Testing

After configuring Auth0 Dashboard:

1. **Test Login on plan.goprsu.com:**
   - Visit `https://plan.goprsu.com`
   - Click login
   - Should redirect back to `https://plan.goprsu.com` after authentication

2. **Test Login on plan.prsu.ai:**
   - Visit `https://plan.prsu.ai`
   - Click login
   - Should redirect back to `https://plan.prsu.ai` after authentication

3. **Test Logout:**
   - Logout from either domain
   - Should redirect to the same domain's home page

4. **Test Features:**
   - Verify all features work on both domains
   - Check that user data persists across both domains

## Troubleshooting

### Issue: Callback redirects to wrong domain
- **Solution**: Verify both callback URLs are added in Auth0 Dashboard
- Check that the URLs match exactly (including https://)

### Issue: CORS errors
- **Solution**: Ensure both domains are in "Allowed Web Origins (CORS)"

### Issue: Logout doesn't work
- **Solution**: Verify both domains are in "Allowed Logout URLs"

## Notes

- The application automatically detects the domain from the request
- No code changes needed when adding new domains (just update Auth0 Dashboard)
- Both domains share the same Auth0 application and user database
- Sessions work across both domains (same cookies/auth state)

