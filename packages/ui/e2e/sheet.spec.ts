import { test, expect } from '@playwright/test'

test.describe('Sheet Component E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=components-sheet--default')
  })

  test('should open and close sheet', async ({ page }) => {
    const trigger = page.locator('button:has-text("Open Sheet")')
    const sheet = page.locator('[role="dialog"]')

    // Initially hidden
    await expect(sheet).not.toBeVisible()

    // Click to open
    await trigger.click()
    await expect(sheet).toBeVisible()

    // Check sheet content
    await expect(sheet.locator('h2')).toBeVisible()
    await expect(sheet.locator('p')).toBeVisible()

    // Close with X button
    const closeButton = page.locator('[aria-label="Close"]')
    await closeButton.click()
    await expect(sheet).not.toBeVisible()
  })

  test('should handle different positions', async ({ page }) => {
    // Test right position (default)
    await page.goto('/iframe.html?id=components-sheet--right')
    await page.locator('button:has-text("Open Right Sheet")').click()
    const rightSheet = page.locator('[data-side="right"]')
    await expect(rightSheet).toBeVisible()
    await page.keyboard.press('Escape')

    // Test left position
    await page.goto('/iframe.html?id=components-sheet--left')
    await page.locator('button:has-text("Open Left Sheet")').click()
    const leftSheet = page.locator('[data-side="left"]')
    await expect(leftSheet).toBeVisible()
    await page.keyboard.press('Escape')

    // Test top position
    await page.goto('/iframe.html?id=components-sheet--top')
    await page.locator('button:has-text("Open Top Sheet")').click()
    const topSheet = page.locator('[data-side="top"]')
    await expect(topSheet).toBeVisible()
    await page.keyboard.press('Escape')

    // Test bottom position
    await page.goto('/iframe.html?id=components-sheet--bottom')
    await page.locator('button:has-text("Open Bottom Sheet")').click()
    const bottomSheet = page.locator('[data-side="bottom"]')
    await expect(bottomSheet).toBeVisible()
  })

  test('should close on Escape key', async ({ page }) => {
    const trigger = page.locator('button:has-text("Open Sheet")')
    await trigger.click()

    const sheet = page.locator('[role="dialog"]')
    await expect(sheet).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(sheet).not.toBeVisible()
  })

  test('should close on overlay click', async ({ page }) => {
    const trigger = page.locator('button:has-text("Open Sheet")')
    await trigger.click()

    const sheet = page.locator('[role="dialog"]')
    await expect(sheet).toBeVisible()

    // Click overlay
    await page.locator('[data-radix-dialog-overlay]').click({ position: { x: 10, y: 10 } })
    await expect(sheet).not.toBeVisible()
  })

  test('should handle form submission', async ({ page }) => {
    await page.goto('/iframe.html?id=components-sheet--with-form')
    
    const trigger = page.locator('button:has-text("Open Form Sheet")')
    await trigger.click()

    // Fill form
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="email"]', 'john@example.com')
    await page.fill('textarea[name="message"]', 'Test message')

    // Submit form
    await page.locator('button[type="submit"]').click()

    // Sheet should close after submission
    const sheet = page.locator('[role="dialog"]')
    await expect(sheet).not.toBeVisible()
  })

  test('should trap focus within sheet', async ({ page }) => {
    const trigger = page.locator('button:has-text("Open Sheet")')
    await trigger.click()

    // Tab through focusable elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      const activeElement = await page.evaluate(() => document.activeElement?.closest('[role="dialog"]'))
      expect(activeElement).toBeTruthy()
    }
  })

  test('should handle different sizes', async ({ page }) => {
    // Default size
    await page.goto('/iframe.html?id=components-sheet--default')
    await page.locator('button:has-text("Open Sheet")').click()
    const defaultSheet = page.locator('[role="dialog"]')
    const defaultWidth = await defaultSheet.evaluate(el => window.getComputedStyle(el).width)
    await page.keyboard.press('Escape')

    // Large size
    await page.goto('/iframe.html?id=components-sheet--large')
    await page.locator('button:has-text("Open Large Sheet")').click()
    const largeSheet = page.locator('[role="dialog"]')
    const largeWidth = await largeSheet.evaluate(el => window.getComputedStyle(el).width)
    
    expect(parseInt(largeWidth)).toBeGreaterThan(parseInt(defaultWidth))
  })

  test('should maintain scroll position', async ({ page }) => {
    await page.goto('/iframe.html?id=components-sheet--scrollable')
    
    const trigger = page.locator('button:has-text("Open Scrollable Sheet")')
    await trigger.click()

    const content = page.locator('[role="dialog"] .sheet-content')
    
    // Scroll down
    await content.evaluate(el => el.scrollTop = 200)
    const scrollPosition = await content.evaluate(el => el.scrollTop)
    expect(scrollPosition).toBe(200)

    // Close and reopen
    await page.keyboard.press('Escape')
    await trigger.click()

    // Scroll position should reset
    const newScrollPosition = await content.evaluate(el => el.scrollTop)
    expect(newScrollPosition).toBe(0)
  })

  test('should be accessible', async ({ page }) => {
    const trigger = page.locator('button:has-text("Open Sheet")')
    await trigger.click()

    const sheet = page.locator('[role="dialog"]')
    
    // Check ARIA attributes
    await expect(sheet).toHaveAttribute('aria-modal', 'true')
    await expect(sheet).toHaveAttribute('aria-labelledby')

    // Check heading has correct ID
    const headingId = await sheet.locator('h2').getAttribute('id')
    const labelledBy = await sheet.getAttribute('aria-labelledby')
    expect(headingId).toBe(labelledBy)
  })
})
