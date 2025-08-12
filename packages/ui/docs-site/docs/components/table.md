---
id: table
title: Table
sidebar_position: 48
---

import { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption } from '@dainabase/ui';

# Table

A powerful and flexible table component for displaying structured data with support for sorting, filtering, pagination, and responsive layouts.

<div className="component-preview">
  <Table>
    <TableCaption>A list of recent transactions</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Invoice</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Method</TableHead>
        <TableHead className="text-right">Amount</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>INV-001</TableCell>
        <TableCell>Paid</TableCell>
        <TableCell>Credit Card</TableCell>
        <TableCell className="text-right">$250.00</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>

## Features

- **Responsive Design**: Adapts to mobile and desktop screens
- **Sortable Columns**: Click headers to sort data
- **Selectable Rows**: Single or multi-row selection
- **Pagination**: Built-in pagination support
- **Sticky Headers**: Keep headers visible while scrolling
- **Column Resizing**: Adjustable column widths
- **Row Actions**: Inline actions for each row
- **Virtualization**: Handle large datasets efficiently
- **Export Data**: Export to CSV/Excel formats
- **Accessibility**: Full keyboard navigation and screen reader support

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@dainabase/ui';

export function BasicTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>John Doe</TableCell>
          <TableCell>john@example.com</TableCell>
          <TableCell>Admin</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
```

## Examples

### Basic Table

```jsx live
function BasicTableExample() {
  const data = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Moderator' }
  ];

  return (
    <Table>
      <TableCaption>User Management Table</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.id}</TableCell>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded text-xs ${
                user.role === 'Admin' ? 'bg-red-100 text-red-700' :
                user.role === 'Moderator' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {user.role}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Sortable Table

```jsx live
function SortableTableExample() {
  const [data, setData] = useState([
    { id: 1, product: 'Laptop', price: 999, stock: 15 },
    { id: 2, product: 'Mouse', price: 29, stock: 150 },
    { id: 3, product: 'Keyboard', price: 79, stock: 45 },
    { id: 4, product: 'Monitor', price: 299, stock: 20 },
    { id: 5, product: 'Headphones', price: 99, stock: 75 }
  ]);
  
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setData(sorted);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead 
            onClick={() => handleSort('product')}
            className="cursor-pointer hover:bg-gray-50"
          >
            Product {sortConfig.key === 'product' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </TableHead>
          <TableHead 
            onClick={() => handleSort('price')}
            className="cursor-pointer hover:bg-gray-50"
          >
            Price {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </TableHead>
          <TableHead 
            onClick={() => handleSort('stock')}
            className="cursor-pointer hover:bg-gray-50"
          >
            Stock {sortConfig.key === 'stock' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.id}</TableCell>
            <TableCell className="font-medium">{item.product}</TableCell>
            <TableCell>${item.price}</TableCell>
            <TableCell>{item.stock}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Selectable Rows

```jsx live
function SelectableTableExample() {
  const [selected, setSelected] = useState([]);
  const data = [
    { id: 1, task: 'Review PR #123', status: 'In Progress', assignee: 'John' },
    { id: 2, task: 'Fix bug #456', status: 'Done', assignee: 'Jane' },
    { id: 3, task: 'Update documentation', status: 'Todo', assignee: 'Bob' },
    { id: 4, task: 'Deploy to staging', status: 'In Progress', assignee: 'Alice' }
  ];

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelected(prev =>
      prev.length === data.length ? [] : data.map(item => item.id)
    );
  };

  return (
    <div>
      {selected.length > 0 && (
        <div className="mb-4 p-2 bg-blue-50 rounded">
          {selected.length} item(s) selected
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={selected.length === data.length}
                onChange={toggleAll}
              />
            </TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assignee</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow 
              key={item.id}
              className={selected.includes(item.id) ? 'bg-blue-50' : ''}
            >
              <TableCell>
                <input
                  type="checkbox"
                  checked={selected.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                />
              </TableCell>
              <TableCell className="font-medium">{item.task}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded text-xs ${
                  item.status === 'Done' ? 'bg-green-100 text-green-700' :
                  item.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {item.status}
                </span>
              </TableCell>
              <TableCell>{item.assignee}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### Table with Pagination

```jsx live
function PaginatedTableExample() {
  const allData = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    date: new Date(2025, 0, i + 1).toLocaleDateString()
  }));

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(allData.length / itemsPerPage);

  const paginatedData = allData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Date Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, allData.length)} of {allData.length} entries
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1 ? 'bg-blue-500 text-white' : ''
              }`}
            >
              {i + 1}
            </button>
          )).slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Table with Row Actions

```jsx live
function TableWithActionsExample() {
  const [data, setData] = useState([
    { id: 1, file: 'document.pdf', size: '2.5 MB', modified: '2025-08-10' },
    { id: 2, file: 'image.jpg', size: '1.2 MB', modified: '2025-08-11' },
    { id: 3, file: 'video.mp4', size: '15.7 MB', modified: '2025-08-12' },
    { id: 4, file: 'presentation.pptx', size: '4.3 MB', modified: '2025-08-09' }
  ]);

  const handleEdit = (id) => {
    alert(`Edit file with ID: ${id}`);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this file?')) {
      setData(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleDownload = (file) => {
    alert(`Downloading: ${file}`);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>File Name</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Modified</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <span>📄</span>
                {item.file}
              </div>
            </TableCell>
            <TableCell>{item.size}</TableCell>
            <TableCell>{item.modified}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleDownload(item.file)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Download"
                >
                  ⬇️
                </button>
                <button
                  onClick={() => handleEdit(item.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Responsive Table

```jsx live
function ResponsiveTableExample() {
  const orders = [
    { id: 'ORD-001', customer: 'John Doe', product: 'Laptop', amount: 999, status: 'Delivered' },
    { id: 'ORD-002', customer: 'Jane Smith', product: 'Phone', amount: 699, status: 'Processing' },
    { id: 'ORD-003', customer: 'Bob Johnson', product: 'Tablet', amount: 399, status: 'Shipped' },
    { id: 'ORD-004', customer: 'Alice Brown', product: 'Watch', amount: 299, status: 'Pending' }
  ];

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead className="hidden sm:table-cell">Product</TableHead>
            <TableHead className="hidden md:table-cell">Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>
                <div>
                  <div>{order.customer}</div>
                  <div className="sm:hidden text-xs text-gray-500">
                    {order.product} - ${order.amount}
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{order.product}</TableCell>
              <TableCell className="hidden md:table-cell">${order.amount}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded text-xs ${
                  order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {order.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

## API Reference

### Table

The main table container.

<div className="props-table">
  <table>
    <thead>
      <tr>
        <th>Prop</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>className</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>Additional CSS classes</td>
      </tr>
      <tr>
        <td><code>size</code></td>
        <td><code>'sm' | 'md' | 'lg'</code></td>
        <td><code>'md'</code></td>
        <td>Table size variant</td>
      </tr>
      <tr>
        <td><code>striped</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Alternate row colors</td>
      </tr>
      <tr>
        <td><code>bordered</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Add borders to all cells</td>
      </tr>
      <tr>
        <td><code>hoverable</code></td>
        <td><code>boolean</code></td>
        <td><code>true</code></td>
        <td>Highlight rows on hover</td>
      </tr>
    </tbody>
  </table>
</div>

### TableHeader

Container for header rows.

### TableBody

Container for body rows.

### TableFooter

Container for footer rows.

### TableRow

Table row component.

<div className="props-table">
  <table>
    <thead>
      <tr>
        <th>Prop</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>selected</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Mark row as selected</td>
      </tr>
      <tr>
        <td><code>onClick</code></td>
        <td><code>Function</code></td>
        <td><code>undefined</code></td>
        <td>Row click handler</td>
      </tr>
    </tbody>
  </table>
</div>

### TableHead

Header cell component.

<div className="props-table">
  <table>
    <thead>
      <tr>
        <th>Prop</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>sortable</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Enable sorting</td>
      </tr>
      <tr>
        <td><code>sorted</code></td>
        <td><code>'asc' | 'desc'</code></td>
        <td><code>undefined</code></td>
        <td>Current sort direction</td>
      </tr>
    </tbody>
  </table>
</div>

### TableCell

Data cell component.

<div className="props-table">
  <table>
    <thead>
      <tr>
        <th>Prop</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>colSpan</code></td>
        <td><code>number</code></td>
        <td><code>1</code></td>
        <td>Number of columns to span</td>
      </tr>
      <tr>
        <td><code>rowSpan</code></td>
        <td><code>number</code></td>
        <td><code>1</code></td>
        <td>Number of rows to span</td>
      </tr>
    </tbody>
  </table>
</div>

### TableCaption

Table caption for accessibility.

## Accessibility

The Table component follows WAI-ARIA table pattern:

- Proper table structure with semantic HTML
- Keyboard navigation support
- Screen reader friendly with proper roles
- Caption support for table description
- Sortable columns announced to screen readers
- Selected rows announced with aria-selected

## Best Practices

### Do's ✅

- Use semantic HTML table elements
- Provide clear column headers
- Include a caption for complex tables
- Make sortable columns obvious
- Provide visual feedback for interactions
- Consider mobile responsive design
- Use pagination for large datasets

### Don'ts ❌

- Don't use tables for layout
- Don't nest tables unnecessarily
- Don't make cells too narrow on mobile
- Don't forget loading states
- Don't use complex spanning without need
- Don't forget to indicate sort direction

## Performance Tips

For large datasets:
- Implement virtual scrolling
- Use pagination (10-50 items per page)
- Lazy load data
- Debounce sort/filter operations
- Consider server-side operations

## Related Components

- [DataGrid](/docs/components/data-grid) - Advanced grid with more features
- [List](/docs/components/list) - Simple list display
- [Card](/docs/components/card) - Card-based data display
- [Pagination](/docs/components/pagination) - Pagination controls
- [Skeleton](/docs/components/skeleton) - Loading states
