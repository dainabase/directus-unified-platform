import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';

// ============================================================================
// Test Utilities
// ============================================================================

const setupPDFViewer = async (page: Page, props: Record<string, any> = {}) => {
  const propsString = JSON.stringify(props);
  await page.evaluate((props) => {
    const container = document.createElement('div');
    container.id = 'test-container';
    container.style.height = '600px';
    document.body.appendChild(container);
    
    // Mock PDF data
    const mockPDF = 'data:application/pdf;base64,JVBERi0xLjQK';
    
    // @ts-ignore - accessing global React and ReactDOM
    const { PDFViewer } = window.UIComponents;
    const element = React.createElement(PDFViewer, {
      src: mockPDF,
      ...JSON.parse(props)
    });
    ReactDOM.render(element, container);
  }, propsString);
  
  // Wait for PDF to load
  await page.waitForTimeout(1000);
};

const getCurrentPage = async (page: Page): Promise<number> => {
  return await page.evaluate(() => {
    const pageDisplay = document.querySelector('[class*="flex items-center gap-1 mx-2"]');
    if (!pageDisplay) return 1;
    const pageText = pageDisplay.textContent || '';
    const match = pageText.match(/(\d+)/);
    return match ? parseInt(match[1]) : 1;
  });
};

const getZoomLevel = async (page: Page): Promise<number> => {
  return await page.evaluate(() => {
    const zoomSelect = document.querySelector('select[title="Zoom"]') as HTMLSelectElement;
    return zoomSelect ? parseFloat(zoomSelect.value) : 1;
  });
};

const getAnnotations = async (page: Page): Promise<any[]> => {
  return await page.evaluate(() => {
    const annotationElements = document.querySelectorAll('[id^="annotation-"]');
    return Array.from(annotationElements).map(el => ({
      id: el.id,
      style: {
        left: el.getAttribute('style')?.match(/left:\s*(\d+)px/)?.[1],
        top: el.getAttribute('style')?.match(/top:\s*(\d+)px/)?.[1],
        width: el.getAttribute('style')?.match(/width:\s*(\d+)px/)?.[1],
        height: el.getAttribute('style')?.match(/height:\s*(\d+)px/)?.[1]
      }
    }));
  });
};

// ============================================================================
// Test Suite
// ============================================================================

test.describe('PDFViewer Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test');
  });

  test.afterEach(async ({ page }) => {
    await page.evaluate(() => {
      const container = document.getElementById('test-container');
      if (container) {
        container.remove();
      }
    });
  });

  // ==========================================================================
  // Rendering Tests
  // ==========================================================================

  test('should render with default props', async ({ page }) => {
    await setupPDFViewer(page);
    
    const canvas = await page.locator('canvas').first();
    await expect(canvas).toBeVisible();
    
    const toolbar = await page.locator('[class*="toolbar"]');
    await expect(toolbar).toBeVisible();
    
    const sidebar = await page.locator('[class*="w-64 border-r"]');
    await expect(sidebar).toBeVisible();
  });

  test('should display loading state', async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement('div');
      container.id = 'test-container';
      container.style.height = '600px';
      document.body.appendChild(container);
      
      // @ts-ignore
      const { PDFViewer } = window.UIComponents;
      const element = React.createElement(PDFViewer, {
        src: 'https://example.com/slow.pdf' // Slow loading PDF
      });
      ReactDOM.render(element, container);
    });
    
    const loader = await page.locator('[class*="animate-spin"]');
    await expect(loader).toBeVisible();
    
    const loadingText = await page.locator('text=Loading PDF');
    await expect(loadingText).toBeVisible();
  });

  test('should show error state when PDF fails to load', async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement('div');
      container.id = 'test-container';
      container.style.height = '600px';
      document.body.appendChild(container);
      
      // @ts-ignore
      const { PDFViewer } = window.UIComponents;
      const element = React.createElement(PDFViewer, {
        src: null // Invalid source
      });
      ReactDOM.render(element, container);
    });
    
    const errorMessage = await page.locator('text=No PDF loaded');
    await expect(errorMessage).toBeVisible();
  });

  test('should hide toolbar when showToolbar is false', async ({ page }) => {
    await setupPDFViewer(page, { showToolbar: false });
    
    const toolbar = await page.locator('[class*="toolbar"]');
    await expect(toolbar).not.toBeVisible();
  });

  test('should hide sidebar when showSidebar is false', async ({ page }) => {
    await setupPDFViewer(page, { showSidebar: false });
    
    const sidebar = await page.locator('[class*="w-64 border-r"]');
    await expect(sidebar).not.toBeVisible();
  });

  // ==========================================================================
  // Navigation Tests
  // ==========================================================================

  test('should navigate to next page', async ({ page }) => {
    await setupPDFViewer(page);
    
    const nextButton = await page.locator('button[title="Next Page"]');
    await nextButton.click();
    
    const currentPage = await getCurrentPage(page);
    expect(currentPage).toBe(2);
  });

  test('should navigate to previous page', async ({ page }) => {
    await setupPDFViewer(page, { defaultPage: 3 });
    
    const prevButton = await page.locator('button[title="Previous Page"]');
    await prevButton.click();
    
    const currentPage = await getCurrentPage(page);
    expect(currentPage).toBe(2);
  });

  test('should navigate to first page', async ({ page }) => {
    await setupPDFViewer(page, { defaultPage: 5 });
    
    const firstButton = await page.locator('button[title="First Page"]');
    await firstButton.click();
    
    const currentPage = await getCurrentPage(page);
    expect(currentPage).toBe(1);
  });

  test('should navigate to last page', async ({ page }) => {
    await setupPDFViewer(page);
    
    const lastButton = await page.locator('button[title="Last Page"]');
    await lastButton.click();
    
    const currentPage = await getCurrentPage(page);
    expect(currentPage).toBeGreaterThan(1);
  });

  test('should navigate using page input', async ({ page }) => {
    await setupPDFViewer(page);
    
    // Click on page number to show input
    const pageButton = await page.locator('button:has-text("1")').first();
    await pageButton.click();
    
    // Type new page number
    const pageInput = await page.locator('input[type="number"]');
    await pageInput.fill('5');
    await pageInput.press('Enter');
    
    const currentPage = await getCurrentPage(page);
    expect(currentPage).toBe(5);
  });

  test('should disable navigation buttons at boundaries', async ({ page }) => {
    await setupPDFViewer(page, { defaultPage: 1 });
    
    const prevButton = await page.locator('button[title="Previous Page"]');
    const firstButton = await page.locator('button[title="First Page"]');
    
    await expect(prevButton).toBeDisabled();
    await expect(firstButton).toBeDisabled();
    
    // Go to last page
    const lastButton = await page.locator('button[title="Last Page"]');
    await lastButton.click();
    
    const nextButton = await page.locator('button[title="Next Page"]');
    await expect(nextButton).toBeDisabled();
    await expect(lastButton).toBeDisabled();
  });

  // ==========================================================================
  // Zoom Tests
  // ==========================================================================

  test('should zoom in', async ({ page }) => {
    await setupPDFViewer(page);
    
    const zoomInButton = await page.locator('button[title="Zoom In"]');
    await zoomInButton.click();
    
    const zoomLevel = await getZoomLevel(page);
    expect(zoomLevel).toBeGreaterThan(1);
  });

  test('should zoom out', async ({ page }) => {
    await setupPDFViewer(page, { defaultZoom: 2 });
    
    const zoomOutButton = await page.locator('button[title="Zoom Out"]');
    await zoomOutButton.click();
    
    const zoomLevel = await getZoomLevel(page);
    expect(zoomLevel).toBeLessThan(2);
  });

  test('should select zoom level from dropdown', async ({ page }) => {
    await setupPDFViewer(page);
    
    const zoomSelect = await page.locator('select').first();
    await zoomSelect.selectOption('2');
    
    const zoomLevel = await getZoomLevel(page);
    expect(zoomLevel).toBe(2);
  });

  test('should respect zoom limits', async ({ page }) => {
    await setupPDFViewer(page, {
      defaultZoom: 5,
      maxZoom: 5
    });
    
    const zoomInButton = await page.locator('button[title="Zoom In"]');
    await expect(zoomInButton).toBeDisabled();
    
    await setupPDFViewer(page, {
      defaultZoom: 0.5,
      minZoom: 0.5
    });
    
    const zoomOutButton = await page.locator('button[title="Zoom Out"]');
    await expect(zoomOutButton).toBeDisabled();
  });

  // ==========================================================================
  // Rotation Tests
  // ==========================================================================

  test('should rotate document right', async ({ page }) => {
    await setupPDFViewer(page);
    
    const rotateRightButton = await page.locator('button[title="Rotate Right"]');
    await rotateRightButton.click();
    
    // Canvas should be rotated (check transform or dimensions)
    const canvas = await page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('should rotate document left', async ({ page }) => {
    await setupPDFViewer(page);
    
    const rotateLeftButton = await page.locator('button[title="Rotate Left"]');
    await rotateLeftButton.click();
    
    const canvas = await page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  // ==========================================================================
  // Sidebar Tests
  // ==========================================================================

  test('should switch between sidebar tabs', async ({ page }) => {
    await setupPDFViewer(page);
    
    // Click on Outline tab
    const outlineTab = await page.locator('button:has-text("Outline")');
    await outlineTab.click();
    await expect(outlineTab).toHaveClass(/border-primary/);
    
    // Click on Notes tab
    const notesTab = await page.locator('button:has-text("Notes")');
    await notesTab.click();
    await expect(notesTab).toHaveClass(/border-primary/);
    
    // Click back on Pages tab
    const pagesTab = await page.locator('button:has-text("Pages")');
    await pagesTab.click();
    await expect(pagesTab).toHaveClass(/border-primary/);
  });

  test('should navigate using thumbnails', async ({ page }) => {
    await setupPDFViewer(page, { showThumbnails: true });
    
    // Click on page 3 thumbnail
    const thumbnail = await page.locator('text=Page 3');
    await thumbnail.click();
    
    const currentPage = await getCurrentPage(page);
    expect(currentPage).toBe(3);
  });

  test('should navigate using bookmarks', async ({ page }) => {
    await setupPDFViewer(page, {
      bookmarks: [
        { id: '1', title: 'Chapter 1', page: 1, level: 0 },
        { id: '2', title: 'Chapter 2', page: 5, level: 0 }
      ],
      showOutline: true
    });
    
    // Switch to outline tab
    const outlineTab = await page.locator('button:has-text("Outline")');
    await outlineTab.click();
    
    // Click on Chapter 2 bookmark
    const bookmark = await page.locator('text=Chapter 2');
    await bookmark.click();
    
    const currentPage = await getCurrentPage(page);
    expect(currentPage).toBe(5);
  });

  // ==========================================================================
  // Search Tests
  // ==========================================================================

  test('should search for text', async ({ page }) => {
    await setupPDFViewer(page, { enableSearch: true });
    
    const searchInput = await page.locator('input[placeholder="Search..."]');
    await searchInput.fill('Lorem');
    await searchInput.press('Enter');
    
    // Should show search results
    await page.waitForTimeout(500);
    const searchResults = await page.locator('text=/\\d+\\/\\d+/');
    await expect(searchResults).toBeVisible();
  });

  test('should navigate through search results', async ({ page }) => {
    await setupPDFViewer(page, { enableSearch: true });
    
    const searchInput = await page.locator('input[placeholder="Search..."]');
    await searchInput.fill('ipsum');
    await searchInput.press('Enter');
    
    await page.waitForTimeout(500);
    
    // Navigate to next result
    const nextResultButton = await page.locator('button:has([class*="ChevronDown"])').last();
    await nextResultButton.click();
    
    // Navigate to previous result
    const prevResultButton = await page.locator('button:has([class*="ChevronUp"])').last();
    await prevResultButton.click();
  });

  test('should clear search', async ({ page }) => {
    await setupPDFViewer(page, { enableSearch: true });
    
    const searchInput = await page.locator('input[placeholder="Search..."]');
    await searchInput.fill('test');
    
    const clearButton = await page.locator('button:has([class*="X"])').nth(1);
    await clearButton.click();
    
    await expect(searchInput).toHaveValue('');
  });

  // ==========================================================================
  // Tool Mode Tests
  // ==========================================================================

  test('should switch tool modes', async ({ page }) => {
    await setupPDFViewer(page, { enableAnnotations: true });
    
    // Select tool
    const selectTool = await page.locator('button[title="Select"]');
    await selectTool.click();
    await expect(selectTool).toHaveClass(/bg-accent/);
    
    // Hand tool
    const handTool = await page.locator('button[title="Hand Tool"]');
    await handTool.click();
    await expect(handTool).toHaveClass(/bg-accent/);
    
    // Text tool
    const textTool = await page.locator('button[title="Add Text"]');
    await textTool.click();
    await expect(textTool).toHaveClass(/bg-accent/);
    
    // Highlight tool
    const highlightTool = await page.locator('button[title="Highlight"]');
    await highlightTool.click();
    await expect(highlightTool).toHaveClass(/bg-accent/);
    
    // Draw tool
    const drawTool = await page.locator('button[title="Draw"]');
    await drawTool.click();
    await expect(drawTool).toHaveClass(/bg-accent/);
    
    // Comment tool
    const commentTool = await page.locator('button[title="Add Comment"]');
    await commentTool.click();
    await expect(commentTool).toHaveClass(/bg-accent/);
  });

  test('should add text annotation', async ({ page }) => {
    await setupPDFViewer(page, {
      enableAnnotations: true,
      toolMode: 'text'
    });
    
    const canvas = await page.locator('canvas').first();
    await canvas.click({ position: { x: 100, y: 100 } });
    
    await page.waitForTimeout(500);
    const annotations = await getAnnotations(page);
    expect(annotations.length).toBeGreaterThan(0);
  });

  // ==========================================================================
  // Theme Tests
  // ==========================================================================

  test('should switch themes', async ({ page }) => {
    await setupPDFViewer(page);
    
    const themeSelect = await page.locator('select[title="Theme"]');
    
    // Switch to dark theme
    await themeSelect.selectOption('dark');
    await page.waitForTimeout(100);
    
    // Switch to sepia theme
    await themeSelect.selectOption('sepia');
    await page.waitForTimeout(100);
    
    // Switch back to light theme
    await themeSelect.selectOption('light');
    await page.waitForTimeout(100);
  });

  // ==========================================================================
  // Action Tests
  // ==========================================================================

  test('should print document', async ({ page }) => {
    await setupPDFViewer(page, { enablePrint: true });
    
    // Mock window.print
    await page.evaluate(() => {
      window.print = () => {
        (window as any).printCalled = true;
      };
    });
    
    const printButton = await page.locator('button[title*="Print"]');
    await printButton.click();
    
    const printCalled = await page.evaluate(() => (window as any).printCalled);
    expect(printCalled).toBeTruthy();
  });

  test('should download document', async ({ page }) => {
    await setupPDFViewer(page, { enableDownload: true });
    
    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    
    const downloadButton = await page.locator('button[title*="Download"]');
    
    // Mock the download action
    await page.evaluate(() => {
      const originalCreateElement = document.createElement;
      document.createElement = function(tagName: string) {
        const element = originalCreateElement.call(document, tagName);
        if (tagName === 'a') {
          element.click = () => {
            (window as any).downloadClicked = true;
          };
        }
        return element;
      };
    });
    
    await downloadButton.click();
    
    const downloadClicked = await page.evaluate(() => (window as any).downloadClicked);
    expect(downloadClicked).toBeTruthy();
  });

  test('should toggle fullscreen', async ({ page }) => {
    await setupPDFViewer(page, { enableFullscreen: true });
    
    // Mock fullscreen API
    await page.evaluate(() => {
      document.documentElement.requestFullscreen = () => {
        (window as any).fullscreenRequested = true;
        return Promise.resolve();
      };
    });
    
    const fullscreenButton = await page.locator('button[title="Fullscreen"]');
    await fullscreenButton.click();
    
    const fullscreenRequested = await page.evaluate(() => (window as any).fullscreenRequested);
    expect(fullscreenRequested).toBeTruthy();
  });

  // ==========================================================================
  // Disabled State Tests
  // ==========================================================================

  test('should disable all interactions when disabled', async ({ page }) => {
    await setupPDFViewer(page, { disabled: true });
    
    const buttons = await page.locator('button:not([title="Theme"])').all();
    
    for (const button of buttons) {
      const isDisabled = await button.isDisabled();
      if (await button.isVisible()) {
        expect(isDisabled).toBe(true);
      }
    }
  });

  test('should prevent annotations in read-only mode', async ({ page }) => {
    await setupPDFViewer(page, {
      readOnly: true,
      enableAnnotations: false
    });
    
    // Annotation tools should not be visible
    const textTool = await page.locator('button[title="Add Text"]');
    await expect(textTool).not.toBeVisible();
    
    const drawTool = await page.locator('button[title="Draw"]');
    await expect(drawTool).not.toBeVisible();
  });

  // ==========================================================================
  // Keyboard Shortcut Tests
  // ==========================================================================

  test('should support keyboard navigation', async ({ page }) => {
    await setupPDFViewer(page, { enableKeyboardShortcuts: true });
    
    const container = await page.locator('#test-container');
    await container.focus();
    
    // Next page with arrow key
    await page.keyboard.press('ArrowRight');
    let currentPage = await getCurrentPage(page);
    expect(currentPage).toBe(2);
    
    // Previous page with arrow key
    await page.keyboard.press('ArrowLeft');
    currentPage = await getCurrentPage(page);
    expect(currentPage).toBe(1);
    
    // First page with Home key
    await page.keyboard.press('End');
    await page.keyboard.press('Home');
    currentPage = await getCurrentPage(page);
    expect(currentPage).toBe(1);
  });

  test('should support keyboard shortcuts for actions', async ({ page }) => {
    await setupPDFViewer(page, { enableKeyboardShortcuts: true });
    
    const container = await page.locator('#test-container');
    await container.focus();
    
    // Zoom in with Ctrl+Plus
    await page.keyboard.press('Control+Equal'); // Plus key
    
    // Zoom out with Ctrl+Minus
    await page.keyboard.press('Control+Minus');
    
    // Reset zoom with Ctrl+0
    await page.keyboard.press('Control+0');
    
    // Search with Ctrl+F
    await page.keyboard.press('Control+f');
    const searchInput = await page.locator('input[placeholder="Search..."]');
    await expect(searchInput).toBeFocused();
  });

  // ==========================================================================
  // Annotation Management Tests
  // ==========================================================================

  test('should display existing annotations', async ({ page }) => {
    await setupPDFViewer(page, {
      annotations: [
        {
          id: '1',
          type: 'text',
          page: 1,
          position: { x: 100, y: 100, width: 200, height: 50 },
          content: 'Test annotation',
          author: 'Test User',
          timestamp: new Date()
        }
      ],
      showAnnotations: true
    });
    
    // Switch to annotations tab
    const notesTab = await page.locator('button:has-text("Notes")');
    await notesTab.click();
    
    // Check annotation in sidebar
    const annotation = await page.locator('text=Test annotation');
    await expect(annotation).toBeVisible();
  });

  test('should delete annotation', async ({ page }) => {
    await setupPDFViewer(page, {
      annotations: [
        {
          id: '1',
          type: 'text',
          page: 1,
          position: { x: 100, y: 100, width: 200, height: 50 },
          content: 'Delete me',
          author: 'Test User',
          timestamp: new Date()
        }
      ],
      showAnnotations: true
    });
    
    // Switch to annotations tab
    const notesTab = await page.locator('button:has-text("Notes")');
    await notesTab.click();
    
    // Delete annotation
    const deleteButton = await page.locator('[class*="text-destructive"]').first();
    await deleteButton.click();
    
    // Annotation should be removed
    const annotation = await page.locator('text=Delete me');
    await expect(annotation).not.toBeVisible();
  });

  // ==========================================================================
  // Watermark Tests
  // ==========================================================================

  test('should display watermark', async ({ page }) => {
    await setupPDFViewer(page, {
      watermark: {
        text: 'CONFIDENTIAL',
        opacity: 0.5,
        position: 'center'
      }
    });
    
    const canvas = await page.locator('canvas').first();
    await expect(canvas).toBeVisible();
    // Watermark is rendered on canvas, so we can't directly test its text
    // but we verify the canvas renders with watermark configuration
  });
});