import { test, expect } from '@playwright/test';

test.describe('InfiniteScroll Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=sprint3-infinitescroll--default');
    await page.waitForLoadState('networkidle');
  });

  test('should render initial items', async ({ page }) => {
    const items = page.locator('.border.rounded-lg.p-4');
    const count = await items.count();
    
    // Should have initial 20 items
    expect(count).toBe(20);
  });

  test('should load more items on scroll', async ({ page }) => {
    const scrollContainer = page.locator('.infinite-scroll-component').first();
    
    // Initial count
    let items = page.locator('.border.rounded-lg.p-4');
    const initialCount = await items.count();
    expect(initialCount).toBe(20);
    
    // Scroll to bottom
    await scrollContainer.evaluate(el => {
      el.scrollTop = el.scrollHeight;
    });
    
    // Wait for loading
    await page.waitForTimeout(1500);
    
    // Should have more items
    items = page.locator('.border.rounded-lg.p-4');
    const newCount = await items.count();
    expect(newCount).toBeGreaterThan(initialCount);
    expect(newCount).toBe(40); // 20 initial + 20 loaded
  });

  test('should show loading indicator', async ({ page }) => {
    const scrollContainer = page.locator('.infinite-scroll-component').first();
    
    // Scroll to trigger loading
    await scrollContainer.evaluate(el => {
      el.scrollTop = el.scrollHeight;
    });
    
    // Loading indicator should appear
    const loader = page.locator('.animate-spin').first();
    await expect(loader).toBeVisible();
    
    // Wait for loading to complete
    await page.waitForTimeout(1500);
    
    // Loader should disappear
    await expect(loader).not.toBeVisible();
  });

  test('should show end message when no more items', async ({ page }) => {
    const scrollContainer = page.locator('.infinite-scroll-component').first();
    
    // Load all items (scroll multiple times)
    for (let i = 0; i < 5; i++) {
      await scrollContainer.evaluate(el => {
        el.scrollTop = el.scrollHeight;
      });
      await page.waitForTimeout(1200);
    }
    
    // End message should appear
    const endMessage = page.locator('text=No more items to load');
    await expect(endMessage).toBeVisible();
  });

  test('should handle threshold correctly', async ({ page }) => {
    const scrollContainer = page.locator('.infinite-scroll-component').first();
    
    // Scroll to 70% (below default 80% threshold)
    await scrollContainer.evaluate(el => {
      el.scrollTop = el.scrollHeight * 0.7;
    });
    
    await page.waitForTimeout(500);
    
    // Should not trigger loading
    const loader = page.locator('.animate-spin');
    await expect(loader).not.toBeVisible();
    
    // Scroll to 85% (above threshold)
    await scrollContainer.evaluate(el => {
      el.scrollTop = el.scrollHeight * 0.85;
    });
    
    // Should trigger loading
    await expect(loader.first()).toBeVisible();
  });
});

test.describe('InfiniteScroll - Image Gallery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=sprint3-infinitescroll--image-gallery');
    await page.waitForLoadState('networkidle');
  });

  test('should render grid layout', async ({ page }) => {
    const grid = page.locator('.grid.grid-cols-3');
    await expect(grid).toBeVisible();
    
    const images = page.locator('.aspect-square');
    const count = await images.count();
    expect(count).toBe(12); // Initial 12 images
  });

  test('should load more images on scroll', async ({ page }) => {
    const scrollContainer = page.locator('.infinite-scroll-component').first();
    
    // Scroll to bottom
    await scrollContainer.evaluate(el => {
      el.scrollTop = el.scrollHeight;
    });
    
    await page.waitForTimeout(1000);
    
    const images = page.locator('.aspect-square');
    const count = await images.count();
    expect(count).toBe(24); // 12 + 12 new
  });

  test('should show custom end message', async ({ page }) => {
    const scrollContainer = page.locator('.infinite-scroll-component').first();
    
    // Load all images
    for (let i = 0; i < 5; i++) {
      await scrollContainer.evaluate(el => {
        el.scrollTop = el.scrollHeight;
      });
      await page.waitForTimeout(1000);
    }
    
    const endMessage = page.locator('text=You\'ve seen all images!');
    await expect(endMessage).toBeVisible();
  });
});

test.describe('InfiniteScroll - Chat Messages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=sprint3-infinitescroll--chat-messages');
    await page.waitForLoadState('networkidle');
  });

  test('should use inverse scroll', async ({ page }) => {
    // In inverse mode, scrolling up should load older messages
    const scrollContainer = page.locator('.infinite-scroll-component').first();
    
    // Initial messages
    const initialMessages = await page.locator('.rounded-lg').count();
    
    // Scroll to top (inverse mode)
    await scrollContainer.evaluate(el => {
      el.scrollTop = 0;
    });
    
    // Wait for loading
    await page.waitForTimeout(1200);
    
    // Should have more messages
    const newCount = await page.locator('.rounded-lg').count();
    expect(newCount).toBeGreaterThan(initialMessages);
  });

  test('should maintain message order', async ({ page }) => {
    const messages = page.locator('.rounded-lg');
    const firstMessage = await messages.first().textContent();
    
    // Load older messages
    const scrollContainer = page.locator('.infinite-scroll-component').first();
    await scrollContainer.evaluate(el => {
      el.scrollTop = 0;
    });
    
    await page.waitForTimeout(1200);
    
    // Original first message should not be first anymore
    const newFirstMessage = await messages.first().textContent();
    expect(newFirstMessage).not.toBe(firstMessage);
  });
});

test.describe('InfiniteScroll - Pull to Refresh', () => {
  test('should show pull to refresh indicator', async ({ page }) => {
    await page.goto('/iframe.html?id=sprint3-infinitescroll--with-pull-to-refresh');
    await page.waitForLoadState('networkidle');
    
    // Check for pull to refresh instruction
    const instruction = page.locator('text=Pull down to refresh');
    await expect(instruction).toBeVisible();
  });

  test('should handle touch gestures', async ({ page }) => {
    await page.goto('/iframe.html?id=sprint3-infinitescroll--with-pull-to-refresh');
    await page.waitForLoadState('networkidle');
    
    const scrollContainer = page.locator('.infinite-scroll-component').first();
    
    // Simulate pull down gesture
    await scrollContainer.dispatchEvent('touchstart', {
      touches: [{ pageY: 100 }]
    });
    
    await scrollContainer.dispatchEvent('touchmove', {
      touches: [{ pageY: 200 }]
    });
    
    await scrollContainer.dispatchEvent('touchend');
    
    // Component should handle the gesture without errors
    const items = page.locator('.border.rounded-lg.p-4');
    await expect(items.first()).toBeVisible();
  });
});

test.describe('InfiniteScroll - Product Grid', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=sprint3-infinitescroll--product-grid');
    await page.waitForLoadState('networkidle');
  });

  test('should render product grid', async ({ page }) => {
    const grid = page.locator('.grid.grid-cols-4');
    await expect(grid).toBeVisible();
    
    const products = page.locator('.border.rounded-lg.p-4');
    const count = await products.count();
    expect(count).toBe(12);
  });

  test('should show product details', async ({ page }) => {
    const product = page.locator('.border.rounded-lg.p-4').first();
    
    // Check for product elements
    const name = product.locator('.font-semibold');
    const price = product.locator('.text-blue-600');
    const rating = product.locator('text=/⭐/');
    
    await expect(name).toBeVisible();
    await expect(price).toBeVisible();
    await expect(rating).toBeVisible();
  });

  test('should load more products', async ({ page }) => {
    const scrollContainer = page.locator('.infinite-scroll-component').first();
    
    await scrollContainer.evaluate(el => {
      el.scrollTop = el.scrollHeight;
    });
    
    await page.waitForTimeout(1500);
    
    const products = page.locator('.border.rounded-lg.p-4');
    const count = await products.count();
    expect(count).toBe(24); // 12 + 12
  });
});

test.describe('InfiniteScroll - News Feed', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=sprint3-infinitescroll--news-feed');
    await page.waitForLoadState('networkidle');
  });

  test('should render news articles', async ({ page }) => {
    const articles = page.locator('article');
    const count = await articles.count();
    expect(count).toBe(10);
    
    // Check article structure
    const firstArticle = articles.first();
    const title = firstArticle.locator('.text-lg.font-semibold');
    const summary = firstArticle.locator('.text-gray-600');
    const meta = firstArticle.locator('.text-gray-500');
    
    await expect(title).toBeVisible();
    await expect(summary).toBeVisible();
    await expect(meta).toBeVisible();
  });

  test('should show custom end content', async ({ page }) => {
    const scrollContainer = page.locator('.infinite-scroll-component').first();
    
    // Load all articles
    for (let i = 0; i < 4; i++) {
      await scrollContainer.evaluate(el => {
        el.scrollTop = el.scrollHeight;
      });
      await page.waitForTimeout(1000);
    }
    
    // Check for custom end content
    const endMessage = page.locator('text=You\'re all caught up!');
    const refreshButton = page.locator('button:has-text("Refresh Feed")');
    
    await expect(endMessage).toBeVisible();
    await expect(refreshButton).toBeVisible();
  });
});

test.describe('InfiniteScroll Performance', () => {
  test('should handle rapid scrolling', async ({ page }) => {
    await page.goto('/iframe.html?id=sprint3-infinitescroll--default');
    await page.waitForLoadState('networkidle');
    
    const scrollContainer = page.locator('.infinite-scroll-component').first();
    
    // Rapidly scroll up and down
    for (let i = 0; i < 10; i++) {
      await scrollContainer.evaluate(el => {
        el.scrollTop = i % 2 === 0 ? el.scrollHeight : 0;
      });
      await page.waitForTimeout(50);
    }
    
    // Should still be functional
    const items = page.locator('.border.rounded-lg.p-4');
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(20);
  });

  test('should not load duplicates', async ({ page }) => {
    await page.goto('/iframe.html?id=sprint3-infinitescroll--default');
    await page.waitForLoadState('networkidle');
    
    const scrollContainer = page.locator('.infinite-scroll-component').first();
    
    // Get initial item texts
    const initialTexts = await page.locator('.font-semibold').allTextContents();
    
    // Trigger loading
    await scrollContainer.evaluate(el => {
      el.scrollTop = el.scrollHeight;
    });
    
    await page.waitForTimeout(1500);
    
    // Get all item texts
    const allTexts = await page.locator('.font-semibold').allTextContents();
    
    // Check for duplicates
    const uniqueTexts = [...new Set(allTexts)];
    expect(uniqueTexts.length).toBe(allTexts.length);
  });

  test('should handle scroll position correctly', async ({ page }) => {
    await page.goto('/iframe.html?id=sprint3-infinitescroll--default');
    await page.waitForLoadState('networkidle');
    
    const scrollContainer = page.locator('.infinite-scroll-component').first();
    
    // Scroll to specific position
    await scrollContainer.evaluate(el => {
      el.scrollTop = 500;
    });
    
    const scrollPos1 = await scrollContainer.evaluate(el => el.scrollTop);
    
    // Wait a bit
    await page.waitForTimeout(500);
    
    // Position should be maintained
    const scrollPos2 = await scrollContainer.evaluate(el => el.scrollTop);
    expect(Math.abs(scrollPos2 - scrollPos1)).toBeLessThan(5);
  });
});