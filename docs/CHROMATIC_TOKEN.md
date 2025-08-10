# 🔐 Chromatic Token Configuration - CONFIDENTIAL

**⚠️ IMPORTANT**: This file contains sensitive information. Do not commit actual tokens to version control.

## Token Information

**Token Status**: ✅ Available and ready for configuration

## Configuration Instructions

### Step 1: Access GitHub Secrets
Navigate to: [Repository Settings → Secrets → Actions](https://github.com/dainabase/directus-unified-platform/settings/secrets/actions)

### Step 2: Create New Secret
- **Name**: `CHROMATIC_PROJECT_TOKEN`
- **Value**: Contact repository owner for token value

### Step 3: Verify Configuration
After adding the token:
1. Re-run the `ui-chromatic` workflow
2. Check for successful build at [Chromatic Dashboard](https://www.chromatic.com/builds?appId=66b75b7c34b967e64b8b8e09)

## Token Management

### Security Best Practices
- Never commit tokens directly to the repository
- Rotate tokens periodically (every 90 days recommended)
- Use GitHub Secrets for all sensitive data
- Limit token access to necessary team members only

### Token Rotation Process
1. Generate new token from Chromatic dashboard
2. Update GitHub Secret with new value
3. Verify CI/CD pipeline continues to work
4. Revoke old token from Chromatic

## Troubleshooting

### Common Issues
- **401 Unauthorized**: Token is invalid or expired
- **403 Forbidden**: Token lacks necessary permissions
- **Build not appearing**: Check if token is correctly configured in secrets

### Support
For token-related issues, contact:
- Repository Owner: @dainabase
- Email: admin@dainamics.ch

## Related Documentation
- [Chromatic Setup Guide](./CHROMATIC_SETUP.md)
- [CI/CD Guide](./CI_GUIDE.md)
- [Release Health Check](./RELEASE_HEALTHCHECK.md)

---

*Last Updated: 2025-08-10*  
*Security Level: Confidential*
