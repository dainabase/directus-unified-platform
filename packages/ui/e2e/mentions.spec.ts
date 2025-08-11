import { test, expect } from '@playwright/test'

test.describe('Mentions Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=components-mentions--default')
  })

  test('should show suggestions when typing trigger character', async ({ page }) => {
    const textarea = page.locator('textarea')
    await textarea.focus()
    
    // Type @ to trigger mentions
    await textarea.type('@')
    
    // Check suggestions appear
    await expect(page.locator('[role="listbox"]')).toBeVisible()
    await expect(page.locator('[role="option"]:has-text("John Doe")')).toBeVisible()
    await expect(page.locator('[role="option"]:has-text("Jane Smith")')).toBeVisible()
  })

  test('should filter suggestions based on input', async ({ page }) => {
    const textarea = page.locator('textarea')
    await textarea.focus()
    
    // Type @jo to filter
    await textarea.type('@jo')
    
    // Only John should be visible
    await expect(page.locator('[role="option"]:has-text("John Doe")')).toBeVisible()
    await expect(page.locator('[role="option"]:has-text("Jane Smith")')).not.toBeVisible()
  })

  test('should insert mention on click', async ({ page }) => {
    const textarea = page.locator('textarea')
    await textarea.focus()
    
    // Trigger mentions
    await textarea.type('@')
    
    // Click on John Doe
    await page.locator('[role="option"]:has-text("John Doe")').click()
    
    // Check mention is inserted
    const value = await textarea.inputValue()
    expect(value).toContain('@johndoe')
    
    // Suggestions should be hidden
    await expect(page.locator('[role="listbox"]')).not.toBeVisible()
  })

  test('should navigate suggestions with keyboard', async ({ page }) => {
    const textarea = page.locator('textarea')
    await textarea.focus()
    
    // Trigger mentions
    await textarea.type('@')
    
    // Navigate down
    await page.keyboard.press('ArrowDown')
    let selected = page.locator('[role="option"][aria-selected="true"]')
    await expect(selected).toHaveText(/John Doe/)
    
    // Navigate down again
    await page.keyboard.press('ArrowDown')
    selected = page.locator('[role="option"][aria-selected="true"]')
    await expect(selected).toHaveText(/Jane Smith/)
    
    // Press Enter to select
    await page.keyboard.press('Enter')
    
    // Check mention is inserted
    const value = await textarea.inputValue()
    expect(value).toContain('@janesmith')
  })

  test('should close suggestions on Escape', async ({ page }) => {
    const textarea = page.locator('textarea')
    await textarea.focus()
    
    // Trigger mentions
    await textarea.type('@')
    await expect(page.locator('[role="listbox"]')).toBeVisible()
    
    // Press Escape
    await page.keyboard.press('Escape')
    
    // Suggestions should be hidden
    await expect(page.locator('[role="listbox"]')).not.toBeVisible()
  })

  test('should highlight mentions in text', async ({ page }) => {
    await page.goto('/iframe.html?id=components-mentions--with-highlight')
    
    const textarea = page.locator('textarea')
    await textarea.focus()
    
    // Type text with mention
    await textarea.type('Hello @')
    await page.locator('[role="option"]:has-text("John Doe")').click()
    await textarea.type(' how are you?')
    
    // Check highlighted mention exists
    await expect(page.locator('.mention-highlight:has-text("@johndoe")')).toBeVisible()
  })

  test('should show user status indicators', async ({ page }) => {
    const textarea = page.locator('textarea')
    await textarea.focus()
    await textarea.type('@')
    
    // Check status indicators
    const onlineUser = page.locator('[role="option"]:has-text("John Doe")')
    await expect(onlineUser.locator('.status-online')).toBeVisible()
    
    const awayUser = page.locator('[role="option"]:has-text("Jane Smith")')
    await expect(awayUser.locator('.status-away')).toBeVisible()
  })

  test('should handle custom trigger characters', async ({ page }) => {
    await page.goto('/iframe.html?id=components-mentions--custom-trigger')
    
    const textarea = page.locator('textarea')
    await textarea.focus()
    
    // Type # instead of @
    await textarea.type('#')
    
    // Check suggestions appear
    await expect(page.locator('[role="listbox"]')).toBeVisible()
    await expect(page.locator('[role="option"]').first()).toBeVisible()
    
    // Select and verify
    await page.locator('[role="option"]').first().click()
    const value = await textarea.inputValue()
    expect(value).toContain('#')
  })

  test('should display mention badges', async ({ page }) => {
    const textarea = page.locator('textarea')
    await textarea.focus()
    
    // Add multiple mentions
    await textarea.type('@')
    await page.locator('[role="option"]:has-text("John Doe")').click()
    await textarea.type(' and @')
    await page.locator('[role="option"]:has-text("Jane Smith")').click()
    
    // Check badges appear
    await expect(page.locator('.mention-badge:has-text("@johndoe")')).toBeVisible()
    await expect(page.locator('.mention-badge:has-text("@janesmith")')).toBeVisible()
  })

  test('should be accessible', async ({ page }) => {
    const textarea = page.locator('textarea')
    await textarea.focus()
    await textarea.type('@')
    
    // Check ARIA attributes
    const listbox = page.locator('[role="listbox"]')
    await expect(listbox).toHaveAttribute('aria-label')
    
    const options = page.locator('[role="option"]')
    const count = await options.count()
    expect(count).toBeGreaterThan(0)
    
    // Check options have proper ARIA attributes
    const firstOption = options.first()
    await expect(firstOption).toHaveAttribute('aria-selected')
  })
})