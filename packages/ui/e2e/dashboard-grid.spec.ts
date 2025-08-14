import { test, expect } from '@playwright/test';

test.describe('Dashboard Grid Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard-grid');
  });

  test('should render the dashboard grid layout', async ({ page }) => {
    const grid = await page.locator('[data-testid="dashboard-grid"]');
    await expect(grid).toBeVisible();
    
    // Check for grid items
    const gridItems = await page.locator('[data-testid="grid-item"]');
    await expect(gridItems).toHaveCount(6); // Default dashboard with 6 widgets
  });

  test('should support drag and drop to reorder widgets', async ({ page }) => {
    // Get initial positions
    const firstWidget = await page.locator('[data-testid="grid-item-0"]');
    const secondWidget = await page.locator('[data-testid="grid-item-1"]');
    
    const firstPosition = await firstWidget.boundingBox();
    const secondPosition = await secondWidget.boundingBox();
    
    // Drag first widget to second position
    await firstWidget.dragTo(secondWidget);
    
    // Wait for animation
    await page.waitForTimeout(300);
    
    // Verify positions have swapped
    const newFirstPosition = await firstWidget.boundingBox();
    const newSecondPosition = await secondWidget.boundingBox();
    
    expect(newFirstPosition?.x).toBeCloseTo(secondPosition?.x || 0, 0);
    expect(newSecondPosition?.x).toBeCloseTo(firstPosition?.x || 0, 0);
  });

  test('should support resizing widgets', async ({ page }) => {
    const widget = await page.locator('[data-testid="grid-item-0"]');
    const resizeHandle = await page.locator('[data-testid="resize-handle-0"]');
    
    // Get initial size
    const initialSize = await widget.boundingBox();
    
    // Resize widget
    await resizeHandle.hover();
    await page.mouse.down();
    await page.mouse.move(100, 100);
    await page.mouse.up();
    
    // Get new size
    const newSize = await widget.boundingBox();
    
    expect(newSize?.width).toBeGreaterThan(initialSize?.width || 0);
    expect(newSize?.height).toBeGreaterThan(initialSize?.height || 0);
  });

  test('should add new widgets to the dashboard', async ({ page }) => {
    // Open widget library
    await page.click('[data-testid="add-widget-button"]');
    
    // Select a widget type
    await page.click('[data-testid="widget-type-chart"]');
    
    // Configure widget
    await page.fill('[data-testid="widget-title-input"]', 'Sales Chart');
    await page.selectOption('[data-testid="chart-type-select"]', 'line');
    
    // Add to dashboard
    await page.click('[data-testid="confirm-add-widget"]');
    
    // Verify widget is added
    const newWidget = await page.locator('[data-testid="grid-item"]:has-text("Sales Chart")');
    await expect(newWidget).toBeVisible();
  });

  test('should remove widgets from the dashboard', async ({ page }) => {
    // Get initial widget count
    const initialCount = await page.locator('[data-testid="grid-item"]').count();
    
    // Hover over widget to show controls
    await page.hover('[data-testid="grid-item-0"]');
    
    // Click remove button
    await page.click('[data-testid="remove-widget-0"]');
    
    // Confirm removal
    await page.click('[data-testid="confirm-remove"]');
    
    // Verify widget is removed
    const newCount = await page.locator('[data-testid="grid-item"]').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should support different layout presets', async ({ page }) => {
    // Open layout selector
    await page.click('[data-testid="layout-selector"]');
    
    // Select 2-column layout
    await page.click('[data-testid="layout-2-column"]');
    
    // Verify layout change
    const grid = await page.locator('[data-testid="dashboard-grid"]');
    await expect(grid).toHaveAttribute('data-layout', '2-column');
    
    // Select 3-column layout
    await page.click('[data-testid="layout-selector"]');
    await page.click('[data-testid="layout-3-column"]');
    
    await expect(grid).toHaveAttribute('data-layout', '3-column');
  });

  test('should save and load dashboard configurations', async ({ page }) => {
    // Make some changes
    await page.hover('[data-testid="grid-item-0"]');
    await page.click('[data-testid="edit-widget-0"]');
    await page.fill('[data-testid="widget-title-input"]', 'Updated Widget');
    await page.click('[data-testid="save-widget"]');
    
    // Save configuration
    await page.click('[data-testid="save-dashboard"]');
    await page.fill('[data-testid="dashboard-name-input"]', 'My Dashboard');
    await page.click('[data-testid="confirm-save"]');
    
    // Reset dashboard
    await page.click('[data-testid="reset-dashboard"]');
    
    // Load saved configuration
    await page.click('[data-testid="load-dashboard"]');
    await page.click('[data-testid="saved-dashboard-my-dashboard"]');
    
    // Verify configuration is restored
    const widget = await page.locator('[data-testid="grid-item"]:has-text("Updated Widget")');
    await expect(widget).toBeVisible();
  });

  test('should support fullscreen mode for widgets', async ({ page }) => {
    // Enter fullscreen for a widget
    await page.hover('[data-testid="grid-item-0"]');
    await page.click('[data-testid="fullscreen-widget-0"]');
    
    // Verify fullscreen mode
    const fullscreenWidget = await page.locator('[data-testid="fullscreen-widget"]');
    await expect(fullscreenWidget).toBeVisible();
    
    // Exit fullscreen
    await page.click('[data-testid="exit-fullscreen"]');
    
    // Verify normal mode
    await expect(fullscreenWidget).not.toBeVisible();
  });

  test('should support responsive breakpoints', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify mobile layout
    const grid = await page.locator('[data-testid="dashboard-grid"]');
    await expect(grid).toHaveAttribute('data-responsive', 'mobile');
    
    // Widgets should stack vertically
    const widgets = await page.locator('[data-testid="grid-item"]').all();
    for (let i = 1; i < widgets.length; i++) {
      const prevBox = await widgets[i - 1].boundingBox();
      const currBox = await widgets[i].boundingBox();
      expect(currBox?.y).toBeGreaterThan(prevBox?.y || 0);
    }
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(grid).toHaveAttribute('data-responsive', 'tablet');
    
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(grid).toHaveAttribute('data-responsive', 'desktop');
  });

  test('should support widget refresh and auto-refresh', async ({ page }) => {
    // Manual refresh
    await page.hover('[data-testid="grid-item-0"]');
    await page.click('[data-testid="refresh-widget-0"]');
    
    // Verify refresh indicator
    const refreshIndicator = await page.locator('[data-testid="refresh-indicator-0"]');
    await expect(refreshIndicator).toBeVisible();
    await expect(refreshIndicator).not.toBeVisible({ timeout: 2000 });
    
    // Enable auto-refresh
    await page.click('[data-testid="widget-settings-0"]');
    await page.check('[data-testid="auto-refresh-checkbox"]');
    await page.fill('[data-testid="refresh-interval-input"]', '5');
    await page.click('[data-testid="save-settings"]');
    
    // Verify auto-refresh indicator
    const autoRefreshBadge = await page.locator('[data-testid="auto-refresh-badge-0"]');
    await expect(autoRefreshBadge).toBeVisible();
  });

  test('should handle widget loading and error states', async ({ page }) => {
    // Trigger loading state
    await page.click('[data-testid="trigger-loading-0"]');
    
    // Verify loading state
    const loadingSpinner = await page.locator('[data-testid="loading-spinner-0"]');
    await expect(loadingSpinner).toBeVisible();
    
    // Trigger error state
    await page.click('[data-testid="trigger-error-0"]');
    
    // Verify error state
    const errorMessage = await page.locator('[data-testid="error-message-0"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Failed to load widget');
    
    // Retry loading
    await page.click('[data-testid="retry-widget-0"]');
    await expect(errorMessage).not.toBeVisible();
  });

  test('should support export and import of dashboard layouts', async ({ page }) => {
    // Export dashboard
    await page.click('[data-testid="export-dashboard"]');
    
    // Get exported JSON
    const exportedData = await page.locator('[data-testid="export-json"]').textContent();
    expect(exportedData).toContain('"version"');
    expect(exportedData).toContain('"widgets"');
    expect(exportedData).toContain('"layout"');
    
    // Import dashboard
    await page.click('[data-testid="import-dashboard"]');
    await page.fill('[data-testid="import-json-input"]', exportedData || '');
    await page.click('[data-testid="confirm-import"]');
    
    // Verify import success
    const successMessage = await page.locator('[data-testid="import-success"]');
    await expect(successMessage).toBeVisible();
  });
});
