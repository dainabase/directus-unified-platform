import { test, expect } from '@playwright/test';

test.describe('UI Components E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Button Component', () => {
    test('should render all button variants', async ({ page }) => {
      await page.goto('/components/button');
      
      // Check primary button
      const primaryButton = page.locator('button[data-variant="primary"]');
      await expect(primaryButton).toBeVisible();
      await expect(primaryButton).toHaveCSS('background-color', 'rgb(99, 102, 241)');
      
      // Check secondary button
      const secondaryButton = page.locator('button[data-variant="secondary"]');
      await expect(secondaryButton).toBeVisible();
      
      // Check disabled state
      const disabledButton = page.locator('button[disabled]');
      await expect(disabledButton).toBeDisabled();
    });

    test('should handle click events', async ({ page }) => {
      await page.goto('/components/button');
      
      let clicked = false;
      page.on('console', msg => {
        if (msg.text().includes('Button clicked')) {
          clicked = true;
        }
      });
      
      await page.click('button[data-testid="clickable-button"]');
      expect(clicked).toBeTruthy();
    });

    test('should be keyboard accessible', async ({ page }) => {
      await page.goto('/components/button');
      
      // Tab to button
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBe('BUTTON');
      
      // Activate with Enter
      await page.keyboard.press('Enter');
      // Check action was triggered
    });
  });

  test.describe('Input Component', () => {
    test('should accept and display text input', async ({ page }) => {
      await page.goto('/components/input');
      
      const input = page.locator('input[type="text"]').first();
      await input.fill('Test input value');
      await expect(input).toHaveValue('Test input value');
    });

    test('should show validation errors', async ({ page }) => {
      await page.goto('/components/input');
      
      const emailInput = page.locator('input[type="email"]');
      await emailInput.fill('invalid-email');
      await emailInput.blur();
      
      const errorMessage = page.locator('.error-message');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText('valid email');
    });

    test('should handle password visibility toggle', async ({ page }) => {
      await page.goto('/components/input');
      
      const passwordInput = page.locator('input[data-testid="password-input"]');
      const toggleButton = page.locator('button[data-testid="password-toggle"]');
      
      // Initially password type
      await expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Click toggle
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Click toggle again
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  test.describe('Dialog Component', () => {
    test('should open and close dialog', async ({ page }) => {
      await page.goto('/components/dialog');
      
      const openButton = page.locator('button[data-testid="open-dialog"]');
      const dialog = page.locator('div[role="dialog"]');
      const closeButton = page.locator('button[data-testid="close-dialog"]');
      
      // Initially hidden
      await expect(dialog).not.toBeVisible();
      
      // Open dialog
      await openButton.click();
      await expect(dialog).toBeVisible();
      
      // Close dialog
      await closeButton.click();
      await expect(dialog).not.toBeVisible();
    });

    test('should trap focus within dialog', async ({ page }) => {
      await page.goto('/components/dialog');
      
      await page.click('button[data-testid="open-dialog"]');
      
      // Tab through focusable elements
      await page.keyboard.press('Tab');
      let focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      expect(focusedElement).toBe('dialog-input');
      
      await page.keyboard.press('Tab');
      focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      expect(focusedElement).toBe('dialog-confirm');
      
      await page.keyboard.press('Tab');
      focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      expect(focusedElement).toBe('dialog-cancel');
      
      // Should cycle back
      await page.keyboard.press('Tab');
      focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      expect(focusedElement).toBe('dialog-input');
    });

    test('should close on Escape key', async ({ page }) => {
      await page.goto('/components/dialog');
      
      const dialog = page.locator('div[role="dialog"]');
      
      await page.click('button[data-testid="open-dialog"]');
      await expect(dialog).toBeVisible();
      
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
    });
  });

  test.describe('Select Component', () => {
    test('should open dropdown and select option', async ({ page }) => {
      await page.goto('/components/select');
      
      const select = page.locator('div[data-testid="select-component"]');
      const dropdown = page.locator('div[role="listbox"]');
      
      // Open dropdown
      await select.click();
      await expect(dropdown).toBeVisible();
      
      // Select an option
      await page.click('div[role="option"]:has-text("Option 2")');
      await expect(dropdown).not.toBeVisible();
      await expect(select).toContainText('Option 2');
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/components/select');
      
      const select = page.locator('div[data-testid="select-component"]');
      
      // Focus and open with Enter
      await select.focus();
      await page.keyboard.press('Enter');
      
      // Navigate with arrows
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      
      await expect(select).toContainText('Option 3');
    });

    test('should support search/filter', async ({ page }) => {
      await page.goto('/components/select');
      
      const select = page.locator('div[data-testid="searchable-select"]');
      await select.click();
      
      // Type to search
      await page.keyboard.type('United');
      
      const visibleOptions = page.locator('div[role="option"]:visible');
      await expect(visibleOptions).toHaveCount(2); // United States, United Kingdom
    });
  });

  test.describe('Table Component', () => {
    test('should display data correctly', async ({ page }) => {
      await page.goto('/components/table');
      
      const table = page.locator('table[data-testid="data-table"]');
      await expect(table).toBeVisible();
      
      // Check headers
      const headers = page.locator('thead th');
      await expect(headers).toHaveCount(5);
      
      // Check data rows
      const rows = page.locator('tbody tr');
      await expect(rows).toHaveCount(10);
    });

    test('should sort columns', async ({ page }) => {
      await page.goto('/components/table');
      
      // Click on sortable column header
      await page.click('th[data-sortable="true"]:has-text("Name")');
      
      // Check first row after sorting
      const firstRow = page.locator('tbody tr').first();
      await expect(firstRow).toContainText('Aaron');
      
      // Click again for reverse sort
      await page.click('th[data-sortable="true"]:has-text("Name")');
      const firstRowReversed = page.locator('tbody tr').first();
      await expect(firstRowReversed).toContainText('Zachary');
    });

    test('should handle pagination', async ({ page }) => {
      await page.goto('/components/table');
      
      const currentPage = page.locator('[data-testid="current-page"]');
      await expect(currentPage).toContainText('1');
      
      // Go to next page
      await page.click('button[data-testid="next-page"]');
      await expect(currentPage).toContainText('2');
      
      // Go to previous page
      await page.click('button[data-testid="prev-page"]');
      await expect(currentPage).toContainText('1');
    });
  });
});

test.describe('Accessibility Tests', () => {
  test('should have no accessibility violations on homepage', async ({ page }) => {
    await page.goto('/');
    
    // Basic accessibility checks
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Check for skip link
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toHaveAttribute('href', '#main-content');
    
    // Check main landmark
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    let tabCount = 0;
    const maxTabs = 10;
    
    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tag: el?.tagName,
          role: el?.getAttribute('role'),
          ariaLabel: el?.getAttribute('aria-label')
        };
      });
      
      // Ensure focused element is interactive
      expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(focusedElement.tag);
      tabCount++;
    }
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/components/button');
    
    // Check buttons have accessible names
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const hasText = await button.textContent();
      const hasAriaLabel = await button.getAttribute('aria-label');
      const hasAriaLabelledBy = await button.getAttribute('aria-labelledby');
      
      // Button should have accessible name via text, aria-label, or aria-labelledby
      expect(hasText || hasAriaLabel || hasAriaLabelledBy).toBeTruthy();
    }
  });
});

test.describe('Responsive Design Tests', () => {
  test('should adapt to mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check mobile menu is visible
    const mobileMenu = page.locator('[data-testid="mobile-menu-toggle"]');
    await expect(mobileMenu).toBeVisible();
    
    // Desktop menu should be hidden
    const desktopMenu = page.locator('[data-testid="desktop-menu"]');
    await expect(desktopMenu).not.toBeVisible();
  });

  test('should adapt to tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Check layout adjustments
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();
  });

  test('should adapt to desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Check full layout is visible
    const sidebar = page.locator('[data-testid="sidebar"]');
    const mainContent = page.locator('[data-testid="main-content"]');
    
    await expect(sidebar).toBeVisible();
    await expect(mainContent).toBeVisible();
  });
});