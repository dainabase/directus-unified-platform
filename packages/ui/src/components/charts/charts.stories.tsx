/**
 * Premium LineChart Stories - Dashboard Excellence Showcase
 * Sophisticated Storybook scenarios for enterprise dashboard demonstrations
 * Apple-inspired design with real business data and smooth animations
 * 
 * @version 2.0.0 - Pattern Triple ⭐⭐⭐⭐⭐
 * @category Dashboard Charts
 * @priority Showcase - Executive demonstrations
 */

import type { Meta, StoryObj } from "@storybook/react";
import { within, userEvent, expect } from "@storybook/test";
import { LineChart, LineSeries } from "./line-chart";
import React from "react";

/**
 * Real Business Dashboard Data - Executive Quality
 */
const dashboardData = {
  // Executive Dashboard - Q3 Performance
  executiveMetrics: [
    { month: 'Jan 24', revenue: 2450000, expenses: 1960000, profit: 490000, growth: 8.2, customers: 12450 },
    { month: 'Feb 24', revenue: 2680000, expenses: 2040000, profit: 640000, growth: 12.1, customers: 13200 },
    { month: 'Mar 24', revenue: 2890000, expenses: 2135000, profit: 755000, growth: 15.8, customers: 14100 },
    { month: 'Apr 24', revenue: 3120000, expenses: 2248000, profit: 872000, growth: 18.4, customers: 15250 },
    { month: 'May 24', revenue: 3380000, expenses: 2365000, profit: 1015000, growth: 22.7, customers: 16800 },
    { month: 'Jun 24', revenue: 3650000, expenses: 2485000, profit: 1165000, growth: 26.3, customers: 18450 },
    { month: 'Jul 24', revenue: 3920000, expenses: 2610000, profit: 1310000, growth: 29.1, customers: 20300 },
    { month: 'Aug 24', revenue: 4180000, expenses: 2740000, profit: 1440000, growth: 31.8, customers: 22150 },
  ],

  // SaaS Metrics Dashboard
  saasMetrics: [
    { week: 'Week 1', mrr: 185000, arr: 2220000, churn: 2.1, newCustomers: 145, cac: 680 },
    { week: 'Week 2', mrr: 192000, arr: 2304000, churn: 1.8, newCustomers: 162, cac: 645 },
    { week: 'Week 3', mrr: 198000, arr: 2376000, churn: 2.3, newCustomers: 138, cac: 720 },
    { week: 'Week 4', mrr: 205000, arr: 2460000, churn: 1.6, newCustomers: 175, cac: 590 },
    { week: 'Week 5', mrr: 213000, arr: 2556000, churn: 1.9, newCustomers: 158, cac: 625 },
    { week: 'Week 6', mrr: 220000, arr: 2640000, churn: 1.4, newCustomers: 189, cac: 570 },
  ],

  // E-commerce Analytics
  ecommerceMetrics: [
    { day: 'Mon', sessions: 24500, orders: 485, revenue: 52300, conversionRate: 1.98, avgOrderValue: 107.84 },
    { day: 'Tue', sessions: 26800, orders: 520, revenue: 58900, conversionRate: 1.94, avgOrderValue: 113.27 },
    { day: 'Wed', sessions: 23200, orders: 445, revenue: 48200, conversionRate: 1.92, avgOrderValue: 108.31 },
    { day: 'Thu', sessions: 28900, orders: 595, revenue: 67400, conversionRate: 2.06, avgOrderValue: 113.28 },
    { day: 'Fri', sessions: 35600, orders: 780, revenue: 89600, conversionRate: 2.19, avgOrderValue: 114.87 },
    { day: 'Sat', sessions: 42100, orders: 920, revenue: 108900, conversionRate: 2.18, avgOrderValue: 118.37 },
    { day: 'Sun', sessions: 31400, orders: 650, revenue: 74500, conversionRate: 2.07, avgOrderValue: 114.62 },
  ],

  // Financial Trading Dashboard
  tradingMetrics: [
    { time: '09:30', sp500: 4185.2, nasdaq: 12847.5, dow: 33456.8, vix: 18.4, volume: 1.2 },
    { time: '10:00', sp500: 4192.8, nasdaq: 12876.3, dow: 33489.2, vix: 17.9, volume: 1.8 },
    { time: '10:30', sp500: 4187.5, nasdaq: 12851.7, dow: 33442.6, vix: 18.7, volume: 2.1 },
    { time: '11:00', sp500: 4201.3, nasdaq: 12905.4, dow: 33521.9, vix: 17.2, volume: 2.4 },
    { time: '11:30', sp500: 4196.7, nasdaq: 12889.2, dow: 33498.4, vix: 17.8, volume: 2.2 },
    { time: '12:00', sp500: 4208.9, nasdaq: 12934.8, dow: 33567.1, vix: 16.9, volume: 1.9 },
  ],

  // System Performance Monitoring
  systemMetrics: [
    { timestamp: '14:00', cpu: 45.2, memory: 67.8, disk: 34.5, network: 125.6, response: 45 },
    { timestamp: '14:05', cpu: 48.7, memory: 69.2, disk: 35.1, network: 132.4, response: 52 },
    { timestamp: '14:10', cpu: 52.1, memory: 71.5, disk: 35.8, network: 128.9, response: 48 },
    { timestamp: '14:15', cpu: 49.3, memory: 68.9, disk: 36.2, network: 135.7, response: 43 },
    { timestamp: '14:20', cpu: 46.8, memory: 66.4, disk: 36.9, network: 142.3, response: 38 },
    { timestamp: '14:25', cpu: 44.1, memory: 64.7, disk: 37.4, network: 138.9, response: 41 },
  ],
};

/**
 * Premium Series Configurations
 */
const seriesConfigs = {
  executive: [
    { dataKey: 'revenue', name: 'Revenue', color: '#10b981', strokeWidth: 3, showGradient: true },
    { dataKey: 'expenses', name: 'Expenses', color: '#f59e0b', strokeWidth: 2, strokeDasharray: '5 5' },
    { dataKey: 'profit', name: 'Profit', color: '#3b82f6', strokeWidth: 3, smooth: true },
  ] as LineSeries[],

  saas: [
    { dataKey: 'mrr', name: 'MRR', color: '#8b5cf6', strokeWidth: 4, smooth: true },
    { dataKey: 'newCustomers', name: 'New Customers', color: '#06b6d4', strokeWidth: 2, showDots: true },
  ] as LineSeries[],

  ecommerce: [
    { dataKey: 'revenue', name: 'Revenue', color: '#059669', strokeWidth: 3 },
    { dataKey: 'orders', name: 'Orders', color: '#dc2626', strokeWidth: 2 },
    { dataKey: 'sessions', name: 'Sessions', color: '#7c3aed', strokeWidth: 2, curveType: 'basis' },
  ] as LineSeries[],

  trading: [
    { dataKey: 'sp500', name: 'S&P 500', color: '#1f2937', strokeWidth: 3 },
    { dataKey: 'nasdaq', name: 'NASDAQ', color: '#059669', strokeWidth: 2 },
    { dataKey: 'dow', name: 'Dow Jones', color: '#dc2626', strokeWidth: 2 },
  ] as LineSeries[],

  monitoring: [
    { dataKey: 'cpu', name: 'CPU %', color: '#ef4444', strokeWidth: 2, smooth: true },
    { dataKey: 'memory', name: 'Memory %', color: '#f59e0b', strokeWidth: 2, smooth: true },
    { dataKey: 'network', name: 'Network MB/s', color: '#06b6d4', strokeWidth: 2, smooth: true },
  ] as LineSeries[],
};

/**
 * Utility Functions
 */
const formatCurrency = (value: number) => `$${(value / 1000).toFixed(0)}K`;
const formatLargeCurrency = (value: number) => `$${(value / 1000000).toFixed(1)}M`;
const formatPercentage = (value: number) => `${value}%`;
const formatNumber = (value: number) => value.toLocaleString();

/**
 * Storybook Meta Configuration
 */
const meta: Meta<typeof LineChart> = {
  title: "Charts/LineChart Premium ⭐⭐⭐⭐⭐",
  component: LineChart,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
# Premium LineChart - Dashboard Excellence

Enterprise-grade line chart component designed for sophisticated business dashboards.
Features Apple-inspired animations, multiple themes, and advanced interactivity.

## Key Features
- 🎨 **Multiple Themes**: Light, Dark, Auto, High-contrast
- ✨ **Smooth Animations**: Staggered entry effects and smooth transitions  
- 🖱️ **Advanced Interactivity**: Zoom, brush selection, crosshair
- 📱 **Responsive Design**: Adapts to all screen sizes
- ♿ **Accessibility**: WCAG AAA compliant
- 📊 **Dashboard Variants**: KPI, Metrics, Financial, Real-time
- ⚡ **Performance**: Optimized for large datasets

## Dashboard Use Cases
- Executive KPI dashboards
- SaaS metrics monitoring
- E-commerce analytics
- Financial trading platforms
- System performance monitoring
        `,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1f2937' },
        { name: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      ],
    },
  },
  argTypes: {
    theme: {
      control: { type: 'select' },
      options: ['light', 'dark', 'auto', 'high-contrast'],
      description: 'Chart theme variant',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'kpi', 'metrics', 'financial', 'analytics', 'realtime', 'minimal', 'premium'],
      description: 'Dashboard variant styling',
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'full'],
      description: 'Chart size preset',
    },
    animations: {
      control: { type: 'object' },
      description: 'Animation configuration',
    },
    interactions: {
      control: { type: 'object' },
      description: 'Interactivity settings',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LineChart>;

/**
 * Default Story - Executive Dashboard
 */
export const ExecutiveDashboard: Story = {
  args: {
    data: dashboardData.executiveMetrics,
    xKey: 'month',
    series: seriesConfigs.executive,
    title: 'Executive Dashboard - Q3 Performance',
    description: 'Revenue, expenses, and profit trends with growth indicators',
    variant: 'premium',
    theme: 'light',
    height: 400,
    yAxisFormatter: formatLargeCurrency,
    showTrends: true,
    animations: {
      enabled: true,
      duration: 1000,
      staggerDelay: 150,
    },
    interactions: {
      crosshair: true,
      clickable: true,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Premium executive dashboard showing key financial metrics with smooth animations and professional styling.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Test that the chart renders
    await expect(canvas.getByText('Executive Dashboard - Q3 Performance')).toBeInTheDocument();
    
    // Test interactivity
    const chartContainer = canvas.getByRole('img');
    await userEvent.hover(chartContainer);
  },
};

/**
 * Dark Theme - SaaS Metrics
 */
export const SaaSMetricsDark: Story = {
  args: {
    data: dashboardData.saasMetrics,
    xKey: 'week',
    series: seriesConfigs.saas,
    title: 'SaaS Growth Metrics',
    description: 'Monthly Recurring Revenue and customer acquisition trends',
    variant: 'kpi',
    theme: 'dark',
    height: 350,
    yAxisFormatter: formatLargeCurrency,
    showLabels: true,
    animations: {
      enabled: true,
      duration: 800,
      staggerDelay: 100,
    },
    interactions: {
      brush: true,
      crosshair: true,
    },
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Dark theme SaaS dashboard perfect for monitoring key business metrics in low-light environments.',
      },
    },
  },
};

/**
 * E-commerce Analytics - Light Theme
 */
export const EcommerceAnalytics: Story = {
  args: {
    data: dashboardData.ecommerceMetrics,
    xKey: 'day',
    series: seriesConfigs.ecommerce,
    title: 'E-commerce Weekly Performance',
    description: 'Sales, orders, and traffic analysis across the week',
    variant: 'analytics',
    theme: 'light',
    height: 320,
    yAxisFormatter: formatCurrency,
    legend: { position: 'top' },
    grid: {
      enabled: true,
      opacity: 0.1,
      horizontal: true,
      vertical: false,
    },
    animations: {
      enabled: true,
      duration: 1200,
      easing: 'ease-out',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive e-commerce analytics showing the correlation between traffic, orders, and revenue.',
      },
    },
  },
};

/**
 * Financial Trading Dashboard
 */
export const TradingDashboard: Story = {
  args: {
    data: dashboardData.tradingMetrics,
    xKey: 'time',
    series: seriesConfigs.trading,
    title: 'Market Overview - Live Trading',
    description: 'Real-time stock market indices with live updates',
    variant: 'financial',
    theme: 'auto',
    height: 380,
    yAxisFormatter: formatNumber,
    realtime: true,
    updateInterval: 5000,
    showTrends: true,
    interactions: {
      zoom: true,
      crosshair: true,
      clickable: true,
    },
    animations: {
      enabled: true,
      duration: 500,
      staggerDelay: 50,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Live financial trading dashboard with real-time updates and precise data visualization.',
      },
    },
  },
};

/**
 * System Monitoring - Real-time
 */
export const SystemMonitoring: Story = {
  args: {
    data: dashboardData.systemMetrics,
    xKey: 'timestamp',
    series: seriesConfigs.monitoring,
    title: 'System Performance Monitor',
    description: 'Real-time server performance metrics and alerts',
    variant: 'realtime',
    theme: 'dark',
    height: 280,
    yAxisFormatter: formatPercentage,
    realtime: true,
    updateInterval: 2000,
    grid: {
      enabled: true,
      opacity: 0.3,
      strokeDasharray: '2 2',
    },
    animations: {
      enabled: true,
      duration: 300,
    },
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Real-time system monitoring dashboard for DevOps teams with live performance metrics.',
      },
    },
  },
};

/**
 * Minimal Design - Clean & Simple
 */
export const MinimalDesign: Story = {
  args: {
    data: dashboardData.executiveMetrics.slice(0, 6),
    xKey: 'month',
    series: [{ dataKey: 'profit', name: 'Profit', color: '#6366f1', strokeWidth: 2 }],
    variant: 'minimal',
    theme: 'light',
    height: 200,
    hideXAxis: false,
    hideYAxis: false,
    legend: false,
    grid: false,
    yAxisFormatter: formatLargeCurrency,
    animations: {
      enabled: true,
      duration: 1500,
      easing: 'ease-in-out',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Clean, minimal design perfect for focused presentations and executive summaries.',
      },
    },
  },
};

/**
 * High Contrast - Accessibility
 */
export const HighContrastAccessible: Story = {
  args: {
    data: dashboardData.saasMetrics,
    xKey: 'week',
    series: [
      { dataKey: 'mrr', name: 'Monthly Recurring Revenue', color: '#ffffff', strokeWidth: 4 },
    ],
    title: 'Accessible Dashboard Design',
    description: 'High contrast theme for users with visual impairments',
    variant: 'default',
    theme: 'high-contrast',
    height: 350,
    yAxisFormatter: formatLargeCurrency,
    ariaLabel: 'Monthly recurring revenue trend showing steady growth from week 1 to week 6',
    animations: {
      enabled: false, // Respect reduced motion preferences
    },
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'WCAG AAA compliant high-contrast theme designed for maximum accessibility.',
      },
    },
  },
};

/**
 * Loading States Showcase
 */
export const LoadingStates: Story = {
  args: {
    data: [],
    xKey: 'month',
    series: seriesConfigs.executive,
    title: 'Loading Dashboard Data',
    loading: {
      loading: true,
      skeletonType: 'shimmer',
      message: 'Fetching latest metrics...',
    },
    height: 350,
  },
  parameters: {
    docs: {
      description: {
        story: 'Elegant loading states with shimmer animation while data is being fetched.',
      },
    },
  },
};

/**
 * Error State Handling
 */
export const ErrorState: Story = {
  args: {
    data: [],
    xKey: 'month',
    series: seriesConfigs.executive,
    title: 'Dashboard Error Demo',
    error: {
      error: true,
      message: 'Failed to load revenue data from the server',
      showDetails: true,
      onRetry: () => alert('Retrying data fetch...'),
    },
    height: 350,
  },
  parameters: {
    docs: {
      description: {
        story: 'Graceful error handling with retry functionality and user-friendly messaging.',
      },
    },
  },
};

/**
 * Empty State
 */
export const EmptyState: Story = {
  args: {
    data: [],
    xKey: 'month',
    series: seriesConfigs.executive,
    title: 'No Data Available',
    emptyMessage: 'No financial data available for the selected time period',
    height: 300,
  },
  parameters: {
    docs: {
      description: {
        story: 'Clean empty state design when no data is available to display.',
      },
    },
  },
};

/**
 * Interactive Features Demo
 */
export const InteractiveFeatures: Story = {
  args: {
    data: dashboardData.executiveMetrics,
    xKey: 'month',
    series: seriesConfigs.executive,
    title: 'Interactive Chart Features',
    description: 'Try clicking, hovering, and using the brush tool',
    variant: 'premium',
    theme: 'light',
    height: 400,
    yAxisFormatter: formatLargeCurrency,
    interactions: {
      brush: true,
      crosshair: true,
      clickable: true,
      onDataPointClick: (data, index) => {
        alert(`Clicked: ${data.month} - Revenue: ${formatLargeCurrency(data.revenue)}`);
      },
      onSelectionChange: (selection) => {
        console.log('Selection changed:', selection);
      },
    },
    tooltip: {
      enabled: true,
      showChange: true,
      theme: 'glass',
    },
    animations: {
      enabled: true,
      hoverAnimations: true,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Full interactive features including brush selection, data point clicking, and advanced tooltips.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Test clicking on the chart
    const chartContainer = canvas.getByRole('img');
    await userEvent.click(chartContainer);
    
    // Test hover interactions
    await userEvent.hover(chartContainer);
  },
};

/**
 * Responsive Design Showcase
 */
export const ResponsiveDesign: Story = {
  args: {
    data: dashboardData.ecommerceMetrics,
    xKey: 'day',
    series: seriesConfigs.ecommerce.slice(0, 2),
    title: 'Responsive Chart Design',
    description: 'Adapts perfectly to different screen sizes',
    variant: 'default',
    theme: 'light',
    size: 'full',
    width: '100%',
    yAxisFormatter: formatCurrency,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Responsive design that adapts seamlessly across desktop, tablet, and mobile devices.',
      },
    },
  },
};

/**
 * Performance Demo - Large Dataset
 */
export const PerformanceDemo: Story = {
  args: {
    data: Array.from({ length: 365 }, (_, i) => ({
      day: `Day ${i + 1}`,
      value1: Math.sin(i * 0.02) * 1000 + 2000 + Math.random() * 200,
      value2: Math.cos(i * 0.015) * 800 + 1500 + Math.random() * 150,
      value3: Math.sin(i * 0.025) * 600 + 1200 + Math.random() * 100,
    })),
    xKey: 'day',
    series: [
      { dataKey: 'value1', name: 'Metric 1', color: '#3b82f6', strokeWidth: 1 },
      { dataKey: 'value2', name: 'Metric 2', color: '#10b981', strokeWidth: 1 },
      { dataKey: 'value3', name: 'Metric 3', color: '#f59e0b', strokeWidth: 1 },
    ],
    title: 'Performance Test - 365 Data Points',
    description: 'Smooth performance with large datasets',
    variant: 'default',
    theme: 'light',
    height: 350,
    optimized: true,
    animations: {
      enabled: true,
      duration: 2000,
      staggerDelay: 10,
    },
    interactions: {
      brush: true,
      zoom: true,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Performance optimization showcase handling 365 data points with smooth animations and interactions.',
      },
    },
  },
};

/**
 * Custom Styling Playground
 */
export const CustomStyling: Story = {
  args: {
    data: dashboardData.tradingMetrics,
    xKey: 'time',
    series: [
      { 
        dataKey: 'sp500', 
        name: 'S&P 500', 
        color: '#8b5cf6',
        strokeWidth: 4,
        strokeDasharray: '10 5',
        showDots: true,
        curveType: 'cardinal',
      },
      { 
        dataKey: 'nasdaq', 
        name: 'NASDAQ', 
        color: '#06b6d4',
        strokeWidth: 2,
        smooth: true,
        showGradient: true,
      },
    ],
    title: 'Custom Styling Demo',
    description: 'Explore different line styles, colors, and effects',
    variant: 'premium',
    theme: 'light',
    height: 350,
    yAxisFormatter: formatNumber,
    palette: ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'],
    grid: {
      enabled: true,
      opacity: 0.2,
      color: '#e5e7eb',
      strokeDasharray: '5 5',
    },
    animations: {
      enabled: true,
      duration: 1500,
      easing: 'ease-in-out',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Playground for exploring different styling options including custom colors, line styles, and effects.',
      },
    },
  },
};

/**
 * Visual Regression Test Scenarios
 * Used for automated visual testing with Chromatic
 */
export const VisualRegressionSuite: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
      <div>
        <h3>Light Theme - Executive</h3>
        <LineChart
          data={dashboardData.executiveMetrics.slice(0, 6)}
          xKey="month"
          series={seriesConfigs.executive}
          variant="premium"
          theme="light"
          height={250}
          yAxisFormatter={formatLargeCurrency}
        />
      </div>
      
      <div>
        <h3>Dark Theme - SaaS</h3>
        <LineChart
          data={dashboardData.saasMetrics}
          xKey="week"
          series={seriesConfigs.saas}
          variant="kpi"
          theme="dark"
          height={250}
          yAxisFormatter={formatLargeCurrency}
        />
      </div>
      
      <div>
        <h3>Minimal Design</h3>
        <LineChart
          data={dashboardData.ecommerceMetrics.slice(0, 5)}
          xKey="day"
          series={[{ dataKey: 'revenue', name: 'Revenue', color: '#6366f1' }]}
          variant="minimal"
          theme="light"
          height={200}
          grid={false}
          legend={false}
        />
      </div>
      
      <div>
        <h3>High Contrast</h3>
        <LineChart
          data={dashboardData.systemMetrics}
          xKey="timestamp"
          series={[{ dataKey: 'cpu', name: 'CPU Usage', color: '#ffffff', strokeWidth: 3 }]}
          variant="default"
          theme="high-contrast"
          height={200}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive visual regression test suite covering all major theme and variant combinations.',
      },
    },
    chromatic: { 
      modes: {
        light: { theme: 'light' },
        dark: { theme: 'dark' },
      },
    },
  },
};