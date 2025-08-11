import { test, expect, Page } from '@playwright/test';

test.describe('CodeEditor Component', () => {
  let page: Page;
  
  test.beforeEach(async ({ page: p }) => {
    page = p;
    await page.goto('/components/code-editor');
  });
  
  test('should render code editor with default state', async () => {
    await expect(page.locator('[data-testid="code-editor"]')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('text=JavaScript')).toBeVisible();
  });
  
  test('should display language selector with options', async () => {
    const languageSelector = page.locator('[data-testid="language-selector"]');
    await languageSelector.click();
    
    await expect(page.locator('text=JavaScript')).toBeVisible();
    await expect(page.locator('text=TypeScript')).toBeVisible();
    await expect(page.locator('text=Python')).toBeVisible();
    await expect(page.locator('text=HTML')).toBeVisible();
    await expect(page.locator('text=CSS')).toBeVisible();
    await expect(page.locator('text=JSON')).toBeVisible();
    await expect(page.locator('text=SQL')).toBeVisible();
  });
  
  test('should change theme', async () => {
    const themeSelector = page.locator('[data-testid="theme-selector"]');
    await themeSelector.click();
    
    await page.locator('text=Dark').click();
    const editor = page.locator('[data-testid="code-editor"]');
    const bgColor = await editor.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(bgColor).toContain('30, 30, 30'); // Dark theme background
    
    await themeSelector.click();
    await page.locator('text=Light').click();
    const bgColorLight = await editor.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(bgColorLight).toContain('255, 255, 255'); // Light theme background
  });
  
  test('should type and display code', async () => {
    const textarea = page.locator('textarea');
    await textarea.clear();
    await textarea.type('function test() {\n  return "Hello World";\n}');
    
    const value = await textarea.inputValue();
    expect(value).toContain('function test()');
    expect(value).toContain('Hello World');
  });
  
  test('should show line numbers when enabled', async () => {
    const lineNumberToggle = page.locator('[data-testid="line-numbers-toggle"]');
    await lineNumberToggle.click();
    
    await expect(page.locator('[data-testid="line-numbers"]')).toBeVisible();
    await expect(page.locator('text=/^1$/')).toBeVisible();
    
    // Add more lines
    const textarea = page.locator('textarea');
    await textarea.fill('line 1\nline 2\nline 3\nline 4\nline 5');
    
    await expect(page.locator('text=/^5$/')).toBeVisible();
  });
  
  test('should handle tab key to insert spaces', async () => {
    const textarea = page.locator('textarea');
    await textarea.clear();
    await textarea.type('function test() {');
    await textarea.press('Enter');
    await textarea.press('Tab');
    await textarea.type('return true;');
    
    const value = await textarea.inputValue();
    expect(value).toContain('  return true;'); // Default 2 spaces for tab
  });
  
  test('should handle undo and redo', async () => {
    const textarea = page.locator('textarea');
    await textarea.clear();
    await textarea.type('first text');
    await page.waitForTimeout(100);
    await textarea.type(' second text');
    
    // Undo
    await page.keyboard.press('Control+z');
    let value = await textarea.inputValue();
    expect(value).toBe('first text');
    
    // Redo
    await page.keyboard.press('Control+Shift+z');
    value = await textarea.inputValue();
    expect(value).toBe('first text second text');
  });
  
  test('should open search with Ctrl+F', async () => {
    await page.keyboard.press('Control+f');
    
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeFocused();
  });
  
  test('should search and highlight text', async () => {
    const textarea = page.locator('textarea');
    await textarea.fill('const variable = "test";\nconst another = "value";');
    
    await page.keyboard.press('Control+f');
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.type('const');
    await page.locator('button:has-text("Find")').click();
    
    // Check if text is selected/highlighted
    const selection = await textarea.evaluate(() => {
      const el = document.activeElement as HTMLTextAreaElement;
      return {
        start: el.selectionStart,
        end: el.selectionEnd,
        text: el.value.substring(el.selectionStart, el.selectionEnd)
      };
    });
    
    expect(selection.text).toBe('const');
  });
  
  test('should replace text', async () => {
    const textarea = page.locator('textarea');
    await textarea.fill('let variable = "test";');
    
    await page.keyboard.press('Control+h');
    const searchInput = page.locator('[data-testid="search-input"]');
    const replaceInput = page.locator('[data-testid="replace-input"]');
    
    await searchInput.type('let');
    await replaceInput.type('const');
    await page.locator('button:has-text("Replace All")').click();
    
    const value = await textarea.inputValue();
    expect(value).toContain('const variable');
    expect(value).not.toContain('let variable');
  });
  
  test('should save with Ctrl+S', async () => {
    const textarea = page.locator('textarea');
    await textarea.fill('new content');
    
    // Check dirty state
    await expect(page.locator('[data-testid="dirty-indicator"]')).toBeVisible();
    
    await page.keyboard.press('Control+s');
    
    // Check clean state after save
    await expect(page.locator('[data-testid="dirty-indicator"]')).not.toBeVisible();
  });
  
  test('should format code', async () => {
    const textarea = page.locator('textarea');
    await textarea.fill('function test(){return true;}');
    
    await page.locator('button[data-testid="format-button"]').click();
    
    // Basic formatting should add spaces
    const value = await textarea.inputValue();
    expect(value).toMatch(/function test\(\)\s*{\s*return true;\s*}/);
  });
  
  test('should toggle word wrap', async () => {
    const wrapToggle = page.locator('[data-testid="word-wrap-toggle"]');
    const textarea = page.locator('textarea');
    
    // Add long line
    await textarea.fill('const veryLongLineOfCodeThatShouldWrapWhenWordWrapIsEnabledOtherwiseItWillExtendBeyondTheVisibleArea = "test";');
    
    // Enable word wrap
    await wrapToggle.click();
    const wrapStyle = await textarea.evaluate(el => window.getComputedStyle(el).whiteSpace);
    expect(wrapStyle).toBe('pre-wrap');
    
    // Disable word wrap
    await wrapToggle.click();
    const noWrapStyle = await textarea.evaluate(el => window.getComputedStyle(el).whiteSpace);
    expect(noWrapStyle).toBe('pre');
  });
  
  test('should toggle minimap', async () => {
    const minimapToggle = page.locator('[data-testid="minimap-toggle"]');
    
    await minimapToggle.click();
    await expect(page.locator('[data-testid="minimap"]')).toBeVisible();
    
    await minimapToggle.click();
    await expect(page.locator('[data-testid="minimap"]')).not.toBeVisible();
  });
  
  test('should toggle fullscreen mode', async () => {
    const fullscreenButton = page.locator('[data-testid="fullscreen-button"]');
    const editor = page.locator('[data-testid="code-editor"]');
    
    await fullscreenButton.click();
    await expect(editor).toHaveClass(/.*fixed.*inset-0.*/);
    
    await fullscreenButton.click();
    await expect(editor).not.toHaveClass(/.*fixed.*inset-0.*/);
  });
  
  test('should show autocomplete suggestions', async () => {
    const textarea = page.locator('textarea');
    await textarea.clear();
    await textarea.type('con');
    
    // Wait for autocomplete
    await page.waitForTimeout(300);
    
    const autocomplete = page.locator('[data-testid="autocomplete-dropdown"]');
    await expect(autocomplete).toBeVisible();
    await expect(page.locator('text=const')).toBeVisible();
    await expect(page.locator('text=console')).toBeVisible();
  });
  
  test('should navigate autocomplete with keyboard', async () => {
    const textarea = page.locator('textarea');
    await textarea.clear();
    await textarea.type('fun');
    
    await page.waitForTimeout(300);
    
    // Navigate down
    await page.keyboard.press('ArrowDown');
    const selectedItem = page.locator('[data-testid="autocomplete-item"].selected');
    await expect(selectedItem).toBeVisible();
    
    // Select with Enter
    await page.keyboard.press('Enter');
    const value = await textarea.inputValue();
    expect(value).toContain('function');
  });
  
  test('should handle bracket matching', async () => {
    const textarea = page.locator('textarea');
    await textarea.clear();
    
    // Type opening bracket
    await textarea.type('(');
    let value = await textarea.inputValue();
    expect(value).toBe('()'); // Auto-close bracket
    
    // Cursor should be between brackets
    const cursorPos = await textarea.evaluate(el => (el as HTMLTextAreaElement).selectionStart);
    expect(cursorPos).toBe(1);
  });
  
  test('should handle multiple tabs', async () => {
    // Click new tab button
    await page.locator('button[data-testid="new-tab-button"]').click();
    
    const tabs = page.locator('[data-testid="editor-tab"]');
    await expect(tabs).toHaveCount(2);
    
    // Switch between tabs
    await tabs.first().click();
    await expect(tabs.first()).toHaveClass(/.*active.*/);
    
    await tabs.last().click();
    await expect(tabs.last()).toHaveClass(/.*active.*/);
  });
  
  test('should close tabs', async () => {
    // Add new tab
    await page.locator('button[data-testid="new-tab-button"]').click();
    
    let tabs = page.locator('[data-testid="editor-tab"]');
    await expect(tabs).toHaveCount(2);
    
    // Close tab
    await page.locator('[data-testid="close-tab-button"]').first().click();
    tabs = page.locator('[data-testid="editor-tab"]');
    await expect(tabs).toHaveCount(1);
  });
  
  test('should show file explorer', async () => {
    const fileExplorerToggle = page.locator('[data-testid="file-explorer-toggle"]');
    await fileExplorerToggle.click();
    
    const fileExplorer = page.locator('[data-testid="file-explorer"]');
    await expect(fileExplorer).toBeVisible();
    await expect(page.locator('text=Files')).toBeVisible();
  });
  
  test('should expand/collapse folders in file explorer', async () => {
    await page.locator('[data-testid="file-explorer-toggle"]').click();
    
    const folder = page.locator('[data-testid="folder-node"]').first();
    const chevron = folder.locator('[data-testid="folder-chevron"]');
    
    // Initially expanded
    await expect(chevron).toHaveClass(/.*chevron-down.*/);
    
    // Collapse
    await folder.click();
    await expect(chevron).toHaveClass(/.*chevron-right.*/);
    
    // Expand
    await folder.click();
    await expect(chevron).toHaveClass(/.*chevron-down.*/);
  });
  
  test('should open file from explorer', async () => {
    await page.locator('[data-testid="file-explorer-toggle"]').click();
    
    const file = page.locator('[data-testid="file-node"]').first();
    await file.click();
    
    // Should create new tab with file content
    const tabs = page.locator('[data-testid="editor-tab"]');
    await expect(tabs).toHaveCount(2);
  });
  
  test('should show console output', async () => {
    const textarea = page.locator('textarea');
    await textarea.fill('console.log("test output");');
    
    // Run code
    await page.locator('button[data-testid="run-button"]').click();
    
    const consolePanel = page.locator('[data-testid="console-panel"]');
    await expect(consolePanel).toBeVisible();
    await expect(page.locator('text=test output')).toBeVisible();
  });
  
  test('should display cursor position', async () => {
    const textarea = page.locator('textarea');
    await textarea.fill('line 1\nline 2\nline 3');
    
    // Move cursor to line 2
    await textarea.click();
    await page.keyboard.press('ArrowDown');
    
    const cursorInfo = page.locator('[data-testid="cursor-position"]');
    await expect(cursorInfo).toContainText('Ln 2');
  });
  
  test('should show validation errors', async () => {
    const textarea = page.locator('textarea');
    await textarea.fill('const x = ;'); // Invalid syntax
    
    await page.waitForTimeout(500); // Wait for validation
    
    const errorPanel = page.locator('[data-testid="validation-errors"]');
    await expect(errorPanel).toBeVisible();
    await expect(page.locator('text=/Unexpected token/i')).toBeVisible();
  });
  
  test('should handle read-only mode', async () => {
    // Set to read-only
    await page.evaluate(() => {
      const editor = document.querySelector('[data-testid="code-editor"]');
      if (editor) editor.setAttribute('data-readonly', 'true');
    });
    
    const textarea = page.locator('textarea');
    const isReadOnly = await textarea.getAttribute('readonly');
    expect(isReadOnly).toBeTruthy();
    
    // Try to type
    await textarea.click();
    await page.keyboard.type('new text');
    
    // Content should not change
    const value = await textarea.inputValue();
    expect(value).not.toContain('new text');
  });
  
  test('should adjust font size', async () => {
    await page.locator('[data-testid="settings-button"]').click();
    
    const fontSizeInput = page.locator('input[data-testid="font-size-input"]');
    await fontSizeInput.clear();
    await fontSizeInput.type('18');
    
    const textarea = page.locator('textarea');
    const fontSize = await textarea.evaluate(el => window.getComputedStyle(el).fontSize);
    expect(fontSize).toBe('18px');
  });
  
  test('should handle snippets', async () => {
    const textarea = page.locator('textarea');
    await textarea.clear();
    await textarea.type('fn');
    
    await page.waitForTimeout(300);
    
    // Select snippet from autocomplete
    await page.keyboard.press('Enter');
    
    const value = await textarea.inputValue();
    expect(value).toContain('function');
    expect(value).toContain('{');
    expect(value).toContain('}');
  });
  
  test('should export code', async () => {
    const textarea = page.locator('textarea');
    await textarea.fill('export const test = "value";');
    
    // Mock download
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button[data-testid="export-button"]').click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.js');
  });
});

test.describe('CodeEditor Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });
  
  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('/components/code-editor');
    
    const editor = page.locator('[data-testid="code-editor"]');
    await expect(editor).toBeVisible();
    
    // Check mobile layout
    const editorBox = await editor.boundingBox();
    expect(editorBox?.width).toBeLessThanOrEqual(375);
    
    // Minimap should be hidden on mobile
    await expect(page.locator('[data-testid="minimap"]')).not.toBeVisible();
  });
  
  test('should handle touch interactions', async ({ page }) => {
    await page.goto('/components/code-editor');
    
    const textarea = page.locator('textarea');
    await textarea.tap();
    
    // Check if keyboard appears (focused)
    await expect(textarea).toBeFocused();
  });
});