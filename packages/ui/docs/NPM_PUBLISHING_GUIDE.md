# NPM Publishing Guide - @dainabase/ui v1.3.0

## 📅 Release Schedule: August 25, 2025

This guide provides step-by-step instructions for publishing @dainabase/ui to NPM.

## 📋 Pre-Flight Checklist

### 1. Environment Setup
```bash
# Ensure you're on the latest main branch
git checkout main
git pull origin main

# Navigate to the package directory
cd packages/ui

# Install dependencies
pnpm install --frozen-lockfile
```

### 2. Verify Node & NPM Versions
```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
```

### 3. NPM Authentication
```bash
# Login to NPM (if not already)
npm login

# Verify you're logged in
npm whoami  # Should show your NPM username

# Verify access to @dainabase scope
npm access ls-packages @dainabase
```

## 🔍 Pre-Release Verification

### Run Automated Checks
```bash
# Run the pre-release verification script
node scripts/pre-release-check.js

# Expected output:
# ✓ Package.json validated
# ✓ Build verified
# ✓ TypeScript definitions found
# ✓ No security vulnerabilities
# ✓ All files present
# ✓ NPM dry run successful
```

### Manual Verification Steps

#### 1. Build the Package
```bash
# Clean previous builds
pnpm clean

# Build production bundle
pnpm build:optimized

# Verify bundle size
du -sh dist/index.js  # Should be < 40KB
```

#### 2. Test the Build Locally
```bash
# Pack the package
npm pack

# This creates dainabase-ui-1.3.0.tgz
# Test in a separate project:
cd /tmp
npm init -y
npm install /path/to/dainabase-ui-1.3.0.tgz
```

#### 3. Verify TypeScript Definitions
```typescript
// Create test.ts in temp project
import { Button, Card, Badge } from '@dainabase/ui';
import type { ButtonProps } from '@dainabase/ui';

const props: ButtonProps = {
  variant: 'primary',
  loading: false
};
```

## 🚀 Publishing Process

### Step 1: Final Tests
```bash
# Run all tests
pnpm test

# Run coverage check
pnpm test:coverage

# Ensure coverage > 95%
```

### Step 2: Update Version (if needed)
```bash
# The version should already be 1.3.0
# If not, update it:
npm version 1.3.0 --no-git-tag-version
```

### Step 3: Create Git Tag
```bash
# Create annotated tag
git tag -a v1.3.0 -m "Release v1.3.0 - Production Ready

- 95% test coverage achieved
- Bundle size reduced to 38KB
- WCAG 2.1 AAA compliance
- 58 components fully tested
- Complete documentation"

# Push tag to GitHub
git push origin v1.3.0
```

### Step 4: NPM Publish Dry Run
```bash
# One final dry run
npm publish --dry-run

# Review the output:
# - Check included files
# - Verify package size
# - Confirm version
```

### Step 5: Publish to NPM 🎉
```bash
# POINT OF NO RETURN - This publishes to NPM
npm publish --access public

# Expected output:
# npm notice 📦  @dainabase/ui@1.3.0
# npm notice === Tarball Contents ===
# npm notice 38.0kB dist/index.js
# npm notice 2.1kB  dist/index.d.ts
# npm notice ...
# + @dainabase/ui@1.3.0
```

### Step 6: Verify Publication
```bash
# Check NPM registry
npm view @dainabase/ui@1.3.0

# Test installation
cd /tmp && npm init -y
npm install @dainabase/ui@1.3.0
```

## 📦 Post-Publication Tasks

### 1. Create GitHub Release
1. Go to: https://github.com/dainabase/directus-unified-platform/releases
2. Click "Draft a new release"
3. Choose tag: `v1.3.0`
4. Title: `@dainabase/ui v1.3.0 - Production Release`
5. Copy content from `RELEASE_NOTES_v1.3.0.md`
6. Attach build artifacts:
   - `dainabase-ui-1.3.0.tgz`
   - Bundle analysis report
   - Coverage report
7. ✅ Check "Set as latest release"
8. Click "Publish release"

### 2. Update Documentation
```bash
# Update the docs site
cd docs
npm run build
npm run deploy
```

### 3. Announcements

#### Discord
Post in #announcements:
```
🎉 **@dainabase/ui v1.3.0 Released!**

We're thrilled to announce the production release of our design system!

✨ Highlights:
• 95% test coverage (from 0%!)
• 38KB bundle (24% smaller)
• WCAG 2.1 AAA compliant
• 58 fully tested components
• Lightning fast performance

📦 Install: `npm install @dainabase/ui@1.3.0`
📚 Docs: https://ui.dainabase.com
📝 Release Notes: https://github.com/dainabase/directus-unified-platform/releases/tag/v1.3.0

Thank you to everyone who contributed! 🙏
```

#### Twitter/X
```
🚀 @dainabase/ui v1.3.0 is here!

✅ 95% test coverage
✅ 38KB bundle size
✅ WCAG AAA compliant
✅ 58 components
✅ Production ready

The most tested, optimized, and accessible React component library.

npm install @dainabase/ui

#ReactJS #DesignSystem #WebDev #A11y #OpenSource
```

### 4. Monitor Metrics

#### NPM Downloads
- Check: https://www.npmjs.com/package/@dainabase/ui
- Monitor download stats
- Track weekly downloads

#### GitHub Stars
- Monitor repository stars
- Track issue reports
- Respond to feedback

#### Error Tracking
- Check Sentry for any errors
- Monitor GitHub Issues
- Review Discord feedback

## 🐛 Rollback Procedure (if needed)

If critical issues are discovered:

### 1. Deprecate the Version
```bash
npm deprecate @dainabase/ui@1.3.0 "Critical issue found, use 1.2.0"
```

### 2. Publish Patch
```bash
# Fix the issue
git checkout -b hotfix/v1.3.1

# Make fixes...
# Update version
npm version patch

# Publish patch
npm publish
```

### 3. Communicate
- Post in Discord
- Update GitHub release notes
- Tweet about the fix

## 📊 Success Metrics

Track these KPIs post-release:

| Metric | Target | Check Method |
|--------|--------|--------------|
| NPM Downloads (Week 1) | 500+ | npm stats |
| GitHub Stars | +10 | GitHub Insights |
| Issue Reports | <5 critical | GitHub Issues |
| User Satisfaction | >90% | Discord feedback |
| Bundle Size | <40KB | Bundlephobia |
| Performance | 98+ Lighthouse | PageSpeed Insights |

## 🔐 Security Considerations

### Before Publishing
- [ ] Run `npm audit` - ensure 0 vulnerabilities
- [ ] Check dependencies for known issues
- [ ] Verify no sensitive data in code
- [ ] Ensure no API keys or tokens

### After Publishing
- [ ] Enable 2FA on NPM account
- [ ] Review package permissions
- [ ] Monitor for security advisories
- [ ] Set up Dependabot alerts

## 📝 Release Notes Template

```markdown
## @dainabase/ui v1.3.0

Released: August 25, 2025

### What's New
- Feature 1
- Feature 2

### Breaking Changes
- Change 1
- Change 2

### Bug Fixes
- Fix 1
- Fix 2

### Installation
npm install @dainabase/ui@1.3.0
```

## 🤝 Team Contacts

For questions or issues during release:

- **Lead**: @dainabase
- **Discord**: #dev-team channel
- **Email**: release@dainabase.com
- **Emergency**: Use Discord voice channel

## ✅ Final Checklist

Before hitting publish:

- [ ] All tests passing
- [ ] Coverage > 95%
- [ ] Bundle < 40KB
- [ ] No security vulnerabilities
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Team notified
- [ ] Backup created
- [ ] Coffee ready ☕

---

**Remember**: Publishing to NPM is permanent. Take your time, double-check everything, and celebrate when done! 🎉

Good luck with the release! 🚀