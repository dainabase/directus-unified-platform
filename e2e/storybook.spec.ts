import { test, expect } from '@playwright/test';

test.describe('Design System - Storybook', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:6006');
  });

  test('should load Storybook homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/Storybook/);
    await expect(page.locator('[title="Storybook"]')).toBeVisible();
  });

  test('should navigate to Button component', async ({ page }) => {
    // Click on Button in sidebar
    await page.getByRole('button', { name: /button/i }).first().click();
    
    // Check if Button story is loaded
    await expect(page.frameLocator('#storybook-preview-iframe').locator('button')).toBeVisible();
  });

  test('should interact with Button variants', async ({ page }) => {
    await page.getByRole('button', { name: /button/i }).first().click();
    
    const iframe = page.frameLocator('#storybook-preview-iframe');
    const button = iframe.locator('button').first();
    
    // Test hover state
    await button.hover();
    
    // Test click
    await button.click();
    
    // Take screenshot for visual comparison
    await expect(iframe.locator('body')).toHaveScreenshot('button-primary.png');
  });

  test('should navigate to Card component', async ({ page }) => {
    await page.getByRole('button', { name: /card/i }).first().click();
    
    const iframe = page.frameLocator('#storybook-preview-iframe');
    await expect(iframe.locator('[class*="card"]').first()).toBeVisible();
  });

  test('should test DataGrid component', async ({ page }) => {
    await page.getByRole('button', { name: /data-grid/i }).first().click();
    
    const iframe = page.frameLocator('#storybook-preview-iframe');
    await expect(iframe.locator('table')).toBeVisible();
    
    // Test sorting
    const header = iframe.locator('th').first();
    await header.click();
  });

  test('should check theme toggle', async ({ page }) => {
    await page.getByRole('button', { name: /theme-toggle/i }).first().click();
    
    const iframe = page.frameLocator('#storybook-preview-iframe');
    const themeToggle = iframe.locator('[aria-label*="theme"]').first();
    
    // Toggle theme
    await themeToggle.click();
    
    // Check if theme changed
    await expect(iframe.locator('html')).toHaveAttribute('class', /dark/);
  });

  test('should test form components', async ({ page }) => {
    await page.getByRole('button', { name: /input/i }).first().click();
    
    const iframe = page.frameLocator('#storybook-preview-iframe');
    const input = iframe.locator('input[type="text"]').first();
    
    // Type in input
    await input.fill('Test input value');
    await expect(input).toHaveValue('Test input value');
    
    // Clear input
    await input.clear();
    await expect(input).toHaveValue('');
  });

  test('should test accessibility', async ({ page }) => {
    await page.getByRole('button', { name: /button/i }).first().click();
    
    const iframe = page.frameLocator('#storybook-preview-iframe');
    
    // Check for ARIA attributes
    const button = iframe.locator('button').first();
    await expect(button).toHaveAttribute('type', /.*/);
    
    // Test keyboard navigation
    await button.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
  });
});
