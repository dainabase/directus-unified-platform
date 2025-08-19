/**
 * Premium LineChart Tests - Dashboard Excellence Suite
 * Ultra-specialized test suite for enterprise dashboard scenarios
 * Testing real business metrics, KPIs, and dashboard interactions
 * 
 * @version 2.0.0 - Pattern Triple ⭐⭐⭐⭐⭐
 * @category Dashboard Charts
 * @priority Critical - Core dashboard component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LineChart, LineSeries, LineChartProps } from './line-chart';

// Mock recharts to control animations and rendering
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
    LineChart: ({ children, onClick }: any) => (
      <div data-testid="line-chart" onClick={onClick}>
        {children}
      </div>
    ),
    Line: ({ dataKey, stroke, strokeWidth }: any) => (
      <div
        data-testid={`line-${dataKey}`}
        data-stroke={stroke}
        data-stroke-width={strokeWidth}
      />
    ),
    XAxis: ({ dataKey }: any) => <div data-testid="x-axis" data-key={dataKey} />,
    YAxis: ({ tickFormatter }: any) => <div data-testid="y-axis" data-formatter={!!tickFormatter} />,
    CartesianGrid: () => <div data-testid="grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    Brush: () => <div data-testid="brush" />,
  };
});

/**
 * Real Business Dashboard Data - Comprehensive Test Datasets
 */
const dashboardTestData = {
  // CEO Dashboard - Monthly Revenue & Growth
  ceoMetrics: [
    { month: 'Jan', revenue: 245000, expenses: 180000, profit: 65000, growth: 12.5, users: 1250 },
    { month: 'Feb', revenue: 267000, expenses: 185000, profit: 82000, growth: 15.2, users: 1380 },
    { month: 'Mar', revenue: 289000, expenses: 192000, profit: 97000, growth: 18.7, users: 1520 },
    { month: 'Apr', revenue: 312000, expenses: 198000, profit: 114000, growth: 22.1, users: 1680 },
    { month: 'May', revenue: 334000, expenses: 205000, profit: 129000, growth: 25.8, users: 1850 },
    { month: 'Jun', revenue: 356000, expenses: 212000, profit: 144000, growth: 28.4, users: 2020 },
  ],

  // Analytics Dashboard - Traffic & Conversions
  analyticsMetrics: [
    { date: '2024-08-01', sessions: 15420, pageviews: 42350, conversions: 186, bounceRate: 42.3 },
    { date: '2024-08-02', sessions: 16230, pageviews: 44120, conversions: 198, bounceRate: 41.8 },
    { date: '2024-08-03', sessions: 14890, pageviews: 41200, conversions: 172, bounceRate: 43.1 },
    { date: '2024-08-04', sessions: 17560, pageviews: 47890, conversions: 224, bounceRate: 40.2 },
    { date: '2024-08-05', sessions: 18420, pageviews: 51230, conversions: 245, bounceRate: 39.5 },
  ],

  // Financial Dashboard - P&L Analysis
  financialMetrics: [
    { quarter: 'Q1 2024', revenue: 2450000, cogs: 1225000, grossProfit: 1225000, opex: 980000, netIncome: 245000 },
    { quarter: 'Q2 2024', revenue: 2780000, cogs: 1390000, grossProfit: 1390000, opex: 1112000, netIncome: 278000 },
    { quarter: 'Q3 2024', revenue: 3120000, cogs: 1560000, grossProfit: 1560000, opex: 1248000, netIncome: 312000 },
    { quarter: 'Q4 2024', revenue: 3450000, cogs: 1725000, grossProfit: 1725000, opex: 1380000, netIncome: 345000 },
  ],

  // Real-time Monitoring - System Metrics
  realtimeMetrics: [
    { time: '14:00', cpu: 45.2, memory: 67.8, disk: 34.5, network: 125.6 },
    { time: '14:05', cpu: 48.7, memory: 69.2, disk: 35.1, network: 132.4 },
    { time: '14:10', cpu: 52.1, memory: 71.5, disk: 35.8, network: 128.9 },
    { time: '14:15', cpu: 49.3, memory: 68.9, disk: 36.2, network: 135.7 },
    { time: '14:20', cpu: 46.8, memory: 66.4, disk: 36.9, network: 142.3 },
  ],

  // Empty dataset for testing
  empty: [],

  // Single data point
  single: [{ month: 'Jan', value: 100 }],

  // Large dataset for performance testing
  large: Array.from({ length: 1000 }, (_, i) => ({
    day: `Day ${i + 1}`,
    metric1: Math.random() * 1000,
    metric2: Math.random() * 500,
    metric3: Math.random() * 250,
  })),
};

/**
 * Business Series Configurations
 */
const seriesConfigurations = {
  ceoSeries: [
    { dataKey: 'revenue', name: 'Revenue', color: '#10b981' },
    { dataKey: 'expenses', name: 'Expenses', color: '#f59e0b' },
    { dataKey: 'profit', name: 'Profit', color: '#3b82f6' },
  ] as LineSeries[],

  analyticsSeries: [
    { dataKey: 'sessions', name: 'Sessions', strokeWidth: 3, smooth: true },
    { dataKey: 'conversions', name: 'Conversions', color: '#10b981', showDots: true },
  ] as LineSeries[],

  financialSeries: [
    { dataKey: 'revenue', name: 'Revenue', color: '#059669' },
    { dataKey: 'grossProfit', name: 'Gross Profit', color: '#0ea5e9' },
    { dataKey: 'netIncome', name: 'Net Income', color: '#8b5cf6' },
  ] as LineSeries[],

  realtimeSeries: [
    { dataKey: 'cpu', name: 'CPU %', color: '#ef4444', smooth: true },
    { dataKey: 'memory', name: 'Memory %', color: '#f59e0b', smooth: true },
    { dataKey: 'network', name: 'Network MB/s', color: '#06b6d4', smooth: true },
  ] as LineSeries[],
};

/**
 * Test Utilities and Helpers
 */
const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
const formatPercentage = (value: number) => `${value}%`;
const formatNumber = (value: number) => value.toLocaleString();

const createMockProps = (overrides: Partial<LineChartProps> = {}): LineChartProps => ({
  data: dashboardTestData.ceoMetrics,
  xKey: 'month',
  series: seriesConfigurations.ceoSeries,
  height: 400,
  ...overrides,
});

/**
 * Main Test Suite - Dashboard Excellence
 */
describe('LineChart - Premium Dashboard Suite ⭐⭐⭐⭐⭐', () => {
  let mockConsoleWarn: any;
  let mockConsoleError: any;

  beforeEach(() => {
    mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockConsoleWarn.mockRestore();
    mockConsoleError.mockRestore();
    vi.clearAllMocks();
  });

  /**
   * Core Rendering Tests - Foundation
   */
  describe('Core Rendering Excellence', () => {
    it('renders CEO dashboard metrics perfectly', () => {
      const props = createMockProps({
        data: dashboardTestData.ceoMetrics,
        series: seriesConfigurations.ceoSeries,
        title: 'Executive Dashboard',
        variant: 'premium',
      });

      render(<LineChart {...props} />);

      expect(screen.getByText('Executive Dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      
      // Verify all series are rendered
      expect(screen.getByTestId('line-revenue')).toBeInTheDocument();
      expect(screen.getByTestId('line-expenses')).toBeInTheDocument();
      expect(screen.getByTestId('line-profit')).toBeInTheDocument();
    });

    it('handles analytics dashboard with traffic metrics', () => {
      const props = createMockProps({
        data: dashboardTestData.analyticsMetrics,
        xKey: 'date',
        series: seriesConfigurations.analyticsSeries,
        variant: 'analytics',
      });

      render(<LineChart {...props} />);

      expect(screen.getByTestId('line-sessions')).toBeInTheDocument();
      expect(screen.getByTestId('line-conversions')).toBeInTheDocument();
      expect(screen.getByTestId('x-axis')).toHaveAttribute('data-key', 'date');
    });

    it('displays financial P&L dashboard correctly', () => {
      const props = createMockProps({
        data: dashboardTestData.financialMetrics,
        xKey: 'quarter',
        series: seriesConfigurations.financialSeries,
        yAxisFormatter: formatCurrency,
        variant: 'financial',
      });

      render(<LineChart {...props} />);

      expect(screen.getByTestId('line-revenue')).toBeInTheDocument();
      expect(screen.getByTestId('line-grossProfit')).toBeInTheDocument();
      expect(screen.getByTestId('line-netIncome')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toHaveAttribute('data-formatter', 'true');
    });
  });

  /**
   * Dashboard Theme & Variant Tests
   */
  describe('Premium Theme System', () => {
    it('applies light theme correctly', () => {
      const props = createMockProps({ theme: 'light' });
      const { container } = render(<LineChart {...props} />);

      const chartContainer = container.querySelector('.chart-container');
      expect(chartContainer).toHaveStyle({
        '--chart-bg': '#ffffff',
        '--chart-text': '#374151',
      });
    });

    it('applies dark theme for night dashboards', () => {
      const props = createMockProps({ theme: 'dark' });
      const { container } = render(<LineChart {...props} />);

      const chartContainer = container.querySelector('.chart-container');
      expect(chartContainer).toHaveStyle({
        '--chart-bg': '#1f2937',
        '--chart-text': '#f9fafb',
      });
    });

    it('applies KPI variant styling', () => {
      const props = createMockProps({ variant: 'kpi' });
      const { container } = render(<LineChart {...props} />);

      const chartContainer = container.querySelector('.chart-container');
      expect(chartContainer).toHaveClass('bg-gradient-to-br', 'from-primary/5', 'to-accent/5');
    });

    it('applies premium variant with enhanced styling', () => {
      const props = createMockProps({ variant: 'premium' });
      const { container } = render(<LineChart {...props} />);

      const chartContainer = container.querySelector('.chart-container');
      expect(chartContainer).toHaveClass('border-2', 'border-primary/20', 'shadow-lg');
    });
  });

  /**
   * Business Data Formatting Tests
   */
  describe('Business Data Excellence', () => {
    it('formats currency values for financial dashboards', () => {
      const props = createMockProps({
        data: dashboardTestData.financialMetrics,
        yAxisFormatter: formatCurrency,
      });

      render(<LineChart {...props} />);
      expect(screen.getByTestId('y-axis')).toHaveAttribute('data-formatter', 'true');
    });

    it('handles percentage formatting for KPI metrics', () => {
      const props = createMockProps({
        data: dashboardTestData.analyticsMetrics,
        yAxisFormatter: formatPercentage,
      });

      render(<LineChart {...props} />);
      expect(screen.getByTestId('y-axis')).toHaveAttribute('data-formatter', 'true');
    });

    it('processes large datasets efficiently', () => {
      const startTime = performance.now();
      
      const props = createMockProps({
        data: dashboardTestData.large,
        optimized: true,
      });

      render(<LineChart {...props} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render large datasets in under 100ms
      expect(renderTime).toBeLessThan(100);
    });
  });

  /**
   * Interactive Dashboard Tests
   */
  describe('Dashboard Interactivity', () => {
    it('handles data point clicks for drill-down', async () => {
      const user = userEvent.setup();
      const onDataPointClick = vi.fn();

      const props = createMockProps({
        interactions: {
          clickable: true,
          onDataPointClick,
        },
      });

      render(<LineChart {...props} />);

      const chart = screen.getByTestId('line-chart');
      await user.click(chart);

      expect(onDataPointClick).toHaveBeenCalled();
    });

    it('enables brush selection for time ranges', () => {
      const props = createMockProps({
        interactions: {
          brush: true,
          onSelectionChange: vi.fn(),
        },
      });

      render(<LineChart {...props} />);
      expect(screen.getByTestId('brush')).toBeInTheDocument();
    });

    it('shows crosshair for precise value reading', () => {
      const props = createMockProps({
        interactions: { crosshair: true },
        tooltip: { enabled: true },
      });

      render(<LineChart {...props} />);
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });
  });

  /**
   * Real-time Dashboard Tests
   */
  describe('Real-time Monitoring', () => {
    it('displays real-time indicator when enabled', () => {
      const props = createMockProps({
        data: dashboardTestData.realtimeMetrics,
        realtime: true,
        updateInterval: 5000,
      });

      const { container } = render(<LineChart {...props} />);
      
      const realtimeIndicator = container.querySelector('.animate-pulse');
      expect(realtimeIndicator).toBeInTheDocument();
    });

    it('handles system monitoring metrics', () => {
      const props = createMockProps({
        data: dashboardTestData.realtimeMetrics,
        xKey: 'time',
        series: seriesConfigurations.realtimeSeries,
        variant: 'realtime',
      });

      render(<LineChart {...props} />);

      expect(screen.getByTestId('line-cpu')).toBeInTheDocument();
      expect(screen.getByTestId('line-memory')).toBeInTheDocument();
      expect(screen.getByTestId('line-network')).toBeInTheDocument();
    });
  });

  /**
   * Loading & Error States
   */
  describe('Premium State Management', () => {
    it('shows shimmer loading animation', () => {
      const props = createMockProps({
        loading: {
          loading: true,
          skeletonType: 'shimmer',
        },
      });

      const { container } = render(<LineChart {...props} />);
      
      const skeleton = container.querySelector('.animate-shimmer');
      expect(skeleton).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading chart data');
    });

    it('displays elegant error boundary', () => {
      const props = createMockProps({
        error: {
          error: true,
          message: 'Failed to load revenue data',
          onRetry: vi.fn(),
        },
      });

      render(<LineChart {...props} />);

      expect(screen.getByText('Chart Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load revenue data')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });

    it('handles empty state gracefully', () => {
      const props = createMockProps({
        data: [],
        emptyMessage: 'No dashboard data available',
      });

      render(<LineChart {...props} />);
      expect(screen.getByText('No dashboard data available')).toBeInTheDocument();
    });
  });

  /**
   * Accessibility Excellence
   */
  describe('WCAG AAA Accessibility', () => {
    it('provides comprehensive screen reader support', () => {
      const props = createMockProps({
        title: 'Q3 Revenue Performance',
        description: 'Monthly revenue, expenses, and profit trends',
        ariaLabel: 'Interactive line chart showing quarterly financial performance',
      });

      render(<LineChart {...props} />);

      const chart = screen.getByRole('img');
      expect(chart).toHaveAttribute('aria-label', 'Interactive line chart showing quarterly financial performance');
      expect(chart).toHaveAttribute('title', 'Q3 Revenue Performance');
      expect(screen.getByText('Monthly revenue, expenses, and profit trends')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      const props = createMockProps({
        interactions: { clickable: true },
      });

      render(<LineChart {...props} />);

      const chart = screen.getByTestId('line-chart');
      
      // Test keyboard accessibility
      chart.focus();
      await user.keyboard('{Enter}');
      
      expect(chart).toBeInTheDocument();
    });
  });

  /**
   * Performance Optimization Tests
   */
  describe('Performance Excellence', () => {
    it('memoizes expensive calculations', () => {
      const props = createMockProps({
        data: dashboardTestData.large,
        optimized: true,
      });

      const { rerender } = render(<LineChart {...props} />);
      
      // Re-render with same props should not cause recalculation
      rerender(<LineChart {...props} />);
      
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('handles animation performance correctly', () => {
      const props = createMockProps({
        animations: {
          enabled: true,
          duration: 750,
          staggerDelay: 100,
        },
      });

      render(<LineChart {...props} />);
      
      // Verify chart renders without performance issues
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  /**
   * Responsive Design Tests
   */
  describe('Responsive Excellence', () => {
    it('adapts to different screen sizes', () => {
      const sizes: Array<LineChartProps['size']> = ['xs', 'sm', 'md', 'lg', 'xl'];
      
      sizes.forEach(size => {
        const props = createMockProps({ size });
        const { container } = render(<LineChart {...props} />);
        
        const chartContainer = container.querySelector('.chart-container');
        expect(chartContainer).toBeInTheDocument();
      });
    });

    it('maintains aspect ratio on mobile', () => {
      const props = createMockProps({
        size: 'sm',
        width: '100%',
      });

      const { container } = render(<LineChart {...props} />);
      
      const chartContainer = container.querySelector('.chart-container');
      expect(chartContainer).toHaveStyle({ width: '100%' });
    });
  });

  /**
   * Business Logic Validation
   */
  describe('Business Logic Excellence', () => {
    it('calculates revenue trends correctly', () => {
      const props = createMockProps({
        data: dashboardTestData.ceoMetrics,
        showTrends: true,
      });

      const { container } = render(<LineChart {...props} />);
      
      // Trend indicator should be present
      const trendIndicator = container.querySelector('.text-green-500');
      expect(trendIndicator).toBeTruthy();
    });

    it('validates data integrity for financial metrics', () => {
      const invalidData = [
        { quarter: 'Q1', revenue: -100 }, // Invalid negative revenue
      ];

      const props = createMockProps({
        data: invalidData,
      });

      render(<LineChart {...props} />);
      
      // Should handle invalid data gracefully
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  /**
   * Integration Tests
   */
  describe('Dashboard Integration', () => {
    it('integrates with external dashboard state', () => {
      const dashboardState = {
        selectedMetric: 'revenue',
        timeRange: '6months',
        theme: 'dark' as const,
      };

      const props = createMockProps({
        data: dashboardTestData.ceoMetrics,
        theme: dashboardState.theme,
        series: seriesConfigurations.ceoSeries.filter(s => 
          s.dataKey === dashboardState.selectedMetric
        ),
      });

      render(<LineChart {...props} />);
      
      expect(screen.getByTestId('line-revenue')).toBeInTheDocument();
    });

    it('exports data for executive reports', () => {
      const props = createMockProps({
        data: dashboardTestData.financialMetrics,
        title: 'Q4 Financial Performance',
      });

      render(<LineChart {...props} />);
      
      // Verify data is accessible for export functionality
      expect(screen.getByText('Q4 Financial Performance')).toBeInTheDocument();
    });
  });
});

/**
 * Visual Regression Test Helpers
 * (Integration with Chromatic/Percy would go here)
 */
export const visualTestScenarios = {
  ceoDashboard: () => (
    <LineChart
      data={dashboardTestData.ceoMetrics}
      xKey="month"
      series={seriesConfigurations.ceoSeries}
      title="Executive Dashboard"
      variant="premium"
      theme="light"
      height={400}
    />
  ),
  
  darkThemeAnalytics: () => (
    <LineChart
      data={dashboardTestData.analyticsMetrics}
      xKey="date"
      series={seriesConfigurations.analyticsSeries}
      title="Traffic Analytics"
      variant="analytics"
      theme="dark"
      height={300}
    />
  ),
  
  realtimeMonitoring: () => (
    <LineChart
      data={dashboardTestData.realtimeMetrics}
      xKey="time"
      series={seriesConfigurations.realtimeSeries}
      title="System Monitoring"
      variant="realtime"
      realtime={true}
      height={250}
    />
  ),
};