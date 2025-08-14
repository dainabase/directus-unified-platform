import { test, expect } from '@playwright/test';

test.describe('Advanced Filter Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/advanced-filter');
  });

  test('should render the filter builder interface', async ({ page }) => {
    const filterBuilder = await page.locator('[data-testid="advanced-filter"]');
    await expect(filterBuilder).toBeVisible();
    
    // Check for essential UI elements
    await expect(page.locator('[data-testid="add-filter-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-list"]')).toBeVisible();
  });

  test('should add a simple filter condition', async ({ page }) => {
    // Click add filter button
    await page.click('[data-testid="add-filter-button"]');
    
    // Select field
    await page.selectOption('[data-testid="filter-field-select"]', 'name');
    
    // Select operator
    await page.selectOption('[data-testid="filter-operator-select"]', 'contains');
    
    // Enter value
    await page.fill('[data-testid="filter-value-input"]', 'test');
    
    // Apply filter
    await page.click('[data-testid="apply-filter-button"]');
    
    // Verify filter is added to the list
    const filterItem = await page.locator('[data-testid="filter-item"]').first();
    await expect(filterItem).toContainText('name contains test');
  });

  test('should support multiple filter conditions with AND/OR logic', async ({ page }) => {
    // Add first filter
    await page.click('[data-testid="add-filter-button"]');
    await page.selectOption('[data-testid="filter-field-select-0"]', 'status');
    await page.selectOption('[data-testid="filter-operator-select-0"]', 'equals');
    await page.fill('[data-testid="filter-value-input-0"]', 'active');
    
    // Add second filter
    await page.click('[data-testid="add-filter-button"]');
    
    // Select logic operator
    await page.selectOption('[data-testid="logic-operator-select"]', 'OR');
    
    await page.selectOption('[data-testid="filter-field-select-1"]', 'priority');
    await page.selectOption('[data-testid="filter-operator-select-1"]', 'greater_than');
    await page.fill('[data-testid="filter-value-input-1"]', '5');
    
    // Apply filters
    await page.click('[data-testid="apply-filters-button"]');
    
    // Verify both filters are shown
    const filters = await page.locator('[data-testid="filter-item"]').count();
    expect(filters).toBe(2);
    
    // Verify logic operator is displayed
    const logicOperator = await page.locator('[data-testid="logic-operator-display"]');
    await expect(logicOperator).toContainText('OR');
  });

  test('should support nested filter groups', async ({ page }) => {
    // Create a group
    await page.click('[data-testid="add-group-button"]');
    
    // Add filters to the group
    await page.click('[data-testid="group-0-add-filter"]');
    await page.selectOption('[data-testid="group-0-filter-field-0"]', 'category');
    await page.selectOption('[data-testid="group-0-filter-operator-0"]', 'in');
    await page.fill('[data-testid="group-0-filter-value-0"]', 'electronics,books');
    
    // Add another group
    await page.click('[data-testid="add-group-button"]');
    await page.click('[data-testid="group-1-add-filter"]');
    await page.selectOption('[data-testid="group-1-filter-field-0"]', 'price');
    await page.selectOption('[data-testid="group-1-filter-operator-0"]', 'between');
    await page.fill('[data-testid="group-1-filter-min-value"]', '10');
    await page.fill('[data-testid="group-1-filter-max-value"]', '100');
    
    // Set group logic
    await page.selectOption('[data-testid="group-logic-operator"]', 'AND');
    
    // Apply
    await page.click('[data-testid="apply-filters-button"]');
    
    // Verify nested structure is displayed
    const groups = await page.locator('[data-testid="filter-group"]').count();
    expect(groups).toBe(2);
  });

  test('should support date range filters', async ({ page }) => {
    await page.click('[data-testid="add-filter-button"]');
    await page.selectOption('[data-testid="filter-field-select"]', 'created_at');
    await page.selectOption('[data-testid="filter-operator-select"]', 'date_range');
    
    // Select date range preset
    await page.click('[data-testid="date-range-preset"]');
    await page.click('[data-testid="preset-last-7-days"]');
    
    // Verify dates are filled
    const startDate = await page.inputValue('[data-testid="date-range-start"]');
    const endDate = await page.inputValue('[data-testid="date-range-end"]');
    expect(startDate).toBeTruthy();
    expect(endDate).toBeTruthy();
    
    // Apply filter
    await page.click('[data-testid="apply-filter-button"]');
  });

  test('should support custom filter expressions', async ({ page }) => {
    // Switch to advanced mode
    await page.click('[data-testid="toggle-advanced-mode"]');
    
    // Enter custom expression
    const expressionInput = await page.locator('[data-testid="expression-input"]');
    await expressionInput.fill('(status = "active" AND priority > 5) OR (category IN ["urgent", "critical"])');
    
    // Validate expression
    await page.click('[data-testid="validate-expression"]');
    
    // Check validation result
    const validationMessage = await page.locator('[data-testid="validation-message"]');
    await expect(validationMessage).toContainText('Valid expression');
    
    // Apply expression
    await page.click('[data-testid="apply-expression"]');
  });

  test('should save and load filter presets', async ({ page }) => {
    // Create a filter
    await page.click('[data-testid="add-filter-button"]');
    await page.selectOption('[data-testid="filter-field-select"]', 'status');
    await page.selectOption('[data-testid="filter-operator-select"]', 'equals');
    await page.fill('[data-testid="filter-value-input"]', 'active');
    
    // Save as preset
    await page.click('[data-testid="save-preset-button"]');
    await page.fill('[data-testid="preset-name-input"]', 'Active Items');
    await page.click('[data-testid="confirm-save-preset"]');
    
    // Clear filters
    await page.click('[data-testid="clear-filters-button"]');
    
    // Load preset
    await page.click('[data-testid="load-preset-button"]');
    await page.click('[data-testid="preset-active-items"]');
    
    // Verify filter is restored
    const filterItem = await page.locator('[data-testid="filter-item"]').first();
    await expect(filterItem).toContainText('status equals active');
  });

  test('should export and import filter configurations', async ({ page }) => {
    // Create complex filter
    await page.click('[data-testid="add-filter-button"]');
    await page.selectOption('[data-testid="filter-field-select"]', 'name');
    await page.selectOption('[data-testid="filter-operator-select"]', 'contains');
    await page.fill('[data-testid="filter-value-input"]', 'product');
    
    // Export configuration
    await page.click('[data-testid="export-filters-button"]');
    
    // Get exported JSON
    const exportedJson = await page.locator('[data-testid="export-json"]').textContent();
    expect(exportedJson).toContain('"field":"name"');
    expect(exportedJson).toContain('"operator":"contains"');
    expect(exportedJson).toContain('"value":"product"');
    
    // Clear and import
    await page.click('[data-testid="clear-filters-button"]');
    await page.click('[data-testid="import-filters-button"]');
    await page.fill('[data-testid="import-json-input"]', exportedJson || '');
    await page.click('[data-testid="confirm-import"]');
    
    // Verify imported filter
    const filterItem = await page.locator('[data-testid="filter-item"]').first();
    await expect(filterItem).toContainText('name contains product');
  });

  test('should handle filter removal and editing', async ({ page }) => {
    // Add filter
    await page.click('[data-testid="add-filter-button"]');
    await page.selectOption('[data-testid="filter-field-select"]', 'status');
    await page.selectOption('[data-testid="filter-operator-select"]', 'equals');
    await page.fill('[data-testid="filter-value-input"]', 'pending');
    await page.click('[data-testid="apply-filter-button"]');
    
    // Edit filter
    await page.click('[data-testid="edit-filter-0"]');
    await page.fill('[data-testid="filter-value-input"]', 'completed');
    await page.click('[data-testid="update-filter-button"]');
    
    // Verify updated filter
    const filterItem = await page.locator('[data-testid="filter-item"]').first();
    await expect(filterItem).toContainText('status equals completed');
    
    // Remove filter
    await page.click('[data-testid="remove-filter-0"]');
    
    // Verify filter is removed
    const filters = await page.locator('[data-testid="filter-item"]').count();
    expect(filters).toBe(0);
  });

  test('should validate filter inputs', async ({ page }) => {
    await page.click('[data-testid="add-filter-button"]');
    
    // Try to apply without selecting field
    await page.click('[data-testid="apply-filter-button"]');
    
    // Check for validation error
    const fieldError = await page.locator('[data-testid="field-error"]');
    await expect(fieldError).toContainText('Field is required');
    
    // Select field but leave value empty
    await page.selectOption('[data-testid="filter-field-select"]', 'amount');
    await page.selectOption('[data-testid="filter-operator-select"]', 'greater_than');
    await page.click('[data-testid="apply-filter-button"]');
    
    // Check for value validation error
    const valueError = await page.locator('[data-testid="value-error"]');
    await expect(valueError).toContainText('Value is required');
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Tab through interface
    await page.keyboard.press('Tab');
    let focusedElement = await page.locator(':focus');
    await expect(focusedElement).toHaveAttribute('data-testid', 'add-filter-button');
    
    // Add filter with keyboard
    await page.keyboard.press('Enter');
    
    // Navigate through form with Tab
    await page.keyboard.press('Tab');
    focusedElement = await page.locator(':focus');
    await expect(focusedElement).toHaveAttribute('data-testid', 'filter-field-select');
    
    // Select with keyboard
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    // Continue navigation
    await page.keyboard.press('Tab');
    focusedElement = await page.locator(':focus');
    await expect(focusedElement).toHaveAttribute('data-testid', 'filter-operator-select');
  });
});
