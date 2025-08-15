import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ResizableProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  direction?: 'horizontal' | 'vertical';
  onResize?: (size: number) => void;
}

export const ResizablePanelGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    direction?: 'horizontal' | 'vertical';
  }
>(({ className, direction = 'horizontal', ...props }, ref) => (
  <div
    ref={ref}
    data-panel-group
    className={cn(
      'flex h-full w-full',
      direction === 'horizontal' ? 'flex-row' : 'flex-col',
      className
    )}
    {...props}
  />
));

ResizablePanelGroup.displayName = 'ResizablePanelGroup';

export const ResizablePanel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    defaultSize?: number;
    minSize?: number;
    maxSize?: number;
    collapsible?: boolean;
  }
>(({ className, defaultSize, minSize, maxSize, collapsible, style, ...props }, ref) => {
  const panelStyle = {
    ...style,
    flex: defaultSize ? `${defaultSize} 1 0%` : '1 1 0%',
    minWidth: minSize ? `${minSize}%` : undefined,
    maxWidth: maxSize ? `${maxSize}%` : undefined,
  };

  return (
    <div
      ref={ref}
      data-panel
      className={cn('flex-1 overflow-hidden', className)}
      style={panelStyle}
      {...props}
    />
  );
});

ResizablePanel.displayName = 'ResizablePanel';

export const ResizableHandle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    withHandle?: boolean;
  }
>(({ className, withHandle, ...props }, ref) => {
  const [isDragging, setIsDragging] = React.useState(false);

  return (
    <div
      ref={ref}
      data-panel-resize-handle
      className={cn(
        'relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0',
        isDragging && 'cursor-col-resize',
        className
      )}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
          <svg
            className="h-2.5 w-2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M9 3v18m6-18v18" />
          </svg>
        </div>
      )}
    </div>
  );
});

ResizableHandle.displayName = 'ResizableHandle';

export const Resizable = React.forwardRef<HTMLDivElement, ResizableProps>(
  ({ className, defaultSize = 50, minSize = 10, maxSize = 90, direction = 'horizontal', onResize, children, ...props }, ref) => {
    const [size, setSize] = React.useState(defaultSize);

    const handleResize = (newSize: number) => {
      const clampedSize = Math.max(minSize, Math.min(maxSize, newSize));
      setSize(clampedSize);
      onResize?.(clampedSize);
    };

    return (
      <div
        ref={ref}
        className={cn('flex h-full w-full', direction === 'horizontal' ? 'flex-row' : 'flex-col', className)}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            if (index === 0) {
              return React.cloneElement(child as any, {
                style: {
                  ...(child.props as any).style,
                  flex: `${size} 0 0%`,
                },
              });
            }
            if (index === 2) {
              return React.cloneElement(child as any, {
                style: {
                  ...(child.props as any).style,
                  flex: `${100 - size} 0 0%`,
                },
              });
            }
          }
          return child;
        })}
      </div>
    );
  }
);

Resizable.displayName = 'Resizable';

export default Resizable;
