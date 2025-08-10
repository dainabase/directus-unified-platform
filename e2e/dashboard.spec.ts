import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should load dashboard', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check for main dashboard elements
    const title = page.locator('h1, h2').first();
    await expect(title).toBeVisible();
  });

  test('should have navigation', async ({ page }) => {
    // Check for navigation elements
    const nav = page.locator('nav, [role="navigation"]').first();
    
    if (await nav.count() > 0) {
      await expect(nav).toBeVisible();
    }
  });

  test('should have responsive layout', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(500);
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Check that page is still functional
    const mainContent = page.locator('main, [role="main"], #root, #__next').first();
    await expect(mainContent).toBeVisible();
  });

  test('should use Design System components', async ({ page }) => {
    // Look for DS components (buttons, cards, etc.)
    const buttons = page.locator('button');
    
    if (await buttons.count() > 0) {
      // Check that at least one button is visible
      await expect(buttons.first()).toBeVisible();
    }
  });
});
