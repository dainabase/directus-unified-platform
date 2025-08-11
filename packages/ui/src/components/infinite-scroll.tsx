import React, { useRef, useCallback, useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollProps {
  children: React.ReactNode;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  loading?: boolean;
  threshold?: number;
  loader?: React.ReactNode;
  endMessage?: React.ReactNode;
  scrollableTarget?: string | HTMLElement;
  inverse?: boolean;
  initialScrollY?: number;
  className?: string;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  useWindow?: boolean;
  pullDownToRefresh?: boolean;
  pullDownToRefreshThreshold?: number;
  pullDownToRefreshContent?: React.ReactNode;
  releaseToRefreshContent?: React.ReactNode;
  refreshFunction?: () => Promise<void>;
  dataLength?: number;
  scrollThreshold?: number | string;
  style?: React.CSSProperties;
  height?: number | string;
  hasChildren?: boolean;
  next?: () => void;
}

export function InfiniteScroll({
  children,
  loadMore,
  hasMore,
  loading = false,
  threshold = 0.8,
  loader,
  endMessage,
  scrollableTarget,
  inverse = false,
  initialScrollY = 0,
  className,
  onScroll,
  useWindow = false,
  pullDownToRefresh = false,
  pullDownToRefreshThreshold = 100,
  pullDownToRefreshContent,
  releaseToRefreshContent,
  refreshFunction,
  dataLength,
  scrollThreshold,
  style,
  height,
  hasChildren = true,
  next,
}: InfiniteScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pullToRefreshState, setPullToRefreshState] = useState<'idle' | 'pulling' | 'releasing' | 'refreshing'>('idle');
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const lastScrollTop = useRef(0);

  // Get scroll element
  const getScrollElement = useCallback(() => {
    if (useWindow) return window;
    if (scrollableTarget) {
      if (typeof scrollableTarget === 'string') {
        return document.getElementById(scrollableTarget);
      }
      return scrollableTarget;
    }
    return scrollRef.current;
  }, [useWindow, scrollableTarget]);

  // Check if should load more
  const shouldLoadMore = useCallback(() => {
    const element = getScrollElement();
    if (!element || !hasMore || isLoading || loading) return false;

    if (element === window) {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      return scrollPercentage >= threshold;
    } else if (element instanceof HTMLElement) {
      const { scrollTop, scrollHeight, clientHeight } = element;
      
      if (inverse) {
        return scrollTop <= (1 - threshold) * clientHeight;
      } else {
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
        return scrollPercentage >= threshold;
      }
    }
    return false;
  }, [getScrollElement, hasMore, isLoading, loading, threshold, inverse]);

  // Handle scroll event
  const handleScroll = useCallback(
    async (event?: React.UIEvent<HTMLDivElement> | Event) => {
      if (onScroll && event && 'currentTarget' in event) {
        onScroll(event as React.UIEvent<HTMLDivElement>);
      }

      if (shouldLoadMore()) {
        setIsLoading(true);
        try {
          if (next) {
            next();
          } else {
            await loadMore();
          }
        } catch (error) {
          console.error('Error loading more items:', error);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [shouldLoadMore, loadMore, next, onScroll]
  );

  // Handle pull to refresh
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!pullDownToRefresh) return;
    startY.current = e.touches[0].pageY;
  }, [pullDownToRefresh]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pullDownToRefresh || pullToRefreshState === 'refreshing') return;
    
    const element = getScrollElement();
    if (element instanceof HTMLElement && element.scrollTop > 0) return;
    
    const currentY = e.touches[0].pageY;
    const distance = currentY - startY.current;
    
    if (distance > 0) {
      setPullDistance(distance);
      if (distance > pullDownToRefreshThreshold) {
        setPullToRefreshState('releasing');
      } else {
        setPullToRefreshState('pulling');
      }
    }
  }, [pullDownToRefresh, pullToRefreshState, pullDownToRefreshThreshold, getScrollElement]);

  const handleTouchEnd = useCallback(async () => {
    if (!pullDownToRefresh || pullToRefreshState !== 'releasing') {
      setPullDistance(0);
      setPullToRefreshState('idle');
      return;
    }
    
    setPullToRefreshState('refreshing');
    setPullDistance(0);
    
    try {
      if (refreshFunction) {
        await refreshFunction();
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setPullToRefreshState('idle');
    }
  }, [pullDownToRefresh, pullToRefreshState, refreshFunction]);

  // Setup scroll listener
  useEffect(() => {
    const element = getScrollElement();
    if (!element) return;

    const scrollHandler = (e: Event) => handleScroll(e);

    if (element === window) {
      window.addEventListener('scroll', scrollHandler, { passive: true });
      return () => window.removeEventListener('scroll', scrollHandler);
    } else if (element instanceof HTMLElement) {
      element.addEventListener('scroll', scrollHandler, { passive: true });
      return () => element.removeEventListener('scroll', scrollHandler);
    }
  }, [handleScroll, getScrollElement]);

  // Initial scroll position for inverse mode
  useEffect(() => {
    if (inverse && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [inverse]);

  // Default loader component
  const defaultLoader = (
    <div className="flex justify-center items-center py-4">
      <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      <span className="ml-2 text-gray-500">Loading more...</span>
    </div>
  );

  // Default end message
  const defaultEndMessage = (
    <div className="text-center py-4 text-gray-500">
      No more items to load
    </div>
  );

  // Pull to refresh content
  const pullContent = () => {
    if (!pullDownToRefresh) return null;
    
    if (pullToRefreshState === 'refreshing') {
      return (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2 text-blue-500">Refreshing...</span>
        </div>
      );
    }
    
    if (pullToRefreshState === 'releasing') {
      return releaseToRefreshContent || (
        <div className="text-center py-4 text-blue-500">
          Release to refresh
        </div>
      );
    }
    
    if (pullToRefreshState === 'pulling') {
      return pullDownToRefreshContent || (
        <div className="text-center py-4 text-gray-500">
          Pull down to refresh
        </div>
      );
    }
    
    return null;
  };

  const containerStyle = {
    ...style,
    height: height || '100%',
    overflow: useWindow ? undefined : 'auto',
    transform: pullDistance > 0 ? `translateY(${Math.min(pullDistance, 150)}px)` : undefined,
    transition: pullToRefreshState === 'idle' ? 'transform 0.3s' : undefined,
  };

  if (useWindow) {
    return (
      <div className={cn('infinite-scroll-component', className)} style={style}>
        {pullContent()}
        {inverse && (isLoading || loading) && (loader || defaultLoader)}
        {children}
        {!inverse && (isLoading || loading) && (loader || defaultLoader)}
        {!hasMore && endMessage !== undefined && (endMessage || defaultEndMessage)}
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className={cn('infinite-scroll-component overflow-auto', className)}
      style={containerStyle}
      onScroll={handleScroll}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {pullContent()}
      {inverse && (isLoading || loading) && (loader || defaultLoader)}
      {children}
      {!inverse && (isLoading || loading) && (loader || defaultLoader)}
      {!hasMore && endMessage !== undefined && (endMessage || defaultEndMessage)}
    </div>
  );
}

InfiniteScroll.displayName = 'InfiniteScroll';

export default InfiniteScroll;