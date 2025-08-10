import { test, expect } from '@playwright/test';

test.describe('Dashboard - Next.js App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should load dashboard homepage', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Dainabase/);
    
    // Check main navigation
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should navigate to dashboard', async ({ page }) => {
    // Click on Dashboard link
    await page.getByRole('link', { name: /dashboard/i }).click();
    
    // Wait for navigation
    await page.waitForURL('**/dashboard');
    
    // Check dashboard elements
    await expect(page.locator('h1')).toContainText(/dashboard/i);
  });

  test('should display metrics cards', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Check for metric cards
    const metricsCards = page.locator('[data-testid="metric-card"]');
    await expect(metricsCards).toHaveCount(4);
    
    // Check first card has content
    const firstCard = metricsCards.first();
    await expect(firstCard).toBeVisible();
  });

  test('should display charts', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Check for charts
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="users-chart"]')).toBeVisible();
  });

  test('should display data table', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Check for data table
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    // Check table has headers
    const headers = table.locator('thead th');
    await expect(headers).toHaveCount(5);
    
    // Check table has rows
    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should handle theme toggle', async ({ page }) => {
    // Find theme toggle button
    const themeToggle = page.locator('[aria-label*="theme"]');
    await expect(themeToggle).toBeVisible();
    
    // Click theme toggle
    await themeToggle.click();
    
    // Check if theme changed
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    // Toggle back
    await themeToggle.click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('should be responsive', async ({ page, viewport }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/dashboard');
    
    // Check mobile menu button is visible
    const mobileMenuButton = page.locator('[aria-label*="menu"]');
    await expect(mobileMenuButton).toBeVisible();
    
    // Click mobile menu
    await mobileMenuButton.click();
    
    // Check navigation is visible
    await expect(page.locator('nav')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
  });

  test('should test form interactions', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"]').first();
    
    if (await searchInput.isVisible()) {
      // Type in search
      await searchInput.fill('test search');
      await expect(searchInput).toHaveValue('test search');
      
      // Clear search
      await searchInput.clear();
      await expect(searchInput).toHaveValue('');
    }
  });

  test('should test command palette', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Open command palette with keyboard shortcut
    await page.keyboard.press('Control+K');
    
    // Check if command palette is visible
    const commandPalette = page.locator('[role="dialog"]');
    
    if (await commandPalette.isVisible()) {
      // Type a command
      await page.keyboard.type('theme');
      
      // Check for results
      const results = page.locator('[role="option"]');
      await expect(results.first()).toBeVisible();
      
      // Close command palette
      await page.keyboard.press('Escape');
      await expect(commandPalette).not.toBeVisible();
    }
  });

  test('should test accessibility', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Check focused element has focus visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test skip link (if present)
    const skipLink = page.locator('a[href="#main"], a[href="#content"]');
    if (await skipLink.count() > 0) {
      await skipLink.focus();
      await expect(skipLink).toBeVisible();
    }
    
    // Check ARIA landmarks
    await expect(page.locator('nav, [role="navigation"]')).toBeVisible();
    await expect(page.locator('main, [role="main"]')).toBeVisible();
  });

  test('should capture visual snapshots', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('dashboard-full.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    // Take viewport screenshot
    await expect(page).toHaveScreenshot('dashboard-viewport.png');
  });
});
