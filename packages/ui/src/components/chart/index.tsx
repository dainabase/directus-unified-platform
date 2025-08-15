import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: any[];
  type?: 'line' | 'bar' | 'area' | 'pie' | 'radar' | 'scatter';
  width?: number | string;
  height?: number | string;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  children?: React.ReactNode;
  loading?: boolean;
  error?: Error | null;
  onDataPointClick?: (data: any, index: number) => void;
}

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  aspectRatio?: number;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: any, name: string) => React.ReactNode;
}

export interface ChartLegendProps {
  items?: Array<{ name: string; color: string }>;
  onClick?: (item: any) => void;
  orientation?: 'horizontal' | 'vertical';
}

// Chart Container Component
export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, children, aspectRatio = 16 / 9, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('w-full', className)}
        style={{
          ...style,
          aspectRatio: aspectRatio.toString(),
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ChartContainer.displayName = 'ChartContainer';

// Chart Tooltip Component
export const ChartTooltip: React.FC<ChartTooltipProps> = ({ 
  active, 
  payload, 
  label, 
  formatter 
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-md">
      <p className="text-sm font-medium">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatter ? formatter(entry.value, entry.name) : entry.value}
        </p>
      ))}
    </div>
  );
};

// Chart Legend Component
export const ChartLegend: React.FC<ChartLegendProps> = ({ 
  items = [], 
  onClick, 
  orientation = 'horizontal' 
}) => {
  return (
    <div 
      className={cn(
        'flex gap-4',
        orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
      )}
    >
      {items.map((item, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onClick?.(item)}
          className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
        >
          <span 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: item.color }}
          />
          <span>{item.name}</span>
        </button>
      ))}
    </div>
  );
};

// Chart Loading State
const ChartLoading: React.FC = () => (
  <div className="flex items-center justify-center h-full min-h-[200px]">
    <div className="text-muted-foreground">
      <svg
        className="animate-spin h-8 w-8 mx-auto mb-2"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <p className="text-sm">Loading chart...</p>
    </div>
  </div>
);

// Chart Error State
const ChartError: React.FC<{ error: Error }> = ({ error }) => (
  <div className="flex items-center justify-center h-full min-h-[200px]">
    <div className="text-center">
      <p className="text-destructive font-medium mb-1">Failed to load chart</p>
      <p className="text-sm text-muted-foreground">{error.message}</p>
    </div>
  </div>
);

// Main Chart Component
export const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  ({ 
    className, 
    data, 
    type = 'line', 
    width = '100%', 
    height = 300, 
    margin = { top: 20, right: 20, bottom: 20, left: 20 },
    children,
    loading = false,
    error = null,
    onDataPointClick,
    ...props 
  }, ref) => {
    // Handle loading state
    if (loading) {
      return <ChartLoading />;
    }

    // Handle error state
    if (error) {
      return <ChartError error={error} />;
    }

    // Handle empty data
    if (!data || data.length === 0) {
      return (
        <div 
          ref={ref}
          className={cn(
            'flex items-center justify-center h-full min-h-[200px] text-muted-foreground',
            className
          )}
          {...props}
        >
          <p className="text-sm">No data available</p>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn('w-full', className)}
        style={{
          width,
          height: typeof height === 'number' ? `${height}px` : height,
        }}
        {...props}
      >
        {children || (
          <div className="flex items-center justify-center h-full bg-muted/10 rounded-lg border-2 border-dashed">
            <div className="text-center">
              <p className="text-sm font-medium mb-1">Chart Component</p>
              <p className="text-xs text-muted-foreground">
                Type: {type} | Data points: {data.length}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Import Recharts components to render chart
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
);
Chart.displayName = 'Chart';

export default Chart;
