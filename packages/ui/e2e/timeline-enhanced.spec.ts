import { test, expect } from '@playwright/test'

test.describe('TimelineEnhanced Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=components-timelineenhanced--default')
  })

  test('should display timeline events', async ({ page }) => {
    // Check events are visible
    await expect(page.locator('[role="article"]:has-text("Project Kickoff")')).toBeVisible()
    await expect(page.locator('[role="article"]:has-text("Design Phase")')).toBeVisible()
    await expect(page.locator('[role="article"]:has-text("Development Sprint 1")')).toBeVisible()
  })

  test('should show event details', async ({ page }) => {
    const event = page.locator('[role="article"]:has-text("Project Kickoff")')
    
    // Check event has required elements
    await expect(event.locator('.event-date')).toBeVisible()
    await expect(event.locator('.event-description')).toBeVisible()
    await expect(event.locator('.event-status')).toBeVisible()
  })

  test('should expand and collapse events', async ({ page }) => {
    await page.goto('/iframe.html?id=components-timelineenhanced--collapsible')
    
    const event = page.locator('[role="article"]:has-text("Project Kickoff")').first()
    
    // Initially collapsed
    await expect(event.locator('.event-details')).not.toBeVisible()
    
    // Click to expand
    await event.locator('button[aria-label="Expand"]').click()
    await expect(event.locator('.event-details')).toBeVisible()
    
    // Click to collapse
    await event.locator('button[aria-label="Collapse"]').click()
    await expect(event.locator('.event-details')).not.toBeVisible()
  })

  test('should show progress bars', async ({ page }) => {
    await page.goto('/iframe.html?id=components-timelineenhanced--with-progress')
    
    // Check progress bars are visible
    const progressBars = page.locator('[role="progressbar"]')
    const count = await progressBars.count()
    expect(count).toBeGreaterThan(0)
    
    // Check progress values
    const firstProgress = progressBars.first()
    await expect(firstProgress).toHaveAttribute('aria-valuenow')
  })

  test('should handle event click', async ({ page }) => {
    await page.goto('/iframe.html?id=components-timelineenhanced--interactive')
    
    // Click on event
    await page.locator('[role="article"]:has-text("Project Kickoff")').click()
    
    // Check event is selected/highlighted
    await expect(page.locator('.selected-event-info')).toBeVisible()
    await expect(page.locator('.selected-event-info')).toHaveText(/Project Kickoff/)
  })

  test('should filter events', async ({ page }) => {
    await page.goto('/iframe.html?id=components-timelineenhanced--with-filters')
    
    // Initially all events visible
    const allEvents = page.locator('[role="article"]')
    const initialCount = await allEvents.count()
    
    // Apply filter
    await page.locator('.filter-badge:has-text("Completed")').click()
    
    // Check filtered events
    const filteredCount = await allEvents.count()
    expect(filteredCount).toBeLessThan(initialCount)
    
    // Only completed events should be visible
    const visibleEvents = await allEvents.all()
    for (const event of visibleEvents) {
      await expect(event.locator('.status-completed')).toBeVisible()
    }
    
    // Clear filter
    await page.locator('button:has-text("Clear filters")').click()
    const clearedCount = await allEvents.count()
    expect(clearedCount).toBe(initialCount)
  })

  test('should group events by date', async ({ page }) => {
    await page.goto('/iframe.html?id=components-timelineenhanced--grouped-by-date')
    
    // Check date group headers
    await expect(page.locator('h3:has-text("January")')).toBeVisible()
    await expect(page.locator('h3:has-text("February")')).toBeVisible()
    
    // Events should be under correct groups
    const janGroup = page.locator('h3:has-text("January")').locator('..')
    await expect(janGroup.locator('[role="article"]:has-text("Project Kickoff")')).toBeVisible()
  })

  test('should display in cards variant', async ({ page }) => {
    await page.goto('/iframe.html?id=components-timelineenhanced--cards')
    
    // Check cards are displayed
    const cards = page.locator('.timeline-card')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
    
    // Cards should have specific styling
    const firstCard = cards.first()
    await expect(firstCard).toHaveClass(/shadow/)
  })

  test('should handle horizontal orientation', async ({ page }) => {
    await page.goto('/iframe.html?id=components-timelineenhanced--horizontal')
    
    // Check horizontal layout
    const timeline = page.locator('.timeline-container')
    await expect(timeline).toHaveClass(/flex-row/)
    
    // Events should be arranged horizontally
    const events = page.locator('[role="article"]')
    const firstEvent = await events.first().boundingBox()
    const secondEvent = await events.nth(1).boundingBox()
    
    // Second event should be to the right of first
    if (firstEvent && secondEvent) {
      expect(secondEvent.x).toBeGreaterThan(firstEvent.x)
    }
  })

  test('should show event metadata', async ({ page }) => {
    const event = page.locator('[role="article"]:has-text("Design Phase")')
    
    // Check metadata elements
    await expect(event.locator('.event-user')).toBeVisible()
    await expect(event.locator('.event-tags')).toBeVisible()
    await expect(event.locator('.event-location')).toBeVisible()
    await expect(event.locator('.event-attachments')).toBeVisible()
  })

  test('should display comments', async ({ page }) => {
    const event = page.locator('[role="article"]:has-text("Development Sprint 1")')
    
    // Check comments section
    await expect(event.locator('.event-comments')).toBeVisible()
    await expect(event.locator('.comment-count')).toHaveText(/2/)
    
    // Expand to see all comments
    await event.locator('button:has-text("View all comments")').click()
    
    // All comments should be visible
    const comments = event.locator('.comment-item')
    const count = await comments.count()
    expect(count).toBe(2)
  })

  test('should handle scrollable timeline', async ({ page }) => {
    await page.goto('/iframe.html?id=components-timelineenhanced--scrollable')
    
    // Timeline should be in scroll container
    const scrollContainer = page.locator('.timeline-scroll-container')
    await expect(scrollContainer).toHaveCSS('overflow-y', 'auto')
    
    // Scroll to bottom
    await scrollContainer.evaluate(el => el.scrollTop = el.scrollHeight)
    
    // Last event should be visible
    await expect(page.locator('[role="article"]').last()).toBeInViewport()
  })

  test('should be accessible', async ({ page }) => {
    // Check ARIA attributes
    const timeline = page.locator('[role="list"]')
    await expect(timeline).toHaveAttribute('aria-label', 'Timeline events')
    
    const events = page.locator('[role="article"]')
    const count = await events.count()
    expect(count).toBeGreaterThan(0)
    
    // Check event ARIA attributes
    const firstEvent = events.first()
    await expect(firstEvent).toHaveAttribute('aria-label')
    
    // Test keyboard navigation
    await firstEvent.focus()
    await page.keyboard.press('Tab')
    
    // Should move to next interactive element
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(['BUTTON', 'A', 'ARTICLE']).toContain(focusedElement)
  })
})