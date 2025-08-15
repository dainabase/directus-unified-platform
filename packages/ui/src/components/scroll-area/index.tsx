import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal' | 'both';
  scrollHideDelay?: number;
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, orientation = 'vertical', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('relative overflow-hidden', className)}
        {...props}
      >
        <ScrollAreaViewport className="h-full w-full rounded-[inherit]">
          {children}
        </ScrollAreaViewport>
        <ScrollBar orientation={orientation} />
        {orientation === 'both' && <ScrollBar orientation="horizontal" />}
        <ScrollAreaCorner />
      </div>
    );
  }
);

ScrollArea.displayName = 'ScrollArea';

const ScrollAreaViewport = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('h-full w-full overflow-auto', className)}
    {...props}
  >
    {children}
  </div>
));

ScrollAreaViewport.displayName = 'ScrollAreaViewport';

export const ScrollBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: 'vertical' | 'horizontal';
  }
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex touch-none select-none transition-colors',
      orientation === 'vertical' &&
        'h-full w-2.5 border-l border-l-transparent p-[1px]',
      orientation === 'horizontal' &&
        'h-2.5 flex-col border-t border-t-transparent p-[1px]',
      className
    )}
    {...props}
  >
    <ScrollAreaThumb orientation={orientation} />
  </div>
));

ScrollBar.displayName = 'ScrollBar';

const ScrollAreaThumb = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: 'vertical' | 'horizontal';
  }
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative rounded-full bg-border',
      orientation === 'vertical' && 'flex-1',
      className
    )}
    {...props}
  />
));

ScrollAreaThumb.displayName = 'ScrollAreaThumb';

const ScrollAreaCorner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('bg-transparent', className)}
    {...props}
  />
));

ScrollAreaCorner.displayName = 'ScrollAreaCorner';

export default ScrollArea;
