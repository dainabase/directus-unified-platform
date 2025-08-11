import { test, expect } from '@playwright/test'

test.describe('TreeView Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=components-treeview--default')
  })

  test('should expand and collapse nodes', async ({ page }) => {
    // Find root node
    const rootNode = page.locator('[role="treeitem"]:has-text("Root")')
    await expect(rootNode).toBeVisible()

    // Initially collapsed
    await expect(page.locator('[role="treeitem"]:has-text("Child 1")')).not.toBeVisible()

    // Click to expand
    await rootNode.locator('[aria-label="Expand"]').click()

    // Check children are visible
    await expect(page.locator('[role="treeitem"]:has-text("Child 1")')).toBeVisible()
    await expect(page.locator('[role="treeitem"]:has-text("Child 2")')).toBeVisible()

    // Click to collapse
    await rootNode.locator('[aria-label="Collapse"]').click()

    // Check children are hidden
    await expect(page.locator('[role="treeitem"]:has-text("Child 1")')).not.toBeVisible()
  })

  test('should handle selection in single select mode', async ({ page }) => {
    await page.goto('/iframe.html?id=components-treeview--single-select')

    // Expand root
    await page.locator('[aria-label="Expand"]').first().click()

    // Select first child
    const child1 = page.locator('[role="treeitem"]:has-text("Child 1")')
    await child1.click()
    await expect(child1).toHaveAttribute('aria-selected', 'true')

    // Select second child (should deselect first)
    const child2 = page.locator('[role="treeitem"]:has-text("Child 2")')
    await child2.click()
    await expect(child2).toHaveAttribute('aria-selected', 'true')
    await expect(child1).toHaveAttribute('aria-selected', 'false')
  })

  test('should handle selection in multi-select mode', async ({ page }) => {
    await page.goto('/iframe.html?id=components-treeview--multi-select')

    // Expand root
    await page.locator('[aria-label="Expand"]').first().click()

    // Select first child
    const child1 = page.locator('[role="treeitem"]:has-text("Child 1")')
    await child1.click()
    await expect(child1).toHaveAttribute('aria-selected', 'true')

    // Select second child (both should be selected)
    const child2 = page.locator('[role="treeitem"]:has-text("Child 2")')
    await child2.click()
    await expect(child2).toHaveAttribute('aria-selected', 'true')
    await expect(child1).toHaveAttribute('aria-selected', 'true')
  })

  test('should handle checkbox selection', async ({ page }) => {
    await page.goto('/iframe.html?id=components-treeview--checkable')

    // Expand root
    await page.locator('[aria-label="Expand"]').first().click()

    // Check first child
    const checkbox1 = page.locator('[role="treeitem"]:has-text("Child 1")').locator('input[type="checkbox"]')
    await checkbox1.check()
    await expect(checkbox1).toBeChecked()

    // Check second child
    const checkbox2 = page.locator('[role="treeitem"]:has-text("Child 2")').locator('input[type="checkbox"]')
    await checkbox2.check()
    await expect(checkbox2).toBeChecked()

    // Parent should be in indeterminate or checked state
    const parentCheckbox = page.locator('[role="treeitem"]:has-text("Root")').locator('input[type="checkbox"]')
    // Parent checkbox should reflect children state
    const isChecked = await parentCheckbox.isChecked()
    const isIndeterminate = await parentCheckbox.evaluate(el => (el as HTMLInputElement).indeterminate)
    expect(isChecked || isIndeterminate).toBeTruthy()
  })

  test('should support keyboard navigation', async ({ page }) => {
    // Focus on tree
    await page.locator('[role="tree"]').focus()

    // Navigate with arrow keys
    await page.keyboard.press('ArrowDown')
    let focusedText = await page.evaluate(() => document.activeElement?.textContent)
    expect(focusedText).toContain('Root')

    // Expand with Enter or Space
    await page.keyboard.press('Enter')
    await expect(page.locator('[role="treeitem"]:has-text("Child 1")')).toBeVisible()

    // Navigate to child
    await page.keyboard.press('ArrowDown')
    focusedText = await page.evaluate(() => document.activeElement?.textContent)
    expect(focusedText).toContain('Child 1')

    // Collapse parent with ArrowLeft
    await page.keyboard.press('ArrowLeft')
    await expect(page.locator('[role="treeitem"]:has-text("Child 1")')).not.toBeVisible()
  })

  test('should handle drag and drop', async ({ page }) => {
    await page.goto('/iframe.html?id=components-treeview--draggable')

    // Expand nodes
    await page.locator('[aria-label="Expand"]').first().click()

    // Drag Child 1 to Child 2
    const child1 = page.locator('[role="treeitem"]:has-text("Child 1")')
    const child2 = page.locator('[role="treeitem"]:has-text("Child 2")')

    await child1.dragTo(child2)

    // Verify the drag operation (implementation specific)
    // This would depend on how your tree handles the drop
    await expect(page.locator('.drag-success-message')).toBeVisible()
  })

  test('should search and filter nodes', async ({ page }) => {
    await page.goto('/iframe.html?id=components-treeview--searchable')

    // Type in search box
    await page.fill('input[placeholder="Search..."]', 'Child 1')

    // Only matching nodes should be visible
    await expect(page.locator('[role="treeitem"]:has-text("Child 1")')).toBeVisible()
    await expect(page.locator('[role="treeitem"]:has-text("Child 2")')).not.toBeVisible()

    // Clear search
    await page.fill('input[placeholder="Search..."]', '')

    // All nodes should be visible again
    await expect(page.locator('[role="treeitem"]:has-text("Root")')).toBeVisible()
  })

  test('should be accessible', async ({ page }) => {
    const tree = page.locator('[role="tree"]')
    await expect(tree).toBeVisible()

    // Check ARIA attributes
    await expect(tree).toHaveAttribute('aria-label')

    const treeItems = page.locator('[role="treeitem"]')
    const count = await treeItems.count()
    expect(count).toBeGreaterThan(0)

    // Check tree items have proper ARIA attributes
    const firstItem = treeItems.first()
    await expect(firstItem).toHaveAttribute('aria-expanded')
    await expect(firstItem).toHaveAttribute('aria-level')
  })
})