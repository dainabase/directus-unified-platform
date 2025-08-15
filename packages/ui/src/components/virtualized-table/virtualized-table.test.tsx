/**
 * Test Suite for VirtualizedTable Component
 * 
 * This high-performance virtualized table component handles large datasets
 * with scroll virtualization, sorting, selection, and more.
 * 
 * @coverage Target: 90%+
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';

import { VirtualizedTable } from './virtualized-table';
import type { VirtualizedTableProps, VirtualizedTableColumn } from './virtualized-table';

// Mock data for testing
const mockData = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  value: Math.floor(Math.random() * 1000),
  status: i % 2 === 0 ? 'active' : 'inactive',
  description: `Description for item ${i + 1}`,
}));

const mockColumns: VirtualizedTableColumn[] = [
  { key: 'id', header: 'ID', width: 80 },
  { key: 'name', header: 'Name', sortable: true },
  { key: 'value', header: 'Value', sortable: true, render: (value) => `$${value}` },
  { key: 'status', header: 'Status', render: (value) => (
    <span className={value === 'active' ? 'text-green-500' : 'text-gray-500'}>
      {value}
    </span>
  )},
  { key: 'description', header: 'Description' },
];

describe('VirtualizedTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock IntersectionObserver for virtualization
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. RENDERING TESTS
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<VirtualizedTable data={mockData} columns={mockColumns} />);
      expect(screen.getByRole('table', { hidden: true })).toBeInTheDocument();
    });

    it('should render column headers correctly', () => {
      render(<VirtualizedTable data={mockData} columns={mockColumns} />);
      
      mockColumns.forEach(column => {
        expect(screen.getByText(column.header as string)).toBeInTheDocument();
      });
    });

    it('should render loading state', () => {
      render(<VirtualizedTable data={[]} columns={mockColumns} loading={true} />);
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should render empty state with custom message', () => {
      const emptyMessage = 'No items found';
      render(
        <VirtualizedTable 
          data={[]} 
          columns={mockColumns} 
          emptyMessage={emptyMessage}
        />
      );
      expect(screen.getByText(emptyMessage)).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <VirtualizedTable 
          data={mockData} 
          columns={mockColumns} 
          className="custom-table-class"
        />
      );
      expect(container.firstChild).toHaveClass('custom-table-class');
    });

    it('should render with custom row and header heights', () => {
      const { container } = render(
        <VirtualizedTable 
          data={mockData} 
          columns={mockColumns}
          rowHeight={60}
          headerHeight={80}
        />
      );
      
      const header = container.querySelector('.bg-muted\\/50');
      expect(header).toHaveStyle({ height: '80px' });
    });
  });

  // 2. VIRTUALIZATION TESTS
  describe('Virtualization', () => {
    it('should only render visible rows', () => {
      const { container } = render(
        <VirtualizedTable 
          data={mockData} 
          columns={mockColumns}
          visibleRows={10}
          rowHeight={48}
        />
      );
      
      // Should render approximately visibleRows + buffer
      const rows = container.querySelectorAll('[class*="border-b"]');
      expect(rows.length).toBeLessThan(20); // 10 visible + buffer
      expect(rows.length).toBeGreaterThan(0);
    });

    it('should handle scroll events and update visible range', async () => {
      const { container } = render(
        <VirtualizedTable 
          data={mockData} 
          columns={mockColumns}
          visibleRows={10}
          rowHeight={48}
        />
      );
      
      const scrollContainer = container.querySelector('.overflow-auto');
      expect(scrollContainer).toBeInTheDocument();
      
      // Simulate scroll
      fireEvent.scroll(scrollContainer!, { target: { scrollTop: 480 } });
      
      await waitFor(() => {
        // Should update rendered rows
        expect(container.querySelectorAll('[class*="border-b"]').length).toBeGreaterThan(0);
      });
    });

    it('should calculate total height correctly', () => {
      const { container } = render(
        <VirtualizedTable 
          data={mockData} 
          columns={mockColumns}
          rowHeight={48}
        />
      );
      
      const virtualSpacer = container.querySelector('[style*="position: relative"]');
      const expectedHeight = mockData.length * 48;
      expect(virtualSpacer).toHaveStyle({ height: `${expectedHeight}px` });
    });
  });

  // 3. SORTING TESTS
  describe('Sorting', () => {
    it('should call onSort when clicking sortable column', async () => {
      const handleSort = vi.fn();
      render(
        <VirtualizedTable 
          data={mockData} 
          columns={mockColumns}
          onSort={handleSort}
        />
      );
      
      const nameHeader = screen.getByText('Name');
      await userEvent.click(nameHeader);
      
      expect(handleSort).toHaveBeenCalledWith('name', 'asc');
    });

    it('should toggle sort direction on repeated clicks', async () => {
      const handleSort = vi.fn();
      render(
        <VirtualizedTable 
          data={mockData} 
          columns={mockColumns}
          onSort={handleSort}
        />
      );
      
      const valueHeader = screen.getByText('Value');
      
      await userEvent.click(valueHeader);
      expect(handleSort).toHaveBeenCalledWith('value', 'asc');
      
      await userEvent.click(valueHeader);
      expect(handleSort).toHaveBeenCalledWith('value', 'desc');
    });

    it('should display sort indicators', async () => {
      const { container } = render(
        <VirtualizedTable 
          data={mockData} 
          columns={mockColumns}
          onSort={vi.fn()}
        />
      );
      
      const nameHeader = screen.getByText('Name');
      await userEvent.click(nameHeader);
      
      // Should show sort indicator
      expect(container.innerHTML).toContain('↑');
    });

    it('should not sort non-sortable columns', async () => {
      const handleSort = vi.fn();
      render(
        <VirtualizedTable 
          data={mockData} 
          columns={mockColumns}
          onSort={handleSort}
        />
      );
      
      const idHeader = screen.getByText('ID');
      await userEvent.click(idHeader);
      
      expect(handleSort).not.toHaveBeenCalled();
    });
  });

  // 4. SELECTION TESTS
  describe('Selection', () => {
    it('should render selection checkboxes when selectable', () => {
      render(
        <VirtualizedTable 
          data={mockData} 
          columns={mockColumns}
          selectable={true}
          onSelectionChange={vi.fn()}
        />
      );
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('should handle individual row selection', async () => {
      const handleSelectionChange = vi.fn();
      const { container } = render(
        <VirtualizedTable 
          data={mockData} 
          columns={mockColumns}
          selectable={true}
          selectedRows={new Set()}
          onSelectionChange={handleSelectionChange}
        />
      );
      
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      await userEvent.click(checkboxes[1]); // Click first data row checkbox
      
      expect(handleSelectionChange).toHaveBeenCalledWith(new Set([0]));
    });

    it('should handle select all functionality', async () => {
      const handleSelectionChange = vi.fn();
      render(
        <VirtualizedTable 
          data={mockData.slice(0, 5)} // Use smaller dataset for testing
          columns={mockColumns}
          selectable={true}
          selectedRows={new Set()}
          onSelectionChange={handleSelectionChange}
        />
      );
      
      const selectAllCheckbox = screen.getByLabelText('Select all rows');
      await userEvent.click(selectAllCheckbox);
      
      expect(handleSelectionChange).toHaveBeenCalledWith(new Set([0, 1, 2, 3, 4]));
    });

    it('should handle deselect all when all selected', async () => {
      const handleSelectionChange = vi.fn();
      const allSelected = new Set([0, 1, 2, 3, 4]);
      
      render(
        <VirtualizedTable 
          data={mockData.slice(0, 5)}
          columns={mockColumns}
          selectable={true}
          selectedRows={allSelected}
          onSelectionChange={handleSelectionChange}
        />
      );
      
      const selectAllCheckbox = screen.getByLabelText('Select all rows');
      await userEvent.click(selectAllCheckbox);
      
      expect(handleSelectionChange).toHaveBeenCalledWith(new Set());
    });

    it('should show selected row styling', () => {
      const { container } = render(
        <VirtualizedTable 
          data={mockData.slice(0, 5)}
          columns={mockColumns}
          selectable={true}
          selectedRows={new Set([0, 2])}
          onSelectionChange={vi.fn()}
        />
      );
      
      const rows = container.querySelectorAll('.bg-primary\\/10');
      expect(rows.length).toBe(2);
    });
  });

  // 5. ROW INTERACTION TESTS
  describe('Row Interactions', () => {
    it('should call onRowClick when clicking a row', async () => {
      const handleRowClick = vi.fn();
      const { container } = render(
        <VirtualizedTable 
          data={mockData.slice(0, 5)}
          columns={mockColumns}
          onRowClick={handleRowClick}
        />
      );
      
      const rows = container.querySelectorAll('[class*="border-b"]');
      await userEvent.click(rows[0]);
      
      expect(handleRowClick).toHaveBeenCalledWith(mockData[0], 0);
    });

    it('should apply hover styles when hoverable', async () => {
      const { container } = render(
        <VirtualizedTable 
          data={mockData.slice(0, 5)}
          columns={mockColumns}
          hoverable={true}
        />
      );
      
      const rows = container.querySelectorAll('[class*="hover:bg-muted"]');
      expect(rows.length).toBeGreaterThan(0);
    });

    it('should apply striped styling', () => {
      const { container } = render(
        <VirtualizedTable 
          data={mockData.slice(0, 5)}
          columns={mockColumns}
          striped={true}
        />
      );
      
      const stripedRows = container.querySelectorAll('[class*="bg-muted\\/20"]');
      expect(stripedRows.length).toBeGreaterThan(0);
    });

    it('should apply bordered styling', () => {
      const { container } = render(
        <VirtualizedTable 
          data={mockData}
          columns={mockColumns}
          bordered={true}
        />
      );
      
      expect(container.firstChild).toHaveClass('border');
    });
  });

  // 6. COLUMN RENDERING TESTS
  describe('Column Rendering', () => {
    it('should use custom render functions', () => {
      render(
        <VirtualizedTable 
          data={mockData.slice(0, 5)}
          columns={mockColumns}
        />
      );
      
      // Check if value column renders with $ prefix
      expect(screen.getByText(/\$\d+/)).toBeInTheDocument();
      
      // Check if status column renders with correct classes
      const activeStatus = screen.getByText('active');
      expect(activeStatus).toHaveClass('text-green-500');
    });

    it('should handle column widths correctly', () => {
      const { container } = render(
        <VirtualizedTable 
          data={mockData.slice(0, 5)}
          columns={[
            { key: 'id', header: 'ID', width: 100 },
            { key: 'name', header: 'Name', width: '50%' },
          ]}
        />
      );
      
      const headers = container.querySelectorAll('[style*="width"]');
      expect(headers[0]).toHaveStyle({ width: '100px' });
      expect(headers[1]).toHaveStyle({ width: '50%' });
    });

    it('should handle columns without render function', () => {
      render(
        <VirtualizedTable 
          data={[{ text: 'Simple text' }]}
          columns={[{ key: 'text', header: 'Text' }]}
        />
      );
      
      expect(screen.getByText('Simple text')).toBeInTheDocument();
    });
  });

  // 7. STICKY HEADER TESTS
  describe('Sticky Header', () => {
    it('should apply sticky header styles when enabled', () => {
      const { container } = render(
        <VirtualizedTable 
          data={mockData}
          columns={mockColumns}
          stickyHeader={true}
        />
      );
      
      const header = container.querySelector('.sticky');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('top-0', 'z-10');
    });

    it('should not apply sticky styles when disabled', () => {
      const { container } = render(
        <VirtualizedTable 
          data={mockData}
          columns={mockColumns}
          stickyHeader={false}
        />
      );
      
      const header = container.querySelector('.sticky');
      expect(header).not.toBeInTheDocument();
    });
  });

  // 8. EDGE CASES & ERROR HANDLING
  describe('Edge Cases', () => {
    it('should handle empty data array', () => {
      render(
        <VirtualizedTable 
          data={[]}
          columns={mockColumns}
        />
      );
      
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('should handle very large datasets', () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
      }));
      
      const { container } = render(
        <VirtualizedTable 
          data={largeData}
          columns={[
            { key: 'id', header: 'ID' },
            { key: 'name', header: 'Name' },
          ]}
          visibleRows={20}
        />
      );
      
      // Should still only render visible rows
      const rows = container.querySelectorAll('[class*="border-b"]');
      expect(rows.length).toBeLessThan(40); // 20 visible + buffer
    });

    it('should handle rapid scroll events', async () => {
      const { container } = render(
        <VirtualizedTable 
          data={mockData}
          columns={mockColumns}
          visibleRows={10}
        />
      );
      
      const scrollContainer = container.querySelector('.overflow-auto');
      
      // Simulate rapid scrolling
      fireEvent.scroll(scrollContainer!, { target: { scrollTop: 100 } });
      fireEvent.scroll(scrollContainer!, { target: { scrollTop: 200 } });
      fireEvent.scroll(scrollContainer!, { target: { scrollTop: 300 } });
      
      // Should not crash
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should reset scroll position on data change', () => {
      const { rerender, container } = render(
        <VirtualizedTable 
          data={mockData}
          columns={mockColumns}
        />
      );
      
      const scrollContainer = container.querySelector('.overflow-auto');
      fireEvent.scroll(scrollContainer!, { target: { scrollTop: 500 } });
      
      const newData = [{ id: 1, name: 'New Item' }];
      rerender(
        <VirtualizedTable 
          data={newData}
          columns={mockColumns}
        />
      );
      
      // Scroll should reset to top
      expect(scrollContainer?.scrollTop).toBe(0);
    });

    it('should handle undefined/null values in data', () => {
      const dataWithNulls = [
        { id: 1, name: null, value: undefined },
        { id: 2, name: 'Valid', value: 100 },
      ];
      
      render(
        <VirtualizedTable 
          data={dataWithNulls}
          columns={mockColumns.slice(0, 3)}
        />
      );
      
      // Should not crash
      expect(screen.getByText('Valid')).toBeInTheDocument();
    });

    it('should handle click event propagation correctly', async () => {
      const handleRowClick = vi.fn();
      const handleSelectionChange = vi.fn();
      
      const { container } = render(
        <VirtualizedTable 
          data={mockData.slice(0, 3)}
          columns={mockColumns}
          selectable={true}
          onRowClick={handleRowClick}
          onSelectionChange={handleSelectionChange}
        />
      );
      
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      await userEvent.click(checkboxes[1]); // Click row checkbox
      
      // Should call selection change but not row click
      expect(handleSelectionChange).toHaveBeenCalled();
      expect(handleRowClick).not.toHaveBeenCalled();
    });
  });

  // 9. ACCESSIBILITY TESTS
  describe('Accessibility', () => {
    it('should have proper ARIA labels for checkboxes', () => {
      render(
        <VirtualizedTable 
          data={mockData.slice(0, 3)}
          columns={mockColumns}
          selectable={true}
          onSelectionChange={vi.fn()}
        />
      );
      
      expect(screen.getByLabelText('Select all rows')).toBeInTheDocument();
      expect(screen.getByLabelText('Select row 1')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const handleRowClick = vi.fn();
      const { container } = render(
        <VirtualizedTable 
          data={mockData.slice(0, 3)}
          columns={mockColumns}
          onRowClick={handleRowClick}
        />
      );
      
      const firstRow = container.querySelector('[class*="cursor-pointer"]');
      firstRow?.focus();
      
      fireEvent.keyDown(firstRow!, { key: 'Enter' });
      
      // Should trigger row click on Enter
      expect(handleRowClick).toHaveBeenCalled();
    });

    it('should maintain focus on scroll', async () => {
      const { container } = render(
        <VirtualizedTable 
          data={mockData}
          columns={mockColumns}
          selectable={true}
          onSelectionChange={vi.fn()}
        />
      );
      
      const checkbox = container.querySelector('input[type="checkbox"]');
      checkbox?.focus();
      
      const scrollContainer = container.querySelector('.overflow-auto');
      fireEvent.scroll(scrollContainer!, { target: { scrollTop: 100 } });
      
      // Focus should be maintained
      expect(document.activeElement?.tagName).toBe('INPUT');
    });
  });

  // 10. PERFORMANCE TESTS
  describe('Performance', () => {
    it('should efficiently update on prop changes', () => {
      const { rerender } = render(
        <VirtualizedTable 
          data={mockData}
          columns={mockColumns}
          visibleRows={10}
        />
      );
      
      const startTime = performance.now();
      
      rerender(
        <VirtualizedTable 
          data={mockData}
          columns={mockColumns}
          visibleRows={20}
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Re-render should be fast (< 100ms)
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle buffer correctly for smooth scrolling', () => {
      const { container } = render(
        <VirtualizedTable 
          data={mockData}
          columns={mockColumns}
          visibleRows={10}
          rowHeight={48}
        />
      );
      
      // Should render buffer rows for smooth scrolling
      const rows = container.querySelectorAll('[class*="border-b"]');
      expect(rows.length).toBeGreaterThan(10); // More than visible due to buffer
      expect(rows.length).toBeLessThan(20); // But not too many
    });
  });

  // 11. SNAPSHOT TESTS
  describe('Snapshots', () => {
    it('should match snapshot with default props', () => {
      const { container } = render(
        <VirtualizedTable 
          data={mockData.slice(0, 3)}
          columns={mockColumns}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with all features enabled', () => {
      const { container } = render(
        <VirtualizedTable 
          data={mockData.slice(0, 3)}
          columns={mockColumns}
          selectable={true}
          striped={true}
          hoverable={true}
          bordered={true}
          stickyHeader={true}
          selectedRows={new Set([1])}
          onSelectionChange={vi.fn()}
          onRowClick={vi.fn()}
          onSort={vi.fn()}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});

// Type augmentations for custom matchers if needed
declare global {
  namespace Vi {
    interface Assertion {
      toBeValidTable(): void;
    }
  }
}

// Custom test utilities
export const createMockTableData = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    value: Math.floor(Math.random() * 1000),
    status: Math.random() > 0.5 ? 'active' : 'inactive',
  }));
};

export const createMockColumns = (): VirtualizedTableColumn[] => [
  { key: 'id', header: 'ID', width: 80 },
  { key: 'name', header: 'Name', sortable: true },
  { key: 'value', header: 'Value', sortable: true },
  { key: 'status', header: 'Status' },
];
