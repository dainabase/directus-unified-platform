import { test, expect } from '@playwright/test'

test.describe('Popover Component E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=components-popover--default')
  })

  test('should show and hide popover on hover', async ({ page }) => {
    const trigger = page.locator('[data-radix-popover-trigger]').first()
    const popover = page.locator('[role="dialog"]')

    // Initially hidden
    await expect(popover).not.toBeVisible()

    // Hover to show
    await trigger.hover()
    await expect(popover).toBeVisible()

    // Move away to hide
    await page.mouse.move(0, 0)
    await expect(popover).not.toBeVisible()
  })

  test('should show popover on click', async ({ page }) => {
    await page.goto('/iframe.html?id=components-popover--click')
    
    const trigger = page.locator('[data-radix-popover-trigger]').first()
    const popover = page.locator('[role="dialog"]')

    // Click to show
    await trigger.click()
    await expect(popover).toBeVisible()

    // Click outside to hide
    await page.mouse.click(10, 10)
    await expect(popover).not.toBeVisible()
  })

  test('should position popover correctly', async ({ page }) => {
    await page.goto('/iframe.html?id=components-popover--positions')
    
    // Test top position
    const topTrigger = page.locator('[data-position="top"]')
    await topTrigger.hover()
    
    const topPopover = page.locator('[data-side="top"]')
    await expect(topPopover).toBeVisible()
    
    // Test right position
    const rightTrigger = page.locator('[data-position="right"]')
    await rightTrigger.hover()
    
    const rightPopover = page.locator('[data-side="right"]')
    await expect(rightPopover).toBeVisible()
  })

  test('should close on Escape key', async ({ page }) => {
    await page.goto('/iframe.html?id=components-popover--click')
    
    const trigger = page.locator('[data-radix-popover-trigger]').first()
    await trigger.click()
    
    const popover = page.locator('[role="dialog"]')
    await expect(popover).toBeVisible()
    
    await page.keyboard.press('Escape')
    await expect(popover).not.toBeVisible()
  })

  test('should handle form inside popover', async ({ page }) => {
    await page.goto('/iframe.html?id=components-popover--with-form')
    
    const trigger = page.locator('[data-radix-popover-trigger]').first()
    await trigger.click()
    
    // Fill form
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'test@example.com')
    
    // Submit
    await page.locator('button[type="submit"]').click()
    
    // Popover should close after submission
    const popover = page.locator('[role="dialog"]')
    await expect(popover).not.toBeVisible()
  })

  test('should be accessible', async ({ page }) => {
    const trigger = page.locator('[data-radix-popover-trigger]').first()
    
    // Check ARIA attributes
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    
    await trigger.click()
    
    const popover = page.locator('[role="dialog"]')
    await expect(popover).toHaveAttribute('aria-label')
    
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })
})
