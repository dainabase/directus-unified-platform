---
id: charts
title: Charts
sidebar_position: 42
---

import { Charts } from "@dainabase/ui";

A comprehensive charting component library supporting various chart types with interactive features, responsive design, and real-time data updates.

## Preview

<ComponentPreview>
  <Charts
    type="line"
    data={{
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [{
        label: "Sales 2025",
        data: [30, 45, 28, 56, 42, 65],
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)"
      }]
    }}
    options={{
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Monthly Sales Performance" }
      }
    }}
  />
</ComponentPreview>

## Features

- 📊 **Multiple Chart Types** - Line, Bar, Pie, Doughnut, Radar, Polar, Bubble, Scatter
- 🎨 **Customizable Themes** - Light/dark themes with custom color palettes
- 📱 **Responsive Design** - Adapts to container size automatically
- 🔄 **Real-time Updates** - Live data streaming and animations
- 🎯 **Interactive Elements** - Tooltips, legends, zoom, pan, drill-down
- 📈 **Combined Charts** - Mix different chart types in one view
- 🔍 **Data Annotations** - Highlight specific data points or ranges
- 📤 **Export Options** - Save as PNG, SVG, or PDF
- ♿ **Accessible** - Screen reader support and keyboard navigation
- ⚡ **High Performance** - Optimized for large datasets

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```tsx
import { Charts } from "@dainabase/ui";

function BasicChart() {
  const data = {
    labels: ["Q1", "Q2", "Q3", "Q4"],
    datasets: [{
      label: "Revenue",
      data: [12000, 19000, 15000, 25000],
      backgroundColor: "#3B82F6"
    }]
  };

  return <Charts type="bar" data={data} />;
}
```

## Examples

### 1. Line Chart with Multiple Datasets

```tsx
import { Charts } from "@dainabase/ui";

export default function LineChartExample() {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Product A",
        data: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 85, 92],
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true
      },
      {
        label: "Product B",
        data: [45, 49, 60, 70, 46, 45, 30, 35, 50, 55, 65, 72],
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true
      },
      {
        label: "Product C",
        data: [35, 39, 50, 51, 36, 35, 20, 25, 40, 45, 55, 62],
        borderColor: "#F59E0B",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Monthly Sales Comparison"
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return "$" + value + "k";
          }
        }
      }
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false
    }
  };

  return (
    <Charts
      type="line"
      data={data}
      options={options}
      height={400}
    />
  );
}
```

### 2. Stacked Bar Chart

```tsx
import { Charts } from "@dainabase/ui";

export default function StackedBarExample() {
  const data = {
    labels: ["North", "South", "East", "West", "Central"],
    datasets: [
      {
        label: "Q1",
        data: [12000, 15000, 18000, 14000, 16000],
        backgroundColor: "#3B82F6",
      },
      {
        label: "Q2",
        data: [14000, 16000, 19000, 15000, 17000],
        backgroundColor: "#10B981",
      },
      {
        label: "Q3",
        data: [15000, 17000, 20000, 16000, 18000],
        backgroundColor: "#F59E0B",
      },
      {
        label: "Q4",
        data: [18000, 20000, 22000, 19000, 21000],
        backgroundColor: "#EF4444",
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Regional Sales by Quarter"
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += '$' + context.parsed.y.toLocaleString();
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        ticks: {
          callback: function(value: any) {
            return '$' + (value / 1000) + 'k';
          }
        }
      }
    }
  };

  return (
    <Charts
      type="bar"
      data={data}
      options={options}
      height={400}
    />
  );
}
```

### 3. Pie and Doughnut Charts

```tsx
import { Charts } from "@dainabase/ui";

export default function PieDoughnutExample() {
  const marketShareData = {
    labels: ["Product A", "Product B", "Product C", "Product D", "Product E"],
    datasets: [{
      data: [35, 25, 20, 15, 5],
      backgroundColor: [
        "#3B82F6",
        "#10B981",
        "#F59E0B",
        "#EF4444",
        "#8B5CF6"
      ],
      borderWidth: 2,
      borderColor: "#fff"
    }]
  };

  const budgetData = {
    labels: ["Marketing", "Development", "Sales", "Operations", "HR"],
    datasets: [{
      data: [300000, 500000, 400000, 200000, 100000],
      backgroundColor: [
        "rgba(59, 130, 246, 0.8)",
        "rgba(16, 185, 129, 0.8)",
        "rgba(245, 158, 11, 0.8)",
        "rgba(239, 68, 68, 0.8)",
        "rgba(139, 92, 246, 0.8)"
      ],
      borderWidth: 2,
      borderColor: "#fff"
    }]
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const,
      },
      title: {
        display: true,
        text: "Market Share Distribution"
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${percentage}%`;
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: "Budget Allocation"
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: $${value.toLocaleString()}`;
          }
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Charts
        type="pie"
        data={marketShareData}
        options={pieOptions}
        height={300}
      />
      <Charts
        type="doughnut"
        data={budgetData}
        options={doughnutOptions}
        height={300}
      />
    </div>
  );
}
```

### 4. Radar Chart

```tsx
import { Charts } from "@dainabase/ui";

export default function RadarChartExample() {
  const data = {
    labels: ["Speed", "Reliability", "Comfort", "Safety", "Efficiency", "Technology"],
    datasets: [
      {
        label: "Model A",
        data: [85, 90, 78, 92, 88, 75],
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        pointBackgroundColor: "#3B82F6",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#3B82F6"
      },
      {
        label: "Model B",
        data: [75, 85, 88, 85, 78, 90],
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        pointBackgroundColor: "#10B981",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#10B981"
      },
      {
        label: "Competitor",
        data: [70, 75, 70, 80, 72, 68],
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        pointBackgroundColor: "#EF4444",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#EF4444"
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Product Comparison Matrix"
      }
    },
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20
        }
      }
    }
  };

  return (
    <Charts
      type="radar"
      data={data}
      options={options}
      height={400}
    />
  );
}
```

### 5. Mixed Chart Types

```tsx
import { Charts } from "@dainabase/ui";

export default function MixedChartExample() {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        type: "bar" as const,
        label: "Revenue",
        data: [50000, 55000, 48000, 62000, 58000, 70000],
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        yAxisID: "y"
      },
      {
        type: "line" as const,
        label: "Profit Margin",
        data: [15, 18, 14, 22, 20, 25],
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderWidth: 2,
        fill: false,
        yAxisID: "y1"
      },
      {
        type: "line" as const,
        label: "Growth Rate",
        data: [5, 10, -5, 15, 8, 12],
        borderColor: "#F59E0B",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        borderWidth: 2,
        fill: false,
        borderDash: [5, 5],
        yAxisID: "y1"
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Financial Performance Overview"
      }
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        ticks: {
          callback: function(value: any) {
            return "$" + (value / 1000) + "k";
          }
        }
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function(value: any) {
            return value + "%";
          }
        }
      }
    }
  };

  return (
    <Charts
      type="bar"
      data={data}
      options={options}
      height={400}
    />
  );
}
```

### 6. Real-time Streaming Chart

```tsx
import { Charts } from "@dainabase/ui";
import { useState, useEffect, useRef } from "react";

export default function RealTimeChartExample() {
  const [data, setData] = useState({
    labels: [],
    datasets: [{
      label: "CPU Usage",
      data: [],
      borderColor: "#3B82F6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      tension: 0.4,
      fill: true
    }]
  });

  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Simulate real-time data
    intervalRef.current = setInterval(() => {
      setData((prevData) => {
        const now = new Date();
        const newLabel = now.toLocaleTimeString();
        const newValue = Math.floor(Math.random() * 40) + 30;

        const labels = [...prevData.labels, newLabel].slice(-20);
        const data = [...prevData.datasets[0].data, newValue].slice(-20);

        return {
          labels,
          datasets: [{
            ...prevData.datasets[0],
            data
          }]
        };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Real-time CPU Usage Monitor"
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + "%";
          }
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    },
    animation: {
      duration: 0
    },
    interaction: {
      intersect: false
    }
  };

  return (
    <div className="space-y-4">
      <Charts
        type="line"
        data={data}
        options={options}
        height={400}
      />
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Live streaming data - Updates every second</span>
      </div>
    </div>
  );
}
```

### 7. Bubble Chart

```tsx
import { Charts } from "@dainabase/ui";

export default function BubbleChartExample() {
  const data = {
    datasets: [
      {
        label: "North America",
        data: [
          { x: 20, y: 30, r: 15 },
          { x: 40, y: 10, r: 10 },
          { x: 30, y: 20, r: 30 },
          { x: 50, y: 40, r: 20 }
        ],
        backgroundColor: "rgba(59, 130, 246, 0.5)"
      },
      {
        label: "Europe",
        data: [
          { x: 10, y: 40, r: 20 },
          { x: 25, y: 25, r: 15 },
          { x: 35, y: 35, r: 25 },
          { x: 45, y: 15, r: 18 }
        ],
        backgroundColor: "rgba(16, 185, 129, 0.5)"
      },
      {
        label: "Asia",
        data: [
          { x: 15, y: 20, r: 25 },
          { x: 30, y: 30, r: 20 },
          { x: 45, y: 25, r: 30 },
          { x: 55, y: 35, r: 15 }
        ],
        backgroundColor: "rgba(245, 158, 11, 0.5)"
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Market Analysis: Price vs Volume vs Market Size"
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const x = context.parsed.x;
            const y = context.parsed.y;
            const r = context.raw.r;
            return [
              `${label}`,
              `Price: $${x}`,
              `Volume: ${y}k units`,
              `Market Size: $${r}M`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Price ($)"
        }
      },
      y: {
        title: {
          display: true,
          text: "Volume (k units)"
        }
      }
    }
  };

  return (
    <Charts
      type="bubble"
      data={data}
      options={options}
      height={400}
    />
  );
}
```

### 8. Area Chart with Gradient

```tsx
import { Charts } from "@dainabase/ui";
import { useEffect, useRef } from "react";

export default function AreaChartExample() {
  const chartRef = useRef<any>(null);

  const data = {
    labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"],
    datasets: [
      {
        label: "Network Traffic (GB)",
        data: [30, 25, 35, 45, 65, 55, 40],
        borderColor: "#3B82F6",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.5)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.0)");
          return gradient;
        }
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: "24-Hour Network Traffic Pattern"
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value + " GB";
          }
        },
        grid: {
          display: true,
          drawBorder: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        backgroundColor: "#3B82F6"
      }
    }
  };

  return (
    <Charts
      ref={chartRef}
      type="line"
      data={data}
      options={options}
      height={400}
    />
  );
}
```

### 9. Polar Area Chart

```tsx
import { Charts } from "@dainabase/ui";

export default function PolarAreaExample() {
  const data = {
    labels: ["Desktop", "Mobile", "Tablet", "Smart TV", "Wearable", "Gaming Console"],
    datasets: [{
      label: "Device Usage Hours",
      data: [42, 38, 15, 12, 8, 18],
      backgroundColor: [
        "rgba(59, 130, 246, 0.5)",
        "rgba(16, 185, 129, 0.5)",
        "rgba(245, 158, 11, 0.5)",
        "rgba(239, 68, 68, 0.5)",
        "rgba(139, 92, 246, 0.5)",
        "rgba(236, 72, 153, 0.5)"
      ],
      borderColor: [
        "#3B82F6",
        "#10B981",
        "#F59E0B",
        "#EF4444",
        "#8B5CF6",
        "#EC4899"
      ],
      borderWidth: 2
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const,
      },
      title: {
        display: true,
        text: "Average Daily Device Usage Distribution"
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value} hours`;
          }
        }
      }
    },
    scales: {
      r: {
        ticks: {
          backdropColor: "transparent"
        }
      }
    }
  };

  return (
    <Charts
      type="polarArea"
      data={data}
      options={options}
      height={400}
    />
  );
}
```

### 10. Dashboard with Multiple Charts

```tsx
import { Charts } from "@dainabase/ui";

export default function DashboardExample() {
  const salesData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{
      label: "Sales",
      data: [12000, 15000, 13000, 17000, 19000, 22000, 18000],
      backgroundColor: "#3B82F6"
    }]
  };

  const visitorData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{
      label: "Visitors",
      data: [320, 450, 380, 520, 480, 620, 550],
      borderColor: "#10B981",
      tension: 0.4
    }]
  };

  const categoryData = {
    labels: ["Electronics", "Clothing", "Food", "Books"],
    datasets: [{
      data: [45, 25, 20, 10],
      backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"]
    }]
  };

  const conversionData = {
    labels: ["Landing", "Product View", "Add to Cart", "Checkout", "Purchase"],
    datasets: [{
      label: "Conversion Funnel",
      data: [1000, 650, 400, 200, 150],
      backgroundColor: "rgba(139, 92, 246, 0.6)",
      borderColor: "#8B5CF6",
      borderWidth: 2
    }]
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Weekly Sales</h3>
        <div className="h-64">
          <Charts type="bar" data={salesData} options={commonOptions} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Website Visitors</h3>
        <div className="h-64">
          <Charts type="line" data={visitorData} options={commonOptions} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
        <div className="h-64">
          <Charts type="doughnut" data={categoryData} options={{
            ...commonOptions,
            plugins: { ...commonOptions.plugins, legend: { display: true, position: "bottom" as const } }
          }} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
        <div className="h-64">
          <Charts type="bar" data={conversionData} options={{
            ...commonOptions,
            indexAxis: "y" as const,
          }} />
        </div>
      </div>
    </div>
  );
}
```

## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `"line" \| "bar" \| "pie" \| "doughnut" \| "radar" \| "polarArea" \| "bubble" \| "scatter"` | `"line"` | Chart type |
| `data` | `ChartData` | `required` | Chart data object |
| `options` | `ChartOptions` | `{}` | Chart configuration options |
| `width` | `number \| string` | `"100%"` | Chart width |
| `height` | `number \| string` | `"400px"` | Chart height |
| `responsive` | `boolean` | `true` | Responsive to container size |
| `maintainAspectRatio` | `boolean` | `true` | Maintain aspect ratio |
| `plugins` | `Plugin[]` | `[]` | Chart.js plugins |
| `theme` | `"light" \| "dark"` | `"light"` | Color theme |
| `className` | `string` | `undefined` | Additional CSS classes |
| `onChartClick` | `(event: any, elements: any[]) => void` | `undefined` | Click event handler |
| `onChartHover` | `(event: any, elements: any[]) => void` | `undefined` | Hover event handler |
| `redraw` | `boolean` | `false` | Force chart redraw |
| `datasetIdKey` | `string` | `"label"` | Key to identify datasets |
| `updateMode` | `"resize" \| "reset" \| "none" \| "show" \| "hide" \| "active"` | `"active"` | Update animation mode |
| `ref` | `React.Ref` | `undefined` | Chart instance reference |
| `fallbackContent` | `ReactNode` | `undefined` | Content shown while loading |
| `exportEnabled` | `boolean` | `false` | Enable export functionality |
| `exportFormats` | `string[]` | `["png", "svg"]` | Available export formats |
| `annotations` | `Annotation[]` | `[]` | Chart annotations |
| `customTooltip` | `(context: any) => ReactNode` | `undefined` | Custom tooltip renderer |
| `loading` | `boolean` | `false` | Show loading state |
| `error` | `string` | `undefined` | Error message to display |

## Accessibility

The Charts component follows WCAG 2.1 Level AA guidelines:

- **Alternative Text**: Descriptive text for screen readers
- **Keyboard Navigation**: Navigate data points with keyboard
- **Focus Indicators**: Clear focus states on interactive elements
- **Color Contrast**: Sufficient contrast ratios
- **Pattern Support**: Patterns in addition to colors for colorblind users
- **Data Tables**: Option to display data in table format

## Best Practices

### Do's ✅

- **Choose appropriate chart types** for your data
- **Limit data points** for better readability
- **Use consistent color schemes** across charts
- **Provide clear labels** and legends
- **Include units** in axis labels
- **Test with real data** volumes
- **Optimize for mobile** viewing
- **Use animations sparingly** for performance

### Don'ts ❌

- **Don't overload** charts with too much data
- **Don't use 3D effects** unnecessarily
- **Don't rely only on color** to convey information
- **Don't forget axis labels** and titles
- **Don't use pie charts** for many categories (>6)
- **Don't animate** real-time charts
- **Don't ignore** responsive design
- **Don't mix** unrelated data in one chart

## Use Cases

1. **Analytics Dashboards** - KPIs and metrics visualization
2. **Financial Reports** - Revenue, expenses, profits
3. **Sales Performance** - Targets, achievements, trends
4. **User Analytics** - Traffic, engagement, conversions
5. **Scientific Data** - Research results, measurements
6. **IoT Monitoring** - Sensor data, real-time metrics
7. **Survey Results** - Responses, demographics
8. **Project Management** - Progress, burndown charts
9. **Health Metrics** - Patient data, vital signs
10. **Educational** - Grades, performance tracking

## Performance Considerations

- **Limit data points** to < 1000 for smooth interactions
- **Use data decimation** for large datasets
- **Disable animations** for real-time updates
- **Lazy load** charts below the fold
- **Use WebGL renderer** for > 10000 points
- **Implement virtual scrolling** for many charts
- **Cache processed data** to avoid recalculation

## Related Components

- [DataGrid](./data-grid) - Tabular data display
- [DataGridAdvanced](./data-grid-advanced) - Advanced data features
- [Progress](./progress) - Simple progress indicators
- [Table](./table) - Data tables
- [Card](./card) - Chart containers