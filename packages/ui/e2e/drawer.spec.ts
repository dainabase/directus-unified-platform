import { test, expect } from '@playwright/test'

test.describe('Drawer Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=components-drawer--default')
  })

  test('should open and close drawer on button click', async ({ page }) => {
    // Check drawer is not visible initially
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()

    // Click open button
    await page.locator('button:has-text("Open Drawer")').click()

    // Check drawer is visible
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.locator('h2:has-text("Edit Profile")')).toBeVisible()

    // Close drawer
    await page.locator('button[aria-label="Close"]').click()

    // Check drawer is hidden
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('should handle different positions', async ({ page }) => {
    // Test right position (default)
    await page.goto('/iframe.html?id=components-drawer--right')
    await page.locator('button:has-text("Open Right Drawer")').click()
    await expect(page.locator('[data-position="right"]')).toBeVisible()
    await page.keyboard.press('Escape')

    // Test left position
    await page.goto('/iframe.html?id=components-drawer--left')
    await page.locator('button:has-text("Open Left Drawer")').click()
    await expect(page.locator('[data-position="left"]')).toBeVisible()
    await page.keyboard.press('Escape')

    // Test top position
    await page.goto('/iframe.html?id=components-drawer--top')
    await page.locator('button:has-text("Open Top Drawer")').click()
    await expect(page.locator('[data-position="top"]')).toBeVisible()
    await page.keyboard.press('Escape')

    // Test bottom position
    await page.goto('/iframe.html?id=components-drawer--bottom')
    await page.locator('button:has-text("Open Bottom Drawer")').click()
    await expect(page.locator('[data-position="bottom"]')).toBeVisible()
    await page.keyboard.press('Escape')
  })

  test('should close on Escape key press', async ({ page }) => {
    await page.locator('button:has-text("Open Drawer")').click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('should close on overlay click', async ({ page }) => {
    await page.locator('button:has-text("Open Drawer")').click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Click on overlay
    await page.locator('[data-radix-dialog-overlay]').click({ position: { x: 10, y: 10 } })
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('should handle form submission inside drawer', async ({ page }) => {
    await page.goto('/iframe.html?id=components-drawer--with-form')
    await page.locator('button:has-text("Open Form Drawer")').click()

    // Fill form
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="email"]', 'john@example.com')

    // Submit form
    await page.locator('button[type="submit"]').click()

    // Check drawer closes after successful submission
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('should be accessible', async ({ page }) => {
    await page.locator('button:has-text("Open Drawer")').click()

    // Check ARIA attributes
    const drawer = page.locator('[role="dialog"]')
    await expect(drawer).toHaveAttribute('aria-modal', 'true')

    // Check focus trap
    await page.keyboard.press('Tab')
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(['BUTTON', 'INPUT']).toContain(focusedElement)
  })

  test('should handle different sizes', async ({ page }) => {
    // Test default size
    await page.goto('/iframe.html?id=components-drawer--default')
    await page.locator('button:has-text("Open Drawer")').click()
    const defaultDrawer = page.locator('[role="dialog"]')
    const defaultWidth = await defaultDrawer.evaluate(el => window.getComputedStyle(el).width)
    await page.keyboard.press('Escape')

    // Test large size
    await page.goto('/iframe.html?id=components-drawer--large')
    await page.locator('button:has-text("Open Large Drawer")').click()
    const largeDrawer = page.locator('[role="dialog"]')
    const largeWidth = await largeDrawer.evaluate(el => window.getComputedStyle(el).width)
    
    // Large drawer should be wider than default
    expect(parseInt(largeWidth)).toBeGreaterThan(parseInt(defaultWidth))
  })
})