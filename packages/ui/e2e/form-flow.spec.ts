import { test, expect } from '@playwright/test';

test.describe('Form Flow E2E Tests', () => {
  test('complete form submission flow', async ({ page }) => {
    // Navigate to forms demo
    await page.goto('/iframe.html?id=components-forms-demo--default');
    
    // Fill out text input
    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.fill('John Doe');
    await expect(nameInput).toHaveValue('John Doe');
    
    // Fill email
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('john@example.com');
    await expect(emailInput).toHaveValue('john@example.com');
    
    // Select dropdown option
    const select = page.locator('select').first();
    await select.selectOption({ label: 'Option 2' });
    
    // Check checkbox
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verify form submission (check for success message or redirect)
    // This would depend on actual form implementation
  });

  test('form validation flow', async ({ page }) => {
    await page.goto('/iframe.html?id=components-forms-demo--validation');
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Check for validation errors
    const errorMessages = page.locator('.error-message');
    await expect(errorMessages).toHaveCount(3); // Assuming 3 required fields
    
    // Fill one field and verify error count decreases
    const firstInput = page.locator('input').first();
    await firstInput.fill('Valid input');
    await submitButton.click();
    
    await expect(errorMessages).toHaveCount(2);
  });

  test('keyboard navigation through form', async ({ page }) => {
    await page.goto('/iframe.html?id=components-forms-demo--default');
    
    // Tab through form elements
    await page.keyboard.press('Tab');
    const firstInput = page.locator('input').first();
    await expect(firstInput).toBeFocused();
    
    // Fill and tab to next
    await page.keyboard.type('Test Input');
    await page.keyboard.press('Tab');
    
    const secondInput = page.locator('input').nth(1);
    await expect(secondInput).toBeFocused();
    
    // Continue tabbing through all form elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Submit with Enter when button is focused
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.focus();
    await page.keyboard.press('Enter');
  });
});