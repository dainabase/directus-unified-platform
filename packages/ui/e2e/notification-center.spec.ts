import { test, expect } from '@playwright/test';

test.describe('Notification Center Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notification-center');
  });

  test('should render the notification center interface', async ({ page }) => {
    const notificationCenter = await page.locator('[data-testid="notification-center"]');
    await expect(notificationCenter).toBeVisible();
    
    // Check for notification bell icon
    const bellIcon = await page.locator('[data-testid="notification-bell"]');
    await expect(bellIcon).toBeVisible();
  });

  test('should display notification badge with count', async ({ page }) => {
    // Trigger new notifications
    await page.click('[data-testid="trigger-notification"]');
    await page.click('[data-testid="trigger-notification"]');
    await page.click('[data-testid="trigger-notification"]');
    
    // Check badge count
    const badge = await page.locator('[data-testid="notification-badge"]');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('3');
  });

  test('should open notification panel on click', async ({ page }) => {
    // Click notification bell
    await page.click('[data-testid="notification-bell"]');
    
    // Verify panel is open
    const panel = await page.locator('[data-testid="notification-panel"]');
    await expect(panel).toBeVisible();
    
    // Check for notification list
    const notificationList = await page.locator('[data-testid="notification-list"]');
    await expect(notificationList).toBeVisible();
  });

  test('should display different notification types', async ({ page }) => {
    // Trigger different notification types
    await page.click('[data-testid="trigger-info-notification"]');
    await page.click('[data-testid="trigger-success-notification"]');
    await page.click('[data-testid="trigger-warning-notification"]');
    await page.click('[data-testid="trigger-error-notification"]');
    
    // Open notification panel
    await page.click('[data-testid="notification-bell"]');
    
    // Verify different types are displayed
    await expect(page.locator('[data-testid="notification-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-warning"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-error"]')).toBeVisible();
    
    // Check icons for each type
    await expect(page.locator('[data-testid="icon-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="icon-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="icon-warning"]')).toBeVisible();
    await expect(page.locator('[data-testid="icon-error"]')).toBeVisible();
  });

  test('should mark notifications as read', async ({ page }) => {
    // Create notifications
    await page.click('[data-testid="trigger-notification"]');
    await page.click('[data-testid="trigger-notification"]');
    
    // Open panel
    await page.click('[data-testid="notification-bell"]');
    
    // Get first unread notification
    const unreadNotification = await page.locator('[data-testid="notification-item"][data-read="false"]').first();
    await expect(unreadNotification).toBeVisible();
    
    // Click to mark as read
    await unreadNotification.click();
    
    // Verify it's marked as read
    await expect(unreadNotification).toHaveAttribute('data-read', 'true');
    
    // Badge count should decrease
    const badge = await page.locator('[data-testid="notification-badge"]');
    await expect(badge).toContainText('1');
  });

  test('should support mark all as read', async ({ page }) => {
    // Create multiple notifications
    for (let i = 0; i < 5; i++) {
      await page.click('[data-testid="trigger-notification"]');
    }
    
    // Open panel
    await page.click('[data-testid="notification-bell"]');
    
    // Click mark all as read
    await page.click('[data-testid="mark-all-read"]');
    
    // Verify all are marked as read
    const unreadNotifications = await page.locator('[data-testid="notification-item"][data-read="false"]');
    await expect(unreadNotifications).toHaveCount(0);
    
    // Badge should disappear
    const badge = await page.locator('[data-testid="notification-badge"]');
    await expect(badge).not.toBeVisible();
  });

  test('should delete individual notifications', async ({ page }) => {
    // Create notifications
    await page.click('[data-testid="trigger-notification"]');
    await page.click('[data-testid="trigger-notification"]');
    
    // Open panel
    await page.click('[data-testid="notification-bell"]');
    
    // Get initial count
    const initialCount = await page.locator('[data-testid="notification-item"]').count();
    
    // Delete first notification
    await page.hover('[data-testid="notification-item"]').first();
    await page.click('[data-testid="delete-notification-0"]');
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete"]');
    
    // Verify notification is removed
    const newCount = await page.locator('[data-testid="notification-item"]').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should clear all notifications', async ({ page }) => {
    // Create multiple notifications
    for (let i = 0; i < 5; i++) {
      await page.click('[data-testid="trigger-notification"]');
    }
    
    // Open panel
    await page.click('[data-testid="notification-bell"]');
    
    // Clear all
    await page.click('[data-testid="clear-all"]');
    
    // Confirm
    await page.click('[data-testid="confirm-clear-all"]');
    
    // Verify all are removed
    const notifications = await page.locator('[data-testid="notification-item"]');
    await expect(notifications).toHaveCount(0);
    
    // Show empty state
    const emptyState = await page.locator('[data-testid="empty-state"]');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No notifications');
  });

  test('should filter notifications by type', async ({ page }) => {
    // Create various notifications
    await page.click('[data-testid="trigger-info-notification"]');
    await page.click('[data-testid="trigger-info-notification"]');
    await page.click('[data-testid="trigger-error-notification"]');
    await page.click('[data-testid="trigger-success-notification"]');
    
    // Open panel
    await page.click('[data-testid="notification-bell"]');
    
    // Filter by error type
    await page.click('[data-testid="filter-dropdown"]');
    await page.click('[data-testid="filter-error"]');
    
    // Verify only error notifications are shown
    const visibleNotifications = await page.locator('[data-testid="notification-item"]:visible');
    await expect(visibleNotifications).toHaveCount(1);
    await expect(visibleNotifications.first()).toHaveAttribute('data-type', 'error');
    
    // Filter by info type
    await page.click('[data-testid="filter-dropdown"]');
    await page.click('[data-testid="filter-info"]');
    
    // Verify only info notifications are shown
    const infoNotifications = await page.locator('[data-testid="notification-item"]:visible');
    await expect(infoNotifications).toHaveCount(2);
  });

  test('should support notification actions', async ({ page }) => {
    // Create actionable notification
    await page.click('[data-testid="trigger-actionable-notification"]');
    
    // Open panel
    await page.click('[data-testid="notification-bell"]');
    
    // Find notification with actions
    const actionableNotification = await page.locator('[data-testid="notification-with-actions"]');
    await expect(actionableNotification).toBeVisible();
    
    // Check for action buttons
    const viewButton = await actionableNotification.locator('[data-testid="action-view"]');
    const dismissButton = await actionableNotification.locator('[data-testid="action-dismiss"]');
    
    await expect(viewButton).toBeVisible();
    await expect(dismissButton).toBeVisible();
    
    // Click view action
    await viewButton.click();
    
    // Verify action was triggered (could navigate or open modal)
    const actionResult = await page.locator('[data-testid="action-result"]');
    await expect(actionResult).toBeVisible();
  });

  test('should show notification timestamps', async ({ page }) => {
    // Create notification
    await page.click('[data-testid="trigger-notification"]');
    
    // Open panel
    await page.click('[data-testid="notification-bell"]');
    
    // Check for timestamp
    const timestamp = await page.locator('[data-testid="notification-timestamp"]').first();
    await expect(timestamp).toBeVisible();
    await expect(timestamp).toContainText(/now|seconds? ago|minutes? ago/);
  });

  test('should support notification preferences', async ({ page }) => {
    // Open panel
    await page.click('[data-testid="notification-bell"]');
    
    // Open preferences
    await page.click('[data-testid="notification-preferences"]');
    
    // Check preference options
    await expect(page.locator('[data-testid="pref-sound"]')).toBeVisible();
    await expect(page.locator('[data-testid="pref-desktop"]')).toBeVisible();
    await expect(page.locator('[data-testid="pref-email"]')).toBeVisible();
    
    // Toggle sound notifications
    await page.uncheck('[data-testid="pref-sound"]');
    
    // Save preferences
    await page.click('[data-testid="save-preferences"]');
    
    // Trigger notification without sound
    await page.click('[data-testid="trigger-notification"]');
    
    // Verify sound is disabled (check via attribute or class)
    const notification = await page.locator('[data-testid="notification-item"]').last();
    await expect(notification).toHaveAttribute('data-sound', 'false');
  });

  test('should paginate notifications', async ({ page }) => {
    // Create many notifications
    for (let i = 0; i < 25; i++) {
      await page.click('[data-testid="trigger-notification"]');
    }
    
    // Open panel
    await page.click('[data-testid="notification-bell"]');
    
    // Check pagination controls
    const pagination = await page.locator('[data-testid="notification-pagination"]');
    await expect(pagination).toBeVisible();
    
    // Verify first page shows limited items
    const firstPageItems = await page.locator('[data-testid="notification-item"]');
    await expect(firstPageItems).toHaveCount(10); // Assuming 10 per page
    
    // Go to next page
    await page.click('[data-testid="next-page"]');
    
    // Verify second page items
    const secondPageItems = await page.locator('[data-testid="notification-item"]');
    await expect(secondPageItems).toHaveCount(10);
    
    // Go to last page
    await page.click('[data-testid="last-page"]');
    
    // Verify last page has remaining items
    const lastPageItems = await page.locator('[data-testid="notification-item"]');
    await expect(lastPageItems).toHaveCount(5);
  });

  test('should support real-time notifications', async ({ page }) => {
    // Open panel
    await page.click('[data-testid="notification-bell"]');
    
    // Simulate real-time notification
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('new-notification', {
        detail: { title: 'Real-time notification', type: 'info' }
      }));
    });
    
    // Wait for notification to appear
    await page.waitForTimeout(100);
    
    // Verify new notification appears at top
    const firstNotification = await page.locator('[data-testid="notification-item"]').first();
    await expect(firstNotification).toContainText('Real-time notification');
    
    // Badge should update
    const badge = await page.locator('[data-testid="notification-badge"]');
    await expect(badge).toBeVisible();
  });
});
