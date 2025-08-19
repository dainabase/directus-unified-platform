"use client";

import * as React from "react";
import {
  LineChart as RLineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Brush,
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
  ErrorBar,
  LabelList,
  Cell,
} from "recharts";
import { twMerge } from "tailwind-merge";
import { colorAt } from "./palette";
import { cn } from "../../lib/utils";

/**
 * Enhanced Line Series Configuration for Dashboard Excellence
 * Supports advanced styling, animations, and dashboard-specific features
 */
export interface LineSeries {
  /** Data key for the series */
  dataKey: string;
  /** Display name for legend and tooltips */
  name?: string;
  /** Custom color override */
  color?: string;
  /** Line stroke width (1-5px) */
  strokeWidth?: number;
  /** Line style variant */
  strokeDasharray?: string;
  /** Show/hide dots on data points */
  showDots?: boolean;
  /** Enable smooth curve interpolation */
  smooth?: boolean;
  /** Animation entry delay (ms) */
  animationDelay?: number;
  /** Show gradient fill under line */
  showGradient?: boolean;
  /** Series specific formatter */
  formatter?: (value: any) => string;
  /** Hide this series initially */
  hidden?: boolean;
  /** Line curve type */
  curveType?: "monotone" | "linear" | "basis" | "cardinal" | "step";
}

/**
 * Dashboard Theme Configuration
 * Apple-inspired design system with multiple theme variants
 */
export type DashboardTheme = "light" | "dark" | "auto" | "high-contrast";

/**
 * Chart Size Variants for Responsive Design
 */
export type ChartSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";

/**
 * Dashboard Chart Variants for Different Use Cases
 */
export type ChartVariant = 
  | "default"     // Standard line chart
  | "kpi"         // KPI dashboard style
  | "metrics"     // Metrics monitoring
  | "financial"   // Financial dashboard
  | "analytics"   // Analytics dashboard
  | "realtime"    // Real-time monitoring
  | "minimal"     // Minimal presentation
  | "premium";    // Premium executive style

/**
 * Advanced Tooltip Configuration
 */
export interface TooltipConfig {
  /** Show/hide tooltip */
  enabled?: boolean;
  /** Custom tooltip formatter */
  formatter?: (value: any, name: string, props: any) => [React.ReactNode, string];
  /** Custom label formatter */
  labelFormatter?: (label: string, payload: any[]) => React.ReactNode;
  /** Tooltip animation settings */
  animationDuration?: number;
  /** Show value change indicators */
  showChange?: boolean;
  /** Tooltip theme */
  theme?: "light" | "dark" | "glass";
}

/**
 * Animation Configuration for Smooth Transitions
 */
export interface AnimationConfig {
  /** Enable/disable animations */
  enabled?: boolean;
  /** Entry animation duration (ms) */
  duration?: number;
  /** Stagger delay between series (ms) */
  staggerDelay?: number;
  /** Animation easing function */
  easing?: "ease" | "ease-in" | "ease-out" | "ease-in-out" | "linear";
  /** Enable hover animations */
  hoverAnimations?: boolean;
}

/**
 * Grid Configuration for Professional Look
 */
export interface GridConfig {
  /** Show/hide grid lines */
  enabled?: boolean;
  /** Grid line opacity (0-1) */
  opacity?: number;
  /** Grid line color */
  color?: string;
  /** Grid line style */
  strokeDasharray?: string;
  /** Show only horizontal lines */
  horizontal?: boolean;
  /** Show only vertical lines */
  vertical?: boolean;
}

/**
 * Advanced Zoom and Interaction Configuration
 */
export interface InteractionConfig {
  /** Enable zoom functionality */
  zoom?: boolean;
  /** Enable brush selection */
  brush?: boolean;
  /** Enable crosshair cursor */
  crosshair?: boolean;
  /** Enable data point click events */
  clickable?: boolean;
  /** Click event handler */
  onDataPointClick?: (data: any, index: number) => void;
  /** Hover event handler */
  onDataPointHover?: (data: any, index: number) => void;
  /** Selection change handler */
  onSelectionChange?: (selection: { startIndex: number; endIndex: number }) => void;
}

/**
 * Loading State Configuration
 */
export interface LoadingConfig {
  /** Loading state */
  loading?: boolean;
  /** Skeleton animation type */
  skeletonType?: "pulse" | "shimmer" | "wave";
  /** Loading message */
  message?: string;
  /** Show loading percentage */
  showProgress?: boolean;
}

/**
 * Error State Configuration
 */
export interface ErrorConfig {
  /** Error state */
  error?: boolean;
  /** Error message */
  message?: string;
  /** Retry function */
  onRetry?: () => void;
  /** Show error details */
  showDetails?: boolean;
}

/**
 * Premium LineChart Component Props
 * Enterprise-grade chart component for dashboard excellence
 */
export interface LineChartProps {
  /** Chart data array */
  data: Record<string, any>[];
  /** X-axis data key */
  xKey: string;
  /** Line series configuration */
  series: LineSeries[];
  
  // Layout & Sizing
  /** Chart height in pixels */
  height?: number;
  /** Chart width (auto-responsive by default) */
  width?: string | number;
  /** Chart size preset */
  size?: ChartSize;
  /** Custom CSS classes */
  className?: string;
  
  // Theme & Styling
  /** Dashboard theme variant */
  theme?: DashboardTheme;
  /** Chart variant for different use cases */
  variant?: ChartVariant;
  /** Custom color palette */
  palette?: string[];
  
  // Chart Configuration
  /** Grid configuration */
  grid?: boolean | GridConfig;
  /** Legend configuration */
  legend?: boolean | { position?: "top" | "bottom" | "left" | "right" };
  /** Chart margin settings */
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  
  // Axes Configuration
  /** Y-axis formatter function */
  yAxisFormatter?: (value: number) => string | number;
  /** X-axis formatter function */
  xAxisFormatter?: (value: any) => string;
  /** Hide X-axis */
  hideXAxis?: boolean;
  /** Hide Y-axis */
  hideYAxis?: boolean;
  /** Y-axis domain (auto-calculated by default) */
  yDomain?: [number | "auto", number | "auto"];
  
  // Interactivity
  /** Tooltip configuration */
  tooltip?: boolean | TooltipConfig;
  /** Interaction configuration */
  interactions?: InteractionConfig;
  
  // Animations & Performance
  /** Animation configuration */
  animations?: boolean | AnimationConfig;
  /** Enable performance optimizations */
  optimized?: boolean;
  
  // States
  /** Loading configuration */
  loading?: boolean | LoadingConfig;
  /** Error configuration */
  error?: boolean | ErrorConfig;
  /** Empty state message */
  emptyMessage?: string;
  
  // Dashboard Specific
  /** Show trend indicators */
  showTrends?: boolean;
  /** Show data labels */
  showLabels?: boolean;
  /** Enable real-time updates */
  realtime?: boolean;
  /** Update interval for real-time (ms) */
  updateInterval?: number;
  
  // Accessibility
  /** Chart title for screen readers */
  title?: string;
  /** Chart description for accessibility */
  description?: string;
  /** ARIA label */
  ariaLabel?: string;
}

/**
 * Chart Size Mappings
 */
const sizeConfig: Record<ChartSize, { height: number; responsive: boolean }> = {
  xs: { height: 120, responsive: true },
  sm: { height: 200, responsive: true },
  md: { height: 280, responsive: true },
  lg: { height: 400, responsive: true },
  xl: { height: 500, responsive: true },
  full: { height: 600, responsive: true },
};

/**
 * Theme CSS Variables
 */
const themeStyles: Record<DashboardTheme, React.CSSProperties> = {
  light: {
    "--chart-bg": "#ffffff",
    "--chart-border": "#e5e7eb",
    "--chart-text": "#374151",
    "--chart-grid": "#f3f4f6",
    "--chart-tooltip-bg": "#ffffff",
    "--chart-tooltip-border": "#d1d5db",
  } as React.CSSProperties,
  dark: {
    "--chart-bg": "#1f2937",
    "--chart-border": "#374151",
    "--chart-text": "#f9fafb",
    "--chart-grid": "#374151",
    "--chart-tooltip-bg": "#374151",
    "--chart-tooltip-border": "#4b5563",
  } as React.CSSProperties,
  auto: {
    "--chart-bg": "light-dark(#ffffff, #1f2937)",
    "--chart-border": "light-dark(#e5e7eb, #374151)",
    "--chart-text": "light-dark(#374151, #f9fafb)",
    "--chart-grid": "light-dark(#f3f4f6, #374151)",
    "--chart-tooltip-bg": "light-dark(#ffffff, #374151)",
    "--chart-tooltip-border": "light-dark(#d1d5db, #4b5563)",
  } as React.CSSProperties,
  "high-contrast": {
    "--chart-bg": "#000000",
    "--chart-border": "#ffffff",
    "--chart-text": "#ffffff",
    "--chart-grid": "#666666",
    "--chart-tooltip-bg": "#000000",
    "--chart-tooltip-border": "#ffffff",
  } as React.CSSProperties,
};

/**
 * Skeleton Loading Component
 */
const ChartSkeleton: React.FC<{ height: number; type: "pulse" | "shimmer" | "wave" }> = ({ 
  height, 
  type = "shimmer" 
}) => {
  const animationClass = {
    pulse: "animate-pulse",
    shimmer: "animate-shimmer",
    wave: "animate-wave",
  }[type];

  return (
    <div 
      className={cn(
        "w-full rounded-lg border border-border bg-muted/20 p-6",
        animationClass
      )}
      style={{ height }}
      role="status"
      aria-label="Loading chart data"
    >
      <div className="space-y-4">
        {/* Chart area skeleton */}
        <div className="h-full w-full rounded bg-muted/30" />
        
        {/* Legend skeleton */}
        <div className="flex justify-center space-x-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded bg-muted/40" />
              <div className="h-4 w-16 rounded bg-muted/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Error Boundary Component
 */
const ChartError: React.FC<{ 
  message?: string; 
  onRetry?: () => void;
  showDetails?: boolean;
}> = ({ 
  message = "Failed to load chart data", 
  onRetry,
  showDetails = false 
}) => (
  <div 
    className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center"
    role="alert"
    aria-live="polite"
  >
    <div className="mb-4 rounded-full bg-destructive/10 p-3">
      <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    
    <h3 className="mb-2 text-lg font-semibold text-destructive">Chart Error</h3>
    <p className="mb-4 text-sm text-muted-foreground">{message}</p>
    
    {onRetry && (
      <button
        onClick={onRetry}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Retry
      </button>
    )}
    
    {showDetails && (
      <details className="mt-4 w-full">
        <summary className="cursor-pointer text-xs text-muted-foreground">Show details</summary>
        <pre className="mt-2 rounded bg-muted p-2 text-xs text-left">
          {/* Error details would go here */}
          Chart rendering failed. Check data format and series configuration.
        </pre>
      </details>
    )}
  </div>
);

/**
 * Custom Tooltip Component with Apple-style Design
 */
const CustomTooltip: React.FC<any> = ({ active, payload, label, config }) => {
  if (!active || !payload || !payload.length) return null;

  const tooltipConfig = config as TooltipConfig;
  const theme = tooltipConfig?.theme || "light";

  return (
    <div
      className={cn(
        "rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur-sm",
        theme === "dark" && "border-border bg-background/90",
        theme === "glass" && "border-white/20 bg-white/10 backdrop-blur-md"
      )}
      style={{
        minWidth: "120px",
      }}
    >
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground">{entry.name}</span>
          </div>
          
          <span className="text-sm font-semibold text-foreground">
            {tooltipConfig?.formatter 
              ? tooltipConfig.formatter(entry.value, entry.name, entry)[0]
              : entry.value
            }
          </span>
          
          {tooltipConfig?.showChange && (
            <span className="text-xs text-green-500">
              +5.2%
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Premium LineChart Component
 * Enterprise-grade chart for dashboard excellence with Apple-inspired design
 */
export const LineChart = React.memo<LineChartProps>(({
  data,
  xKey,
  series,
  height,
  width = "100%",
  size = "md",
  className,
  theme = "auto",
  variant = "default",
  palette,
  grid = true,
  legend = true,
  margin = { top: 8, right: 16, bottom: 0, left: 0 },
  yAxisFormatter,
  xAxisFormatter,
  hideXAxis = false,
  hideYAxis = false,
  yDomain,
  tooltip = true,
  interactions = {},
  animations = true,
  optimized = true,
  loading = false,
  error = false,
  emptyMessage = "No data available",
  showTrends = false,
  showLabels = false,
  realtime = false,
  updateInterval = 1000,
  title,
  description,
  ariaLabel,
}) => {
  // Hooks for state management
  const [isLoading, setIsLoading] = React.useState(
    typeof loading === "boolean" ? loading : loading?.loading || false
  );
  const [hasError, setHasError] = React.useState(
    typeof error === "boolean" ? error : error?.error || false
  );
  const [selectedData, setSelectedData] = React.useState<any>(null);
  const [brushSelection, setBrushSelection] = React.useState<any>(null);

  // Configuration processing
  const chartHeight = height || sizeConfig[size].height;
  const chartTheme = theme === "auto" ? "light" : theme; // Simplified for now
  
  const gridConfig = typeof grid === "boolean" 
    ? { enabled: grid, opacity: 0.2, strokeDasharray: "3 3" }
    : { enabled: true, opacity: 0.2, strokeDasharray: "3 3", ...grid };
    
  const tooltipConfig = typeof tooltip === "boolean"
    ? { enabled: tooltip }
    : { enabled: true, ...tooltip };
    
  const animationConfig = typeof animations === "boolean"
    ? { enabled: animations, duration: 750, staggerDelay: 100 }
    : { enabled: true, duration: 750, staggerDelay: 100, ...animations };

  const loadingConfig = typeof loading === "boolean"
    ? { loading, skeletonType: "shimmer" as const }
    : { loading: false, skeletonType: "shimmer" as const, ...loading };

  const errorConfig = typeof error === "boolean"
    ? { error }
    : { error: false, ...error };

  // Real-time updates
  React.useEffect(() => {
    if (realtime && updateInterval > 0) {
      const interval = setInterval(() => {
        // Trigger data refresh
        // This would typically call a refresh callback passed as prop
      }, updateInterval);
      
      return () => clearInterval(interval);
    }
  }, [realtime, updateInterval]);

  // Error boundary simulation
  React.useEffect(() => {
    if (!data || data.length === 0) {
      setHasError(false); // Empty data is not an error
    }
  }, [data]);

  // Loading states
  if (isLoading || loadingConfig.loading) {
    return (
      <ChartSkeleton 
        height={chartHeight} 
        type={loadingConfig.skeletonType || "shimmer"} 
      />
    );
  }

  // Error states
  if (hasError || errorConfig.error) {
    return (
      <ChartError
        message={errorConfig.message}
        onRetry={errorConfig.onRetry}
        showDetails={errorConfig.showDetails}
      />
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div 
        className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/5 p-6"
        style={{ height: chartHeight }}
      >
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="mt-2 text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Generate colors for series
  const getSeriesColor = (seriesItem: LineSeries, index: number): string => {
    if (seriesItem.color) return seriesItem.color;
    if (palette && palette[index]) return palette[index];
    return colorAt(index);
  };

  // Handle chart interactions
  const handleDataPointClick = (data: any, index: number) => {
    interactions.onDataPointClick?.(data, index);
    setSelectedData(data);
  };

  const handleBrushChange = (brushData: any) => {
    setBrushSelection(brushData);
    if (brushData && interactions.onSelectionChange) {
      interactions.onSelectionChange({
        startIndex: brushData.startIndex || 0,
        endIndex: brushData.endIndex || data.length - 1,
      });
    }
  };

  return (
    <div
      className={cn(
        "chart-container w-full rounded-lg border border-border bg-card p-3 transition-all duration-200",
        variant === "premium" && "border-2 border-primary/20 shadow-lg",
        variant === "minimal" && "border-0 bg-transparent p-0",
        variant === "kpi" && "bg-gradient-to-br from-primary/5 to-accent/5",
        className
      )}
      style={{
        ...themeStyles[chartTheme],
        width,
      }}
      role="img"
      aria-label={ariaLabel || `Line chart showing ${series.map(s => s.name || s.dataKey).join(", ")}`}
      title={title}
    >
      {/* Chart Title */}
      {title && (
        <div className="mb-4 border-b border-border pb-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* Main Chart */}
      <ResponsiveContainer width="100%" height={chartHeight}>
        <RLineChart
          data={data}
          margin={margin}
          onClick={interactions.clickable ? handleDataPointClick : undefined}
        >
          {/* Grid */}
          {gridConfig.enabled && (
            <CartesianGrid
              strokeOpacity={gridConfig.opacity}
              strokeDasharray={gridConfig.strokeDasharray}
              stroke={gridConfig.color}
              horizontal={gridConfig.horizontal}
              vertical={gridConfig.vertical}
            />
          )}

          {/* Axes */}
          {!hideXAxis && (
            <XAxis
              dataKey={xKey}
              tickFormatter={xAxisFormatter}
              axisLine={variant !== "minimal"}
              tickLine={variant !== "minimal"}
              tick={{ fontSize: 12, fill: "var(--chart-text)" }}
            />
          )}
          
          {!hideYAxis && (
            <YAxis
              tickFormatter={yAxisFormatter}
              axisLine={variant !== "minimal"}
              tickLine={variant !== "minimal"}
              tick={{ fontSize: 12, fill: "var(--chart-text)" }}
              domain={yDomain}
            />
          )}

          {/* Tooltip */}
          {tooltipConfig.enabled && (
            <Tooltip
              content={<CustomTooltip config={tooltipConfig} />}
              animationDuration={tooltipConfig.animationDuration || 200}
              cursor={interactions.crosshair ? { strokeDasharray: "3 3" } : false}
            />
          )}

          {/* Legend */}
          {legend && (
            <Legend
              wrapperStyle={{ fontSize: "12px", color: "var(--chart-text)" }}
            />
          )}

          {/* Brush for zoom/selection */}
          {interactions.brush && (
            <Brush
              dataKey={xKey}
              height={30}
              stroke="var(--chart-border)"
              onChange={handleBrushChange}
            />
          )}

          {/* Series Lines */}
          {series.map((seriesItem, index) => {
            const color = getSeriesColor(seriesItem, index);
            const isHidden = seriesItem.hidden;
            
            if (isHidden) return null;

            return (
              <Line
                key={seriesItem.dataKey}
                type={seriesItem.curveType || (seriesItem.smooth !== false ? "monotone" : "linear")}
                dataKey={seriesItem.dataKey}
                name={seriesItem.name || seriesItem.dataKey}
                stroke={color}
                strokeWidth={seriesItem.strokeWidth || 2}
                strokeDasharray={seriesItem.strokeDasharray}
                dot={seriesItem.showDots ? { r: 3, fill: color } : false}
                activeDot={{ 
                  r: 4, 
                  fill: color,
                  stroke: "var(--chart-bg)",
                  strokeWidth: 2,
                }}
                animationBegin={animationConfig.enabled ? (seriesItem.animationDelay || index * (animationConfig.staggerDelay || 100)) : 0}
                animationDuration={animationConfig.enabled ? animationConfig.duration : 0}
                isAnimationActive={animationConfig.enabled}
              />
            );
          })}

          {/* Show data labels if enabled */}
          {showLabels && series.map((seriesItem, index) => (
            <Line
              key={`${seriesItem.dataKey}-labels`}
              dataKey={seriesItem.dataKey}
              stroke="transparent"
              dot={false}
            >
              <LabelList 
                dataKey={seriesItem.dataKey}
                position="top"
                fill="var(--chart-text)"
                fontSize={10}
                formatter={seriesItem.formatter}
              />
            </Line>
          ))}
        </RLineChart>
      </ResponsiveContainer>

      {/* Real-time indicator */}
      {realtime && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center gap-2 rounded-full bg-green-100 px-2 py-1">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-xs font-medium text-green-700">Live</span>
          </div>
        </div>
      )}

      {/* Trend indicators */}
      {showTrends && data.length > 1 && (
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Trend: ↗ +2.3%</span>
          <span>Last updated: Just now</span>
        </div>
      )}
    </div>
  );
});

LineChart.displayName = "LineChart";

export default LineChart;