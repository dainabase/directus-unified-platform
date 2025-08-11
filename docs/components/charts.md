# Charts

Chart components for data visualization

## Import

```tsx
import { LineChart, BarChart, PieChart, AreaChart } from '@dainabase/ui/charts';
```

## Basic Usage

```tsx
import { LineChart } from '@dainabase/ui/charts';

const data = [
  { month: 'Jan', value: 400 },
  { month: 'Feb', value: 300 },
  { month: 'Mar', value: 600 },
];

export default function ChartsExample() {
  return (
    <LineChart 
      data={data}
      xField="month"
      yField="value"
      height={300}
    />
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| data | `any[]` | - | Yes | Chart data |
| xField | `string` | - | Yes | X-axis field |
| yField | `string` | - | Yes | Y-axis field |
| height | `number` | 400 | No | Chart height |
| responsive | `boolean` | true | No | Responsive sizing |

## Related Components

- [Data Grid](./data-grid.md) - Tabular data
- [Timeline](./timeline.md) - Time-based visualization

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>