import { test, expect } from '@playwright/test';

test.describe('Theme Builder Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/theme-builder');
  });

  test('should render the theme builder interface', async ({ page }) => {
    const themeBuilder = await page.locator('[data-testid="theme-builder"]');
    await expect(themeBuilder).toBeVisible();
    
    // Check for main sections
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible();
    await expect(page.locator('[data-testid="typography-settings"]')).toBeVisible();
    await expect(page.locator('[data-testid="spacing-settings"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-panel"]')).toBeVisible();
  });

  test('should customize primary colors', async ({ page }) => {
    // Open color palette
    await page.click('[data-testid="color-palette-tab"]');
    
    // Change primary color
    const primaryColorInput = await page.locator('[data-testid="primary-color-input"]');
    await primaryColorInput.clear();
    await primaryColorInput.fill('#FF5733');
    
    // Verify preview updates
    const previewButton = await page.locator('[data-testid="preview-primary-button"]');
    const buttonColor = await previewButton.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(buttonColor).toContain('rgb(255, 87, 51)'); // #FF5733 in RGB
    
    // Test color picker
    await page.click('[data-testid="primary-color-picker"]');
    await page.click('[data-testid="color-picker-blue"]');
    
    // Verify color updated
    const newColor = await primaryColorInput.inputValue();
    expect(newColor).toMatch(/#[0-9A-F]{6}/i);
  });

  test('should customize typography settings', async ({ page }) => {
    // Open typography section
    await page.click('[data-testid="typography-tab"]');
    
    // Change font family
    await page.selectOption('[data-testid="font-family-select"]', 'Roboto');
    
    // Change base font size
    await page.fill('[data-testid="base-font-size"]', '18');
    
    // Change heading scale
    await page.selectOption('[data-testid="heading-scale"]', '1.25');
    
    // Verify preview updates
    const previewText = await page.locator('[data-testid="preview-text"]');
    const fontSize = await previewText.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    expect(fontSize).toBe('18px');
    
    const previewHeading = await page.locator('[data-testid="preview-h1"]');
    const fontFamily = await previewHeading.evaluate(el => 
      window.getComputedStyle(el).fontFamily
    );
    expect(fontFamily).toContain('Roboto');
  });

  test('should customize spacing system', async ({ page }) => {
    // Open spacing section
    await page.click('[data-testid="spacing-tab"]');
    
    // Change base spacing unit
    await page.fill('[data-testid="base-spacing"]', '8');
    
    // Verify spacing scale updates
    const spacingScale = await page.locator('[data-testid="spacing-scale"]');
    await expect(spacingScale).toContainText('8px'); // 1x
    await expect(spacingScale).toContainText('16px'); // 2x
    await expect(spacingScale).toContainText('24px'); // 3x
    await expect(spacingScale).toContainText('32px'); // 4x
    
    // Test in preview
    const previewCard = await page.locator('[data-testid="preview-card"]');
    const padding = await previewCard.evaluate(el => 
      window.getComputedStyle(el).padding
    );
    expect(padding).toContain('16px'); // 2x spacing
  });

  test('should customize border radius', async ({ page }) => {
    // Open borders section
    await page.click('[data-testid="borders-tab"]');
    
    // Change border radius
    await page.fill('[data-testid="border-radius-base"]', '12');
    
    // Test different radius options
    await page.click('[data-testid="radius-preset-none"]');
    let previewButton = await page.locator('[data-testid="preview-button"]');
    let borderRadius = await previewButton.evaluate(el => 
      window.getComputedStyle(el).borderRadius
    );
    expect(borderRadius).toBe('0px');
    
    await page.click('[data-testid="radius-preset-full"]');
    borderRadius = await previewButton.evaluate(el => 
      window.getComputedStyle(el).borderRadius
    );
    expect(borderRadius).toContain('9999px');
  });

  test('should switch between light and dark modes', async ({ page }) => {
    // Check current mode
    const modeToggle = await page.locator('[data-testid="mode-toggle"]');
    await expect(modeToggle).toHaveAttribute('data-mode', 'light');
    
    // Switch to dark mode
    await modeToggle.click();
    await expect(modeToggle).toHaveAttribute('data-mode', 'dark');
    
    // Verify dark mode colors
    const background = await page.locator('[data-testid="preview-panel"]');
    const bgColor = await background.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgColor).toContain('rgb('); // Should be dark color
    
    // Customize dark mode separately
    await page.fill('[data-testid="dark-background-color"]', '#1a1a1a');
    await page.fill('[data-testid="dark-text-color"]', '#ffffff');
    
    // Switch back to light mode
    await modeToggle.click();
    
    // Verify light mode is preserved
    await expect(modeToggle).toHaveAttribute('data-mode', 'light');
  });

  test('should apply theme presets', async ({ page }) => {
    // Open presets
    await page.click('[data-testid="presets-dropdown"]');
    
    // Select Material Design preset
    await page.click('[data-testid="preset-material"]');
    
    // Verify Material Design colors applied
    const primaryColor = await page.inputValue('[data-testid="primary-color-input"]');
    expect(primaryColor).toBe('#2196F3'); // Material Blue
    
    // Select Dark preset
    await page.click('[data-testid="presets-dropdown"]');
    await page.click('[data-testid="preset-dark"]');
    
    // Verify dark preset applied
    const modeToggle = await page.locator('[data-testid="mode-toggle"]');
    await expect(modeToggle).toHaveAttribute('data-mode', 'dark');
  });

  test('should export theme configuration', async ({ page }) => {
    // Customize theme
    await page.fill('[data-testid="primary-color-input"]', '#FF5733');
    await page.selectOption('[data-testid="font-family-select"]', 'Inter');
    await page.fill('[data-testid="base-spacing"]', '4');
    
    // Export theme
    await page.click('[data-testid="export-theme"]');
    
    // Check export formats
    await expect(page.locator('[data-testid="export-format-css"]')).toBeVisible();
    await expect(page.locator('[data-testid="export-format-json"]')).toBeVisible();
    await expect(page.locator('[data-testid="export-format-sass"]')).toBeVisible();
    
    // Export as JSON
    await page.click('[data-testid="export-format-json"]');
    await page.click('[data-testid="download-theme"]');
    
    // Verify export content
    const exportContent = await page.locator('[data-testid="export-preview"]').textContent();
    expect(exportContent).toContain('"primary": "#FF5733"');
    expect(exportContent).toContain('"fontFamily": "Inter"');
    expect(exportContent).toContain('"baseSpacing": 4');
  });

  test('should import theme configuration', async ({ page }) => {
    // Open import dialog
    await page.click('[data-testid="import-theme"]');
    
    // Paste theme JSON
    const themeJson = JSON.stringify({
      colors: { primary: '#00BCD4' },
      typography: { fontFamily: 'Helvetica' },
      spacing: { base: 6 }
    });
    
    await page.fill('[data-testid="import-json-input"]', themeJson);
    
    // Import theme
    await page.click('[data-testid="confirm-import"]');
    
    // Verify imported values
    const primaryColor = await page.inputValue('[data-testid="primary-color-input"]');
    expect(primaryColor).toBe('#00BCD4');
    
    const fontFamily = await page.inputValue('[data-testid="font-family-select"]');
    expect(fontFamily).toBe('Helvetica');
    
    const baseSpacing = await page.inputValue('[data-testid="base-spacing"]');
    expect(baseSpacing).toBe('6');
  });

  test('should generate CSS variables', async ({ page }) => {
    // Customize theme
    await page.fill('[data-testid="primary-color-input"]', '#FF5733');
    await page.fill('[data-testid="secondary-color-input"]', '#33FF57');
    
    // View generated CSS
    await page.click('[data-testid="view-css-variables"]');
    
    // Check CSS variables
    const cssVariables = await page.locator('[data-testid="css-variables-output"]');
    await expect(cssVariables).toContainText('--color-primary: #FF5733');
    await expect(cssVariables).toContainText('--color-secondary: #33FF57');
    
    // Copy CSS
    await page.click('[data-testid="copy-css"]');
    
    // Verify copy success
    const copySuccess = await page.locator('[data-testid="copy-success"]');
    await expect(copySuccess).toBeVisible();
  });

  test('should show live preview of components', async ({ page }) => {
    // Check preview components
    await expect(page.locator('[data-testid="preview-buttons"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-forms"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-cards"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-alerts"]')).toBeVisible();
    
    // Change primary color
    await page.fill('[data-testid="primary-color-input"]', '#9C27B0');
    
    // Verify all preview components update
    const primaryButton = await page.locator('[data-testid="preview-primary-button"]');
    const buttonBg = await primaryButton.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(buttonBg).toContain('rgb(156, 39, 176)'); // #9C27B0 in RGB
  });

  test('should save and load theme profiles', async ({ page }) => {
    // Customize theme
    await page.fill('[data-testid="primary-color-input"]', '#E91E63');
    await page.selectOption('[data-testid="font-family-select"]', 'Poppins');
    
    // Save theme profile
    await page.click('[data-testid="save-profile"]');
    await page.fill('[data-testid="profile-name-input"]', 'My Brand Theme');
    await page.click('[data-testid="confirm-save-profile"]');
    
    // Reset theme
    await page.click('[data-testid="reset-theme"]');
    
    // Load saved profile
    await page.click('[data-testid="load-profile"]');
    await page.click('[data-testid="profile-my-brand-theme"]');
    
    // Verify profile loaded
    const primaryColor = await page.inputValue('[data-testid="primary-color-input"]');
    expect(primaryColor).toBe('#E91E63');
    
    const fontFamily = await page.inputValue('[data-testid="font-family-select"]');
    expect(fontFamily).toBe('Poppins');
  });

  test('should validate color contrast', async ({ page }) => {
    // Set colors with poor contrast
    await page.fill('[data-testid="primary-color-input"]', '#FFFF00'); // Yellow
    await page.fill('[data-testid="text-on-primary"]', '#FFFFFF'); // White on yellow
    
    // Check contrast warning
    const contrastWarning = await page.locator('[data-testid="contrast-warning"]');
    await expect(contrastWarning).toBeVisible();
    await expect(contrastWarning).toContainText('Poor contrast');
    
    // Fix contrast
    await page.fill('[data-testid="text-on-primary"]', '#000000'); // Black on yellow
    
    // Warning should disappear
    await expect(contrastWarning).not.toBeVisible();
    
    // Check contrast ratio display
    const contrastRatio = await page.locator('[data-testid="contrast-ratio"]');
    await expect(contrastRatio).toContainText('21:1'); // Perfect contrast
  });

  test('should support undo/redo functionality', async ({ page }) => {
    // Make changes
    const originalColor = await page.inputValue('[data-testid="primary-color-input"]');
    await page.fill('[data-testid="primary-color-input"]', '#FF0000');
    await page.fill('[data-testid="primary-color-input"]', '#00FF00');
    await page.fill('[data-testid="primary-color-input"]', '#0000FF');
    
    // Undo
    await page.click('[data-testid="undo-button"]');
    let currentColor = await page.inputValue('[data-testid="primary-color-input"]');
    expect(currentColor).toBe('#00FF00');
    
    // Undo again
    await page.click('[data-testid="undo-button"]');
    currentColor = await page.inputValue('[data-testid="primary-color-input"]');
    expect(currentColor).toBe('#FF0000');
    
    // Redo
    await page.click('[data-testid="redo-button"]');
    currentColor = await page.inputValue('[data-testid="primary-color-input"]');
    expect(currentColor).toBe('#00FF00');
  });
});
