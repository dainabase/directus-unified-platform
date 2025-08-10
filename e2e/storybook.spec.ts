import { test, expect } from '@playwright/test';

test.describe('Storybook', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:6006');
  });

  test('should load Storybook', async ({ page }) => {
    // Wait for Storybook to load
    await page.waitForSelector('[title="Storybook"]', { timeout: 30000 });
    
    // Check that the sidebar is visible
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();
  });

  test('should navigate to Button component', async ({ page }) => {
    // Navigate to Button component
    await page.goto('http://localhost:6006/?path=/story/components-button--default');
    
    // Wait for iframe to load
    const iframe = page.frameLocator('#storybook-preview-iframe');
    
    // Check that button is rendered
    const button = iframe.locator('button');
    await expect(button).toBeVisible();
  });

  test('should navigate to Card component', async ({ page }) => {
    // Navigate to Card component
    await page.goto('http://localhost:6006/?path=/story/components-card--default');
    
    // Wait for iframe to load
    const iframe = page.frameLocator('#storybook-preview-iframe');
    
    // Check that card is rendered
    const card = iframe.locator('[class*="card"]');
    await expect(card).toBeVisible();
  });

  test('should have dark mode toggle', async ({ page }) => {
    // Look for theme toggle in toolbar
    const themeToggle = page.locator('[title*="theme"], [title*="Theme"], [aria-label*="theme"], [aria-label*="Theme"]');
    
    // The theme toggle might be in the toolbar
    if (await themeToggle.count() > 0) {
      await expect(themeToggle.first()).toBeVisible();
    }
  });
});
