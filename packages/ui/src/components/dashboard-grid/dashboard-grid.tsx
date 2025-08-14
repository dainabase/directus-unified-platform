import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { 
  GripVertical, 
  X, 
  Maximize2, 
  Minimize2, 
  Settings,
  Save,
  RotateCcw,
  Lock,
  Unlock,
  Plus,
  Layout,
  Grid3x3
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../button';
import { Card } from '../card';

// Types for Dashboard Grid System
export interface GridPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  content: React.ReactNode;
  position: GridPosition;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  isLocked?: boolean;
  isCollapsed?: boolean;
  className?: string;
  headerActions?: React.ReactNode;
  onRemove?: () => void;
  onSettings?: () => void;
  resizable?: boolean;
  draggable?: boolean;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  cols: number;
  rowHeight: number;
  gap: number;
  createdAt?: Date;
  updatedAt?: Date;
  isDefault?: boolean;
}

export interface DashboardGridProps {
  widgets: DashboardWidget[];
  cols?: number;
  rowHeight?: number;
  gap?: number;
  layouts?: DashboardLayout[];
  currentLayoutId?: string;
  onLayoutChange?: (widgets: DashboardWidget[]) => void;
  onWidgetRemove?: (widgetId: string) => void;
  onWidgetAdd?: (widget: DashboardWidget) => void;
  onLayoutSave?: (layout: DashboardLayout) => void;
  onLayoutLoad?: (layoutId: string) => void;
  onLayoutReset?: () => void;
  allowEdit?: boolean;
  showLayoutSelector?: boolean;
  compactType?: 'vertical' | 'horizontal' | null;
  preventCollision?: boolean;
  className?: string;
  containerPadding?: [number, number];
  margin?: [number, number];
  isDraggable?: boolean;
  isResizable?: boolean;
  autoSize?: boolean;
  breakpoints?: Record<string, number>;
  layouts?: Record<string, DashboardWidget[]>;
}

// Grid calculation utilities
const calculateGridPosition = (
  element: HTMLElement,
  container: HTMLElement,
  cols: number,
  rowHeight: number,
  gap: number
): GridPosition => {
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  
  const colWidth = (containerRect.width - gap * (cols - 1)) / cols;
  const x = Math.round((elementRect.left - containerRect.left) / (colWidth + gap));
  const y = Math.round((elementRect.top - containerRect.top) / (rowHeight + gap));
  const w = Math.round(elementRect.width / colWidth);
  const h = Math.round(elementRect.height / rowHeight);
  
  return { x, y, w, h };
};

const checkCollision = (
  widget1: GridPosition,
  widget2: GridPosition
): boolean => {
  return !(
    widget1.x + widget1.w <= widget2.x ||
    widget2.x + widget2.w <= widget1.x ||
    widget1.y + widget1.h <= widget2.y ||
    widget2.y + widget2.h <= widget1.y
  );
};

const compactWidgets = (
  widgets: DashboardWidget[],
  compactType: 'vertical' | 'horizontal' | null,
  cols: number
): DashboardWidget[] => {
  if (!compactType) return widgets;
  
  const sorted = [...widgets].sort((a, b) => {
    if (compactType === 'vertical') {
      return a.position.y - b.position.y || a.position.x - b.position.x;
    }
    return a.position.x - b.position.x || a.position.y - b.position.y;
  });
  
  const compacted: DashboardWidget[] = [];
  
  sorted.forEach(widget => {
    let newPosition = { ...widget.position };
    
    if (compactType === 'vertical') {
      newPosition.y = 0;
      // Find the first available Y position
      for (let y = 0; y < 100; y++) {
        newPosition.y = y;
        const collision = compacted.some(w => 
          checkCollision(w.position, newPosition)
        );
        if (!collision) break;
      }
    } else {
      newPosition.x = 0;
      // Find the first available X position
      for (let x = 0; x < cols; x++) {
        newPosition.x = x;
        if (newPosition.x + newPosition.w > cols) {
          newPosition.x = cols - newPosition.w;
        }
        const collision = compacted.some(w => 
          checkCollision(w.position, newPosition)
        );
        if (!collision) break;
      }
    }
    
    compacted.push({
      ...widget,
      position: newPosition
    });
  });
  
  return compacted;
};

/**
 * Dashboard Grid Component
 * 
 * A flexible grid system for building customizable dashboards with
 * drag-and-drop, resizing, and layout management capabilities.
 */
export const DashboardGrid: React.FC<DashboardGridProps> = ({
  widgets: initialWidgets,
  cols = 12,
  rowHeight = 100,
  gap = 16,
  layouts: savedLayouts = [],
  currentLayoutId,
  onLayoutChange,
  onWidgetRemove,
  onWidgetAdd,
  onLayoutSave,
  onLayoutLoad,
  onLayoutReset,
  allowEdit = true,
  showLayoutSelector = true,
  compactType = 'vertical',
  preventCollision = false,
  className,
  containerPadding = [16, 16],
  margin = [16, 16],
  isDraggable = true,
  isResizable = true,
  autoSize = false,
  breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
}) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(initialWidgets);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [resizingWidget, setResizingWidget] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState(currentLayoutId);
  const [layoutName, setLayoutName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const resizeStartPos = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  // Update widgets when props change
  useEffect(() => {
    setWidgets(initialWidgets);
  }, [initialWidgets]);

  // Get current breakpoint
  const getCurrentBreakpoint = useCallback(() => {
    if (!containerRef.current) return 'lg';
    const width = containerRef.current.offsetWidth;
    
    const sortedBreakpoints = Object.entries(breakpoints).sort(
      ([, a], [, b]) => b - a
    );
    
    for (const [key, value] of sortedBreakpoints) {
      if (width >= value) return key;
    }
    return 'xxs';
  }, [breakpoints]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, widgetId: string) => {
    if (!allowEdit || !editMode || !isDraggable) return;
    
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget || widget.isLocked || widget.draggable === false) return;
    
    setDraggedWidget(widgetId);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    e.dataTransfer.effectAllowed = 'move';
  }, [widgets, allowEdit, editMode, isDraggable]);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedWidget || !containerRef.current || !dragStartPos.current) return;
    
    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;
    
    const colWidth = (containerRef.current.offsetWidth - gap * (cols - 1)) / cols;
    const newX = Math.round(deltaX / (colWidth + gap));
    const newY = Math.round(deltaY / (rowHeight + gap));
    
    setWidgets(prev => {
      const updated = prev.map(widget => {
        if (widget.id === draggedWidget) {
          const newPosition = {
            ...widget.position,
            x: Math.max(0, Math.min(cols - widget.position.w, widget.position.x + newX)),
            y: Math.max(0, widget.position.y + newY)
          };
          
          // Check collision if prevention is enabled
          if (preventCollision) {
            const hasCollision = prev.some(w => 
              w.id !== widget.id && checkCollision(w.position, newPosition)
            );
            if (hasCollision) return widget;
          }
          
          return { ...widget, position: newPosition };
        }
        return widget;
      });
      
      // Apply compaction if enabled
      const compacted = compactType ? compactWidgets(updated, compactType, cols) : updated;
      
      onLayoutChange?.(compacted);
      return compacted;
    });
    
    setDraggedWidget(null);
    dragStartPos.current = null;
  }, [draggedWidget, cols, rowHeight, gap, preventCollision, compactType, onLayoutChange]);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, widgetId: string) => {
    if (!allowEdit || !editMode || !isResizable) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget || widget.isLocked || widget.resizable === false) return;
    
    setResizingWidget(widgetId);
    resizeStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      w: widget.position.w,
      h: widget.position.h
    };
  }, [widgets, allowEdit, editMode, isResizable]);

  // Handle resize
  const handleResize = useCallback((e: MouseEvent) => {
    if (!resizingWidget || !containerRef.current || !resizeStartPos.current) return;
    
    const deltaX = e.clientX - resizeStartPos.current.x;
    const deltaY = e.clientY - resizeStartPos.current.y;
    
    const colWidth = (containerRef.current.offsetWidth - gap * (cols - 1)) / cols;
    const newW = Math.round(deltaX / (colWidth + gap));
    const newH = Math.round(deltaY / (rowHeight + gap));
    
    setWidgets(prev => prev.map(widget => {
      if (widget.id === resizingWidget) {
        const minW = widget.minW || 1;
        const minH = widget.minH || 1;
        const maxW = widget.maxW || cols;
        const maxH = widget.maxH || Infinity;
        
        const newPosition = {
          ...widget.position,
          w: Math.max(minW, Math.min(maxW, resizeStartPos.current!.w + newW)),
          h: Math.max(minH, Math.min(maxH, resizeStartPos.current!.h + newH))
        };
        
        // Ensure widget doesn't exceed grid bounds
        if (newPosition.x + newPosition.w > cols) {
          newPosition.w = cols - newPosition.x;
        }
        
        return { ...widget, position: newPosition };
      }
      return widget;
    }));
  }, [resizingWidget, cols, rowHeight, gap]);

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    if (!resizingWidget) return;
    
    setResizingWidget(null);
    resizeStartPos.current = null;
    
    // Apply compaction and notify
    const compacted = compactType ? compactWidgets(widgets, compactType, cols) : widgets;
    setWidgets(compacted);
    onLayoutChange?.(compacted);
  }, [resizingWidget, widgets, compactType, cols, onLayoutChange]);

  // Setup resize listeners
  useEffect(() => {
    if (resizingWidget) {
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizingWidget, handleResize, handleResizeEnd]);

  // Toggle widget collapse
  const toggleWidgetCollapse = useCallback((widgetId: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, isCollapsed: !widget.isCollapsed }
        : widget
    ));
  }, []);

  // Toggle widget lock
  const toggleWidgetLock = useCallback((widgetId: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, isLocked: !widget.isLocked }
        : widget
    ));
  }, []);

  // Remove widget
  const removeWidget = useCallback((widgetId: string) => {
    setWidgets(prev => {
      const updated = prev.filter(w => w.id !== widgetId);
      onLayoutChange?.(updated);
      onWidgetRemove?.(widgetId);
      return updated;
    });
  }, [onLayoutChange, onWidgetRemove]);

  // Save current layout
  const saveLayout = useCallback(() => {
    if (!layoutName) return;
    
    const layout: DashboardLayout = {
      id: `layout-${Date.now()}`,
      name: layoutName,
      widgets: widgets,
      cols,
      rowHeight,
      gap,
      createdAt: new Date()
    };
    
    onLayoutSave?.(layout);
    setShowSaveDialog(false);
    setLayoutName('');
  }, [widgets, cols, rowHeight, gap, layoutName, onLayoutSave]);

  // Load saved layout
  const loadLayout = useCallback((layoutId: string) => {
    const layout = savedLayouts.find(l => l.id === layoutId);
    if (layout) {
      setWidgets(layout.widgets);
      setSelectedLayout(layoutId);
      onLayoutLoad?.(layoutId);
    }
  }, [savedLayouts, onLayoutLoad]);

  // Reset layout
  const resetLayout = useCallback(() => {
    setWidgets(initialWidgets);
    onLayoutReset?.();
  }, [initialWidgets, onLayoutReset]);

  // Calculate grid height
  const gridHeight = useMemo(() => {
    if (autoSize && widgets.length > 0) {
      const maxY = Math.max(...widgets.map(w => w.position.y + w.position.h));
      return maxY * (rowHeight + gap) + containerPadding[1];
    }
    return undefined;
  }, [widgets, rowHeight, gap, autoSize, containerPadding]);

  // Render individual widget
  const renderWidget = (widget: DashboardWidget) => {
    const { position } = widget;
    const colWidth = `calc((100% - ${gap * (cols - 1)}px) / ${cols})`;
    
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `calc(${position.x} * (${colWidth} + ${gap}px))`,
      top: position.y * (rowHeight + gap),
      width: `calc(${position.w} * ${colWidth} + ${(position.w - 1) * gap}px)`,
      height: widget.isCollapsed ? 48 : position.h * rowHeight + (position.h - 1) * gap,
      transition: resizingWidget === widget.id || draggedWidget === widget.id 
        ? 'none' 
        : 'all 0.2s ease'
    };
    
    return (
      <div
        key={widget.id}
        className={cn(
          "group relative",
          widget.className,
          draggedWidget === widget.id && "opacity-50",
          resizingWidget === widget.id && "z-50"
        )}
        style={style}
        draggable={editMode && isDraggable && !widget.isLocked && widget.draggable !== false}
        onDragStart={(e) => handleDragStart(e, widget.id)}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Card className="h-full w-full overflow-hidden">
          {/* Widget Header */}
          <div className="flex items-center justify-between p-3 border-b bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-2">
              {editMode && isDraggable && !widget.isLocked && (
                <GripVertical className="h-4 w-4 cursor-move text-gray-400" />
              )}
              <h3 className="font-medium text-sm">{widget.title}</h3>
              {widget.isLocked && (
                <Lock className="h-3 w-3 text-gray-400" />
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {widget.headerActions}
              
              {editMode && (
                <>
                  {!widget.isLocked && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => toggleWidgetLock(widget.id)}
                    >
                      <Unlock className="h-3 w-3" />
                    </Button>
                  )}
                  {widget.isLocked && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => toggleWidgetLock(widget.id)}
                    >
                      <Lock className="h-3 w-3" />
                    </Button>
                  )}
                </>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => toggleWidgetCollapse(widget.id)}
              >
                {widget.isCollapsed ? (
                  <Maximize2 className="h-3 w-3" />
                ) : (
                  <Minimize2 className="h-3 w-3" />
                )}
              </Button>
              
              {widget.onSettings && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={widget.onSettings}
                >
                  <Settings className="h-3 w-3" />
                </Button>
              )}
              
              {editMode && !widget.isLocked && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => removeWidget(widget.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Widget Content */}
          {!widget.isCollapsed && (
            <div className="p-4 h-[calc(100%-53px)] overflow-auto">
              {widget.content}
            </div>
          )}
          
          {/* Resize Handle */}
          {editMode && isResizable && !widget.isLocked && widget.resizable !== false && !widget.isCollapsed && (
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize hover:bg-blue-500/20"
              onMouseDown={(e) => handleResizeStart(e, widget.id)}
            >
              <svg
                className="w-full h-full text-gray-400"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M13 13L3 13L13 3Z" />
              </svg>
            </div>
          )}
        </Card>
      </div>
    );
  };

  return (
    <div className={cn("relative", className)}>
      {/* Toolbar */}
      {allowEdit && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={editMode ? "default" : "outline"}
              size="sm"
              onClick={() => setEditMode(!editMode)}
            >
              <Grid3x3 className="h-4 w-4 mr-2" />
              {editMode ? 'Done Editing' : 'Edit Layout'}
            </Button>
            
            {showLayoutSelector && savedLayouts.length > 0 && (
              <select
                className="px-3 py-1 border rounded-md text-sm"
                value={selectedLayout || ''}
                onChange={(e) => e.target.value && loadLayout(e.target.value)}
              >
                <option value="">Select Layout</option>
                {savedLayouts.map(layout => (
                  <option key={layout.id} value={layout.id}>
                    {layout.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {editMode && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveDialog(true)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Layout
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetLayout}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Grid Container */}
      <div
        ref={containerRef}
        className={cn(
          "relative w-full",
          editMode && "ring-2 ring-blue-500/20 rounded-lg"
        )}
        style={{
          minHeight: gridHeight || 400,
          padding: `${containerPadding[1]}px ${containerPadding[0]}px`
        }}
      >
        {widgets.map(renderWidget)}
        
        {/* Empty State */}
        {widgets.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Layout className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500 mb-3">No widgets added yet</p>
              {editMode && onWidgetAdd && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // Add sample widget
                    const newWidget: DashboardWidget = {
                      id: `widget-${Date.now()}`,
                      type: 'default',
                      title: 'New Widget',
                      content: <div>Widget content here</div>,
                      position: { x: 0, y: 0, w: 3, h: 2 }
                    };
                    onWidgetAdd(newWidget);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Widget
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Save Layout</h3>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md mb-4"
              placeholder="Layout name"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={saveLayout}
                disabled={!layoutName}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

DashboardGrid.displayName = 'DashboardGrid';

export default DashboardGrid;