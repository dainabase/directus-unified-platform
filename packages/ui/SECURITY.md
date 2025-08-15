# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.3.x   | :white_check_mark: |
| 1.2.x   | :white_check_mark: |
| 1.1.x   | :x:                |
| 1.0.x   | :x:                |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of @dainabase/ui seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do NOT:
- Open a public issue
- Post about it on social media
- Disclose the vulnerability publicly before it's fixed

### Please DO:
- Email us at **security@dainabase.com**
- Include the following information:
  - Type of issue (XSS, CSRF, SQL Injection, etc.)
  - Full paths of source file(s) related to the issue
  - Location of the affected source code (tag/branch/commit or direct URL)
  - Step-by-step instructions to reproduce the issue
  - Proof-of-concept or exploit code (if possible)
  - Impact of the issue

### What to expect:
- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Resolution Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 1 week
  - Medium: 2 weeks
  - Low: 1 month

## Security Update Process

1. The security report is received and assigned to a handler
2. The problem is confirmed and affected versions determined
3. Code is audited to find similar problems
4. Fixes are prepared for all supported versions
5. New versions are released with security patches

## Security Best Practices

When using @dainabase/ui in your applications:

### Dependencies
- Keep all dependencies up to date
- Regularly run `npm audit` and fix vulnerabilities
- Use `npm audit fix` to automatically install compatible updates

### Content Security Policy (CSP)
We recommend implementing a strict CSP:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';">
```

### Input Validation
- Always validate and sanitize user inputs
- Use our built-in validation props where available
- Never trust client-side validation alone

### XSS Prevention
- Our components automatically escape content
- Be careful when using `dangerouslySetInnerHTML`
- Always sanitize HTML content from external sources

### Authentication & Authorization
- Components don't handle auth - implement it in your app
- Use proper session management
- Implement CSRF protection

## Known Security Features

### Built-in Protections
- ✅ Automatic XSS protection
- ✅ ARIA compliance for accessibility
- ✅ TypeScript for type safety
- ✅ Prop validation
- ✅ Safe event handling

### Your Responsibility
- 🔒 Authentication
- 🔒 Authorization
- 🔒 Data validation
- 🔒 API security
- 🔒 Session management

## Security Checklist

Before deploying applications using @dainabase/ui:

- [ ] All dependencies are up to date
- [ ] No known vulnerabilities (`npm audit`)
- [ ] CSP headers configured
- [ ] HTTPS enabled
- [ ] Input validation implemented
- [ ] Authentication properly configured
- [ ] Authorization checks in place
- [ ] Error messages don't leak sensitive info
- [ ] Logging doesn't contain sensitive data
- [ ] Regular security updates scheduled

## Third-Party Dependencies

We carefully review all third-party dependencies:
- Radix UI - Trusted, well-maintained
- React - Facebook maintained
- TypeScript - Microsoft maintained

All dependencies are:
- Regularly updated
- Security audited
- From reputable sources
- Minimal in scope

## Disclosure Policy

When we receive a security report:

1. **Confirm** the vulnerability
2. **Fix** the issue in all supported versions
3. **Release** patches immediately
4. **Announce** via:
   - GitHub Security Advisory
   - NPM security advisory
   - Email to registered users (if critical)
5. **Credit** the reporter (unless they prefer anonymity)

## Security Hall of Fame

We thank the following security researchers:
- *Your name could be here!*

## Contact

- **Security Issues**: security@dainabase.com
- **General Questions**: dev@dainabase.com
- **Discord**: [Join our Discord](https://discord.gg/dainabase)

## PGP Key

For encrypted communications, use our PGP key:
```
-----BEGIN PGP PUBLIC KEY BLOCK-----
[PGP key would go here]
-----END PGP PUBLIC KEY BLOCK-----
```

---

*Last updated: August 15, 2025*
*Version: 1.0.0*
