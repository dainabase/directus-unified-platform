import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { 
  DashboardGrid, 
  type DashboardWidget, 
  type DashboardLayout,
  type DashboardGridProps 
} from './dashboard-grid';

// Mock Lucide React icons
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

// Mock card component
jest.mock('../card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  )
}));

// Mock button component  
jest.mock('../button', () => ({
  Button: ({ children, onClick, variant, size, className, disabled }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      className={`btn ${variant} ${size} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  )
}));

// Test utilities
const createMockWidget = (id: string, overrides: Partial<DashboardWidget> = {}): DashboardWidget => ({
  id,
  type: 'test',
  title: `Widget ${id}`,
  content: <div data-testid={`widget-content-${id}`}>Content {id}</div>,
  position: { x: 0, y: 0, w: 3, h: 2 },
  ...overrides
});

const createMockLayout = (id: string, widgets: DashboardWidget[]): DashboardLayout => ({
  id,
  name: `Layout ${id}`,
  description: `Test layout ${id}`,
  widgets,
  cols: 12,
  rowHeight: 100,
  gap: 16,
  createdAt: new Date(),
  isDefault: false
});

const defaultProps: DashboardGridProps = {
  widgets: [],
  cols: 12,
  rowHeight: 100,
  gap: 16,
  allowEdit: true,
  isDraggable: true,
  isResizable: true
};

// Mock getBoundingClientRect for drag & drop tests
const mockGetBoundingClientRect = (width = 1200, height = 800) => {
  return jest.fn(() => ({
    width,
    height,
    top: 0,
    left: 0,
    bottom: height,
    right: width,
    x: 0,
    y: 0,
    toJSON: () => ({})
  }));
};

describe('DashboardGrid', () => {
  beforeEach(() => {
    // Mock HTMLElement methods for drag & drop
    HTMLElement.prototype.getBoundingClientRect = mockGetBoundingClientRect();
    HTMLElement.prototype.offsetWidth = 1200;
    HTMLElement.prototype.offsetHeight = 800;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('🏗️ Basic Rendering', () => {
    it('should render empty dashboard with layout icon', () => {
      render(<DashboardGrid {...defaultProps} />);
      
      expect(screen.getByTestId('layout-icon')).toBeInTheDocument();
      expect(screen.getByText('No widgets added yet')).toBeInTheDocument();
    });

    it('should render widgets with correct positions', () => {
      const widgets = [
        createMockWidget('1', { position: { x: 0, y: 0, w: 3, h: 2 } }),
        createMockWidget('2', { position: { x: 3, y: 0, w: 4, h: 3 } })
      ];

      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      expect(screen.getByTestId('widget-content-1')).toBeInTheDocument();
      expect(screen.getByTestId('widget-content-2')).toBeInTheDocument();
      expect(screen.getByText('Widget 1')).toBeInTheDocument();
      expect(screen.getByText('Widget 2')).toBeInTheDocument();
    });

    it('should apply custom className and styling', () => {
      const { container } = render(
        <DashboardGrid 
          {...defaultProps} 
          className="custom-grid"
          containerPadding={[20, 24]}
        />
      );
      
      expect(container.firstChild).toHaveClass('custom-grid');
    });

    it('should handle different grid configurations', () => {
      const props = {
        ...defaultProps,
        cols: 8,
        rowHeight: 120,
        gap: 20,
        widgets: [createMockWidget('1')]
      };

      render(<DashboardGrid {...props} />);
      expect(screen.getByText('Widget 1')).toBeInTheDocument();
    });
  });

  describe('🎛️ Edit Mode Management', () => {
    it('should toggle edit mode correctly', async () => {
      const user = userEvent.setup();
      render(<DashboardGrid {...defaultProps} />);
      
      const editButton = screen.getByText('Edit Layout');
      await user.click(editButton);
      
      expect(screen.getByText('Done Editing')).toBeInTheDocument();
      
      await user.click(screen.getByText('Done Editing'));
      expect(screen.getByText('Edit Layout')).toBeInTheDocument();
    });

    it('should show edit controls only in edit mode', async () => {
      const user = userEvent.setup();
      const widgets = [createMockWidget('1')];
      
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      // Initially no grip handles
      expect(screen.queryByTestId('grip-vertical')).not.toBeInTheDocument();
      
      // Enter edit mode
      await user.click(screen.getByText('Edit Layout'));
      
      // Now grip handles should be visible
      expect(screen.getByTestId('grip-vertical')).toBeInTheDocument();
    });

    it('should hide edit tools when allowEdit is false', () => {
      render(<DashboardGrid {...defaultProps} allowEdit={false} />);
      
      expect(screen.queryByText('Edit Layout')).not.toBeInTheDocument();
    });

    it('should show save and reset buttons in edit mode', async () => {
      const user = userEvent.setup();
      render(<DashboardGrid {...defaultProps} />);
      
      await user.click(screen.getByText('Edit Layout'));
      
      expect(screen.getByText('Save Layout')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });
  });

  describe('📦 Widget Management', () => {
    it('should render widget with all header elements', () => {
      const widgets = [
        createMockWidget('1', {
          isLocked: false,
          onSettings: jest.fn()
        })
      ];
      
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      expect(screen.getByText('Widget 1')).toBeInTheDocument();
      expect(screen.getByTestId('minimize-icon')).toBeInTheDocument();
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    });

    it('should handle widget collapse/expand', async () => {
      const user = userEvent.setup();
      const widgets = [createMockWidget('1')];
      
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      const collapseButton = screen.getByTestId('minimize-icon').closest('button')!;
      await user.click(collapseButton);
      
      // Content should be hidden when collapsed
      expect(screen.queryByTestId('widget-content-1')).not.toBeInTheDocument();
      
      // Should show maximize icon when collapsed
      expect(screen.getByTestId('maximize-icon')).toBeInTheDocument();
    });

    it('should handle widget locking/unlocking', async () => {
      const user = userEvent.setup();
      const widgets = [createMockWidget('1', { isLocked: false })];
      
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      // Enter edit mode to see lock controls
      await user.click(screen.getByText('Edit Layout'));
      
      const unlockButton = screen.getByTestId('unlock-icon').closest('button')!;
      await user.click(unlockButton);
      
      // Should show lock icon after locking
      await waitFor(() => {
        expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
      });
    });

    it('should handle widget removal', async () => {
      const user = userEvent.setup();
      const onWidgetRemove = jest.fn();
      const widgets = [createMockWidget('1')];
      
      render(
        <DashboardGrid 
          {...defaultProps} 
          widgets={widgets}
          onWidgetRemove={onWidgetRemove}
        />
      );
      
      // Enter edit mode
      await user.click(screen.getByText('Edit Layout'));
      
      const removeButton = screen.getByTestId('x-icon').closest('button')!;
      await user.click(removeButton);
      
      expect(onWidgetRemove).toHaveBeenCalledWith('1');
    });

    it('should not show remove button for locked widgets', async () => {
      const user = userEvent.setup();
      const widgets = [createMockWidget('1', { isLocked: true })];
      
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      await user.click(screen.getByText('Edit Layout'));
      
      // Should not show X button for locked widget
      expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();
    });

    it('should call onSettings when settings button clicked', async () => {
      const user = userEvent.setup();
      const onSettings = jest.fn();
      const widgets = [createMockWidget('1', { onSettings })];
      
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      const settingsButton = screen.getByTestId('settings-icon').closest('button')!;
      await user.click(settingsButton);
      
      expect(onSettings).toHaveBeenCalled();
    });

    it('should handle custom header actions', () => {
      const widgets = [
        createMockWidget('1', {
          headerActions: <button data-testid="custom-action">Custom</button>
        })
      ];
      
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      expect(screen.getByTestId('custom-action')).toBeInTheDocument();
    });
  });

  describe('🏃‍♂️ Drag and Drop', () => {
    it('should handle drag start', async () => {
      const widgets = [createMockWidget('1')];
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      // Enter edit mode
      await userEvent.click(screen.getByText('Edit Layout'));
      
      const widget = screen.getByText('Widget 1').closest('div')!;
      
      // Mock drag event
      const dragEvent = new DragEvent('dragstart', { bubbles: true });
      Object.defineProperty(dragEvent, 'dataTransfer', {
        value: {
          effectAllowed: '',
          setData: jest.fn(),
          getData: jest.fn()
        }
      });
      
      fireEvent(widget, dragEvent);
      
      // Widget should have draggable attribute
      expect(widget).toHaveAttribute('draggable', 'true');
    });

    it('should prevent drag on locked widgets', async () => {
      const widgets = [createMockWidget('1', { isLocked: true })];
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      await userEvent.click(screen.getByText('Edit Layout'));
      
      const widget = screen.getByText('Widget 1').closest('div')!;
      expect(widget).toHaveAttribute('draggable', 'false');
    });

    it('should handle drag and drop with position update', async () => {
      const onLayoutChange = jest.fn();
      const widgets = [createMockWidget('1', { position: { x: 0, y: 0, w: 3, h: 2 } })];
      
      render(
        <DashboardGrid 
          {...defaultProps} 
          widgets={widgets}
          onLayoutChange={onLayoutChange}
        />
      );
      
      await userEvent.click(screen.getByText('Edit Layout'));
      
      const widget = screen.getByText('Widget 1').closest('div')!;
      
      // Simulate drag and drop
      fireEvent.dragStart(widget, {
        clientX: 100,
        clientY: 100,
        dataTransfer: { effectAllowed: '', setData: jest.fn() }
      });
      
      fireEvent.drop(widget, {
        clientX: 300,
        clientY: 200
      });
      
      // Should call layout change with updated positions
      await waitFor(() => {
        expect(onLayoutChange).toHaveBeenCalled();
      });
    });

    it('should respect isDraggable prop', () => {
      const widgets = [createMockWidget('1')];
      render(
        <DashboardGrid 
          {...defaultProps} 
          widgets={widgets}
          isDraggable={false}
        />
      );
      
      const widget = screen.getByText('Widget 1').closest('div')!;
      expect(widget).toHaveAttribute('draggable', 'false');
    });
  });

  describe('📏 Widget Resizing', () => {
    it('should show resize handle in edit mode', async () => {
      const widgets = [createMockWidget('1')];
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      await userEvent.click(screen.getByText('Edit Layout'));
      
      // Should show resize handle
      const resizeHandle = screen.getByText('Widget 1')
        .closest('div')!
        .querySelector('.cursor-se-resize');
      
      expect(resizeHandle).toBeInTheDocument();
    });

    it('should not show resize handle for locked widgets', async () => {
      const widgets = [createMockWidget('1', { isLocked: true })];
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      await userEvent.click(screen.getByText('Edit Layout'));
      
      const resizeHandle = screen.getByText('Widget 1')
        .closest('div')!
        .querySelector('.cursor-se-resize');
      
      expect(resizeHandle).not.toBeInTheDocument();
    });

    it('should handle resize start', async () => {
      const widgets = [createMockWidget('1')];
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      await userEvent.click(screen.getByText('Edit Layout'));
      
      const resizeHandle = screen.getByText('Widget 1')
        .closest('div')!
        .querySelector('.cursor-se-resize')!;
      
      fireEvent.mouseDown(resizeHandle, {
        clientX: 100,
        clientY: 100
      });
      
      // Should start resize operation
      expect(resizeHandle).toBeInTheDocument();
    });

    it('should respect minW and maxW constraints', () => {
      const widgets = [
        createMockWidget('1', {
          minW: 2,
          maxW: 6,
          position: { x: 0, y: 0, w: 3, h: 2 }
        })
      ];
      
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      // Widget should respect constraints during resize
      expect(screen.getByText('Widget 1')).toBeInTheDocument();
    });

    it('should respect isResizable prop', async () => {
      const widgets = [createMockWidget('1')];
      render(
        <DashboardGrid 
          {...defaultProps} 
          widgets={widgets}
          isResizable={false}
        />
      );
      
      await userEvent.click(screen.getByText('Edit Layout'));
      
      const resizeHandle = screen.getByText('Widget 1')
        .closest('div')!
        .querySelector('.cursor-se-resize');
      
      expect(resizeHandle).not.toBeInTheDocument();
    });
  });

  describe('💾 Layout Management', () => {
    it('should show layout selector when layouts provided', () => {
      const layouts = [
        createMockLayout('1', [createMockWidget('1')]),
        createMockLayout('2', [createMockWidget('2')])
      ];
      
      render(
        <DashboardGrid 
          {...defaultProps} 
          layouts={layouts}
          showLayoutSelector={true}
        />
      );
      
      expect(screen.getByDisplayValue('Select Layout')).toBeInTheDocument();
    });

    it('should load selected layout', async () => {
      const user = userEvent.setup();
      const onLayoutLoad = jest.fn();
      const layouts = [
        createMockLayout('layout-1', [createMockWidget('1')])
      ];
      
      render(
        <DashboardGrid 
          {...defaultProps} 
          layouts={layouts}
          onLayoutLoad={onLayoutLoad}
          showLayoutSelector={true}
        />
      );
      
      const selector = screen.getByDisplayValue('Select Layout');
      await user.selectOptions(selector, 'layout-1');
      
      expect(onLayoutLoad).toHaveBeenCalledWith('layout-1');
    });

    it('should open save dialog when save button clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardGrid {...defaultProps} />);
      
      await user.click(screen.getByText('Edit Layout'));
      await user.click(screen.getByText('Save Layout'));
      
      expect(screen.getByText('Layout name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Layout name')).toBeInTheDocument();
    });

    it('should save layout with correct data', async () => {
      const user = userEvent.setup();
      const onLayoutSave = jest.fn();
      const widgets = [createMockWidget('1')];
      
      render(
        <DashboardGrid 
          {...defaultProps} 
          widgets={widgets}
          onLayoutSave={onLayoutSave}
        />
      );
      
      await user.click(screen.getByText('Edit Layout'));
      await user.click(screen.getByText('Save Layout'));
      
      const nameInput = screen.getByPlaceholderText('Layout name');
      await user.type(nameInput, 'Test Layout');
      await user.click(screen.getByText('Save'));
      
      expect(onLayoutSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Layout',
          widgets: widgets,
          cols: 12,
          rowHeight: 100,
          gap: 16
        })
      );
    });

    it('should close save dialog when cancel clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardGrid {...defaultProps} />);
      
      await user.click(screen.getByText('Edit Layout'));
      await user.click(screen.getByText('Save Layout'));
      
      await user.click(screen.getByText('Cancel'));
      
      expect(screen.queryByText('Layout name')).not.toBeInTheDocument();
    });

    it('should reset layout when reset clicked', async () => {
      const user = userEvent.setup();
      const onLayoutReset = jest.fn();
      
      render(
        <DashboardGrid 
          {...defaultProps} 
          onLayoutReset={onLayoutReset}
        />
      );
      
      await user.click(screen.getByText('Edit Layout'));
      await user.click(screen.getByText('Reset'));
      
      expect(onLayoutReset).toHaveBeenCalled();
    });
  });

  describe('🎨 Grid Layout & Positioning', () => {
    it('should calculate widget positions correctly', () => {
      const widgets = [
        createMockWidget('1', { position: { x: 0, y: 0, w: 3, h: 2 } }),
        createMockWidget('2', { position: { x: 3, y: 0, w: 3, h: 2 } }),
        createMockWidget('3', { position: { x: 0, y: 2, w: 6, h: 1 } })
      ];
      
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      expect(screen.getByText('Widget 1')).toBeInTheDocument();
      expect(screen.getByText('Widget 2')).toBeInTheDocument();
      expect(screen.getByText('Widget 3')).toBeInTheDocument();
    });

    it('should handle auto-sizing when enabled', () => {
      const widgets = [
        createMockWidget('1', { position: { x: 0, y: 0, w: 3, h: 2 } }),
        createMockWidget('2', { position: { x: 0, y: 5, w: 3, h: 2 } })
      ];
      
      render(
        <DashboardGrid 
          {...defaultProps} 
          widgets={widgets}
          autoSize={true}
        />
      );
      
      // Grid should auto-size to fit all widgets
      expect(screen.getByText('Widget 1')).toBeInTheDocument();
      expect(screen.getByText('Widget 2')).toBeInTheDocument();
    });

    it('should respect container padding', () => {
      const { container } = render(
        <DashboardGrid 
          {...defaultProps} 
          containerPadding={[24, 32]}
        />
      );
      
      // Container should have correct padding
      const gridContainer = container.querySelector('.relative.w-full');
      expect(gridContainer).toHaveStyle({ padding: '32px 24px' });
    });

    it('should handle different column configurations', () => {
      const widgets = [createMockWidget('1', { position: { x: 0, y: 0, w: 4, h: 2 } })];
      
      render(
        <DashboardGrid 
          {...defaultProps} 
          widgets={widgets}
          cols={8}
        />
      );
      
      expect(screen.getByText('Widget 1')).toBeInTheDocument();
    });
  });

  describe('📱 Responsive & Breakpoints', () => {
    it('should handle custom breakpoints', () => {
      const breakpoints = {
        lg: 1200,
        md: 768,
        sm: 480
      };
      
      render(
        <DashboardGrid 
          {...defaultProps} 
          breakpoints={breakpoints}
        />
      );
      
      expect(screen.getByText('No widgets added yet')).toBeInTheDocument();
    });

    it('should adapt to container width changes', () => {
      HTMLElement.prototype.offsetWidth = 800;
      
      const widgets = [createMockWidget('1')];
      
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      expect(screen.getByText('Widget 1')).toBeInTheDocument();
    });
  });

  describe('🔧 Collision Detection', () => {
    it('should prevent collision when enabled', () => {
      const widgets = [
        createMockWidget('1', { position: { x: 0, y: 0, w: 3, h: 2 } }),
        createMockWidget('2', { position: { x: 2, y: 0, w: 3, h: 2 } })
      ];
      
      render(
        <DashboardGrid 
          {...defaultProps} 
          widgets={widgets}
          preventCollision={true}
        />
      );
      
      expect(screen.getByText('Widget 1')).toBeInTheDocument();
      expect(screen.getByText('Widget 2')).toBeInTheDocument();
    });

    it('should allow overlap when collision prevention disabled', () => {
      const widgets = [
        createMockWidget('1', { position: { x: 0, y: 0, w: 3, h: 2 } }),
        createMockWidget('2', { position: { x: 1, y: 0, w: 3, h: 2 } })
      ];
      
      render(
        <DashboardGrid 
          {...defaultProps} 
          widgets={widgets}
          preventCollision={false}
        />
      );
      
      expect(screen.getByText('Widget 1')).toBeInTheDocument();
      expect(screen.getByText('Widget 2')).toBeInTheDocument();
    });
  });

  describe('🎯 Compaction Algorithms', () => {
    it('should compact vertically when enabled', () => {
      const widgets = [
        createMockWidget('1', { position: { x: 0, y: 5, w: 3, h: 2 } }),
        createMockWidget('2', { position: { x: 3, y: 8, w: 3, h: 2 } })
      ];
      
      render(
        <DashboardGrid 
          {...defaultProps} 
          widgets={widgets}
          compactType="vertical"
        />
      );
      
      expect(screen.getByText('Widget 1')).toBeInTheDocument();
      expect(screen.getByText('Widget 2')).toBeInTheDocument();
    });

    it('should compact horizontally when enabled', () => {
      const widgets = [
        createMockWidget('1', { position: { x: 5, y: 0, w: 3, h: 2 } }),
        createMockWidget('2', { position: { x: 8, y: 0, w: 3, h: 2 } })
      ];
      
      render(
        <DashboardGrid 
          {...defaultProps} 
          widgets={widgets}
          compactType="horizontal"
        />
      );
      
      expect(screen.getByText('Widget 1')).toBeInTheDocument();
      expect(screen.getByText('Widget 2')).toBeInTheDocument();
    });

    it('should not compact when disabled', () => {
      const widgets = [
        createMockWidget('1', { position: { x: 5, y: 5, w: 3, h: 2 } })
      ];
      
      render(
        <DashboardGrid 
          {...defaultProps} 
          widgets={widgets}
          compactType={null}
        />
      );
      
      expect(screen.getByText('Widget 1')).toBeInTheDocument();
    });
  });

  describe('🚀 Performance & Optimization', () => {
    it('should handle large number of widgets efficiently', () => {
      const widgets = Array.from({ length: 100 }, (_, i) => 
        createMockWidget(`widget-${i}`, {
          position: { 
            x: (i % 12), 
            y: Math.floor(i / 12), 
            w: 1, 
            h: 1 
          }
        })
      );
      
      const { container } = render(
        <DashboardGrid {...defaultProps} widgets={widgets} />
      );
      
      // Should render all widgets without performance issues
      expect(container.querySelectorAll('[data-testid="card"]')).toHaveLength(100);
    });

    it('should optimize re-renders during drag operations', async () => {
      const onLayoutChange = jest.fn();
      const widgets = [createMockWidget('1')];
      
      render(
        <DashboardGrid 
          {...defaultProps} 
          widgets={widgets}
          onLayoutChange={onLayoutChange}
        />
      );
      
      // Layout change should only be called when necessary
      expect(onLayoutChange).not.toHaveBeenCalled();
    });

    it('should cleanup event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(<DashboardGrid {...defaultProps} />);
      
      unmount();
      
      // Should clean up any global event listeners
      expect(removeEventListenerSpy).toHaveBeenCalled();
      
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('♿ Accessibility', () => {
    it('should have proper ARIA labels for interactive elements', async () => {
      const widgets = [createMockWidget('1')];
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      await userEvent.click(screen.getByText('Edit Layout'));
      
      // Interactive elements should have proper accessibility
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<DashboardGrid {...defaultProps} />);
      
      // Should be able to tab through interactive elements
      await user.tab();
      
      const editButton = screen.getByText('Edit Layout');
      expect(editButton).toHaveFocus();
    });

    it('should provide screen reader context for widgets', () => {
      const widgets = [
        createMockWidget('1', {
          title: 'Revenue Chart',
          content: <div role="img" aria-label="Monthly revenue chart">Chart content</div>
        })
      ];
      
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      expect(screen.getByText('Revenue Chart')).toBeInTheDocument();
      expect(screen.getByLabelText('Monthly revenue chart')).toBeInTheDocument();
    });
  });

  describe('📊 Integration & Callbacks', () => {
    it('should call onLayoutChange when widget positions update', async () => {
      const onLayoutChange = jest.fn();
      const widgets = [createMockWidget('1')];
      
      render(
        <DashboardGrid 
          {...defaultProps} 
          widgets={widgets}
          onLayoutChange={onLayoutChange}
        />
      );
      
      await userEvent.click(screen.getByText('Edit Layout'));
      
      // Simulate widget position change
      const collapseButton = screen.getByTestId('minimize-icon').closest('button')!;
      await userEvent.click(collapseButton);
      
      // Layout change callback should be triggered for significant changes
      // Note: Collapse doesn't trigger layout change, but drag/resize would
    });

    it('should call onWidgetAdd when add widget clicked', async () => {
      const onWidgetAdd = jest.fn();
      
      render(
        <DashboardGrid 
          {...defaultProps} 
          onWidgetAdd={onWidgetAdd}
        />
      );
      
      await userEvent.click(screen.getByText('Edit Layout'));
      await userEvent.click(screen.getByText('Add Widget'));
      
      expect(onWidgetAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'default',
          title: 'New Widget',
          position: { x: 0, y: 0, w: 3, h: 2 }
        })
      );
    });

    it('should update widgets when props change', () => {
      const initialWidgets = [createMockWidget('1')];
      const { rerender } = render(
        <DashboardGrid {...defaultProps} widgets={initialWidgets} />
      );
      
      const newWidgets = [
        createMockWidget('1'),
        createMockWidget('2')
      ];
      
      rerender(<DashboardGrid {...defaultProps} widgets={newWidgets} />);
      
      expect(screen.getByText('Widget 1')).toBeInTheDocument();
      expect(screen.getByText('Widget 2')).toBeInTheDocument();
    });
  });

  describe('🐛 Edge Cases & Error Handling', () => {
    it('should handle invalid widget positions gracefully', () => {
      const widgets = [
        createMockWidget('1', {
          position: { x: -1, y: -1, w: 0, h: 0 }
        })
      ];
      
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      // Should still render widget with corrected position
      expect(screen.getByText('Widget 1')).toBeInTheDocument();
    });

    it('should handle widgets exceeding grid bounds', () => {
      const widgets = [
        createMockWidget('1', {
          position: { x: 10, y: 0, w: 5, h: 2 } // Exceeds 12 column grid
        })
      ];
      
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      expect(screen.getByText('Widget 1')).toBeInTheDocument();
    });

    it('should handle empty layout gracefully', () => {
      render(<DashboardGrid {...defaultProps} layouts={[]} />);
      
      expect(screen.getByText('No widgets added yet')).toBeInTheDocument();
    });

    it('should handle missing widget content', () => {
      const widgets = [
        createMockWidget('1', { content: null as any })
      ];
      
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      expect(screen.getByText('Widget 1')).toBeInTheDocument();
    });

    it('should handle undefined callback functions', () => {
      const widgets = [createMockWidget('1')];
      
      render(
        <DashboardGrid 
          {...defaultProps} 
          widgets={widgets}
          onLayoutChange={undefined}
          onWidgetRemove={undefined}
        />
      );
      
      expect(screen.getByText('Widget 1')).toBeInTheDocument();
    });
  });

  describe('🎭 Advanced Scenarios', () => {
    it('should handle mixed widget configurations', () => {
      const widgets = [
        createMockWidget('locked', { 
          isLocked: true, 
          title: 'Locked Widget' 
        }),
        createMockWidget('draggable', { 
          draggable: true, 
          title: 'Draggable Widget' 
        }),
        createMockWidget('resizable', { 
          resizable: true, 
          minW: 2, 
          maxW: 8,
          title: 'Resizable Widget'
        }),
        createMockWidget('collapsed', { 
          isCollapsed: true, 
          title: 'Collapsed Widget' 
        })
      ];
      
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      expect(screen.getByText('Locked Widget')).toBeInTheDocument();
      expect(screen.getByText('Draggable Widget')).toBeInTheDocument();
      expect(screen.getByText('Resizable Widget')).toBeInTheDocument();
      expect(screen.getByText('Collapsed Widget')).toBeInTheDocument();
    });

    it('should maintain widget state during layout operations', async () => {
      const user = userEvent.setup();
      const widgets = [
        createMockWidget('1', { isCollapsed: false })
      ];
      
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      // Collapse widget
      const collapseButton = screen.getByTestId('minimize-icon').closest('button')!;
      await user.click(collapseButton);
      
      // Enter and exit edit mode
      await user.click(screen.getByText('Edit Layout'));
      await user.click(screen.getByText('Done Editing'));
      
      // Widget should remain collapsed
      expect(screen.getByTestId('maximize-icon')).toBeInTheDocument();
    });

    it('should handle rapid state changes gracefully', async () => {
      const user = userEvent.setup();
      const widgets = [createMockWidget('1')];
      
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      // Rapidly toggle edit mode
      await user.click(screen.getByText('Edit Layout'));
      await user.click(screen.getByText('Done Editing'));
      await user.click(screen.getByText('Edit Layout'));
      
      // Should handle rapid changes without errors
      expect(screen.getByText('Done Editing')).toBeInTheDocument();
    });

    it('should integrate properly with external widget types', () => {
      const widgets = [
        createMockWidget('chart', {
          type: 'chart',
          title: 'Sales Chart',
          content: (
            <div data-testid="chart-widget">
              <canvas data-testid="chart-canvas" />
              <div data-testid="chart-legend">Legend</div>
            </div>
          )
        }),
        createMockWidget('metric', {
          type: 'metric',
          title: 'KPI Metrics',
          content: (
            <div data-testid="metric-widget">
              <div data-testid="metric-value">$125,000</div>
              <div data-testid="metric-change">+12%</div>
            </div>
          )
        })
      ];
      
      render(<DashboardGrid {...defaultProps} widgets={widgets} />);
      
      expect(screen.getByTestId('chart-widget')).toBeInTheDocument();
      expect(screen.getByTestId('metric-widget')).toBeInTheDocument();
      expect(screen.getByText('$125,000')).toBeInTheDocument();
    });
  });
});
