# DataGridAdvanced

A powerful, enterprise-grade data grid component with advanced features for handling complex datasets in production applications.

## Overview

DataGridAdvanced is designed for applications that need sophisticated data presentation and interaction capabilities. It combines high performance with enterprise features like multi-column sorting, real-time filtering, row selection, custom cell rendering, and responsive design.

## Features

### ✅ Core Functionality
- **Multi-column sorting** with visual indicators (asc/desc/none)
- **Real-time filtering** across multiple columns with debounced input
- **Smart pagination** with customizable page sizes and navigation
- **Row selection** (single/multiple) with callbacks and state management
- **Loading & error states** with graceful fallbacks and user feedback

### ✅ Advanced Features  
- **Custom cell rendering** with React components and complex layouts
- **Accessor functions** for computed columns and derived data
- **Column configuration** with width, min/max width, and visibility controls
- **Responsive design** with mobile-optimized layouts and column hiding
- **Performance optimization** for large datasets (500+ records tested)

### ✅ Enterprise Features
- **TypeScript support** with comprehensive type definitions
- **Accessibility compliance** with ARIA labels and keyboard navigation
- **Internationalization ready** with customizable text and formatting
- **Theme integration** with Tailwind CSS and design system compatibility
- **Event system** with comprehensive callbacks for all interactions

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```tsx
import { DataGridAdvanced } from '@dainabase/ui';

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Developer' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Designer' },
];

const columns = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true, filterable: true },
  { id: 'email', header: 'Email', accessor: 'email', sortable: true, filterable: true },
  { id: 'role', header: 'Role', accessor: 'role', sortable: true, filterable: true },
];

function MyTable() {
  return (
    <DataGridAdvanced
      data={data}
      columns={columns}
      pageSize={10}
      enableSorting={true}
      enableFiltering={true}
      enablePagination={true}
      onRowClick={(row) => console.log('Row clicked:', row)}
    />
  );
}
```

## Advanced Examples

### Custom Cell Rendering

```tsx
const columns = [
  {
    id: 'avatar',
    header: 'Avatar',
    accessor: 'avatar',
    sortable: false,
    cell: ({ value, row }) => (
      <Avatar className="h-8 w-8">
        <img src={value} alt={row.name} />
      </Avatar>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    cell: ({ value }) => (
      <Badge variant={value === 'active' ? 'default' : 'secondary'}>
        {value}
      </Badge>
    ),
  },
];
```

### Accessor Functions

```tsx
const columns = [
  {
    id: 'fullName',
    header: 'Full Name',
    accessor: (row) => `${row.firstName} ${row.lastName}`,
    sortable: true,
  },
  {
    id: 'experience',
    header: 'Experience Level',
    accessor: (row) => {
      const years = calculateYears(row.startDate);
      return years < 2 ? 'Junior' : years < 5 ? 'Mid' : 'Senior';
    },
    sortable: true,
  },
];
```

### Row Selection

```tsx
function SelectableTable() {
  const [selectedRows, setSelectedRows] = useState([]);

  return (
    <DataGridAdvanced
      data={data}
      columns={columns}
      enableRowSelection={true}
      onSelectionChange={(rows) => {
        setSelectedRows(rows);
        console.log('Selected:', rows.length, 'rows');
      }}
    />
  );
}
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `any[]` | **required** | Array of data objects to display |
| `columns` | `ColumnDef[]` | **required** | Column definitions with headers and accessors |
| `pageSize` | `number` | `10` | Number of rows per page |
| `enableSorting` | `boolean` | `true` | Enable column sorting |
| `enableFiltering` | `boolean` | `true` | Enable column filtering |
| `enablePagination` | `boolean` | `true` | Enable pagination controls |
| `enableRowSelection` | `boolean` | `false` | Enable row selection checkboxes |
| `enableColumnResizing` | `boolean` | `false` | Enable column width resizing |
| `loading` | `boolean` | `false` | Show loading state |
| `error` | `Error \| null` | `null` | Error object for error state |
| `onRowClick` | `(row: any) => void` | `undefined` | Callback when row is clicked |
| `onSelectionChange` | `(rows: any[]) => void` | `undefined` | Callback when selection changes |

### Column Definition

```tsx
interface ColumnDef {
  id: string;                                    // Unique column identifier
  header: string | React.ReactNode;             // Column header content
  accessor?: string | ((row: any) => any);      // Data accessor or function
  width?: number;                                // Fixed width in pixels
  minWidth?: number;                             // Minimum width in pixels
  maxWidth?: number;                             // Maximum width in pixels
  sortable?: boolean;                            // Enable sorting (default: true)
  filterable?: boolean;                          // Enable filtering (default: true)
  cell?: (props: CellProps) => React.ReactNode; // Custom cell renderer
  footer?: string | React.ReactNode;            // Column footer content
}

interface CellProps {
  value: any;    // Cell value from accessor
  row: any;      // Complete row data
}
```

## Performance Considerations

### Large Datasets
- Tested with 500+ records with smooth performance
- Pagination helps manage rendering load
- Filtering and sorting are optimized with memoization
- Custom cells should use React.memo for complex components

### Memory Usage
- Component uses React hooks for state management
- Filtered and sorted data is memoized to prevent unnecessary recalculations
- Selection state is managed efficiently with Sets

### Optimization Tips
```tsx
// Use React.memo for expensive cell renderers
const ExpensiveCell = React.memo(({ value, row }) => {
  const computedValue = expensiveCalculation(value);
  return <div>{computedValue}</div>;
});

// Memoize column definitions
const columns = useMemo(() => [
  { id: 'name', header: 'Name', accessor: 'name' },
  // ... other columns
], []);
```

## Accessibility

DataGridAdvanced includes comprehensive accessibility features:

- **ARIA labels** on all interactive elements
- **Keyboard navigation** for sorting and pagination  
- **Screen reader support** with proper table structure
- **Focus management** during interactions
- **High contrast** support with proper color ratios

### Keyboard Shortcuts
- `Enter` or `Space` on column headers to sort
- `Tab` to navigate between interactive elements
- `Arrow keys` for pagination navigation

## Testing

The component includes comprehensive test coverage:

- **Unit tests** for all features and edge cases
- **Integration tests** for combined functionality
- **Accessibility tests** with @testing-library/jest-dom
- **Performance tests** for large datasets
- **Edge case handling** for malformed data

### Running Tests
```bash
npm test data-grid-advanced
```

## Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Workflow
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Changelog

### v1.0.0
- Initial release with core functionality
- Multi-column sorting and filtering
- Row selection and pagination
- Custom cell rendering
- Comprehensive test suite
- Storybook documentation

## License

MIT © Dainabase

## Support

- **Documentation**: [Link to docs]
- **Issues**: [GitHub Issues]
- **Discord**: [Community Discord]
- **Email**: dev@dainabase.com
