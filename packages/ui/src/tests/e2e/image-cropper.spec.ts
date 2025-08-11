import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';

// ============================================================================
// Test Utilities
// ============================================================================

const setupImageCropper = async (page: Page, props: Record<string, any> = {}) => {
  const propsString = JSON.stringify(props);
  await page.evaluate((props) => {
    const container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
    
    // Mock image source
    const mockImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzRhNWY3ZiIvPgogIDx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj44MDB4NjAwPC90ZXh0Pgo8L3N2Zz4=';
    
    // @ts-ignore - accessing global React and ReactDOM
    const { ImageCropper } = window.UIComponents;
    const element = React.createElement(ImageCropper, {
      src: mockImage,
      ...JSON.parse(props)
    });
    ReactDOM.render(element, container);
  }, propsString);
  
  await page.waitForSelector('canvas', { timeout: 5000 });
};

const getCropArea = async (page: Page) => {
  return await page.evaluate(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return null;
    
    // Get crop area from component state
    const event = new CustomEvent('getCropArea');
    canvas.dispatchEvent(event);
    return (window as any).lastCropArea;
  });
};

const getTransform = async (page: Page) => {
  return await page.evaluate(() => {
    const event = new CustomEvent('getTransform');
    document.querySelector('canvas')?.dispatchEvent(event);
    return (window as any).lastTransform;
  });
};

const getFilters = async (page: Page) => {
  return await page.evaluate(() => {
    const event = new CustomEvent('getFilters');
    document.querySelector('canvas')?.dispatchEvent(event);
    return (window as any).lastFilters;
  });
};

// ============================================================================
// Test Suite
// ============================================================================

test.describe('ImageCropper Component', () => {
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
    await setupImageCropper(page);
    
    const canvas = await page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    const toolbar = await page.locator('[class*="toolbar"]');
    await expect(toolbar).toBeVisible();
    
    const sidebar = await page.locator('[class*="sidebar"]');
    await expect(sidebar).toBeVisible();
  });

  test('should render without image initially when no src provided', async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement('div');
      container.id = 'test-container';
      document.body.appendChild(container);
      
      // @ts-ignore
      const { ImageCropper } = window.UIComponents;
      const element = React.createElement(ImageCropper, {});
      ReactDOM.render(element, container);
    });
    
    const uploadButton = await page.locator('button:has-text("Upload Image")');
    await expect(uploadButton).toBeVisible();
    
    const canvas = await page.locator('canvas');
    await expect(canvas).not.toBeVisible();
  });

  test('should hide toolbar when showToolbar is false', async ({ page }) => {
    await setupImageCropper(page, { showToolbar: false });
    
    const toolbar = await page.locator('[class*="toolbar"]');
    await expect(toolbar).not.toBeVisible();
  });

  test('should hide sidebar when showSidebar is false', async ({ page }) => {
    await setupImageCropper(page, { showSidebar: false });
    
    const sidebar = await page.locator('[class*="sidebar"]');
    await expect(sidebar).not.toBeVisible();
  });

  test('should show loading state while image loads', async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement('div');
      container.id = 'test-container';
      document.body.appendChild(container);
      
      // @ts-ignore
      const { ImageCropper } = window.UIComponents;
      const element = React.createElement(ImageCropper, {
        src: 'https://example.com/slow-image.jpg' // Non-existent image
      });
      ReactDOM.render(element, container);
    });
    
    const loader = await page.locator('[class*="animate-spin"]');
    await expect(loader).toBeVisible();
  });

  // ==========================================================================
  // Crop Area Tests
  // ==========================================================================

  test('should allow dragging crop area', async ({ page }) => {
    await setupImageCropper(page);
    
    const canvas = await page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    
    // Drag crop area
    await page.mouse.move(box.x + 150, box.y + 150);
    await page.mouse.down();
    await page.mouse.move(box.x + 250, box.y + 250);
    await page.mouse.up();
    
    // Verify crop area moved
    const cropArea = await getCropArea(page);
    expect(cropArea).toBeTruthy();
  });

  test('should allow resizing crop area', async ({ page }) => {
    await setupImageCropper(page, {
      defaultCrop: { x: 100, y: 100, width: 200, height: 200 }
    });
    
    const canvas = await page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    
    // Resize from bottom-right corner
    await page.mouse.move(box.x + 300, box.y + 300);
    await page.mouse.down();
    await page.mouse.move(box.x + 400, box.y + 400);
    await page.mouse.up();
    
    const cropArea = await getCropArea(page);
    expect(cropArea?.width).toBeGreaterThan(200);
    expect(cropArea?.height).toBeGreaterThan(200);
  });

  test('should maintain aspect ratio when configured', async ({ page }) => {
    await setupImageCropper(page, {
      aspectRatio: '16:9',
      defaultCrop: { x: 100, y: 100, width: 320, height: 180 }
    });
    
    const canvas = await page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    
    // Try to resize
    await page.mouse.move(box.x + 420, box.y + 280);
    await page.mouse.down();
    await page.mouse.move(box.x + 520, box.y + 380);
    await page.mouse.up();
    
    const cropArea = await getCropArea(page);
    const ratio = cropArea ? cropArea.width / cropArea.height : 0;
    expect(ratio).toBeCloseTo(16 / 9, 1);
  });

  test('should respect minimum crop size', async ({ page }) => {
    await setupImageCropper(page, {
      minCropWidth: 100,
      minCropHeight: 100,
      defaultCrop: { x: 100, y: 100, width: 150, height: 150 }
    });
    
    const canvas = await page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    
    // Try to resize below minimum
    await page.mouse.move(box.x + 250, box.y + 250);
    await page.mouse.down();
    await page.mouse.move(box.x + 140, box.y + 140);
    await page.mouse.up();
    
    const cropArea = await getCropArea(page);
    expect(cropArea?.width).toBeGreaterThanOrEqual(100);
    expect(cropArea?.height).toBeGreaterThanOrEqual(100);
  });

  // ==========================================================================
  // Transform Tests
  // ==========================================================================

  test('should rotate image clockwise', async ({ page }) => {
    await setupImageCropper(page);
    
    const rotateButton = await page.locator('button[title="Rotate Right"]');
    await rotateButton.click();
    
    const transform = await getTransform(page);
    expect(transform?.rotation).toBe(90);
  });

  test('should rotate image counter-clockwise', async ({ page }) => {
    await setupImageCropper(page);
    
    const rotateButton = await page.locator('button[title="Rotate Left"]');
    await rotateButton.click();
    
    const transform = await getTransform(page);
    expect(transform?.rotation).toBe(-90);
  });

  test('should flip image horizontally', async ({ page }) => {
    await setupImageCropper(page);
    
    const flipButton = await page.locator('button[title="Flip Horizontal"]');
    await flipButton.click();
    
    const transform = await getTransform(page);
    expect(transform?.flipX).toBe(true);
  });

  test('should flip image vertically', async ({ page }) => {
    await setupImageCropper(page);
    
    const flipButton = await page.locator('button[title="Flip Vertical"]');
    await flipButton.click();
    
    const transform = await getTransform(page);
    expect(transform?.flipY).toBe(true);
  });

  test('should zoom in and out', async ({ page }) => {
    await setupImageCropper(page);
    
    const zoomInButton = await page.locator('button[title="Zoom In"]');
    const zoomOutButton = await page.locator('button[title="Zoom Out"]');
    const zoomDisplay = await page.locator('span:has-text("%")');
    
    // Zoom in
    await zoomInButton.click();
    await expect(zoomDisplay).toContainText('110%');
    
    // Zoom out
    await zoomOutButton.click();
    await zoomOutButton.click();
    await expect(zoomDisplay).toContainText('90%');
  });

  // ==========================================================================
  // Filter Tests
  // ==========================================================================

  test('should apply brightness filter', async ({ page }) => {
    await setupImageCropper(page);
    
    const brightnessSlider = await page.locator('input[type="range"]').first();
    await brightnessSlider.fill('150');
    
    const filters = await getFilters(page);
    const brightnessFilter = filters?.find((f: any) => f.type === 'brightness');
    expect(brightnessFilter?.value).toBe(150);
  });

  test('should apply multiple filters', async ({ page }) => {
    await setupImageCropper(page);
    
    const sliders = await page.locator('input[type="range"]').all();
    
    // Apply brightness
    await sliders[0].fill('120');
    
    // Apply contrast
    await sliders[1].fill('130');
    
    // Apply saturate
    await sliders[2].fill('140');
    
    const filters = await getFilters(page);
    expect(filters?.length).toBeGreaterThanOrEqual(3);
  });

  test('should clear all filters', async ({ page }) => {
    await setupImageCropper(page, {
      defaultFilters: [
        { type: 'brightness', value: 120 },
        { type: 'contrast', value: 110 }
      ]
    });
    
    const clearButton = await page.locator('button:has-text("Clear Filters")');
    await clearButton.click();
    
    const filters = await getFilters(page);
    expect(filters?.length).toBe(0);
  });

  // ==========================================================================
  // History Tests
  // ==========================================================================

  test('should undo last action', async ({ page }) => {
    await setupImageCropper(page, { enableHistory: true });
    
    // Perform an action
    const rotateButton = await page.locator('button[title="Rotate Right"]');
    await rotateButton.click();
    
    // Undo
    const undoButton = await page.locator('button[title="Undo (Ctrl+Z)"]');
    await undoButton.click();
    
    const transform = await getTransform(page);
    expect(transform?.rotation).toBe(0);
  });

  test('should redo undone action', async ({ page }) => {
    await setupImageCropper(page, { enableHistory: true });
    
    // Perform an action
    const rotateButton = await page.locator('button[title="Rotate Right"]');
    await rotateButton.click();
    
    // Undo
    const undoButton = await page.locator('button[title="Undo (Ctrl+Z)"]');
    await undoButton.click();
    
    // Redo
    const redoButton = await page.locator('button[title="Redo (Ctrl+Y)"]');
    await redoButton.click();
    
    const transform = await getTransform(page);
    expect(transform?.rotation).toBe(90);
  });

  test('should disable undo when no history', async ({ page }) => {
    await setupImageCropper(page, { enableHistory: true });
    
    const undoButton = await page.locator('button[title="Undo (Ctrl+Z)"]');
    await expect(undoButton).toBeDisabled();
  });

  // ==========================================================================
  // UI Toggle Tests
  // ==========================================================================

  test('should toggle grid overlay', async ({ page }) => {
    await setupImageCropper(page, { showGrid: true });
    
    const gridButton = await page.locator('button[title="Toggle Grid"]');
    
    // Grid should be visible initially
    await expect(gridButton).toHaveClass(/bg-accent/);
    
    // Toggle off
    await gridButton.click();
    await expect(gridButton).not.toHaveClass(/bg-accent/);
  });

  test('should toggle preview panel', async ({ page }) => {
    await setupImageCropper(page, { showPreview: true });
    
    const previewButton = await page.locator('button[title="Toggle Preview"]');
    const previewCanvas = await page.locator('canvas').nth(1);
    
    // Preview should be visible initially
    await expect(previewCanvas).toBeVisible();
    
    // Toggle off
    await previewButton.click();
    await expect(previewCanvas).not.toBeVisible();
  });

  // ==========================================================================
  // Shape Tests
  // ==========================================================================

  test('should support circle crop shape', async ({ page }) => {
    await setupImageCropper(page, { cropShape: 'circle' });
    
    const canvas = await page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Verify circle shape is applied
    const shapeButtons = await page.locator('button[title="circle"]');
    await expect(shapeButtons).toHaveClass(/bg-accent/);
  });

  test('should support custom crop shapes', async ({ page }) => {
    const shapes = ['triangle', 'hexagon', 'star'];
    
    for (const shape of shapes) {
      await setupImageCropper(page, { cropShape: shape });
      
      const canvas = await page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Clean up for next iteration
      await page.evaluate(() => {
        document.getElementById('test-container')?.remove();
      });
    }
  });

  // ==========================================================================
  // Export Tests
  // ==========================================================================

  test('should save image', async ({ page }) => {
    let savedData: any = null;
    
    await page.exposeFunction('onSave', (data: any, format: string) => {
      savedData = { data, format };
    });
    
    await page.evaluate(() => {
      const container = document.createElement('div');
      container.id = 'test-container';
      document.body.appendChild(container);
      
      const mockImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzRhNWY3ZiIvPgo8L3N2Zz4=';
      
      // @ts-ignore
      const { ImageCropper } = window.UIComponents;
      const element = React.createElement(ImageCropper, {
        src: mockImage,
        onSave: (window as any).onSave
      });
      ReactDOM.render(element, container);
    });
    
    await page.waitForSelector('canvas');
    
    const saveButton = await page.locator('button:has-text("Save")');
    await saveButton.click();
    
    await page.waitForTimeout(500);
    expect(savedData).toBeTruthy();
    expect(savedData?.format).toBe('png');
  });

  test('should export in different formats', async ({ page }) => {
    await setupImageCropper(page);
    
    const exportButtons = await page.locator('button:has-text("Export")').all();
    
    for (const button of exportButtons) {
      const text = await button.textContent();
      await button.click();
      
      // Verify export was triggered
      await page.waitForTimeout(100);
    }
  });

  // ==========================================================================
  // Disabled State Tests
  // ==========================================================================

  test('should disable all interactions when disabled', async ({ page }) => {
    await setupImageCropper(page, { disabled: true });
    
    const canvas = await page.locator('canvas');
    await expect(canvas).toHaveClass(/opacity-50/);
    
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const isDisabled = await button.isDisabled();
      if (await button.isVisible()) {
        expect(isDisabled).toBe(true);
      }
    }
  });

  test('should prevent editing in read-only mode', async ({ page }) => {
    await setupImageCropper(page, { readOnly: true });
    
    const canvas = await page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    
    // Try to drag - should not work
    const initialCrop = await getCropArea(page);
    
    await page.mouse.move(box.x + 150, box.y + 150);
    await page.mouse.down();
    await page.mouse.move(box.x + 250, box.y + 250);
    await page.mouse.up();
    
    const finalCrop = await getCropArea(page);
    expect(finalCrop).toEqual(initialCrop);
  });

  // ==========================================================================
  // File Upload Tests
  // ==========================================================================

  test('should handle file upload', async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement('div');
      container.id = 'test-container';
      document.body.appendChild(container);
      
      // @ts-ignore
      const { ImageCropper } = window.UIComponents;
      const element = React.createElement(ImageCropper, {
        allowUpload: true
      });
      ReactDOM.render(element, container);
    });
    
    const uploadButton = await page.locator('button:has-text("Upload Image")');
    await expect(uploadButton).toBeVisible();
    
    const fileInput = await page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });

  // ==========================================================================
  // Keyboard Shortcut Tests
  // ==========================================================================

  test('should support keyboard shortcuts', async ({ page }) => {
    await setupImageCropper(page, { enableKeyboard: true, enableHistory: true });
    
    const canvas = await page.locator('canvas');
    await canvas.focus();
    
    // Rotate with keyboard
    await page.keyboard.press('Control+r');
    
    // Undo with keyboard
    await page.keyboard.press('Control+z');
    
    // Redo with keyboard
    await page.keyboard.press('Control+y');
    
    // Save with keyboard
    await page.keyboard.press('Control+s');
  });

  // ==========================================================================
  // Watermark Tests
  // ==========================================================================

  test('should apply watermark to preview', async ({ page }) => {
    await setupImageCropper(page, {
      watermark: {
        text: 'Test Watermark',
        position: 'bottom-right',
        opacity: 0.5
      },
      showPreview: true
    });
    
    const previewCanvas = await page.locator('canvas').nth(1);
    await expect(previewCanvas).toBeVisible();
  });

  // ==========================================================================
  // Reset Tests
  // ==========================================================================

  test('should reset to initial state', async ({ page }) => {
    await setupImageCropper(page, {
      defaultCrop: { x: 100, y: 100, width: 200, height: 200 },
      defaultTransform: { rotation: 45, flipX: true, zoom: 1.5 }
    });
    
    // Make changes
    const rotateButton = await page.locator('button[title="Rotate Right"]');
    await rotateButton.click();
    
    // Reset
    const resetButton = await page.locator('button:has([class*="RefreshCw"])');
    await resetButton.click();
    
    const transform = await getTransform(page);
    expect(transform?.rotation).toBe(45);
    expect(transform?.flipX).toBe(true);
    expect(transform?.zoom).toBe(1.5);
  });
});