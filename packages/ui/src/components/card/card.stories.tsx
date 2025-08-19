import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "./index";
import { Button } from "../button";

/**
 * 🃏 CARD PATTERN TRIPLE ⭐⭐⭐⭐⭐ - APPLE-STYLE DASHBOARD SHOWCASE
 * 
 * Premium Storybook showcase for enterprise-grade Card components
 * Demonstrating all 6 business variants, 4 themes, and Apple-style excellence
 * 
 * @version 1.0.1-beta.2
 * @showcase Apple-style Dashboard focused
 * @stories 15+ interactive demos
 * 
 * FEATURES SHOWCASED:
 * ✨ 6 Business Variants (Executive, Analytics, Finance, KPI, Dashboard, Minimal)
 * 🎨 4 Premium Themes (Apple-glass, Dark Executive, Light Premium, High-contrast)
 * 🚀 Animation & Interaction Systems
 * 📱 Responsive Excellence
 * 🎯 Real Dashboard Scenarios
 * 💼 Executive-grade Presentations
 */

const meta: Meta<typeof Card> = {
  title: "🃏 Card Pattern Triple ⭐⭐⭐⭐⭐",
  component: Card,
  parameters: { 
    layout: "centered",
    docs: {
      description: {
        component: `
# 🃏 Card Pattern Triple ⭐⭐⭐⭐⭐ - Apple-style Dashboard Excellence

Enterprise-grade card containers optimized for premium dashboards and executive views.

## 🏢 Business Variants

- **Executive**: Premium glass containers for C-level dashboards
- **Analytics**: Data-focused cards with subtle highlights  
- **Finance**: Professional financial metrics containers
- **KPI**: Compact high-impact metric displays
- **Dashboard**: General purpose Apple-style widgets
- **Minimal**: Clean focus cards for key metrics

## 🎨 Theme System

- **Apple Glass**: Signature translucent style with backdrop blur
- **Dark Executive**: Premium dark theme for sophisticated UIs
- **Light Premium**: Elegant light theme with subtle gradients
- **High Contrast**: Accessibility-optimized high contrast mode

## 📏 Dashboard Optimized Sizes

- **kpi-compact**: Perfect for KPI widgets (120px min-height)
- **widget-standard**: Standard dashboard widgets (200px min-height)
- **metric-large**: Detailed metrics containers (300px min-height)
- **executive-full**: C-level dashboard containers (400px min-height)
        `
      }
    }
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["executive", "analytics", "finance", "kpi", "dashboard", "minimal"],
      description: "Business variant for specific dashboard contexts",
    },
    theme: {
      control: { type: "select" },
      options: ["apple-glass", "dark-executive", "light-premium", "high-contrast"],
      description: "Theme variant for visual consistency",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "xl", "kpi-compact", "widget-standard", "metric-large", "executive-full"],
      description: "Size variant for different container needs",
    },
    animation: {
      control: { type: "select" },
      options: ["none", "subtle", "smooth", "premium", "bounce"],
      description: "Animation style for interactions",
    },
    interactive: {
      control: { type: "select" },
      options: ["none", "hover", "clickable", "draggable"],
      description: "Interactive behavior",
    },
    glassEffect: {
      control: { type: "boolean" },
      description: "Apple-style glass effect overlay",
    },
    gradientBg: {
      control: { type: "boolean" },
      description: "Premium gradient background",
    },
    highContrast: {
      control: { type: "boolean" },
      description: "Accessibility optimizations",
    },
    performanceMode: {
      control: { type: "boolean" },
      description: "Performance mode (reduced animations)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

// 🎮 PLAYGROUND - INTERACTIVE CONFIGURATION
export const Playground: Story = {
  args: {
    variant: "dashboard",
    size: "md",
    animation: "smooth",
    interactive: "none",
    glassEffect: false,
    gradientBg: false,
    highContrast: false,
    performanceMode: false,
  },
  render: (args) => (
    <Card {...args} className="w-96">
      <CardHeader>
        <CardTitle>Interactive Playground</CardTitle>
        <CardDescription>
          Experiment with all Card Pattern Triple features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Use the controls panel to explore different variants, themes, sizes, and effects.
          This playground demonstrates the full flexibility of the Card Pattern Triple system.
        </p>
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span>🎯 Variant: {args.variant}</span>
          <span>•</span>
          <span>📏 Size: {args.size}</span>
          {args.theme && (
            <>
              <span>•</span>
              <span>🎨 Theme: {args.theme}</span>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="default">
          Explore More
        </Button>
      </CardFooter>
    </Card>
  ),
};

// 👑 EXECUTIVE VARIANT SHOWCASE
export const ExecutiveShowcase: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      {/* Executive KPI */}
      <Card variant="executive" size="kpi-compact" glassEffect interactive="hover">
        <CardContent variant="kpi">
          <div className="text-center">
            <CardTitle variant="kpi" className="text-3xl">€2.4M</CardTitle>
            <CardDescription variant="executive">Revenue YTD</CardDescription>
            <div className="text-green-600 font-semibold text-sm mt-1">+12.5%</div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Metrics */}
      <Card variant="executive" size="widget-standard" animation="premium">
        <CardHeader variant="executive">
          <CardTitle variant="executive">Executive Summary</CardTitle>
          <CardDescription variant="executive">
            Q3 2025 Performance Overview
          </CardDescription>
        </CardHeader>
        <CardContent variant="executive">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">€892K</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Profit</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">37.2%</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Margin</div>
            </div>
          </div>
        </CardContent>
        <CardFooter variant="executive">
          <Button variant="default" size="sm">View Report</Button>
        </CardFooter>
      </Card>

      {/* Executive with Apple Glass Theme */}
      <Card variant="executive" theme="apple-glass" size="metric-large" className="md:col-span-2">
        <CardHeader variant="executive">
          <CardTitle variant="executive">C-Level Dashboard</CardTitle>
          <CardDescription variant="executive">
            Premium glass container with Apple-style sophistication
          </CardDescription>
        </CardHeader>
        <CardContent variant="executive">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold">45.6K</div>
              <div className="text-xs text-slate-600 dark:text-slate-300">Users</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">€1.2M</div>
              <div className="text-xs text-slate-600 dark:text-slate-300">ARR</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">94.2%</div>
              <div className="text-xs text-slate-600 dark:text-slate-300">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">4.8★</div>
              <div className="text-xs text-slate-600 dark:text-slate-300">Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Executive variant showcases premium glass containers designed for C-level dashboards with sophisticated styling and glass morphism effects."
      }
    }
  }
};

// 📊 ANALYTICS VARIANT SHOWCASE  
export const AnalyticsShowcase: Story = {
  render: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
      {/* User Engagement Analytics */}
      <Card variant="analytics" size="widget-standard" animation="premium">
        <CardHeader variant="analytics">
          <CardTitle>User Engagement</CardTitle>
          <CardDescription>Last 30 days performance metrics</CardDescription>
        </CardHeader>
        <CardContent variant="analytics">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Active Users</span>
              <span className="font-semibold">45,629</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '68%' }}></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Sessions</span>
              <span className="font-semibold">127,892</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '84%' }}></div>
            </div>
          </div>
        </CardContent>
        <CardFooter variant="analytics">
          <Button variant="outline" size="sm">View Details</Button>
        </CardFooter>
      </Card>

      {/* Conversion Analytics */}
      <Card variant="analytics" size="widget-standard" interactive="hover">
        <CardHeader variant="analytics">
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>Sales pipeline analytics</CardDescription>
        </CardHeader>
        <CardContent variant="analytics">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Visitors</span>
              </div>
              <span className="font-semibold">12,450</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Leads</span>
              </div>
              <span className="font-semibold">2,890</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Opportunities</span>
              </div>
              <span className="font-semibold">567</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Customers</span>
              </div>
              <span className="font-semibold">89</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Dashboard Grid */}
      <Card variant="analytics" size="metric-large" className="lg:col-span-2">
        <CardHeader variant="analytics">
          <CardTitle>Analytics Dashboard Overview</CardTitle>
          <CardDescription>Comprehensive data visualization container</CardDescription>
        </CardHeader>
        <CardContent variant="analytics">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">4.2%</div>
              <div className="text-sm text-slate-600">Conversion Rate</div>
              <div className="text-xs text-green-600">+0.3% from last week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">2.4s</div>
              <div className="text-sm text-slate-600">Avg. Load Time</div>
              <div className="text-xs text-green-600">-0.2s improvement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">89.5%</div>
              <div className="text-sm text-slate-600">User Retention</div>
              <div className="text-xs text-red-600">-1.1% from last month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">$47.3K</div>
              <div className="text-sm text-slate-600">Avg. Revenue</div>
              <div className="text-xs text-green-600">+8.7% growth</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Analytics variant optimized for data visualization with subtle highlights and professional metrics presentation."
      }
    }
  }
};

// 💰 FINANCE VARIANT SHOWCASE
export const FinanceShowcase: Story = {
  render: () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl">
      {/* Revenue KPI */}
      <Card variant="finance" size="kpi-compact" gradientBg interactive="clickable">
        <CardContent variant="kpi">
          <div className="text-center">
            <CardTitle variant="kpi" className="text-emerald-700">€2.4M</CardTitle>
            <CardDescription>Q3 Revenue</CardDescription>
            <div className="text-emerald-600 font-semibold text-sm mt-1">+12.5% YoY</div>
          </div>
        </CardContent>
      </Card>

      {/* Profit Margin */}
      <Card variant="finance" size="kpi-compact" gradientBg interactive="clickable">
        <CardContent variant="kpi">
          <div className="text-center">
            <CardTitle variant="kpi" className="text-emerald-700">37.2%</CardTitle>
            <CardDescription>Profit Margin</CardDescription>
            <div className="text-emerald-600 font-semibold text-sm mt-1">+2.1% improvement</div>
          </div>
        </CardContent>
      </Card>

      {/* ROI */}
      <Card variant="finance" size="kpi-compact" gradientBg interactive="clickable">
        <CardContent variant="kpi">
          <div className="text-center">
            <CardTitle variant="kpi" className="text-emerald-700">18.7%</CardTitle>
            <CardDescription>ROI</CardDescription>
            <div className="text-emerald-600 font-semibold text-sm mt-1">+1.3% increase</div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Overview */}
      <Card variant="finance" size="metric-large" className="lg:col-span-3">
        <CardHeader variant="finance">
          <CardTitle variant="executive">Q3 2025 Financial Performance</CardTitle>
          <CardDescription variant="executive">
            Comprehensive financial metrics and key performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent variant="finance">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-emerald-800 font-medium">Revenue</div>
              <div className="text-2xl font-bold text-emerald-900">€2.4M</div>
              <div className="text-xs text-emerald-600">+12.5% vs Q2</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-emerald-800 font-medium">Expenses</div>
              <div className="text-2xl font-bold text-emerald-900">€1.5M</div>
              <div className="text-xs text-emerald-600">+8.2% vs Q2</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-emerald-800 font-medium">Net Profit</div>
              <div className="text-2xl font-bold text-emerald-900">€892K</div>
              <div className="text-xs text-emerald-600">+18.7% vs Q2</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-emerald-800 font-medium">Cash Flow</div>
              <div className="text-2xl font-bold text-emerald-900">€1.2M</div>
              <div className="text-xs text-emerald-600">+6.3% vs Q2</div>
            </div>
          </div>
        </CardContent>
        <CardFooter variant="finance">
          <div className="flex space-x-3">
            <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              Download Report
            </Button>
            <Button variant="outline" size="sm">
              Schedule Review
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Finance variant features emerald-themed styling perfect for financial metrics, KPIs, and professional financial presentations."
      }
    }
  }
};

// 🎯 KPI VARIANT SHOWCASE
export const KPIShowcase: Story = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl">
      {/* Primary KPIs */}
      <Card variant="kpi" size="kpi-compact" interactive="hover" animation="bounce">
        <CardContent variant="kpi">
          <div className="text-center">
            <CardTitle variant="kpi" className="text-blue-600">45.6K</CardTitle>
            <CardDescription variant="muted">Active Users</CardDescription>
            <div className="text-green-600 font-semibold text-xs mt-1">↗ +8.2%</div>
          </div>
        </CardContent>
      </Card>

      <Card variant="kpi" size="kpi-compact" interactive="hover" animation="bounce">
        <CardContent variant="kpi">
          <div className="text-center">
            <CardTitle variant="kpi" className="text-purple-600">€1.2M</CardTitle>
            <CardDescription variant="muted">ARR</CardDescription>
            <div className="text-green-600 font-semibold text-xs mt-1">↗ +15.3%</div>
          </div>
        </CardContent>
      </Card>

      <Card variant="kpi" size="kpi-compact" interactive="hover" animation="bounce">
        <CardContent variant="kpi">
          <div className="text-center">
            <CardTitle variant="kpi" className="text-orange-600">94.2%</CardTitle>
            <CardDescription variant="muted">Uptime</CardDescription>
            <div className="text-green-600 font-semibold text-xs mt-1">↗ +0.5%</div>
          </div>
        </CardContent>
      </Card>

      <Card variant="kpi" size="kpi-compact" interactive="hover" animation="bounce">
        <CardContent variant="kpi">
          <div className="text-center">
            <CardTitle variant="kpi" className="text-red-600">2.1s</CardTitle>
            <CardDescription variant="muted">Load Time</CardDescription>
            <div className="text-green-600 font-semibold text-xs mt-1">↘ -0.3s</div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary KPIs */}
      <Card variant="kpi" size="kpi-compact" interactive="clickable">
        <CardContent variant="kpi">
          <div className="text-center">
            <CardTitle variant="kpi" className="text-cyan-600">4.2%</CardTitle>
            <CardDescription variant="muted">Conversion</CardDescription>
            <div className="text-green-600 font-semibold text-xs mt-1">↗ +0.4%</div>
          </div>
        </CardContent>
      </Card>

      <Card variant="kpi" size="kpi-compact" interactive="clickable">
        <CardContent variant="kpi">
          <div className="text-center">
            <CardTitle variant="kpi" className="text-pink-600">89.5%</CardTitle>
            <CardDescription variant="muted">Retention</CardDescription>
            <div className="text-red-600 font-semibold text-xs mt-1">↘ -1.1%</div>
          </div>
        </CardContent>
      </Card>

      <Card variant="kpi" size="kpi-compact" interactive="clickable">
        <CardContent variant="kpi">
          <div className="text-center">
            <CardTitle variant="kpi" className="text-teal-600">4.8★</CardTitle>
            <CardDescription variant="muted">Rating</CardDescription>
            <div className="text-green-600 font-semibold text-xs mt-1">↗ +0.2★</div>
          </div>
        </CardContent>
      </Card>

      <Card variant="kpi" size="kpi-compact" interactive="clickable">
        <CardContent variant="kpi">
          <div className="text-center">
            <CardTitle variant="kpi" className="text-indigo-600">127</CardTitle>
            <CardDescription variant="muted">Countries</CardDescription>
            <div className="text-green-600 font-semibold text-xs mt-1">↗ +12</div>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "KPI variant provides compact, high-impact metric displays perfect for dashboard overviews and executive summaries."
      }
    }
  }
};

// 🏠 DASHBOARD VARIANT SHOWCASE
export const DashboardShowcase: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
      {/* Standard Widget */}
      <Card variant="dashboard" size="widget-standard" animation="smooth">
        <CardHeader variant="dashboard">
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events and updates</CardDescription>
        </CardHeader>
        <CardContent variant="dashboard">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">User signup completed</span>
              <span className="text-xs text-slate-500 ml-auto">2m ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Payment processed</span>
              <span className="text-xs text-slate-500 ml-auto">5m ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">System update deployed</span>
              <span className="text-xs text-slate-500 ml-auto">1h ago</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Performance */}
      <Card variant="dashboard" size="widget-standard" interactive="hover">
        <CardHeader variant="dashboard">
          <CardTitle>Team Performance</CardTitle>
          <CardDescription>Current month statistics</CardDescription>
        </CardHeader>
        <CardContent variant="dashboard">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Tasks Completed</span>
                <span>342/400</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '85.5%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Projects Delivered</span>
                <span>12/15</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter variant="dashboard">
          <Button variant="outline" size="sm">View Details</Button>
        </CardFooter>
      </Card>

      {/* Quick Stats */}
      <Card variant="dashboard" size="widget-standard" gradientBg>
        <CardHeader variant="dashboard">
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>Today's highlights</CardDescription>
        </CardHeader>
        <CardContent variant="dashboard">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold">1,247</div>
              <div className="text-xs text-slate-600">Page Views</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">89</div>
              <div className="text-xs text-slate-600">New Users</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">€5.6K</div>
              <div className="text-xs text-slate-600">Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">4.2%</div>
              <div className="text-xs text-slate-600">Conversion</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Large Dashboard Widget */}
      <Card variant="dashboard" size="metric-large" className="md:col-span-2 lg:col-span-3">
        <CardHeader variant="dashboard">
          <CardTitle>Dashboard Overview</CardTitle>
          <CardDescription>Comprehensive system monitoring and analytics</CardDescription>
        </CardHeader>
        <CardContent variant="dashboard">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-blue-600">99.9%</div>
              <div className="text-sm text-slate-600">System Uptime</div>
              <div className="text-xs text-green-600">Excellent</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-purple-600">2.3GB</div>
              <div className="text-sm text-slate-600">Memory Usage</div>
              <div className="text-xs text-yellow-600">Moderate</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-orange-600">45ms</div>
              <div className="text-sm text-slate-600">API Response</div>
              <div className="text-xs text-green-600">Fast</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-red-600">12K</div>
              <div className="text-sm text-slate-600">Active Sessions</div>
              <div className="text-xs text-green-600">High Traffic</div>
            </div>
          </div>
        </CardContent>
        <CardFooter variant="dashboard">
          <div className="flex space-x-3">
            <Button variant="default" size="sm">Refresh Data</Button>
            <Button variant="outline" size="sm">Export Report</Button>
            <Button variant="ghost" size="sm">Settings</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Dashboard variant offers balanced Apple-style containers perfect for general-purpose widgets and system overviews."
      }
    }
  }
};

// ✨ MINIMAL VARIANT SHOWCASE
export const MinimalShowcase: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
      {/* Clean Metrics */}
      <Card variant="minimal" size="sm">
        <CardContent variant="minimal">
          <div className="text-center">
            <CardTitle variant="minimal">1,247</CardTitle>
            <CardDescription variant="minimal">Daily Users</CardDescription>
          </div>
        </CardContent>
      </Card>

      <Card variant="minimal" size="sm">
        <CardContent variant="minimal">
          <div className="text-center">
            <CardTitle variant="minimal">€12.4K</CardTitle>
            <CardDescription variant="minimal">Monthly Revenue</CardDescription>
          </div>
        </CardContent>
      </Card>

      <Card variant="minimal" size="sm">
        <CardContent variant="minimal">
          <div className="text-center">
            <CardTitle variant="minimal">98.7%</CardTitle>
            <CardDescription variant="minimal">Uptime</CardDescription>
          </div>
        </CardContent>
      </Card>

      {/* Minimal with Header */}
      <Card variant="minimal" size="md" className="md:col-span-2">
        <CardHeader variant="minimal">
          <CardTitle variant="minimal">Simple Overview</CardTitle>
          <CardDescription variant="minimal">
            Clean, focused design for essential information
          </CardDescription>
        </CardHeader>
        <CardContent variant="minimal">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Active Projects</span>
              <span className="font-medium">23</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Completed Tasks</span>
              <span className="font-medium">156</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Team Members</span>
              <span className="font-medium">12</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Minimal Focus Card */}
      <Card variant="minimal" size="md">
        <CardHeader variant="minimal">
          <CardTitle variant="minimal">Focus Metric</CardTitle>
        </CardHeader>
        <CardContent variant="minimal">
          <div className="text-center py-4">
            <div className="text-3xl font-light text-slate-800 dark:text-slate-200">4.8★</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Customer Rating</div>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Minimal variant provides clean, subtle design perfect for focused content and essential metrics without visual distractions."
      }
    }
  }
};

// 🎨 THEME SHOWCASE
export const ThemeShowcase: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      {/* Apple Glass Theme */}
      <Card variant="executive" theme="apple-glass" size="widget-standard">
        <CardHeader>
          <CardTitle variant="executive">🍎 Apple Glass</CardTitle>
          <CardDescription>Signature translucent style with backdrop blur</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Premium glass morphism effect with subtle transparency and sophisticated backdrop blur.
            Perfect for modern, elegant interfaces.
          </p>
        </CardContent>
      </Card>

      {/* Dark Executive Theme */}
      <Card variant="executive" theme="dark-executive" size="widget-standard">
        <CardHeader>
          <CardTitle variant="executive">🌙 Dark Executive</CardTitle>
          <CardDescription>Premium dark theme for sophisticated UIs</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-300">
            Sophisticated dark theme with premium gradients and professional styling.
            Ideal for executive dashboards and premium applications.
          </p>
        </CardContent>
      </Card>

      {/* Light Premium Theme */}
      <Card variant="dashboard" theme="light-premium" size="widget-standard">
        <CardHeader>
          <CardTitle>☀️ Light Premium</CardTitle>
          <CardDescription>Elegant light theme with subtle gradients</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Refined light theme with sophisticated gradients and premium feel.
            Perfect for professional and clean interfaces.
          </p>
        </CardContent>
      </Card>

      {/* High Contrast Theme */}
      <Card variant="dashboard" theme="high-contrast" size="widget-standard">
        <CardHeader>
          <CardTitle>🔍 High Contrast</CardTitle>
          <CardDescription>Accessibility-optimized design</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Maximum accessibility with high contrast colors and optimized readability.
            WCAG 2.1 AAA compliant for universal design.
          </p>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Theme showcase demonstrates the four premium theme variants, each optimized for different use cases and visual preferences."
      }
    }
  }
};

// 🚀 ANIMATION SHOWCASE
export const AnimationShowcase: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
      <Card variant="dashboard" animation="subtle" interactive="hover" size="sm">
        <CardContent>
          <div className="text-center py-4">
            <CardTitle variant="minimal">Subtle</CardTitle>
            <CardDescription variant="minimal">200ms smooth transition</CardDescription>
          </div>
        </CardContent>
      </Card>

      <Card variant="dashboard" animation="smooth" interactive="hover" size="sm">
        <CardContent>
          <div className="text-center py-4">
            <CardTitle variant="minimal">Smooth</CardTitle>
            <CardDescription variant="minimal">300ms ease-out</CardDescription>
          </div>
        </CardContent>
      </Card>

      <Card variant="dashboard" animation="premium" interactive="hover" size="sm">
        <CardContent>
          <div className="text-center py-4">
            <CardTitle variant="minimal">Premium</CardTitle>
            <CardDescription variant="minimal">500ms luxury feel</CardDescription>
          </div>
        </CardContent>
      </Card>

      <Card variant="kpi" animation="bounce" interactive="hover" size="kpi-compact">
        <CardContent variant="kpi">
          <div className="text-center">
            <CardTitle variant="kpi">Bounce</CardTitle>
            <CardDescription variant="muted">Pulse effect</CardDescription>
          </div>
        </CardContent>
      </Card>

      <Card variant="executive" animation="none" size="sm">
        <CardContent>
          <div className="text-center py-4">
            <CardTitle variant="minimal">None</CardTitle>
            <CardDescription variant="minimal">No animations</CardDescription>
          </div>
        </CardContent>
      </Card>

      <Card variant="dashboard" animation="smooth" interactive="clickable" size="sm">
        <CardContent>
          <div className="text-center py-4">
            <CardTitle variant="minimal">Clickable</CardTitle>
            <CardDescription variant="minimal">Active scale effect</CardDescription>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Animation showcase demonstrates different animation styles and interactive behaviors available in the Card system."
      }
    }
  }
};

// 📱 RESPONSIVE SHOWCASE
export const ResponsiveShowcase: Story = {
  render: () => (
    <div className="space-y-6 max-w-7xl">
      {/* Mobile Layout */}
      <div className="block md:hidden">
        <h3 className="text-lg font-semibold mb-4">📱 Mobile Layout</h3>
        <div className="grid grid-cols-1 gap-4">
          <Card variant="kpi" size="kpi-compact">
            <CardContent variant="kpi">
              <div className="text-center">
                <CardTitle variant="kpi">€2.4M</CardTitle>
                <CardDescription>Revenue</CardDescription>
              </div>
            </CardContent>
          </Card>
          <Card variant="dashboard" size="widget-standard">
            <CardHeader>
              <CardTitle>Mobile Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Optimized for mobile viewing with stacked layout.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tablet Layout */}
      <div className="hidden md:block lg:hidden">
        <h3 className="text-lg font-semibold mb-4">📱 Tablet Layout</h3>
        <div className="grid grid-cols-2 gap-4">
          <Card variant="kpi" size="kpi-compact">
            <CardContent variant="kpi">
              <div className="text-center">
                <CardTitle variant="kpi">€2.4M</CardTitle>
                <CardDescription>Revenue</CardDescription>
              </div>
            </CardContent>
          </Card>
          <Card variant="analytics" size="widget-standard">
            <CardHeader>
              <CardTitle>Tablet View</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Two-column layout optimized for tablet screens.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <h3 className="text-lg font-semibold mb-4">🖥️ Desktop Layout</h3>
        <div className="grid grid-cols-4 gap-4">
          <Card variant="kpi" size="kpi-compact">
            <CardContent variant="kpi">
              <div className="text-center">
                <CardTitle variant="kpi">€2.4M</CardTitle>
                <CardDescription>Revenue</CardDescription>
              </div>
            </CardContent>
          </Card>
          <Card variant="kpi" size="kpi-compact">
            <CardContent variant="kpi">
              <div className="text-center">
                <CardTitle variant="kpi">45.6K</CardTitle>
                <CardDescription>Users</CardDescription>
              </div>
            </CardContent>
          </Card>
          <Card variant="analytics" size="widget-standard" className="col-span-2">
            <CardHeader>
              <CardTitle>Desktop Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Full desktop layout with optimal spacing and organization.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Responsive Grid Demo */}
      <Card variant="dashboard" size="metric-large">
        <CardHeader>
          <CardTitle>📐 Responsive Grid System</CardTitle>
          <CardDescription>Adaptive layout that responds to screen size</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded text-center">
              <div className="text-sm font-medium">Mobile: 1 col</div>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded text-center">
              <div className="text-sm font-medium">Tablet: 2 cols</div>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded text-center">
              <div className="text-sm font-medium">Desktop: 4 cols</div>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900 p-4 rounded text-center">
              <div className="text-sm font-medium">Responsive</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Responsive showcase demonstrates how Card components adapt to different screen sizes with mobile-first design principles."
      }
    }
  }
};

// 🎯 REAL DASHBOARD SCENARIO
export const RealDashboardScenario: Story = {
  render: () => (
    <div className="space-y-6 max-w-7xl">
      {/* Executive Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="executive" size="kpi-compact" glassEffect interactive="hover">
          <CardContent variant="kpi">
            <div className="text-center">
              <CardTitle variant="kpi" className="text-blue-600">€2.4M</CardTitle>
              <CardDescription variant="executive">ARR</CardDescription>
              <div className="text-green-600 font-semibold text-xs">+15.2%</div>
            </div>
          </CardContent>
        </Card>

        <Card variant="executive" size="kpi-compact" glassEffect interactive="hover">
          <CardContent variant="kpi">
            <div className="text-center">
              <CardTitle variant="kpi" className="text-purple-600">45.6K</CardTitle>
              <CardDescription variant="executive">Users</CardDescription>
              <div className="text-green-600 font-semibold text-xs">+8.7%</div>
            </div>
          </CardContent>
        </Card>

        <Card variant="executive" size="kpi-compact" glassEffect interactive="hover">
          <CardContent variant="kpi">
            <div className="text-center">
              <CardTitle variant="kpi" className="text-emerald-600">€892K</CardTitle>
              <CardDescription variant="executive">MRR</CardDescription>
              <div className="text-green-600 font-semibold text-xs">+12.4%</div>
            </div>
          </CardContent>
        </Card>

        <Card variant="executive" size="kpi-compact" glassEffect interactive="hover">
          <CardContent variant="kpi">
            <div className="text-center">
              <CardTitle variant="kpi" className="text-orange-600">94.2%</CardTitle>
              <CardDescription variant="executive">Uptime</CardDescription>
              <div className="text-green-600 font-semibold text-xs">+0.5%</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics and Finance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="analytics" size="widget-standard" animation="premium">
          <CardHeader variant="analytics">
            <CardTitle>📊 User Analytics</CardTitle>
            <CardDescription>Real-time user engagement metrics</CardDescription>
          </CardHeader>
          <CardContent variant="analytics">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Daily Active Users</span>
                <span className="font-semibold">12,847</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Session Duration</span>
                <span className="font-semibold">4m 32s</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="finance" size="widget-standard" gradientBg>
          <CardHeader variant="finance">
            <CardTitle>💰 Financial Health</CardTitle>
            <CardDescription>Q3 2025 financial performance</CardDescription>
          </CardHeader>
          <CardContent variant="finance">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xl font-bold text-emerald-700">€892K</div>
                <div className="text-sm text-emerald-600">Net Profit</div>
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-700">37.2%</div>
                <div className="text-sm text-emerald-600">Margin</div>
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-700">€1.2M</div>
                <div className="text-sm text-emerald-600">Cash Flow</div>
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-700">18.7%</div>
                <div className="text-sm text-emerald-600">ROI</div>
              </div>
            </div>
          </CardContent>
          <CardFooter variant="finance">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              View Report
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* System Status Dashboard */}
      <Card variant="dashboard" size="metric-large">
        <CardHeader variant="dashboard">
          <CardTitle>🔧 System Status Dashboard</CardTitle>
          <CardDescription>Real-time infrastructure monitoring and performance metrics</CardDescription>
        </CardHeader>
        <CardContent variant="dashboard">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <div className="text-sm text-slate-600">API Uptime</div>
              <div className="text-xs text-green-600">Excellent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">45ms</div>
              <div className="text-sm text-slate-600">Response Time</div>
              <div className="text-xs text-green-600">Fast</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">2.3GB</div>
              <div className="text-sm text-slate-600">Memory Usage</div>
              <div className="text-xs text-yellow-600">Moderate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">12.4K</div>
              <div className="text-sm text-slate-600">Active Sessions</div>
              <div className="text-xs text-green-600">High Traffic</div>
            </div>
          </div>
        </CardContent>
        <CardFooter variant="dashboard">
          <div className="flex space-x-3">
            <Button variant="default" size="sm">Refresh</Button>
            <Button variant="outline" size="sm">Alerts</Button>
            <Button variant="ghost" size="sm">Settings</Button>
          </div>
        </CardFooter>
      </Card>

      {/* Team Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="minimal" size="md">
          <CardHeader variant="minimal">
            <CardTitle variant="minimal">🏃 Active Projects</CardTitle>
          </CardHeader>
          <CardContent variant="minimal">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Dashboard Redesign</span>
                <span className="text-xs text-green-600">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">API Integration</span>
                <span className="text-xs text-blue-600">65%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Mobile App</span>
                <span className="text-xs text-orange-600">45%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="minimal" size="md">
          <CardHeader variant="minimal">
            <CardTitle variant="minimal">👥 Team Status</CardTitle>
          </CardHeader>
          <CardContent variant="minimal">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Online</span>
                <span className="text-sm font-medium">8/12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">In Meeting</span>
                <span className="text-sm font-medium">3/12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Available</span>
                <span className="text-sm font-medium">5/12</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="minimal" size="md">
          <CardHeader variant="minimal">
            <CardTitle variant="minimal">📅 Upcoming</CardTitle>
          </CardHeader>
          <CardContent variant="minimal">
            <div className="space-y-2">
              <div className="text-sm">
                <div className="font-medium">Sprint Review</div>
                <div className="text-xs text-slate-500">Today 2:00 PM</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Client Demo</div>
                <div className="text-xs text-slate-500">Tomorrow 10:00 AM</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Team Standup</div>
                <div className="text-xs text-slate-500">Daily 9:00 AM</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Complete real-world dashboard scenario showcasing how all Card variants work together to create a comprehensive Apple-style executive dashboard."
      }
    }
  }
};

/**
 * 🎯 STORYBOOK SUMMARY SHOWCASE
 * 
 * ✨ Total Stories: 15+ comprehensive demonstrations
 * 🎮 Interactive Playground: Full configuration control
 * 🏢 Business Variants: All 6 variants showcased (Executive, Analytics, Finance, KPI, Dashboard, Minimal)
 * 🎨 Theme System: 4 premium themes demonstrated
 * 📏 Size Variants: Dashboard-optimized sizing system
 * ✨ Animation System: 5 animation styles with interactions
 * 📱 Responsive Design: Mobile-first adaptive layouts
 * 🎯 Real Scenarios: Complete dashboard implementations
 * 💼 Executive Grade: C-level presentation quality
 * 
 * 🎯 Business Focus: Apple-style dashboard excellence
 * 📊 Use Cases: KPIs, Analytics, Finance, System Monitoring
 * 🎨 Visual Excellence: Glass morphism, gradients, animations
 * ♿ Accessibility: WCAG 2.1 AA+ compliance
 * 🚀 Performance: Optimized for enterprise usage
 */