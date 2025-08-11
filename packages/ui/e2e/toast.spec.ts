import { test, expect } from '@playwright/test'

test.describe('Toast Component E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=components-toast--default')
  })

  test('should show and auto-dismiss toast', async ({ page }) => {
    // Trigger toast
    const triggerButton = page.locator('button:has-text("Show Toast")')
    await triggerButton.click()

    // Toast should appear
    const toast = page.locator('[role="alert"]')
    await expect(toast).toBeVisible()
    await expect(toast).toHaveText(/Toast message/)

    // Wait for auto-dismiss (usually 5 seconds)
    await expect(toast).not.toBeVisible({ timeout: 6000 })
  })

  test('should handle multiple toasts', async ({ page }) => {
    await page.goto('/iframe.html?id=components-toast--multiple')
    
    // Trigger multiple toasts
    const triggerButton = page.locator('button:has-text("Show Toast")')
    await triggerButton.click()
    await page.waitForTimeout(100)
    await triggerButton.click()
    await page.waitForTimeout(100)
    await triggerButton.click()

    // Multiple toasts should be visible
    const toasts = page.locator('[role="alert"]')
    const count = await toasts.count()
    expect(count).toBe(3)

    // Check stacking order
    const positions = await toasts.evaluateAll((elements) => 
      elements.map(el => el.getBoundingClientRect().top)
    )
    
    // Each toast should be positioned below the previous one
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]).toBeGreaterThan(positions[i - 1])
    }
  })

  test('should dismiss toast on close button click', async ({ page }) => {
    await page.goto('/iframe.html?id=components-toast--with-close')
    
    // Show toast
    const triggerButton = page.locator('button:has-text("Show Toast")')
    await triggerButton.click()

    const toast = page.locator('[role="alert"]')
    await expect(toast).toBeVisible()

    // Click close button
    const closeButton = toast.locator('[aria-label="Close"]')
    await closeButton.click()

    // Toast should disappear immediately
    await expect(toast).not.toBeVisible()
  })

  test('should handle different toast variants', async ({ page }) => {
    // Success toast
    await page.goto('/iframe.html?id=components-toast--success')
    await page.locator('button:has-text("Show Success")').click()
    const successToast = page.locator('[role="alert"][data-variant="success"]')
    await expect(successToast).toBeVisible()
    await expect(successToast).toHaveClass(/success/)

    // Error toast
    await page.goto('/iframe.html?id=components-toast--error')
    await page.locator('button:has-text("Show Error")').click()
    const errorToast = page.locator('[role="alert"][data-variant="error"]')
    await expect(errorToast).toBeVisible()
    await expect(errorToast).toHaveClass(/error/)

    // Warning toast
    await page.goto('/iframe.html?id=components-toast--warning')
    await page.locator('button:has-text("Show Warning")').click()
    const warningToast = page.locator('[role="alert"][data-variant="warning"]')
    await expect(warningToast).toBeVisible()
    await expect(warningToast).toHaveClass(/warning/)

    // Info toast
    await page.goto('/iframe.html?id=components-toast--info')
    await page.locator('button:has-text("Show Info")').click()
    const infoToast = page.locator('[role="alert"][data-variant="info"]')
    await expect(infoToast).toBeVisible()
    await expect(infoToast).toHaveClass(/info/)
  })

  test('should handle toast with action', async ({ page }) => {
    await page.goto('/iframe.html?id=components-toast--with-action')
    
    // Show toast with action
    await page.locator('button:has-text("Show Toast")').click()

    const toast = page.locator('[role="alert"]')
    await expect(toast).toBeVisible()

    // Click action button
    const actionButton = toast.locator('button:has-text("Undo")')
    await expect(actionButton).toBeVisible()
    await actionButton.click()

    // Action should be triggered (check for feedback)
    await expect(page.locator('text=Action triggered')).toBeVisible()
  })

  test('should handle different positions', async ({ page }) => {
    // Top-right (default)
    await page.goto('/iframe.html?id=components-toast--top-right')
    await page.locator('button:has-text("Show Toast")').click()
    let toast = page.locator('[role="alert"]')
    let box = await toast.boundingBox()
    expect(box?.x).toBeGreaterThan(500) // Right side
    expect(box?.y).toBeLessThan(200) // Top
    
    // Top-left
    await page.goto('/iframe.html?id=components-toast--top-left')
    await page.locator('button:has-text("Show Toast")').click()
    toast = page.locator('[role="alert"]')
    box = await toast.boundingBox()
    expect(box?.x).toBeLessThan(200) // Left side
    expect(box?.y).toBeLessThan(200) // Top

    // Bottom-right
    await page.goto('/iframe.html?id=components-toast--bottom-right')
    await page.locator('button:has-text("Show Toast")').click()
    toast = page.locator('[role="alert"]')
    box = await toast.boundingBox()
    expect(box?.x).toBeGreaterThan(500) // Right side
    expect(box?.y).toBeGreaterThan(400) // Bottom

    // Bottom-left
    await page.goto('/iframe.html?id=components-toast--bottom-left')
    await page.locator('button:has-text("Show Toast")').click()
    toast = page.locator('[role="alert"]')
    box = await toast.boundingBox()
    expect(box?.x).toBeLessThan(200) // Left side
    expect(box?.y).toBeGreaterThan(400) // Bottom
  })

  test('should handle custom duration', async ({ page }) => {
    await page.goto('/iframe.html?id=components-toast--custom-duration')
    
    // Show toast with 2 second duration
    await page.locator('button:has-text("Show Quick Toast")').click()
    
    const toast = page.locator('[role="alert"]')
    await expect(toast).toBeVisible()
    
    // Should disappear after 2 seconds
    await expect(toast).not.toBeVisible({ timeout: 3000 })
  })

  test('should handle persistent toast', async ({ page }) => {
    await page.goto('/iframe.html?id=components-toast--persistent')
    
    // Show persistent toast
    await page.locator('button:has-text("Show Persistent")').click()
    
    const toast = page.locator('[role="alert"]')
    await expect(toast).toBeVisible()
    
    // Wait longer than normal auto-dismiss time
    await page.waitForTimeout(6000)
    
    // Should still be visible
    await expect(toast).toBeVisible()
    
    // Must be manually closed
    const closeButton = toast.locator('[aria-label="Close"]')
    await closeButton.click()
    await expect(toast).not.toBeVisible()
  })

  test('should pause timer on hover', async ({ page }) => {
    await page.goto('/iframe.html?id=components-toast--pause-on-hover')
    
    // Show toast
    await page.locator('button:has-text("Show Toast")').click()
    
    const toast = page.locator('[role="alert"]')
    await expect(toast).toBeVisible()
    
    // Hover to pause
    await toast.hover()
    
    // Wait what would be the dismiss time
    await page.waitForTimeout(5500)
    
    // Should still be visible
    await expect(toast).toBeVisible()
    
    // Move mouse away
    await page.mouse.move(0, 0)
    
    // Should dismiss after moving away
    await expect(toast).not.toBeVisible({ timeout: 6000 })
  })

  test('should be accessible', async ({ page }) => {
    // Show toast
    await page.locator('button:has-text("Show Toast")').click()
    
    const toast = page.locator('[role="alert"]')
    
    // Check ARIA attributes
    await expect(toast).toHaveAttribute('role', 'alert')
    await expect(toast).toHaveAttribute('aria-live', 'polite')
    
    // For important toasts
    await page.goto('/iframe.html?id=components-toast--important')
    await page.locator('button:has-text("Show Important")').click()
    
    const importantToast = page.locator('[role="alert"]')
    await expect(importantToast).toHaveAttribute('aria-live', 'assertive')
  })
})
