import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const COMPONENT_NAME = 'DragDropGrid';
const STORIES_URL = `http://localhost:6006/?path=/story/components-dragdropgrid`;

async function dragAndDrop(page: Page, sourceSelector: string, targetSelector: string) {
  const source = page.locator(sourceSelector).first();
  const target = page.locator(targetSelector).first();
  
  await source.hover();
  await page.mouse.down();
  await target.hover();
  await page.mouse.up();
}

test.describe('DragDropGrid Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${STORIES_URL}--default`);
    await page.waitForSelector('[role="grid"]', { timeout: 10000 });
  });

  test('should render grid with correct number of items', async ({ page }) => {
    const grid = page.locator('[role="grid"]');
    await expect(grid).toBeVisible();
    
    const items = page.locator('[role="gridcell"]');
    await expect(items).toHaveCount(6);
  });

  test('should display items in grid layout with correct columns', async ({ page }) => {
    const grid = page.locator('[role="grid"]');
    const style = await grid.getAttribute('style');
    
    expect(style).toContain('grid-template-columns: repeat(3, 1fr)');
    expect(style).toContain('gap: 16px');
  });

  test('should allow dragging and dropping items', async ({ page }) => {
    const firstItem = page.locator('[role="gridcell"]').first();
    const lastItem = page.locator('[role="gridcell"]').last();
    
    const initialFirstText = await firstItem.textContent();
    const initialLastText = await lastItem.textContent();
    
    // Drag first item to last position
    await dragAndDrop(page, '[role="gridcell"]:first-child', '[role="gridcell"]:last-child');
    
    // Wait for animation
    await page.waitForTimeout(300);
    
    // Check if order changed
    const newFirstText = await page.locator('[role="gridcell"]').first().textContent();
    const newLastText = await page.locator('[role="gridcell"]').last().textContent();
    
    expect(newFirstText).not.toBe(initialFirstText);
    expect(newLastText).toBe(initialFirstText);
  });

  test('should show drag handle when enabled', async ({ page }) => {
    const dragHandles = page.locator('[aria-label="Drag handle"]');
    await expect(dragHandles.first()).toBeVisible();
    
    const handleCount = await dragHandles.count();
    expect(handleCount).toBe(6);
  });

  test('should apply dragging styles during drag', async ({ page }) => {
    const firstItem = page.locator('[role="gridcell"]').first();
    
    await firstItem.hover();
    await page.mouse.down();
    
    // Check if dragging class is applied
    await expect(firstItem).toHaveClass(/opacity-50/);
    
    await page.mouse.up();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    const firstItem = page.locator('[role="gridcell"]').first();
    const secondItem = page.locator('[role="gridcell"]').nth(1);
    
    // Focus first item
    await firstItem.focus();
    await expect(firstItem).toBeFocused();
    
    // Navigate with arrow keys
    await page.keyboard.press('ArrowRight');
    await expect(secondItem).toBeFocused();
    
    await page.keyboard.press('ArrowLeft');
    await expect(firstItem).toBeFocused();
    
    await page.keyboard.press('ArrowDown');
    const fourthItem = page.locator('[role="gridcell"]').nth(3);
    await expect(fourthItem).toBeFocused();
  });

  test('should support keyboard reordering with Ctrl/Cmd + Arrow keys', async ({ page }) => {
    const firstItem = page.locator('[role="gridcell"]').first();
    
    await firstItem.focus();
    const initialFirstText = await firstItem.textContent();
    
    // Move item with Ctrl+Arrow
    await page.keyboard.press('Control+ArrowRight');
    await page.waitForTimeout(300);
    
    const newFirstText = await page.locator('[role="gridcell"]').first().textContent();
    expect(newFirstText).not.toBe(initialFirstText);
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    const grid = page.locator('[role="grid"]');
    await expect(grid).toHaveAttribute('aria-label', 'Drag and drop grid');
    
    const items = page.locator('[role="gridcell"]');
    const firstItem = items.first();
    
    await expect(firstItem).toHaveAttribute('aria-grabbed', 'false');
    await expect(firstItem).toHaveAttribute('aria-disabled', 'false');
    await expect(firstItem).toHaveAttribute('tabindex', '0');
  });

  test('should handle disabled items correctly', async ({ page }) => {
    await page.goto(`${STORIES_URL}--with-disabled-items`);
    await page.waitForSelector('[role="grid"]');
    
    const disabledItems = page.locator('[aria-disabled="true"]');
    await expect(disabledItems).toHaveCount(2);
    
    const disabledItem = disabledItems.first();
    await expect(disabledItem).toHaveClass(/opacity-50/);
    await expect(disabledItem).toHaveAttribute('tabindex', '-1');
    
    // Try to drag disabled item (should not work)
    const initialPosition = await disabledItem.boundingBox();
    await dragAndDrop(page, '[aria-disabled="true"]:first-of-type', '[role="gridcell"]:last-child');
    await page.waitForTimeout(300);
    
    const newPosition = await disabledItem.boundingBox();
    expect(newPosition?.x).toBe(initialPosition?.x);
    expect(newPosition?.y).toBe(initialPosition?.y);
  });

  test('should work with single column layout', async ({ page }) => {
    await page.goto(`${STORIES_URL}--single-column`);
    await page.waitForSelector('[role="grid"]');
    
    const grid = page.locator('[role="grid"]');
    const style = await grid.getAttribute('style');
    
    expect(style).toContain('grid-template-columns: repeat(1, 1fr)');
    
    const items = page.locator('[role="gridcell"]');
    await expect(items).toHaveCount(4);
    
    // Test vertical dragging with y-axis lock
    const firstItem = items.first();
    const secondItem = items.nth(1);
    
    await dragAndDrop(page, '[role="gridcell"]:first-child', '[role="gridcell"]:nth-child(2)');
    await page.waitForTimeout(300);
    
    // Items should have swapped
    const newFirstText = await page.locator('[role="gridcell"]').first().textContent();
    const initialFirstText = await firstItem.textContent();
    expect(newFirstText).not.toBe(initialFirstText);
  });

  test('should render card grid layout', async ({ page }) => {
    await page.goto(`${STORIES_URL}--card-grid`);
    await page.waitForSelector('[role="grid"]');
    
    const cards = page.locator('[role="gridcell"] .rounded-lg');
    await expect(cards).toHaveCount(4);
    
    // Check card content structure
    const firstCard = cards.first();
    await expect(firstCard.locator('h3')).toBeVisible();
    await expect(firstCard.locator('.text-sm')).toBeVisible();
  });

  test('should handle image gallery layout', async ({ page }) => {
    await page.goto(`${STORIES_URL}--image-gallery`);
    await page.waitForSelector('[role="grid"]');
    
    const images = page.locator('[role="gridcell"] .aspect-square');
    await expect(images).toHaveCount(6);
    
    // Check hover effects
    const firstImage = images.first();
    await firstImage.hover();
    
    const overlay = firstImage.locator('.bg-black\\/50');
    await expect(overlay).toBeVisible();
  });

  test('should support responsive grid columns', async ({ page }) => {
    await page.goto(`${STORIES_URL}--responsive-grid`);
    await page.waitForSelector('[role="grid"]');
    
    // Test different viewport sizes
    await page.setViewportSize({ width: 1440, height: 900 });
    let grid = page.locator('[role="grid"]');
    let style = await grid.getAttribute('style');
    expect(style).toContain('grid-template-columns');
    
    await page.setViewportSize({ width: 768, height: 1024 });
    grid = page.locator('[role="grid"]');
    style = await grid.getAttribute('style');
    expect(style).toContain('grid-template-columns');
    
    await page.setViewportSize({ width: 375, height: 667 });
    grid = page.locator('[role="grid"]');
    style = await grid.getAttribute('style');
    expect(style).toContain('grid-template-columns');
  });

  test('should emit correct events during drag operations', async ({ page }) => {
    // Check for action feedback
    const actionFeedback = page.locator('.bg-blue-50');
    
    const firstItem = page.locator('[role="gridcell"]').first();
    await firstItem.hover();
    await page.mouse.down();
    
    // Should show drag start message
    await expect(actionFeedback).toContainText('Started dragging');
    
    await page.mouse.up();
    
    // Should show drag end message
    await expect(actionFeedback).toContainText('Finished dragging');
  });

  test('should maintain focus after reordering', async ({ page }) => {
    const firstItem = page.locator('[role="gridcell"]').first();
    
    await firstItem.focus();
    await expect(firstItem).toBeFocused();
    
    // Reorder with keyboard
    await page.keyboard.press('Control+ArrowRight');
    await page.waitForTimeout(300);
    
    // Focus should follow the moved item
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    await expect(focusedElement).toHaveAttribute('role', 'gridcell');
  });

  test('should handle rapid drag operations', async ({ page }) => {
    const items = page.locator('[role="gridcell"]');
    
    // Perform multiple rapid drags
    for (let i = 0; i < 3; i++) {
      await dragAndDrop(page, '[role="gridcell"]:first-child', '[role="gridcell"]:last-child');
      await page.waitForTimeout(100);
    }
    
    // Grid should still be functional
    await expect(items).toHaveCount(6);
    const grid = page.locator('[role="grid"]');
    await expect(grid).toBeVisible();
  });
});
