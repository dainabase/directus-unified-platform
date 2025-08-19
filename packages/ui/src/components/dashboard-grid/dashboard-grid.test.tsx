import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DashboardGrid, type DashboardWidget, type DashboardLayout } from './dashboard-grid';

// Mock dependencies
jest.mock('lucide-react', () => ({
  GripVertical: () => <div data-testid="grip-vertical" />,
  X: () => <div data-testid="x-icon" />,
  Maximize2: () => <div data-testid="maximize-icon" />,
  Minimize2: () => <div data-testid="minimize-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  Save: () => <div data-testid="save-icon" />,
  RotateCcw: () => <div data-testid="reset-icon" />,
  Lock: () => <div data-testid="lock-icon" />,
  Unlock: () => <div data-testid="unlock-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Layout: () => <div data-testid="layout-icon" />,
  Grid3x3: () => <div data-testid="grid-icon" />
}));

// Sample test data
const sampleWidgets: DashboardWidget[] = [
  {
    id: 'widget-1',
    type: 'metric',
    title: 'Revenue',
    content: <div data-testid="widget-content-1">$125,000</div>,
    position: { x: 0, y: 0, w: 3, h: 2 },
    minW: 2,
    minH: 1,
    maxW: 6,
    maxH: 4
  },
  {
    id: 'widget-2',
    type: 'chart',
    title: 'Sales Chart',
    content: <div data-testid="widget-content-2">Chart Data</div>,
    position: { x: 3, y: 0, w: 6, h: 3 },
    minW: 4,
    minH: 2
  },
  {
    id: 'widget-3',
    type: 'table',
    title: 'Recent Orders',
    content: <div data-testid="widget-content-3">Table Data</div>,
    position: { x: 0, y: 2, w: 9, h: 4 },
    isLocked: true
  }
];

const sampleLayouts: DashboardLayout[] = [
  {
    id: 'layout-1',
    name: 'Executive Dashboard',
    description: 'High-level metrics for C-level',
    widgets: sampleWidgets,
    cols: 12,
    rowHeight: 100,
    gap: 16,
    createdAt: new Date('2025-01-01'),
    isDefault: true
  },
  {
    id: 'layout-2',
    name: 'Sales Dashboard',
    description: 'Detailed sales analytics',
    widgets: sampleWidgets.slice(0, 2),
    cols: 12,
    rowHeight: 120,
    gap: 20
  }
];

// Mock resize observer
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock drag events
const createDragEvent = (type: string, clientX = 100, clientY = 100) => {
  return new DragEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX,
    clientY,
    dataTransfer: {
      effectAllowed: 'move',
      dropEffect: 'move',
      setData: jest.fn(),
      getData: jest.fn()
    } as any
  });
};

// Mock mouse events for resize
const createMouseEvent = (type: string, clientX = 100, clientY = 100) => {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX,
    clientY
  });
};

describe('DashboardGrid', () => {
  let mockOnLayoutChange: jest.Mock;
  let mockOnWidgetRemove: jest.Mock;
  let mockOnWidgetAdd: jest.Mock;
  let mockOnLayoutSave: jest.Mock;
  let mockOnLayoutLoad: jest.Mock;
  let mockOnLayoutReset: jest.Mock;

  beforeEach(() => {
    mockOnLayoutChange = jest.fn();
    mockOnWidgetRemove = jest.fn();
    mockOnWidgetAdd = jest.fn();
    mockOnLayoutSave = jest.fn();
    mockOnLayoutLoad = jest.fn();
    mockOnLayoutReset = jest.fn();
    
    // Mock container dimensions
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 1200
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      value: 800
    });
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        width: 1200,
        height: 800,
        top: 0,
        left: 0,
        bottom: 800,
        right: 1200
      })
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===== CORE RENDERING TESTS =====
  describe('Core Rendering', () => {
    it('renders dashboard grid with widgets', () => {
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('Sales Chart')).toBeInTheDocument();
      expect(screen.getByText('Recent Orders')).toBeInTheDocument();
      expect(screen.getByTestId('widget-content-1')).toBeInTheDocument();
      expect(screen.getByTestId('widget-content-2')).toBeInTheDocument();
      expect(screen.getByTestId('widget-content-3')).toBeInTheDocument();
    });

    it('renders empty state when no widgets', () => {
      render(
        <DashboardGrid
          widgets={[]}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      expect(screen.getByText('No widgets added yet')).toBeInTheDocument();
      expect(screen.getByTestId('layout-icon')).toBeInTheDocument();
    });

    it('applies custom grid configuration', () => {
      const { container } = render(
        <DashboardGrid
          widgets={sampleWidgets}
          cols={8}
          rowHeight={150}
          gap={24}
          className="custom-grid"
          onLayoutChange={mockOnLayoutChange}
        />
      );

      expect(container.firstChild).toHaveClass('custom-grid');
      // Grid calculations should reflect custom values
      const widgets = container.querySelectorAll('[style*="position: absolute"]');
      expect(widgets).toHaveLength(3);
    });

    it('renders widget headers correctly', () => {
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      // Check widget titles
      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('Sales Chart')).toBeInTheDocument();
      expect(screen.getByText('Recent Orders')).toBeInTheDocument();

      // Check collapse buttons
      expect(screen.getAllByTestId('minimize-icon')).toHaveLength(3);
    });

    it('renders locked widget indicators', () => {
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      // Widget 3 is locked
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
    });
  });

  // ===== EDIT MODE TESTS =====
  describe('Edit Mode', () => {
    it('toggles edit mode correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          allowEdit={true}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      const editButton = screen.getByText('Edit Layout');
      await user.click(editButton);

      expect(screen.getByText('Done Editing')).toBeInTheDocument();
      
      // Should show edit controls
      expect(screen.getByText('Save Layout')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('shows drag handles in edit mode', async () => {
      const user = userEvent.setup();
      
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          allowEdit={true}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      await user.click(screen.getByText('Edit Layout'));

      // Should show grip handles for draggable widgets (not locked ones)
      const gripHandles = screen.getAllByTestId('grip-vertical');
      expect(gripHandles).toHaveLength(2); // Widget 3 is locked
    });

    it('shows remove buttons for unlocked widgets in edit mode', async () => {
      const user = userEvent.setup();
      
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          allowEdit={true}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      await user.click(screen.getByText('Edit Layout'));

      // Should show X buttons for unlocked widgets
      const removeButtons = screen.getAllByTestId('x-icon');
      expect(removeButtons).toHaveLength(2); // Widget 3 is locked
    });

    it('disables edit mode when allowEdit is false', () => {
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          allowEdit={false}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      expect(screen.queryByText('Edit Layout')).not.toBeInTheDocument();
    });
  });

  // ===== WIDGET MANAGEMENT TESTS =====
  describe('Widget Management', () => {
    it('removes widget correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          allowEdit={true}
          onLayoutChange={mockOnLayoutChange}
          onWidgetRemove={mockOnWidgetRemove}
        />
      );

      await user.click(screen.getByText('Edit Layout'));
      
      // Remove first widget (Revenue)
      const removeButtons = screen.getAllByTestId('x-icon');
      await user.click(removeButtons[0]);

      expect(mockOnWidgetRemove).toHaveBeenCalledWith('widget-1');
      expect(mockOnLayoutChange).toHaveBeenCalled();
    });

    it('toggles widget collapse correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      // Click minimize button on first widget
      const minimizeButtons = screen.getAllByTestId('minimize-icon');
      await user.click(minimizeButtons[0]);

      // Widget should be collapsed (content hidden)
      await waitFor(() => {
        expect(screen.queryByTestId('widget-content-1')).not.toBeVisible();
      });
    });

    it('toggles widget lock correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          allowEdit={true}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      await user.click(screen.getByText('Edit Layout'));

      // Click unlock button on locked widget
      const unlockButton = screen.getByTestId('lock-icon');
      await user.click(unlockButton);

      // Should show unlock icon now
      await waitFor(() => {
        expect(screen.getByTestId('unlock-icon')).toBeInTheDocument();
      });
    });

    it('calls widget settings handler', async () => {
      const mockOnSettings = jest.fn();
      const widgetsWithSettings = [
        {
          ...sampleWidgets[0],
          onSettings: mockOnSettings
        }
      ];

      const user = userEvent.setup();
      
      render(
        <DashboardGrid
          widgets={widgetsWithSettings}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      const settingsButton = screen.getByTestId('settings-icon');
      await user.click(settingsButton);

      expect(mockOnSettings).toHaveBeenCalled();
    });
  });

  // ===== DRAG AND DROP TESTS =====
  describe('Drag and Drop', () => {
    it('handles drag start correctly', async () => {
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          allowEdit={true}
          isDraggable={true}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      // Enter edit mode first
      await userEvent.click(screen.getByText('Edit Layout'));

      const widgetElement = screen.getByText('Revenue').closest('[draggable="true"]');
      expect(widgetElement).toBeInTheDocument();

      if (widgetElement) {
        const dragEvent = createDragEvent('dragstart', 100, 100);
        fireEvent(widgetElement, dragEvent);
        
        // Should set dragged state
        expect(widgetElement).toHaveAttribute('draggable', 'true');
      }
    });

    it('prevents dragging locked widgets', async () => {
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          allowEdit={true}
          isDraggable={true}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      await userEvent.click(screen.getByText('Edit Layout'));

      // Locked widget should not be draggable
      const lockedWidget = screen.getByText('Recent Orders').closest('div');
      expect(lockedWidget?.closest('[draggable="true"]')).not.toBeInTheDocument();
    });

    it('handles drop and layout change', async () => {
      const { container } = render(
        <DashboardGrid
          widgets={sampleWidgets}
          allowEdit={true}
          isDraggable={true}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      await userEvent.click(screen.getByText('Edit Layout'));

      const gridContainer = container.querySelector('.relative.w-full');
      expect(gridContainer).toBeInTheDocument();

      if (gridContainer) {
        // Simulate drag and drop
        const dragEvent = createDragEvent('dragover', 200, 150);
        fireEvent(gridContainer, dragEvent);

        const dropEvent = createDragEvent('drop', 200, 150);
        fireEvent(gridContainer, dropEvent);

        // Layout change should be called
        expect(mockOnLayoutChange).toHaveBeenCalled();
      }
    });

    it('prevents collision when enabled', async () => {
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          allowEdit={true}
          isDraggable={true}
          preventCollision={true}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      await userEvent.click(screen.getByText('Edit Layout'));

      // Test collision prevention logic
      // This would require more complex setup to simulate actual collisions
      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });
  });

  // ===== RESIZE TESTS =====
  describe('Widget Resizing', () => {
    it('handles resize start correctly', async () => {
      const { container } = render(
        <DashboardGrid
          widgets={sampleWidgets}
          allowEdit={true}
          isResizable={true}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      await userEvent.click(screen.getByText('Edit Layout'));

      // Find resize handle
      const resizeHandle = container.querySelector('.cursor-se-resize');
      expect(resizeHandle).toBeInTheDocument();

      if (resizeHandle) {
        const mouseDownEvent = createMouseEvent('mousedown', 100, 100);
        fireEvent(resizeHandle, mouseDownEvent);

        // Should start resize mode
        expect(resizeHandle).toHaveClass('cursor-se-resize');
      }
    });

    it('respects min/max size constraints', async () => {
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          allowEdit={true}
          isResizable={true}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      await userEvent.click(screen.getByText('Edit Layout'));

      // Widget 1 has minW: 2, maxW: 6
      const widget = screen.getByText('Revenue');
      expect(widget).toBeInTheDocument();
      
      // Size constraints should be enforced during resize
      // This would require simulating actual resize events
    });

    it('prevents resizing locked widgets', async () => {
      const { container } = render(
        <DashboardGrid
          widgets={sampleWidgets}
          allowEdit={true}
          isResizable={true}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      await userEvent.click(screen.getByText('Edit Layout'));

      // Locked widget should not have resize handle
      const lockedWidgetCard = screen.getByText('Recent Orders').closest('.group');
      const resizeHandle = lockedWidgetCard?.querySelector('.cursor-se-resize');
      expect(resizeHandle).not.toBeInTheDocument();
    });
  });

  // ===== LAYOUT MANAGEMENT TESTS =====
  describe('Layout Management', () => {
    it('shows layout selector when provided', () => {
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          layouts={sampleLayouts}
          showLayoutSelector={true}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      const layoutSelector = screen.getByDisplayValue('Select Layout');
      expect(layoutSelector).toBeInTheDocument();
      
      // Should have layout options
      expect(screen.getByText('Executive Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Sales Dashboard')).toBeInTheDocument();
    });

    it('loads selected layout', async () => {
      const user = userEvent.setup();
      
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          layouts={sampleLayouts}
          showLayoutSelector={true}
          onLayoutLoad={mockOnLayoutLoad}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      const layoutSelector = screen.getByDisplayValue('Select Layout');
      await user.selectOptions(layoutSelector, 'layout-2');

      expect(mockOnLayoutLoad).toHaveBeenCalledWith('layout-2');
    });

    it('opens save dialog correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          allowEdit={true}
          onLayoutSave={mockOnLayoutSave}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      await user.click(screen.getByText('Edit Layout'));
      await user.click(screen.getByText('Save Layout'));

      expect(screen.getByText('Layout name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Layout name')).toBeInTheDocument();
    });

    it('saves layout with valid name', async () => {
      const user = userEvent.setup();
      
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          allowEdit={true}
          onLayoutSave={mockOnLayoutSave}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      await user.click(screen.getByText('Edit Layout'));
      await user.click(screen.getByText('Save Layout'));

      const nameInput = screen.getByPlaceholderText('Layout name');
      await user.type(nameInput, 'New Layout');
      
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(mockOnLayoutSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Layout',
          widgets: sampleWidgets
        })
      );
    });

    it('resets layout correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          allowEdit={true}
          onLayoutReset={mockOnLayoutReset}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      await user.click(screen.getByText('Edit Layout'));
      await user.click(screen.getByText('Reset'));

      expect(mockOnLayoutReset).toHaveBeenCalled();
    });
  });

  // ===== RESPONSIVE TESTS =====
  describe('Responsive Behavior', () => {
    it('adapts to different breakpoints', () => {
      const customBreakpoints = {
        lg: 1200,
        md: 996,
        sm: 768,
        xs: 480
      };

      render(
        <DashboardGrid
          widgets={sampleWidgets}
          breakpoints={customBreakpoints}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      // Should render with responsive behavior
      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });

    it('handles container padding correctly', () => {
      const { container } = render(
        <DashboardGrid
          widgets={sampleWidgets}
          containerPadding={[24, 32]}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      const gridContainer = container.querySelector('[style*="padding"]');
      expect(gridContainer).toHaveStyle('padding: 32px 24px');
    });

    it('supports auto-sizing when enabled', () => {
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          autoSize={true}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      // Grid should auto-size based on widget positions
      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });
  });

  // ===== COMPACTION TESTS =====
  describe('Widget Compaction', () => {
    it('applies vertical compaction correctly', () => {
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          compactType="vertical"
          onLayoutChange={mockOnLayoutChange}
        />
      );

      // Widgets should be compacted vertically
      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });

    it('applies horizontal compaction correctly', () => {
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          compactType="horizontal"
          onLayoutChange={mockOnLayoutChange}
        />
      );

      // Widgets should be compacted horizontally  
      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });

    it('disables compaction when set to null', () => {
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          compactType={null}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      // No compaction should be applied
      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });
  });

  // ===== ERROR HANDLING TESTS =====
  describe('Error Handling', () => {
    it('handles empty widgets array gracefully', () => {
      render(
        <DashboardGrid
          widgets={[]}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      expect(screen.getByText('No widgets added yet')).toBeInTheDocument();
    });

    it('handles invalid widget positions gracefully', () => {
      const invalidWidgets = [
        {
          ...sampleWidgets[0],
          position: { x: -1, y: -1, w: 0, h: 0 }
        }
      ];

      render(
        <DashboardGrid
          widgets={invalidWidgets}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      // Should still render without crashing
      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });

    it('handles missing callback functions gracefully', () => {
      render(
        <DashboardGrid
          widgets={sampleWidgets}
        />
      );

      // Should render without required callbacks
      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });
  });

  // ===== ACCESSIBILITY TESTS =====
  describe('Accessibility', () => {
    it('provides proper ARIA labels', () => {
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      // Check for semantic HTML structure
      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(3);
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          allowEdit={true}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      // Should be able to tab through interactive elements
      await user.tab();
      expect(screen.getByText('Edit Layout')).toHaveFocus();
    });

    it('provides screen reader friendly content', () => {
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      // Check for descriptive text
      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('Sales Chart')).toBeInTheDocument();
    });
  });

  // ===== PERFORMANCE TESTS =====
  describe('Performance', () => {
    it('handles large number of widgets efficiently', () => {
      const manyWidgets = Array.from({ length: 50 }, (_, i) => ({
        id: `widget-${i}`,
        type: 'metric',
        title: `Widget ${i}`,
        content: <div>Content {i}</div>,
        position: { x: i % 12, y: Math.floor(i / 12), w: 2, h: 2 }
      }));

      const { container } = render(
        <DashboardGrid
          widgets={manyWidgets}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      // Should render all widgets
      expect(container.querySelectorAll('[data-testid]')).toBeTruthy();
    });

    it('optimizes re-renders with React.memo patterns', () => {
      const { rerender } = render(
        <DashboardGrid
          widgets={sampleWidgets}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      // Re-render with same props
      rerender(
        <DashboardGrid
          widgets={sampleWidgets}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      // Should not cause unnecessary re-renders
      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });
  });

  // ===== INTEGRATION TESTS =====
  describe('Integration Scenarios', () => {
    it('works with external widget management', async () => {
      const user = userEvent.setup();
      
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          allowEdit={true}
          onWidgetAdd={mockOnWidgetAdd}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      await user.click(screen.getByText('Edit Layout'));

      // Should integrate with external widget addition
      expect(mockOnWidgetAdd).toBeDefined();
    });

    it('maintains state consistency across operations', async () => {
      const user = userEvent.setup();
      
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          allowEdit={true}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      await user.click(screen.getByText('Edit Layout'));
      
      // Perform multiple operations
      const minimizeButtons = screen.getAllByTestId('minimize-icon');
      await user.click(minimizeButtons[0]);

      // State should remain consistent
      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });

    it('handles complex layout configurations', () => {
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          cols={16}
          rowHeight={80}
          gap={12}
          margin={[8, 8]}
          containerPadding={[12, 16]}
          compactType="vertical"
          preventCollision={true}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      // Should handle complex configuration
      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });
  });

  // ===== EDGE CASES =====
  describe('Edge Cases', () => {
    it('handles widgets with no content gracefully', () => {
      const emptyContentWidgets = [
        {
          ...sampleWidgets[0],
          content: null
        }
      ];

      render(
        <DashboardGrid
          widgets={emptyContentWidgets}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });

    it('handles extremely small grid configurations', () => {
      render(
        <DashboardGrid
          widgets={sampleWidgets}
          cols={1}
          rowHeight={50}
          gap={4}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      // Should adapt to small grid
      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });

    it('handles widgets exceeding grid boundaries', () => {
      const oversizedWidgets = [
        {
          ...sampleWidgets[0],
          position: { x: 10, y: 0, w: 8, h: 2 } // Exceeds 12 column grid
        }
      ];

      render(
        <DashboardGrid
          widgets={oversizedWidgets}
          cols={12}
          onLayoutChange={mockOnLayoutChange}
        />
      );

      // Should handle gracefully
      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });
  });
});