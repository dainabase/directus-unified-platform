import { test, expect } from '@playwright/test';

test.describe('Button Component E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Button story in Storybook
    await page.goto('/iframe.html?id=components-button--default');
  });

  test('should render and be clickable', async ({ page }) => {
    // Check button is visible
    const button = page.locator('button').first();
    await expect(button).toBeVisible();
    
    // Check button text
    await expect(button).toContainText('Button');
    
    // Test click interaction
    await button.click();
  });

  test('should handle disabled state', async ({ page }) => {
    // Navigate to disabled story
    await page.goto('/iframe.html?id=components-button--disabled');
    
    const button = page.locator('button').first();
    await expect(button).toBeDisabled();
    
    // Verify click doesn't work
    const clickPromise = button.click({ force: true });
    await expect(clickPromise).rejects.toThrow();
  });

  test('should display all variants correctly', async ({ page }) => {
    // Navigate to all variants story
    await page.goto('/iframe.html?id=components-button--all-variants');
    
    // Check all variant buttons are visible
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(5); // We have 6 variants
    
    // Check specific variant classes
    const destructiveButton = page.locator('button:has-text("Destructive")');
    await expect(destructiveButton).toHaveClass(/destructive/);
  });

  test('should handle keyboard navigation', async ({ page }) => {
    const button = page.locator('button').first();
    
    // Focus button with Tab
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    
    // Activate with Enter
    await page.keyboard.press('Enter');
    
    // Activate with Space
    await page.keyboard.press('Space');
  });

  test('should be accessible', async ({ page }) => {
    // Check ARIA attributes
    const button = page.locator('button').first();
    
    // Button should have proper role
    await expect(button).toHaveRole('button');
    
    // Check contrast ratio (would need axe-playwright for full a11y testing)
    // This is a placeholder for more comprehensive accessibility testing
  });
});