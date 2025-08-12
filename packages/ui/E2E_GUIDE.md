# 🎭 E2E Testing Guide - Directus UI

## 📋 Overview

End-to-End (E2E) testing ensures our UI components work correctly in real browser environments. We use Playwright for cross-browser testing.

## 🚀 Quick Start

### Prerequisites
```bash
# Install dependencies
pnpm install

# Install Playwright browsers
npx playwright install
```

### Running Tests

```bash
# Run all E2E tests
pnpm run test:e2e

# Run tests in headed mode (see browser)
pnpm run test:e2e --headed

# Run tests for specific browser
pnpm run test:e2e --project=chromium
pnpm run test:e2e --project=firefox
pnpm run test:e2e --project=webkit

# Run specific test file
pnpm run test:e2e components.spec.ts

# Run tests in UI mode (interactive)
pnpm run test:e2e --ui

# Debug tests
pnpm run test:e2e --debug
```

## 📁 Project Structure

```
packages/ui/
├── e2e/
│   ├── components.spec.ts      # Component tests
│   ├── accessibility.spec.ts   # A11y tests
│   ├── responsive.spec.ts      # Responsive tests
│   └── fixtures/
│       ├── test-data.json      # Test data
│       └── helpers.ts          # Test helpers
├── playwright.config.ts         # Playwright config
└── playwright-report/          # Test reports (generated)
```

## 🎯 Test Categories

### 1. Component Tests
Test individual UI components in isolation:
- Rendering
- User interactions
- State management
- Props validation

### 2. Integration Tests
Test component interactions:
- Form submissions
- Data flow
- Navigation
- API interactions

### 3. Accessibility Tests
- ARIA attributes
- Keyboard navigation
- Screen reader compatibility
- Focus management

### 4. Visual Regression Tests
- Screenshot comparisons
- Layout stability
- Responsive design
- Theme consistency

## 📝 Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Component Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/button');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const button = page.locator('button[data-testid="my-button"]');
    
    // Act
    await button.click();
    
    // Assert
    await expect(button).toHaveClass('active');
  });
});
```

### Best Practices

1. **Use data-testid attributes**
   ```tsx
   <button data-testid="submit-button">Submit</button>
   ```

2. **Write descriptive test names**
   ```typescript
   test('should disable submit button when form is invalid', async ({ page }) => {
     // test implementation
   });
   ```

3. **Keep tests independent**
   - Each test should be able to run in isolation
   - Use beforeEach/afterEach for setup/cleanup

4. **Use Page Object Model for complex pages**
   ```typescript
   class LoginPage {
     constructor(private page: Page) {}
     
     async login(username: string, password: string) {
       await this.page.fill('[data-testid="username"]', username);
       await this.page.fill('[data-testid="password"]', password);
       await this.page.click('[data-testid="login-button"]');
     }
   }
   ```

5. **Handle async operations properly**
   ```typescript
   // Wait for elements
   await page.waitForSelector('[data-testid="loader"]', { state: 'hidden' });
   
   // Wait for navigation
   await page.waitForURL('/dashboard');
   
   // Wait for API calls
   await page.waitForResponse(response => 
     response.url().includes('/api/data') && response.status() === 200
   );
   ```

## 🔍 Debugging

### Visual Debugging
```bash
# Run with headed browser
npx playwright test --headed

# Use UI mode
npx playwright test --ui

# Pause on failure
npx playwright test --debug
```

### Trace Viewer
```bash
# Record trace on failure
npx playwright test --trace on-first-retry

# View trace
npx playwright show-trace trace.zip
```

### Console Logs
```typescript
test('debug test', async ({ page }) => {
  // Listen to console
  page.on('console', msg => console.log(msg.text()));
  
  // Take screenshot
  await page.screenshot({ path: 'debug.png' });
  
  // Pause execution
  await page.pause();
});
```

## 📊 Reports

### HTML Report
```bash
# Generate and open HTML report
npx playwright show-report
```

### JSON Report
```bash
# Run with JSON reporter
npx playwright test --reporter=json > results.json
```

### Custom Report in CI
Reports are automatically generated and uploaded as artifacts in GitHub Actions.

## 🔧 Configuration

### playwright.config.ts
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

## 🚀 CI/CD Integration

### GitHub Actions Workflow
E2E tests run automatically on:
- Push to main/develop branches
- Pull requests
- Manual trigger

### Artifacts
- Test reports
- Screenshots (on failure)
- Videos (on failure)
- Traces (on retry)

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)

## 🤝 Contributing

1. Write tests for new components
2. Update tests when modifying components
3. Ensure all tests pass before PR
4. Add data-testid attributes for testability
5. Document complex test scenarios

## 📞 Support

For E2E testing questions:
- Check this guide
- Review existing tests
- Ask in #testing channel
- Create an issue for bugs

---

*Happy Testing! 🎭*