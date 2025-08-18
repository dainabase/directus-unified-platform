import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataGridOptimized } from './data-grid-optimized'
import { Badge } from '../badge'
import { Button } from '../button'
import { Trash2, Edit, Eye, MoreHorizontal, ArrowUpDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu'

// Enhanced user interface for demonstrations
interface EnhancedUser {
  id: number
  name: string
  email: string
  role: 'Admin' | 'Manager' | 'Viewer' | 'Editor'
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  revenue: number
  projects: number
  lastLogin: Date
  department: string
  location: string
  avatar?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

// Generate rich sample data
const generateUsers = (count: number): EnhancedUser[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${['John', 'Jane', 'Alex', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa'][i % 8]} ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'][i % 8]}`,
    email: `user${i + 1}@company.com`,
    role: (['Admin', 'Manager', 'Viewer', 'Editor'] as const)[i % 4],
    status: (['active', 'inactive', 'pending', 'suspended'] as const)[i % 4],
    revenue: Math.round(Math.random() * 100000) / 100,
    projects: Math.floor(Math.random() * 20) + 1,
    lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    department: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'][i % 5],
    location: ['New York', 'San Francisco', 'London', 'Tokyo', 'Berlin'][i % 5],
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    priority: (['low', 'medium', 'high', 'critical'] as const)[i % 4],
  }))

// Basic columns for simple demonstrations
const basicColumns: ColumnDef<EnhancedUser>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{getValue<number>()}</span>
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 p-0 font-semibold"
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue, row }) => (
      <div className="flex items-center space-x-3">
        <img
          src={row.original.avatar}
          alt={getValue<string>()}
          className="h-8 w-8 rounded-full"
        />
        <span className="font-medium">{getValue<string>()}</span>
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ getValue }) => {
      const role = getValue<string>()
      return (
        <Badge variant={role === 'Admin' ? 'default' : 'secondary'}>
          {role}
        </Badge>
      )
    },
  },
]

// Advanced columns with rich features
const advancedColumns: ColumnDef<EnhancedUser>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-muted-foreground">
        #{getValue<number>().toString().padStart(4, '0')}
      </span>
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 p-0 font-semibold"
      >
        User
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue, row }) => (
      <div className="flex items-center space-x-3">
        <img
          src={row.original.avatar}
          alt={getValue<string>()}
          className="h-10 w-10 rounded-full border-2 border-border"
        />
        <div>
          <div className="font-medium">{getValue<string>()}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role & Department',
    cell: ({ getValue, row }) => (
      <div className="space-y-1">
        <Badge variant={getValue<string>() === 'Admin' ? 'default' : 'secondary'}>
          {getValue<string>()}
        </Badge>
        <div className="text-sm text-muted-foreground">{row.original.department}</div>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue, row }) => {
      const status = getValue<'active' | 'inactive' | 'pending' | 'suspended'>()
      const variants = {
        active: 'default',
        pending: 'secondary',
        inactive: 'outline',
        suspended: 'destructive',
      } as const
      
      return (
        <div className="flex items-center space-x-2">
          <Badge variant={variants[status]}>{status}</Badge>
          <Badge variant={row.original.priority === 'critical' ? 'destructive' : 'outline'} className="text-xs">
            {row.original.priority}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: 'revenue',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 p-0 font-semibold"
      >
        Revenue
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold">
        ${getValue<number>().toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    accessorKey: 'projects',
    header: 'Projects',
    cell: ({ getValue }) => (
      <div className="flex items-center space-x-2">
        <span className="font-medium">{getValue<number>()}</span>
        <span className="text-sm text-muted-foreground">active</span>
      </div>
    ),
  },
  {
    accessorKey: 'lastLogin',
    header: 'Last Login',
    cell: ({ getValue }) => {
      const date = getValue<Date>()
      const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
      return (
        <div className="text-sm">
          <div>{date.toLocaleDateString()}</div>
          <div className="text-muted-foreground">{daysAgo} days ago</div>
        </div>
      )
    },
  },
  {
    accessorKey: 'location',
    header: 'Location',
    cell: ({ getValue }) => (
      <span className="text-sm">{getValue<string>()}</span>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Eye className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

const meta: Meta<typeof DataGridOptimized> = {
  title: 'Components/DataGridOptimized',
  component: DataGridOptimized,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A high-performance data grid with virtualization, advanced sorting, filtering, and rich features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    enableVirtualization: {
      control: 'boolean',
      description: 'Enable virtual scrolling for large datasets',
    },
    enableSorting: {
      control: 'boolean',
      description: 'Enable column sorting',
    },
    enableFiltering: {
      control: 'boolean',
      description: 'Enable global search filtering',
    },
    enableColumnVisibility: {
      control: 'boolean',
      description: 'Enable column visibility controls',
    },
    enableRowSelection: {
      control: 'boolean',
      description: 'Enable row selection with checkboxes',
    },
    enablePagination: {
      control: 'boolean',
      description: 'Enable pagination controls',
    },
    pageSize: {
      control: 'number',
      description: 'Number of rows per page',
    },
    virtualRowHeight: {
      control: 'number',
      description: 'Height of each row in virtual mode',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    columns: basicColumns,
    data: generateUsers(25),
  },
  render: (args) => (
    <div className="w-full max-w-6xl mx-auto">
      <DataGridOptimized {...args} />
    </div>
  ),
}

export const WithRowSelection: Story = {
  args: {
    columns: basicColumns,
    data: generateUsers(15),
    enableRowSelection: true,
  },
  render: (args) => {
    const [selectedRows, setSelectedRows] = React.useState({})
    
    return (
      <div className="w-full max-w-6xl mx-auto space-y-4">
        <DataGridOptimized
          {...args}
          onRowSelectionChange={setSelectedRows}
        />
        {Object.keys(selectedRows).length > 0 && (
          <div className="p-4 rounded-md bg-muted">
            <p className="text-sm font-medium">
              Selected {Object.keys(selectedRows).length} row(s)
            </p>
            <p className="text-xs text-muted-foreground">
              Selection state: {JSON.stringify(selectedRows, null, 2)}
            </p>
          </div>
        )}
      </div>
    )
  },
}

export const AdvancedFeatures: Story = {
  args: {
    columns: advancedColumns,
    data: generateUsers(30),
    enableRowSelection: true,
    enableSorting: true,
    enableFiltering: true,
    enableColumnVisibility: true,
    enablePagination: true,
    pageSize: 15,
  },
  render: (args) => (
    <div className="w-full max-w-7xl mx-auto">
      <DataGridOptimized {...args} />
    </div>
  ),
}

export const VirtualizedLargeDataset: Story = {
  args: {
    columns: basicColumns,
    data: generateUsers(10000),
    enableVirtualization: true,
    virtualRowHeight: 60,
    overscan: 10,
    enableFiltering: true,
    enableSorting: true,
  },
  render: (args) => (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      <div className="p-4 rounded-md bg-amber-50 border border-amber-200">
        <p className="text-sm font-medium text-amber-800">
          🚀 Performance Demo: 10,000 rows with virtualization
        </p>
        <p className="text-xs text-amber-700">
          Smooth scrolling and filtering even with massive datasets
        </p>
      </div>
      <DataGridOptimized {...args} />
    </div>
  ),
}

export const CompactMode: Story = {
  args: {
    columns: basicColumns.map(col => ({
      ...col,
      cell: typeof col.cell === 'function' ? col.cell : ({ getValue }) => (
        <span className="text-sm">{getValue()}</span>
      ),
    })),
    data: generateUsers(50),
    enablePagination: true,
    pageSize: 25,
    className: "text-sm",
  },
  render: (args) => (
    <div className="w-full max-w-6xl mx-auto">
      <DataGridOptimized {...args} />
    </div>
  ),
}

export const WithCustomStates: Story = {
  args: {
    columns: basicColumns,
    data: [],
    renderEmptyState: () => (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">No users found</h3>
        <p className="text-muted-foreground text-center max-w-sm">
          There are no users in the system yet. Create your first user to get started.
        </p>
        <Button className="mt-4">Add User</Button>
      </div>
    ),
  },
  render: (args) => (
    <div className="w-full max-w-6xl mx-auto">
      <DataGridOptimized {...args} />
    </div>
  ),
}

export const LoadingState: Story = {
  args: {
    columns: basicColumns,
    data: [],
    isLoading: true,
    renderLoadingState: () => (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-4" />
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    ),
  },
  render: (args) => (
    <div className="w-full max-w-6xl mx-auto">
      <DataGridOptimized {...args} />
    </div>
  ),
}

export const WithFiltersAndCallbacks: Story = {
  args: {
    columns: advancedColumns,
    data: generateUsers(40),
    enableRowSelection: true,
    enableSorting: true,
    enableFiltering: true,
    enableColumnVisibility: true,
    pageSize: 10,
  },
  render: (args) => {
    const [events, setEvents] = React.useState<string[]>([])
    
    const addEvent = (event: string) => {
      setEvents(prev => [`${new Date().toLocaleTimeString()}: ${event}`, ...prev.slice(0, 4)])
    }
    
    return (
      <div className="w-full max-w-7xl mx-auto space-y-4">
        <DataGridOptimized
          {...args}
          onRowSelectionChange={(selection) => addEvent(`Row selection changed: ${Object.keys(selection).length} selected`)}
          onSortingChange={(sorting) => addEvent(`Sorting changed: ${JSON.stringify(sorting)}`)}
          onColumnFiltersChange={(filters) => addEvent(`Filters changed: ${filters.length} active`)}
          onColumnVisibilityChange={(visibility) => addEvent(`Column visibility changed`)}
        />
        {events.length > 0 && (
          <div className="p-4 rounded-md bg-muted">
            <p className="text-sm font-medium mb-2">Event Log:</p>
            <div className="space-y-1">
              {events.map((event, i) => (
                <p key={i} className="text-xs text-muted-foreground font-mono">
                  {event}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  },
}

export const PerformanceComparison: Story = {
  args: {
    columns: basicColumns,
    data: generateUsers(5000),
    enableVirtualization: false,
    enableSorting: true,
    enableFiltering: true,
  },
  render: (args) => {
    const [useVirtualization, setUseVirtualization] = React.useState(false)
    const [renderTime, setRenderTime] = React.useState<number>(0)
    
    React.useEffect(() => {
      const start = performance.now()
      setTimeout(() => {
        setRenderTime(performance.now() - start)
      }, 0)
    }, [useVirtualization])
    
    return (
      <div className="w-full max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between p-4 rounded-md bg-muted">
          <div>
            <p className="font-medium">Performance Test: 5,000 rows</p>
            <p className="text-sm text-muted-foreground">
              Render time: {renderTime.toFixed(2)}ms
            </p>
          </div>
          <Button
            variant={useVirtualization ? "default" : "outline"}
            onClick={() => setUseVirtualization(!useVirtualization)}
          >
            {useVirtualization ? "Disable" : "Enable"} Virtualization
          </Button>
        </div>
        <DataGridOptimized
          {...args}
          enableVirtualization={useVirtualization}
          virtualRowHeight={50}
        />
      </div>
    )
  },
}

export const FullyFeatured: Story = {
  args: {
    columns: advancedColumns,
    data: generateUsers(100),
    enableRowSelection: true,
    enableSorting: true,
    enableFiltering: true,
    enableColumnVisibility: true,
    enablePagination: true,
    enableVirtualization: true,
    pageSize: 20,
    virtualRowHeight: 80,
    overscan: 5,
  },
  render: (args) => {
    const [state, setState] = React.useState({
      selectedCount: 0,
      sortingColumns: 0,
      activeFilters: 0,
      hiddenColumns: 0,
    })
    
    return (
      <div className="w-full max-w-7xl mx-auto space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 rounded-md bg-blue-50 border border-blue-200">
            <p className="text-sm font-medium text-blue-800">Selected Rows</p>
            <p className="text-2xl font-bold text-blue-900">{state.selectedCount}</p>
          </div>
          <div className="p-4 rounded-md bg-green-50 border border-green-200">
            <p className="text-sm font-medium text-green-800">Sorted Columns</p>
            <p className="text-2xl font-bold text-green-900">{state.sortingColumns}</p>
          </div>
          <div className="p-4 rounded-md bg-yellow-50 border border-yellow-200">
            <p className="text-sm font-medium text-yellow-800">Active Filters</p>
            <p className="text-2xl font-bold text-yellow-900">{state.activeFilters}</p>
          </div>
          <div className="p-4 rounded-md bg-purple-50 border border-purple-200">
            <p className="text-sm font-medium text-purple-800">Hidden Columns</p>
            <p className="text-2xl font-bold text-purple-900">{state.hiddenColumns}</p>
          </div>
        </div>
        <DataGridOptimized
          {...args}
          onRowSelectionChange={(selection) => setState(prev => ({ ...prev, selectedCount: Object.keys(selection).length }))}
          onSortingChange={(sorting) => setState(prev => ({ ...prev, sortingColumns: sorting.length }))}
          onColumnFiltersChange={(filters) => setState(prev => ({ ...prev, activeFilters: filters.length }))}
          onColumnVisibilityChange={(visibility) => setState(prev => ({ ...prev, hiddenColumns: Object.values(visibility).filter(v => !v).length }))}
        />
      </div>
    )
  },
}
