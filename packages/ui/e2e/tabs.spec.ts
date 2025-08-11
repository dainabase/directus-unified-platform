import { test, expect } from '@playwright/test';

test.describe('Tabs Component E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=components-tabs--default');
  });

  test('should switch between tabs', async ({ page }) => {
    // Get tab buttons
    const tab1 = page.locator('[role="tab"]').nth(0);
    const tab2 = page.locator('[role="tab"]').nth(1);
    const tab3 = page.locator('[role="tab"]').nth(2);

    // First tab should be selected by default
    await expect(tab1).toHaveAttribute('aria-selected', 'true');
    await expect(tab2).toHaveAttribute('aria-selected', 'false');

    // First panel should be visible
    const panel1 = page.locator('[role="tabpanel"]').nth(0);
    await expect(panel1).toBeVisible();

    // Click second tab
    await tab2.click();

    // Second tab should be selected
    await expect(tab1).toHaveAttribute('aria-selected', 'false');
    await expect(tab2).toHaveAttribute('aria-selected', 'true');

    // Second panel should be visible
    const panel2 = page.locator('[role="tabpanel"]').nth(0); // Only active panel is rendered
    const panelContent = await panel2.textContent();
    expect(panelContent).toContain('Content 2'); // Adjust based on actual content
  });

  test('should handle keyboard navigation', async ({ page }) => {
    const tab1 = page.locator('[role="tab"]').nth(0);
    const tab2 = page.locator('[role="tab"]').nth(1);
    const tab3 = page.locator('[role="tab"]').nth(2);

    // Focus first tab
    await tab1.focus();
    await expect(tab1).toBeFocused();

    // Arrow right should move to next tab
    await page.keyboard.press('ArrowRight');
    await expect(tab2).toBeFocused();

    // Arrow right again
    await page.keyboard.press('ArrowRight');
    await expect(tab3).toBeFocused();

    // Arrow right should wrap to first tab
    await page.keyboard.press('ArrowRight');
    await expect(tab1).toBeFocused();

    // Arrow left should go to last tab
    await page.keyboard.press('ArrowLeft');
    await expect(tab3).toBeFocused();

    // Enter should select the tab
    await page.keyboard.press('Enter');
    await expect(tab3).toHaveAttribute('aria-selected', 'true');
  });

  test('should maintain focus on selected tab', async ({ page }) => {
    const tab2 = page.locator('[role="tab"]').nth(1);

    // Click second tab
    await tab2.click();
    await expect(tab2).toBeFocused();

    // Tab into panel
    await page.keyboard.press('Tab');

    // Focus should be in the panel
    const activeElement = await page.evaluate(() => document.activeElement?.getAttribute('role'));
    expect(activeElement).toBe('tabpanel');
  });

  test('should handle disabled tabs', async ({ page }) => {
    await page.goto('/iframe.html?id=components-tabs--with-disabled');

    const disabledTab = page.locator('[role="tab"][aria-disabled="true"]');
    await expect(disabledTab).toBeVisible();

    // Clicking disabled tab should not select it
    await disabledTab.click({ force: true });
    await expect(disabledTab).toHaveAttribute('aria-selected', 'false');

    // Keyboard navigation should skip disabled tab
    const tab1 = page.locator('[role="tab"]').nth(0);
    await tab1.focus();
    await page.keyboard.press('ArrowRight');

    // Should skip disabled tab and go to next enabled one
    const focusedTab = page.locator('[role="tab"]:focus');
    const isDisabled = await focusedTab.getAttribute('aria-disabled');
    expect(isDisabled).not.toBe('true');
  });

  test('should be accessible', async ({ page }) => {
    // Check ARIA attributes
    const tablist = page.locator('[role="tablist"]');
    await expect(tablist).toBeVisible();

    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();

    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      
      // Each tab should have required ARIA attributes
      await expect(tab).toHaveAttribute('role', 'tab');
      await expect(tab).toHaveAttribute('aria-selected', /.+/);
      await expect(tab).toHaveAttribute('aria-controls', /.+/);
    }

    // Tab panels should have correct role
    const panel = page.locator('[role="tabpanel"]').first();
    await expect(panel).toHaveAttribute('aria-labelledby', /.+/);
  });
});