# Google Workspace Domain Restriction

This document explains how to configure Google Workspace-based access control for Google OAuth authentication in the Skills Radar application using Google's hosted domain ("hd") parameter.

## Overview

The domain restriction feature allows you to limit access to your Skills Radar application to users from specific Google Workspace organizations. This is particularly useful for organizations that want to restrict access to their internal team members only and automatically block personal Gmail accounts.

## How It Works

### Google's Hosted Domain ("hd") Parameter

Google OAuth provides a special "hd" (hosted domain) parameter that indicates which Google Workspace organization a user belongs to. This is more secure and reliable than parsing email addresses because:

1. **Cannot be spoofed** - The "hd" parameter is set by Google's servers
2. **Workspace-specific** - Only appears for Google Workspace accounts
3. **Automatic blocking** - Personal Gmail accounts don't have an "hd" parameter
4. **Official Google feature** - Designed specifically for domain restrictions

### Authentication Flow

1. **User attempts to sign in** with Google OAuth
2. **Google returns profile** with "hd" parameter (if Workspace account)
3. **Domain validation** occurs using the "hd" parameter
4. **Fallback validation** uses email domain for compatibility
5. **Access granted** if:
   - No domain restriction is set (ALLOWED_EMAIL_DOMAIN is empty), OR
   - User's hosted domain matches the allowed domain, OR
   - User's email domain matches (fallback for personal accounts)
6. **Access denied** if user's domain doesn't match

## Configuration

### Environment Variable

Add the following environment variable to restrict access:

```env
ALLOWED_EMAIL_DOMAIN=yourdomain.com
```

**Examples:**
- `ALLOWED_EMAIL_DOMAIN=techietalent.com` - Only allows users from techietalent.com Google Workspace
- `ALLOWED_EMAIL_DOMAIN=company.org` - Only allows users from company.org Google Workspace
- Leave empty or unset to allow all Google accounts (including personal Gmail)

### Setup Instructions

#### 1. Local Development

Add to your `.env` file:
```env
ALLOWED_EMAIL_DOMAIN=yourdomain.com
```

#### 2. Azure Web App

Set in Azure Portal:
1. Go to your App Service
2. Navigate to **Configuration** → **Application settings**
3. Add new setting:
   - **Name**: `ALLOWED_EMAIL_DOMAIN`
   - **Value**: `yourdomain.com`

#### 3. Docker Deployment

Add to your `docker-compose.yml`:
```yaml
environment:
  - ALLOWED_EMAIL_DOMAIN=yourdomain.com
```

#### 4. GitHub Actions / CI/CD

Add to your repository secrets:
- **Secret Name**: `ALLOWED_EMAIL_DOMAIN`
- **Secret Value**: `yourdomain.com`

## Technical Implementation

### Enhanced Google Provider Configuration

The Google OAuth provider is configured to request the hosted domain parameter:

```typescript
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  authorization: {
    params: {
      // Request the hosted domain parameter
      hd: process.env.ALLOWED_EMAIL_DOMAIN || undefined,
      // Ensure we get the hosted domain in the response
      scope: "openid email profile",
    },
  },
})
```

### Domain Validation Logic

```typescript
function isHostedDomainAllowed(hostedDomain: string | undefined, email: string): boolean {
  const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN;
  
  // If no domain restriction is set, allow all emails
  if (!allowedDomain) {
    return true;
  }
  
  const allowedDomainLower = allowedDomain.toLowerCase();
  
  // First, check the "hd" (hosted domain) property from Google OAuth
  // This is the most reliable method for Google Workspace accounts
  if (hostedDomain) {
    return hostedDomain.toLowerCase() === allowedDomainLower;
  }
  
  // Fallback: If no hosted domain (personal Gmail accounts), 
  // check email domain for backwards compatibility
  const emailDomain = email.split('@')[1]?.toLowerCase();
  return emailDomain === allowedDomainLower;
}
```

### JWT Token Enhancement

The hosted domain is stored in the JWT token for future reference:

```typescript
async jwt({ token, account, profile }) {
  // Store hosted domain in JWT for future reference
  if (account?.provider === "google" && profile) {
    token.hostedDomain = (profile as any)?.hd;
  }
  return token;
}
```

## User Experience

### Google Workspace Users (Allowed Domain)
- Sign in normally with their work Google account
- Hosted domain is automatically validated
- No additional steps required

### Google Workspace Users (Different Domain)
- Redirected to error page explaining the restriction
- Clear messaging about which organization is allowed
- Cannot bypass the restriction

### Personal Gmail Users
- When domain restriction is active, personal Gmail accounts are automatically blocked
- No hosted domain parameter means automatic rejection
- Clear error message explaining Workspace requirement

### Error Page Features
- **Workspace-specific messaging** explaining the restriction
- **Clear distinction** between Workspace and personal accounts
- **Helpful suggestions** for users
- **Try again** and **back to home** buttons
- **Debug information** in development mode

## Security Advantages

### Over Email Domain Parsing

1. **Cannot be spoofed** - Google sets the "hd" parameter server-side
2. **Workspace verification** - Confirms actual Google Workspace membership
3. **Automatic personal account blocking** - No "hd" means personal account
4. **Official Google feature** - Designed for this exact use case

### Security Features

1. **Server-side validation** - Cannot be bypassed client-side
2. **Case-insensitive matching** - `Company.Com` matches `company.com`
3. **Exact domain matching** - No subdomain or wildcard support (by design)
4. **Proper logging** - Failed attempts are logged with hosted domain info
5. **Graceful fallback** - Email domain checking for edge cases

## Testing

### Test Cases

1. **No Restriction Set**:
   - Remove or leave empty `ALLOWED_EMAIL_DOMAIN`
   - All Google accounts (Workspace and personal) should be allowed

2. **Valid Google Workspace Account**:
   - Set `ALLOWED_EMAIL_DOMAIN=company.com`
   - Test with `user@company.com` from company.com Workspace - should succeed
   - Hosted domain should be `company.com`

3. **Invalid Google Workspace Account**:
   - Set `ALLOWED_EMAIL_DOMAIN=company.com`
   - Test with `user@otherdomain.com` from otherdomain.com Workspace - should be denied
   - Hosted domain should be `otherdomain.com`

4. **Personal Gmail Account**:
   - Set `ALLOWED_EMAIL_DOMAIN=company.com`
   - Test with `user@gmail.com` personal account - should be denied
   - No hosted domain parameter

5. **Case Sensitivity**:
   - Set `ALLOWED_EMAIL_DOMAIN=Company.Com`
   - Test with workspace account from `company.com` - should succeed

### Manual Testing

1. Set the environment variable
2. Restart your application
3. Try signing in with different account types:
   - Google Workspace account from allowed domain
   - Google Workspace account from different domain
   - Personal Gmail account
4. Verify the error page appears for blocked accounts

### Debug Information

In development mode, you can log the hosted domain:

```typescript
console.log('Hosted domain:', hostedDomain);
console.log('Email:', user.email);
console.log('Allowed:', isHostedDomainAllowed(hostedDomain, user.email));
```

## Troubleshooting

### Common Issues

#### Google Workspace Users Can't Sign In
- **Check**: Is `ALLOWED_EMAIL_DOMAIN` set to the correct domain?
- **Verify**: Does the user's Workspace domain exactly match?
- **Test**: Check if the user is actually using a Workspace account

#### Personal Gmail Users Getting Through
- **Check**: Is the domain restriction actually set?
- **Verify**: Are you testing with the correct environment?
- **Test**: Personal Gmail accounts should always be blocked when restriction is active

#### Error Page Not Showing Workspace Information
- **Check**: Is the error page updated with Workspace-specific messaging?
- **Verify**: Are users being redirected to `/auth/error?error=AccessDenied`?
- **Test**: Navigate to the error page directly

#### Hosted Domain Not Being Detected
- **Check**: Is the Google provider configured with the correct authorization params?
- **Verify**: Is the "hd" parameter being requested in the OAuth flow?
- **Test**: Log the profile object to see if "hd" is present

### Debug Steps

1. **Check Environment Variable**:
   ```javascript
   console.log('Allowed domain:', process.env.ALLOWED_EMAIL_DOMAIN);
   ```

2. **Log Authentication Attempts**:
   ```javascript
   console.log('Sign-in attempt:', {
     email: user.email,
     hostedDomain: profile?.hd,
     allowed: isHostedDomainAllowed(profile?.hd, user.email)
   });
   ```

3. **Test Error Page**:
   - Navigate to `/auth/error?error=AccessDenied`
   - Verify Workspace-specific messaging

4. **Check OAuth Configuration**:
   - Verify Google provider includes `hd` parameter request
   - Check that profile includes hosted domain information

## Google Workspace Setup

### For Administrators

To ensure proper functionality with your Google Workspace:

1. **Verify Domain Ownership**: Ensure your domain is properly verified in Google Workspace
2. **User Account Types**: Confirm users are using Workspace accounts, not personal Gmail
3. **OAuth Consent Screen**: Configure your OAuth app in Google Cloud Console
4. **Domain Verification**: Test with actual Workspace accounts from your domain

### OAuth App Configuration

In Google Cloud Console:

1. **Authorized Domains**: Add your application domain
2. **Scopes**: Ensure `openid`, `email`, and `profile` scopes are requested
3. **User Type**: Set to "Internal" for Workspace-only access (optional)
4. **Domain Restriction**: Can be configured at OAuth app level as additional security

## Migration Guide

### From Email Domain Parsing

If you're migrating from email domain parsing to hosted domain validation:

1. **Backup**: Ensure you have a backup of your user database
2. **Test**: Test the new validation in a development environment
3. **Communicate**: Inform users about the enhanced security
4. **Deploy**: Deploy with the hosted domain validation
5. **Monitor**: Watch for any authentication issues

### Benefits of Migration

- **Enhanced Security**: Cannot be bypassed by email spoofing
- **Automatic Personal Account Blocking**: No configuration needed
- **Better User Experience**: Clear messaging about Workspace requirements
- **Future-Proof**: Uses official Google features designed for this purpose

## Future Enhancements

Potential improvements for the hosted domain restriction feature:

1. **Multiple Workspaces**: Support for multiple allowed Google Workspace organizations
2. **Subdomain Support**: Allow subdomains of specified Workspace domains
3. **Admin Override**: Allow admins to bypass domain restrictions
4. **Workspace Whitelist UI**: Admin interface to manage allowed Workspace domains
5. **User Provisioning**: Automatic user creation based on Workspace directory
6. **Group-based Access**: Restrict based on Google Workspace groups

## Comparison: Hosted Domain vs Email Domain

| Feature | Hosted Domain (hd) | Email Domain Parsing |
|---------|-------------------|---------------------|
| **Security** | ✅ Cannot be spoofed | ⚠️ Can be bypassed |
| **Workspace Detection** | ✅ Automatic | ❌ Manual parsing |
| **Personal Gmail Blocking** | ✅ Automatic | ⚠️ Requires configuration |
| **Google Official** | ✅ Official feature | ❌ Custom implementation |
| **Reliability** | ✅ Server-validated | ⚠️ Client-dependent |
| **Future-Proof** | ✅ Google-maintained | ⚠️ Custom maintenance |

## Support

If you encounter issues with hosted domain restriction:

1. **Check Logs**: Review application logs for authentication errors with hosted domain info
2. **Verify Workspace**: Ensure users are actually using Google Workspace accounts
3. **Test Configuration**: Verify the environment variable is set correctly
4. **Contact Support**: Provide logs, configuration details, and user account types

---

This enhanced implementation provides a more secure and reliable way to control access to your Skills Radar application based on Google Workspace organizations, ensuring that only authorized users from your organization can access the system while providing clear feedback to unauthorized users.