# Data Grid

Advanced data grid with sorting and filtering

## Import

```tsx
import { DataGrid } from '@dainabase/ui/data-grid';
```

## Basic Usage

```tsx
import { DataGrid } from '@dainabase/ui/data-grid';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Name', width: 150 },
  { field: 'age', headerName: 'Age', width: 110 },
];

const rows = [
  { id: 1, name: 'John Doe', age: 35 },
  { id: 2, name: 'Jane Smith', age: 42 },
];

export default function DataGridExample() {
  return (
    <DataGrid 
      rows={rows}
      columns={columns}
      pageSize={10}
    />
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| rows | `any[]` | - | Yes | Data rows |
| columns | `Column[]` | - | Yes | Column definitions |
| pageSize | `number` | 10 | No | Rows per page |
| sortable | `boolean` | true | No | Enable sorting |
| filterable | `boolean` | true | No | Enable filtering |

## Related Components

- [Table](./table.md) - Simple table
- [Data Grid Advanced](./data-grid-adv.md) - Enterprise features

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>