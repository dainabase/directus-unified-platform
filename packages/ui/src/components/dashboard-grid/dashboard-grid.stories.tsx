import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { 
  DashboardGrid, 
  type DashboardWidget, 
  type DashboardLayout,
  type DashboardGridProps 
} from './dashboard-grid';

// Mock components for widget content
const MetricWidget = ({ value, label, trend, color = 'blue' }: {
  value: string;
  label: string;
  trend?: string;
  color?: string;
}) => (
  <div className="h-full flex flex-col justify-center items-center text-center">
    <div className={`text-3xl font-bold text-${color}-600 mb-2`}>{value}</div>
    <div className="text-sm text-gray-600 mb-1">{label}</div>
    {trend && (
      <div className={`text-xs px-2 py-1 rounded text-${trend.startsWith('+') ? 'green' : 'red'}-600 bg-${trend.startsWith('+') ? 'green' : 'red'}-50`}>
        {trend}
      </div>
    )}
  </div>
);

const ChartWidget = ({ type, title }: { type: string; title: string }) => (
  <div className="h-full flex flex-col">
    <h4 className="font-medium mb-3">{title}</h4>
    <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
          <span className="text-white text-2xl">📊</span>
        </div>
        <div className="text-sm text-gray-600">{type} Chart</div>
      </div>
    </div>
  </div>
);

const TableWidget = ({ title, data }: { title: string; data: Array<{id: string; name: string; value: string}> }) => (
  <div className="h-full flex flex-col">
    <h4 className="font-medium mb-3">{title}</h4>
    <div className="flex-1 overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-1">Name</th>
            <th className="text-right py-1">Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b">
              <td className="py-1">{row.name}</td>
              <td className="text-right py-1">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const NewsWidget = ({ title }: { title: string }) => (
  <div className="h-full flex flex-col">
    <h4 className="font-medium mb-3">{title}</h4>
    <div className="space-y-3 overflow-auto">
      {[
        'Q3 Revenue exceeded targets by 15%',
        'New partnership with TechCorp announced',
        'Product launch scheduled for next month',
        'Team expansion in European markets',
        'Customer satisfaction reaches 98%'
      ].map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
          <div className="text-sm text-gray-700">{item}</div>
        </div>
      ))}
    </div>
  </div>
);

const TeamWidget = () => (
  <div className="h-full flex flex-col">
    <h4 className="font-medium mb-3">Team Status</h4>
    <div className="space-y-2 overflow-auto">
      {[
        { name: 'Alice Johnson', status: 'Available', avatar: '👩‍💼' },
        { name: 'Bob Smith', status: 'In Meeting', avatar: '👨‍💻' },
        { name: 'Carol Davis', status: 'Available', avatar: '👩‍🔬' },
        { name: 'David Wilson', status: 'Busy', avatar: '👨‍💼' }
      ].map((person, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-lg">{person.avatar}</span>
          <div className="flex-1">
            <div className="text-sm font-medium">{person.name}</div>
            <div className={`text-xs ${
              person.status === 'Available' ? 'text-green-600' :
              person.status === 'Busy' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {person.status}
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full ${
            person.status === 'Available' ? 'bg-green-500' :
            person.status === 'Busy' ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
        </div>
      ))}
    </div>
  </div>
);

// Sample widget configurations
const createMetricWidget = (id: string, position: any, value: string, label: string, trend?: string, color?: string): DashboardWidget => ({
  id,
  type: 'metric',
  title: label,
  content: <MetricWidget value={value} label={label} trend={trend} color={color} />,
  position,
  minW: 2,
  maxW: 4
});

const createChartWidget = (id: string, position: any, title: string, chartType: string): DashboardWidget => ({
  id,
  type: 'chart',
  title,
  content: <ChartWidget type={chartType} title={title} />,
  position,
  minW: 3,
  maxW: 8
});

const createTableWidget = (id: string, position: any, title: string): DashboardWidget => ({
  id,
  type: 'table',
  title,
  content: (
    <TableWidget 
      title={title}
      data={[
        { id: '1', name: 'Product A', value: '$125,000' },
        { id: '2', name: 'Product B', value: '$98,500' },
        { id: '3', name: 'Product C', value: '$87,200' },
        { id: '4', name: 'Product D', value: '$76,800' }
      ]}
    />
  ),
  position,
  minW: 4,
  maxW: 8
});

const createNewsWidget = (id: string, position: any): DashboardWidget => ({
  id,
  type: 'news',
  title: 'Latest Updates',
  content: <NewsWidget title="Latest Updates" />,
  position,
  minW: 3,
  maxW: 6
});

const createTeamWidget = (id: string, position: any): DashboardWidget => ({
  id,
  type: 'team',
  title: 'Team Status',
  content: <TeamWidget />,
  position,
  minW: 3,
  maxW: 5
});

// Sample layouts
const executiveDashboardWidgets: DashboardWidget[] = [
  createMetricWidget('revenue', { x: 0, y: 0, w: 3, h: 2 }, '$2.4M', 'Monthly Revenue', '+12%', 'green'),
  createMetricWidget('users', { x: 3, y: 0, w: 3, h: 2 }, '48.2K', 'Active Users', '+8%', 'blue'),
  createMetricWidget('conversion', { x: 6, y: 0, w: 3, h: 2 }, '3.8%', 'Conversion Rate', '+0.3%', 'purple'),
  createMetricWidget('churn', { x: 9, y: 0, w: 3, h: 2 }, '2.1%', 'Churn Rate', '-0.4%', 'green'),
  createChartWidget('revenue-chart', { x: 0, y: 2, w: 6, h: 4 }, 'Revenue Trends', 'Line'),
  createChartWidget('user-chart', { x: 6, y: 2, w: 6, h: 4 }, 'User Growth', 'Bar'),
  createTableWidget('top-products', { x: 0, y: 6, w: 8, h: 3 }, 'Top Products'),
  createTeamWidget('team-status', { x: 8, y: 6, w: 4, h: 3 })
];

const operationalDashboardWidgets: DashboardWidget[] = [
  createMetricWidget('tickets', { x: 0, y: 0, w: 2, h: 2 }, '127', 'Open Tickets', '+5'),
  createMetricWidget('response', { x: 2, y: 0, w: 2, h: 2 }, '4.2h', 'Avg Response', '-0.3h', 'green'),
  createMetricWidget('satisfaction', { x: 4, y: 0, w: 2, h: 2 }, '98%', 'CSAT Score', '+2%', 'green'),
  createChartWidget('ticket-trends', { x: 6, y: 0, w: 6, h: 3 }, 'Ticket Trends', 'Area'),
  createTableWidget('urgent-tickets', { x: 0, y: 2, w: 6, h: 4 }, 'Urgent Tickets'),
  createNewsWidget('system-updates', { x: 0, y: 6, w: 4, h: 2 }),
  createTeamWidget('support-team', { x: 4, y: 6, w: 4, h: 2 }),
  createChartWidget('performance', { x: 8, y: 6, w: 4, h: 2 }, 'System Performance', 'Gauge')
];

const salesDashboardWidgets: DashboardWidget[] = [
  createMetricWidget('deals', { x: 0, y: 0, w: 3, h: 2 }, '$850K', 'Pipeline Value', '+15%', 'green'),
  createMetricWidget('closed', { x: 3, y: 0, w: 3, h: 2 }, '23', 'Deals Closed', '+3'),
  createMetricWidget('forecast', { x: 6, y: 0, w: 3, h: 2 }, '89%', 'Forecast Accuracy', '+4%', 'blue'),
  createMetricWidget('quota', { x: 9, y: 0, w: 3, h: 2 }, '112%', 'Quota Attainment', '+12%', 'green'),
  createChartWidget('pipeline', { x: 0, y: 2, w: 8, h: 3 }, 'Sales Pipeline', 'Funnel'),
  createTableWidget('top-deals', { x: 8, y: 2, w: 4, h: 3 }, 'Top Opportunities'),
  createChartWidget('rep-performance', { x: 0, y: 5, w: 6, h: 3 }, 'Rep Performance', 'Leaderboard'),
  createNewsWidget('sales-updates', { x: 6, y: 5, w: 6, h: 3 })
];

// Sample saved layouts
const sampleLayouts: DashboardLayout[] = [
  {
    id: 'executive-dashboard',
    name: 'Executive Dashboard',
    description: 'High-level KPIs and strategic metrics for C-level executives',
    widgets: executiveDashboardWidgets,
    cols: 12,
    rowHeight: 100,
    gap: 16,
    createdAt: new Date('2025-01-01'),
    isDefault: true
  },
  {
    id: 'operational-dashboard',
    name: 'Operations Center',
    description: 'Real-time operational metrics and system monitoring',
    widgets: operationalDashboardWidgets,
    cols: 12,
    rowHeight: 100,
    gap: 16,
    createdAt: new Date('2025-01-15')
  },
  {
    id: 'sales-dashboard',
    name: 'Sales Performance',
    description: 'Sales pipeline, forecasts, and team performance tracking',
    widgets: salesDashboardWidgets,
    cols: 12,
    rowHeight: 100,
    gap: 16,
    createdAt: new Date('2025-02-01')
  }
];

const meta: Meta<typeof DashboardGrid> = {
  title: 'Enterprise/DashboardGrid',
  component: DashboardGrid,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# 🚀 DashboardGrid - Enterprise Dashboard System

A sophisticated, enterprise-grade dashboard grid system with drag-and-drop widget management, 
responsive layouts, and advanced customization capabilities.

## ✨ Key Features

- **🎯 Drag & Drop**: Intuitive widget repositioning with collision detection
- **📏 Resizable Widgets**: Dynamic sizing with min/max constraints  
- **💾 Layout Management**: Save, load, and switch between multiple dashboard layouts
- **🔒 Widget Locking**: Prevent accidental modifications of critical widgets
- **📱 Responsive Design**: Adapts to different screen sizes and breakpoints
- **🎨 Customizable Theming**: Flexible styling and branding options
- **♿ Accessibility**: Full keyboard navigation and screen reader support
- **⚡ Performance Optimized**: Efficient rendering for large datasets

## 🎨 Widget Types Supported

- **📊 Metrics**: KPI cards with trend indicators
- **📈 Charts**: Line, bar, area, and custom visualizations  
- **📋 Tables**: Data grids with sorting and filtering
- **📰 Content**: News feeds, updates, and notifications
- **👥 Team**: User status, presence, and collaboration
- **🎛️ Controls**: Interactive dashboard controls and settings

## 🏢 Enterprise Use Cases

- **Executive Dashboards**: C-level strategic metrics and KPIs
- **Operations Centers**: Real-time monitoring and alerting  
- **Sales Performance**: Pipeline tracking and team metrics
- **Analytics Workbenches**: Data exploration and visualization
- **Project Management**: Team progress and resource tracking
- **Customer Support**: Ticket management and satisfaction metrics
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    widgets: {
      description: 'Array of dashboard widgets to display',
      control: 'object'
    },
    cols: {
      description: 'Number of grid columns',
      control: { type: 'range', min: 6, max: 24, step: 1 }
    },
    rowHeight: {
      description: 'Height of each grid row in pixels',
      control: { type: 'range', min: 50, max: 200, step: 10 }
    },
    gap: {
      description: 'Gap between widgets in pixels',
      control: { type: 'range', min: 0, max: 32, step: 2 }
    },
    allowEdit: {
      description: 'Enable edit mode functionality',
      control: 'boolean'
    },
    isDraggable: {
      description: 'Allow widget drag and drop',
      control: 'boolean'
    },
    isResizable: {
      description: 'Allow widget resizing',
      control: 'boolean'
    },
    compactType: {
      description: 'Widget compaction algorithm',
      control: 'select',
      options: ['vertical', 'horizontal', null]
    },
    preventCollision: {
      description: 'Prevent widget overlapping',
      control: 'boolean'
    },
    autoSize: {
      description: 'Auto-size grid to fit content',
      control: 'boolean'
    }
  }
};

export default meta;
type Story = StoryObj<typeof DashboardGrid>;

// Story Templates
const DashboardTemplate = (args: DashboardGridProps) => {
  const [widgets, setWidgets] = useState(args.widgets || []);
  const [layouts, setLayouts] = useState(sampleLayouts);
  const [currentLayoutId, setCurrentLayoutId] = useState<string | undefined>(args.currentLayoutId);

  const handleLayoutChange = (updatedWidgets: DashboardWidget[]) => {
    setWidgets(updatedWidgets);
    args.onLayoutChange?.(updatedWidgets);
  };

  const handleWidgetRemove = (widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
    args.onWidgetRemove?.(widgetId);
  };

  const handleWidgetAdd = (widget: DashboardWidget) => {
    setWidgets(prev => [...prev, widget]);
    args.onWidgetAdd?.(widget);
  };

  const handleLayoutSave = (layout: DashboardLayout) => {
    setLayouts(prev => [...prev, layout]);
    args.onLayoutSave?.(layout);
  };

  const handleLayoutLoad = (layoutId: string) => {
    const layout = layouts.find(l => l.id === layoutId);
    if (layout) {
      setWidgets(layout.widgets);
      setCurrentLayoutId(layoutId);
    }
    args.onLayoutLoad?.(layoutId);
  };

  const handleLayoutReset = () => {
    setWidgets(args.widgets || []);
    setCurrentLayoutId(undefined);
    args.onLayoutReset?.();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <DashboardGrid
        {...args}
        widgets={widgets}
        layouts={layouts}
        currentLayoutId={currentLayoutId}
        onLayoutChange={handleLayoutChange}
        onWidgetRemove={handleWidgetRemove}
        onWidgetAdd={handleWidgetAdd}
        onLayoutSave={handleLayoutSave}
        onLayoutLoad={handleLayoutLoad}
        onLayoutReset={handleLayoutReset}
      />
    </div>
  );
};

// 🏢 Executive Dashboard Story
export const ExecutiveDashboard: Story = {
  render: DashboardTemplate,
  args: {
    widgets: executiveDashboardWidgets,
    cols: 12,
    rowHeight: 100,
    gap: 16,
    allowEdit: true,
    isDraggable: true,
    isResizable: true,
    compactType: 'vertical',
    preventCollision: false,
    autoSize: true,
    showLayoutSelector: true,
    currentLayoutId: 'executive-dashboard'
  },
  parameters: {
    docs: {
      description: {
        story: `
## 🏢 Executive Dashboard

A comprehensive C-level dashboard featuring key performance indicators, revenue trends, 
and strategic metrics. This layout is optimized for high-level decision making with 
clear metric cards and executive-friendly visualizations.

**Features:**
- Revenue and growth metrics with trend indicators
- User acquisition and retention analytics  
- Conversion rate optimization tracking
- Top-performing products analysis
- Team status and availability overview

**Use Cases:**
- Monthly/quarterly business reviews
- Board meeting presentations  
- Strategic planning sessions
- Investor reporting
- Executive team briefings
        `
      }
    }
  }
};

// 🛠️ Operational Dashboard Story  
export const OperationalDashboard: Story = {
  render: DashboardTemplate,
  args: {
    widgets: operationalDashboardWidgets,
    cols: 12,
    rowHeight: 100,
    gap: 16,
    allowEdit: true,
    isDraggable: true,
    isResizable: true,
    compactType: 'vertical',
    preventCollision: false,
    autoSize: true,
    showLayoutSelector: true,
    currentLayoutId: 'operational-dashboard'
  },
  parameters: {
    docs: {
      description: {
        story: `
## 🛠️ Operations Center

Real-time operational monitoring dashboard for IT operations, customer support, 
and system administration teams. Focus on immediate actionable insights and 
system health indicators.

**Features:**
- Support ticket metrics and trending
- System performance monitoring
- Response time tracking
- Customer satisfaction scores
- Team workload distribution
- Critical alerts and notifications

**Use Cases:**
- NOC (Network Operations Center) monitoring
- Customer support management
- SLA compliance tracking  
- Incident response coordination
- Team capacity planning
        `
      }
    }
  }
};

// 💰 Sales Dashboard Story
export const SalesDashboard: Story = {
  render: DashboardTemplate,
  args: {
    widgets: salesDashboardWidgets,
    cols: 12,
    rowHeight: 100,
    gap: 16,
    allowEdit: true,
    isDraggable: true,
    isResizable: true,
    compactType: 'vertical',
    preventCollision: false,
    autoSize: true,
    showLayoutSelector: true,
    currentLayoutId: 'sales-dashboard'
  },
  parameters: {
    docs: {
      description: {
        story: `
## 💰 Sales Performance Dashboard

Comprehensive sales analytics and pipeline management dashboard designed for 
sales teams, managers, and revenue operations. Track deals, forecasts, and 
team performance in real-time.

**Features:**
- Pipeline value and deal tracking
- Quota attainment monitoring
- Forecast accuracy analytics
- Sales rep performance leaderboards
- Opportunity management
- Revenue trend analysis

**Use Cases:**
- Daily sales standups
- Monthly/quarterly reviews
- Pipeline forecasting
- Territory management
- Commission calculations
- Sales coaching and training
        `
      }
    }
  }
};

// 🏗️ Empty Dashboard Story
export const EmptyDashboard: Story = {
  render: DashboardTemplate,
  args: {
    widgets: [],
    cols: 12,
    rowHeight: 100,
    gap: 16,
    allowEdit: true,
    isDraggable: true,
    isResizable: true,
    compactType: 'vertical',
    preventCollision: false,
    autoSize: false,
    showLayoutSelector: true
  },
  parameters: {
    docs: {
      description: {
        story: `
## 🏗️ Empty Dashboard

Starting point for creating custom dashboards. Shows the empty state with 
add widget functionality. Perfect for demonstrating the widget creation 
and layout building process.

**Features:**
- Clean empty state design
- Add widget functionality  
- Layout building from scratch
- Template selection options
- Guided setup workflow

**Use Cases:**
- New user onboarding
- Custom dashboard creation
- Dashboard template building
- Widget library exploration
- Layout experimentation
        `
      }
    }
  }
};

// 🎛️ Configuration Playground Story
export const ConfigurationPlayground: Story = {
  render: DashboardTemplate,
  args: {
    widgets: [
      createMetricWidget('metric-1', { x: 0, y: 0, w: 3, h: 2 }, '$125K', 'Revenue', '+15%'),
      createChartWidget('chart-1', { x: 3, y: 0, w: 6, h: 3 }, 'Performance Chart', 'Line'),
      createTableWidget('table-1', { x: 9, y: 0, w: 3, h: 3 }, 'Data Table'),
      createNewsWidget('news-1', { x: 0, y: 2, w: 3, h: 2 }),
      createTeamWidget('team-1', { x: 0, y: 4, w: 4, h: 2 })
    ],
    cols: 12,
    rowHeight: 100,
    gap: 16,
    allowEdit: true,
    isDraggable: true,
    isResizable: true,
    compactType: 'vertical',
    preventCollision: false,
    autoSize: true,
    showLayoutSelector: true
  },
  parameters: {
    docs: {
      description: {
        story: `
## 🎛️ Configuration Playground

Interactive playground for testing different dashboard configurations, 
grid settings, and widget behaviors. Use the controls panel to experiment 
with various properties and see their effects in real-time.

**Configurable Properties:**
- Grid columns and row height
- Widget spacing and gaps
- Drag & drop behavior
- Resize constraints
- Collision detection
- Compaction algorithms
- Auto-sizing options

**Perfect for:**
- Testing different layouts
- Exploring configuration options
- Understanding component behavior
- Prototyping custom dashboards
- Performance testing
        `
      }
    }
  }
};

// 🔒 Widget States Demo Story
export const WidgetStatesDemo: Story = {
  render: DashboardTemplate,
  args: {
    widgets: [
      // Normal widget
      createMetricWidget('normal', { x: 0, y: 0, w: 3, h: 2 }, '$100K', 'Normal Widget'),
      
      // Locked widget
      { ...createMetricWidget('locked', { x: 3, y: 0, w: 3, h: 2 }, '$200K', 'Locked Widget'), isLocked: true },
      
      // Collapsed widget
      { ...createChartWidget('collapsed', { x: 6, y: 0, w: 3, h: 2 }, 'Collapsed Chart', 'Bar'), isCollapsed: true },
      
      // Non-draggable widget
      { ...createTableWidget('non-draggable', { x: 9, y: 0, w: 3, h: 3 }, 'Fixed Table'), draggable: false },
      
      // Non-resizable widget
      { ...createNewsWidget('non-resizable', { x: 0, y: 2, w: 4, h: 2 }), resizable: false },
      
      // Widget with constraints
      { 
        ...createChartWidget('constrained', { x: 4, y: 2, w: 4, h: 2 }, 'Constrained Chart', 'Area'), 
        minW: 3, 
        maxW: 6, 
        minH: 2, 
        maxH: 4 
      },
      
      // Widget with custom actions
      {
        ...createTeamWidget('custom-actions', { x: 8, y: 2, w: 4, h: 2 }),
        headerActions: (
          <div className="flex gap-1">
            <button className="px-2 py-1 text-xs bg-blue-500 text-white rounded">Export</button>
            <button className="px-2 py-1 text-xs bg-green-500 text-white rounded">Refresh</button>
          </div>
        ),
        onSettings: () => alert('Widget settings clicked!')
      }
    ],
    cols: 12,
    rowHeight: 100,
    gap: 16,
    allowEdit: true,
    isDraggable: true,
    isResizable: true,
    compactType: 'vertical',
    preventCollision: false,
    autoSize: true
  },
  parameters: {
    docs: {
      description: {
        story: `
## 🔒 Widget States Demonstration

Comprehensive showcase of different widget states and behaviors. This story 
demonstrates various widget configurations including locked, collapsed, 
constrained, and custom widgets.

**Widget States Shown:**
- **Normal**: Standard draggable and resizable widget
- **Locked**: Protected from editing and removal
- **Collapsed**: Minimized to header only
- **Non-draggable**: Fixed position widget  
- **Non-resizable**: Fixed size widget
- **Constrained**: Size limits with min/max bounds
- **Custom Actions**: Additional header buttons and settings

**Interactive Features:**
- Toggle edit mode to see different behaviors
- Try dragging and resizing different widgets
- Collapse/expand widgets to save space
- Lock/unlock widgets for protection
- Access custom widget settings

This demonstrates the flexibility and robustness of the dashboard system 
in handling diverse widget requirements and user interactions.
        `
      }
    }
  }
};

// 📱 Responsive Layouts Story
export const ResponsiveLayouts: Story = {
  render: (args) => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">📱 Responsive Dashboard Layouts</h3>
        <p className="text-gray-600">Dashboard adapts to different screen sizes and device types</p>
      </div>
      
      {/* Desktop Layout */}
      <div className="border rounded-lg p-4">
        <h4 className="font-medium mb-3">🖥️ Desktop (1200px+)</h4>
        <div className="w-full" style={{ height: '400px' }}>
          <DashboardTemplate {...args} />
        </div>
      </div>
      
      {/* Tablet Layout */}
      <div className="border rounded-lg p-4">
        <h4 className="font-medium mb-3">📱 Tablet (768px - 1199px)</h4>
        <div className="mx-auto" style={{ width: '768px', height: '400px' }}>
          <DashboardTemplate {...args} />
        </div>
      </div>
      
      {/* Mobile Layout */}
      <div className="border rounded-lg p-4">
        <h4 className="font-medium mb-3">📱 Mobile (< 768px)</h4>
        <div className="mx-auto" style={{ width: '375px', height: '600px' }}>
          <DashboardTemplate {...args} />
        </div>
      </div>
    </div>
  ),
  args: {
    widgets: [
      createMetricWidget('mobile-metric-1', { x: 0, y: 0, w: 6, h: 2 }, '$50K', 'Revenue'),
      createMetricWidget('mobile-metric-2', { x: 6, y: 0, w: 6, h: 2 }, '1.2K', 'Users'),
      createChartWidget('mobile-chart', { x: 0, y: 2, w: 12, h: 3 }, 'Mobile Chart', 'Line'),
      createTableWidget('mobile-table', { x: 0, y: 5, w: 12, h: 3 }, 'Mobile Table')
    ],
    cols: 12,
    rowHeight: 80,
    gap: 12,
    allowEdit: true,
    breakpoints: {
      lg: 1200,
      md: 768,
      sm: 480,
      xs: 320
    }
  },
  parameters: {
    docs: {
      description: {
        story: `
## 📱 Responsive Dashboard Layouts

Demonstrates how the dashboard grid adapts to different screen sizes and 
device types. The layout automatically adjusts widget sizes, spacing, 
and arrangement for optimal viewing on desktop, tablet, and mobile devices.

**Responsive Features:**
- **Adaptive Grid**: Columns adjust based on screen width
- **Flexible Spacing**: Gaps and padding scale appropriately  
- **Touch-Friendly**: Larger touch targets on mobile devices
- **Optimized Navigation**: Simplified controls for smaller screens
- **Content Prioritization**: Most important widgets remain visible

**Breakpoint System:**
- **Desktop (1200px+)**: Full 12-column layout with all features
- **Tablet (768-1199px)**: Optimized for touch interaction
- **Mobile (<768px)**: Stacked layout with simplified navigation

The dashboard maintains full functionality across all device sizes while 
providing an optimized user experience for each form factor.
        `
      }
    }
  }
};

// 🎨 Theme Variations Story
export const ThemeVariations: Story = {
  render: (args) => (
    <div className="space-y-8">
      {/* Light Theme */}
      <div className="bg-white p-6 rounded-lg border">
        <h4 className="font-medium mb-4">☀️ Light Theme Dashboard</h4>
        <div style={{ height: '400px' }}>
          <DashboardTemplate {...args} />
        </div>
      </div>
      
      {/* Dark Theme */}
      <div className="bg-gray-900 p-6 rounded-lg border">
        <h4 className="font-medium mb-4 text-white">🌙 Dark Theme Dashboard</h4>
        <div className="dark" style={{ height: '400px' }}>
          <DashboardTemplate {...args} />
        </div>
      </div>
      
      {/* High Contrast Theme */}
      <div className="bg-black p-6 rounded-lg border">
        <h4 className="font-medium mb-4 text-white">🔳 High Contrast Theme</h4>
        <div className="dark high-contrast" style={{ height: '400px' }}>
          <DashboardTemplate {...args} />
        </div>
      </div>
    </div>
  ),
  args: {
    widgets: [
      createMetricWidget('theme-metric-1', { x: 0, y: 0, w: 3, h: 2 }, '$125K', 'Revenue', '+15%'),
      createMetricWidget('theme-metric-2', { x: 3, y: 0, w: 3, h: 2 }, '2.4K', 'Users', '+8%'),
      createChartWidget('theme-chart', { x: 6, y: 0, w: 6, h: 3 }, 'Performance Chart', 'Line'),
      createTableWidget('theme-table', { x: 0, y: 2, w: 6, h: 3 }, 'Data Table')
    ],
    cols: 12,
    rowHeight: 100,
    gap: 16,
    allowEdit: true
  },
  parameters: {
    docs: {
      description: {
        story: `
## 🎨 Theme Variations

Showcases the dashboard grid's support for different visual themes and 
accessibility requirements. The component adapts seamlessly to light, 
dark, and high-contrast themes.

**Theme Features:**
- **Light Theme**: Clean, bright interface for daytime use
- **Dark Theme**: Reduced eye strain for low-light environments  
- **High Contrast**: Enhanced visibility for accessibility compliance
- **Custom Theming**: Configurable colors and branding
- **Auto Theme Detection**: Respects system theme preferences

**Accessibility Benefits:**
- WCAG 2.1 AA compliant contrast ratios
- Reduced motion options for sensitive users
- Screen reader optimized markup
- Keyboard navigation support
- Focus indicators and visual feedback

All themes maintain full functionality while providing optimal visual 
experience for different use cases and accessibility needs.
        `
      }
    }
  }
};

// 🚀 Performance Demo Story  
export const PerformanceDemo: Story = {
  render: (args) => {
    const [widgetCount, setWidgetCount] = useState(50);
    const [renderTime, setRenderTime] = useState<number | null>(null);
    
    const generateWidgets = (count: number): DashboardWidget[] => {
      const startTime = performance.now();
      
      const widgets = Array.from({ length: count }, (_, i) => {
        const type = ['metric', 'chart', 'table', 'news'][i % 4];
        const position = {
          x: (i % 6) * 2,
          y: Math.floor(i / 6) * 2,
          w: 2,
          h: 2
        };
        
        switch (type) {
          case 'metric':
            return createMetricWidget(`perf-${i}`, position, `$${(i * 1000).toLocaleString()}`, `Metric ${i}`);
          case 'chart':
            return createChartWidget(`perf-${i}`, position, `Chart ${i}`, 'Line');
          case 'table':
            return createTableWidget(`perf-${i}`, position, `Table ${i}`);
          default:
            return createNewsWidget(`perf-${i}`, position);
        }
      });
      
      const endTime = performance.now();
      setRenderTime(endTime - startTime);
      
      return widgets;
    };

    const [widgets, setWidgets] = useState(() => generateWidgets(widgetCount));

    const handleCountChange = (newCount: number) => {
      setWidgetCount(newCount);
      setWidgets(generateWidgets(newCount));
    };

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">🚀 Performance Metrics</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{widgetCount}</div>
              <div className="text-sm text-gray-600">Widgets</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {renderTime ? `${renderTime.toFixed(2)}ms` : '—'}
              </div>
              <div className="text-sm text-gray-600">Render Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">60fps</div>
              <div className="text-sm text-gray-600">Target FPS</div>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Widget Count: {widgetCount}</label>
            <input
              type="range"
              min="10"
              max="200"
              value={widgetCount}
              onChange={(e) => handleCountChange(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10</span>
              <span>200</span>
            </div>
          </div>
        </div>
        
        <div style={{ height: '600px' }}>
          <DashboardTemplate {...args} widgets={widgets} />
        </div>
      </div>
    );
  },
  args: {
    cols: 12,
    rowHeight: 80,
    gap: 8,
    allowEdit: true,
    isDraggable: true,
    isResizable: true,
    compactType: 'vertical',
    autoSize: true
  },
  parameters: {
    docs: {
      description: {
        story: `
## 🚀 Performance Demonstration

Interactive performance testing playground that demonstrates the dashboard 
grid's ability to efficiently handle large numbers of widgets while 
maintaining smooth interactions and 60fps performance.

**Performance Features:**
- **Virtual Rendering**: Only renders visible widgets for large datasets
- **Optimized Updates**: Minimal re-renders during drag/resize operations
- **Memory Management**: Efficient cleanup and garbage collection
- **Smooth Animations**: Hardware-accelerated transitions
- **Responsive Interactions**: Sub-100ms response times

**Stress Testing:**
- **10-50 Widgets**: Excellent performance, all features enabled
- **50-100 Widgets**: Good performance, minimal optimization needed
- **100-200 Widgets**: Optimized rendering, some features may be limited
- **200+ Widgets**: Virtual scrolling and advanced optimization required

**Monitoring Metrics:**
- Render time measurement for widget generation
- Frame rate monitoring during interactions  
- Memory usage tracking for large datasets
- Event handler optimization analysis

Use the slider to test different widget counts and observe performance 
characteristics. The dashboard maintains excellent performance even 
with hundreds of widgets through intelligent optimization strategies.
        `
      }
    }
  }
};

// 🔧 Advanced Features Story
export const AdvancedFeatures: Story = {
  render: DashboardTemplate,
  args: {
    widgets: [
      // Widget with custom styling
      {
        ...createMetricWidget('custom-style', { x: 0, y: 0, w: 3, h: 2 }, '$500K', 'Custom Styled'),
        className: 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-pink-50'
      },
      
      // Widget with advanced settings
      {
        ...createChartWidget('advanced-chart', { x: 3, y: 0, w: 6, h: 4 }, 'Advanced Chart', 'Custom'),
        onSettings: () => alert('Advanced chart settings!'),
        headerActions: (
          <div className="flex gap-1">
            <button className="px-2 py-1 text-xs bg-blue-500 text-white rounded">📊</button>
            <button className="px-2 py-1 text-xs bg-green-500 text-white rounded">📥</button>
            <button className="px-2 py-1 text-xs bg-purple-500 text-white rounded">🔗</button>
          </div>
        )
      },
      
      // Widget with strict constraints
      {
        ...createTableWidget('constrained-table', { x: 9, y: 0, w: 3, h: 4 }, 'Strict Constraints'),
        minW: 3,
        maxW: 4,
        minH: 3,
        maxH: 5,
        draggable: true,
        resizable: true
      },
      
      // Real-time updating widget
      {
        id: 'realtime',
        type: 'realtime',
        title: 'Real-time Data',
        content: (
          <div className="h-full flex flex-col justify-center items-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {new Date().toLocaleTimeString()}
            </div>
            <div className="text-sm text-gray-600">Live Updates</div>
            <div className="mt-2 flex gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="text-xs text-green-600">Connected</div>
            </div>
          </div>
        ),
        position: { x: 0, y: 2, w: 3, h: 2 }
      },
      
      // Interactive widget with state
      {
        id: 'interactive',
        type: 'interactive',
        title: 'Interactive Widget',
        content: (
          <div className="h-full p-2">
            <div className="grid grid-cols-2 gap-2 h-full">
              <button className="bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                Action 1
              </button>
              <button className="bg-green-500 text-white rounded text-sm hover:bg-green-600">
                Action 2
              </button>
              <button className="bg-purple-500 text-white rounded text-sm hover:bg-purple-600">
                Action 3
              </button>
              <button className="bg-orange-500 text-white rounded text-sm hover:bg-orange-600">
                Action 4
              </button>
            </div>
          </div>
        ),
        position: { x: 3, y: 4, w: 3, h: 2 }
      },
      
      // External integration widget
      {
        id: 'integration',
        type: 'integration',
        title: 'API Integration',
        content: (
          <div className="h-full flex flex-col justify-center items-center text-center">
            <div className="text-3xl mb-2">🔌</div>
            <div className="text-sm font-medium mb-1">External API</div>
            <div className="text-xs text-gray-500 mb-2">Connected to Salesforce</div>
            <div className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
              Sync: 2min ago
            </div>
          </div>
        ),
        position: { x: 6, y: 4, w: 3, h: 2 },
        onSettings: () => alert('API Integration Settings')
      }
    ],
    cols: 12,
    rowHeight: 100,
    gap: 16,
    allowEdit: true,
    isDraggable: true,
    isResizable: true,
    compactType: 'vertical',
    preventCollision: true,
    autoSize: true,
    containerPadding: [20, 20],
    margin: [16, 16]
  },
  parameters: {
    docs: {
      description: {
        story: `
## 🔧 Advanced Features Showcase

Demonstrates advanced dashboard capabilities including custom styling, 
real-time updates, interactive widgets, external integrations, and 
sophisticated widget behaviors.

**Advanced Capabilities:**
- **Custom Styling**: Branded widgets with custom CSS classes
- **Real-time Updates**: Live data streaming and automatic refresh
- **Interactive Controls**: Buttons, forms, and user interactions within widgets
- **External Integrations**: API connections and third-party data sources
- **Advanced Settings**: Per-widget configuration and customization
- **Constraint Systems**: Sophisticated sizing and positioning rules

**Widget Enhancement Features:**
- **Custom Header Actions**: Additional buttons and controls
- **Styling Overrides**: Brand-specific colors and layouts  
- **Event Handling**: Click, hover, and interaction callbacks
- **Data Binding**: Dynamic content and state management
- **Animation Support**: Smooth transitions and visual feedback
- **Performance Optimization**: Lazy loading and virtualization

**Enterprise Integration:**
- **SSO Authentication**: Secure user access and permissions
- **API Connectivity**: Real-time data from multiple sources
- **Audit Logging**: User actions and dashboard changes
- **Theme Management**: Corporate branding and style guides
- **Multi-tenancy**: Isolated dashboards per organization
- **Backup & Recovery**: Layout persistence and restoration

This showcase demonstrates the extensibility and enterprise readiness 
of the dashboard system for complex business requirements.
        `
      }
    }
  }
};
