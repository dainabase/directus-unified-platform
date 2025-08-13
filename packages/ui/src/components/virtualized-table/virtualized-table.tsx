import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

export interface VirtualizedTableColumn<T = any> {
  key: string;
  header: React.ReactNode;
  width?: number | string;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  resizable?: boolean;
}

export interface VirtualizedTableProps<T = any> {
  data: T[];
  columns: VirtualizedTableColumn<T>[];
  rowHeight?: number;
  headerHeight?: number;
  visibleRows?: number;
  onRowClick?: (item: T, index: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  loading?: boolean;
  emptyMessage?: React.ReactNode;
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  stickyHeader?: boolean;
  selectable?: boolean;
  selectedRows?: Set<number>;
  onSelectionChange?: (selected: Set<number>) => void;
}

interface ScrollState {
  scrollTop: number;
  startIndex: number;
  endIndex: number;
}

/**
 * High-performance virtualized table component for large datasets
 * Renders only visible rows to maintain performance with thousands of items
 */
export function VirtualizedTable<T = any>({
  data,
  columns,
  rowHeight = 48,
  headerHeight = 56,
  visibleRows = 10,
  onRowClick,
  onSort,
  loading = false,
  emptyMessage = 'No data available',
  className,
  striped = false,
  hoverable = true,
  bordered = true,
  stickyHeader = true,
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
}: VirtualizedTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollTop: 0,
    startIndex: 0,
    endIndex: visibleRows,
  });
  const [sortConfig, setSortConfig] = useState<{
    column: string | null;
    direction: 'asc' | 'desc';
  }>({ column: null, direction: 'asc' });

  const totalHeight = data.length * rowHeight;
  const viewportHeight = visibleRows * rowHeight;
  const bufferSize = 5; // Render extra rows for smoother scrolling

  // Calculate visible range with buffer
  const calculateVisibleRange = useCallback(
    (scrollTop: number) => {
      const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - bufferSize);
      const endIndex = Math.min(
        data.length,
        Math.ceil((scrollTop + viewportHeight) / rowHeight) + bufferSize
      );
      return { startIndex, endIndex };
    },
    [data.length, rowHeight, viewportHeight, bufferSize]
  );

  // Handle scroll events
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop;
      const { startIndex, endIndex } = calculateVisibleRange(scrollTop);
      
      setScrollState({
        scrollTop,
        startIndex,
        endIndex,
      });
    },
    [calculateVisibleRange]
  );

  // Handle sort
  const handleSort = useCallback(
    (column: string) => {
      if (!onSort) return;
      
      const direction =
        sortConfig.column === column && sortConfig.direction === 'asc'
          ? 'desc'
          : 'asc';
      
      setSortConfig({ column, direction });
      onSort(column, direction);
    },
    [sortConfig, onSort]
  );

  // Handle row selection
  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;
    
    if (selectedRows.size === data.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(Array.from({ length: data.length }, (_, i) => i)));
    }
  }, [data.length, selectedRows.size, onSelectionChange]);

  const handleSelectRow = useCallback(
    (index: number) => {
      if (!onSelectionChange) return;
      
      const newSelection = new Set(selectedRows);
      if (newSelection.has(index)) {
        newSelection.delete(index);
      } else {
        newSelection.add(index);
      }
      onSelectionChange(newSelection);
    },
    [selectedRows, onSelectionChange]
  );

  // Reset scroll on data change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      setScrollState({
        scrollTop: 0,
        startIndex: 0,
        endIndex: visibleRows,
      });
    }
  }, [data, visibleRows]);

  // Render visible rows
  const visibleData = data.slice(scrollState.startIndex, scrollState.endIndex);
  const offsetY = scrollState.startIndex * rowHeight;

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-64 text-muted-foreground', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-lg',
        bordered && 'border',
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex bg-muted/50 border-b font-medium',
          stickyHeader && 'sticky top-0 z-10'
        )}
        style={{ height: headerHeight }}
      >
        {selectable && (
          <div className="flex items-center justify-center w-12 px-2">
            <input
              type="checkbox"
              className="rounded border-gray-300"
              checked={selectedRows.size === data.length && data.length > 0}
              onChange={handleSelectAll}
              aria-label="Select all rows"
            />
          </div>
        )}
        {columns.map((column) => (
          <div
            key={column.key}
            className={cn(
              'flex items-center px-4',
              column.sortable && 'cursor-pointer hover:bg-muted/80'
            )}
            style={{ width: column.width || `${100 / columns.length}%` }}
            onClick={() => column.sortable && handleSort(column.key)}
          >
            <span className="truncate">{column.header}</span>
            {column.sortable && sortConfig.column === column.key && (
              <span className="ml-2">
                {sortConfig.direction === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className="overflow-auto"
        style={{ height: viewportHeight }}
        onScroll={handleScroll}
      >
        {/* Virtual spacer */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {/* Visible rows */}
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            {visibleData.map((item, index) => {
              const actualIndex = scrollState.startIndex + index;
              const isSelected = selectedRows.has(actualIndex);
              
              return (
                <div
                  key={actualIndex}
                  className={cn(
                    'flex border-b transition-colors',
                    striped && actualIndex % 2 === 1 && 'bg-muted/20',
                    hoverable && 'hover:bg-muted/40',
                    isSelected && 'bg-primary/10',
                    onRowClick && 'cursor-pointer'
                  )}
                  style={{ height: rowHeight }}
                  onClick={() => onRowClick?.(item, actualIndex)}
                >
                  {selectable && (
                    <div className="flex items-center justify-center w-12 px-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectRow(actualIndex);
                        }}
                        aria-label={`Select row ${actualIndex + 1}`}
                      />
                    </div>
                  )}
                  {columns.map((column) => (
                    <div
                      key={column.key}
                      className="flex items-center px-4 truncate"
                      style={{ width: column.width || `${100 / columns.length}%` }}
                    >
                      {column.render
                        ? column.render((item as any)[column.key], item, actualIndex)
                        : (item as any)[column.key]}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

VirtualizedTable.displayName = 'VirtualizedTable';

export default VirtualizedTable;
