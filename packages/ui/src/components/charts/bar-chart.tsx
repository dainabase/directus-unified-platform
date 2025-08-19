"use client";

import * as React from "react";
import {
  BarChart as RBarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  LabelList,
  ReferenceLine,
  Brush,
  ErrorBar,
} from "recharts";
import { colorAt } from "./palette";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart3, Download, Maximize2, RefreshCw, Eye, EyeOff } from "lucide-react";

// 🎯 TYPES PREMIUM - Dashboard Enterprise
export type BarSeries = { 
  dataKey: string; 
  name?: string; 
  stackId?: string | number;
  color?: string;
  opacity?: number;
  strokeWidth?: number;
  gradient?: boolean;
  animate?: boolean;
  hidden?: boolean;
};

export type BarVariant = 
  | "dashboard" 
  | "executive" 
  | "sales" 
  | "analytics" 
  | "financial" 
  | "minimal" 
  | "gaming" 
  | "comparison"
  | "progress"
  | "realtime";

export type BarTheme = "light" | "dark" | "auto" | "high-contrast" | "minimal" | "vibrant";

export type BarSize = "sm" | "md" | "lg" | "xl" | "auto";

export type AnimationPreset = 
  | "none" 
  | "smooth" 
  | "apple" 
  | "spring" 
  | "bounce" 
  | "stagger" 
  | "wave"
  | "cascade";

export type InteractionMode = "hover" | "click" | "none" | "focus" | "multi";

export interface BarChartData {
  [key: string]: any;
  _trend?: "up" | "down" | "stable";
  _highlight?: boolean;
  _annotation?: string;
  _group?: string;
  _status?: "success" | "warning" | "error" | "info";
}

export interface BarChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  variant?: BarVariant;
  theme?: BarTheme;
  showTrend?: boolean;
  showComparison?: boolean;
  customFormat?: (value: any, name: string, props: any) => React.ReactNode;
}

export interface BarChartLegendProps {
  payload?: any[];
  onToggle?: (dataKey: string) => void;
  hiddenSeries?: Set<string>;
  variant?: BarVariant;
  position?: "top" | "bottom" | "left" | "right";
  align?: "left" | "center" | "right";
}

export interface BarChartProps {
  // 📊 Data Core
  data: BarChartData[];
  xKey: string;
  series: BarSeries[];
  
  // 🎨 Visual & Layout
  height?: number;
  width?: number;
  className?: string;
  variant?: BarVariant;
  theme?: BarTheme;
  size?: BarSize;
  
  // 🎭 Chart Features
  grid?: boolean;
  legend?: boolean;
  brush?: boolean;
  zoom?: boolean;
  stacked?: boolean;
  horizontal?: boolean;
  grouped?: boolean;
  
  // 🎯 Interactivity
  interactive?: boolean;
  onClick?: (data: any) => void;
  onHover?: (data: any) => void;
  onDoubleClick?: (data: any) => void;
  selectable?: boolean;
  multiSelect?: boolean;
  
  // ⚡ Animation & Performance
  animate?: boolean;
  animationPreset?: AnimationPreset;
  animationDuration?: number;
  performance?: boolean;
  lazy?: boolean;
  
  // 🎛️ Customization
  colors?: string[];
  gradient?: boolean;
  shadow?: boolean;
  rounded?: boolean;
  gap?: number;
  barSize?: number;
  maxBarSize?: number;
  
  // 📐 Axis & Scaling
  xAxisFormatter?: (value: any) => string;
  yAxisFormatter?: (value: number) => string | number;
  domain?: [number | string, number | string];
  scale?: "linear" | "log" | "time" | "point" | "band";
  
  // 🔧 Advanced Features
  tooltipFormatter?: (value: any, name: string, props: any) => React.ReactNode;
  customTooltip?: React.ComponentType<BarChartTooltipProps>;
  customLegend?: React.ComponentType<BarChartLegendProps>;
  referenceLine?: { value: number; label?: string; color?: string }[];
  annotations?: { x: any; y: any; content: React.ReactNode }[];
  
  // 🌐 Accessibility & UX
  ariaLabel?: string;
  ariaDescription?: string;
  showValues?: boolean;
  showTrend?: boolean;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  
  // 📱 Responsive
  responsive?: boolean;
  breakpoints?: {
    sm?: Partial<BarChartProps>;
    md?: Partial<BarChartProps>;
    lg?: Partial<BarChartProps>;
    xl?: Partial<BarChartProps>;
  };
  
  // 🔄 Real-time
  realtime?: boolean;
  refreshInterval?: number;
  onRefresh?: () => void;
  
  // 📊 Export & Actions
  exportable?: boolean;
  onExport?: (format: "png" | "svg" | "pdf" | "csv") => void;
  fullscreen?: boolean;
  onFullscreen?: () => void;
}

// 🎨 THEME SYSTEM - Apple-inspired
const themeConfig = {
  light: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(240 10% 3.9%)",
    border: "hsl(240 5.9% 90%)",
    grid: "hsl(240 4.9% 83.9%)",
    tooltip: "hsl(0 0% 100%)",
    tooltipBorder: "hsl(240 5.9% 90%)",
    shadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  },
  dark: {
    background: "hsl(240 10% 3.9%)",
    foreground: "hsl(0 0% 98%)",
    border: "hsl(240 3.7% 15.9%)",
    grid: "hsl(240 3.7% 15.9%)",
    tooltip: "hsl(240 10% 3.9%)",
    tooltipBorder: "hsl(240 3.7% 15.9%)",
    shadow: "0 4px 6px -1px rgb(0 0 0 / 0.3)",
  },
  "high-contrast": {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(0 0% 0%)",
    border: "hsl(0 0% 0%)",
    grid: "hsl(0 0% 0%)",
    tooltip: "hsl(0 0% 100%)",
    tooltipBorder: "hsl(0 0% 0%)",
    shadow: "0 4px 6px -1px rgb(0 0 0 / 0.5)",
  },
};

// 🎭 ANIMATION PRESETS - Apple-style
const animationPresets = {
  none: { duration: 0 },
  smooth: { duration: 800, easing: "ease-out" },
  apple: { duration: 1200, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  spring: { duration: 1000, easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)" },
  bounce: { duration: 1500, easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)" },
  stagger: { duration: 800, stagger: 100 },
  wave: { duration: 1200, wave: true },
  cascade: { duration: 1000, cascade: true },
};

// 🎨 VARIANT STYLES - Dashboard Focused
const variantStyles = {
  dashboard: "rounded-xl border border-border/50 bg-card shadow-lg",
  executive: "rounded-2xl border border-border/30 bg-gradient-to-br from-background to-muted/20 shadow-xl",
  sales: "rounded-lg border border-green-200 bg-green-50/50 shadow-md",
  analytics: "rounded-lg border border-blue-200 bg-blue-50/50 shadow-md",
  financial: "rounded-lg border border-emerald-200 bg-emerald-50/50 shadow-md",
  minimal: "rounded border border-border/20 bg-background",
  gaming: "rounded-xl border border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg",
  comparison: "rounded-lg border border-orange-200 bg-orange-50/50 shadow-md",
  progress: "rounded-lg border border-indigo-200 bg-indigo-50/50 shadow-md",
  realtime: "rounded-lg border border-red-200 bg-red-50/50 shadow-md animate-pulse",
};

// 🎯 CUSTOM TOOLTIP - Premium Dashboard
const CustomTooltip: React.FC<BarChartTooltipProps> = ({ 
  active, 
  payload, 
  label, 
  variant = "dashboard",
  theme = "light",
  showTrend = false,
  showComparison = false,
  customFormat 
}) => {
  if (!active || !payload || !payload.length) return null;
  
  const currentTheme = themeConfig[theme] || themeConfig.light;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-xl"
      style={{ 
        backgroundColor: currentTheme.background,
        borderColor: currentTheme.tooltipBorder,
        boxShadow: currentTheme.shadow,
      }}
    >
      <div className="space-y-2">
        <p className="font-semibold text-sm" style={{ color: currentTheme.foreground }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 min-w-[120px]">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm" style={{ color: currentTheme.foreground }}>
                {entry.name}
              </span>
            </div>
            <div className="text-right">
              {customFormat ? (
                customFormat(entry.value, entry.name || "", entry)
              ) : (
                <span className="font-mono text-sm font-medium" style={{ color: currentTheme.foreground }}>
                  {typeof entry.value === "number" 
                    ? entry.value.toLocaleString() 
                    : entry.value}
                </span>
              )}
              {showTrend && entry.payload?._trend && (
                <div className="flex items-center gap-1 mt-1">
                  {entry.payload._trend === "up" && (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  )}
                  {entry.payload._trend === "down" && (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {showComparison && payload.length > 1 && (
          <div className="pt-2 border-t" style={{ borderColor: currentTheme.border }}>
            <div className="text-xs text-muted-foreground">
              Difference: {Math.abs(payload[0].value - payload[1].value).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// 🎯 CUSTOM LEGEND - Interactive
const CustomLegend: React.FC<BarChartLegendProps> = ({ 
  payload, 
  onToggle, 
  hiddenSeries = new Set(),
  variant = "dashboard",
  position = "bottom",
  align = "center"
}) => {
  if (!payload?.length) return null;

  return (
    <div className={`flex flex-wrap gap-4 ${
      align === "center" ? "justify-center" : 
      align === "right" ? "justify-end" : 
      "justify-start"
    }`}>
      {payload.map((entry, index) => {
        const isHidden = hiddenSeries.has(entry.dataKey);
        return (
          <motion.button
            key={entry.dataKey}
            onClick={() => onToggle?.(entry.dataKey)}
            className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-all duration-200 ${
              isHidden 
                ? "opacity-50 hover:opacity-70" 
                : "opacity-100 hover:bg-muted/50"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div 
              className={`w-3 h-3 rounded-sm transition-all duration-200 ${
                isHidden ? "bg-muted" : ""
              }`}
              style={{ 
                backgroundColor: isHidden ? "transparent" : entry.color,
                border: isHidden ? `2px solid ${entry.color}` : "none"
              }}
            />
            <span className={isHidden ? "line-through" : ""}>
              {entry.value}
            </span>
            {onToggle && (
              <span className="ml-1 opacity-60">
                {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

// 🔄 LOADING SKELETON - Apple-style
const LoadingSkeleton: React.FC<{ height: number; variant: BarVariant }> = ({ height, variant }) => {
  return (
    <div className={`${variantStyles[variant]} p-6`} style={{ height }}>
      <div className="space-y-4 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-muted/60 rounded w-32"></div>
          <div className="h-3 bg-muted/40 rounded w-16"></div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-end gap-2 h-32">
              {Array.from({ length: 6 }).map((_, j) => (
                <motion.div
                  key={j}
                  className="bg-gradient-to-t from-muted/60 to-muted/30 rounded-t flex-1"
                  style={{ 
                    height: `${20 + Math.random() * 80}%`,
                  }}
                  animate={{
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: j * 0.1,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ❌ ERROR STATE - Graceful
const ErrorState: React.FC<{ 
  error: string; 
  onRetry?: () => void; 
  variant: BarVariant;
  height: number;
}> = ({ error, onRetry, variant, height }) => {
  return (
    <div className={`${variantStyles[variant]} flex items-center justify-center p-6`} style={{ height }}>
      <div className="text-center space-y-4">
        <div className="text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Failed to load chart</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
        {onRetry && (
          <motion.button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors mx-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </motion.button>
        )}
      </div>
    </div>
  );
};

// 📊 EMPTY STATE - Elegant
const EmptyState: React.FC<{ variant: BarVariant; height: number }> = ({ variant, height }) => {
  return (
    <div className={`${variantStyles[variant]} flex items-center justify-center p-6`} style={{ height }}>
      <div className="text-center space-y-2">
        <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">No data available</p>
        <p className="text-xs text-muted-foreground">Chart will appear when data is loaded</p>
      </div>
    </div>
  );
};

// 🎯 MAIN COMPONENT - BarChart Premium
export function BarChart({
  // Data
  data,
  xKey,
  series,
  
  // Layout
  height = 400,
  width,
  className,
  variant = "dashboard",
  theme = "auto",
  size = "md",
  
  // Features
  grid = true,
  legend = true,
  brush = false,
  zoom = false,
  stacked = false,
  horizontal = false,
  grouped = true,
  
  // Interactivity
  interactive = true,
  onClick,
  onHover,
  onDoubleClick,
  selectable = false,
  multiSelect = false,
  
  // Animation
  animate = true,
  animationPreset = "apple",
  animationDuration,
  performance = false,
  lazy = false,
  
  // Customization
  colors,
  gradient = false,
  shadow = true,
  rounded = true,
  gap = 4,
  barSize,
  maxBarSize = 50,
  
  // Axis
  xAxisFormatter,
  yAxisFormatter,
  domain,
  scale = "linear",
  
  // Advanced
  tooltipFormatter,
  customTooltip: CustomTooltipComponent = CustomTooltip,
  customLegend: CustomLegendComponent = CustomLegend,
  referenceLine = [],
  annotations = [],
  
  // UX
  ariaLabel,
  ariaDescription,
  showValues = false,
  showTrend = false,
  loading = false,
  error = null,
  empty = false,
  
  // Responsive
  responsive = true,
  breakpoints,
  
  // Real-time
  realtime = false,
  refreshInterval,
  onRefresh,
  
  // Actions
  exportable = false,
  onExport,
  fullscreen = false,
  onFullscreen,
}: BarChartProps) {
  // 🔧 State Management
  const [selectedData, setSelectedData] = React.useState<any[]>([]);
  const [hiddenSeries, setHiddenSeries] = React.useState<Set<string>>(new Set());
  const [isZoomed, setIsZoomed] = React.useState(false);
  const [zoomDomain, setZoomDomain] = React.useState<[number, number] | null>(null);
  const [currentTheme, setCurrentTheme] = React.useState(theme);
  
  // 🎨 Theme Detection
  React.useEffect(() => {
    if (theme === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setCurrentTheme(mediaQuery.matches ? "dark" : "light");
      
      const handleChange = (e: MediaQueryListEvent) => {
        setCurrentTheme(e.matches ? "dark" : "light");
      };
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      setCurrentTheme(theme);
    }
  }, [theme]);
  
  // 🔄 Real-time Updates
  React.useEffect(() => {
    if (realtime && refreshInterval && onRefresh) {
      const interval = setInterval(onRefresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [realtime, refreshInterval, onRefresh]);
  
  // 📱 Responsive Calculation
  const getResponsiveProps = React.useCallback(() => {
    if (!responsive || !breakpoints) return {};
    
    // Simple breakpoint detection
    const width = window.innerWidth;
    if (width >= 1280 && breakpoints.xl) return breakpoints.xl;
    if (width >= 1024 && breakpoints.lg) return breakpoints.lg;
    if (width >= 768 && breakpoints.md) return breakpoints.md;
    if (width >= 640 && breakpoints.sm) return breakpoints.sm;
    return {};
  }, [responsive, breakpoints]);
  
  // 🎭 Animation Configuration
  const animationConfig = React.useMemo(() => {
    if (!animate) return { isAnimationActive: false };
    
    const preset = animationPresets[animationPreset] || animationPresets.apple;
    return {
      isAnimationActive: true,
      animationDuration: animationDuration || preset.duration,
      animationEasing: preset.easing,
    };
  }, [animate, animationPreset, animationDuration]);
  
  // 🎯 Event Handlers
  const handleBarClick = React.useCallback((data: any, index: number) => {
    if (!interactive) return;
    
    if (selectable) {
      if (multiSelect) {
        setSelectedData(prev => {
          const exists = prev.find(item => item === data);
          return exists 
            ? prev.filter(item => item !== data)
            : [...prev, data];
        });
      } else {
        setSelectedData([data]);
      }
    }
    
    onClick?.(data);
  }, [interactive, selectable, multiSelect, onClick]);
  
  const handleLegendToggle = React.useCallback((dataKey: string) => {
    setHiddenSeries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dataKey)) {
        newSet.delete(dataKey);
      } else {
        newSet.add(dataKey);
      }
      return newSet;
    });
  }, []);
  
  // 🎨 Color Management
  const getBarColor = React.useCallback((seriesIndex: number, dataIndex?: number, value?: number) => {
    if (colors && colors[seriesIndex]) {
      return colors[seriesIndex];
    }
    
    // Variant-specific color logic
    if (variant === "sales" && value !== undefined) {
      return value > 0 ? "#22c55e" : "#ef4444";
    }
    
    return colorAt(seriesIndex);
  }, [colors, variant]);
  
  // 🔧 Data Processing
  const processedData = React.useMemo(() => {
    if (!data?.length) return [];
    
    // Apply zoom domain if active
    if (zoomDomain && !horizontal) {
      const [min, max] = zoomDomain;
      return data.slice(min, max + 1);
    }
    
    return data;
  }, [data, zoomDomain, horizontal]);
  
  const visibleSeries = React.useMemo(() => {
    return series.filter(s => !hiddenSeries.has(s.dataKey));
  }, [series, hiddenSeries]);
  
  // 📏 Size Calculations
  const sizeConfig = React.useMemo(() => {
    const sizes = {
      sm: { height: 240, padding: 12, barSize: 20 },
      md: { height: 400, padding: 16, barSize: 30 },
      lg: { height: 500, padding: 20, barSize: 40 },
      xl: { height: 600, padding: 24, barSize: 50 },
      auto: { height, padding: 16, barSize: barSize || 30 },
    };
    return sizes[size] || sizes.md;
  }, [size, height, barSize]);
  
  // 🎨 Theme Styles
  const themeStyles = React.useMemo(() => {
    const currentThemeConfig = themeConfig[currentTheme] || themeConfig.light;
    return {
      backgroundColor: currentThemeConfig.background,
      color: currentThemeConfig.foreground,
      borderColor: currentThemeConfig.border,
    };
  }, [currentTheme]);
  
  // 🚨 Error & Loading States
  if (loading) {
    return <LoadingSkeleton height={sizeConfig.height} variant={variant} />;
  }
  
  if (error) {
    return (
      <ErrorState 
        error={error} 
        onRetry={onRefresh} 
        variant={variant}
        height={sizeConfig.height}
      />
    );
  }
  
  if (empty || !data?.length) {
    return <EmptyState variant={variant} height={sizeConfig.height} />;
  }

  // 📊 RENDER PREMIUM BAR CHART
  return (
    <div 
      className={twMerge(
        "relative w-full",
        variantStyles[variant],
        shadow && "shadow-lg",
        className
      )}
      style={{ 
        ...themeStyles,
        height: width ? "auto" : sizeConfig.height,
        width: width || "100%",
      }}
      role="img"
      aria-label={ariaLabel || `Bar chart with ${series.length} data series`}
      aria-description={ariaDescription}
    >
      {/* 🎛️ Action Toolbar */}
      {(exportable || fullscreen || realtime) && (
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          {realtime && onRefresh && (
            <motion.button
              onClick={onRefresh}
              className="p-2 rounded-md bg-background/80 backdrop-blur-sm border hover:bg-muted/50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </motion.button>
          )}
          {exportable && onExport && (
            <motion.button
              onClick={() => onExport("png")}
              className="p-2 rounded-md bg-background/80 backdrop-blur-sm border hover:bg-muted/50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Export chart"
            >
              <Download className="w-4 h-4" />
            </motion.button>
          )}
          {fullscreen && onFullscreen && (
            <motion.button
              onClick={onFullscreen}
              className="p-2 rounded-md bg-background/80 backdrop-blur-sm border hover:bg-muted/50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Toggle fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      )}

      {/* 📊 Chart Container */}
      <div 
        className="w-full h-full"
        style={{ padding: sizeConfig.padding }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RBarChart
            data={processedData}
            margin={{ 
              top: legend && !brush ? 40 : 20, 
              right: 20, 
              bottom: brush ? 80 : 40, 
              left: 20 
            }}
            layout={horizontal ? "horizontal" : "vertical"}
            {...animationConfig}
          >
            {/* 📐 Grid */}
            {grid && (
              <CartesianGrid 
                strokeDasharray="3 3"
                stroke={themeConfig[currentTheme].grid}
                strokeOpacity={0.3}
                {...(horizontal ? { horizontal: false } : { vertical: false })}
              />
            )}
            
            {/* 📊 Axes */}
            <XAxis 
              dataKey={horizontal ? undefined : xKey}
              type={horizontal ? "number" : "category"}
              tickFormatter={xAxisFormatter}
              stroke={themeConfig[currentTheme].foreground}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              dataKey={horizontal ? xKey : undefined}
              type={horizontal ? "category" : "number"}
              tickFormatter={yAxisFormatter}
              stroke={themeConfig[currentTheme].foreground}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dx={-10}
              domain={domain}
            />
            
            {/* 🎯 Tooltip */}
            <Tooltip 
              content={
                <CustomTooltipComponent 
                  variant={variant}
                  theme={currentTheme}
                  showTrend={showTrend}
                  customFormat={tooltipFormatter}
                />
              }
              cursor={{ 
                fill: themeConfig[currentTheme].grid, 
                fillOpacity: 0.1,
                stroke: "none"
              }}
            />
            
            {/* 📈 Reference Lines */}
            {referenceLine.map((ref, index) => (
              <ReferenceLine
                key={index}
                {...(horizontal ? { x: ref.value } : { y: ref.value })}
                stroke={ref.color || themeConfig[currentTheme].foreground}
                strokeDasharray="5 5"
                strokeOpacity={0.6}
                label={ref.label}
              />
            ))}
            
            {/* 📊 Bars */}
            {visibleSeries.map((s, index) => (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name || s.dataKey}
                stackId={stacked ? (s.stackId || "default") : undefined}
                fill={s.color || getBarColor(index)}
                opacity={s.opacity || (s.hidden ? 0.3 : 1)}
                stroke={gradient ? "none" : undefined}
                strokeWidth={s.strokeWidth || 0}
                radius={rounded ? [4, 4, 0, 0] : 0}
                maxBarSize={maxBarSize}
                onClick={interactive ? handleBarClick : undefined}
                onMouseEnter={onHover}
                {...animationConfig}
              >
                {/* 🎨 Gradient Fill */}
                {gradient && (
                  <defs>
                    <linearGradient id={`gradient-${s.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={s.color || getBarColor(index)} stopOpacity={0.8} />
                      <stop offset="100%" stopColor={s.color || getBarColor(index)} stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                )}
                
                {/* 🎯 Cell-level Customization */}
                {processedData.map((entry, cellIndex) => (
                  <Cell 
                    key={`cell-${cellIndex}`}
                    fill={
                      entry._highlight 
                        ? "#fbbf24" 
                        : entry._status === "error" 
                          ? "#ef4444"
                          : entry._status === "warning"
                            ? "#f59e0b"
                            : entry._status === "success"
                              ? "#22c55e"
                              : s.color || getBarColor(index, cellIndex, entry[s.dataKey])
                    }
                    stroke={selectedData.includes(entry) ? "#3b82f6" : "none"}
                    strokeWidth={selectedData.includes(entry) ? 2 : 0}
                  />
                ))}
                
                {/* 📝 Value Labels */}
                {showValues && (
                  <LabelList 
                    dataKey={s.dataKey}
                    position={horizontal ? "right" : "top"}
                    formatter={(value: number) => 
                      typeof value === "number" ? value.toLocaleString() : value
                    }
                    fontSize={11}
                    fill={themeConfig[currentTheme].foreground}
                  />
                )}
              </Bar>
            ))}
            
            {/* 🖱️ Brush for Zooming */}
            {brush && !horizontal && (
              <Brush
                dataKey={xKey}
                height={30}
                stroke={themeConfig[currentTheme].border}
                fill={themeConfig[currentTheme].background}
                onChange={(brushData: any) => {
                  if (brushData) {
                    setZoomDomain([brushData.startIndex, brushData.endIndex]);
                    setIsZoomed(true);
                  } else {
                    setZoomDomain(null);
                    setIsZoomed(false);
                  }
                }}
              />
            )}
            
            {/* 🎯 Legend */}
            {legend && (
              <Legend 
                content={
                  <CustomLegendComponent
                    onToggle={handleLegendToggle}
                    hiddenSeries={hiddenSeries}
                    variant={variant}
                  />
                }
                wrapperStyle={{ paddingTop: "20px" }}
              />
            )}
          </RBarChart>
        </ResponsiveContainer>
      </div>
      
      {/* 📍 Annotations */}
      {annotations.map((annotation, index) => (
        <div
          key={index}
          className="absolute pointer-events-none"
          style={{
            // Position based on data coordinates (simplified)
            left: `${50}%`, // This would need proper coordinate transformation
            top: `${50}%`,
          }}
        >
          {annotation.content}
        </div>
      ))}
    </div>
  );
}

// 🎯 DASHBOARD VARIANTS - Ready-to-use

export const DashboardBarChart: React.FC<Omit<BarChartProps, "variant">> = (props) => (
  <BarChart {...props} variant="dashboard" />
);

export const ExecutiveBarChart: React.FC<Omit<BarChartProps, "variant">> = (props) => (
  <BarChart {...props} variant="executive" />
);

export const SalesBarChart: React.FC<Omit<BarChartProps, "variant">> = (props) => (
  <BarChart {...props} variant="sales" />
);

export const AnalyticsBarChart: React.FC<Omit<BarChartProps, "variant">> = (props) => (
  <BarChart {...props} variant="analytics" />
);

export const FinancialBarChart: React.FC<Omit<BarChartProps, "variant">> = (props) => (
  <BarChart {...props} variant="financial" />
);

export const MinimalBarChart: React.FC<Omit<BarChartProps, "variant">> = (props) => (
  <BarChart {...props} variant="minimal" />
);

export const RealtimeBarChart: React.FC<Omit<BarChartProps, "variant">> = (props) => (
  <BarChart {...props} variant="realtime" realtime />
);

// 🔧 UTILITY HOOKS

export const useBarChartData = (initialData: BarChartData[]) => {
  const [data, setData] = React.useState(initialData);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const updateData = React.useCallback((newData: BarChartData[]) => {
    setData(newData);
  }, []);
  
  const addDataPoint = React.useCallback((point: BarChartData) => {
    setData(prev => [...prev, point]);
  }, []);
  
  const removeDataPoint = React.useCallback((index: number) => {
    setData(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const refresh = React.useCallback(async (fetcher: () => Promise<BarChartData[]>) => {
    setLoading(true);
    setError(null);
    try {
      const newData = await fetcher();
      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    data,
    loading,
    error,
    updateData,
    addDataPoint,
    removeDataPoint,
    refresh,
  };
};

export const useBarChartTheme = (initialTheme: BarTheme = "auto") => {
  const [theme, setTheme] = React.useState<BarTheme>(initialTheme);
  
  const toggleTheme = React.useCallback(() => {
    setTheme(current => current === "dark" ? "light" : "dark");
  }, []);
  
  const setLightTheme = React.useCallback(() => setTheme("light"), []);
  const setDarkTheme = React.useCallback(() => setTheme("dark"), []);
  const setAutoTheme = React.useCallback(() => setTheme("auto"), []);
  const setHighContrastTheme = React.useCallback(() => setTheme("high-contrast"), []);
  
  return {
    theme,
    setTheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setAutoTheme,
    setHighContrastTheme,
  };
};

// 📊 EXPORT ALL
export default BarChart;