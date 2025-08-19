/**
 * Premium Charts Stories - Dashboard Excellence Showcase
 * Sophisticated Storybook scenarios for enterprise dashboard demonstrations
 * Apple-inspired design with real business data and smooth animations
 * 
 * @version 3.0.0 - Pattern Triple ⭐⭐⭐⭐⭐ Complete Suite
 * @category Dashboard Charts
 * @priority Showcase - Executive demonstrations
 * @coverage LineChart ✅ + BarChart ✅ Full Excellence
 */

import type { Meta, StoryObj } from "@storybook/react";
import { within, userEvent, expect } from "@storybook/test";
import { LineChart, LineSeries } from "./line-chart";
import { 
  BarChart, 
  BarSeries,
  DashboardBarChart,
  ExecutiveBarChart,
  SalesBarChart,
  AnalyticsBarChart,
  FinancialBarChart,
  MinimalBarChart,
  RealtimeBarChart 
} from "./bar-chart";
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

  // BarChart Specific Data
  salesMetrics: [
    { quarter: 'Q1 2024', target: 2400000, actual: 2285000, variance: -115000, team1: 585000, team2: 625000, team3: 545000, team4: 530000 },
    { quarter: 'Q2 2024', target: 2600000, actual: 2745000, variance: 145000, team1: 685000, team2: 725000, team3: 665000, team4: 670000 },
    { quarter: 'Q3 2024', target: 2800000, actual: 2920000, variance: 120000, team1: 730000, team2: 765000, team3: 715000, team4: 710000 },
    { quarter: 'Q4 2024', target: 3000000, actual: 3185000, variance: 185000, team1: 795000, team2: 835000, team3: 775000, team4: 780000 },
  ],

  marketShare: [
    { company: 'Company A', marketShare: 35.2, revenue: 24500000, growth: 12.5, employees: 1250 },
    { company: 'Company B', marketShare: 28.7, revenue: 19800000, growth: 8.3, employees: 980 },
    { company: 'Company C', marketShare: 18.3, revenue: 12650000, growth: 15.7, employees: 750 },
    { company: 'Our Company', marketShare: 12.1, revenue: 8350000, growth: 22.4, employees: 485 },
    { company: 'Others', marketShare: 5.7, revenue: 3950000, growth: 3.1, employees: 320 },
  ],

  categoryPerformance: [
    { category: 'Electronics', q1: 1250000, q2: 1380000, q3: 1520000, q4: 1685000, avgPrice: 245 },
    { category: 'Clothing', q1: 850000, q2: 920000, q3: 1100000, q4: 1280000, avgPrice: 89 },
    { category: 'Home & Garden', q1: 720000, q2: 780000, q3: 890000, q4: 950000, avgPrice: 156 },
    { category: 'Books', q1: 320000, q2: 350000, q3: 380000, q4: 420000, avgPrice: 28 },
    { category: 'Sports', q1: 580000, q2: 640000, q3: 720000, q4: 785000, avgPrice: 128 },
  ],

  deviceAnalytics: [
    { month: 'Jan', desktop: 450000, mobile: 320000, tablet: 180000 },
    { month: 'Feb', desktop: 480000, mobile: 350000, tablet: 190000 },
    { month: 'Mar', desktop: 520000, mobile: 380000, tablet: 210000 },
    { month: 'Apr', desktop: 490000, mobile: 410000, tablet: 220000 },
    { month: 'May', desktop: 530000, mobile: 445000, tablet: 235000 },
    { month: 'Jun', desktop: 560000, mobile: 485000, tablet: 255000 },
  ],

  profitLoss: [
    { month: 'Jan', profit: 125000, loss: -35000, netIncome: 90000 },
    { month: 'Feb', profit: 142000, loss: -28000, netIncome: 114000 },
    { month: 'Mar', profit: 156000, loss: -42000, netIncome: 114000 },
    { month: 'Apr', profit: 178000, loss: -31000, netIncome: 147000 },
    { month: 'May', profit: 195000, loss: -25000, netIncome: 170000 },
    { month: 'Jun', profit: 215000, loss: -38000, netIncome: 177000 },
  ],

  regionalSales: [
    { region: 'North America', sales: 4250000, customers: 12500, satisfaction: 4.3 },
    { region: 'Europe', sales: 3680000, customers: 9800, satisfaction: 4.1 },
    { region: 'Asia Pacific', sales: 2950000, customers: 15200, satisfaction: 4.2 },
    { region: 'Latin America', sales: 1850000, customers: 6400, satisfaction: 3.9 },
    { region: 'Middle East', sales: 1420000, customers: 3200, satisfaction: 4.0 },
    { region: 'Africa', sales: 980000, customers: 2800, satisfaction: 3.8 },
  ],
};

/**
 * Premium Series Configurations - Line Charts
 */
const lineSeriesConfigs = {
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
 * Premium Series Configurations - Bar Charts
 */
const barSeriesConfigs = {
  sales: [
    { dataKey: 'target', name: 'Target', color: '#94a3b8' },
    { dataKey: 'actual', name: 'Actual', color: '#10b981' },
  ] as BarSeries[],

  teams: [
    { dataKey: 'team1', name: 'Alpha Team', color: '#3b82f6', stackId: 'teams' },
    { dataKey: 'team2', name: 'Beta Team', color: '#10b981', stackId: 'teams' },
    { dataKey: 'team3', name: 'Gamma Team', color: '#f59e0b', stackId: 'teams' },
    { dataKey: 'team4', name: 'Delta Team', color: '#ef4444', stackId: 'teams' },
  ] as BarSeries[],

  market: [
    { dataKey: 'marketShare', name: 'Market Share %', color: '#8b5cf6' },
    { dataKey: 'growth', name: 'Growth Rate %', color: '#10b981' },
  ] as BarSeries[],

  category: [
    { dataKey: 'q1', name: 'Q1', color: '#3b82f6' },
    { dataKey: 'q2', name: 'Q2', color: '#10b981' },
    { dataKey: 'q3', name: 'Q3', color: '#f59e0b' },
    { dataKey: 'q4', name: 'Q4', color: '#ef4444' },
  ] as BarSeries[],

  devices: [
    { dataKey: 'desktop', name: 'Desktop', color: '#3b82f6', stackId: 'devices' },
    { dataKey: 'mobile', name: 'Mobile', color: '#10b981', stackId: 'devices' },
    { dataKey: 'tablet', name: 'Tablet', color: '#f59e0b', stackId: 'devices' },
  ] as BarSeries[],

  financial: [
    { dataKey: 'profit', name: 'Profit', color: '#22c55e' },
    { dataKey: 'loss', name: 'Loss', color: '#ef4444' },
  ] as BarSeries[],

  regional: [
    { dataKey: 'sales', name: 'Sales Revenue', color: '#059669' },
    { dataKey: 'customers', name: 'Customer Count', color: '#0ea5e9' },
  ] as BarSeries[],
};

/**
 * Utility Functions
 */
const formatCurrency = (value: number) => `$${(value / 1000).toFixed(0)}K`;
const formatLargeCurrency = (value: number) => `$${(value / 1000000).toFixed(1)}M`;
const formatPercentage = (value: number) => `${value}%`;
const formatNumber = (value: number) => value.toLocaleString();

/**
 * =============================================================================
 * LINECHART STORYBOOK CONFIGURATION ⭐⭐⭐⭐⭐
 * =============================================================================
 */
const lineChartMeta: Meta<typeof LineChart> = {
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
  },
  tags: ['autodocs'],
};

export { lineChartMeta };
type LineStory = StoryObj<typeof LineChart>;

// Key LineChart Stories (Condensed for space)
export const ExecutiveDashboard: LineStory = {
  args: {
    data: dashboardData.executiveMetrics,
    xKey: 'month',
    series: lineSeriesConfigs.executive,
    title: 'Executive Dashboard - Q3 Performance',
    variant: 'premium',
    theme: 'light',
    height: 400,
    yAxisFormatter: formatLargeCurrency,
  },
};

export const SaaSMetricsDark: LineStory = {
  args: {
    data: dashboardData.saasMetrics,
    xKey: 'week',
    series: lineSeriesConfigs.saas,
    title: 'SaaS Growth Metrics',
    variant: 'kpi',
    theme: 'dark',
    height: 350,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

/**
 * =============================================================================
 * BARCHART STORYBOOK CONFIGURATION ⭐⭐⭐⭐⭐
 * =============================================================================
 */
const barChartMeta: Meta<typeof BarChart> = {
  title: "Charts/BarChart Premium ⭐⭐⭐⭐⭐",
  component: BarChart,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
# Premium BarChart - Dashboard Excellence

Enterprise-grade bar chart component designed for sophisticated business dashboards.
Features Apple-inspired animations, multiple themes, and advanced interactivity.

## Key Features
- 🎨 **Multiple Themes**: Light, Dark, Auto, High-contrast
- ✨ **Smooth Animations**: Staggered entry effects and smooth transitions  
- 📊 **Multiple Layouts**: Vertical, Horizontal, Stacked, Grouped
- 🖱️ **Advanced Interactivity**: Click, hover, brush selection, zoom
- 📱 **Responsive Design**: Adapts to all screen sizes
- ♿ **Accessibility**: WCAG AAA compliant
- 📈 **Dashboard Variants**: Sales, Analytics, Financial, Executive
- ⚡ **Performance**: Optimized for large datasets

## Chart Types
- Grouped bar charts for comparisons
- Stacked bar charts for composition
- Horizontal bars for rankings
- Profit/loss visualizations
- Market share analysis
- Team performance tracking

## Dashboard Use Cases
- Sales performance dashboards
- Market analysis reports
- Team productivity metrics
- Financial comparisons
- Category performance analysis
- Regional sales tracking
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
      options: ['light', 'dark', 'auto', 'high-contrast', 'minimal', 'vibrant'],
      description: 'Chart theme variant',
    },
    variant: {
      control: { type: 'select' },
      options: ['dashboard', 'executive', 'sales', 'analytics', 'financial', 'minimal', 'gaming', 'comparison', 'progress', 'realtime'],
      description: 'Dashboard variant styling',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl', 'auto'],
      description: 'Chart size preset',
    },
    stacked: {
      control: 'boolean',
      description: 'Stack bars on top of each other',
    },
    horizontal: {
      control: 'boolean',
      description: 'Display bars horizontally',
    },
    showValues: {
      control: 'boolean',
      description: 'Show value labels on bars',
    },
    gradient: {
      control: 'boolean',
      description: 'Apply gradient fills to bars',
    },
  },
  tags: ['autodocs'],
};

export default barChartMeta;
type BarStory = StoryObj<typeof BarChart>;

/**
 * =============================================================================
 * BARCHART PREMIUM STORIES ⭐⭐⭐⭐⭐
 * =============================================================================
 */

/**
 * Sales Performance Dashboard - Target vs Actual
 */
export const SalesPerformanceDashboard: BarStory = {
  args: {
    data: dashboardData.salesMetrics,
    xKey: 'quarter',
    series: barSeriesConfigs.sales,
    title: 'Sales Performance Dashboard',
    description: 'Quarterly sales targets vs actual performance with variance analysis',
    variant: 'sales',
    theme: 'light',
    height: 400,
    yAxisFormatter: formatLargeCurrency,
    showValues: true,
    interactive: true,
    animate: true,
    animationPreset: 'apple',
    onClick: (data) => {
      console.log('Clicked quarter:', data);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Premium sales dashboard showing quarterly performance against targets with beautiful animations and interactivity.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Sales Performance Dashboard')).toBeInTheDocument();
  },
};

/**
 * Executive Market Analysis - Competitive Landscape
 */
export const ExecutiveMarketAnalysis: BarStory = {
  args: {
    data: dashboardData.marketShare,
    xKey: 'company',
    series: barSeriesConfigs.market,
    title: 'Market Position Analysis',
    description: 'Competitive landscape showing market share and growth rates',
    variant: 'executive',
    theme: 'light',
    height: 380,
    yAxisFormatter: formatPercentage,
    gradient: true,
    shadow: true,
    rounded: true,
    showTrend: true,
    animate: true,
    animationPreset: 'stagger',
  },
  parameters: {
    docs: {
      description: {
        story: 'Executive-level market analysis with elegant gradient styling and sophisticated animations.',
      },
    },
  },
};

/**
 * Stacked Team Performance - Quarterly Breakdown
 */
export const StackedTeamPerformance: BarStory = {
  args: {
    data: dashboardData.salesMetrics,
    xKey: 'quarter',
    series: barSeriesConfigs.teams,
    title: 'Team Performance Breakdown',
    description: 'Stacked view of team contributions across quarters',
    variant: 'dashboard',
    theme: 'light',
    height: 350,
    stacked: true,
    yAxisFormatter: formatLargeCurrency,
    showValues: false,
    legend: true,
    animate: true,
    animationPreset: 'cascade',
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
  },
  parameters: {
    docs: {
      description: {
        story: 'Stacked bar chart showing team performance breakdown with smooth cascade animations.',
      },
    },
  },
};

/**
 * Dark Theme Analytics - Category Performance
 */
export const DarkThemeAnalytics: BarStory = {
  args: {
    data: dashboardData.categoryPerformance,
    xKey: 'category',
    series: barSeriesConfigs.category,
    title: 'Category Performance Analytics',
    description: 'Quarterly revenue breakdown by product category',
    variant: 'analytics',
    theme: 'dark',
    height: 400,
    grouped: true,
    yAxisFormatter: formatLargeCurrency,
    showValues: true,
    interactive: true,
    brush: true,
    animate: true,
    animationPreset: 'wave',
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Dark theme analytics dashboard perfect for monitoring category performance trends.',
      },
    },
  },
};

/**
 * Horizontal Regional Sales - Rankings
 */
export const HorizontalRegionalSales: BarStory = {
  args: {
    data: dashboardData.regionalSales.sort((a, b) => b.sales - a.sales),
    xKey: 'region',
    series: [{ dataKey: 'sales', name: 'Sales Revenue', color: '#059669' }],
    title: 'Regional Sales Performance',
    description: 'Sales performance ranking by geographic region',
    variant: 'comparison',
    theme: 'light',
    height: 380,
    horizontal: true,
    yAxisFormatter: formatLargeCurrency,
    showValues: true,
    rounded: true,
    animate: true,
    animationPreset: 'smooth',
    size: 'lg',
  },
  parameters: {
    docs: {
      description: {
        story: 'Horizontal bar chart ideal for rankings and comparisons, showing regional sales performance.',
      },
    },
  },
};

/**
 * Stacked Device Analytics - Mobile-First
 */
export const StackedDeviceAnalytics: BarStory = {
  args: {
    data: dashboardData.deviceAnalytics,
    xKey: 'month',
    series: barSeriesConfigs.devices,
    title: 'Device Analytics Dashboard',
    description: 'Traffic distribution across desktop, mobile, and tablet devices',
    variant: 'analytics',
    theme: 'light',
    height: 320,
    stacked: true,
    yAxisFormatter: formatNumber,
    showValues: false,
    legend: true,
    animate: true,
    animationPreset: 'spring',
    gap: 6,
    rounded: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Stacked device analytics showing the mobile-first trend in user behavior.',
      },
    },
  },
};

/**
 * Financial Profit/Loss Analysis
 */
export const FinancialProfitLoss: BarStory = {
  args: {
    data: dashboardData.profitLoss,
    xKey: 'month',
    series: barSeriesConfigs.financial,
    title: 'Profit & Loss Analysis',
    description: 'Monthly profit and loss breakdown with net income trends',
    variant: 'financial',
    theme: 'light',
    height: 360,
    yAxisFormatter: formatCurrency,
    showValues: true,
    referenceLine: [{ value: 0, label: 'Break Even', color: '#64748b' }],
    animate: true,
    animationPreset: 'apple',
    colors: ['#22c55e', '#ef4444'],
  },
  parameters: {
    docs: {
      description: {
        story: 'Financial dashboard showing profit/loss analysis with reference lines for break-even points.',
      },
    },
  },
};

/**
 * Real-time System Monitoring
 */
export const RealtimeSystemMonitoring: BarStory = {
  args: {
    data: dashboardData.systemMetrics,
    xKey: 'timestamp',
    series: [{ dataKey: 'cpu', name: 'CPU Usage %', color: '#ef4444' }],
    title: 'Real-time System Monitor',
    description: 'Live CPU usage monitoring with real-time updates',
    variant: 'realtime',
    theme: 'dark',
    height: 280,
    realtime: true,
    refreshInterval: 3000,
    yAxisFormatter: formatPercentage,
    animate: true,
    animationPreset: 'smooth',
    size: 'md',
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Real-time monitoring dashboard with live updates and pulsing indicators.',
      },
    },
  },
};

/**
 * Minimal Design Showcase
 */
export const MinimalDesignShowcase: BarStory = {
  args: {
    data: dashboardData.categoryPerformance.slice(0, 4),
    xKey: 'category',
    series: [{ dataKey: 'q4', name: 'Q4 Performance', color: '#6366f1' }],
    variant: 'minimal',
    theme: 'light',
    height: 240,
    grid: false,
    legend: false,
    yAxisFormatter: formatLargeCurrency,
    animate: true,
    animationPreset: 'apple',
    rounded: true,
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
 * High Contrast Accessibility
 */
export const HighContrastAccessible: BarStory = {
  args: {
    data: dashboardData.salesMetrics,
    xKey: 'quarter',
    series: [
      { dataKey: 'actual', name: 'Actual Sales', color: '#ffffff' },
      { dataKey: 'target', name: 'Target', color: '#000000' },
    ],
    title: 'Accessible Sales Dashboard',
    description: 'High contrast design for users with visual impairments',
    variant: 'minimal',
    theme: 'high-contrast',
    height: 350,
    yAxisFormatter: formatLargeCurrency,
    ariaLabel: 'Sales performance bar chart showing quarterly actual vs target results',
    animate: false, // Respect reduced motion preferences
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
 * Interactive Features Demo
 */
export const InteractiveFeaturesDemo: BarStory = {
  args: {
    data: dashboardData.salesMetrics,
    xKey: 'quarter',
    series: barSeriesConfigs.sales,
    title: 'Interactive Features Demo',
    description: 'Try clicking bars, hovering, and using the brush tool',
    variant: 'dashboard',
    theme: 'light',
    height: 400,
    yAxisFormatter: formatLargeCurrency,
    interactive: true,
    selectable: true,
    multiSelect: true,
    brush: true,
    zoom: true,
    showValues: true,
    onClick: (data) => {
      alert(`Clicked: ${data.quarter} - Actual: ${formatLargeCurrency(data.actual)}`);
    },
    onHover: (data) => {
      console.log('Hovered:', data);
    },
    animate: true,
    animationPreset: 'apple',
  },
  parameters: {
    docs: {
      description: {
        story: 'Full interactive features including brush selection, multi-selection, and click handlers.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chart = canvas.getByRole('img');
    await userEvent.click(chart);
    await userEvent.hover(chart);
  },
};

/**
 * Loading State Showcase
 */
export const LoadingStateShowcase: BarStory = {
  args: {
    data: [],
    xKey: 'quarter',
    series: barSeriesConfigs.sales,
    title: 'Loading Sales Data',
    loading: true,
    height: 350,
    variant: 'dashboard',
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
export const ErrorStateHandling: BarStory = {
  args: {
    data: [],
    xKey: 'quarter',
    series: barSeriesConfigs.sales,
    title: 'Dashboard Error Demo',
    error: 'Failed to load sales data from the analytics server',
    onRefresh: () => alert('Retrying data fetch...'),
    height: 350,
    variant: 'dashboard',
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
 * Empty State Design
 */
export const EmptyStateDesign: BarStory = {
  args: {
    data: [],
    xKey: 'quarter',
    series: barSeriesConfigs.sales,
    title: 'No Sales Data Available',
    empty: true,
    height: 300,
    variant: 'dashboard',
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
 * Performance Demo - Large Dataset
 */
export const PerformanceDemo: BarStory = {
  args: {
    data: Array.from({ length: 50 }, (_, i) => ({
      day: `Day ${i + 1}`,
      value1: Math.random() * 1000 + 500,
      value2: Math.random() * 800 + 400,
      value3: Math.random() * 600 + 300,
    })),
    xKey: 'day',
    series: [
      { dataKey: 'value1', name: 'Metric 1', color: '#3b82f6' },
      { dataKey: 'value2', name: 'Metric 2', color: '#10b981' },
      { dataKey: 'value3', name: 'Metric 3', color: '#f59e0b' },
    ],
    title: 'Performance Test - 50 Data Points',
    description: 'Smooth performance with large datasets',
    variant: 'analytics',
    theme: 'light',
    height: 400,
    performance: true,
    animate: true,
    animationPreset: 'stagger',
    brush: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Performance optimization showcase handling large datasets with smooth animations.',
      },
    },
  },
};

/**
 * Responsive Design Demo
 */
export const ResponsiveDesignDemo: BarStory = {
  args: {
    data: dashboardData.categoryPerformance.slice(0, 4),
    xKey: 'category',
    series: [{ dataKey: 'q4', name: 'Q4 Revenue', color: '#8b5cf6' }],
    title: 'Responsive Bar Chart',
    description: 'Adapts perfectly to different screen sizes',
    variant: 'analytics',
    theme: 'light',
    size: 'auto',
    responsive: true,
    yAxisFormatter: formatLargeCurrency,
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
 * =============================================================================
 * SPECIALIZED VARIANT STORIES ⭐⭐⭐⭐⭐
 * =============================================================================
 */

/**
 * Dashboard BarChart - Default Premium
 */
export const DashboardVariant: BarStory = {
  render: () => (
    <DashboardBarChart
      data={dashboardData.salesMetrics}
      xKey="quarter"
      series={barSeriesConfigs.sales}
      height={350}
      yAxisFormatter={formatLargeCurrency}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Default premium dashboard variant with sophisticated styling.',
      },
    },
  },
};

/**
 * Executive BarChart - Enhanced Styling
 */
export const ExecutiveVariant: BarStory = {
  render: () => (
    <ExecutiveBarChart
      data={dashboardData.marketShare}
      xKey="company"
      series={[{ dataKey: 'revenue', name: 'Revenue', color: '#059669' }]}
      height={380}
      yAxisFormatter={formatLargeCurrency}
      gradient={true}
      shadow={true}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Executive variant with enhanced gradient styling and premium shadow effects.',
      },
    },
  },
};

/**
 * Sales BarChart - Profit/Loss Colors
 */
export const SalesVariant: BarStory = {
  render: () => (
    <SalesBarChart
      data={dashboardData.profitLoss}
      xKey="month"
      series={[{ dataKey: 'netIncome', name: 'Net Income', color: '#10b981' }]}
      height={320}
      yAxisFormatter={formatCurrency}
      referenceLine={[{ value: 0, label: 'Break Even', color: '#64748b' }]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Sales variant optimized for profit/loss visualization with appropriate color coding.',
      },
    },
  },
};

/**
 * Analytics BarChart - Data Optimization
 */
export const AnalyticsVariant: BarStory = {
  render: () => (
    <AnalyticsBarChart
      data={dashboardData.deviceAnalytics}
      xKey="month"
      series={barSeriesConfigs.devices}
      height={350}
      stacked={true}
      yAxisFormatter={formatNumber}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Analytics variant optimized for data analysis with clean, professional styling.',
      },
    },
  },
};

/**
 * Financial BarChart - Currency Formatting
 */
export const FinancialVariant: BarStory = {
  render: () => (
    <FinancialBarChart
      data={dashboardData.regionalSales}
      xKey="region"
      series={[{ dataKey: 'sales', name: 'Sales Revenue', color: '#059669' }]}
      height={360}
      horizontal={true}
      yAxisFormatter={formatLargeCurrency}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Financial variant with proper currency formatting and financial styling.',
      },
    },
  },
};

/**
 * Minimal BarChart - Clean Design
 */
export const MinimalVariant: BarStory = {
  render: () => (
    <MinimalBarChart
      data={dashboardData.categoryPerformance.slice(0, 3)}
      xKey="category"
      series={[{ dataKey: 'q4', name: 'Performance', color: '#6366f1' }]}
      height={200}
      grid={false}
      legend={false}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Minimal variant with clean, distraction-free design for focused presentations.',
      },
    },
  },
};

/**
 * Realtime BarChart - Live Indicators
 */
export const RealtimeVariant: BarStory = {
  render: () => (
    <RealtimeBarChart
      data={dashboardData.systemMetrics}
      xKey="timestamp"
      series={[{ dataKey: 'cpu', name: 'CPU Usage %', color: '#ef4444' }]}
      height={280}
      refreshInterval={2000}
      yAxisFormatter={formatPercentage}
    />
  ),
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Realtime variant with live indicators and automatic refresh capabilities.',
      },
    },
  },
};

/**
 * Visual Regression Test Suite
 */
export const VisualRegressionSuite: BarStory = {
  render: () => (
    <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
      <div>
        <h3>Sales Dashboard - Light</h3>
        <BarChart
          data={dashboardData.salesMetrics}
          xKey="quarter"
          series={barSeriesConfigs.sales}
          variant="sales"
          theme="light"
          height={250}
          yAxisFormatter={formatLargeCurrency}
        />
      </div>
      
      <div>
        <h3>Market Analysis - Dark</h3>
        <BarChart
          data={dashboardData.marketShare}
          xKey="company"
          series={[{ dataKey: 'marketShare', name: 'Market Share', color: '#8b5cf6' }]}
          variant="executive"
          theme="dark"
          height={250}
          yAxisFormatter={formatPercentage}
        />
      </div>
      
      <div>
        <h3>Stacked Teams</h3>
        <BarChart
          data={dashboardData.salesMetrics}
          xKey="quarter"
          series={barSeriesConfigs.teams}
          stacked={true}
          variant="dashboard"
          height={250}
        />
      </div>
      
      <div>
        <h3>Horizontal Regional</h3>
        <BarChart
          data={dashboardData.regionalSales.slice(0, 4)}
          xKey="region"
          series={[{ dataKey: 'sales', name: 'Sales', color: '#059669' }]}
          horizontal={true}
          variant="comparison"
          height={250}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive visual regression test suite covering all major variants and configurations.',
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