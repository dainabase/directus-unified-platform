import { test, expect } from '@playwright/test';

test.describe('Accordion Component E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=components-accordion--default');
  });

  test('should expand and collapse items', async ({ page }) => {
    // Get first accordion item
    const trigger1 = page.locator('[data-state]').first();
    const content1 = page.locator('[role="region"]').first();

    // Initially collapsed
    await expect(trigger1).toHaveAttribute('data-state', 'closed');
    await expect(content1).not.toBeVisible();

    // Click to expand
    await trigger1.click();
    await expect(trigger1).toHaveAttribute('data-state', 'open');
    await expect(content1).toBeVisible();

    // Click to collapse
    await trigger1.click();
    await expect(trigger1).toHaveAttribute('data-state', 'closed');
    await expect(content1).not.toBeVisible();
  });

  test('should handle single expansion mode', async ({ page }) => {
    await page.goto('/iframe.html?id=components-accordion--single');

    const trigger1 = page.locator('[data-state]').nth(0);
    const trigger2 = page.locator('[data-state]').nth(1);
    const content1 = page.locator('[role="region"]').nth(0);
    const content2 = page.locator('[role="region"]').nth(1);

    // Expand first item
    await trigger1.click();
    await expect(content1).toBeVisible();

    // Expand second item - first should collapse
    await trigger2.click();
    await expect(content2).toBeVisible();
    await expect(content1).not.toBeVisible();
  });

  test('should handle multiple expansion mode', async ({ page }) => {
    await page.goto('/iframe.html?id=components-accordion--multiple');

    const trigger1 = page.locator('[data-state]').nth(0);
    const trigger2 = page.locator('[data-state]').nth(1);
    const content1 = page.locator('[role="region"]').nth(0);
    const content2 = page.locator('[role="region"]').nth(1);

    // Expand first item
    await trigger1.click();
    await expect(content1).toBeVisible();

    // Expand second item - both should be visible
    await trigger2.click();
    await expect(content1).toBeVisible();
    await expect(content2).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    const trigger1 = page.locator('[data-state]').first();
    
    // Focus first trigger
    await trigger1.focus();
    await expect(trigger1).toBeFocused();

    // Space should toggle
    await page.keyboard.press('Space');
    await expect(trigger1).toHaveAttribute('data-state', 'open');

    // Enter should also toggle
    await page.keyboard.press('Enter');
    await expect(trigger1).toHaveAttribute('data-state', 'closed');

    // Arrow keys should navigate between triggers
    await page.keyboard.press('ArrowDown');
    const trigger2 = page.locator('[data-state]').nth(1);
    await expect(trigger2).toBeFocused();

    await page.keyboard.press('ArrowUp');
    await expect(trigger1).toBeFocused();
  });

  test('should be accessible', async ({ page }) => {
    const triggers = page.locator('button[aria-expanded]');
    const triggerCount = await triggers.count();

    for (let i = 0; i < triggerCount; i++) {
      const trigger = triggers.nth(i);
      
      // Check ARIA attributes
      await expect(trigger).toHaveAttribute('aria-expanded', /.+/);
      await expect(trigger).toHaveAttribute('aria-controls', /.+/);

      // Expand and check region
      await trigger.click();
      const controlId = await trigger.getAttribute('aria-controls');
      const region = page.locator(`#${controlId}`);
      
      await expect(region).toHaveAttribute('role', 'region');
      await expect(region).toHaveAttribute('aria-labelledby', /.+/);
    }
  });
});