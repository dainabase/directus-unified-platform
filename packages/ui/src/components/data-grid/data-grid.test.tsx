import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataGrid } from './index';

const mockData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
];

const mockColumns = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email', sortable: true },
  { key: 'role', header: 'Role', sortable: false },
];

describe('DataGrid Component', () => {
  describe('Rendering', () => {
    it('renders table with data', () => {
      render(<DataGrid data={mockData} columns={mockColumns} />);
      
      // Check headers
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      
      // Check data
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('renders empty state when no data', () => {
      render(
        <DataGrid 
          data={[]} 
          columns={mockColumns}
          emptyMessage="No data available"
        />
      );
      
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('renders correct number of rows', () => {
      render(<DataGrid data={mockData} columns={mockColumns} />);
      
      const rows = screen.getAllByRole('row');
      // +1 for header row
      expect(rows).toHaveLength(mockData.length + 1);
    });
  });

  describe('Sorting', () => {
    it('sorts data by column when header clicked', async () => {
      const user = userEvent.setup();
      const onSort = vi.fn();
      
      render(
        <DataGrid 
          data={mockData} 
          columns={mockColumns}
          onSort={onSort}
        />
      );
      
      const nameHeader = screen.getByText('Name');
      await user.click(nameHeader);
      
      expect(onSort).toHaveBeenCalledWith({
        column: 'name',
        direction: 'asc'
      });
    });

    it('toggles sort direction on consecutive clicks', async () => {
      const user = userEvent.setup();
      const onSort = vi.fn();
      
      render(
        <DataGrid 
          data={mockData} 
          columns={mockColumns}
          onSort={onSort}
          sortColumn="name"
          sortDirection="asc"
        />
      );
      
      const nameHeader = screen.getByText('Name');
      await user.click(nameHeader);
      
      expect(onSort).toHaveBeenCalledWith({
        column: 'name',
        direction: 'desc'
      });
    });

    it('shows sort indicators', () => {
      render(
        <DataGrid 
          data={mockData} 
          columns={mockColumns}
          sortColumn="name"
          sortDirection="asc"
        />
      );
      
      const nameHeader = screen.getByText('Name').closest('th');
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    });

    it('does not sort non-sortable columns', async () => {
      const user = userEvent.setup();
      const onSort = vi.fn();
      
      render(
        <DataGrid 
          data={mockData} 
          columns={mockColumns}
          onSort={onSort}
        />
      );
      
      const roleHeader = screen.getByText('Role');
      await user.click(roleHeader);
      
      expect(onSort).not.toHaveBeenCalled();
    });
  });

  describe('Selection', () => {
    it('handles row selection', async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();
      
      render(
        <DataGrid 
          data={mockData} 
          columns={mockColumns}
          selectable
          onSelectionChange={onSelectionChange}
        />
      );
      
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // Click first data row checkbox
      
      expect(onSelectionChange).toHaveBeenCalledWith([mockData[0]]);
    });

    it('handles select all', async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();
      
      render(
        <DataGrid 
          data={mockData} 
          columns={mockColumns}
          selectable
          onSelectionChange={onSelectionChange}
        />
      );
      
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(selectAllCheckbox);
      
      expect(onSelectionChange).toHaveBeenCalledWith(mockData);
    });

    it('shows selected state', () => {
      render(
        <DataGrid 
          data={mockData} 
          columns={mockColumns}
          selectable
          selectedRows={[mockData[0]]}
        />
      );
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[1]).toBeChecked();
      expect(checkboxes[2]).not.toBeChecked();
    });
  });

  describe('Pagination', () => {
    it('renders pagination controls', () => {
      render(
        <DataGrid 
          data={mockData} 
          columns={mockColumns}
          paginated
          pageSize={2}
        />
      );
      
      expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('changes page on pagination click', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      
      render(
        <DataGrid 
          data={mockData} 
          columns={mockColumns}
          paginated
          pageSize={2}
          currentPage={1}
          onPageChange={onPageChange}
        />
      );
      
      const page2Button = screen.getByText('2');
      await user.click(page2Button);
      
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('disables previous on first page', () => {
      render(
        <DataGrid 
          data={mockData} 
          columns={mockColumns}
          paginated
          pageSize={2}
          currentPage={1}
        />
      );
      
      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toBeDisabled();
    });

    it('disables next on last page', () => {
      render(
        <DataGrid 
          data={mockData} 
          columns={mockColumns}
          paginated
          pageSize={2}
          currentPage={2}
        />
      );
      
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has correct table structure', () => {
      render(<DataGrid data={mockData} columns={mockColumns} />);
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(mockColumns.length);
      
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(0);
    });

    it('has correct ARIA attributes', () => {
      render(
        <DataGrid 
          data={mockData} 
          columns={mockColumns}
          ariaLabel="Users table"
        />
      );
      
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label', 'Users table');
    });

    it('announces sort changes to screen readers', () => {
      render(
        <DataGrid 
          data={mockData} 
          columns={mockColumns}
          sortColumn="name"
          sortDirection="asc"
        />
      );
      
      const nameHeader = screen.getByText('Name').closest('th');
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    });

    it('supports keyboard navigation', async () => {
      render(
        <DataGrid 
          data={mockData} 
          columns={mockColumns}
          selectable
        />
      );
      
      const firstCheckbox = screen.getAllByRole('checkbox')[1];
      firstCheckbox.focus();
      expect(firstCheckbox).toHaveFocus();
      
      // Tab navigation should work through interactive elements
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(1);
    });
  });

  describe('Custom Rendering', () => {
    it('supports custom cell renderer', () => {
      const customColumns = [
        ...mockColumns,
        {
          key: 'actions',
          header: 'Actions',
          render: (row: any) => (
            <button data-testid={`action-${row.id}`}>Edit</button>
          ),
        },
      ];
      
      render(<DataGrid data={mockData} columns={customColumns} />);
      
      expect(screen.getByTestId('action-1')).toBeInTheDocument();
      expect(screen.getByTestId('action-2')).toBeInTheDocument();
    });

    it('supports custom header renderer', () => {
      const customColumns = [
        {
          ...mockColumns[0],
          headerRender: () => <span data-testid="custom-header">Custom Name</span>,
        },
        ...mockColumns.slice(1),
      ];
      
      render(<DataGrid data={mockData} columns={customColumns} />);
      
      expect(screen.getByTestId('custom-header')).toBeInTheDocument();
    });
  });
});
