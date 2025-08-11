import { test, expect } from '@playwright/test';

test.describe('Dialog Component E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=components-dialog--default');
  });

  test('should open and close dialog', async ({ page }) => {
    // Initially dialog should not be visible
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).not.toBeVisible();

    // Click trigger to open
    const trigger = page.locator('button').first();
    await trigger.click();

    // Dialog should be visible
    await expect(dialog).toBeVisible();

    // Check backdrop is present
    const backdrop = page.locator('.fixed.inset-0.bg-black');
    await expect(backdrop).toBeVisible();

    // Close with X button
    const closeButton = page.locator('[aria-label="Close"]');
    await closeButton.click();

    // Dialog should be hidden
    await expect(dialog).not.toBeVisible();
  });

  test('should close on Escape key', async ({ page }) => {
    // Open dialog
    const trigger = page.locator('button').first();
    await trigger.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Dialog should close
    await expect(dialog).not.toBeVisible();
  });

  test('should close on backdrop click', async ({ page }) => {
    // Open dialog
    const trigger = page.locator('button').first();
    await trigger.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Click backdrop
    await page.mouse.click(10, 10); // Click outside dialog

    // Dialog should close
    await expect(dialog).not.toBeVisible();
  });

  test('should trap focus within dialog', async ({ page }) => {
    // Open dialog
    const trigger = page.locator('button').first();
    await trigger.click();

    // Focus should be within dialog
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();

    // Tab through all focusable elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const element = await page.evaluate(() => document.activeElement?.closest('[role="dialog"]'));
      expect(element).toBeTruthy(); // Focus should stay within dialog
    }
  });

  test('should handle form submission in dialog', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dialog--with-form');

    // Open dialog
    const trigger = page.locator('button').first();
    await trigger.click();

    // Fill form
    const input = page.locator('input[type="text"]').first();
    await input.fill('Test Value');

    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Dialog should close after submission
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).not.toBeVisible();
  });
});