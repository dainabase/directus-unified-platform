import { test, expect } from '@playwright/test';

test.describe('DataGrid Component E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=components-data-grid--default');
  });

  test('should render data grid with columns and rows', async ({ page }) => {
    // Check table exists
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check headers
    const headers = page.locator('thead th');
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThan(0);

    // Check rows
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should handle sorting', async ({ page }) => {
    // Click on sortable column header
    const sortableHeader = page.locator('th button').first();
    await sortableHeader.click();

    // Get first cell value before and after sorting
    const firstCell = page.locator('tbody tr:first-child td').nth(1);
    const initialValue = await firstCell.textContent();

    // Click again to reverse sort
    await sortableHeader.click();
    const newValue = await firstCell.textContent();

    // Values should be different after sorting
    expect(initialValue).not.toBe(newValue);
  });

  test('should handle filtering', async ({ page }) => {
    // Get initial row count
    const initialRows = await page.locator('tbody tr').count();

    // Apply filter
    const filterInput = page.locator('input[placeholder*="Search"]');
    await filterInput.fill('test');

    // Wait for filtering to apply
    await page.waitForTimeout(500);

    // Check row count changed
    const filteredRows = await page.locator('tbody tr').count();
    expect(filteredRows).toBeLessThanOrEqual(initialRows);
  });

  test('should handle pagination', async ({ page }) => {
    await page.goto('/iframe.html?id=components-data-grid--with-pagination');

    // Check pagination controls exist
    const prevButton = page.locator('button:has-text("Previous")');
    const nextButton = page.locator('button:has-text("Next")');

    await expect(prevButton).toBeVisible();
    await expect(nextButton).toBeVisible();

    // Initially previous should be disabled
    await expect(prevButton).toBeDisabled();

    // Get first row content
    const firstRowInitial = await page.locator('tbody tr:first-child').textContent();

    // Go to next page
    await nextButton.click();

    // First row should be different
    const firstRowNext = await page.locator('tbody tr:first-child').textContent();
    expect(firstRowInitial).not.toBe(firstRowNext);

    // Previous should now be enabled
    await expect(prevButton).not.toBeDisabled();

    // Go back
    await prevButton.click();

    // Should be back to original first row
    const firstRowBack = await page.locator('tbody tr:first-child').textContent();
    expect(firstRowBack).toBe(firstRowInitial);
  });

  test('should handle row selection', async ({ page }) => {
    await page.goto('/iframe.html?id=components-data-grid--with-selection');

    // Check select all checkbox
    const selectAll = page.locator('thead input[type="checkbox"]');
    await expect(selectAll).toBeVisible();

    // Select all
    await selectAll.check();

    // All row checkboxes should be checked
    const rowCheckboxes = page.locator('tbody input[type="checkbox"]');
    const checkboxCount = await rowCheckboxes.count();
    
    for (let i = 0; i < checkboxCount; i++) {
      await expect(rowCheckboxes.nth(i)).toBeChecked();
    }

    // Unselect all
    await selectAll.uncheck();

    // All should be unchecked
    for (let i = 0; i < checkboxCount; i++) {
      await expect(rowCheckboxes.nth(i)).not.toBeChecked();
    }

    // Select individual row
    await rowCheckboxes.first().check();
    await expect(rowCheckboxes.first()).toBeChecked();

    // Selection count should update
    const selectionText = page.locator('text=/1.*selected/');
    await expect(selectionText).toBeVisible();
  });

  test('should handle column visibility toggle', async ({ page }) => {
    // Open column visibility menu
    const columnButton = page.locator('button:has-text("Columns")');
    await columnButton.click();

    // Get initial column count
    const initialColumns = await page.locator('thead th').count();

    // Toggle a column off
    const columnToggle = page.locator('[role="menuitemcheckbox"]').first();
    await columnToggle.click();

    // Column count should decrease
    const newColumns = await page.locator('thead th').count();
    expect(newColumns).toBe(initialColumns - 1);
  });
});