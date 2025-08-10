# 🎭 Playwright E2E Testing

## Overview
This project uses Playwright for End-to-End (E2E) testing of the Design System and Dashboard application.

## Installation

### 1. Install Playwright
```bash
# Install Playwright and browsers
pnpm add -D @playwright/test
npx playwright install

# Or install specific browser
npx playwright install chromium
```

### 2. Browser Installation
When you first run Playwright tests, it will automatically download the required browsers:
- **Chromium** (~150 MB)
- **Firefox** (~75 MB)  
- **WebKit** (~50 MB)

Browsers are stored in:
- **macOS/Linux**: `~/.cache/ms-playwright/`
- **Windows**: `%USERPROFILE%\AppData\Local\ms-playwright\`

## Running Tests

### Local Development
```bash
# Run all tests
npx playwright test

# Run tests in UI mode (recommended for development)
npx playwright test --ui

# Run tests for specific browser
npx playwright test --project=chromium

# Run specific test file
npx playwright test e2e/dashboard.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed

# Debug tests
npx playwright test --debug
```

### CI/CD
Tests run automatically on:
- Push to `feat/design-system-apple` or `main`
- Pull requests
- Manual workflow dispatch

## Test Structure

```
e2e/
├── storybook.spec.ts    # Design System component tests
├── dashboard.spec.ts    # Dashboard application tests
└── fixtures/           # Test fixtures and helpers (future)
```

## Writing Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const button = page.locator('button');
    
    // Act
    await button.click();
    
    // Assert
    await expect(page).toHaveURL('/expected-url');
  });
});
```

### Best Practices
1. **Use data-testid attributes** for reliable element selection
2. **Wait for elements** before interacting: `await expect(element).toBeVisible()`
3. **Use Page Object Model** for complex pages
4. **Take screenshots** for visual validation
5. **Test accessibility** with keyboard navigation

## Visual Testing

### Screenshots
```typescript
// Take screenshot for comparison
await expect(page).toHaveScreenshot('dashboard.png');

// Take element screenshot
await expect(page.locator('.card')).toHaveScreenshot('card.png');
```

### Update Screenshots
```bash
# Update all screenshots
npx playwright test --update-snapshots

# Update specific test screenshots
npx playwright test dashboard.spec.ts --update-snapshots
```

## Debugging

### UI Mode
Best for development - shows test execution with time-travel debugging:
```bash
npx playwright test --ui
```

### Debug Mode
Opens browser with Playwright Inspector:
```bash
npx playwright test --debug
```

### VS Code Extension
Install "Playwright Test for VSCode" for:
- Run tests from editor
- Debug with breakpoints
- Generate tests by recording

## Configuration

See `playwright.config.ts` for:
- Browser configurations
- Test timeouts
- Base URLs
- Web server settings
- Reporter configurations

## Artifacts

Test artifacts are stored in:
- `playwright-report/` - HTML test reports
- `test-results/` - Screenshots, videos, traces
- `e2e/**/__screenshots__/` - Baseline screenshots

## GitHub Actions

The E2E workflow runs tests in CI with:
- Matrix testing (Chromium, Firefox, WebKit)
- Artifact uploads for failures
- PR comments with results
- Parallel execution

## Troubleshooting

### Browsers Not Found
```bash
# Reinstall browsers
npx playwright install --force

# Install with system dependencies (Linux)
npx playwright install --with-deps
```

### Port Already in Use
```bash
# Kill processes on port
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows
```

### Timeout Issues
Increase timeout in `playwright.config.ts`:
```typescript
use: {
  timeout: 60000, // 60 seconds
}
```

## Playwright MCP Integration

When Playwright MCP is installed in Claude Desktop, you can:
1. Generate tests by describing scenarios
2. Debug test failures interactively
3. Analyze test results
4. Refactor test code

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)

## Commands Summary

```bash
# Installation
npx playwright install              # Install all browsers
npx playwright install chromium      # Install specific browser

# Running Tests
npx playwright test                  # Run all tests
npx playwright test --ui            # UI mode
npx playwright test --headed        # Headed mode
npx playwright test --debug         # Debug mode
npx playwright test --project=chromium  # Specific browser

# Maintenance
npx playwright test --update-snapshots  # Update screenshots
npx playwright show-report              # Show last report
npx playwright codegen localhost:3000   # Generate tests
```
