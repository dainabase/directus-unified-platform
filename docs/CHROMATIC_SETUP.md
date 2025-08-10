# 🎨 Chromatic Setup Guide

## Overview
Chromatic is our visual regression testing tool for Storybook. It captures screenshots of components and compares them against baselines to detect visual changes.

## 🔑 Token Configuration

### 1. Getting Your Chromatic Project Token

1. **Sign in to Chromatic**
   - Go to [chromatic.com](https://www.chromatic.com/)
   - Sign in with your GitHub account

2. **Create or Select Project**
   - If new: Click "Add project" → Select `dainabase/directus-unified-platform`
   - If existing: Select the project from your dashboard

3. **Find Your Token**
   - Go to **Manage** → **Configure**
   - Copy the project token (starts with `chpt_`)

### 2. Adding Token to GitHub Repository

1. **Navigate to Repository Settings**
   ```
   https://github.com/dainabase/directus-unified-platform/settings/secrets/actions
   ```

2. **Add New Repository Secret**
   - Click **"New repository secret"**
   - Name: `CHROMATIC_PROJECT_TOKEN`
   - Value: Your token from step 1.3
   - Click **"Add secret"**

### 3. Local Testing

For local testing with Chromatic:

```bash
# Install dependencies
pnpm install

# Build Storybook
pnpm --filter @dainabase/ui build:sb:static

# Run Chromatic locally (requires token)
export CHROMATIC_PROJECT_TOKEN="your-token-here"
pnpm dlx chromatic --project-token=$CHROMATIC_PROJECT_TOKEN \
  --storybook-build-dir=packages/ui/storybook-static
```

## 🚦 CI/CD Integration

### Workflow Configuration
- **File**: `.github/workflows/ui-chromatic.yml`
- **Trigger**: On push to `feat/design-system-apple` and PRs
- **Blocking**: Yes - fails CI if visual changes detected
- **Auto-accept**: Changes on `feat/design-system-apple` branch

### Required Status Checks
To make Chromatic a required check:

1. Go to **Settings** → **Branches**
2. Edit branch protection rules for your default branch
3. Enable **"Require status checks to pass"**
4. Search and add: `chromatic`

## 📊 Chromatic Dashboard

### Accessing Results
- **Build History**: [chromatic.com/builds](https://www.chromatic.com/builds)
- **Component Library**: Linked from each build
- **Pull Request Comments**: Automatic with changes summary

### Understanding Results
- ✅ **No changes**: All components match baseline
- ⚠️ **Changes detected**: Visual differences found
- 🔍 **Review required**: Manual approval needed
- ❌ **Build failed**: Technical error (check logs)

## 🎯 Best Practices

### 1. Baseline Management
- Accept intentional changes promptly
- Review all detected changes carefully
- Use "Accept all" sparingly

### 2. Story Coverage
- Ensure all component states have stories
- Include edge cases and error states
- Test responsive breakpoints

### 3. Performance
- Keep build times under 5 minutes
- Use `onlyChanged` for faster builds
- Optimize heavy components

## 🐛 Troubleshooting

### Common Issues

#### Token Not Found
```
Error: Missing project token
```
**Solution**: Ensure `CHROMATIC_PROJECT_TOKEN` is set in GitHub Secrets

#### Build Timeout
```
Error: Build exceeded maximum duration
```
**Solution**: 
- Reduce number of stories
- Optimize component rendering
- Contact Chromatic support for limit increase

#### Snapshot Limit Exceeded
```
Error: Snapshot limit (5000) exceeded
```
**Solution**:
- Upgrade Chromatic plan
- Reduce story variations
- Use `onlyChanged` flag

## 📚 Resources

- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Storybook Integration](https://www.chromatic.com/docs/storybook)
- [CI Setup Guide](https://www.chromatic.com/docs/ci)
- [Pricing & Limits](https://www.chromatic.com/pricing)

## 🆘 Support

- **Chromatic Support**: support@chromatic.com
- **Internal Contact**: admin@dainamics.ch
- **GitHub Issues**: [Create Issue](https://github.com/dainabase/directus-unified-platform/issues/new)

---

**Last Updated**: 2025-08-10
**Maintained by**: Dainabase DevOps Team
