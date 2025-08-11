import { test, expect } from '@playwright/test'

test.describe('SearchBar Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=components-searchbar--default')
  })

  test('should display and clear search input', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]')
    
    // Type in search
    await searchInput.fill('test query')
    await expect(searchInput).toHaveValue('test query')
    
    // Clear button should appear
    const clearButton = page.locator('button[aria-label="Clear search"]')
    await expect(clearButton).toBeVisible()
    
    // Click clear
    await clearButton.click()
    await expect(searchInput).toHaveValue('')
    await expect(clearButton).not.toBeVisible()
  })

  test('should show suggestions on focus', async ({ page }) => {
    await page.goto('/iframe.html?id=components-searchbar--with-suggestions')
    
    const searchInput = page.locator('input[type="search"]')
    await searchInput.focus()
    await searchInput.type('a')
    
    // Suggestions should appear
    await expect(page.locator('[role="listbox"]')).toBeVisible()
    await expect(page.locator('[role="option"]:has-text("React components")')).toBeVisible()
    await expect(page.locator('[role="option"]:has-text("TypeScript tutorial")')).toBeVisible()
  })

  test('should trigger search on Enter key', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]')
    await searchInput.fill('search term')
    
    // Press Enter
    await searchInput.press('Enter')
    
    // Check search was triggered (look for results or loading state)
    await expect(page.locator('.search-results, .loading-indicator')).toBeVisible()
  })

  test('should trigger search on button click', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]')
    await searchInput.fill('search term')
    
    // Click search button
    await page.locator('button:has-text("Search")').click()
    
    // Check search was triggered
    await expect(page.locator('.search-results, .loading-indicator')).toBeVisible()
  })

  test('should show and apply filters', async ({ page }) => {
    await page.goto('/iframe.html?id=components-searchbar--with-filters')
    
    // Open filters
    await page.locator('button:has-text("Filters")').click()
    
    // Filter popover should be visible
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    
    // Check a filter
    await page.locator('label:has-text("Documentation")').click()
    
    // Filter count should update
    await expect(page.locator('.filter-count')).toHaveText('1')
    
    // Apply another filter
    await page.locator('label:has-text("Tutorials")').click()
    await expect(page.locator('.filter-count')).toHaveText('2')
    
    // Clear filters
    await page.locator('button:has-text("Clear all filters")').click()
    await expect(page.locator('.filter-count')).not.toBeVisible()
  })

  test('should show search results', async ({ page }) => {
    await page.goto('/iframe.html?id=components-searchbar--with-results')
    
    const searchInput = page.locator('input[type="search"]')
    await searchInput.fill('react')
    await searchInput.press('Enter')
    
    // Wait for results
    await expect(page.locator('.search-results')).toBeVisible()
    
    // Check results are displayed
    await expect(page.locator('[role="article"]:has-text("Getting Started with React")')).toBeVisible()
    
    // Click on a result
    await page.locator('[role="article"]:has-text("Getting Started with React")').click()
    
    // Results should close
    await expect(page.locator('.search-results')).not.toBeVisible()
  })

  test('should show recent searches', async ({ page }) => {
    await page.goto('/iframe.html?id=components-searchbar--with-recent')
    
    const searchInput = page.locator('input[type="search"]')
    await searchInput.focus()
    await searchInput.type('a')
    
    // Recent searches section should be visible
    await expect(page.locator('text=Recent searches')).toBeVisible()
    await expect(page.locator('[role="option"]:has-text("React hooks")')).toBeVisible()
    
    // Click clear recent
    await page.locator('button:has-text("Clear all")').click()
    
    // Recent searches should be cleared
    await expect(page.locator('text=Recent searches')).not.toBeVisible()
  })

  test('should handle live search with debounce', async ({ page }) => {
    await page.goto('/iframe.html?id=components-searchbar--live-search')
    
    const searchInput = page.locator('input[type="search"]')
    
    // Type quickly
    await searchInput.type('test', { delay: 50 })
    
    // Should show loading after debounce
    await page.waitForTimeout(400) // Wait for debounce
    await expect(page.locator('.loading-indicator')).toBeVisible()
    
    // Results should appear
    await expect(page.locator('.search-results')).toBeVisible()
  })

  test('should handle different variants', async ({ page }) => {
    // Test minimal variant
    await page.goto('/iframe.html?id=components-searchbar--minimal')
    const minimalSearch = page.locator('input[type="search"]')
    await expect(minimalSearch).toHaveClass(/border-b/)
    
    // Test expanded variant
    await page.goto('/iframe.html?id=components-searchbar--expanded')
    const expandedSearch = page.locator('input[type="search"]')
    await expect(expandedSearch).toHaveClass(/shadow-sm/)
  })

  test('should handle different sizes', async ({ page }) => {
    // Test small size
    await page.goto('/iframe.html?id=components-searchbar--small')
    const smallSearch = page.locator('input[type="search"]')
    await expect(smallSearch).toHaveClass(/h-8/)
    
    // Test large size
    await page.goto('/iframe.html?id=components-searchbar--large')
    const largeSearch = page.locator('input[type="search"]')
    await expect(largeSearch).toHaveClass(/h-12/)
  })

  test('should be accessible', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]')
    
    // Check ARIA attributes
    await expect(searchInput).toHaveAttribute('role', 'searchbox')
    await expect(searchInput).toHaveAttribute('aria-label')
    
    // Test keyboard navigation
    await searchInput.focus()
    await searchInput.type('test')
    
    // Tab to search button
    await page.keyboard.press('Tab')
    const focusedElement = await page.evaluate(() => document.activeElement?.textContent)
    expect(focusedElement).toContain('Search')
  })
})