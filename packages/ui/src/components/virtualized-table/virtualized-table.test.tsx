import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VirtualizedTable } from './virtualized-table';
import type { VirtualizedTableColumn } from './virtualized-table';

// Mock data for testing
const generateMockData = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i % 3 === 0 ? 'Admin' : i % 2 === 0 ? 'Editor' : 'Viewer',
    status: i % 2 === 0 ? 'Active' : 'Inactive',
    createdAt: new Date(2025, 0, i + 1).toISOString(),
  }));
};

const mockColumns: VirtualizedTableColumn[] = [
  { key: 'id', header: 'ID', width: 80, sortable: true },
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email' },
  { 
    key: 'role', 
    header: 'Role',
    render: (value) => <span className="badge">{value}</span>
  },
  { 
    key: 'status', 
    header: 'Status',
    render: (value) => (
      <span className={value === 'Active' ? 'text-green-500' : 'text-gray-500'}>
        {value}
      </span>
    )
  },
];

describe('VirtualizedTable', () => {
  it('renders without crashing', () => {
    const data = generateMockData(10);
    render(<VirtualizedTable data={data} columns={mockColumns} />);
    
    // Check if headers are rendered
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(
      <VirtualizedTable 
        data={[]} 
        columns={mockColumns}
        emptyMessage="No users found"
      />
    );
    
    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    const data = generateMockData(10);
    const { container } = render(
      <VirtualizedTable 
        data={data} 
        columns={mockColumns}
        loading={true}
      />
    );
    
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('handles virtualization for large datasets', () => {
    const data = generateMockData(1000);
    const { container } = render(
      <VirtualizedTable 
        data={data} 
        columns={mockColumns}
        visibleRows={10}
        rowHeight={48}
      />
    );
    
    // Only visible rows should be rendered (plus buffer)
    const rows = container.querySelectorAll('[style*="height: 48px"]');
    expect(rows.length).toBeLessThan(20); // 10 visible + buffer
    expect(rows.length).toBeGreaterThan(0);
  });

  it('handles scroll events and updates visible rows', async () => {
    const data = generateMockData(100);
    const { container } = render(
      <VirtualizedTable 
        data={data} 
        columns={mockColumns}
        visibleRows={10}
        rowHeight={48}
      />
    );
    
    const scrollContainer = container.querySelector('[style*="height: 480px"]');
    expect(scrollContainer).toBeInTheDocument();
    
    // Simulate scroll
    if (scrollContainer) {
      fireEvent.scroll(scrollContainer, { target: { scrollTop: 480 } });
      
      await waitFor(() => {
        // Check that different rows are visible after scrolling
        expect(screen.queryByText('User 1')).not.toBeInTheDocument();
        expect(screen.getByText('User 11')).toBeInTheDocument();
      });
    }
  });

  it('handles row click events', () => {
    const data = generateMockData(10);
    const handleRowClick = jest.fn();
    
    render(
      <VirtualizedTable 
        data={data} 
        columns={mockColumns}
        onRowClick={handleRowClick}
      />
    );
    
    const firstRow = screen.getByText('User 1').closest('div[style*="height"]');
    if (firstRow) {
      fireEvent.click(firstRow);
      expect(handleRowClick).toHaveBeenCalledWith(data[0], 0);
    }
  });

  it('handles sorting when column is sortable', () => {
    const data = generateMockData(10);
    const handleSort = jest.fn();
    
    render(
      <VirtualizedTable 
        data={data} 
        columns={mockColumns}
        onSort={handleSort}
      />
    );
    
    const idHeader = screen.getByText('ID');
    fireEvent.click(idHeader);
    
    expect(handleSort).toHaveBeenCalledWith('id', 'asc');
    
    // Click again for desc
    fireEvent.click(idHeader);
    expect(handleSort).toHaveBeenCalledWith('id', 'desc');
  });

  it('handles row selection', () => {
    const data = generateMockData(10);
    const handleSelectionChange = jest.fn();
    const selectedRows = new Set<number>();
    
    const { container } = render(
      <VirtualizedTable 
        data={data} 
        columns={mockColumns}
        selectable={true}
        selectedRows={selectedRows}
        onSelectionChange={handleSelectionChange}
      />
    );
    
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBeGreaterThan(0);
    
    // Select first row
    fireEvent.click(checkboxes[1]); // First is select all
    expect(handleSelectionChange).toHaveBeenCalledWith(new Set([0]));
  });

  it('handles select all functionality', () => {
    const data = generateMockData(10);
    const handleSelectionChange = jest.fn();
    
    const { container } = render(
      <VirtualizedTable 
        data={data} 
        columns={mockColumns}
        selectable={true}
        selectedRows={new Set()}
        onSelectionChange={handleSelectionChange}
      />
    );
    
    const selectAllCheckbox = container.querySelector('input[type="checkbox"][aria-label="Select all rows"]');
    expect(selectAllCheckbox).toBeInTheDocument();
    
    if (selectAllCheckbox) {
      fireEvent.click(selectAllCheckbox);
      expect(handleSelectionChange).toHaveBeenCalledWith(
        new Set(Array.from({ length: 10 }, (_, i) => i))
      );
    }
  });

  it('applies striped styling when enabled', () => {
    const data = generateMockData(10);
    const { container } = render(
      <VirtualizedTable 
        data={data} 
        columns={mockColumns}
        striped={true}
      />
    );
    
    const rows = container.querySelectorAll('[style*="height: 48px"]');
    // Check if odd rows have striped styling
    expect(rows[1]?.className).toContain('bg-muted/20');
  });

  it('renders custom content with render function', () => {
    const data = generateMockData(5);
    render(<VirtualizedTable data={data} columns={mockColumns} />);
    
    // Check if custom rendered content appears
    const badges = screen.getAllByText(/Admin|Editor|Viewer/);
    expect(badges.length).toBeGreaterThan(0);
    
    const activeStatus = screen.getAllByText('Active');
    expect(activeStatus.length).toBeGreaterThan(0);
  });

  it('handles sticky header', () => {
    const data = generateMockData(10);
    const { container } = render(
      <VirtualizedTable 
        data={data} 
        columns={mockColumns}
        stickyHeader={true}
      />
    );
    
    const header = container.querySelector('.sticky.top-0');
    expect(header).toBeInTheDocument();
  });

  it('respects custom row and header heights', () => {
    const data = generateMockData(10);
    const { container } = render(
      <VirtualizedTable 
        data={data} 
        columns={mockColumns}
        rowHeight={60}
        headerHeight={80}
        visibleRows={5}
      />
    );
    
    const header = container.querySelector('[style*="height: 80px"]');
    expect(header).toBeInTheDocument();
    
    const rows = container.querySelectorAll('[style*="height: 60px"]');
    expect(rows.length).toBeGreaterThan(0);
    
    const scrollContainer = container.querySelector('[style*="height: 300px"]'); // 5 * 60
    expect(scrollContainer).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const data = generateMockData(10);
    const { container } = render(
      <VirtualizedTable 
        data={data} 
        columns={mockColumns}
        className="custom-table-class"
      />
    );
    
    expect(container.querySelector('.custom-table-class')).toBeInTheDocument();
  });

  it('handles column width configuration', () => {
    const customColumns: VirtualizedTableColumn[] = [
      { key: 'id', header: 'ID', width: 100 },
      { key: 'name', header: 'Name', width: '50%' },
      { key: 'email', header: 'Email' }, // Default width
    ];
    
    const data = generateMockData(5);
    const { container } = render(
      <VirtualizedTable data={data} columns={customColumns} />
    );
    
    const firstColumn = container.querySelector('[style*="width: 100px"]');
    expect(firstColumn).toBeInTheDocument();
    
    const secondColumn = container.querySelector('[style*="width: 50%"]');
    expect(secondColumn).toBeInTheDocument();
  });

  it('resets scroll position when data changes', () => {
    const initialData = generateMockData(100);
    const { container, rerender } = render(
      <VirtualizedTable 
        data={initialData} 
        columns={mockColumns}
        visibleRows={10}
      />
    );
    
    const scrollContainer = container.querySelector('[style*="height: 480px"]');
    
    // Scroll down
    if (scrollContainer) {
      fireEvent.scroll(scrollContainer, { target: { scrollTop: 500 } });
      
      // Change data
      const newData = generateMockData(50);
      rerender(
        <VirtualizedTable 
          data={newData} 
          columns={mockColumns}
          visibleRows={10}
        />
      );
      
      // Should reset to top
      expect(scrollContainer.scrollTop).toBe(0);
    }
  });

  it('handles empty column render function gracefully', () => {
    const simpleColumns: VirtualizedTableColumn[] = [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
    ];
    
    const data = [{ id: 1, name: 'Test User' }];
    render(<VirtualizedTable data={data} columns={simpleColumns} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('maintains performance with large datasets', () => {
    const largeData = generateMockData(10000);
    const startTime = performance.now();
    
    const { container } = render(
      <VirtualizedTable 
        data={largeData} 
        columns={mockColumns}
        visibleRows={20}
      />
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render quickly even with 10k items
    expect(renderTime).toBeLessThan(1000); // Less than 1 second
    
    // Should only render visible rows
    const rows = container.querySelectorAll('[style*="height: 48px"]');
    expect(rows.length).toBeLessThan(50); // Visible + buffer
  });
});
