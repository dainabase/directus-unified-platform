import type { Meta, StoryObj } from '@storybook/react';
import { VirtualizedTable } from './virtualized-table';
import { useState } from 'react';

const meta = {
  title: 'Data Display/VirtualizedTable',
  component: VirtualizedTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'High-performance virtualized table for rendering large datasets efficiently. Only renders visible rows to maintain 60fps scrolling even with thousands of items.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    rowHeight: {
      control: { type: 'number', min: 30, max: 100 },
      description: 'Height of each row in pixels',
    },
    headerHeight: {
      control: { type: 'number', min: 40, max: 100 },
      description: 'Height of the header row in pixels',
    },
    visibleRows: {
      control: { type: 'number', min: 5, max: 50 },
      description: 'Number of rows visible in the viewport',
    },
    striped: {
      control: 'boolean',
      description: 'Apply alternating row colors',
    },
    hoverable: {
      control: 'boolean',
      description: 'Highlight rows on hover',
    },
    bordered: {
      control: 'boolean',
      description: 'Show table borders',
    },
    stickyHeader: {
      control: 'boolean',
      description: 'Make header sticky on scroll',
    },
    selectable: {
      control: 'boolean',
      description: 'Enable row selection',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state',
    },
  },
} satisfies Meta<typeof VirtualizedTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// Generate sample data
const generateData = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    department: ['Engineering', 'Design', 'Marketing', 'Sales', 'HR'][i % 5],
    role: ['Manager', 'Senior', 'Junior', 'Lead', 'Intern'][i % 5],
    salary: 50000 + Math.floor(Math.random() * 100000),
    startDate: new Date(2020 + (i % 5), i % 12, 1).toLocaleDateString(),
    status: i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Inactive' : 'Pending',
    performance: Math.floor(Math.random() * 100),
  }));
};

const columns = [
  { key: 'id', header: 'ID', width: 60, sortable: true },
  { key: 'name', header: 'Name', width: 150, sortable: true },
  { key: 'email', header: 'Email', width: 200 },
  { key: 'department', header: 'Department', width: 120, sortable: true },
  { key: 'role', header: 'Role', width: 100 },
  { 
    key: 'salary', 
    header: 'Salary', 
    width: 120,
    sortable: true,
    render: (value: number) => `$${value.toLocaleString()}`
  },
  { key: 'startDate', header: 'Start Date', width: 100 },
  { 
    key: 'status', 
    header: 'Status',
    width: 100,
    render: (value: string) => (
      <span 
        style={{
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 500,
          backgroundColor: 
            value === 'Active' ? '#10b981' : 
            value === 'Inactive' ? '#ef4444' : 
            '#f59e0b',
          color: 'white'
        }}
      >
        {value}
      </span>
    )
  },
  {
    key: 'performance',
    header: 'Performance',
    width: 120,
    render: (value: number) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div 
          style={{ 
            flex: 1, 
            height: '8px', 
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden'
          }}
        >
          <div 
            style={{ 
              width: `${value}%`,
              height: '100%',
              backgroundColor: value > 75 ? '#10b981' : value > 50 ? '#3b82f6' : '#ef4444',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
        <span style={{ fontSize: '12px', minWidth: '30px' }}>{value}%</span>
      </div>
    )
  }
];

export const Default: Story = {
  args: {
    data: generateData(100),
    columns: columns.slice(0, 5),
    visibleRows: 10,
    rowHeight: 48,
    headerHeight: 56,
  },
};

export const LargeDataset: Story = {
  args: {
    data: generateData(10000),
    columns,
    visibleRows: 15,
    rowHeight: 48,
    headerHeight: 56,
  },
};

export const WithSelection: Story = {
  render: () => {
    const [selectedRows, setSelectedRows] = useState(new Set<number>());
    const data = generateData(100);
    
    return (
      <div>
        <div style={{ marginBottom: '16px' }}>
          Selected: {selectedRows.size} rows
        </div>
        <VirtualizedTable
          data={data}
          columns={columns}
          selectable
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          visibleRows={10}
        />
      </div>
    );
  },
};

export const WithSorting: Story = {
  render: () => {
    const [data, setData] = useState(generateData(100));
    
    const handleSort = (column: string, direction: 'asc' | 'desc') => {
      const sorted = [...data].sort((a, b) => {
        const aVal = (a as any)[column];
        const bVal = (b as any)[column];
        
        if (direction === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
      
      setData(sorted);
    };
    
    return (
      <VirtualizedTable
        data={data}
        columns={columns}
        onSort={handleSort}
        visibleRows={10}
      />
    );
  },
};

export const Striped: Story = {
  args: {
    data: generateData(50),
    columns,
    striped: true,
    visibleRows: 10,
  },
};

export const Loading: Story = {
  args: {
    data: [],
    columns,
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    columns,
    emptyMessage: 'No employees found. Try adjusting your filters.',
  },
};

export const CustomStyling: Story = {
  args: {
    data: generateData(100),
    columns,
    visibleRows: 8,
    rowHeight: 60,
    headerHeight: 70,
    striped: true,
    hoverable: true,
    bordered: true,
    stickyHeader: true,
    className: 'shadow-lg rounded-xl',
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    const [data, setData] = useState(generateData(1000));
    const [selectedRows, setSelectedRows] = useState(new Set<number>());
    const [loading, setLoading] = useState(false);
    
    const handleRowClick = (item: any, index: number) => {
      console.log('Row clicked:', item, index);
    };
    
    const handleSort = (column: string, direction: 'asc' | 'desc') => {
      setLoading(true);
      
      setTimeout(() => {
        const sorted = [...data].sort((a, b) => {
          const aVal = (a as any)[column];
          const bVal = (b as any)[column];
          
          if (direction === 'asc') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });
        
        setData(sorted);
        setLoading(false);
      }, 500);
    };
    
    const handleFilter = (department: string) => {
      if (department === 'All') {
        setData(generateData(1000));
      } else {
        const filtered = generateData(1000).filter(item => item.department === department);
        setData(filtered);
      }
    };
    
    return (
      <div>
        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label>Filter by Department:</label>
          <select onChange={(e) => handleFilter(e.target.value)}>
            <option>All</option>
            <option>Engineering</option>
            <option>Design</option>
            <option>Marketing</option>
            <option>Sales</option>
            <option>HR</option>
          </select>
          <span style={{ marginLeft: 'auto' }}>
            Total: {data.length} | Selected: {selectedRows.size}
          </span>
        </div>
        
        <VirtualizedTable
          data={data}
          columns={columns}
          visibleRows={12}
          rowHeight={48}
          headerHeight={56}
          loading={loading}
          selectable
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          onRowClick={handleRowClick}
          onSort={handleSort}
          striped
          hoverable
          stickyHeader
        />
      </div>
    );
  },
};

export const PerformanceTest: Story = {
  name: '🚀 Performance Test (100k rows)',
  render: () => {
    const hugeData = generateData(100000);
    
    return (
      <div>
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '8px',
          marginBottom: '16px' 
        }}>
          <h3 style={{ margin: 0, marginBottom: '8px' }}>Performance Metrics</h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
            Rendering 100,000 rows with virtualization. Only visible rows are rendered in the DOM.
          </p>
          <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
            <div>
              <strong>Total Rows:</strong> 100,000
            </div>
            <div>
              <strong>Rendered Rows:</strong> ~20
            </div>
            <div>
              <strong>Memory Usage:</strong> Minimal
            </div>
            <div>
              <strong>Scroll FPS:</strong> 60
            </div>
          </div>
        </div>
        
        <VirtualizedTable
          data={hugeData}
          columns={columns}
          visibleRows={15}
          rowHeight={48}
          striped
          hoverable
        />
      </div>
    );
  },
};
