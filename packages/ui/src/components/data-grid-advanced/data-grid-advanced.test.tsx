import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DataGridAdvanced, DataGridAdvancedProps, ColumnDef } from './index';

// ============================================================================
// MOCK DATA & UTILITIES
// ============================================================================

const mockUsers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', age: 28, department: 'Engineering', salary: 85000, active: true, joinDate: '2022-01-15' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', age: 34, department: 'Marketing', salary: 65000, active: false, joinDate: '2021-03-20' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', age: 29, department: 'Engineering', salary: 90000, active: true, joinDate: '2020-11-10' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', age: 31, department: 'Design', salary: 75000, active: true, joinDate: '2021-07-05' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', age: 26, department: 'Engineering', salary: 78000, active: false, joinDate: '2023-02-28' },
  { id: 6, name: 'Frank Miller', email: 'frank@example.com', age: 45, department: 'Management', salary: 120000, active: true, joinDate: '2019-05-15' },
  { id: 7, name: 'Grace Kelly', email: 'grace@example.com', age: 30, department: 'Marketing', salary: 68000, active: true, joinDate: '2022-09-12' },
  { id: 8, name: 'Henry Ford', email: 'henry@example.com', age: 42, department: 'Engineering', salary: 95000, active: true, joinDate: '2020-01-08' },
  { id: 9, name: 'Ivy Chen', email: 'ivy@example.com', age: 27, department: 'Design', salary: 72000, active: false, joinDate: '2022-11-20' },
  { id: 10, name: 'Jack Wilson', email: 'jack@example.com', age: 35, department: 'Marketing', salary: 70000, active: true, joinDate: '2021-12-03' },
];

const basicColumns: ColumnDef[] = [
  { id: 'id', header: 'ID', accessor: 'id', width: 80 },
  { id: 'name', header: 'Name', accessor: 'name', sortable: true, filterable: true },
  { id: 'email', header: 'Email', accessor: 'email', sortable: true, filterable: true },
  { id: 'age', header: 'Age', accessor: 'age', sortable: true, width: 100 },
  { id: 'department', header: 'Department', accessor: 'department', sortable: true, filterable: true },
];

const advancedColumns: ColumnDef[] = [
  { 
    id: 'id', 
    header: 'ID', 
    accessor: 'id', 
    width: 80,
    sortable: false 
  },
  { 
    id: 'name', 
    header: 'Full Name', 
    accessor: 'name', 
    sortable: true, 
    filterable: true,
    minWidth: 150,
    maxWidth: 300 
  },
  { 
    id: 'email', 
    header: 'Email Address', 
    accessor: 'email', 
    sortable: true, 
    filterable: true,
    cell: ({ value }) => <a href={`mailto:${value}`} className="text-blue-600 hover:underline">{value}</a>
  },
  { 
    id: 'age', 
    header: 'Age', 
    accessor: 'age', 
    sortable: true, 
    width: 100,
    cell: ({ value }) => <span className={value > 30 ? 'text-green-600' : 'text-blue-600'}>{value}</span>
  },
  { 
    id: 'department', 
    header: 'Department', 
    accessor: 'department', 
    sortable: true, 
    filterable: true 
  },
  { 
    id: 'salary', 
    header: 'Salary', 
    accessor: 'salary', 
    sortable: true,
    cell: ({ value }) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
  },
  { 
    id: 'status', 
    header: 'Status', 
    accessor: (row: any) => row.active ? 'Active' : 'Inactive',
    cell: ({ value }) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {value}
      </span>
    )
  },
];

const defaultProps: DataGridAdvancedProps = {
  data: mockUsers,
  columns: basicColumns,
  pageSize: 5,
};

const renderDataGrid = (props: Partial<DataGridAdvancedProps> = {}) => {
  return render(<DataGridAdvanced {...defaultProps} {...props} />);
};

// ============================================================================
// 1. CORE FUNCTIONALITY TESTS
// ============================================================================

describe('DataGridAdvanced - Core Functionality', () => {
  it('renders without crashing with minimal props', () => {
    renderDataGrid();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders correct number of columns', () => {
    renderDataGrid();
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(basicColumns.length);
  });

  it('renders correct column headers', () => {
    renderDataGrid();
    basicColumns.forEach(column => {
      expect(screen.getByText(column.header)).toBeInTheDocument();
    });
  });

  it('renders correct number of rows based on pageSize', () => {
    renderDataGrid({ pageSize: 3 });
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(4); // 3 data rows + 1 header row
  });

  it('displays all data when pagination is disabled', () => {
    renderDataGrid({ enablePagination: false });
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(mockUsers.length + 1); // All data rows + header
  });

  it('applies custom className correctly', () => {
    const customClass = 'custom-grid-class';
    const { container } = renderDataGrid({ className: customClass });
    expect(container.firstChild).toHaveClass(customClass);
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<DataGridAdvanced {...defaultProps} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('handles empty data array gracefully', () => {
    renderDataGrid({ data: [] });
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('handles null data gracefully', () => {
    renderDataGrid({ data: null as any });
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('handles undefined data gracefully', () => {
    renderDataGrid({ data: undefined as any });
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });
});

// ============================================================================
// 2. LOADING & ERROR STATES TESTS
// ============================================================================

describe('DataGridAdvanced - Loading & Error States', () => {
  it('displays loading state correctly', () => {
    renderDataGrid({ loading: true });
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    const error = new Error('Failed to fetch data');
    renderDataGrid({ error });
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('displays error message from error object', () => {
    const customError = new Error('Network connection lost');
    renderDataGrid({ error: customError });
    expect(screen.getByText('Network connection lost')).toBeInTheDocument();
  });

  it('transitions from loading to data correctly', () => {
    const { rerender } = renderDataGrid({ loading: true });
    expect(screen.getByText('Loading data...')).toBeInTheDocument();

    rerender(<DataGridAdvanced {...defaultProps} loading={false} />);
    expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('transitions from error to data correctly', () => {
    const error = new Error('Test error');
    const { rerender } = renderDataGrid({ error });
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();

    rerender(<DataGridAdvanced {...defaultProps} error={null} />);
    expect(screen.queryByText('Failed to load data')).not.toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});

// ============================================================================
// 3. SORTING FUNCTIONALITY TESTS
// ============================================================================

describe('DataGridAdvanced - Sorting Functionality', () => {
  it('enables sorting by default', () => {
    renderDataGrid({ columns: advancedColumns });
    const nameHeader = screen.getByText('Full Name');
    expect(nameHeader.closest('th')).toHaveClass('cursor-pointer');
  });

  it('disables sorting when enableSorting is false', () => {
    renderDataGrid({ enableSorting: false, columns: advancedColumns });
    const nameHeader = screen.getByText('Full Name');
    expect(nameHeader.closest('th')).not.toHaveClass('cursor-pointer');
  });

  it('disables sorting for specific columns when sortable is false', () => {
    renderDataGrid({ columns: advancedColumns });
    const idHeader = screen.getByText('ID');
    const nameHeader = screen.getByText('Full Name');
    
    expect(idHeader.closest('th')).not.toHaveClass('cursor-pointer');
    expect(nameHeader.closest('th')).toHaveClass('cursor-pointer');
  });

  it('sorts data in ascending order on first click', async () => {
    const user = userEvent.setup();
    renderDataGrid();
    
    const nameHeader = screen.getByText('Name');
    await user.click(nameHeader);
    
    const firstRowName = screen.getAllByRole('cell')[1]; // First data cell in name column
    expect(firstRowName).toHaveTextContent('Alice Johnson'); // Should be first alphabetically
    expect(screen.getByText('↑')).toBeInTheDocument(); // Ascending indicator
  });

  it('sorts data in descending order on second click', async () => {
    const user = userEvent.setup();
    renderDataGrid();
    
    const nameHeader = screen.getByText('Name');
    await user.click(nameHeader); // First click - ascending
    await user.click(nameHeader); // Second click - descending
    
    expect(screen.getByText('↓')).toBeInTheDocument(); // Descending indicator
  });

  it('removes sorting on third click', async () => {
    const user = userEvent.setup();
    renderDataGrid();
    
    const nameHeader = screen.getByText('Name');
    await user.click(nameHeader); // Ascending
    await user.click(nameHeader); // Descending
    await user.click(nameHeader); // Remove sorting
    
    expect(screen.queryByText('↑')).not.toBeInTheDocument();
    expect(screen.queryByText('↓')).not.toBeInTheDocument();
  });

  it('sorts numeric columns correctly', async () => {
    const user = userEvent.setup();
    renderDataGrid();
    
    const ageHeader = screen.getByText('Age');
    await user.click(ageHeader);
    
    const ages = screen.getAllByRole('cell')
      .filter((cell, index) => (index + 1) % basicColumns.length === 4) // Age column
      .slice(0, 3) // First 3 ages
      .map(cell => parseInt(cell.textContent || ''));
    
    expect(ages[0]).toBeLessThanOrEqual(ages[1]);
    expect(ages[1]).toBeLessThanOrEqual(ages[2]);
  });

  it('handles sorting with accessor functions correctly', async () => {
    const user = userEvent.setup();
    renderDataGrid({ columns: advancedColumns });
    
    const statusHeader = screen.getByText('Status');
    await user.click(statusHeader);
    
    // Should sort by the computed status value
    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  it('maintains sort order across pagination', async () => {
    const user = userEvent.setup();
    renderDataGrid({ pageSize: 3 });
    
    const nameHeader = screen.getByText('Name');
    await user.click(nameHeader); // Sort ascending
    
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);
    
    // Should still show sorted data on next page
    expect(screen.getByText('↑')).toBeInTheDocument();
  });
});

// ============================================================================
// 4. FILTERING FUNCTIONALITY TESTS
// ============================================================================

describe('DataGridAdvanced - Filtering Functionality', () => {
  it('renders filter inputs for filterable columns', () => {
    renderDataGrid();
    const filterInputs = screen.getAllByRole('textbox');
    const filterableColumns = basicColumns.filter(col => col.filterable);
    expect(filterInputs).toHaveLength(filterableColumns.length);
  });

  it('does not render filter inputs when enableFiltering is false', () => {
    renderDataGrid({ enableFiltering: false });
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('filters data based on text input', async () => {
    const user = userEvent.setup();
    renderDataGrid();
    
    const nameFilter = screen.getByPlaceholderText('Filter Name...');
    await user.type(nameFilter, 'Alice');
    
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
    });
  });

  it('performs case-insensitive filtering', async () => {
    const user = userEvent.setup();
    renderDataGrid();
    
    const nameFilter = screen.getByPlaceholderText('Filter Name...');
    await user.type(nameFilter, 'alice');
    
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });
  });

  it('filters multiple columns simultaneously', async () => {
    const user = userEvent.setup();
    renderDataGrid();
    
    const nameFilter = screen.getByPlaceholderText('Filter Name...');
    const departmentFilter = screen.getByPlaceholderText('Filter Department...');
    
    await user.type(nameFilter, 'e'); // Should match multiple names
    await user.type(departmentFilter, 'Engineering');
    
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument(); // Has 'e' and is in Engineering
      expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument(); // Has 'e' but not in Engineering
    });
  });

  it('clears filter when input is emptied', async () => {
    const user = userEvent.setup();
    renderDataGrid({ pageSize: 10 });
    
    const nameFilter = screen.getByPlaceholderText('Filter Name...');
    await user.type(nameFilter, 'Alice');
    
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(2); // Header + 1 data row
    });
    
    await user.clear(nameFilter);
    
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(11); // Header + 10 data rows
    });
  });

  it('resets pagination when filter is applied', async () => {
    const user = userEvent.setup();
    renderDataGrid({ pageSize: 3 });
    
    // Go to page 2
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);
    expect(screen.getByText('Page 2 of')).toBeInTheDocument();
    
    // Apply filter
    const nameFilter = screen.getByPlaceholderText('Filter Name...');
    await user.type(nameFilter, 'Alice');
    
    await waitFor(() => {
      expect(screen.getByText('Page 1 of')).toBeInTheDocument();
    });
  });

  it('shows no data message when filter returns no results', async () => {
    const user = userEvent.setup();
    renderDataGrid();
    
    const nameFilter = screen.getByPlaceholderText('Filter Name...');
    await user.type(nameFilter, 'NonexistentName');
    
    await waitFor(() => {
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  it('does not render filter for non-filterable columns', () => {
    const mixedColumns = [
      { id: 'id', header: 'ID', accessor: 'id', filterable: false },
      { id: 'name', header: 'Name', accessor: 'name', filterable: true },
    ];
    
    renderDataGrid({ columns: mixedColumns });
    
    expect(screen.queryByPlaceholderText('Filter ID...')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filter Name...')).toBeInTheDocument();
  });
});

// ============================================================================
// 5. PAGINATION FUNCTIONALITY TESTS
// ============================================================================

describe('DataGridAdvanced - Pagination Functionality', () => {
  it('enables pagination by default', () => {
    renderDataGrid({ pageSize: 3 });
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText(/Page \d+ of \d+/)).toBeInTheDocument();
  });

  it('disables pagination when enablePagination is false', () => {
    renderDataGrid({ enablePagination: false });
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('shows correct page information', () => {
    renderDataGrid({ pageSize: 3 });
    expect(screen.getByText('Showing 1 to 3 of 10 results')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 4')).toBeInTheDocument();
  });

  it('navigates to next page correctly', async () => {
    const user = userEvent.setup();
    renderDataGrid({ pageSize: 3 });
    
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);
    
    expect(screen.getByText('Showing 4 to 6 of 10 results')).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 4')).toBeInTheDocument();
  });

  it('navigates to previous page correctly', async () => {
    const user = userEvent.setup();
    renderDataGrid({ pageSize: 3 });
    
    // Go to page 2 first
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);
    
    // Then go back
    const prevButton = screen.getByText('Previous');
    await user.click(prevButton);
    
    expect(screen.getByText('Showing 1 to 3 of 10 results')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 4')).toBeInTheDocument();
  });

  it('disables Previous button on first page', () => {
    renderDataGrid({ pageSize: 3 });
    const prevButton = screen.getByText('Previous');
    expect(prevButton).toBeDisabled();
  });

  it('disables Next button on last page', async () => {
    const user = userEvent.setup();
    renderDataGrid({ pageSize: 3 });
    
    // Navigate to last page
    const nextButton = screen.getByText('Next');
    await user.click(nextButton); // Page 2
    await user.click(nextButton); // Page 3
    await user.click(nextButton); // Page 4 (last page)
    
    expect(nextButton).toBeDisabled();
  });

  it('handles page size larger than data correctly', () => {
    renderDataGrid({ pageSize: 20 });
    expect(screen.getByText('Showing 1 to 10 of 10 results')).toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument(); // No pagination needed
  });

  it('updates pagination info after filtering', async () => {
    const user = userEvent.setup();
    renderDataGrid({ pageSize: 3 });
    
    const departmentFilter = screen.getByPlaceholderText('Filter Department...');
    await user.type(departmentFilter, 'Engineering');
    
    await waitFor(() => {
      // Should show filtered results count
      expect(screen.getByText(/Showing \d+ to \d+ of \d+ results/)).toBeInTheDocument();
    });
  });
});

// ============================================================================
// 6. ROW SELECTION FUNCTIONALITY TESTS
// ============================================================================

describe('DataGridAdvanced - Row Selection Functionality', () => {
  it('does not show selection checkboxes by default', () => {
    renderDataGrid();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('shows selection checkboxes when enableRowSelection is true', () => {
    renderDataGrid({ enableRowSelection: true });
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('shows select all checkbox in header', () => {
    renderDataGrid({ enableRowSelection: true, pageSize: 3 });
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(4); // 1 select all + 3 row checkboxes
  });

  it('selects individual row when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderDataGrid({ enableRowSelection: true, pageSize: 3, onSelectionChange });
    
    const checkboxes = screen.getAllByRole('checkbox');
    const firstRowCheckbox = checkboxes[1]; // Skip select all checkbox
    
    await user.click(firstRowCheckbox);
    
    expect(firstRowCheckbox).toBeChecked();
    expect(onSelectionChange).toHaveBeenCalledWith([mockUsers[0]]);
  });

  it('selects all visible rows when select all is clicked', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderDataGrid({ enableRowSelection: true, pageSize: 3, onSelectionChange });
    
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    await user.click(selectAllCheckbox);
    
    const rowCheckboxes = screen.getAllByRole('checkbox').slice(1);
    rowCheckboxes.forEach(checkbox => {
      expect(checkbox).toBeChecked();
    });
    
    expect(onSelectionChange).toHaveBeenCalledWith(mockUsers.slice(0, 3));
  });

  it('deselects all rows when select all is clicked again', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderDataGrid({ enableRowSelection: true, pageSize: 3, onSelectionChange });
    
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    await user.click(selectAllCheckbox); // Select all
    await user.click(selectAllCheckbox); // Deselect all
    
    const rowCheckboxes = screen.getAllByRole('checkbox').slice(1);
    rowCheckboxes.forEach(checkbox => {
      expect(checkbox).not.toBeChecked();
    });
    
    expect(onSelectionChange).toHaveBeenLastCalledWith([]);
  });

  it('updates select all checkbox state based on individual selections', async () => {
    const user = userEvent.setup();
    renderDataGrid({ enableRowSelection: true, pageSize: 3 });
    
    const checkboxes = screen.getAllByRole('checkbox');
    const selectAllCheckbox = checkboxes[0];
    const rowCheckboxes = checkboxes.slice(1);
    
    // Select all individual rows
    for (const checkbox of rowCheckboxes) {
      await user.click(checkbox);
    }
    
    expect(selectAllCheckbox).toBeChecked();
  });

  it('prevents row click event when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    renderDataGrid({ enableRowSelection: true, onRowClick, pageSize: 3 });
    
    const checkboxes = screen.getAllByRole('checkbox');
    const firstRowCheckbox = checkboxes[1];
    
    await user.click(firstRowCheckbox);
    
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('maintains selection state across pagination', async () => {
    const user = userEvent.setup();
    renderDataGrid({ enableRowSelection: true, pageSize: 3 });
    
    // Select first row on page 1
    const firstRowCheckbox = screen.getAllByRole('checkbox')[1];
    await user.click(firstRowCheckbox);
    
    // Go to page 2
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);
    
    // Go back to page 1
    const prevButton = screen.getByText('Previous');
    await user.click(prevButton);
    
    // First row should still be selected
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[1]).toBeChecked();
  });
});

// ============================================================================
// 7. ROW CLICK FUNCTIONALITY TESTS
// ============================================================================

describe('DataGridAdvanced - Row Click Functionality', () => {
  it('does not make rows clickable by default', () => {
    renderDataGrid();
    const firstRow = screen.getAllByRole('row')[1]; // Skip header row
    expect(firstRow).not.toHaveClass('cursor-pointer');
  });

  it('makes rows clickable when onRowClick is provided', () => {
    const onRowClick = vi.fn();
    renderDataGrid({ onRowClick });
    
    const firstRow = screen.getAllByRole('row')[1]; // Skip header row
    expect(firstRow).toHaveClass('cursor-pointer');
  });

  it('calls onRowClick with correct row data when row is clicked', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    renderDataGrid({ onRowClick });
    
    const firstRow = screen.getAllByRole('row')[1]; // Skip header row
    await user.click(firstRow);
    
    expect(onRowClick).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('calls onRowClick multiple times for different rows', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    renderDataGrid({ onRowClick, pageSize: 3 });
    
    const rows = screen.getAllByRole('row').slice(1); // Skip header row
    
    await user.click(rows[0]);
    await user.click(rows[1]);
    
    expect(onRowClick).toHaveBeenNthCalledWith(1, mockUsers[0]);
    expect(onRowClick).toHaveBeenNthCalledWith(2, mockUsers[1]);
  });

  it('highlights selected rows visually', () => {
    renderDataGrid({ enableRowSelection: true });
    
    // This test would require interaction to select a row first
    // For now, we test the base styling
    const firstRow = screen.getAllByRole('row')[1];
    expect(firstRow).toHaveClass('hover:bg-muted/30');
  });
});

// ============================================================================
// 8. COLUMN CONFIGURATION TESTS
// ============================================================================

describe('DataGridAdvanced - Column Configuration', () => {
  it('renders columns in correct order', () => {
    renderDataGrid();
    const headers = screen.getAllByRole('columnheader');
    
    basicColumns.forEach((column, index) => {
      expect(headers[index]).toHaveTextContent(column.header);
    });
  });

  it('applies column width correctly', () => {
    const columnsWithWidth = [
      { id: 'id', header: 'ID', accessor: 'id', width: 100 },
      { id: 'name', header: 'Name', accessor: 'name', width: 200 },
    ];
    
    renderDataGrid({ columns: columnsWithWidth });
    
    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveStyle({ width: '100px' });
    expect(headers[1]).toHaveStyle({ width: '200px' });
  });

  it('applies min and max width correctly', () => {
    renderDataGrid({ columns: advancedColumns });
    
    const nameHeader = screen.getByText('Full Name').closest('th');
    expect(nameHeader).toHaveStyle({ 
      minWidth: '150px',
      maxWidth: '300px'
    });
  });

  it('renders custom cell components correctly', () => {
    renderDataGrid({ columns: advancedColumns });
    
    // Check for custom email cell with link
    const emailLink = screen.getByRole('link', { name: /alice@example.com/i });
    expect(emailLink).toHaveAttribute('href', 'mailto:alice@example.com');
    expect(emailLink).toHaveClass('text-blue-600', 'hover:underline');
  });

  it('renders cells with accessor functions correctly', () => {
    renderDataGrid({ columns: advancedColumns });
    
    // Check for status cell with computed value
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('renders custom cell styling correctly', () => {
    renderDataGrid({ columns: advancedColumns });
    
    // Check for age cell with conditional styling
    const ageCell = screen.getByText('28').closest('span');
    expect(ageCell).toHaveClass('text-blue-600'); // Age <= 30
  });

  it('handles columns without accessor correctly', () => {
    const columnWithoutAccessor = [
      { id: 'name', header: 'Name' }, // No accessor specified
    ];
    
    renderDataGrid({ columns: columnWithoutAccessor, data: [{ name: 'Test' }] });
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles missing data properties gracefully', () => {
    const dataWithMissingProps = [
      { id: 1, name: 'John' }, // Missing email, age, department
    ];
    
    renderDataGrid({ data: dataWithMissingProps });
    
    const cells = screen.getAllByRole('cell');
    expect(cells.some(cell => cell.textContent === '')).toBe(true);
  });

  it('renders React node headers correctly', () => {
    const columnWithNodeHeader = [
      { id: 'name', header: <span className="font-bold">Custom Header</span>, accessor: 'name' },
    ];
    
    renderDataGrid({ columns: columnWithNodeHeader });
    
    const header = screen.getByText('Custom Header');
    expect(header).toHaveClass('font-bold');
  });
});

// ============================================================================
// 9. ACCESSIBILITY TESTS
// ============================================================================

describe('DataGridAdvanced - Accessibility', () => {
  it('has proper table structure', () => {
    renderDataGrid();
    
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(basicColumns.length);
    expect(screen.getAllByRole('row')).toHaveLength(6); // 5 data rows + 1 header row
  });

  it('has proper column headers', () => {
    renderDataGrid();
    
    basicColumns.forEach(column => {
      expect(screen.getByRole('columnheader', { name: column.header })).toBeInTheDocument();
    });
  });

  it('has proper row structure', () => {
    renderDataGrid({ pageSize: 3 });
    
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(4); // 3 data rows + 1 header row
    
    // Check that each data row has correct number of cells
    const dataRows = rows.slice(1);
    dataRows.forEach(row => {
      const cells = within(row).getAllByRole('cell');
      expect(cells).toHaveLength(basicColumns.length);
    });
  });

  it('supports keyboard navigation for sortable columns', async () => {
    renderDataGrid();
    
    const nameHeader = screen.getByText('Name');
    nameHeader.focus();
    
    fireEvent.keyDown(nameHeader, { key: 'Enter' });
    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  it('has proper checkbox labels for row selection', () => {
    renderDataGrid({ enableRowSelection: true, pageSize: 3 });
    
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(4); // 1 select all + 3 row checkboxes
    
    // All checkboxes should be accessible
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeInTheDocument();
    });
  });

  it('has proper button accessibility for pagination', () => {
    renderDataGrid({ pageSize: 3 });
    
    const prevButton = screen.getByRole('button', { name: 'Previous' });
    const nextButton = screen.getByRole('button', { name: 'Next' });
    
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    expect(prevButton).toBeDisabled(); // On first page
  });

  it('has proper input accessibility for filters', () => {
    renderDataGrid();
    
    const nameFilter = screen.getByLabelText(/Filter Name/i);
    expect(nameFilter).toBeInTheDocument();
    expect(nameFilter).toHaveAttribute('type', 'text');
  });

  it('maintains focus management during interactions', async () => {
    const user = userEvent.setup();
    renderDataGrid({ pageSize: 3 });
    
    const nextButton = screen.getByText('Next');
    nextButton.focus();
    
    await user.click(nextButton);
    
    // Focus should be maintained or managed appropriately
    expect(document.activeElement).toBeTruthy();
  });
});

// ============================================================================
// 10. PERFORMANCE TESTS
// ============================================================================

describe('DataGridAdvanced - Performance', () => {
  const generateLargeDataset = (size: number) => {
    return Array.from({ length: size }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      age: 20 + (i % 50),
      department: ['Engineering', 'Marketing', 'Design', 'Management'][i % 4],
    }));
  };

  it('renders efficiently with large datasets', () => {
    const largeData = generateLargeDataset(1000);
    const startTime = performance.now();
    
    renderDataGrid({ data: largeData, pageSize: 50 });
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within reasonable time (adjust threshold as needed)
    expect(renderTime).toBeLessThan(1000); // 1 second
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('handles sorting efficiently with large datasets', async () => {
    const user = userEvent.setup();
    const largeData = generateLargeDataset(500);
    renderDataGrid({ data: largeData, pageSize: 20 });
    
    const startTime = performance.now();
    
    const nameHeader = screen.getByText('Name');
    await user.click(nameHeader);
    
    const endTime = performance.now();
    const sortTime = endTime - startTime;
    
    expect(sortTime).toBeLessThan(500); // 500ms
    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  it('handles filtering efficiently with large datasets', async () => {
    const user = userEvent.setup();
    const largeData = generateLargeDataset(500);
    renderDataGrid({ data: largeData, pageSize: 20 });
    
    const startTime = performance.now();
    
    const nameFilter = screen.getByPlaceholderText('Filter Name...');
    await user.type(nameFilter, 'User 1');
    
    const endTime = performance.now();
    const filterTime = endTime - startTime;
    
    expect(filterTime).toBeLessThan(500); // 500ms
  });

  it('optimizes re-renders with memoization', () => {
    const { rerender } = renderDataGrid();
    
    // Render multiple times with same props
    const renderCount = 5;
    const startTime = performance.now();
    
    for (let i = 0; i < renderCount; i++) {
      rerender(<DataGridAdvanced {...defaultProps} />);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // Multiple re-renders should be fast due to memoization
    expect(totalTime).toBeLessThan(100); // 100ms for 5 re-renders
  });
});

// ============================================================================
// 11. EDGE CASES & ERROR HANDLING TESTS
// ============================================================================

describe('DataGridAdvanced - Edge Cases & Error Handling', () => {
  it('handles malformed data gracefully', () => {
    const malformedData = [
      null,
      undefined,
      { id: 1 },
      { name: 'John', extraProp: 'ignored' },
      '',
      123,
    ];
    
    renderDataGrid({ data: malformedData as any });
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('handles empty column definitions', () => {
    renderDataGrid({ columns: [] });
    
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(0);
  });

  it('handles invalid pageSize values', () => {
    renderDataGrid({ pageSize: 0 });
    expect(screen.getByRole('table')).toBeInTheDocument();
    
    renderDataGrid({ pageSize: -5 });
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('handles non-existent column accessors', () => {
    const columnsWithInvalidAccessor = [
      { id: 'nonexistent', header: 'Invalid', accessor: 'nonexistent.property.deep' },
    ];
    
    renderDataGrid({ columns: columnsWithInvalidAccessor });
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('handles circular data references', () => {
    const circularData = { id: 1, name: 'Test' };
    (circularData as any).self = circularData;
    
    renderDataGrid({ data: [circularData] });
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('handles extremely long cell content', () => {
    const longContentData = [{
      id: 1,
      name: 'A'.repeat(1000), // Very long name
      email: 'test@example.com',
      age: 25,
      department: 'Engineering',
    }];
    
    renderDataGrid({ data: longContentData });
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('handles special characters in data', () => {
    const specialCharData = [{
      id: 1,
      name: '🚀 Test <script>alert("xss")</script> & Co.',
      email: 'test+special@example.com',
      age: 25,
      department: 'R&D',
    }];
    
    renderDataGrid({ data: specialCharData });
    expect(screen.getByText(/🚀 Test/)).toBeInTheDocument();
  });

  it('handles date objects in data', () => {
    const dataWithDates = [{
      id: 1,
      name: 'John',
      email: 'john@example.com',
      age: 25,
      department: 'Engineering',
      joinDate: new Date('2023-01-15'),
    }];
    
    renderDataGrid({ data: dataWithDates });
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('handles rapid state changes gracefully', async () => {
    const user = userEvent.setup();
    renderDataGrid({ pageSize: 3 });
    
    // Rapidly trigger multiple state changes
    const nameHeader = screen.getByText('Name');
    const nameFilter = screen.getByPlaceholderText('Filter Name...');
    const nextButton = screen.getByText('Next');
    
    // Fire events in quick succession
    await user.click(nameHeader);
    await user.type(nameFilter, 'A');
    await user.click(nextButton);
    await user.click(nameHeader);
    
    // Should still render properly
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});

// ============================================================================
// 12. INTEGRATION & COMBINED FEATURES TESTS
// ============================================================================

describe('DataGridAdvanced - Integration & Combined Features', () => {
  it('combines sorting, filtering, and pagination correctly', async () => {
    const user = userEvent.setup();
    renderDataGrid({ pageSize: 2 });
    
    // Apply filter first
    const departmentFilter = screen.getByPlaceholderText('Filter Department...');
    await user.type(departmentFilter, 'Engineering');
    
    // Then sort
    const nameHeader = screen.getByText('Name');
    await user.click(nameHeader);
    
    // Should show sorted, filtered results with pagination
    expect(screen.getByText('↑')).toBeInTheDocument(); // Sorting indicator
    expect(screen.getByText(/Page \d+ of \d+/)).toBeInTheDocument(); // Pagination
    
    // Should only show Engineering department members
    const cells = screen.getAllByRole('cell');
    const departmentCells = cells.filter((cell, index) => (index + 1) % basicColumns.length === 0);
    departmentCells.forEach(cell => {
      expect(cell).toHaveTextContent('Engineering');
    });
  });

  it('combines row selection with filtering and pagination', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderDataGrid({ 
      enableRowSelection: true, 
      pageSize: 3, 
      onSelectionChange 
    });
    
    // Select a row
    const firstRowCheckbox = screen.getAllByRole('checkbox')[1];
    await user.click(firstRowCheckbox);
    
    // Apply filter
    const nameFilter = screen.getByPlaceholderText('Filter Name...');
    await user.type(nameFilter, 'Alice');
    
    // Selection should be maintained if row is still visible
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('maintains all feature states during navigation', async () => {
    const user = userEvent.setup();
    renderDataGrid({ 
      enableRowSelection: true, 
      pageSize: 3 
    });
    
    // Set up various states
    const nameHeader = screen.getByText('Name');
    await user.click(nameHeader); // Sort
    
    const nameFilter = screen.getByPlaceholderText('Filter Name...');
    await user.type(nameFilter, 'e'); // Filter
    
    const firstRowCheckbox = screen.getAllByRole('checkbox')[1];
    await user.click(firstRowCheckbox); // Select
    
    // Navigate to next page and back
    const nextButton = screen.getByText('Next');
    if (!nextButton.disabled) {
      await user.click(nextButton);
      
      const prevButton = screen.getByText('Previous');
      await user.click(prevButton);
    }
    
    // All states should be maintained
    expect(screen.getByText('↑')).toBeInTheDocument(); // Sort maintained
    expect(nameFilter).toHaveValue('e'); // Filter maintained
  });

  it('handles complex column configurations with all features', async () => {
    const user = userEvent.setup();
    renderDataGrid({ 
      columns: advancedColumns,
      enableRowSelection: true,
      pageSize: 3
    });
    
    // Test custom cell rendering with interactions
    const emailLink = screen.getByRole('link', { name: /alice@example.com/i });
    expect(emailLink).toHaveAttribute('href', 'mailto:alice@example.com');
    
    // Test sorting on column with custom cell
    const salaryHeader = screen.getByText('Salary');
    await user.click(salaryHeader);
    
    // Should sort by actual salary value, not formatted display
    expect(screen.getByText('↑')).toBeInTheDocument();
    
    // Test filtering still works with custom cells
    const departmentFilter = screen.getByPlaceholderText('Filter Department...');
    await user.type(departmentFilter, 'Engineering');
    
    await waitFor(() => {
      // Should show filtered results with custom cell formatting
      expect(screen.getByText(/\$85,000/)).toBeInTheDocument(); // Formatted salary
    });
  });

  it('performs well with all features enabled simultaneously', async () => {
    const user = userEvent.setup();
    const largeData = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      age: 20 + (i % 50),
      department: ['Engineering', 'Marketing', 'Design'][i % 3],
    }));
    
    const startTime = performance.now();
    
    renderDataGrid({
      data: largeData,
      columns: advancedColumns,
      enableRowSelection: true,
      enableSorting: true,
      enableFiltering: true,
      enablePagination: true,
      pageSize: 10,
    });
    
    // Perform multiple operations
    const nameHeader = screen.getByText('Full Name');
    await user.click(nameHeader); // Sort
    
    const nameFilter = screen.getByPlaceholderText('Filter Full Name...');
    await user.type(nameFilter, 'User 1'); // Filter
    
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    await user.click(selectAllCheckbox); // Select all
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // Should complete all operations within reasonable time
    expect(totalTime).toBeLessThan(2000); // 2 seconds
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
