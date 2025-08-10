# Chromatic Configuration

## Overview
Chromatic is configured for visual regression testing of the Storybook components.

## Configuration
- **Project Token**: `chpt_b29d02c928a3750`
- **Config File**: `packages/ui/.chromatic.config.json`
- **Workflow**: `.github/workflows/ui-chromatic.yml`

## How to Use

### Automatic Runs
Chromatic runs automatically on:
- Every push to `feat/design-system-apple` branch
- Every PR to `feat/design-system-apple`, `main`, or `master` branches

### Manual Run
You can trigger Chromatic manually:
1. Go to [Actions tab](https://github.com/dainabase/directus-unified-platform/actions)
2. Select "UI Chromatic" workflow
3. Click "Run workflow"
4. Select the branch and click "Run workflow"

### Local Run
To run Chromatic locally:
```bash
# From repository root
pnpm --filter @dainabase/ui chromatic

# Or from packages/ui directory
cd packages/ui
pnpm chromatic
```

## Features Configured
- ✅ Auto-accept changes on `feat/design-system-apple` branch
- ✅ Only test changed components
- ✅ Exit with zero on changes (non-blocking)
- ✅ Build Storybook before running tests
- ✅ Manual trigger support

## Results
After each run, the workflow outputs:
- **Build URL**: Direct link to the Chromatic build
- **Storybook URL**: Live Storybook preview
- **Change Count**: Number of visual changes detected

## Troubleshooting
If Chromatic fails:
1. Check that Storybook builds successfully: `pnpm --filter @dainabase/ui build:sb:static`
2. Verify the token is valid
3. Check the [workflow runs](https://github.com/dainabase/directus-unified-platform/actions/workflows/ui-chromatic.yml)

## Security Note
The token is currently embedded in the configuration. For production use, consider:
1. Adding the token to GitHub Secrets as `CHROMATIC_PROJECT_TOKEN`
2. Removing the token from `.chromatic.config.json`
3. Removing the fallback token from the workflow

## Links
- [Chromatic Dashboard](https://www.chromatic.com/builds?appId=6796c5bf74e2f7e8f0f9b8f3)
- [Chromatic Docs](https://www.chromatic.com/docs)
