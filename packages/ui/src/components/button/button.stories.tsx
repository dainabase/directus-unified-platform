/**
 * Button Stories - Enterprise Dashboard Premium Showcase ⭐⭐⭐⭐⭐
 * 
 * Interactive Storybook showcasing all premium enterprise features:
 * - 6 Theme System Demonstrations
 * - 13 Variant Business Scenarios
 * - Executive Dashboard Compositions
 * - Specialized Components Gallery
 * - Interactive Theme Playground
 * - Performance Demonstrations
 * - Real-world Business Use Cases
 */

import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { 
  Button, 
  ExecutiveButton, 
  ActionButton, 
  AnalyticsButton, 
  FinanceButton,
  type ButtonTheme,
  type ButtonVariant,
  type ButtonSize,
  type IconName,
} from "./index";
import { 
  Download, 
  Upload, 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  Users,
  Settings,
  Zap,
  RefreshCw,
  Bell,
  Shield
} from "lucide-react";
import React from "react";

// =================== META CONFIGURATION ===================

const meta: Meta<typeof Button> = {
  title: "Dashboard/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
# Button - Enterprise Dashboard CTA Premium ⭐⭐⭐⭐⭐

Advanced button system designed for executive dashboards with premium theming, sophisticated interactions, and business intelligence integration.

## Key Features
- **6 Premium Themes**: Executive, Analytics, Finance, Dashboard, Minimal, Default
- **13 Specialized Variants**: From primary actions to floating CTAs
- **Advanced Loading States**: Custom animations and icons
- **Icon Integration**: 20+ built-in icons with smart positioning
- **Badge System**: Notifications and status indicators
- **Apple-style Interactions**: Micro-animations and glassmorphism
- **Keyboard Shortcuts**: Enterprise productivity features
- **Analytics Tracking**: Built-in click tracking and metrics

## Business Use Cases
Perfect for C-level dashboards, business intelligence interfaces, financial applications, and analytics platforms requiring premium user experiences.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: [
        "primary", "secondary", "executive", "action", "analytics", 
        "finance", "danger", "success", "ghost", "outline", "link", "icon", "floating"
      ],
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg", "xl", "icon", "fab"],
    },
    theme: {
      control: { type: "select" },
      options: ["default", "executive", "analytics", "finance", "dashboard", "minimal"],
    },
    icon: {
      control: { type: "select" },
      options: [
        "download", "upload", "refresh", "settings", "check", "close",
        "alert", "info", "trending", "finance", "analytics", "users",
        "chevronRight", "star", "zap", "shield", "globe", "clock", "bell"
      ],
    },
    iconPosition: {
      control: { type: "radio" },
      options: ["left", "right"],
    },
    badgeVariant: {
      control: { type: "select" },
      options: ["default", "success", "warning", "error"],
    },
    loading: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
    gradient: {
      control: { type: "boolean" },
    },
    glassmorphism: {
      control: { type: "boolean" },
    },
    animateOnHover: {
      control: { type: "boolean" },
    },
    pulseOnMount: {
      control: { type: "boolean" },
    },
  },
  args: {
    children: "Button",
    onClick: action("button-clicked"),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// =================== BASIC EXAMPLES ===================

export const Default: Story = {
  args: {
    children: "Default Button",
  },
};

export const WithIcon: Story = {
  args: {
    icon: "download",
    children: "Download Report",
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    loadingText: "Processing...",
    children: "Submit Data",
  },
};

export const WithBadge: Story = {
  args: {
    badge: 5,
    badgeVariant: "error",
    icon: "bell",
    children: "Notifications",
  },
};

// =================== THEME SHOWCASE ===================

export const ThemeShowcase: Story = {
  render: () => (
    <div className="space-y-8 p-8">
      <div>
        <h3 className="text-xl font-bold mb-4 text-center">Premium Theme System</h3>
        <p className="text-gray-600 mb-6 text-center max-w-2xl mx-auto">
          Six carefully crafted themes designed for different business contexts and executive dashboards.
        </p>
      </div>
      
      {/* Executive Theme */}
      <div className="space-y-3">
        <h4 className="font-semibold text-lg">Executive Theme - C-Level Premium</h4>
        <div className="flex flex-wrap gap-3">
          <Button theme="executive" variant="primary" icon="trending">
            Executive Action
          </Button>
          <Button theme="executive" variant="secondary">
            Secondary
          </Button>
          <Button theme="executive" variant="ghost">
            Ghost
          </Button>
        </div>
      </div>

      {/* Analytics Theme */}
      <div className="space-y-3">
        <h4 className="font-semibold text-lg">Analytics Theme - Data Science</h4>
        <div className="flex flex-wrap gap-3">
          <Button theme="analytics" variant="primary" icon="analytics">
            Generate Report
          </Button>
          <Button theme="analytics" variant="secondary">
            Filter Data
          </Button>
          <Button theme="analytics" variant="ghost">
            Quick View
          </Button>
        </div>
      </div>

      {/* Finance Theme */}
      <div className="space-y-3">
        <h4 className="font-semibold text-lg">Finance Theme - Financial KPIs</h4>
        <div className="flex flex-wrap gap-3">
          <Button theme="finance" variant="primary" icon="finance">
            Approve Budget
          </Button>
          <Button theme="finance" variant="secondary">
            Review Costs
          </Button>
          <Button theme="finance" variant="ghost">
            View Details
          </Button>
        </div>
      </div>

      {/* Dashboard Theme */}
      <div className="space-y-3">
        <h4 className="font-semibold text-lg">Dashboard Theme - Business Intelligence</h4>
        <div className="flex flex-wrap gap-3">
          <Button theme="dashboard" variant="primary" icon="settings">
            Configure
          </Button>
          <Button theme="dashboard" variant="secondary">
            Export Data
          </Button>
          <Button theme="dashboard" variant="ghost">
            Quick Settings
          </Button>
        </div>
      </div>

      {/* Minimal Theme */}
      <div className="space-y-3">
        <h4 className="font-semibold text-lg">Minimal Theme - Clean Modern</h4>
        <div className="flex flex-wrap gap-3">
          <Button theme="minimal" variant="primary">
            Primary Action
          </Button>
          <Button theme="minimal" variant="secondary">
            Secondary
          </Button>
          <Button theme="minimal" variant="ghost">
            Subtle Action
          </Button>
        </div>
      </div>
    </div>
  ),
};

// =================== VARIANT GALLERY ===================

export const VariantGallery: Story = {
  render: () => (
    <div className="space-y-8 p-8">
      <div>
        <h3 className="text-xl font-bold mb-4 text-center">Complete Variant Gallery</h3>
        <p className="text-gray-600 mb-6 text-center max-w-2xl mx-auto">
          13 specialized variants designed for different business scenarios and dashboard contexts.
        </p>
      </div>

      {/* Primary Actions */}
      <div className="space-y-3">
        <h4 className="font-semibold text-lg">Primary Actions</h4>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" icon="zap">Primary CTA</Button>
          <Button variant="secondary" icon="settings">Secondary</Button>
          <Button variant="action" icon="upload" animateOnHover>Quick Action</Button>
        </div>
      </div>

      {/* Executive Level */}
      <div className="space-y-3">
        <h4 className="font-semibold text-lg">Executive Level</h4>
        <div className="flex flex-wrap gap-3">
          <Button variant="executive" theme="executive" glassmorphism>
            Executive Decision
          </Button>
          <Button variant="floating" size="fab">
            <Zap className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Business Intelligence */}
      <div className="space-y-3">
        <h4 className="font-semibold text-lg">Business Intelligence</h4>
        <div className="flex flex-wrap gap-3">
          <Button variant="analytics" theme="analytics" icon="analytics" gradient>
            Analytics Dashboard
          </Button>
          <Button variant="finance" theme="finance" icon="finance">
            Financial Reports
          </Button>
        </div>
      </div>

      {/* Status Actions */}
      <div className="space-y-3">
        <h4 className="font-semibold text-lg">Status Actions</h4>
        <div className="flex flex-wrap gap-3">
          <Button variant="success" icon="check">Approve</Button>
          <Button variant="danger" icon="close">Reject</Button>
          <Button variant="outline" icon="info">Review</Button>
        </div>
      </div>

      {/* Utility */}
      <div className="space-y-3">
        <h4 className="font-semibold text-lg">Utility</h4>
        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" icon="refresh">Refresh</Button>
          <Button variant="link" icon="download">Download PDF</Button>
          <Button variant="icon" size="icon" aria-label="Settings">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  ),
};

// =================== SIZE DEMONSTRATION ===================

export const SizeShowcase: Story = {
  render: () => (
    <div className="space-y-8 p-8">
      <div>
        <h3 className="text-xl font-bold mb-4 text-center">Size System</h3>
        <p className="text-gray-600 mb-6 text-center">
          Seven carefully crafted sizes for different UI contexts and hierarchy levels.
        </p>
      </div>
      
      <div className="flex items-end gap-4 justify-center">
        <Button size="xs" icon="zap">Extra Small</Button>
        <Button size="sm" icon="trending">Small</Button>
        <Button size="md" icon="analytics">Medium</Button>
        <Button size="lg" icon="finance">Large</Button>
        <Button size="xl" icon="shield">Extra Large</Button>
      </div>
      
      <div className="flex items-center gap-4 justify-center">
        <Button size="icon" variant="outline" aria-label="Icon button">
          <Settings className="w-4 h-4" />
        </Button>
        <Button size="fab" variant="floating" aria-label="Floating action">
          <Zap className="w-6 h-6" />
        </Button>
      </div>
    </div>
  ),
};

// =================== EXECUTIVE DASHBOARD ===================

export const ExecutiveDashboard: Story = {
  render: () => (
    <div className="bg-gradient-to-br from-slate-50 to-gray-100 p-8 rounded-xl space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Executive Dashboard CTA Premium</h3>
        <p className="text-gray-600">C-level interface with premium styling and sophisticated interactions</p>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ExecutiveButton 
          metric="Q4 Revenue" 
          trend="up" 
          priority="high"
          icon="trending"
          className="w-full"
        >
          $2.4M
        </ExecutiveButton>
        <ExecutiveButton 
          metric="Team Growth" 
          trend="up" 
          priority="medium"
          icon="users"
          className="w-full"
        >
          +23%
        </ExecutiveButton>
        <ExecutiveButton 
          metric="Efficiency" 
          trend="neutral" 
          priority="low"
          icon="analytics"
          className="w-full"
        >
          94.2%
        </ExecutiveButton>
      </div>

      {/* Action Center */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h4 className="text-lg font-semibold mb-4">Executive Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            variant="executive" 
            theme="executive" 
            icon="download" 
            glassmorphism
            className="w-full"
          >
            Board Report
          </Button>
          <Button 
            variant="analytics" 
            theme="analytics" 
            icon="analytics" 
            gradient
            className="w-full"
          >
            KPI Dashboard
          </Button>
          <FinanceButton 
            financialAction="approve" 
            amount={150000}
            className="w-full"
          >
            Approve Budget
          </FinanceButton>
          <Button 
            variant="success" 
            icon="check" 
            animateOnHover
            className="w-full"
          >
            Sign Off
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center gap-3">
        <Button variant="ghost" icon="refresh" shortcut="Ctrl+R">
          Refresh Data
        </Button>
        <Button variant="outline" icon="settings" badge={3} badgeVariant="warning">
          Settings
        </Button>
        <Button variant="link" icon="bell" badge="NEW" badgeVariant="success">
          Notifications
        </Button>
      </div>
    </div>
  ),
};

// =================== SPECIALIZED COMPONENTS ===================

export const SpecializedComponents: Story = {
  render: () => (
    <div className="space-y-8 p-8">
      <div>
        <h3 className="text-xl font-bold mb-4 text-center">Specialized Components</h3>
        <p className="text-gray-600 mb-6 text-center max-w-2xl mx-auto">
          Pre-configured components for specific business scenarios with built-in styling and behavior.
        </p>
      </div>

      {/* Executive Buttons */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Executive Buttons</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ExecutiveButton metric="Q4 Revenue" trend="up" priority="high">
            $2.4M Growth
          </ExecutiveButton>
          <ExecutiveButton metric="Team Size" trend="up" priority="medium">
            128 Members
          </ExecutiveButton>
          <ExecutiveButton metric="Satisfaction" trend="down" priority="low">
            87% Rating
          </ExecutiveButton>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Action Buttons</h4>
        <div className="flex flex-wrap gap-3">
          <ActionButton actionType="create">Create New Project</ActionButton>
          <ActionButton actionType="edit">Edit Configuration</ActionButton>
          <ActionButton actionType="delete">Remove Item</ActionButton>
          <ActionButton actionType="export">Export Data</ActionButton>
          <ActionButton actionType="import">Import CSV</ActionButton>
        </div>
      </div>

      {/* Analytics Buttons */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Analytics Buttons</h4>
        <div className="flex flex-wrap gap-3">
          <AnalyticsButton dataType="chart" visualizationType="line">
            Line Chart
          </AnalyticsButton>
          <AnalyticsButton dataType="table">
            Data Table
          </AnalyticsButton>
          <AnalyticsButton dataType="export">
            Export Report
          </AnalyticsButton>
          <AnalyticsButton dataType="drill-down">
            Drill Down
          </AnalyticsButton>
        </div>
      </div>

      {/* Finance Buttons */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Finance Buttons</h4>
        <div className="flex flex-wrap gap-3">
          <FinanceButton financialAction="approve" amount={25000}>
            Approve Budget
          </FinanceButton>
          <FinanceButton financialAction="review" amount={75000} currency="EUR">
            Review Expense
          </FinanceButton>
          <FinanceButton financialAction="calculate">
            Calculate ROI
          </FinanceButton>
          <FinanceButton financialAction="forecast">
            Forecast Q1
          </FinanceButton>
        </div>
      </div>
    </div>
  ),
};

// =================== INTERACTIVE FEATURES ===================

export const InteractiveFeatures: Story = {
  render: () => (
    <div className="space-y-8 p-8">
      <div>
        <h3 className="text-xl font-bold mb-4 text-center">Interactive Features</h3>
        <p className="text-gray-600 mb-6 text-center max-w-2xl mx-auto">
          Advanced interactions, animations, and user experience enhancements.
        </p>
      </div>

      {/* Loading States */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Loading States</h4>
        <div className="flex flex-wrap gap-3">
          <Button loading>Default Loading</Button>
          <Button loading loadingText="Processing data...">
            Custom Text
          </Button>
          <Button 
            loading 
            loadingIcon={<RefreshCw className="w-4 h-4 animate-spin" />}
          >
            Custom Icon
          </Button>
        </div>
      </div>

      {/* Animations */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Animations & Effects</h4>
        <div className="flex flex-wrap gap-3">
          <Button animateOnHover icon="zap">
            Hover Animation
          </Button>
          <Button pulseOnMount variant="success">
            Pulse on Mount
          </Button>
          <Button gradient variant="primary">
            Gradient Effect
          </Button>
          <Button glassmorphism variant="executive">
            Glassmorphism
          </Button>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Keyboard Shortcuts</h4>
        <div className="flex flex-wrap gap-3">
          <Button shortcut="Ctrl+S" icon="download">
            Save Report
          </Button>
          <Button shortcut="Ctrl+R" icon="refresh">
            Refresh Data
          </Button>
          <Button shortcut="Ctrl+E" icon="settings">
            Edit Settings
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Try the keyboard shortcuts above! They work when this story is focused.
        </p>
      </div>

      {/* Badges & Indicators */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Badges & Indicators</h4>
        <div className="flex flex-wrap gap-3">
          <Button badge={5} badgeVariant="error" icon="bell">
            Notifications
          </Button>
          <Button badge="NEW" badgeVariant="success">
            New Feature
          </Button>
          <Button badge={99} badgeVariant="warning" icon="users">
            Pending Reviews
          </Button>
          <Button badge="!" badgeVariant="error">
            Alert Status
          </Button>
        </div>
      </div>
    </div>
  ),
};

// =================== PERFORMANCE DEMO ===================

export const PerformanceDemo: Story = {
  render: () => {
    const [buttonCount, setButtonCount] = React.useState(10);
    const [renderTime, setRenderTime] = React.useState<number>(0);

    const handleStressTest = () => {
      const startTime = performance.now();
      setButtonCount(count => count + 50);
      
      // Measure render time
      setTimeout(() => {
        const endTime = performance.now();
        setRenderTime(endTime - startTime);
      }, 0);
    };

    return (
      <div className="space-y-6 p-8">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">Performance Demonstration</h3>
          <p className="text-gray-600 mb-4">
            Testing button rendering performance with complex configurations.
          </p>
          <div className="text-sm text-gray-500 mb-6">
            Current: {buttonCount} buttons | Last render: {renderTime.toFixed(2)}ms
          </div>
        </div>

        <div className="flex justify-center gap-3 mb-6">
          <Button onClick={handleStressTest} variant="primary" icon="zap">
            Add 50 Buttons
          </Button>
          <Button 
            onClick={() => setButtonCount(10)} 
            variant="outline"
            icon="refresh"
          >
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
          {Array.from({ length: buttonCount }, (_, i) => (
            <Button
              key={i}
              variant={["primary", "secondary", "analytics", "finance"][i % 4] as ButtonVariant}
              theme={["default", "executive", "analytics", "dashboard"][i % 4] as ButtonTheme}
              size={["xs", "sm", "md"][i % 3] as ButtonSize}
              icon={["download", "upload", "analytics", "finance"][i % 4] as IconName}
              badge={i % 10 === 0 ? i / 10 : undefined}
              className="text-xs"
            >
              Btn {i + 1}
            </Button>
          ))}
        </div>

        <div className="text-center text-sm text-gray-600">
          Performance target: &lt;5ms for 50 buttons with full features
        </div>
      </div>
    );
  },
};

// =================== REAL WORLD SCENARIOS ===================

export const RealWorldScenarios: Story = {
  render: () => (
    <div className="space-y-8 p-8">
      <div>
        <h3 className="text-xl font-bold mb-4 text-center">Real-World Business Scenarios</h3>
        <p className="text-gray-600 mb-6 text-center max-w-2xl mx-auto">
          Button configurations commonly used in enterprise dashboards and business applications.
        </p>
      </div>

      {/* Finance Dashboard */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
        <h4 className="font-semibold text-lg mb-4">Finance Dashboard</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <FinanceButton 
            financialAction="approve" 
            amount={45000}
            size="sm"
            className="w-full"
          >
            Approve
          </FinanceButton>
          <FinanceButton 
            financialAction="review" 
            amount={125000}
            size="sm" 
            className="w-full"
          >
            Review
          </FinanceButton>
          <Button 
            variant="finance" 
            theme="finance" 
            icon="download"
            size="sm"
            className="w-full"
          >
            Export P&L
          </Button>
          <Button 
            variant="outline" 
            icon="settings"
            size="sm"
            className="w-full"
          >
            Settings
          </Button>
        </div>
      </div>

      {/* Analytics Platform */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-6 rounded-lg">
        <h4 className="font-semibold text-lg mb-4">Analytics Platform</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <AnalyticsButton 
            dataType="chart" 
            visualizationType="line"
            size="sm"
            className="w-full"
          >
            Line Chart
          </AnalyticsButton>
          <AnalyticsButton 
            dataType="table"
            size="sm"
            className="w-full"
          >
            Data Table
          </AnalyticsButton>
          <Button 
            variant="analytics" 
            theme="analytics" 
            icon="download"
            size="sm"
            className="w-full"
          >
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            icon="refresh"
            size="sm"
            className="w-full"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Team Management */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg">
        <h4 className="font-semibold text-lg mb-4">Team Management</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ActionButton 
            actionType="create"
            size="sm"
            className="w-full"
          >
            Add Member
          </ActionButton>
          <ActionButton 
            actionType="edit"
            size="sm"
            className="w-full"
          >
            Edit Roles
          </ActionButton>
          <Button 
            variant="outline" 
            icon="users"
            badge={12}
            badgeVariant="success"
            size="sm"
            className="w-full"
          >
            Active Users
          </Button>
          <Button 
            variant="ghost" 
            icon="bell"
            badge={3}
            badgeVariant="warning"
            size="sm"
            className="w-full"
          >
            Alerts
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-lg">
        <h4 className="font-semibold text-lg mb-4">Executive Summary</h4>
        <div className="flex flex-wrap gap-3 justify-center">
          <ExecutiveButton 
            metric="Revenue" 
            trend="up" 
            priority="high"
          >
            $2.4M
          </ExecutiveButton>
          <Button 
            variant="executive" 
            theme="executive" 
            icon="download"
            glassmorphism
          >
            Board Deck
          </Button>
          <Button 
            variant="success" 
            icon="check"
            shortcut="Ctrl+A"
          >
            Approve All
          </Button>
          <Button 
            variant="floating" 
            size="fab"
            className="relative"
          >
            <Shield className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  ),
};

// =================== PLAYGROUND ===================

export const InteractivePlayground: Story = {
  args: {
    variant: "primary",
    size: "md",
    theme: "default",
    icon: "download",
    iconPosition: "left",
    children: "Interactive Button",
    badge: undefined,
    badgeVariant: "default",
    loading: false,
    disabled: false,
    gradient: false,
    glassmorphism: false,
    animateOnHover: false,
    pulseOnMount: false,
    shortcut: undefined,
  },
  render: (args) => (
    <div className="flex flex-col items-center space-y-4 p-8">
      <Button {...args} />
      <div className="text-sm text-gray-600 max-w-md text-center">
        Use the controls below to customize the button and see all available options in action.
      </div>
    </div>
  ),
};

// =================== DOCUMENTATION EXAMPLES ===================

export const Documentation: Story = {
  render: () => (
    <div className="space-y-8 p-8 max-w-4xl mx-auto">
      <div>
        <h3 className="text-2xl font-bold mb-4">Button Component Documentation</h3>
        <p className="text-gray-600 mb-6">
          Comprehensive examples and usage patterns for the enterprise button system.
        </p>
      </div>

      {/* Basic Usage */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Basic Usage</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex gap-3 mb-4">
            <Button>Default Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
          </div>
          <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
{`<Button>Default Button</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>`}
          </pre>
        </div>
      </div>

      {/* With Icons */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">With Icons</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex gap-3 mb-4">
            <Button icon="download">Download</Button>
            <Button icon="upload" iconPosition="right">Upload</Button>
            <Button icon="settings" rightIcon="chevronRight">Settings</Button>
          </div>
          <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
{`<Button icon="download">Download</Button>
<Button icon="upload" iconPosition="right">Upload</Button>
<Button icon="settings" rightIcon="chevronRight">Settings</Button>`}
          </pre>
        </div>
      </div>

      {/* Themed Buttons */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Themed Buttons</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex gap-3 mb-4">
            <Button theme="executive" variant="executive">Executive</Button>
            <Button theme="analytics" variant="analytics">Analytics</Button>
            <Button theme="finance" variant="finance">Finance</Button>
          </div>
          <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
{`<Button theme="executive" variant="executive">Executive</Button>
<Button theme="analytics" variant="analytics">Analytics</Button>
<Button theme="finance" variant="finance">Finance</Button>`}
          </pre>
        </div>
      </div>

      {/* Specialized Components */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Specialized Components</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex gap-3 mb-4">
            <ExecutiveButton metric="Q4" trend="up" priority="high">$2.4M</ExecutiveButton>
            <FinanceButton financialAction="approve" amount={15000}>Approve</FinanceButton>
            <AnalyticsButton dataType="chart">Chart</AnalyticsButton>
          </div>
          <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
{`<ExecutiveButton metric="Q4" trend="up" priority="high">
  $2.4M
</ExecutiveButton>
<FinanceButton financialAction="approve" amount={15000}>
  Approve
</FinanceButton>
<AnalyticsButton dataType="chart">Chart</AnalyticsButton>`}
          </pre>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Advanced Features</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex gap-3 mb-4">
            <Button loading loadingText="Processing...">Submit</Button>
            <Button badge={5} badgeVariant="error" icon="bell">Notifications</Button>
            <Button shortcut="Ctrl+S" icon="download">Save</Button>
          </div>
          <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
{`<Button loading loadingText="Processing...">Submit</Button>
<Button badge={5} badgeVariant="error" icon="bell">
  Notifications
</Button>
<Button shortcut="Ctrl+S" icon="download">Save</Button>`}
          </pre>
        </div>
      </div>
    </div>
  ),
};

// =================== ACCESSIBILITY SHOWCASE ===================

export const AccessibilityShowcase: Story = {
  render: () => (
    <div className="space-y-8 p-8">
      <div>
        <h3 className="text-xl font-bold mb-4 text-center">Accessibility Features</h3>
        <p className="text-gray-600 mb-6 text-center max-w-2xl mx-auto">
          Built-in accessibility features ensuring WCAG 2.1 AA compliance and enterprise standards.
        </p>
      </div>

      {/* Keyboard Navigation */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Keyboard Navigation</h4>
        <div className="flex gap-3">
          <Button>Tab to Focus</Button>
          <Button shortcut="Enter">Press Enter</Button>
          <Button shortcut="Space">Press Space</Button>
        </div>
        <p className="text-sm text-gray-600">
          Try tabbing through these buttons and using Enter or Space to activate them.
        </p>
      </div>

      {/* Screen Reader Support */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Screen Reader Support</h4>
        <div className="flex gap-3">
          <Button 
            aria-label="Download quarterly financial report"
            icon="download"
          >
            Q4 Report
          </Button>
          <Button 
            description="This button will send notifications to all team members"
            id="notify-all"
            icon="bell"
          >
            Notify All
          </Button>
          <Button 
            size="icon" 
            aria-label="Close dialog"
          >
            ×
          </Button>
        </div>
      </div>

      {/* Focus Management */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Focus Management</h4>
        <div className="flex gap-3">
          <Button className="focus:ring-4 focus:ring-blue-500/50">
            Enhanced Focus
          </Button>
          <Button disabled>
            Disabled State
          </Button>
          <Button loading>
            Loading State
          </Button>
        </div>
      </div>

      {/* High Contrast Support */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">High Contrast Support</h4>
        <div className="flex gap-3">
          <Button variant="outline" className="border-2">
            High Contrast
          </Button>
          <Button variant="primary" className="ring-2 ring-offset-2 ring-primary">
            Clear Boundaries
          </Button>
        </div>
      </div>
    </div>
  ),
};

// =================== INDIVIDUAL STORIES FOR TESTING ===================

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary", 
    children: "Secondary Button",
  },
};

export const Executive: Story = {
  args: {
    variant: "executive",
    theme: "executive",
    glassmorphism: true,
    children: "Executive Action",
  },
};

export const Analytics: Story = {
  args: {
    variant: "analytics",
    theme: "analytics", 
    gradient: true,
    icon: "analytics",
    children: "Analytics Dashboard",
  },
};

export const Finance: Story = {
  args: {
    variant: "finance",
    theme: "finance",
    icon: "finance",
    children: "Financial Report",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    icon: "close",
    children: "Delete Item",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    icon: "check", 
    children: "Approve",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    icon: "refresh",
    children: "Refresh",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    icon: "settings",
    children: "Settings",
  },
};

export const Link: Story = {
  args: {
    variant: "link",
    icon: "download",
    children: "Download PDF",
  },
};

export const Icon: Story = {
  args: {
    variant: "icon",
    size: "icon",
    "aria-label": "Settings",
    children: "⚙️",
  },
};

export const Floating: Story = {
  args: {
    variant: "floating",
    size: "fab",
    "aria-label": "Quick action",
    children: "⚡",
  },
};
