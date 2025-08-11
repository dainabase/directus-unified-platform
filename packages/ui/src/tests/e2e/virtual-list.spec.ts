import { test, expect } from '@playwright/test';

test.describe('VirtualList Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=sprint3-virtuallist--default');
    await page.waitForLoadState('networkidle');
  });

  test('should render virtual list container', async ({ page }) => {
    const container = page.locator('[data-testid="virtual-list-container"]').or(page.locator('.relative').first());
    await expect(container).toBeVisible();
    
    // Check height is applied
    const height = await container.evaluate(el => window.getComputedStyle(el).height);
    expect(parseInt(height)).toBeGreaterThan(0);
  });

  test('should only render visible items', async ({ page }) => {
    // Wait for virtual list to initialize
    await page.waitForTimeout(500);
    
    // Count rendered items
    const items = page.locator('[data-index]');
    const count = await items.count();
    
    // Should render less than 20 items for a 400px container with 60px items
    expect(count).toBeLessThan(20);
    expect(count).toBeGreaterThan(5);
  });

  test('should render more items on scroll', async ({ page }) => {
    const scrollContainer = page.locator('.overflow-auto').first();
    
    // Get initial item indices
    const initialItems = await page.locator('[data-index]').evaluateAll(
      elements => elements.map(el => el.getAttribute('data-index'))
    );
    
    // Scroll down
    await scrollContainer.evaluate(el => el.scrollTop = 500);
    await page.waitForTimeout(200);
    
    // Get new item indices
    const scrolledItems = await page.locator('[data-index]').evaluateAll(
      elements => elements.map(el => el.getAttribute('data-index'))
    );
    
    // Should have different items visible
    expect(scrolledItems).not.toEqual(initialItems);
    expect(scrolledItems.some(index => !initialItems.includes(index))).toBeTruthy();
  });

  test('should handle large lists efficiently', async ({ page }) => {
    await page.goto('/iframe.html?id=sprint3-virtuallist--large-list');
    await page.waitForLoadState('networkidle');
    
    const scrollContainer = page.locator('.overflow-auto').first();
    
    // Check total scroll height indicates 10000 items
    const scrollHeight = await scrollContainer.evaluate(el => el.scrollHeight);
    expect(scrollHeight).toBeGreaterThan(100000); // 10000 items * 50px minimum
    
    // But only renders visible items
    const visibleItems = await page.locator('[data-index]').count();
    expect(visibleItems).toBeLessThan(30); // Much less than 10000
  });

  test('should support variable heights', async ({ page }) => {
    await page.goto('/iframe.html?id=sprint3-virtuallist--variable-heights');
    await page.waitForLoadState('networkidle');
    
    // Get rendered items
    const items = page.locator('[data-index]');
    const heights = await items.evaluateAll(elements => 
      elements.map(el => parseInt(window.getComputedStyle(el).height))
    );
    
    // Should have different heights
    const uniqueHeights = [...new Set(heights)];
    expect(uniqueHeights.length).toBeGreaterThan(1);
  });

  test('should scroll to specific index', async ({ page }) => {
    await page.goto('/iframe.html?id=sprint3-virtuallist--with-scroll-to-index');
    await page.waitForLoadState('networkidle');
    
    // Click scroll to middle button
    await page.click('button:has-text("Scroll to Middle")');
    await page.waitForTimeout(300);
    
    // Check if middle items are visible
    const visibleIndices = await page.locator('[data-index]').evaluateAll(
      elements => elements.map(el => parseInt(el.getAttribute('data-index') || '0'))
    );
    
    // Should have indices around 500 (middle of 1000 items)
    expect(Math.min(...visibleIndices)).toBeGreaterThan(490);
    expect(Math.max(...visibleIndices)).toBeLessThan(510);
  });

  test('should handle smooth scrolling', async ({ page }) => {
    const scrollContainer = page.locator('.overflow-auto').first();
    
    // Perform multiple quick scrolls
    for (let i = 0; i < 5; i++) {
      await scrollContainer.evaluate(el => el.scrollTop += 100);
      await page.waitForTimeout(50);
    }
    
    // Should still be responsive
    const items = await page.locator('[data-index]').count();
    expect(items).toBeGreaterThan(0);
  });

  test('should maintain scroll position on item updates', async ({ page }) => {
    await page.goto('/iframe.html?id=sprint3-virtuallist--chat-messages');
    await page.waitForLoadState('networkidle');
    
    const scrollContainer = page.locator('.overflow-auto').first();
    
    // Scroll to middle
    await scrollContainer.evaluate(el => el.scrollTop = el.scrollHeight / 2);
    const scrollPosBefore = await scrollContainer.evaluate(el => el.scrollTop);
    
    // Wait a bit
    await page.waitForTimeout(500);
    
    // Check scroll position is maintained
    const scrollPosAfter = await scrollContainer.evaluate(el => el.scrollTop);
    expect(Math.abs(scrollPosAfter - scrollPosBefore)).toBeLessThan(5);
  });

  test('should apply custom className', async ({ page }) => {
    await page.goto('/iframe.html?id=sprint3-virtuallist--data-table');
    await page.waitForLoadState('networkidle');
    
    const container = page.locator('.relative').first();
    const classes = await container.getAttribute('class');
    
    expect(classes).toContain('border');
    expect(classes).toContain('rounded-lg');
  });

  test('should handle empty list', async ({ page }) => {
    // Create empty list scenario
    await page.evaluate(() => {
      const event = new CustomEvent('updateStoryArgs', { 
        detail: { args: { items: [] } } 
      });
      window.dispatchEvent(event);
    });
    
    await page.waitForTimeout(200);
    
    const items = await page.locator('[data-index]').count();
    expect(items).toBe(0);
  });

  test('should support keyboard navigation', async ({ page }) => {
    const scrollContainer = page.locator('.overflow-auto').first();
    await scrollContainer.focus();
    
    // Press PageDown
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(200);
    
    const scrollPos1 = await scrollContainer.evaluate(el => el.scrollTop);
    expect(scrollPos1).toBeGreaterThan(0);
    
    // Press PageUp
    await page.keyboard.press('PageUp');
    await page.waitForTimeout(200);
    
    const scrollPos2 = await scrollContainer.evaluate(el => el.scrollTop);
    expect(scrollPos2).toBeLessThan(scrollPos1);
  });

  test('should handle rapid scrolling without breaking', async ({ page }) => {
    const scrollContainer = page.locator('.overflow-auto').first();
    
    // Rapidly scroll up and down
    for (let i = 0; i < 10; i++) {
      await scrollContainer.evaluate(el => {
        el.scrollTop = i % 2 === 0 ? 1000 : 0;
      });
      await page.waitForTimeout(10);
    }
    
    // Should still have items rendered
    const items = await page.locator('[data-index]').count();
    expect(items).toBeGreaterThan(0);
    
    // No console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(500);
    expect(consoleErrors).toHaveLength(0);
  });

  test('should calculate correct total height', async ({ page }) => {
    await page.goto('/iframe.html?id=sprint3-virtuallist--default');
    await page.waitForLoadState('networkidle');
    
    const scrollContainer = page.locator('.overflow-auto').first();
    const scrollHeight = await scrollContainer.evaluate(el => el.scrollHeight);
    
    // 1000 items * 60px = 60000px
    expect(scrollHeight).toBe(60000);
  });

  test('should respect overscan setting', async ({ page }) => {
    const items = await page.locator('[data-index]').evaluateAll(
      elements => elements.map(el => parseInt(el.getAttribute('data-index') || '0'))
    );
    
    if (items.length > 0) {
      const minIndex = Math.min(...items);
      const maxIndex = Math.max(...items);
      const range = maxIndex - minIndex + 1;
      
      // With overscan of 3 and ~7 visible items, should render ~13 items
      expect(range).toBeGreaterThanOrEqual(7);
      expect(range).toBeLessThanOrEqual(15);
    }
  });
});

test.describe('VirtualList Performance', () => {
  test('should handle 100k items', async ({ page }) => {
    await page.goto('/iframe.html?id=sprint3-virtuallist--default');
    
    // Inject 100k items
    await page.evaluate(() => {
      const items = Array.from({ length: 100000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        description: `Desc ${i}`,
        value: i
      }));
      
      const event = new CustomEvent('updateStoryArgs', { 
        detail: { args: { items } } 
      });
      window.dispatchEvent(event);
    });
    
    await page.waitForTimeout(500);
    
    // Should still only render visible items
    const visibleItems = await page.locator('[data-index]').count();
    expect(visibleItems).toBeLessThan(30);
    
    // Should be scrollable
    const scrollContainer = page.locator('.overflow-auto').first();
    const scrollHeight = await scrollContainer.evaluate(el => el.scrollHeight);
    expect(scrollHeight).toBeGreaterThan(1000000);
  });
});