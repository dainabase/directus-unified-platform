# Table

A responsive table component for displaying structured data with sorting, filtering, and pagination capabilities.

## Import

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@dainabase/ui/table';
```

## Basic Usage

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@dainabase/ui/table';

export default function TableExample() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">John Doe</TableCell>
          <TableCell>john@example.com</TableCell>
          <TableCell>Developer</TableCell>
          <TableCell className="text-right">Active</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
```

## Props

### Table
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| className | `string` | - | No | Additional CSS classes |
| children | `ReactNode` | - | Yes | Table content |

### TableHeader
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| className | `string` | - | No | Additional CSS classes |
| children | `ReactNode` | - | Yes | Header rows |

### TableBody
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| className | `string` | - | No | Additional CSS classes |
| children | `ReactNode` | - | Yes | Body rows |

### TableFooter
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| className | `string` | - | No | Additional CSS classes |
| children | `ReactNode` | - | Yes | Footer rows |

### TableRow
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| className | `string` | - | No | Additional CSS classes |
| children | `ReactNode` | - | Yes | Table cells |
| onClick | `() => void` | - | No | Click handler |

### TableHead
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| className | `string` | - | No | Additional CSS classes |
| children | `ReactNode` | - | Yes | Header content |
| scope | `"col" \| "row"` | `"col"` | No | Header scope |

### TableCell
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| className | `string` | - | No | Additional CSS classes |
| children | `ReactNode` | - | Yes | Cell content |
| colSpan | `number` | - | No | Column span |
| rowSpan | `number` | - | No | Row span |

### TableCaption
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| className | `string` | - | No | Additional CSS classes |
| children | `ReactNode` | - | Yes | Caption text |

## Examples

### Table with Caption

```tsx
<Table>
  <TableCaption>A list of recent transactions</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Date</TableHead>
      <TableHead>Description</TableHead>
      <TableHead>Category</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>2024-01-15</TableCell>
      <TableCell>Office Supplies</TableCell>
      <TableCell>Business</TableCell>
      <TableCell className="text-right">$234.50</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>2024-01-14</TableCell>
      <TableCell>Client Lunch</TableCell>
      <TableCell>Entertainment</TableCell>
      <TableCell className="text-right">$85.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Sortable Table

```tsx
import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

function SortableTable() {
  const [data, setData] = useState([
    { id: 1, name: 'Alice', age: 28, role: 'Designer' },
    { id: 2, name: 'Bob', age: 35, role: 'Developer' },
    { id: 3, name: 'Charlie', age: 42, role: 'Manager' },
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
          <TableHead 
            className="cursor-pointer"
            onClick={() => handleSort('name')}
          >
            <div className="flex items-center">
              Name
              {sortConfig.key === 'name' && (
                sortConfig.direction === 'asc' ? 
                <ChevronUp className="ml-1 h-4 w-4" /> : 
                <ChevronDown className="ml-1 h-4 w-4" />
              )}
            </div>
          </TableHead>
          <TableHead 
            className="cursor-pointer"
            onClick={() => handleSort('age')}
          >
            <div className="flex items-center">
              Age
              {sortConfig.key === 'age' && (
                sortConfig.direction === 'asc' ? 
                <ChevronUp className="ml-1 h-4 w-4" /> : 
                <ChevronDown className="ml-1 h-4 w-4" />
              )}
            </div>
          </TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.age}</TableCell>
            <TableCell>{row.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Table with Selectable Rows

```tsx
import { Checkbox } from '@dainabase/ui/checkbox';

function SelectableTable() {
  const [selectedRows, setSelectedRows] = useState([]);
  const data = [
    { id: 1, name: 'Project A', status: 'Active' },
    { id: 2, name: 'Project B', status: 'Pending' },
    { id: 3, name: 'Project C', status: 'Completed' },
  ];

  const toggleRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedRows(prev =>
      prev.length === data.length ? [] : data.map(row => row.id)
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={selectedRows.length === data.length}
              onCheckedChange={toggleAll}
            />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow 
            key={row.id}
            className={selectedRows.includes(row.id) ? 'bg-muted' : ''}
          >
            <TableCell>
              <Checkbox
                checked={selectedRows.includes(row.id)}
                onCheckedChange={() => toggleRow(row.id)}
              />
            </TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Table with Actions

```tsx
import { Button } from '@dainabase/ui/button';
import { MoreHorizontal, Edit, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@dainabase/ui/dropdown-menu';

function TableWithActions() {
  const data = [
    { id: 1, name: 'Document.pdf', size: '2.5 MB', modified: '2024-01-15' },
    { id: 2, name: 'Image.png', size: '1.2 MB', modified: '2024-01-14' },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Modified</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((file) => (
          <TableRow key={file.id}>
            <TableCell className="font-medium">{file.name}</TableCell>
            <TableCell>{file.size}</TableCell>
            <TableCell>{file.modified}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Table with Footer

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Product</TableHead>
      <TableHead>Quantity</TableHead>
      <TableHead>Price</TableHead>
      <TableHead className="text-right">Total</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Widget A</TableCell>
      <TableCell>3</TableCell>
      <TableCell>$25.00</TableCell>
      <TableCell className="text-right">$75.00</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>Widget B</TableCell>
      <TableCell>2</TableCell>
      <TableCell>$35.00</TableCell>
      <TableCell className="text-right">$70.00</TableCell>
    </TableRow>
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colSpan={3}>Subtotal</TableCell>
      <TableCell className="text-right font-bold">$145.00</TableCell>
    </TableRow>
  </TableFooter>
</Table>
```

### Responsive Table

```tsx
<div className="w-full overflow-auto">
  <Table className="min-w-[600px]">
    <TableHeader>
      <TableRow>
        <TableHead>Order ID</TableHead>
        <TableHead>Customer</TableHead>
        <TableHead>Product</TableHead>
        <TableHead>Date</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Amount</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {/* Table rows */}
    </TableBody>
  </Table>
</div>
```

### Striped Table

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Position</TableHead>
      <TableHead>Department</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((row, index) => (
      <TableRow 
        key={row.id}
        className={index % 2 === 0 ? 'bg-muted/50' : ''}
      >
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.position}</TableCell>
        <TableCell>{row.department}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Table with Badges

```tsx
import { Badge } from '@dainabase/ui/badge';

function TableWithBadges() {
  const tasks = [
    { id: 1, title: 'Design Homepage', priority: 'high', status: 'in-progress' },
    { id: 2, title: 'Fix Bug #123', priority: 'critical', status: 'todo' },
    { id: 3, title: 'Update Docs', priority: 'low', status: 'completed' },
  ];

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'destructive';
      case 'high': return 'warning';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      default: return 'default';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell className="font-medium">{task.title}</TableCell>
            <TableCell>
              <Badge variant={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusColor(task.status)}>
                {task.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Table with Pagination

```tsx
import { Button } from '@dainabase/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function PaginatedTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalItems = 23;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Paginated data */}
        </TableBody>
      </Table>
      
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
```

## Styling

### Compact Table

```tsx
<Table className="text-sm">
  <TableHeader>
    <TableRow className="h-8">
      <TableHead className="h-8 px-2">Name</TableHead>
      <TableHead className="h-8 px-2">Value</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="h-8">
      <TableCell className="h-8 px-2">CPU</TableCell>
      <TableCell className="h-8 px-2">85%</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Bordered Table

```tsx
<Table className="border">
  <TableHeader>
    <TableRow>
      <TableHead className="border-r">Column 1</TableHead>
      <TableHead>Column 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="border-t">
      <TableCell className="border-r">Cell 1</TableCell>
      <TableCell>Cell 2</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Accessibility

- **Semantic HTML**: Uses proper table elements
- **Header associations**: Proper `scope` attributes on headers
- **Keyboard navigation**: Tab through interactive elements
- **Screen reader support**: Proper table structure for screen readers
- **Caption support**: Describes table content
- **ARIA attributes**: Support for sorting and selection states

## Best Practices

1. **Always use semantic table elements**: Don't use divs to create table layouts
2. **Include proper headers**: Every column should have a descriptive header
3. **Use caption for complex tables**: Help users understand the table's purpose
4. **Make tables responsive**: Use horizontal scroll for wide tables on mobile
5. **Provide sorting/filtering**: For large datasets
6. **Keep cells concise**: Use tooltips or modals for detailed information
7. **Use consistent alignment**: Numbers right, text left

## Common Use Cases

- **Data listings**: Users, products, orders
- **Reports**: Financial, analytics, metrics
- **Comparisons**: Feature matrices, pricing tables
- **Logs**: Activity, audit, system logs
- **Inventories**: Stock, assets, resources
- **Schedules**: Calendars, timetables, agendas

## Performance Considerations

- **Virtualization**: For tables with thousands of rows
- **Pagination**: Limit displayed rows
- **Lazy loading**: Load data as needed
- **Memoization**: Cache sorted/filtered results
- **Debounced search**: For real-time filtering

## Testing

```tsx
import { render, screen } from '@testing-library/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@dainabase/ui/table';

describe('Table', () => {
  it('renders table with data', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

## Related Components

- [DataGrid](./data-grid.md)
- [DataGridAdv](./data-grid-adv.md)
- [List](./list.md)
- [Card](./card.md)
- [Pagination](./pagination.md)

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>
