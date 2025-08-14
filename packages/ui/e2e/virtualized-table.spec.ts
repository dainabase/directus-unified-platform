import { test, expect } from '@playwright/test';

test.describe('Virtualized Table Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the component test page
    await page.goto('/virtualized-table');
  });

  test('should render the virtualized table', async ({ page }) => {
    // Check if the table container is present
    const table = await page.locator('[data-testid="virtualized-table"]');
    await expect(table).toBeVisible();
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    // Load a large dataset (10000 rows)
    await page.click('[data-testid="load-large-dataset"]');
    
    // Check that only visible rows are rendered (virtualization)
    const visibleRows = await page.locator('[data-testid="table-row"]').count();
    expect(visibleRows).toBeLessThan(50); // Should only render visible rows
    
    // Check performance metrics
    const renderTime = await page.evaluate(() => {
      return performance.getEntriesByType('measure')[0]?.duration || 0;
    });
    expect(renderTime).toBeLessThan(100); // Should render in less than 100ms
  });

  test('should support sorting', async ({ page }) => {
    // Click on column header to sort
    await page.click('[data-testid="column-header-name"]');
    
    // Verify sort indicator appears
    const sortIndicator = await page.locator('[data-testid="sort-indicator-asc"]');
    await expect(sortIndicator).toBeVisible();
    
    // Click again for descending sort
    await page.click('[data-testid="column-header-name"]');
    const sortDescIndicator = await page.locator('[data-testid="sort-indicator-desc"]');
    await expect(sortDescIndicator).toBeVisible();
  });

  test('should support filtering', async ({ page }) => {
    // Type in filter input
    await page.fill('[data-testid="filter-input"]', 'test');
    
    // Wait for filtered results
    await page.waitForTimeout(300); // Debounce delay
    
    // Check that filtered results are shown
    const rows = await page.locator('[data-testid="table-row"]').count();
    expect(rows).toBeGreaterThan(0);
    
    // Verify all visible rows contain the filter text
    const firstRowText = await page.locator('[data-testid="table-row"]').first().textContent();
    expect(firstRowText?.toLowerCase()).toContain('test');
  });

  test('should support column resizing', async ({ page }) => {
    // Get initial column width
    const column = await page.locator('[data-testid="column-header-name"]');
    const initialWidth = await column.evaluate(el => el.getBoundingClientRect().width);
    
    // Drag resize handle
    const resizeHandle = await page.locator('[data-testid="resize-handle-name"]');
    await resizeHandle.hover();
    await page.mouse.down();
    await page.mouse.move(100, 0);
    await page.mouse.up();
    
    // Check new width
    const newWidth = await column.evaluate(el => el.getBoundingClientRect().width);
    expect(newWidth).toBeGreaterThan(initialWidth);
  });

  test('should support row selection', async ({ page }) => {
    // Click checkbox to select row
    await page.click('[data-testid="row-checkbox-0"]');
    
    // Verify row is selected
    const selectedRow = await page.locator('[data-testid="table-row-0"][data-selected="true"]');
    await expect(selectedRow).toBeVisible();
    
    // Select all rows
    await page.click('[data-testid="select-all-checkbox"]');
    const selectedRows = await page.locator('[data-selected="true"]').count();
    expect(selectedRows).toBeGreaterThan(1);
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Focus first cell
    await page.click('[data-testid="table-cell-0-0"]');
    
    // Navigate with arrow keys
    await page.keyboard.press('ArrowDown');
    const focusedCell = await page.locator(':focus');
    await expect(focusedCell).toHaveAttribute('data-testid', 'table-cell-1-0');
    
    // Navigate right
    await page.keyboard.press('ArrowRight');
    const focusedCellRight = await page.locator(':focus');
    await expect(focusedCellRight).toHaveAttribute('data-testid', 'table-cell-1-1');
  });

  test('should support infinite scrolling', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => {
      const container = document.querySelector('[data-testid="table-container"]');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
    
    // Wait for new data to load
    await page.waitForTimeout(500);
    
    // Check that more rows are loaded
    const rowCount = await page.locator('[data-testid="table-row"]').count();
    expect(rowCount).toBeGreaterThan(20);
  });

  test('should be accessible', async ({ page }) => {
    // Run accessibility audit
    const violations = await page.evaluate(async () => {
      // @ts-ignore - axe is injected
      const results = await axe.run();
      return results.violations;
    });
    
    expect(violations).toHaveLength(0);
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Trigger an error condition
    await page.click('[data-testid="trigger-error"]');
    
    // Check error message is displayed
    const errorMessage = await page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Unable to load data');
    
    // Retry button should be visible
    const retryButton = await page.locator('[data-testid="retry-button"]');
    await expect(retryButton).toBeVisible();
  });
});
