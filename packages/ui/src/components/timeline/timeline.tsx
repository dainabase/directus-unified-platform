import * as React from 'react';
import { Check, Circle, Clock, AlertCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  status?: 'completed' | 'active' | 'pending' | 'error' | 'cancelled';
  icon?: React.ReactNode;
  content?: React.ReactNode;
}

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Timeline items */
  items: TimelineItem[];
  /** Orientation of the timeline */
  orientation?: 'vertical' | 'horizontal';
  /** Position of content relative to line */
  position?: 'left' | 'right' | 'alternate';
  /** Show connectors between items */
  showConnectors?: boolean;
  /** Variant style */
  variant?: 'default' | 'compact' | 'detailed';
  /** Color scheme */
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  /** Animate items on scroll */
  animated?: boolean;
}

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  (
    {
      className,
      items,
      orientation = 'vertical',
      position = 'right',
      showConnectors = true,
      variant = 'default',
      color = 'primary',
      animated = false,
      ...props
    },
    ref
  ) => {
    const getStatusIcon = (status?: TimelineItem['status']) => {
      switch (status) {
        case 'completed':
          return <Check className="h-3 w-3" />;
        case 'active':
          return <Circle className="h-2 w-2 animate-pulse" />;
        case 'pending':
          return <Clock className="h-3 w-3" />;
        case 'error':
          return <AlertCircle className="h-3 w-3" />;
        case 'cancelled':
          return <X className="h-3 w-3" />;
        default:
          return <Circle className="h-2 w-2" />;
      }
    };

    const getStatusColor = (status?: TimelineItem['status']) => {
      switch (status) {
        case 'completed':
          return 'bg-green-500 text-white';
        case 'active':
          return 'bg-blue-500 text-white animate-pulse';
        case 'pending':
          return 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
        case 'error':
          return 'bg-red-500 text-white';
        case 'cancelled':
          return 'bg-gray-500 text-white';
        default:
          return 'bg-gray-300 dark:bg-gray-700';
      }
    };

    const colorStyles = {
      default: 'border-gray-300 dark:border-gray-700',
      primary: 'border-primary',
      secondary: 'border-secondary',
      success: 'border-green-500',
      warning: 'border-yellow-500',
      danger: 'border-red-500',
    };

    if (orientation === 'horizontal') {
      return (
        <div
          ref={ref}
          className={cn(
            'flex items-center overflow-x-auto',
            className
          )}
          {...props}
        >
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center">
              <div className="flex flex-col items-center min-w-[150px]">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    getStatusColor(item.status),
                    item.icon && 'h-12 w-12'
                  )}
                >
                  {item.icon || getStatusIcon(item.status)}
                </div>
                <div className="mt-2 text-center">
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  {item.date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.date}
                    </p>
                  )}
                  {variant === 'detailed' && item.description && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
              {showConnectors && index < items.length - 1 && (
                <div
                  className={cn(
                    'h-px w-full min-w-[50px]',
                    colorStyles[color]
                  )}
                />
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn('relative', className)}
        {...props}
      >
        {showConnectors && (
          <div
            className={cn(
              'absolute h-full w-0.5',
              position === 'left' && 'left-5',
              position === 'right' && 'left-5',
              position === 'alternate' && 'left-1/2 -translate-x-1/2',
              colorStyles[color]
            )}
          />
        )}
        <div className="relative space-y-8">
          {items.map((item, index) => {
            const isAlternate = position === 'alternate';
            const isLeft = isAlternate ? index % 2 === 0 : position === 'left';

            return (
              <div
                key={item.id}
                className={cn(
                  'relative flex items-center',
                  isAlternate && 'justify-center',
                  animated && 'transition-all duration-500 ease-out',
                  animated && 'opacity-0 translate-y-4 animate-in fade-in-0 slide-in-from-bottom-4'
                )}
                style={animated ? { animationDelay: `${index * 100}ms` } : {}}
              >
                {isAlternate && (
                  <div className={cn(
                    'flex w-1/2 pr-8',
                    !isLeft && 'justify-start pl-8 pr-0 order-2'
                  )}>
                    {isLeft && (
                      <div className="text-right">
                        <h3 className="font-semibold">{item.title}</h3>
                        {item.date && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.date}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {item.description}
                          </p>
                        )}
                        {item.content}
                      </div>
                    )}
                    {!isLeft && (
                      <div className="text-left">
                        <h3 className="font-semibold">{item.title}</h3>
                        {item.date && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.date}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {item.description}
                          </p>
                        )}
                        {item.content}
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full z-10',
                    getStatusColor(item.status),
                    item.icon && 'h-12 w-12',
                    !isAlternate && 'absolute left-0'
                  )}
                >
                  {item.icon || getStatusIcon(item.status)}
                </div>
                {!isAlternate && (
                  <div className={cn(
                    'flex-1',
                    position === 'right' && 'ml-14',
                    position === 'left' && 'mr-14 text-right'
                  )}>
                    <h3 className="font-semibold">{item.title}</h3>
                    {item.date && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.date}
                      </p>
                    )}
                    {variant !== 'compact' && item.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {item.description}
                      </p>
                    )}
                    {variant === 'detailed' && item.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

Timeline.displayName = 'Timeline';

export { Timeline };