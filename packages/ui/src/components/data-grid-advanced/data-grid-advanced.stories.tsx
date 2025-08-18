import type { Meta, StoryObj } from '@storybook/react';
import { useState, useMemo } from 'react';
import { action } from '@storybook/addon-actions';
import { DataGridAdvanced, DataGridAdvancedProps, ColumnDef } from './index';
import { Badge } from '../badge';
import { Button } from '../button';
import { Avatar } from '../avatar';

// ============================================================================
// METADATA & CONFIGURATION
// ============================================================================

const meta: Meta<typeof DataGridAdvanced> = {
  title: 'Data Display/DataGridAdvanced',
  component: DataGridAdvanced,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# DataGridAdvanced

A powerful, enterprise-grade data grid component with advanced features for handling complex datasets.

## Key Features

- **Multi-column sorting** with visual indicators
- **Real-time filtering** across multiple columns  
- **Smart pagination** with customizable page sizes
- **Row selection** (single/multiple) with callbacks
- **Custom cell rendering** with React components
- **Responsive design** with column resizing
- **Loading & error states** with graceful fallbacks
- **Accessibility support** with ARIA labels
- **Performance optimized** for large datasets

## Use Cases

Perfect for admin dashboards, data tables, user management, analytics views, and any scenario requiring sophisticated data presentation and interaction.
        `,
      },
    },
  },
  argTypes: {
    data: {
      description: 'Array of data objects to display in the grid',
      control: { type: 'object' },
    },
    columns: {
      description: 'Column definitions with headers, accessors, and rendering options',
      control: { type: 'object' },
    },
    pageSize: {
      description: 'Number of rows to display per page',
      control: { type: 'number', min: 1, max: 100 },
    },
    enableSorting: {
      description: 'Enable/disable column sorting functionality',
      control: { type: 'boolean' },
    },
    enableFiltering: {
      description: 'Enable/disable column filtering functionality',
      control: { type: 'boolean' },
    },
    enablePagination: {
      description: 'Enable/disable pagination controls',
      control: { type: 'boolean' },
    },
    enableRowSelection: {
      description: 'Enable/disable row selection checkboxes',
      control: { type: 'boolean' },
    },
    enableColumnResizing: {
      description: 'Enable/disable column width resizing',
      control: { type: 'boolean' },
    },
    loading: {
      description: 'Show loading state',
      control: { type: 'boolean' },
    },
    error: {
      description: 'Error object to display error state',
      control: { type: 'object' },
    },
    onRowClick: {
      description: 'Callback fired when a row is clicked',
      action: 'rowClicked',
    },
    onSelectionChange: {
      description: 'Callback fired when row selection changes',
      action: 'selectionChanged',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DataGridAdvanced>;

// ============================================================================
// SAMPLE DATA GENERATORS
// ============================================================================

// Employee data for HR management scenarios
const generateEmployeeData = (count: number = 50) => {
  const departments = ['Engineering', 'Marketing', 'Sales', 'Design', 'HR', 'Finance', 'Operations'];
  const roles = ['Manager', 'Senior', 'Mid-level', 'Junior', 'Intern'];
  const statuses = ['Active', 'On Leave', 'Remote', 'Inactive'];
  const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack', 'Kate', 'Leo', 'Maya', 'Noah', 'Olivia'];
  const lastNames = ['Johnson', 'Smith', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin'];

  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const department = departments[i % departments.length];
    const role = roles[i % roles.length];
    const status = statuses[i % statuses.length];
    const salary = 40000 + Math.floor(Math.random() * 120000);
    const age = 22 + Math.floor(Math.random() * 40);
    const joinDate = new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000);

    return {
      id: i + 1,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
      department,
      role,
      status,
      salary,
      age,
      joinDate: joinDate.toISOString().split('T')[0],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
      performance: Math.floor(Math.random() * 5) + 1,
      projects: Math.floor(Math.random() * 15) + 1,
    };
  });
};

// E-commerce product data
const generateProductData = (count: number = 30) => {
  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Toys', 'Automotive'];
  const brands = ['BrandA', 'BrandB', 'BrandC', 'BrandD', 'BrandE'];
  const statuses = ['In Stock', 'Low Stock', 'Out of Stock', 'Discontinued'];

  return Array.from({ length: count }, (_, i) => {
    const category = categories[i % categories.length];
    const brand = brands[i % brands.length];
    const status = statuses[i % statuses.length];
    const price = 10 + Math.floor(Math.random() * 500);
    const stock = Math.floor(Math.random() * 100);
    const rating = Math.round((Math.random() * 2 + 3) * 10) / 10; // 3.0-5.0 range

    return {
      id: `PRD-${(i + 1).toString().padStart(4, '0')}`,
      name: `${category} Product ${i + 1}`,
      category,
      brand,
      price,
      stock,
      status,
      rating,
      sales: Math.floor(Math.random() * 1000),
      image: `https://api.dicebear.com/7.x/shapes/svg?seed=product${i}`,
      featured: Math.random() > 0.7,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
  });
};

// Financial transaction data
const generateTransactionData = (count: number = 100) => {
  const types = ['Credit', 'Debit', 'Transfer', 'Fee', 'Interest', 'Refund'];
  const statuses = ['Completed', 'Pending', 'Failed', 'Cancelled'];
  const merchants = ['Amazon', 'Walmart', 'Target', 'Starbucks', 'Shell', 'McDonalds', 'Netflix', 'Spotify'];

  return Array.from({ length: count }, (_, i) => {
    const type = types[i % types.length];
    const status = statuses[i % statuses.length];
    const merchant = merchants[i % merchants.length];
    const amount = Math.floor(Math.random() * 1000) + 1;
    const date = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);

    return {
      id: `TXN-${(i + 1).toString().padStart(6, '0')}`,
      type,
      amount: type === 'Debit' ? -amount : amount,
      merchant,
      status,
      date: date.toISOString().split('T')[0],
      time: date.toTimeString().split(' ')[0],
      description: `${type} transaction at ${merchant}`,
      fee: type === 'Transfer' ? Math.floor(Math.random() * 10) + 1 : 0,
      balance: Math.floor(Math.random() * 10000) + 1000,
    };
  });
};

// ============================================================================
// BASIC STORIES
// ============================================================================

export const Default: Story = {
  args: {
    data: generateEmployeeData(20),
    columns: [
      { id: 'id', header: 'ID', accessor: 'id', width: 80 },
      { id: 'fullName', header: 'Full Name', accessor: 'fullName', sortable: true, filterable: true },
      { id: 'email', header: 'Email', accessor: 'email', sortable: true, filterable: true },
      { id: 'department', header: 'Department', accessor: 'department', sortable: true, filterable: true },
      { id: 'role', header: 'Role', accessor: 'role', sortable: true, filterable: true },
      { id: 'status', header: 'Status', accessor: 'status', sortable: true, filterable: true },
    ],
    pageSize: 10,
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    onRowClick: action('row-clicked'),
    onSelectionChange: action('selection-changed'),
  },
};

export const MinimalConfiguration: Story = {
  args: {
    data: generateEmployeeData(10),
    columns: [
      { id: 'fullName', header: 'Name', accessor: 'fullName' },
      { id: 'email', header: 'Email', accessor: 'email' },
      { id: 'department', header: 'Department', accessor: 'department' },
    ],
    enableSorting: false,
    enableFiltering: false,
    enablePagination: false,
  },
};

export const LoadingState: Story = {
  args: {
    data: [],
    columns: [
      { id: 'id', header: 'ID', accessor: 'id' },
      { id: 'name', header: 'Name', accessor: 'name' },
      { id: 'email', header: 'Email', accessor: 'email' },
    ],
    loading: true,
  },
};

export const ErrorState: Story = {
  args: {
    data: [],
    columns: [
      { id: 'id', header: 'ID', accessor: 'id' },
      { id: 'name', header: 'Name', accessor: 'name' },
      { id: 'email', header: 'Email', accessor: 'email' },
    ],
    error: new Error('Failed to load data from server'),
  },
};

export const EmptyState: Story = {
  args: {
    data: [],
    columns: [
      { id: 'id', header: 'ID', accessor: 'id' },
      { id: 'name', header: 'Name', accessor: 'name' },
      { id: 'email', header: 'Email', accessor: 'email' },
    ],
    loading: false,
    error: null,
  },
};

// ============================================================================
// FEATURE-SPECIFIC STORIES
// ============================================================================

export const SortingDemo: Story = {
  name: 'Sorting Features',
  args: {
    data: generateEmployeeData(25),
    columns: [
      { id: 'fullName', header: 'Name (Sortable)', accessor: 'fullName', sortable: true },
      { id: 'age', header: 'Age (Sortable)', accessor: 'age', sortable: true },
      { id: 'salary', header: 'Salary (Sortable)', accessor: 'salary', sortable: true, 
        cell: ({ value }) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value) },
      { id: 'joinDate', header: 'Join Date (Sortable)', accessor: 'joinDate', sortable: true },
      { id: 'department', header: 'Department (Non-sortable)', accessor: 'department', sortable: false },
    ],
    pageSize: 8,
    enableSorting: true,
    enableFiltering: false,
    enablePagination: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates multi-column sorting with different data types (string, number, date). Click column headers to sort. Some columns are deliberately non-sortable to show the difference.',
      },
    },
  },
};

export const FilteringDemo: Story = {
  name: 'Filtering Features',
  args: {
    data: generateEmployeeData(40),
    columns: [
      { id: 'fullName', header: 'Name (Filterable)', accessor: 'fullName', filterable: true },
      { id: 'department', header: 'Department (Filterable)', accessor: 'department', filterable: true },
      { id: 'role', header: 'Role (Filterable)', accessor: 'role', filterable: true },
      { id: 'status', header: 'Status (Filterable)', accessor: 'status', filterable: true },
      { id: 'age', header: 'Age (Non-filterable)', accessor: 'age', filterable: false },
    ],
    pageSize: 10,
    enableSorting: false,
    enableFiltering: true,
    enablePagination: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows real-time filtering across multiple columns. Type in the filter inputs to see results update instantly. Filtering is case-insensitive and supports partial matches.',
      },
    },
  },
};

export const RowSelectionDemo: Story = {
  name: 'Row Selection',
  render: (args) => {
    const [selectedCount, setSelectedCount] = useState(0);
    
    return (
      <div>
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            Selected rows: {selectedCount}
          </p>
        </div>
        <DataGridAdvanced
          {...args}
          onSelectionChange={(rows) => {
            setSelectedCount(rows.length);
            action('selection-changed')(rows);
          }}
        />
      </div>
    );
  },
  args: {
    data: generateEmployeeData(15),
    columns: [
      { id: 'fullName', header: 'Name', accessor: 'fullName' },
      { id: 'department', header: 'Department', accessor: 'department' },
      { id: 'role', header: 'Role', accessor: 'role' },
      { id: 'salary', header: 'Salary', accessor: 'salary', 
        cell: ({ value }) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value) },
    ],
    pageSize: 8,
    enableRowSelection: true,
    enableSorting: true,
    enablePagination: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates row selection with individual and "select all" checkboxes. The selected count is displayed above the grid and updates in real-time.',
      },
    },
  },
};

export const PaginationDemo: Story = {
  name: 'Pagination Features',
  args: {
    data: generateEmployeeData(87), // Odd number to test edge cases
    columns: [
      { id: 'id', header: 'ID', accessor: 'id', width: 80 },
      { id: 'fullName', header: 'Name', accessor: 'fullName' },
      { id: 'department', header: 'Department', accessor: 'department' },
      { id: 'status', header: 'Status', accessor: 'status' },
    ],
    pageSize: 7, // Odd page size to test pagination edge cases
    enablePagination: true,
    enableSorting: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows pagination with 87 records and 7 records per page to demonstrate edge cases and proper page calculation.',
      },
    },
  },
};

// ============================================================================
// BUSINESS SCENARIO STORIES
// ============================================================================

export const EmployeeManagement: Story = {
  name: '👥 Employee Management Dashboard',
  render: (args) => {
    const data = generateEmployeeData(45);
    
    const columns: ColumnDef[] = [
      {
        id: 'avatar',
        header: '',
        accessor: 'avatar',
        width: 60,
        sortable: false,
        filterable: false,
        cell: ({ value, row }) => (
          <Avatar className="h-8 w-8">
            <img src={value} alt={row.fullName} />
          </Avatar>
        ),
      },
      {
        id: 'fullName',
        header: 'Employee',
        accessor: 'fullName',
        sortable: true,
        filterable: true,
        minWidth: 180,
      },
      {
        id: 'email',
        header: 'Email',
        accessor: 'email',
        sortable: true,
        filterable: true,
        cell: ({ value }) => (
          <a href={`mailto:${value}`} className="text-blue-600 hover:underline text-sm">
            {value}
          </a>
        ),
      },
      {
        id: 'department',
        header: 'Department',
        accessor: 'department',
        sortable: true,
        filterable: true,
        cell: ({ value }) => (
          <Badge variant={value === 'Engineering' ? 'default' : 'secondary'}>
            {value}
          </Badge>
        ),
      },
      {
        id: 'role',
        header: 'Role',
        accessor: 'role',
        sortable: true,
        filterable: true,
      },
      {
        id: 'status',
        header: 'Status',
        accessor: 'status',
        sortable: true,
        filterable: true,
        cell: ({ value }) => (
          <Badge variant={
            value === 'Active' ? 'default' :
            value === 'Remote' ? 'secondary' :
            value === 'On Leave' ? 'outline' : 'destructive'
          }>
            {value}
          </Badge>
        ),
      },
      {
        id: 'salary',
        header: 'Salary',
        accessor: 'salary',
        sortable: true,
        cell: ({ value }) => (
          <span className="font-mono text-sm">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
          </span>
        ),
      },
      {
        id: 'performance',
        header: 'Rating',
        accessor: 'performance',
        sortable: true,
        width: 100,
        cell: ({ value }) => (
          <div className="flex items-center">
            <span className="text-sm mr-1">{value}</span>
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={`text-xs ${i < value ? 'text-yellow-400' : 'text-gray-300'}`}>
                  ★
                </span>
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        sortable: false,
        filterable: false,
        width: 120,
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => action('edit-employee')(row)}>
              Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => action('view-employee')(row)}>
              View
            </Button>
          </div>
        ),
      },
    ];

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Employee Directory</h3>
          <Button onClick={() => action('add-employee')()}>Add Employee</Button>
        </div>
        <DataGridAdvanced
          {...args}
          data={data}
          columns={columns}
          onRowClick={action('employee-selected')}
        />
      </div>
    );
  },
  args: {
    pageSize: 12,
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    enableRowSelection: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete employee management interface with avatars, status badges, salary formatting, performance ratings, and action buttons.',
      },
    },
  },
};

export const EcommerceProductCatalog: Story = {
  name: '🛍️ E-commerce Product Catalog',
  render: (args) => {
    const data = generateProductData(50);
    
    const columns: ColumnDef[] = [
      {
        id: 'image',
        header: '',
        accessor: 'image',
        width: 60,
        sortable: false,
        filterable: false,
        cell: ({ value, row }) => (
          <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
            <img src={value} alt={row.name} className="w-full h-full object-cover" />
          </div>
        ),
      },
      {
        id: 'name',
        header: 'Product Name',
        accessor: 'name',
        sortable: true,
        filterable: true,
        minWidth: 200,
        cell: ({ value, row }) => (
          <div>
            <div className="font-medium text-sm">{value}</div>
            <div className="text-xs text-gray-500">ID: {row.id}</div>
          </div>
        ),
      },
      {
        id: 'category',
        header: 'Category',
        accessor: 'category',
        sortable: true,
        filterable: true,
        cell: ({ value }) => (
          <Badge variant="outline">{value}</Badge>
        ),
      },
      {
        id: 'brand',
        header: 'Brand',
        accessor: 'brand',
        sortable: true,
        filterable: true,
      },
      {
        id: 'price',
        header: 'Price',
        accessor: 'price',
        sortable: true,
        width: 100,
        cell: ({ value }) => (
          <span className="font-semibold text-green-600">
            ${value.toFixed(2)}
          </span>
        ),
      },
      {
        id: 'stock',
        header: 'Stock',
        accessor: 'stock',
        sortable: true,
        width: 80,
        cell: ({ value }) => (
          <span className={`font-medium ${
            value === 0 ? 'text-red-600' :
            value < 10 ? 'text-orange-600' : 'text-green-600'
          }`}>
            {value}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        accessor: 'status',
        sortable: true,
        filterable: true,
        cell: ({ value }) => (
          <Badge variant={
            value === 'In Stock' ? 'default' :
            value === 'Low Stock' ? 'destructive' :
            value === 'Out of Stock' ? 'destructive' : 'secondary'
          }>
            {value}
          </Badge>
        ),
      },
      {
        id: 'rating',
        header: 'Rating',
        accessor: 'rating',
        sortable: true,
        width: 100,
        cell: ({ value }) => (
          <div className="flex items-center">
            <span className="text-sm mr-1">{value}</span>
            <span className="text-yellow-400">★</span>
          </div>
        ),
      },
      {
        id: 'sales',
        header: 'Sales',
        accessor: 'sales',
        sortable: true,
        width: 80,
        cell: ({ value }) => (
          <span className="text-sm font-mono">{value}</span>
        ),
      },
      {
        id: 'featured',
        header: 'Featured',
        accessor: 'featured',
        sortable: true,
        width: 80,
        cell: ({ value }) => (
          value ? <Badge variant="default">★ Featured</Badge> : null
        ),
      },
    ];

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Product Catalog</h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => action('export-products')()}>
              Export
            </Button>
            <Button onClick={() => action('add-product')()}>Add Product</Button>
          </div>
        </div>
        <DataGridAdvanced
          {...args}
          data={data}
          columns={columns}
          onRowClick={action('product-selected')}
        />
      </div>
    );
  },
  args: {
    pageSize: 15,
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    enableRowSelection: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'E-commerce product catalog with images, pricing, stock levels, ratings, and status badges. Includes inventory management features.',
      },
    },
  },
};

export const FinancialTransactions: Story = {
  name: '💰 Financial Transaction History',
  render: (args) => {
    const data = generateTransactionData(75);
    
    const columns: ColumnDef[] = [
      {
        id: 'id',
        header: 'Transaction ID',
        accessor: 'id',
        width: 130,
        sortable: true,
        cell: ({ value }) => (
          <span className="font-mono text-xs">{value}</span>
        ),
      },
      {
        id: 'type',
        header: 'Type',
        accessor: 'type',
        sortable: true,
        filterable: true,
        width: 100,
        cell: ({ value }) => (
          <Badge variant={
            value === 'Credit' ? 'default' :
            value === 'Debit' ? 'destructive' :
            value === 'Transfer' ? 'secondary' : 'outline'
          }>
            {value}
          </Badge>
        ),
      },
      {
        id: 'amount',
        header: 'Amount',
        accessor: 'amount',
        sortable: true,
        width: 120,
        cell: ({ value }) => (
          <span className={`font-mono font-semibold ${
            value >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {value >= 0 ? '+' : ''}${Math.abs(value).toFixed(2)}
          </span>
        ),
      },
      {
        id: 'merchant',
        header: 'Merchant',
        accessor: 'merchant',
        sortable: true,
        filterable: true,
        minWidth: 120,
      },
      {
        id: 'status',
        header: 'Status',
        accessor: 'status',
        sortable: true,
        filterable: true,
        width: 100,
        cell: ({ value }) => (
          <Badge variant={
            value === 'Completed' ? 'default' :
            value === 'Pending' ? 'secondary' :
            value === 'Failed' ? 'destructive' : 'outline'
          }>
            {value}
          </Badge>
        ),
      },
      {
        id: 'date',
        header: 'Date',
        accessor: 'date',
        sortable: true,
        width: 100,
        cell: ({ value }) => (
          <span className="text-sm">{value}</span>
        ),
      },
      {
        id: 'time',
        header: 'Time',
        accessor: 'time',
        sortable: true,
        width: 80,
        cell: ({ value }) => (
          <span className="text-xs font-mono text-gray-600">{value}</span>
        ),
      },
      {
        id: 'balance',
        header: 'Balance',
        accessor: 'balance',
        sortable: true,
        width: 120,
        cell: ({ value }) => (
          <span className="font-mono text-sm font-medium">
            ${value.toLocaleString()}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        width: 100,
        sortable: false,
        filterable: false,
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => action('view-transaction')(row)}>
              View
            </Button>
            {row.status === 'Pending' && (
              <Button size="sm" variant="ghost" onClick={() => action('cancel-transaction')(row)}>
                Cancel
              </Button>
            )}
          </div>
        ),
      },
    ];

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Transaction History</h3>
            <p className="text-sm text-gray-600">Last 90 days</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => action('download-statement')()}>
              Download
            </Button>
            <Button variant="outline" onClick={() => action('filter-date-range')()}>
              Date Range
            </Button>
          </div>
        </div>
        <DataGridAdvanced
          {...args}
          data={data}
          columns={columns}
          onRowClick={action('transaction-selected')}
        />
      </div>
    );
  },
  args: {
    pageSize: 20,
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    enableRowSelection: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Financial transaction interface with color-coded amounts, status tracking, and account balance updates.',
      },
    },
  },
};

// ============================================================================
// ADVANCED FEATURE STORIES
// ============================================================================

export const CustomCellRendering: Story = {
  name: '🎨 Custom Cell Rendering',
  render: (args) => {
    const data = generateEmployeeData(20);
    
    const columns: ColumnDef[] = [
      {
        id: 'avatar',
        header: 'Avatar',
        accessor: 'avatar',
        width: 80,
        sortable: false,
        cell: ({ value, row }) => (
          <Avatar className="h-10 w-10">
            <img src={value} alt={row.fullName} />
          </Avatar>
        ),
      },
      {
        id: 'fullName',
        header: 'Employee Info',
        accessor: 'fullName',
        sortable: true,
        minWidth: 200,
        cell: ({ value, row }) => (
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
            <div className="text-xs text-gray-400">Joined: {row.joinDate}</div>
          </div>
        ),
      },
      {
        id: 'performance',
        header: 'Performance',
        accessor: 'performance',
        sortable: true,
        width: 150,
        cell: ({ value, row }) => (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm">Rating: {value}/5</span>
              <span className="text-xs text-gray-500">{row.projects} projects</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(value / 5) * 100}%` }}
              />
            </div>
          </div>
        ),
      },
      {
        id: 'salary',
        header: 'Compensation',
        accessor: 'salary',
        sortable: true,
        width: 150,
        cell: ({ value, row }) => (
          <div className="text-right">
            <div className="font-semibold text-green-600">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
            </div>
            <div className="text-xs text-gray-500">
              {row.department === 'Engineering' ? 'Tech' : 'Non-tech'} role
            </div>
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status & Actions',
        accessor: 'status',
        sortable: true,
        width: 200,
        cell: ({ value, row }) => (
          <div className="space-y-2">
            <Badge variant={
              value === 'Active' ? 'default' :
              value === 'Remote' ? 'secondary' : 'outline'
            }>
              {value}
            </Badge>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => action('edit')(row)}>
                Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => action('message')(row)}>
                Message
              </Button>
            </div>
          </div>
        ),
      },
    ];

    return (
      <DataGridAdvanced
        {...args}
        data={data}
        columns={columns}
      />
    );
  },
  args: {
    pageSize: 8,
    enableSorting: true,
    enableFiltering: false,
    enablePagination: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates advanced custom cell rendering with complex layouts, progress bars, multi-line content, and embedded actions.',
      },
    },
  },
};

export const AccessorFunctions: Story = {
  name: '🔧 Accessor Functions',
  render: (args) => {
    const data = generateEmployeeData(25);
    
    const columns: ColumnDef[] = [
      {
        id: 'fullName',
        header: 'Name',
        accessor: (row) => `${row.firstName} ${row.lastName}`,
        sortable: true,
        filterable: true,
      },
      {
        id: 'experienceLevel',
        header: 'Experience',
        accessor: (row) => {
          const age = row.age;
          if (age < 25) return 'Junior';
          if (age < 35) return 'Mid-level';
          if (age < 45) return 'Senior';
          return 'Executive';
        },
        sortable: true,
        filterable: true,
        cell: ({ value }) => (
          <Badge variant={
            value === 'Executive' ? 'default' :
            value === 'Senior' ? 'secondary' : 'outline'
          }>
            {value}
          </Badge>
        ),
      },
      {
        id: 'tenureYears',
        header: 'Tenure',
        accessor: (row) => {
          const joinDate = new Date(row.joinDate);
          const now = new Date();
          const years = Math.floor((now.getTime() - joinDate.getTime()) / (365 * 24 * 60 * 60 * 1000));
          return years;
        },
        sortable: true,
        cell: ({ value }) => (
          <span className={`font-medium ${
            value >= 3 ? 'text-green-600' :
            value >= 1 ? 'text-blue-600' : 'text-gray-600'
          }`}>
            {value} {value === 1 ? 'year' : 'years'}
          </span>
        ),
      },
      {
        id: 'salaryRange',
        header: 'Salary Band',
        accessor: (row) => {
          const salary = row.salary;
          if (salary < 50000) return 'Entry Level';
          if (salary < 80000) return 'Mid Level';
          if (salary < 120000) return 'Senior Level';
          return 'Executive Level';
        },
        sortable: true,
        filterable: true,
        cell: ({ value, row }) => (
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-gray-500">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.salary)}
            </div>
          </div>
        ),
      },
      {
        id: 'performanceCategory',
        header: 'Performance',
        accessor: (row) => {
          const score = row.performance;
          if (score >= 4.5) return 'Excellent';
          if (score >= 3.5) return 'Good';
          if (score >= 2.5) return 'Average';
          return 'Needs Improvement';
        },
        sortable: true,
        filterable: true,
        cell: ({ value, row }) => (
          <div className="flex items-center gap-2">
            <Badge variant={
              value === 'Excellent' ? 'default' :
              value === 'Good' ? 'secondary' :
              value === 'Average' ? 'outline' : 'destructive'
            }>
              {value}
            </Badge>
            <span className="text-sm text-gray-500">({row.performance}/5)</span>
          </div>
        ),
      },
    ];

    return (
      <DataGridAdvanced
        {...args}
        data={data}
        columns={columns}
      />
    );
  },
  args: {
    pageSize: 10,
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows how to use accessor functions to compute derived values from row data, creating virtual columns for experience level, tenure, salary bands, and performance categories.',
      },
    },
  },
};

export const LargeDatasetPerformance: Story = {
  name: '⚡ Large Dataset Performance',
  render: (args) => {
    const data = generateEmployeeData(500); // Large dataset
    
    const columns: ColumnDef[] = [
      { id: 'id', header: 'ID', accessor: 'id', width: 80 },
      { id: 'fullName', header: 'Name', accessor: 'fullName', sortable: true, filterable: true },
      { id: 'email', header: 'Email', accessor: 'email', sortable: true, filterable: true },
      { id: 'department', header: 'Department', accessor: 'department', sortable: true, filterable: true },
      { id: 'role', header: 'Role', accessor: 'role', sortable: true, filterable: true },
      { id: 'salary', header: 'Salary', accessor: 'salary', sortable: true,
        cell: ({ value }) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value) },
      { id: 'status', header: 'Status', accessor: 'status', sortable: true, filterable: true },
    ];

    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900">Performance Test</h4>
          <p className="text-sm text-blue-700">
            This grid contains 500 employees to demonstrate performance with larger datasets. 
            Try sorting, filtering, and pagination to see how the component handles the load.
          </p>
        </div>
        <DataGridAdvanced
          {...args}
          data={data}
          columns={columns}
        />
      </div>
    );
  },
  args: {
    pageSize: 25,
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    enableRowSelection: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Performance test with 500 records. Demonstrates how the component handles larger datasets while maintaining responsiveness.',
      },
    },
  },
};

// ============================================================================
// RESPONSIVE & MOBILE STORIES
// ============================================================================

export const ResponsiveDesign: Story = {
  name: '📱 Responsive Design',
  render: (args) => {
    const data = generateEmployeeData(15);
    
    const columns: ColumnDef[] = [
      {
        id: 'employee',
        header: 'Employee',
        accessor: 'fullName',
        sortable: true,
        filterable: true,
        minWidth: 200,
        cell: ({ value, row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 hidden sm:flex">
              <img src={row.avatar} alt={value} />
            </Avatar>
            <div>
              <div className="font-medium text-sm">{value}</div>
              <div className="text-xs text-gray-500 sm:hidden">{row.department}</div>
            </div>
          </div>
        ),
      },
      {
        id: 'department',
        header: 'Department',
        accessor: 'department',
        sortable: true,
        filterable: true,
        cell: ({ value }) => (
          <Badge variant="outline" className="hidden sm:inline-flex">
            {value}
          </Badge>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        accessor: 'status',
        sortable: true,
        cell: ({ value }) => (
          <Badge variant={value === 'Active' ? 'default' : 'secondary'}>
            {value}
          </Badge>
        ),
      },
      {
        id: 'contact',
        header: 'Contact',
        accessor: 'email',
        sortable: true,
        cell: ({ value, row }) => (
          <div className="hidden md:block">
            <div className="text-sm">{value}</div>
            <div className="text-xs text-gray-500">{row.role}</div>
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        width: 80,
        cell: ({ row }) => (
          <Button size="sm" variant="ghost" onClick={() => action('view-details')(row)}>
            View
          </Button>
        ),
      },
    ];

    return (
      <div className="space-y-4">
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900">Responsive Features</h4>
          <p className="text-sm text-green-700">
            Resize your browser window to see how the grid adapts. Some columns hide on smaller screens,
            and mobile-specific layouts are shown.
          </p>
        </div>
        <DataGridAdvanced
          {...args}
          data={data}
          columns={columns}
        />
      </div>
    );
  },
  args: {
    pageSize: 8,
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates responsive behavior with columns that hide/show based on screen size and mobile-optimized layouts.',
      },
    },
  },
};

// ============================================================================
// INTERACTIVE DEMO
// ============================================================================

export const InteractivePlayground: Story = {
  name: '🎮 Interactive Playground',
  render: () => {
    const [data] = useState(() => generateEmployeeData(30));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    
    const columns: ColumnDef[] = [
      { id: 'id', header: 'ID', accessor: 'id', width: 80 },
      { id: 'fullName', header: 'Name', accessor: 'fullName', sortable: true, filterable: true },
      { id: 'email', header: 'Email', accessor: 'email', sortable: true, filterable: true },
      { id: 'department', header: 'Department', accessor: 'department', sortable: true, filterable: true },
      { id: 'role', header: 'Role', accessor: 'role', sortable: true, filterable: true },
      { id: 'salary', header: 'Salary', accessor: 'salary', sortable: true,
        cell: ({ value }) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value) },
      { id: 'status', header: 'Status', accessor: 'status', sortable: true, filterable: true,
        cell: ({ value }) => (
          <Badge variant={value === 'Active' ? 'default' : 'secondary'}>
            {value}
          </Badge>
        ),
      },
    ];

    const simulateLoading = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    };

    const simulateError = () => {
      setError(new Error('Simulated network error'));
      setTimeout(() => setError(null), 3000);
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Controls</h4>
            <div className="space-y-2">
              <Button size="sm" onClick={simulateLoading} className="w-full">
                Simulate Loading
              </Button>
              <Button size="sm" variant="destructive" onClick={simulateError} className="w-full">
                Simulate Error
              </Button>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2 text-blue-900">Selection Info</h4>
            <p className="text-sm text-blue-700">
              Selected: {selectedRows.length} employees
            </p>
            {selectedRows.length > 0 && (
              <div className="mt-2">
                <Button size="sm" onClick={() => action('bulk-action')(selectedRows)}>
                  Bulk Action
                </Button>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium mb-2 text-green-900">Instructions</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Click headers to sort</li>
              <li>• Use filters to search</li>
              <li>• Select rows to see count</li>
              <li>• Click rows to view details</li>
            </ul>
          </div>
        </div>

        <DataGridAdvanced
          data={data}
          columns={columns}
          pageSize={10}
          enableSorting={true}
          enableFiltering={true}
          enablePagination={true}
          enableRowSelection={true}
          loading={loading}
          error={error}
          onRowClick={action('row-clicked')}
          onSelectionChange={(rows) => {
            setSelectedRows(rows);
            action('selection-changed')(rows);
          }}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo with controls to test different states, selection tracking, and real-time feedback. Try the various features and controls.',
      },
    },
  },
};
