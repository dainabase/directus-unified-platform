import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '../lib/utils';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  scrollToIndex?: number;
  estimatedItemSize?: number;
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  overscan = 3,
  className,
  onScroll,
  scrollToIndex,
  estimatedItemSize = 50,
  getItemKey = (_, index) => index,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Calculate item heights
  const getItemOffset = useCallback(
    (index: number): number => {
      if (typeof itemHeight === 'number') {
        return index * itemHeight;
      }
      let offset = 0;
      for (let i = 0; i < index; i++) {
        offset += itemHeight(i);
      }
      return offset;
    },
    [itemHeight]
  );

  const getItemHeight = useCallback(
    (index: number): number => {
      return typeof itemHeight === 'number' ? itemHeight : itemHeight(index);
    },
    [itemHeight]
  );

  // Calculate total height
  const totalHeight = useMemo(() => {
    if (typeof itemHeight === 'number') {
      return items.length * itemHeight;
    }
    return items.reduce((acc, _, index) => acc + getItemHeight(index), 0);
  }, [items.length, itemHeight, getItemHeight]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.max(
      0,
      Math.floor(scrollTop / (typeof itemHeight === 'number' ? itemHeight : estimatedItemSize)) - overscan
    );
    const end = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + height) / (typeof itemHeight === 'number' ? itemHeight : estimatedItemSize)) + overscan
    );
    return { start, end };
  }, [scrollTop, height, itemHeight, overscan, items.length, estimatedItemSize]);

  // Handle scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = e.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);

      // Set scrolling state
      setIsScrolling(true);
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    },
    [onScroll]
  );

  // Scroll to index
  useEffect(() => {
    if (scrollToIndex !== undefined && scrollElementRef.current) {
      const offset = getItemOffset(scrollToIndex);
      scrollElementRef.current.scrollTop = offset;
    }
  }, [scrollToIndex, getItemOffset]);

  // Render visible items
  const visibleItems = useMemo(() => {
    const items: React.ReactNode[] = [];
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      const item = renderItem(items[i], i);
      const key = getItemKey(items[i], i);
      const offset = getItemOffset(i);
      const itemHeight = getItemHeight(i);
      
      items.push(
        <div
          key={key}
          style={{
            position: 'absolute',
            top: offset,
            height: itemHeight,
            width: '100%',
          }}
          data-index={i}
        >
          {item}
        </div>
      );
    }
    return items;
  }, [visibleRange, renderItem, items, getItemKey, getItemOffset, getItemHeight]);

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      style={{ height }}
    >
      <div
        ref={scrollElementRef}
        className="overflow-auto h-full"
        onScroll={handleScroll}
        style={{
          willChange: isScrolling ? 'scroll-position' : 'auto',
        }}
      >
        <div
          style={{
            height: totalHeight,
            position: 'relative',
          }}
        >
          {visibleItems}
        </div>
      </div>
    </div>
  );
}

VirtualList.displayName = 'VirtualList';

export default VirtualList;