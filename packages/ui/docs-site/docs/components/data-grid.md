---
id: data-grid
title: DataGrid
sidebar_position: 40
---

import { DataGrid } from "@dainabase/ui";

A powerful and flexible data grid component for displaying and manipulating tabular data with advanced features like sorting, filtering, pagination, and inline editing.

## Preview

<ComponentPreview>
  <DataGrid
    data={[
      { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
      { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Editor" },
    ]}
    columns={[
      { key: "name", header: "Name", sortable: true },
      { key: "email", header: "Email", sortable: true },
      { key: "role", header: "Role", filterable: true },
    ]}
  />
</ComponentPreview>

## Features

- 📊 **Flexible Column Configuration** - Dynamic columns with custom renderers
- 🔄 **Sorting & Filtering** - Multi-column sorting and advanced filtering
- 📱 **Responsive Design** - Mobile-optimized with horizontal scrolling
- ✏️ **Inline Editing** - Edit cells directly in the grid
- 📑 **Pagination** - Built-in pagination with customizable page sizes
- 🎯 **Row Selection** - Single and multi-row selection with checkboxes
- 🔍 **Global Search** - Search across all columns
- 📤 **Export Functionality** - Export to CSV, Excel, or JSON
- 🎨 **Customizable Styling** - Theme support with CSS variables
- ♿ **Accessible** - WCAG 2.1 compliant with keyboard navigation

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```tsx
import { DataGrid } from "@dainabase/ui";

const data = [
  { id: 1, name: "Alice", age: 30, department: "Engineering" },
  { id: 2, name: "Bob", age: 25, department: "Marketing" },
  { id: 3, name: "Charlie", age: 35, department: "Sales" },
];

const columns = [
  { key: "name", header: "Name" },
  { key: "age", header: "Age" },
  { key: "department", header: "Department" },
];

function BasicDataGrid() {
  return <DataGrid data={data} columns={columns} />;
}
```

## Examples

### 1. Basic Data Grid

```tsx
import { DataGrid } from "@dainabase/ui";

const employees = [
  { id: 1, name: "Alice Johnson", position: "Developer", salary: 75000 },
  { id: 2, name: "Bob Smith", position: "Designer", salary: 65000 },
  { id: 3, name: "Carol White", position: "Manager", salary: 85000 },
  { id: 4, name: "David Brown", position: "Developer", salary: 72000 },
  { id: 5, name: "Eve Davis", position: "QA Engineer", salary: 60000 },
];

export default function BasicExample() {
  const columns = [
    { key: "id", header: "ID", width: 60 },
    { key: "name", header: "Employee Name" },
    { key: "position", header: "Position" },
    { 
      key: "salary", 
      header: "Salary",
      align: "right",
      format: (value: number) => `$${value.toLocaleString()}`
    },
  ];

  return (
    <DataGrid
      data={employees}
      columns={columns}
      striped={true}
      bordered={true}
    />
  );
}
```

### 2. Sortable Columns

```tsx
import { DataGrid } from "@dainabase/ui";
import { useState } from "react";

export default function SortableExample() {
  const [data] = useState([
    { id: 1, product: "Laptop", price: 999, stock: 15, category: "Electronics" },
    { id: 2, product: "Mouse", price: 29, stock: 50, category: "Accessories" },
    { id: 3, product: "Keyboard", price: 79, stock: 30, category: "Accessories" },
    { id: 4, product: "Monitor", price: 399, stock: 20, category: "Electronics" },
    { id: 5, product: "Headphones", price: 199, stock: 25, category: "Audio" },
  ]);

  const columns = [
    { key: "product", header: "Product", sortable: true },
    { 
      key: "price", 
      header: "Price", 
      sortable: true,
      align: "right",
      format: (value: number) => `$${value}`
    },
    { 
      key: "stock", 
      header: "Stock", 
      sortable: true,
      align: "center" 
    },
    { key: "category", header: "Category", sortable: true },
  ];

  return (
    <DataGrid
      data={data}
      columns={columns}
      defaultSort={{ key: "product", direction: "asc" }}
      onSort={(sortConfig) => console.log("Sort changed:", sortConfig)}
    />
  );
}
```

### 3. Filterable Grid

```tsx
import { DataGrid } from "@dainabase/ui";
import { useState } from "react";

export default function FilterableExample() {
  const [data] = useState([
    { id: 1, name: "John", role: "Admin", status: "Active", lastLogin: "2025-08-13" },
    { id: 2, name: "Jane", role: "User", status: "Active", lastLogin: "2025-08-12" },
    { id: 3, name: "Bob", role: "Editor", status: "Inactive", lastLogin: "2025-08-10" },
    { id: 4, name: "Alice", role: "Admin", status: "Active", lastLogin: "2025-08-13" },
    { id: 5, name: "Charlie", role: "User", status: "Pending", lastLogin: "2025-08-11" },
  ]);

  const columns = [
    { key: "name", header: "Name", filterable: true },
    { 
      key: "role", 
      header: "Role", 
      filterable: true,
      filterType: "select",
      filterOptions: ["Admin", "User", "Editor"]
    },
    { 
      key: "status", 
      header: "Status", 
      filterable: true,
      filterType: "select",
      filterOptions: ["Active", "Inactive", "Pending"],
      cellRenderer: (value: string) => (
        <span className={`badge badge-${value.toLowerCase()}`}>
          {value}
        </span>
      )
    },
    { 
      key: "lastLogin", 
      header: "Last Login", 
      filterable: true,
      filterType: "date"
    },
  ];

  return (
    <DataGrid
      data={data}
      columns={columns}
      showFilters={true}
      filterPosition="top"
      onFilter={(filters) => console.log("Filters applied:", filters)}
    />
  );
}
```

### 4. Selectable Rows

```tsx
import { DataGrid, Button } from "@dainabase/ui";
import { useState } from "react";

export default function SelectableExample() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  
  const data = [
    { id: 1, task: "Review PR #123", assignee: "Alice", priority: "High" },
    { id: 2, task: "Fix bug #456", assignee: "Bob", priority: "Critical" },
    { id: 3, task: "Update docs", assignee: "Charlie", priority: "Low" },
    { id: 4, task: "Deploy v2.0", assignee: "Alice", priority: "High" },
    { id: 5, task: "Write tests", assignee: "Bob", priority: "Medium" },
  ];

  const columns = [
    { key: "task", header: "Task" },
    { key: "assignee", header: "Assignee" },
    { 
      key: "priority", 
      header: "Priority",
      cellRenderer: (value: string) => (
        <span className={`text-${value === 'Critical' ? 'red' : value === 'High' ? 'orange' : value === 'Medium' ? 'yellow' : 'green'}-600`}>
          {value}
        </span>
      )
    },
  ];

  const handleBulkAction = () => {
    alert(`Selected ${selectedRows.length} rows: ${selectedRows.join(", ")}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          {selectedRows.length > 0 && (
            <span className="text-sm text-gray-600">
              {selectedRows.length} row(s) selected
            </span>
          )}
        </div>
        <div className="space-x-2">
          <Button
            onClick={handleBulkAction}
            disabled={selectedRows.length === 0}
            variant="primary"
          >
            Bulk Action
          </Button>
          <Button
            onClick={() => setSelectedRows([])}
            disabled={selectedRows.length === 0}
            variant="outline"
          >
            Clear Selection
          </Button>
        </div>
      </div>
      
      <DataGrid
        data={data}
        columns={columns}
        selectable={true}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        selectAllLabel="Select all tasks"
      />
    </div>
  );
}
```

### 5. Paginated Grid

```tsx
import { DataGrid } from "@dainabase/ui";
import { useState, useEffect } from "react";

export default function PaginatedExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  
  // Generate sample data
  const allData = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    customer: `Customer ${i + 1}`,
    orderDate: new Date(2025, 7, Math.floor(Math.random() * 30) + 1).toLocaleDateString(),
    amount: Math.floor(Math.random() * 1000) + 100,
    status: ["Pending", "Processing", "Shipped", "Delivered"][Math.floor(Math.random() * 4)],
  }));

  const columns = [
    { key: "id", header: "Order ID", width: 100 },
    { key: "customer", header: "Customer" },
    { key: "orderDate", header: "Order Date" },
    { 
      key: "amount", 
      header: "Amount",
      align: "right",
      format: (value: number) => `$${value.toLocaleString()}`
    },
    { key: "status", header: "Status" },
  ];

  return (
    <DataGrid
      data={allData}
      columns={columns}
      pagination={true}
      pageSize={pageSize}
      currentPage={currentPage}
      totalItems={allData.length}
      onPageChange={setCurrentPage}
      onPageSizeChange={setPageSize}
      pageSizeOptions={[5, 10, 20, 50]}
      showPageSizeSelector={true}
    />
  );
}
```

### 6. Editable Grid

```tsx
import { DataGrid, Button } from "@dainabase/ui";
import { useState } from "react";

export default function EditableExample() {
  const [data, setData] = useState([
    { id: 1, product: "Widget A", quantity: 10, price: 25.00 },
    { id: 2, product: "Widget B", quantity: 5, price: 35.00 },
    { id: 3, product: "Widget C", quantity: 15, price: 20.00 },
  ]);

  const columns = [
    { key: "product", header: "Product", editable: false },
    { 
      key: "quantity", 
      header: "Quantity", 
      editable: true,
      editType: "number",
      validation: (value: number) => value > 0 ? null : "Must be positive"
    },
    { 
      key: "price", 
      header: "Price", 
      editable: true,
      editType: "number",
      format: (value: number) => `$${value.toFixed(2)}`,
      validation: (value: number) => value >= 0 ? null : "Cannot be negative"
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      format: (value: any, row: any) => `$${(row.quantity * row.price).toFixed(2)}`,
      editable: false
    }
  ];

  const handleCellEdit = (rowId: number, field: string, value: any) => {
    setData(prev => prev.map(row => 
      row.id === rowId ? { ...row, [field]: value } : row
    ));
  };

  const handleSave = () => {
    console.log("Saving data:", data);
    alert("Changes saved!");
  };

  return (
    <div className="space-y-4">
      <DataGrid
        data={data}
        columns={columns}
        editable={true}
        onCellEdit={handleCellEdit}
        editMode="cell"
        showEditIndicator={true}
      />
      <div className="flex justify-end">
        <Button onClick={handleSave} variant="primary">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
```

### 7. Custom Cell Renderers

```tsx
import { DataGrid, Avatar, Badge, Progress } from "@dainabase/ui";

export default function CustomRenderersExample() {
  const data = [
    {
      id: 1,
      user: { name: "Alice Johnson", avatar: "/avatars/alice.jpg", email: "alice@example.com" },
      performance: 85,
      tags: ["React", "TypeScript", "Node.js"],
      status: "online"
    },
    {
      id: 2,
      user: { name: "Bob Smith", avatar: "/avatars/bob.jpg", email: "bob@example.com" },
      performance: 92,
      tags: ["Python", "Django", "PostgreSQL"],
      status: "busy"
    },
    {
      id: 3,
      user: { name: "Carol White", avatar: "/avatars/carol.jpg", email: "carol@example.com" },
      performance: 78,
      tags: ["Vue", "Firebase", "GraphQL"],
      status: "offline"
    },
  ];

  const columns = [
    {
      key: "user",
      header: "User",
      cellRenderer: (user: any) => (
        <div className="flex items-center gap-3">
          <Avatar src={user.avatar} alt={user.name} size="sm" />
          <div>
            <div className="font-semibold">{user.name}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
      width: 250
    },
    {
      key: "performance",
      header: "Performance",
      cellRenderer: (value: number) => (
        <div className="w-full">
          <Progress value={value} max={100} className="h-2" />
          <span className="text-xs text-gray-600">{value}%</span>
        </div>
      ),
      width: 150
    },
    {
      key: "tags",
      header: "Skills",
      cellRenderer: (tags: string[]) => (
        <div className="flex gap-1 flex-wrap">
          {tags.map((tag, i) => (
            <Badge key={i} variant="secondary" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      cellRenderer: (status: string) => (
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full bg-${status === 'online' ? 'green' : status === 'busy' ? 'yellow' : 'gray'}-500`} />
          <span className="capitalize">{status}</span>
        </div>
      ),
      width: 100
    }
  ];

  return (
    <DataGrid
      data={data}
      columns={columns}
      rowHeight={60}
      showGridLines={false}
    />
  );
}
```

### 8. Grouped Headers

```tsx
import { DataGrid } from "@dainabase/ui";

export default function GroupedHeadersExample() {
  const data = [
    {
      id: 1,
      q1Sales: 50000,
      q1Profit: 12000,
      q2Sales: 55000,
      q2Profit: 14000,
      q3Sales: 60000,
      q3Profit: 15000,
      q4Sales: 70000,
      q4Profit: 18000,
    },
    // More rows...
  ];

  const columns = [
    { key: "id", header: "ID", rowSpan: 2 },
    {
      header: "Q1",
      colSpan: 2,
      children: [
        { key: "q1Sales", header: "Sales", format: (v: number) => `$${v.toLocaleString()}` },
        { key: "q1Profit", header: "Profit", format: (v: number) => `$${v.toLocaleString()}` },
      ]
    },
    {
      header: "Q2",
      colSpan: 2,
      children: [
        { key: "q2Sales", header: "Sales", format: (v: number) => `$${v.toLocaleString()}` },
        { key: "q2Profit", header: "Profit", format: (v: number) => `$${v.toLocaleString()}` },
      ]
    },
    {
      header: "Q3",
      colSpan: 2,
      children: [
        { key: "q3Sales", header: "Sales", format: (v: number) => `$${v.toLocaleString()}` },
        { key: "q3Profit", header: "Profit", format: (v: number) => `$${v.toLocaleString()}` },
      ]
    },
    {
      header: "Q4",
      colSpan: 2,
      children: [
        { key: "q4Sales", header: "Sales", format: (v: number) => `$${v.toLocaleString()}` },
        { key: "q4Profit", header: "Profit", format: (v: number) => `$${v.toLocaleString()}` },
      ]
    },
  ];

  return (
    <DataGrid
      data={data}
      columns={columns}
      groupedHeaders={true}
      stickyHeader={true}
    />
  );
}
```

### 9. Export Functionality

```tsx
import { DataGrid, Button } from "@dainabase/ui";
import { useState } from "react";

export default function ExportExample() {
  const data = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    category: ["Electronics", "Clothing", "Food", "Books"][i % 4],
    price: Math.floor(Math.random() * 900) + 100,
    stock: Math.floor(Math.random() * 100),
  }));

  const columns = [
    { key: "id", header: "ID" },
    { key: "name", header: "Product Name" },
    { key: "category", header: "Category" },
    { key: "price", header: "Price", format: (v: number) => `$${v}` },
    { key: "stock", header: "Stock" },
  ];

  const handleExport = (format: 'csv' | 'excel' | 'json') => {
    // Export logic would be implemented here
    console.log(`Exporting as ${format}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button onClick={() => handleExport('csv')} variant="outline" size="sm">
          Export CSV
        </Button>
        <Button onClick={() => handleExport('excel')} variant="outline" size="sm">
          Export Excel
        </Button>
        <Button onClick={() => handleExport('json')} variant="outline" size="sm">
          Export JSON
        </Button>
      </div>
      
      <DataGrid
        data={data}
        columns={columns}
        exportable={true}
        onExport={handleExport}
      />
    </div>
  );
}
```

### 10. Virtualized Large Dataset

```tsx
import { DataGrid } from "@dainabase/ui";
import { useMemo } from "react";

export default function VirtualizedExample() {
  // Generate large dataset
  const data = useMemo(() => 
    Array.from({ length: 10000 }, (_, i) => ({
      id: i + 1,
      company: `Company ${i + 1}`,
      revenue: Math.floor(Math.random() * 1000000),
      employees: Math.floor(Math.random() * 10000),
      founded: 1900 + Math.floor(Math.random() * 125),
      industry: ["Tech", "Finance", "Healthcare", "Retail", "Manufacturing"][i % 5],
    })),
    []
  );

  const columns = [
    { key: "id", header: "ID", width: 80, frozen: true },
    { key: "company", header: "Company", width: 200 },
    { 
      key: "revenue", 
      header: "Revenue",
      align: "right",
      format: (v: number) => `$${v.toLocaleString()}`
    },
    { 
      key: "employees", 
      header: "Employees",
      align: "right",
      format: (v: number) => v.toLocaleString()
    },
    { key: "founded", header: "Founded", align: "center" },
    { key: "industry", header: "Industry" },
  ];

  return (
    <div className="h-[600px]">
      <DataGrid
        data={data}
        columns={columns}
        virtualized={true}
        rowHeight={40}
        overscan={5}
        showRowNumbers={true}
        stickyHeader={true}
      />
    </div>
  );
}
```

## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | `[]` | Array of data objects |
| `columns` | `Column[]` | `[]` | Column configuration array |
| `selectable` | `boolean` | `false` | Enable row selection |
| `selectedRows` | `number[]` | `[]` | Selected row IDs (controlled) |
| `onSelectionChange` | `(rows: number[]) => void` | `undefined` | Selection change callback |
| `sortable` | `boolean` | `true` | Enable column sorting |
| `defaultSort` | `{ key: string, direction: 'asc' \| 'desc' }` | `undefined` | Default sort configuration |
| `onSort` | `(config: SortConfig) => void` | `undefined` | Sort change callback |
| `filterable` | `boolean` | `false` | Enable column filtering |
| `showFilters` | `boolean` | `false` | Show filter row |
| `filterPosition` | `"top" \| "inline"` | `"top"` | Filter UI position |
| `onFilter` | `(filters: FilterConfig) => void` | `undefined` | Filter change callback |
| `pagination` | `boolean` | `false` | Enable pagination |
| `pageSize` | `number` | `10` | Items per page |
| `currentPage` | `number` | `1` | Current page number |
| `totalItems` | `number` | `undefined` | Total number of items |
| `onPageChange` | `(page: number) => void` | `undefined` | Page change callback |
| `pageSizeOptions` | `number[]` | `[10, 20, 50, 100]` | Page size options |
| `editable` | `boolean` | `false` | Enable cell editing |
| `editMode` | `"cell" \| "row"` | `"cell"` | Edit mode type |
| `onCellEdit` | `(rowId: any, field: string, value: any) => void` | `undefined` | Cell edit callback |
| `virtualized` | `boolean` | `false` | Enable virtualization for large datasets |
| `rowHeight` | `number` | `48` | Height of each row in pixels |
| `overscan` | `number` | `3` | Number of rows to render outside viewport |
| `stickyHeader` | `boolean` | `false` | Make header sticky on scroll |
| `showRowNumbers` | `boolean` | `false` | Show row numbers column |
| `striped` | `boolean` | `false` | Alternate row colors |
| `bordered` | `boolean` | `false` | Show cell borders |
| `showGridLines` | `boolean` | `true` | Show grid lines |
| `loading` | `boolean` | `false` | Show loading state |
| `emptyMessage` | `string` | `"No data available"` | Message when no data |
| `className` | `string` | `undefined` | Additional CSS classes |
| `exportable` | `boolean` | `false` | Enable export functionality |
| `onExport` | `(format: string) => void` | `undefined` | Export callback |
| `groupedHeaders` | `boolean` | `false` | Enable grouped column headers |
| `frozenColumns` | `number` | `0` | Number of frozen columns from left |

## Accessibility

The DataGrid component follows WCAG 2.1 Level AA guidelines:

- **Keyboard Navigation**: Full keyboard support with arrow keys, Tab, Enter
- **Screen Readers**: Proper ARIA grid roles and labels
- **Focus Management**: Clear focus indicators for cells
- **Sort Indicators**: Accessible sort direction announcements
- **Filter Controls**: Accessible filter inputs with labels

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate to next cell/control |
| `Shift+Tab` | Navigate to previous cell/control |
| `Arrow Keys` | Navigate between cells |
| `Enter` | Edit cell / Confirm edit |
| `Escape` | Cancel edit |
| `Space` | Toggle row selection |
| `Ctrl+A` | Select all rows |
| `Page Up/Down` | Navigate pages |

## Best Practices

### Do's ✅

- **Use virtualization** for datasets > 1000 rows
- **Provide clear column headers** with proper labels
- **Use appropriate data types** for sorting/filtering
- **Include loading states** for async data
- **Implement pagination** for better performance
- **Use memoization** for expensive cell renderers
- **Provide export options** for data portability
- **Test with keyboard navigation**

### Don'ts ❌

- **Don't render too many columns** without horizontal scroll
- **Don't use inline functions** for cell renderers
- **Don't forget error boundaries** for custom renderers
- **Don't ignore mobile responsiveness**
- **Don't skip validation** for editable cells
- **Don't load all data** at once for large datasets
- **Don't forget to debounce** filter inputs
- **Don't override native table semantics**

## Use Cases

1. **Admin Dashboards** - User management, analytics
2. **Financial Reports** - Transactions, invoices
3. **Inventory Management** - Product catalogs
4. **CRM Systems** - Customer data, contacts
5. **Analytics Platforms** - Metrics, KPIs
6. **E-commerce** - Order management
7. **HR Systems** - Employee records
8. **Project Management** - Task tracking
9. **Log Viewers** - System logs, audit trails
10. **Data Analysis** - Scientific data, research

## Performance Considerations

- **Use virtualization** for large datasets (> 1000 rows)
- **Debounce filter/search** inputs (300ms recommended)
- **Memoize computed values** in cell renderers
- **Lazy load** data for pagination
- **Use web workers** for heavy data processing
- **Implement virtual scrolling** for infinite lists

## Related Components

- [Table](./table) - Simple table component
- [DataGridAdvanced](./data-grid-advanced) - Advanced features
- [Pagination](./pagination) - Standalone pagination
- [Select](./select) - Filter dropdowns
- [Input](./input) - Filter inputs
- [Button](./button) - Action buttons
- [Checkbox](./checkbox) - Row selection