import { test, expect } from '@playwright/test'

test.describe('Carousel Component E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=components-carousel--default')
  })

  test('should navigate through slides', async ({ page }) => {
    // Check first slide is visible
    const firstSlide = page.locator('[data-slide="0"]')
    await expect(firstSlide).toBeVisible()

    // Click next button
    const nextButton = page.locator('[aria-label="Next slide"]')
    await nextButton.click()

    // Second slide should be visible
    const secondSlide = page.locator('[data-slide="1"]')
    await expect(secondSlide).toBeVisible()
    await expect(firstSlide).not.toBeVisible()

    // Click previous button
    const prevButton = page.locator('[aria-label="Previous slide"]')
    await prevButton.click()

    // First slide should be visible again
    await expect(firstSlide).toBeVisible()
    await expect(secondSlide).not.toBeVisible()
  })

  test('should navigate with keyboard', async ({ page }) => {
    const carousel = page.locator('[role="region"][aria-label*="carousel"]')
    await carousel.focus()

    // Press right arrow
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('[data-slide="1"]')).toBeVisible()

    // Press right arrow again
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('[data-slide="2"]')).toBeVisible()

    // Press left arrow
    await page.keyboard.press('ArrowLeft')
    await expect(page.locator('[data-slide="1"]')).toBeVisible()
  })

  test('should handle dots/indicators navigation', async ({ page }) => {
    const dots = page.locator('[role="tab"][aria-label*="slide"]')
    const dotsCount = await dots.count()
    expect(dotsCount).toBeGreaterThan(0)

    // Click third dot
    await dots.nth(2).click()
    await expect(page.locator('[data-slide="2"]')).toBeVisible()

    // Click first dot
    await dots.nth(0).click()
    await expect(page.locator('[data-slide="0"]')).toBeVisible()
  })

  test('should handle auto-play', async ({ page }) => {
    await page.goto('/iframe.html?id=components-carousel--autoplay')

    // Get initial slide
    const firstSlide = page.locator('[data-slide="0"]')
    await expect(firstSlide).toBeVisible()

    // Wait for auto-play to advance
    await page.waitForTimeout(3500) // Assuming 3s interval

    // Should have advanced to next slide
    const secondSlide = page.locator('[data-slide="1"]')
    await expect(secondSlide).toBeVisible()
    await expect(firstSlide).not.toBeVisible()
  })

  test('should pause auto-play on hover', async ({ page }) => {
    await page.goto('/iframe.html?id=components-carousel--autoplay')

    const carousel = page.locator('[role="region"][aria-label*="carousel"]')
    
    // Hover to pause
    await carousel.hover()

    // Get current slide
    const currentSlideIndex = await page.evaluate(() => {
      const activeSlide = document.querySelector('[data-slide][aria-hidden="false"]')
      return activeSlide?.getAttribute('data-slide')
    })

    // Wait what would be the auto-play interval
    await page.waitForTimeout(3500)

    // Should still be on same slide
    const newSlideIndex = await page.evaluate(() => {
      const activeSlide = document.querySelector('[data-slide][aria-hidden="false"]')
      return activeSlide?.getAttribute('data-slide')
    })
    
    expect(newSlideIndex).toBe(currentSlideIndex)
  })

  test('should handle loop navigation', async ({ page }) => {
    await page.goto('/iframe.html?id=components-carousel--loop')

    const slides = page.locator('[data-slide]')
    const slidesCount = await slides.count()

    // Navigate to last slide
    const nextButton = page.locator('[aria-label="Next slide"]')
    for (let i = 0; i < slidesCount - 1; i++) {
      await nextButton.click()
      await page.waitForTimeout(300) // Wait for animation
    }

    // Check last slide is visible
    const lastSlide = page.locator(`[data-slide="${slidesCount - 1}"]`)
    await expect(lastSlide).toBeVisible()

    // Click next should go to first slide (loop)
    await nextButton.click()
    await expect(page.locator('[data-slide="0"]')).toBeVisible()
  })

  test('should handle swipe gestures on touch devices', async ({ page }) => {
    await page.goto('/iframe.html?id=components-carousel--touch')

    const carousel = page.locator('[role="region"][aria-label*="carousel"]')
    
    // Simulate swipe left
    await carousel.dispatchEvent('touchstart', { touches: [{ clientX: 300, clientY: 200 }] })
    await carousel.dispatchEvent('touchmove', { touches: [{ clientX: 100, clientY: 200 }] })
    await carousel.dispatchEvent('touchend', {})

    // Should navigate to next slide
    await expect(page.locator('[data-slide="1"]')).toBeVisible()

    // Simulate swipe right
    await carousel.dispatchEvent('touchstart', { touches: [{ clientX: 100, clientY: 200 }] })
    await carousel.dispatchEvent('touchmove', { touches: [{ clientX: 300, clientY: 200 }] })
    await carousel.dispatchEvent('touchend', {})

    // Should navigate back to previous slide
    await expect(page.locator('[data-slide="0"]')).toBeVisible()
  })

  test('should handle different orientations', async ({ page }) => {
    // Test vertical carousel
    await page.goto('/iframe.html?id=components-carousel--vertical')
    
    const carousel = page.locator('[data-orientation="vertical"]')
    await expect(carousel).toBeVisible()

    // Navigation should work vertically
    await carousel.focus()
    await page.keyboard.press('ArrowDown')
    await expect(page.locator('[data-slide="1"]')).toBeVisible()

    await page.keyboard.press('ArrowUp')
    await expect(page.locator('[data-slide="0"]')).toBeVisible()
  })

  test('should be accessible', async ({ page }) => {
    const carousel = page.locator('[role="region"][aria-label*="carousel"]')
    
    // Check ARIA attributes
    await expect(carousel).toHaveAttribute('aria-label')
    await expect(carousel).toHaveAttribute('aria-roledescription', 'carousel')

    // Check slides have proper attributes
    const slides = page.locator('[role="group"][aria-roledescription="slide"]')
    const slidesCount = await slides.count()
    expect(slidesCount).toBeGreaterThan(0)

    // Check navigation buttons
    const prevButton = page.locator('[aria-label="Previous slide"]')
    const nextButton = page.locator('[aria-label="Next slide"]')
    await expect(prevButton).toBeVisible()
    await expect(nextButton).toBeVisible()

    // Check live region for announcements
    const liveRegion = page.locator('[aria-live="polite"]')
    await expect(liveRegion).toBeVisible()
  })

  test('should handle multiple items per view', async ({ page }) => {
    await page.goto('/iframe.html?id=components-carousel--multiple-items')

    // Should show multiple items
    const visibleSlides = page.locator('[data-slide][aria-hidden="false"]')
    const visibleCount = await visibleSlides.count()
    expect(visibleCount).toBeGreaterThan(1)

    // Navigate should move by group
    const nextButton = page.locator('[aria-label="Next slide"]')
    await nextButton.click()

    // New set of items should be visible
    const newVisibleSlides = await page.locator('[data-slide][aria-hidden="false"]').count()
    expect(newVisibleSlides).toBeGreaterThan(1)
  })
})
