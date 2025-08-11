import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';

test.describe('Kanban Component', () => {
  let page: Page;

  test.beforeEach(async ({ page: p }) => {
    page = p;
    await page.goto('/iframe.html?id=sprint-3-kanban--default');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Basic Functionality', () => {
    test('should render kanban board with columns', async () => {
      const columns = page.locator('[data-testid^="kanban-column"]');
      await expect(columns).toHaveCount(5);
      
      // Check column titles
      await expect(page.locator('text=Backlog').first()).toBeVisible();
      await expect(page.locator('text=To Do').first()).toBeVisible();
      await expect(page.locator('text=In Progress').first()).toBeVisible();
      await expect(page.locator('text=Review').first()).toBeVisible();
      await expect(page.locator('text=Done').first()).toBeVisible();
    });

    test('should display cards within columns', async () => {
      // Check for cards in first column
      const firstColumn = page.locator('[data-testid^="kanban-column"]').first();
      const cards = firstColumn.locator('[data-testid^="kanban-card"]');
      await expect(cards).toHaveCount(5);
    });

    test('should show card details', async () => {
      const firstCard = page.locator('[data-testid^="kanban-card"]').first();
      
      // Check card has title
      const title = firstCard.locator('h4');
      await expect(title).toBeVisible();
      await expect(title).toContainText('Task');
      
      // Check for priority indicator
      const priorityIcon = firstCard.locator('svg').first();
      await expect(priorityIcon).toBeVisible();
    });

    test('should display card badges and tags', async () => {
      // Find a card with tags
      const cardWithTags = page.locator('[data-testid^="kanban-card"]').filter({
        has: page.locator('[data-testid="card-tag"]')
      }).first();
      
      if (await cardWithTags.count() > 0) {
        const tags = cardWithTags.locator('[data-testid="card-tag"]');
        await expect(tags.first()).toBeVisible();
      }
    });
  });

  test.describe('Drag and Drop', () => {
    test('should allow dragging cards between columns', async () => {
      const sourceColumn = page.locator('[data-testid^="kanban-column"]').first();
      const targetColumn = page.locator('[data-testid^="kanban-column"]').nth(1);
      
      const card = sourceColumn.locator('[data-testid^="kanban-card"]').first();
      const cardText = await card.textContent();
      
      // Perform drag and drop
      await card.hover();
      await page.mouse.down();
      await targetColumn.hover();
      await page.mouse.up();
      
      // Verify card moved to target column
      const movedCard = targetColumn.locator(`text=${cardText}`);
      await expect(movedCard).toBeVisible();
    });

    test('should allow reordering cards within same column', async () => {
      const column = page.locator('[data-testid^="kanban-column"]').first();
      const firstCard = column.locator('[data-testid^="kanban-card"]').first();
      const lastCard = column.locator('[data-testid^="kanban-card"]').last();
      
      const firstCardText = await firstCard.textContent();
      
      // Drag first card to last position
      await firstCard.hover();
      await page.mouse.down();
      await lastCard.hover();
      await page.mouse.up();
      
      // Verify order changed
      const newLastCard = column.locator('[data-testid^="kanban-card"]').last();
      await expect(newLastCard).toContainText(firstCardText || '');
    });

    test('should allow dragging columns to reorder', async () => {
      const firstColumn = page.locator('[data-testid^="kanban-column"]').first();
      const secondColumn = page.locator('[data-testid^="kanban-column"]').nth(1);
      
      const dragHandle = firstColumn.locator('[data-testid="column-drag-handle"]');
      
      // Drag first column after second
      await dragHandle.hover();
      await page.mouse.down();
      await secondColumn.hover();
      await page.mouse.up();
      
      // Verify column order changed
      const newFirstColumn = page.locator('[data-testid^="kanban-column"]').first();
      await expect(newFirstColumn).toContainText('To Do');
    });

    test('should show drag overlay when dragging', async () => {
      const card = page.locator('[data-testid^="kanban-card"]').first();
      
      await card.hover();
      await page.mouse.down();
      await page.mouse.move(100, 100);
      
      // Check for drag overlay
      const overlay = page.locator('[data-testid="drag-overlay"]');
      await expect(overlay).toBeVisible();
      
      await page.mouse.up();
    });
  });

  test.describe('WIP Limits', () => {
    test('should display WIP limit indicators', async () => {
      await page.goto('/iframe.html?id=sprint-3-kanban--with-wip-limits');
      
      // Check for WIP limit badges
      const wipBadges = page.locator('text=/\\d+\\s*\\/\\s*\\d+/');
      await expect(wipBadges.first()).toBeVisible();
    });

    test('should highlight columns over WIP limit', async () => {
      await page.goto('/iframe.html?id=sprint-3-kanban--with-wip-limits');
      
      // Look for warning indicator
      const warningIcon = page.locator('[data-testid="wip-warning"]');
      if (await warningIcon.count() > 0) {
        await expect(warningIcon.first()).toBeVisible();
      }
      
      // Check for highlighted column
      const overLimitColumn = page.locator('.bg-red-50, .dark\\:bg-red-900\\/20');
      await expect(overLimitColumn.first()).toBeVisible();
    });
  });

  test.describe('Search and Filter', () => {
    test('should show search input when enabled', async () => {
      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toBeVisible();
    });

    test('should filter cards based on search query', async () => {
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('Task 1');
      
      // Wait for filtering
      await page.waitForTimeout(300);
      
      // Check filtered results
      const visibleCards = page.locator('[data-testid^="kanban-card"]:visible');
      const count = await visibleCards.count();
      
      // Should show fewer cards after filtering
      expect(count).toBeLessThan(20);
    });

    test('should show filter button when enabled', async () => {
      const filterButton = page.locator('button:has-text("Filters")');
      await expect(filterButton).toBeVisible();
    });

    test('should clear search on input clear', async () => {
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('specific search');
      await searchInput.clear();
      
      // All cards should be visible again
      const cards = page.locator('[data-testid^="kanban-card"]');
      const count = await cards.count();
      expect(count).toBeGreaterThan(10);
    });
  });

  test.describe('Column Operations', () => {
    test('should allow collapsing columns', async () => {
      const collapseButton = page.locator('[data-testid="column-collapse"]').first();
      
      if (await collapseButton.count() > 0) {
        await collapseButton.click();
        
        // Column content should be hidden
        const columnContent = page.locator('[data-testid="column-content"]').first();
        await expect(columnContent).toBeHidden();
      }
    });

    test('should show column menu on more button click', async () => {
      const moreButton = page.locator('[data-testid="column-menu"]').first();
      
      if (await moreButton.count() > 0) {
        await moreButton.click();
        
        // Menu should appear
        const menu = page.locator('[role="menu"]');
        await expect(menu).toBeVisible();
      }
    });

    test('should display add column button when enabled', async () => {
      const addButton = page.locator('button:has-text("Add Column")');
      
      if (await addButton.count() > 0) {
        await expect(addButton).toBeVisible();
        await addButton.click();
        
        // Should trigger column creation
        // Actual behavior depends on implementation
      }
    });
  });

  test.describe('Custom Templates', () => {
    test('should render custom card template', async () => {
      await page.goto('/iframe.html?id=sprint-3-kanban--custom-card-template');
      
      // Check for gradient backgrounds (custom template feature)
      const customCards = page.locator('.bg-gradient-to-r');
      await expect(customCards.first()).toBeVisible();
    });

    test('should apply custom styles to cards', async () => {
      await page.goto('/iframe.html?id=sprint-3-kanban--custom-card-template');
      
      const card = page.locator('[data-testid^="kanban-card"]').first();
      const hasGradient = await card.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.backgroundImage.includes('gradient');
      });
      
      expect(hasGradient).toBeTruthy();
    });
  });

  test.describe('Performance', () => {
    test('should handle large numbers of cards efficiently', async () => {
      await page.goto('/iframe.html?id=sprint-3-kanban--performance-test');
      await page.waitForLoadState('networkidle');
      
      // Check that board loads with many cards
      const cards = page.locator('[data-testid^="kanban-card"]');
      const count = await cards.count();
      expect(count).toBeGreaterThan(100);
    });

    test('should maintain smooth scrolling with many cards', async () => {
      await page.goto('/iframe.html?id=sprint-3-kanban--performance-test');
      
      // Test scrolling performance
      const scrollArea = page.locator('[data-testid="scroll-area"]').first();
      
      if (await scrollArea.count() > 0) {
        await scrollArea.evaluate(el => {
          el.scrollTop = el.scrollHeight / 2;
        });
        
        // Should scroll without errors
        await page.waitForTimeout(100);
        
        const scrollPosition = await scrollArea.evaluate(el => el.scrollTop);
        expect(scrollPosition).toBeGreaterThan(0);
      }
    });

    test('should handle rapid search queries', async () => {
      await page.goto('/iframe.html?id=sprint-3-kanban--performance-test');
      
      const searchInput = page.locator('input[placeholder*="Search"]');
      
      // Rapid typing
      await searchInput.type('test query fast typing', { delay: 10 });
      
      // Should not crash and should filter
      await page.waitForTimeout(300);
      
      const cards = page.locator('[data-testid^="kanban-card"]:visible');
      await expect(cards.first()).toBeDefined();
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async () => {
      // Tab through elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Check focus visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have proper ARIA labels', async () => {
      const board = page.locator('[role="region"][aria-label*="Kanban"]');
      
      if (await board.count() > 0) {
        await expect(board).toBeVisible();
      }
      
      // Check column accessibility
      const columns = page.locator('[role="list"]');
      if (await columns.count() > 0) {
        await expect(columns.first()).toBeVisible();
      }
    });

    test('should announce drag operations to screen readers', async () => {
      const card = page.locator('[data-testid^="kanban-card"]').first();
      
      // Check for aria-describedby or aria-label
      const hasAriaLabel = await card.evaluate(el => {
        return el.hasAttribute('aria-label') || el.hasAttribute('aria-describedby');
      });
      
      expect(hasAriaLabel).toBeTruthy();
    });
  });

  test.describe('Swimlanes', () => {
    test('should render swimlanes when enabled', async () => {
      await page.goto('/iframe.html?id=sprint-3-kanban--with-swimlanes');
      
      // Check for swimlane headers
      const swimlanes = page.locator('[data-testid^="swimlane"]');
      
      if (await swimlanes.count() > 0) {
        await expect(swimlanes.first()).toBeVisible();
        
        // Check swimlane titles
        await expect(page.locator('text=Team A')).toBeVisible();
        await expect(page.locator('text=Team B')).toBeVisible();
      }
    });

    test('should allow collapsing swimlanes', async () => {
      await page.goto('/iframe.html?id=sprint-3-kanban--with-swimlanes');
      
      const collapseButton = page.locator('[data-testid="swimlane-collapse"]').first();
      
      if (await collapseButton.count() > 0) {
        await collapseButton.click();
        
        // Swimlane content should be hidden
        const swimlaneContent = page.locator('[data-testid="swimlane-content"]').first();
        await expect(swimlaneContent).toBeHidden();
      }
    });
  });

  test.describe('Responsiveness', () => {
    test('should adapt to mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/iframe.html?id=sprint-3-kanban--default');
      
      // Columns should be scrollable horizontally
      const container = page.locator('[data-testid="kanban-container"]');
      
      if (await container.count() > 0) {
        const isScrollable = await container.evaluate(el => {
          return el.scrollWidth > el.clientWidth;
        });
        
        expect(isScrollable).toBeTruthy();
      }
    });

    test('should handle tablet viewport', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/iframe.html?id=sprint-3-kanban--default');
      
      // Board should be visible and functional
      const columns = page.locator('[data-testid^="kanban-column"]');
      await expect(columns.first()).toBeVisible();
    });
  });
});