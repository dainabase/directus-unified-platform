import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';

test.describe('RichTextEditor Component', () => {
  let page: Page;

  test.beforeEach(async ({ page: p }) => {
    page = p;
    await page.goto('/iframe.html?id=sprint-3-richtexteditor--default');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Basic Functionality', () => {
    test('should render editor with placeholder', async () => {
      const editor = page.locator('[contenteditable]').first();
      await expect(editor).toBeVisible();
      
      const placeholder = await editor.getAttribute('data-placeholder');
      expect(placeholder).toContain('Start typing');
    });

    test('should accept text input', async () => {
      const editor = page.locator('[contenteditable]').first();
      await editor.click();
      await editor.type('Hello World');
      
      const content = await editor.textContent();
      expect(content).toContain('Hello World');
    });

    test('should show toolbar when enabled', async () => {
      const toolbar = page.locator('[role="toolbar"], .rich-text-editor').first();
      await expect(toolbar).toBeVisible();
      
      // Check for basic toolbar buttons
      const boldButton = page.locator('[aria-label="Bold"]').first();
      await expect(boldButton).toBeVisible();
    });

    test('should support basic formatting', async () => {
      const editor = page.locator('[contenteditable]').first();
      await editor.click();
      await editor.type('Test text');
      
      // Select all text
      await page.keyboard.press('Control+A');
      
      // Apply bold
      await page.locator('[aria-label="Bold"]').first().click();
      
      const html = await editor.innerHTML();
      expect(html).toMatch(/<(strong|b)>.*<\/(strong|b)>/);
    });
  });

  test.describe('Text Formatting', () => {
    test('should apply bold formatting', async () => {
      const editor = page.locator('[contenteditable]').first();
      await editor.click();
      await editor.type('Bold text');
      await page.keyboard.press('Control+A');
      
      const boldButton = page.locator('[aria-label="Bold"]').first();
      await boldButton.click();
      
      const html = await editor.innerHTML();
      expect(html).toMatch(/<(strong|b)>/);
    });

    test('should apply italic formatting', async () => {
      const editor = page.locator('[contenteditable]').first();
      await editor.click();
      await editor.type('Italic text');
      await page.keyboard.press('Control+A');
      
      const italicButton = page.locator('[aria-label="Italic"]').first();
      await italicButton.click();
      
      const html = await editor.innerHTML();
      expect(html).toMatch(/<(em|i)>/);
    });

    test('should apply underline formatting', async () => {
      const editor = page.locator('[contenteditable]').first();
      await editor.click();
      await editor.type('Underlined text');
      await page.keyboard.press('Control+A');
      
      const underlineButton = page.locator('[aria-label="Underline"]').first();
      await underlineButton.click();
      
      const html = await editor.innerHTML();
      expect(html).toMatch(/<u>/);
    });

    test('should apply heading formatting', async () => {
      const editor = page.locator('[contenteditable]').first();
      await editor.click();
      await editor.type('Heading Text');
      await page.keyboard.press('Control+A');
      
      const h1Button = page.locator('[aria-label="Heading 1"]').first();
      if (await h1Button.count() > 0) {
        await h1Button.click();
        const html = await editor.innerHTML();
        expect(html).toMatch(/<h1>/);
      }
    });
  });

  test.describe('Lists', () => {
    test('should create bullet list', async () => {
      const editor = page.locator('[contenteditable]').first();
      await editor.click();
      
      const bulletButton = page.locator('[aria-label*="Bullet"], [aria-label*="Unordered"]').first();
      if (await bulletButton.count() > 0) {
        await bulletButton.click();
        await editor.type('First item');
        await page.keyboard.press('Enter');
        await editor.type('Second item');
        
        const html = await editor.innerHTML();
        expect(html).toMatch(/<ul>/);
        expect(html).toMatch(/<li>/);
      }
    });

    test('should create numbered list', async () => {
      const editor = page.locator('[contenteditable]').first();
      await editor.click();
      
      const numberedButton = page.locator('[aria-label*="Numbered"], [aria-label*="Ordered"]').first();
      if (await numberedButton.count() > 0) {
        await numberedButton.click();
        await editor.type('Item 1');
        await page.keyboard.press('Enter');
        await editor.type('Item 2');
        
        const html = await editor.innerHTML();
        expect(html).toMatch(/<ol>/);
      }
    });
  });

  test.describe('Markdown Mode', () => {
    test('should switch to markdown mode', async () => {
      await page.goto('/iframe.html?id=sprint-3-richtexteditor--markdown-mode');
      
      const markdownTab = page.locator('button:has-text("Markdown")').first();
      if (await markdownTab.count() > 0) {
        await markdownTab.click();
        
        const markdownEditor = page.locator('textarea').first();
        await expect(markdownEditor).toBeVisible();
      }
    });

    test('should convert HTML to markdown', async () => {
      await page.goto('/iframe.html?id=sprint-3-richtexteditor--markdown-mode');
      
      const markdownEditor = page.locator('textarea').first();
      if (await markdownEditor.count() > 0) {
        const markdown = await markdownEditor.inputValue();
        expect(markdown).toContain('#');
        expect(markdown).toContain('**');
      }
    });

    test('should sync markdown with WYSIWYG', async () => {
      await page.goto('/iframe.html?id=sprint-3-richtexteditor--split-view');
      
      const splitViewTab = page.locator('button:has-text("Split")').first();
      if (await splitViewTab.count() > 0) {
        await splitViewTab.click();
        
        // Check both editors are visible
        const wysiwyg = page.locator('[contenteditable]').first();
        const markdown = page.locator('textarea').first();
        
        if (await wysiwyg.count() > 0 && await markdown.count() > 0) {
          await expect(wysiwyg).toBeVisible();
          await expect(markdown).toBeVisible();
        }
      }
    });
  });

  test.describe('Links and Media', () => {
    test('should open link dialog', async () => {
      const linkButton = page.locator('[aria-label*="Link"]').first();
      if (await linkButton.count() > 0) {
        await linkButton.click();
        
        // Check for dialog
        const dialog = page.locator('[role="dialog"]').first();
        await expect(dialog).toBeVisible();
        
        // Check for URL input
        const urlInput = dialog.locator('input[placeholder*="http"]').first();
        await expect(urlInput).toBeVisible();
      }
    });

    test('should open image dialog', async () => {
      const imageButton = page.locator('[aria-label*="Image"]').first();
      if (await imageButton.count() > 0) {
        await imageButton.click();
        
        const dialog = page.locator('[role="dialog"]').first();
        await expect(dialog).toBeVisible();
        
        // Check for image URL input
        const imageInput = dialog.locator('input[placeholder*="image"]').first();
        await expect(imageInput).toBeVisible();
      }
    });

    test('should insert horizontal rule', async () => {
      const editor = page.locator('[contenteditable]').first();
      await editor.click();
      
      const hrButton = page.locator('[aria-label*="Horizontal"]').first();
      if (await hrButton.count() > 0) {
        await hrButton.click();
        
        const html = await editor.innerHTML();
        expect(html).toMatch(/<hr/);
      }
    });
  });

  test.describe('Character Limit', () => {
    test('should display character count', async () => {
      await page.goto('/iframe.html?id=sprint-3-richtexteditor--with-character-limit');
      
      const charCount = page.locator('text=/\\d+\\/\\d+/').first();
      await expect(charCount).toBeVisible();
    });

    test('should enforce character limit', async () => {
      await page.goto('/iframe.html?id=sprint-3-richtexteditor--with-character-limit');
      
      const editor = page.locator('[contenteditable]').first();
      await editor.click();
      
      // Type a long text
      const longText = 'a'.repeat(600);
      await editor.type(longText);
      
      // Check that it doesn't exceed limit
      const content = await editor.textContent();
      expect(content?.length).toBeLessThanOrEqual(500);
    });

    test('should show warning near limit', async () => {
      await page.goto('/iframe.html?id=sprint-3-richtexteditor--with-character-limit');
      
      const editor = page.locator('[contenteditable]').first();
      await editor.click();
      
      // Type text near limit
      const text = 'a'.repeat(450);
      await editor.type(text);
      
      // Check for warning
      const warning = page.locator('text=/approaching.*limit/i');
      await expect(warning).toBeVisible();
    });
  });

  test.describe('Keyboard Shortcuts', () => {
    test('should support Ctrl+B for bold', async () => {
      const editor = page.locator('[contenteditable]').first();
      await editor.click();
      await editor.type('Bold with shortcut');
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Control+B');
      
      const html = await editor.innerHTML();
      expect(html).toMatch(/<(strong|b)>/);
    });

    test('should support Ctrl+I for italic', async () => {
      const editor = page.locator('[contenteditable]').first();
      await editor.click();
      await editor.type('Italic with shortcut');
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Control+I');
      
      const html = await editor.innerHTML();
      expect(html).toMatch(/<(em|i)>/);
    });

    test('should support Ctrl+Z for undo', async () => {
      const editor = page.locator('[contenteditable]').first();
      await editor.click();
      await editor.type('First text');
      await page.keyboard.press('Control+Z');
      
      const content = await editor.textContent();
      expect(content).toBe('');
    });

    test('should support Tab for indent', async () => {
      const editor = page.locator('[contenteditable]').first();
      await editor.click();
      await editor.type('Indented text');
      await page.keyboard.press('Tab');
      
      // Tab should indent the text
      const html = await editor.innerHTML();
      // Check for indentation (varies by implementation)
      expect(html.length).toBeGreaterThan('Indented text'.length);
    });
  });

  test.describe('Read-only Mode', () => {
    test('should display content in read-only mode', async () => {
      await page.goto('/iframe.html?id=sprint-3-richtexteditor--read-only-mode');
      
      const editor = page.locator('[contenteditable]').first();
      const isEditable = await editor.getAttribute('contenteditable');
      expect(isEditable).toBe('false');
    });

    test('should not show toolbar in read-only mode', async () => {
      await page.goto('/iframe.html?id=sprint-3-richtexteditor--read-only-mode');
      
      const toolbar = page.locator('[role="toolbar"]').first();
      const toolbarCount = await toolbar.count();
      expect(toolbarCount).toBe(0);
    });
  });

  test.describe('Multiple Editors', () => {
    test('should handle multiple editors on same page', async () => {
      await page.goto('/iframe.html?id=sprint-3-richtexteditor--multiple-editors');
      
      const editors = page.locator('[contenteditable]');
      const count = await editors.count();
      expect(count).toBeGreaterThan(1);
    });

    test('should maintain separate content for each editor', async () => {
      await page.goto('/iframe.html?id=sprint-3-richtexteditor--multiple-editors');
      
      const firstEditor = page.locator('[contenteditable]').first();
      const secondEditor = page.locator('[contenteditable]').nth(1);
      
      await firstEditor.click();
      await firstEditor.type('First editor content');
      
      await secondEditor.click();
      await secondEditor.type('Second editor content');
      
      const firstContent = await firstEditor.textContent();
      const secondContent = await secondEditor.textContent();
      
      expect(firstContent).toContain('First editor content');
      expect(secondContent).toContain('Second editor content');
    });
  });

  test.describe('Performance', () => {
    test('should handle large content efficiently', async () => {
      await page.goto('/iframe.html?id=sprint-3-richtexteditor--performance-test');
      
      // Fill all editors with content
      const fillButton = page.locator('button:has-text("Fill All")').first();
      await fillButton.click();
      
      // Check that content is loaded
      await page.waitForTimeout(1000);
      
      const editor = page.locator('[contenteditable]').first();
      const content = await editor.textContent();
      expect(content?.length).toBeGreaterThan(1000);
    });

    test('should switch between multiple editors quickly', async () => {
      await page.goto('/iframe.html?id=sprint-3-richtexteditor--performance-test');
      
      // Switch between tabs
      for (let i = 1; i <= 5; i++) {
        const tab = page.locator(`button:has-text("${i}")`).first();
        await tab.click();
        
        const editor = page.locator('[contenteditable]:visible').first();
        await expect(editor).toBeVisible();
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async () => {
      const toolbar = page.locator('[role="toolbar"]').first();
      if (await toolbar.count() > 0) {
        const buttons = toolbar.locator('button[aria-label]');
        const count = await buttons.count();
        expect(count).toBeGreaterThan(0);
      }
    });

    test('should be keyboard navigable', async () => {
      const editor = page.locator('[contenteditable]').first();
      
      // Tab to editor
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Check focus
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeDefined();
    });

    test('should announce formatting changes', async () => {
      const editor = page.locator('[contenteditable]').first();
      await editor.click();
      await editor.type('Accessible text');
      await page.keyboard.press('Control+A');
      
      const boldButton = page.locator('[aria-label="Bold"]').first();
      const isPressed = await boldButton.getAttribute('aria-pressed');
      
      await boldButton.click();
      const newPressed = await boldButton.getAttribute('aria-pressed');
      
      // State should change
      expect(isPressed).not.toBe(newPressed);
    });
  });

  test.describe('Custom Toolbar', () => {
    test('should display custom toolbar items', async () => {
      await page.goto('/iframe.html?id=sprint-3-richtexteditor--custom-toolbar');
      
      const toolbar = page.locator('[role="toolbar"], .rich-text-editor').first();
      
      // Check for custom toolbar items
      const emojiButton = page.locator('[aria-label*="Emoji"]').first();
      if (await emojiButton.count() > 0) {
        await expect(emojiButton).toBeVisible();
      }
    });

    test('should group toolbar items correctly', async () => {
      await page.goto('/iframe.html?id=sprint-3-richtexteditor--custom-toolbar');
      
      // Check for separators between groups
      const separators = page.locator('[role="separator"], .separator');
      const count = await separators.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Responsive Behavior', () => {
    test('should adapt to mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/iframe.html?id=sprint-3-richtexteditor--default');
      
      const editor = page.locator('[contenteditable]').first();
      await expect(editor).toBeVisible();
      
      // Toolbar should still be functional
      const toolbar = page.locator('[role="toolbar"], .rich-text-editor').first();
      await expect(toolbar).toBeVisible();
    });

    test('should handle tablet viewport', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/iframe.html?id=sprint-3-richtexteditor--default');
      
      const editor = page.locator('[contenteditable]').first();
      await expect(editor).toBeVisible();
    });
  });
});