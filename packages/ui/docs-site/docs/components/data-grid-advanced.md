---
id: data-grid-advanced
title: DataGridAdvanced
sidebar_position: 41
---

import { DataGridAdvanced } from "@dainabase/ui";

An enterprise-grade data grid component with advanced features including column resizing, row grouping, aggregations, pivot tables, and Excel-like functionality.

## Preview

<ComponentPreview>
  <DataGridAdvanced
    data={salesData}
    columns={columns}
    enableGrouping={true}
    enableAggregation={true}
    enableColumnResize={true}
    enableExcelFeatures={true}
  />
</ComponentPreview>

## Features

- 📊 **Row Grouping** - Multi-level grouping with expand/collapse
- 📈 **Aggregations** - Sum, avg, min, max, count operations
- 🔄 **Pivot Tables** - Transform rows to columns dynamically
- 📏 **Column Resizing** - Drag to resize columns
- 🎯 **Advanced Filtering** - Complex filter expressions and conditions
- 📌 **Column Pinning** - Freeze columns left or right
- 📝 **Excel Features** - Copy/paste, cell formulas, auto-fill
- 🎨 **Conditional Formatting** - Rule-based cell styling
- 🔍 **Master-Detail Views** - Nested grids and detail panels
- ⚡ **High Performance** - Virtual scrolling for millions of rows

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```tsx
import { DataGridAdvanced } from "@dainabase/ui";

function AdvancedGrid() {
  const data = [
    { region: "North", product: "Widget A", sales: 1000, profit: 200 },
    { region: "North", product: "Widget B", sales: 1500, profit: 350 },
    { region: "South", product: "Widget A", sales: 800, profit: 150 },
  ];

  const columns = [
    { field: "region", headerName: "Region", groupable: true },
    { field: "product", headerName: "Product" },
    { field: "sales", headerName: "Sales", aggregatable: true },
    { field: "profit", headerName: "Profit", aggregatable: true },
  ];

  return (
    <DataGridAdvanced
      data={data}
      columns={columns}
      enableGrouping={true}
      enableAggregation={true}
    />
  );
}
```

## Examples

### 1. Row Grouping with Aggregations

```tsx
import { DataGridAdvanced } from "@dainabase/ui";
import { useState } from "react";

export default function GroupingExample() {
  const [data] = useState([
    { department: "Engineering", team: "Frontend", employee: "Alice", salary: 95000, performance: 92 },
    { department: "Engineering", team: "Frontend", employee: "Bob", salary: 85000, performance: 88 },
    { department: "Engineering", team: "Backend", employee: "Charlie", salary: 105000, performance: 95 },
    { department: "Engineering", team: "Backend", employee: "David", salary: 98000, performance: 90 },
    { department: "Sales", team: "Inside", employee: "Eve", salary: 75000, performance: 85 },
    { department: "Sales", team: "Inside", employee: "Frank", salary: 70000, performance: 82 },
    { department: "Sales", team: "Field", employee: "Grace", salary: 80000, performance: 88 },
    { department: "Sales", team: "Field", employee: "Henry", salary: 85000, performance: 91 },
  ]);

  const columns = [
    { 
      field: "department", 
      headerName: "Department",
      groupable: true,
      width: 150
    },
    { 
      field: "team", 
      headerName: "Team",
      groupable: true,
      width: 120
    },
    { 
      field: "employee", 
      headerName: "Employee",
      width: 150
    },
    { 
      field: "salary", 
      headerName: "Salary",
      aggregatable: true,
      aggregations: ["sum", "avg", "min", "max"],
      valueFormatter: (params: any) => `$${params.value?.toLocaleString() || 0}`,
      width: 120
    },
    { 
      field: "performance", 
      headerName: "Performance",
      aggregatable: true,
      aggregations: ["avg"],
      valueFormatter: (params: any) => `${params.value || 0}%`,
      width: 120
    }
  ];

  return (
    <DataGridAdvanced
      data={data}
      columns={columns}
      enableGrouping={true}
      defaultGroupBy={["department"]}
      enableAggregation={true}
      showGroupingControls={true}
      groupExpandDefault={true}
      rowHeight={40}
      headerHeight={48}
      showAggregationFooter={true}
    />
  );
}
```

### 2. Pivot Table

```tsx
import { DataGridAdvanced } from "@dainabase/ui";

export default function PivotExample() {
  const salesData = [
    { year: 2023, quarter: "Q1", region: "North", product: "A", amount: 50000 },
    { year: 2023, quarter: "Q1", region: "North", product: "B", amount: 30000 },
    { year: 2023, quarter: "Q1", region: "South", product: "A", amount: 45000 },
    { year: 2023, quarter: "Q1", region: "South", product: "B", amount: 35000 },
    { year: 2023, quarter: "Q2", region: "North", product: "A", amount: 55000 },
    { year: 2023, quarter: "Q2", region: "North", product: "B", amount: 32000 },
    { year: 2023, quarter: "Q2", region: "South", product: "A", amount: 48000 },
    { year: 2023, quarter: "Q2", region: "South", product: "B", amount: 38000 },
    { year: 2024, quarter: "Q1", region: "North", product: "A", amount: 60000 },
    { year: 2024, quarter: "Q1", region: "North", product: "B", amount: 35000 },
    { year: 2024, quarter: "Q1", region: "South", product: "A", amount: 52000 },
    { year: 2024, quarter: "Q1", region: "South", product: "B", amount: 40000 },
  ];

  const pivotConfig = {
    rows: ["year", "quarter"],
    columns: ["region", "product"],
    values: [
      {
        field: "amount",
        aggregation: "sum",
        formatter: (value: number) => `$${value.toLocaleString()}`
      }
    ],
    showRowTotals: true,
    showColumnTotals: true,
    expandAllRows: true,
    expandAllColumns: true,
  };

  return (
    <DataGridAdvanced
      data={salesData}
      pivotMode={true}
      pivotConfig={pivotConfig}
      enableExport={true}
      exportFormats={["excel", "csv"]}
      height={600}
    />
  );
}
```

### 3. Column Resizing and Pinning

```tsx
import { DataGridAdvanced } from "@dainabase/ui";
import { useState } from "react";

export default function ResizePinExample() {
  const [pinnedColumns, setPinnedColumns] = useState({
    left: ["id", "name"],
    right: ["actions"]
  });

  const data = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `Customer ${i + 1}`,
    email: `customer${i + 1}@example.com`,
    phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    address: `${Math.floor(Math.random() * 9999)} Main St`,
    city: ["New York", "Los Angeles", "Chicago", "Houston"][i % 4],
    state: ["NY", "CA", "IL", "TX"][i % 4],
    orders: Math.floor(Math.random() * 100),
    revenue: Math.floor(Math.random() * 100000),
    lastOrder: new Date(2025, Math.floor(Math.random() * 8), Math.floor(Math.random() * 30)).toLocaleDateString(),
    status: ["Active", "Inactive", "Pending"][Math.floor(Math.random() * 3)],
  }));

  const columns = [
    { field: "id", headerName: "ID", width: 70, resizable: false },
    { field: "name", headerName: "Name", width: 150, resizable: true, minWidth: 100, maxWidth: 300 },
    { field: "email", headerName: "Email", width: 200, resizable: true },
    { field: "phone", headerName: "Phone", width: 140, resizable: true },
    { field: "address", headerName: "Address", width: 180, resizable: true },
    { field: "city", headerName: "City", width: 120, resizable: true },
    { field: "state", headerName: "State", width: 80, resizable: true },
    { field: "orders", headerName: "Orders", width: 100, resizable: true, type: "number" },
    { 
      field: "revenue", 
      headerName: "Revenue", 
      width: 120, 
      resizable: true,
      valueFormatter: (params: any) => `$${params.value?.toLocaleString() || 0}`
    },
    { field: "lastOrder", headerName: "Last Order", width: 120, resizable: true },
    { field: "status", headerName: "Status", width: 100, resizable: true },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      resizable: false,
      cellRenderer: () => (
        <div className="flex gap-1">
          <button className="px-2 py-1 text-xs bg-blue-500 text-white rounded">Edit</button>
          <button className="px-2 py-1 text-xs bg-red-500 text-white rounded">Delete</button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-4 p-4 bg-gray-50 rounded">
        <button 
          onClick={() => setPinnedColumns({ left: ["id", "name"], right: ["actions"] })}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Pin ID & Name Left
        </button>
        <button 
          onClick={() => setPinnedColumns({ left: [], right: [] })}
          className="px-3 py-1 bg-gray-500 text-white rounded"
        >
          Unpin All
        </button>
      </div>
      
      <DataGridAdvanced
        data={data}
        columns={columns}
        enableColumnResize={true}
        enableColumnReorder={true}
        pinnedColumns={pinnedColumns}
        showColumnMenu={true}
        height={500}
        columnBuffer={5}
      />
    </div>
  );
}
```

### 4. Excel-like Features

```tsx
import { DataGridAdvanced } from "@dainabase/ui";
import { useState } from "react";

export default function ExcelFeaturesExample() {
  const [data, setData] = useState([
    { item: "Product A", quantity: 10, price: 25.00, formula: "=B2*C2" },
    { item: "Product B", quantity: 5, price: 35.00, formula: "=B3*C3" },
    { item: "Product C", quantity: 15, price: 20.00, formula: "=B4*C4" },
    { item: "Product D", quantity: 8, price: 45.00, formula: "=B5*C5" },
    { item: "Total", quantity: "=SUM(B2:B5)", price: "=AVERAGE(C2:C5)", formula: "=SUM(D2:D5)" },
  ]);

  const columns = [
    { 
      field: "item", 
      headerName: "Item",
      width: 150,
      cellClassName: "font-semibold"
    },
    { 
      field: "quantity", 
      headerName: "Quantity",
      width: 120,
      editable: true,
      type: "number",
      cellEditor: "number"
    },
    { 
      field: "price", 
      headerName: "Price",
      width: 120,
      editable: true,
      type: "number",
      valueFormatter: (params: any) => {
        if (typeof params.value === 'number') {
          return `$${params.value.toFixed(2)}`;
        }
        return params.value;
      }
    },
    { 
      field: "formula", 
      headerName: "Total",
      width: 120,
      editable: true,
      formulaEnabled: true,
      valueGetter: (params: any) => {
        // Formula evaluation logic
        if (params.data.formula?.startsWith('=')) {
          return evaluateFormula(params.data.formula, data);
        }
        return params.value;
      },
      valueFormatter: (params: any) => {
        if (typeof params.value === 'number') {
          return `$${params.value.toFixed(2)}`;
        }
        return params.value;
      }
    }
  ];

  const evaluateFormula = (formula: string, data: any[]) => {
    // Simplified formula evaluation
    if (formula === "=B2*C2") return data[0].quantity * data[0].price;
    if (formula === "=B3*C3") return data[1].quantity * data[1].price;
    if (formula === "=B4*C4") return data[2].quantity * data[2].price;
    if (formula === "=B5*C5") return data[3].quantity * data[3].price;
    if (formula === "=SUM(D2:D5)") {
      return data.slice(0, 4).reduce((sum, row) => {
        const total = row.quantity * row.price;
        return sum + (isNaN(total) ? 0 : total);
      }, 0);
    }
    return 0;
  };

  return (
    <DataGridAdvanced
      data={data}
      columns={columns}
      enableExcelFeatures={true}
      enableCopyPaste={true}
      enableAutoFill={true}
      enableFormulas={true}
      enableCellSelection={true}
      onCellValueChange={(params) => {
        console.log("Cell changed:", params);
        setData([...data]);
      }}
      showFormulaBar={true}
      contextMenuItems={[
        "copy",
        "paste",
        "cut",
        "separator",
        "insertRowAbove",
        "insertRowBelow",
        "deleteRow",
        "separator",
        "insertColumnLeft",
        "insertColumnRight",
        "deleteColumn"
      ]}
    />
  );
}
```

### 5. Conditional Formatting

```tsx
import { DataGridAdvanced } from "@dainabase/ui";

export default function ConditionalFormattingExample() {
  const data = Array.from({ length: 30 }, (_, i) => ({
    student: `Student ${i + 1}`,
    math: Math.floor(Math.random() * 40) + 60,
    science: Math.floor(Math.random() * 40) + 60,
    english: Math.floor(Math.random() * 40) + 60,
    history: Math.floor(Math.random() * 40) + 60,
    average: 0, // Will be calculated
  }));

  // Calculate averages
  data.forEach(row => {
    row.average = Math.round((row.math + row.science + row.english + row.history) / 4);
  });

  const columns = [
    { field: "student", headerName: "Student", width: 150 },
    { 
      field: "math", 
      headerName: "Math",
      width: 100,
      cellClass: (params: any) => {
        if (params.value >= 90) return "bg-green-100 text-green-800";
        if (params.value >= 80) return "bg-blue-100 text-blue-800";
        if (params.value >= 70) return "bg-yellow-100 text-yellow-800";
        return "bg-red-100 text-red-800";
      }
    },
    { 
      field: "science", 
      headerName: "Science",
      width: 100,
      cellClass: (params: any) => {
        if (params.value >= 90) return "bg-green-100 text-green-800";
        if (params.value >= 80) return "bg-blue-100 text-blue-800";
        if (params.value >= 70) return "bg-yellow-100 text-yellow-800";
        return "bg-red-100 text-red-800";
      }
    },
    { 
      field: "english", 
      headerName: "English",
      width: 100,
      cellClass: (params: any) => {
        if (params.value >= 90) return "bg-green-100 text-green-800";
        if (params.value >= 80) return "bg-blue-100 text-blue-800";
        if (params.value >= 70) return "bg-yellow-100 text-yellow-800";
        return "bg-red-100 text-red-800";
      }
    },
    { 
      field: "history", 
      headerName: "History",
      width: 100,
      cellClass: (params: any) => {
        if (params.value >= 90) return "bg-green-100 text-green-800";
        if (params.value >= 80) return "bg-blue-100 text-blue-800";
        if (params.value >= 70) return "bg-yellow-100 text-yellow-800";
        return "bg-red-100 text-red-800";
      }
    },
    { 
      field: "average", 
      headerName: "Average",
      width: 100,
      cellRenderer: (params: any) => (
        <div className={`font-bold ${params.value >= 85 ? 'text-green-600' : params.value >= 75 ? 'text-blue-600' : 'text-gray-600'}`}>
          {params.value}%
        </div>
      )
    }
  ];

  const conditionalStyles = [
    {
      condition: (params: any) => params.value >= 95,
      style: { backgroundColor: "#10B981", color: "white", fontWeight: "bold" }
    },
    {
      condition: (params: any) => params.value < 70,
      style: { backgroundColor: "#EF4444", color: "white" }
    }
  ];

  return (
    <DataGridAdvanced
      data={data}
      columns={columns}
      conditionalFormatting={conditionalStyles}
      enableHeatmap={true}
      heatmapColumns={["math", "science", "english", "history"]}
      showLegend={true}
      legendItems={[
        { label: "Excellent (90+)", color: "#10B981" },
        { label: "Good (80-89)", color: "#3B82F6" },
        { label: "Average (70-79)", color: "#F59E0B" },
        { label: "Below Average (<70)", color: "#EF4444" }
      ]}
    />
  );
}
```

### 6. Master-Detail View

```tsx
import { DataGridAdvanced } from "@dainabase/ui";
import { useState } from "react";

export default function MasterDetailExample() {
  const orders = [
    {
      id: 1,
      orderNumber: "ORD-001",
      customer: "Acme Corp",
      date: "2025-08-01",
      total: 2500,
      status: "Delivered",
      items: [
        { product: "Widget A", quantity: 10, price: 100 },
        { product: "Widget B", quantity: 5, price: 150 },
        { product: "Widget C", quantity: 8, price: 100 },
      ]
    },
    {
      id: 2,
      orderNumber: "ORD-002",
      customer: "TechCo",
      date: "2025-08-02",
      total: 3200,
      status: "Processing",
      items: [
        { product: "Gadget X", quantity: 3, price: 500 },
        { product: "Gadget Y", quantity: 7, price: 200 },
        { product: "Gadget Z", quantity: 2, price: 150 },
      ]
    },
    {
      id: 3,
      orderNumber: "ORD-003",
      customer: "Global Inc",
      date: "2025-08-03",
      total: 1800,
      status: "Pending",
      items: [
        { product: "Tool A", quantity: 15, price: 50 },
        { product: "Tool B", quantity: 10, price: 70 },
        { product: "Tool C", quantity: 5, price: 70 },
      ]
    }
  ];

  const masterColumns = [
    { field: "orderNumber", headerName: "Order #", width: 120 },
    { field: "customer", headerName: "Customer", width: 150 },
    { field: "date", headerName: "Date", width: 120 },
    { 
      field: "total", 
      headerName: "Total",
      width: 120,
      valueFormatter: (params: any) => `$${params.value?.toLocaleString() || 0}`
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      cellRenderer: (params: any) => (
        <span className={`px-2 py-1 rounded text-xs ${
          params.value === 'Delivered' ? 'bg-green-100 text-green-800' :
          params.value === 'Processing' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {params.value}
        </span>
      )
    }
  ];

  const detailColumns = [
    { field: "product", headerName: "Product", width: 150 },
    { field: "quantity", headerName: "Quantity", width: 100 },
    { 
      field: "price", 
      headerName: "Unit Price",
      width: 120,
      valueFormatter: (params: any) => `$${params.value}`
    },
    { 
      field: "total", 
      headerName: "Total",
      width: 120,
      valueGetter: (params: any) => params.data.quantity * params.data.price,
      valueFormatter: (params: any) => `$${params.value}`
    }
  ];

  const detailRenderer = (params: any) => (
    <div className="p-4 bg-gray-50">
      <h3 className="text-sm font-semibold mb-2">Order Items</h3>
      <DataGridAdvanced
        data={params.data.items}
        columns={detailColumns}
        height={200}
        hideFooter={true}
        density="compact"
      />
    </div>
  );

  return (
    <DataGridAdvanced
      data={orders}
      columns={masterColumns}
      masterDetail={true}
      detailRenderer={detailRenderer}
      detailRowHeight={250}
      defaultExpandedRows={[1]}
    />
  );
}
```

### 7. Advanced Filtering

```tsx
import { DataGridAdvanced } from "@dainabase/ui";
import { useState } from "react";

export default function AdvancedFilteringExample() {
  const data = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    product: `Product ${String.fromCharCode(65 + (i % 26))}`,
    category: ["Electronics", "Clothing", "Food", "Books", "Toys"][i % 5],
    price: Math.floor(Math.random() * 900) + 100,
    stock: Math.floor(Math.random() * 100),
    rating: (Math.random() * 2 + 3).toFixed(1),
    discount: Math.floor(Math.random() * 50),
    available: Math.random() > 0.3,
  }));

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "product", headerName: "Product", width: 150 },
    { field: "category", headerName: "Category", width: 120 },
    { field: "price", headerName: "Price", width: 100 },
    { field: "stock", headerName: "Stock", width: 100 },
    { field: "rating", headerName: "Rating", width: 100 },
    { field: "discount", headerName: "Discount %", width: 120 },
    { 
      field: "available", 
      headerName: "Available",
      width: 100,
      cellRenderer: (params: any) => params.value ? "✅" : "❌"
    }
  ];

  const filterModel = {
    items: [
      {
        field: "category",
        operator: "equals",
        value: "Electronics"
      },
      {
        field: "price",
        operator: "greaterThan",
        value: 500
      }
    ],
    logicOperator: "AND"
  };

  const customFilters = {
    price: {
      type: "number",
      operators: ["equals", "notEqual", "greaterThan", "lessThan", "between"],
      defaultOperator: "greaterThan"
    },
    category: {
      type: "select",
      options: ["Electronics", "Clothing", "Food", "Books", "Toys"],
      multiSelect: true
    },
    rating: {
      type: "slider",
      min: 3,
      max: 5,
      step: 0.1
    },
    available: {
      type: "boolean"
    }
  };

  return (
    <DataGridAdvanced
      data={data}
      columns={columns}
      enableAdvancedFiltering={true}
      filterModel={filterModel}
      customFilters={customFilters}
      showFilterPanel={true}
      quickFilterPlaceholder="Quick search..."
      enableFilterPresets={true}
      filterPresets={[
        { name: "High Value", filters: { price: { operator: ">", value: 700 } } },
        { name: "Low Stock", filters: { stock: { operator: "<", value: 20 } } },
        { name: "Top Rated", filters: { rating: { operator: ">=", value: 4.5 } } }
      ]}
    />
  );
}
```

### 8. Tree Data

```tsx
import { DataGridAdvanced } from "@dainabase/ui";

export default function TreeDataExample() {
  const treeData = [
    {
      id: 1,
      name: "Company",
      type: "root",
      employees: 500,
      budget: 10000000,
      children: [
        {
          id: 2,
          name: "Engineering",
          type: "department",
          employees: 200,
          budget: 4000000,
          children: [
            { id: 3, name: "Frontend Team", type: "team", employees: 50, budget: 1000000 },
            { id: 4, name: "Backend Team", type: "team", employees: 60, budget: 1200000 },
            { id: 5, name: "DevOps Team", type: "team", employees: 30, budget: 800000 },
            { id: 6, name: "QA Team", type: "team", employees: 60, budget: 1000000 },
          ]
        },
        {
          id: 7,
          name: "Sales",
          type: "department",
          employees: 150,
          budget: 3000000,
          children: [
            { id: 8, name: "Inside Sales", type: "team", employees: 80, budget: 1500000 },
            { id: 9, name: "Field Sales", type: "team", employees: 70, budget: 1500000 },
          ]
        },
        {
          id: 10,
          name: "Marketing",
          type: "department",
          employees: 80,
          budget: 2000000,
          children: [
            { id: 11, name: "Digital Marketing", type: "team", employees: 40, budget: 1000000 },
            { id: 12, name: "Content Team", type: "team", employees: 25, budget: 500000 },
            { id: 13, name: "Events Team", type: "team", employees: 15, budget: 500000 },
          ]
        },
        {
          id: 14,
          name: "HR",
          type: "department",
          employees: 70,
          budget: 1000000
        }
      ]
    }
  ];

  const columns = [
    { 
      field: "name", 
      headerName: "Organization",
      width: 250,
      treeData: true
    },
    { 
      field: "type", 
      headerName: "Type",
      width: 120,
      cellRenderer: (params: any) => (
        <span className={`px-2 py-1 rounded text-xs ${
          params.value === 'root' ? 'bg-purple-100 text-purple-800' :
          params.value === 'department' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {params.value}
        </span>
      )
    },
    { 
      field: "employees", 
      headerName: "Employees",
      width: 120,
      aggregation: "sum"
    },
    { 
      field: "budget", 
      headerName: "Budget",
      width: 150,
      aggregation: "sum",
      valueFormatter: (params: any) => `$${params.value?.toLocaleString() || 0}`
    }
  ];

  return (
    <DataGridAdvanced
      treeData={treeData}
      columns={columns}
      getDataPath={(data: any) => data.orgHierarchy}
      treeDataChildrenField="children"
      defaultExpanded={[1, 2, 7]}
      showTreeLines={true}
      animateRows={true}
      groupDefaultExpanded={1}
    />
  );
}
```

### 9. Custom Toolbar

```tsx
import { DataGridAdvanced, Button } from "@dainabase/ui";
import { useState } from "react";

export default function CustomToolbarExample() {
  const [density, setDensity] = useState<"compact" | "standard" | "comfortable">("standard");
  const [showGrid, setShowGrid] = useState(true);
  
  const data = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    task: `Task ${i + 1}`,
    assignee: ["Alice", "Bob", "Charlie", "David"][i % 4],
    priority: ["Low", "Medium", "High", "Critical"][i % 4],
    progress: Math.floor(Math.random() * 100),
    dueDate: new Date(2025, 8, Math.floor(Math.random() * 30) + 1).toLocaleDateString(),
  }));

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "task", headerName: "Task", width: 200 },
    { field: "assignee", headerName: "Assignee", width: 120 },
    { field: "priority", headerName: "Priority", width: 100 },
    { field: "progress", headerName: "Progress %", width: 120 },
    { field: "dueDate", headerName: "Due Date", width: 120 },
  ];

  const CustomToolbar = () => (
    <div className="flex items-center justify-between p-3 border-b">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => console.log("Add new")}>
          ➕ Add Task
        </Button>
        <Button size="sm" variant="outline" onClick={() => console.log("Refresh")}>
          🔄 Refresh
        </Button>
        <Button size="sm" variant="outline" onClick={() => console.log("Export")}>
          📥 Export
        </Button>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm">Density:</label>
          <select 
            value={density} 
            onChange={(e) => setDensity(e.target.value as any)}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="compact">Compact</option>
            <option value="standard">Standard</option>
            <option value="comfortable">Comfortable</option>
          </select>
        </div>
        
        <label className="flex items-center gap-2 text-sm">
          <input 
            type="checkbox" 
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
          />
          Show Grid Lines
        </label>
        
        <Button size="sm" variant="outline" onClick={() => console.log("Settings")}>
          ⚙️ Settings
        </Button>
      </div>
    </div>
  );

  return (
    <DataGridAdvanced
      data={data}
      columns={columns}
      customToolbar={CustomToolbar}
      density={density}
      showGridLines={showGrid}
      enableQuickFilter={true}
      enableColumnMenu={true}
      enableRangeSelection={true}
    />
  );
}
```

### 10. Performance with Virtual Scrolling

```tsx
import { DataGridAdvanced } from "@dainabase/ui";
import { useMemo } from "react";

export default function VirtualScrollExample() {
  // Generate massive dataset
  const bigData = useMemo(() => 
    Array.from({ length: 100000 }, (_, i) => ({
      id: i + 1,
      ticker: `TICK${String(i + 1).padStart(5, '0')}`,
      company: `Company ${i + 1}`,
      sector: ["Technology", "Finance", "Healthcare", "Energy", "Consumer"][i % 5],
      price: (Math.random() * 900 + 100).toFixed(2),
      change: (Math.random() * 10 - 5).toFixed(2),
      changePercent: (Math.random() * 10 - 5).toFixed(2),
      volume: Math.floor(Math.random() * 10000000),
      marketCap: Math.floor(Math.random() * 1000000000),
      pe: (Math.random() * 50).toFixed(2),
      eps: (Math.random() * 10).toFixed(2),
      dayHigh: (Math.random() * 900 + 100).toFixed(2),
      dayLow: (Math.random() * 900 + 100).toFixed(2),
    })),
    []
  );

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "ticker", headerName: "Ticker", width: 100 },
    { field: "company", headerName: "Company", width: 150 },
    { field: "sector", headerName: "Sector", width: 120 },
    { 
      field: "price", 
      headerName: "Price",
      width: 100,
      valueFormatter: (params: any) => `$${params.value}`
    },
    { 
      field: "change", 
      headerName: "Change",
      width: 100,
      cellClass: (params: any) => params.value >= 0 ? "text-green-600" : "text-red-600"
    },
    { 
      field: "changePercent", 
      headerName: "Change %",
      width: 100,
      cellClass: (params: any) => params.value >= 0 ? "text-green-600" : "text-red-600",
      valueFormatter: (params: any) => `${params.value}%`
    },
    { 
      field: "volume", 
      headerName: "Volume",
      width: 120,
      valueFormatter: (params: any) => params.value?.toLocaleString()
    },
    { 
      field: "marketCap", 
      headerName: "Market Cap",
      width: 150,
      valueFormatter: (params: any) => `$${(params.value / 1000000).toFixed(0)}M`
    },
  ];

  return (
    <div className="h-[700px]">
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm">
          📊 Rendering <strong>100,000 rows</strong> with virtual scrolling.
          Only visible rows are rendered for optimal performance.
        </p>
      </div>
      
      <DataGridAdvanced
        data={bigData}
        columns={columns}
        virtualScrolling={true}
        rowBuffer={10}
        maxBlocksInCache={10}
        cacheBlockSize={100}
        suppressRowClickSelection={true}
        animateRows={false}
        headerHeight={40}
        rowHeight={35}
        showRowCount={true}
        statusBar={{
          statusPanels: [
            { key: "totalRows", label: "Total Rows:" },
            { key: "selectedRows", label: "Selected:" },
            { key: "filteredRows", label: "Filtered:" },
            { key: "performance", label: "Render Time:" }
          ]
        }}
      />
    </div>
  );
}
```

## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `any[]` | `[]` | Data array or tree structure |
| `columns` | `ColumnDef[]` | `[]` | Column definitions |
| `enableGrouping` | `boolean` | `false` | Enable row grouping |
| `defaultGroupBy` | `string[]` | `[]` | Default grouping columns |
| `enableAggregation` | `boolean` | `false` | Enable aggregations |
| `pivotMode` | `boolean` | `false` | Enable pivot table mode |
| `pivotConfig` | `PivotConfig` | `undefined` | Pivot configuration |
| `enableColumnResize` | `boolean` | `false` | Enable column resizing |
| `enableColumnReorder` | `boolean` | `false` | Enable column reordering |
| `pinnedColumns` | `{ left: string[], right: string[] }` | `{}` | Pinned columns |
| `enableExcelFeatures` | `boolean` | `false` | Enable Excel-like features |
| `enableFormulas` | `boolean` | `false` | Enable cell formulas |
| `enableCopyPaste` | `boolean` | `false` | Enable copy/paste |
| `enableAutoFill` | `boolean` | `false` | Enable auto-fill |
| `conditionalFormatting` | `ConditionalRule[]` | `[]` | Conditional formatting rules |
| `masterDetail` | `boolean` | `false` | Enable master-detail view |
| `detailRenderer` | `(params: any) => ReactNode` | `undefined` | Detail row renderer |
| `treeData` | `boolean` | `false` | Enable tree data mode |
| `treeDataChildrenField` | `string` | `"children"` | Children field name |
| `enableAdvancedFiltering` | `boolean` | `false` | Enable advanced filters |
| `filterModel` | `FilterModel` | `undefined` | Filter configuration |
| `customFilters` | `object` | `{}` | Custom filter definitions |
| `virtualScrolling` | `boolean` | `false` | Enable virtual scrolling |
| `rowBuffer` | `number` | `10` | Buffer rows for scrolling |
| `density` | `"compact" \| "standard" \| "comfortable"` | `"standard"` | Row density |
| `customToolbar` | `() => ReactNode` | `undefined` | Custom toolbar component |
| `statusBar` | `StatusBarConfig` | `undefined` | Status bar configuration |
| `height` | `number \| string` | `"auto"` | Grid height |
| `animateRows` | `boolean` | `true` | Animate row changes |
| `enableRangeSelection` | `boolean` | `false` | Enable range selection |
| `onCellValueChange` | `(params: any) => void` | `undefined` | Cell value change callback |

## Accessibility

The DataGridAdvanced component is WCAG 2.1 Level AA compliant:

- **Grid Navigation**: Full keyboard support with arrow keys
- **Screen Readers**: Complete ARIA grid implementation
- **Focus Management**: Clear focus indicators
- **High Contrast**: Support for high contrast themes
- **Keyboard Shortcuts**: Extensive keyboard shortcuts

## Best Practices

### Do's ✅

- **Use virtual scrolling** for > 5000 rows
- **Enable column virtualization** for > 50 columns
- **Implement server-side operations** for large datasets
- **Use memoization** for custom renderers
- **Batch updates** for better performance
- **Provide loading indicators** for async operations
- **Use appropriate data types** for sorting
- **Test with large datasets** before production

### Don'ts ❌

- **Don't render complex components** in every cell
- **Don't use inline functions** for renderers
- **Don't update data** on every render
- **Don't ignore performance** metrics
- **Don't forget cleanup** for event listeners
- **Don't disable virtualization** unnecessarily
- **Don't use excessive animations** with large data
- **Don't forget to optimize** formulas

## Related Components

- [DataGrid](./data-grid) - Basic data grid
- [Table](./table) - Simple table component
- [Charts](./charts) - Data visualization
- [Pagination](./pagination) - Standalone pagination
- [Select](./select) - Filter controls
- [Button](./button) - Toolbar actions