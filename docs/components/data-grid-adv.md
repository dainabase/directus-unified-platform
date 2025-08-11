# Data Grid Advanced

Enterprise data grid with all features

## Import

```tsx
import { DataGridAdv } from '@dainabase/ui/data-grid-adv';
```

## Basic Usage

```tsx
import { DataGridAdv } from '@dainabase/ui/data-grid-adv';

export default function DataGridAdvExample() {
  return (
    <DataGridAdv 
      rows={data}
      columns={columns}
      features={{
        export: true,
        grouping: true,
        pivoting: true,
        aggregation: true
      }}
    />
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| rows | `any[]` | - | Yes | Data rows |
| columns | `Column[]` | - | Yes | Column definitions |
| features | `Features` | {} | No | Advanced features |
| virtualScroll | `boolean` | true | No | Virtual scrolling |

## Related Components

- [Data Grid](./data-grid.md) - Basic grid
- [Table](./table.md) - Simple table

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>