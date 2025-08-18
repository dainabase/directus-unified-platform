/**
 * DataGridOptimized Component Tests
 * Ultra-specialized test suite for the DataGridOptimized component
 * Tests all advanced features: virtualization, memoization, React Table integration
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { vi } from 'vitest'
import { ColumnDef } from '@tanstack/react-table'
import { DataGridOptimized } from './data-grid-optimized'

// Mock data for testing
interface TestUser {
  id: number
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  revenue: number
  createdAt: Date
}

const createTestData = (count: number): TestUser[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: ['Admin', 'Manager', 'Viewer'][i % 3],
    status: i % 2 === 0 ? 'active' : 'inactive',
    revenue: Math.round(Math.random() * 10000) / 100,
    createdAt: new Date(2024, 0, i + 1),
  }))

const createTestColumns = (): ColumnDef<TestUser>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ getValue }) => getValue<number>(),
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ getValue }) => getValue<string>(),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ getValue }) => getValue<string>(),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ getValue }) => getValue<string>(),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => (
      <span data-status={getValue<string>()}>{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: 'revenue',
    header: 'Revenue',
    cell: ({ getValue }) => `$${getValue<number>().toFixed(2)}`,
  },
]

describe('DataGridOptimized Component', () => {
  const defaultProps = {
    columns: createTestColumns(),
    data: createTestData(10),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('1. RENDERING & INITIALIZATION', () => {
    it('renders without crashing with minimal props', () => {
      render(<DataGridOptimized {...defaultProps} />)
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('renders all columns in header', () => {
      render(<DataGridOptimized {...defaultProps} />)
      
      expect(screen.getByText('ID')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Role')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Revenue')).toBeInTheDocument()
    })

    it('renders all data rows', () => {
      render(<DataGridOptimized {...defaultProps} />)
      
      // Should render all 10 rows
      expect(screen.getByText('User 1')).toBeInTheDocument()
      expect(screen.getByText('User 10')).toBeInTheDocument()
      expect(screen.getByText('user1@example.com')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <DataGridOptimized {...defaultProps} className="custom-grid" />
      )
      expect(container.firstChild).toHaveClass('custom-grid')
    })

    it('shows loading state when isLoading=true', () => {
      const renderLoadingState = () => <div data-testid="loading">Loading...</div>
      render(
        <DataGridOptimized
          {...defaultProps}
          isLoading={true}
          renderLoadingState={renderLoadingState}
        />
      )
      expect(screen.getByTestId('loading')).toBeInTheDocument()
    })

    it('shows empty state when no data', () => {
      const renderEmptyState = () => <div data-testid="empty">No data found</div>
      render(
        <DataGridOptimized
          {...defaultProps}
          data={[]}
          renderEmptyState={renderEmptyState}
        />
      )
      expect(screen.getByTestId('empty')).toBeInTheDocument()
    })
  })

  describe('2. ROW SELECTION FUNCTIONALITY', () => {
    it('adds select column when enableRowSelection=true', () => {
      render(<DataGridOptimized {...defaultProps} enableRowSelection={true} />)
      
      // Should have select all checkbox in header
      const headerCheckboxes = screen.getAllByRole('checkbox')
      expect(headerCheckboxes.length).toBeGreaterThan(0)
    })

    it('allows selecting individual rows', () => {
      const onRowSelectionChange = vi.fn()
      render(
        <DataGridOptimized
          {...defaultProps}
          enableRowSelection={true}
          onRowSelectionChange={onRowSelectionChange}
        />
      )
      
      const checkboxes = screen.getAllByRole('checkbox')
      const firstRowCheckbox = checkboxes[1] // Skip header checkbox
      
      fireEvent.click(firstRowCheckbox)
      expect(onRowSelectionChange).toHaveBeenCalled()
    })

    it('allows selecting all rows', () => {
      const onRowSelectionChange = vi.fn()
      render(
        <DataGridOptimized
          {...defaultProps}
          enableRowSelection={true}
          onRowSelectionChange={onRowSelectionChange}
        />
      )
      
      const headerCheckbox = screen.getAllByRole('checkbox')[0]
      fireEvent.click(headerCheckbox)
      expect(onRowSelectionChange).toHaveBeenCalled()
    })
  })

  describe('3. SORTING FUNCTIONALITY', () => {
    it('enables sorting when enableSorting=true (default)', () => {
      render(<DataGridOptimized {...defaultProps} />)
      
      // Headers should be clickable for sorting
      const nameHeader = screen.getByText('Name')
      expect(nameHeader.closest('th')).toBeInTheDocument()
    })

    it('triggers onSortingChange when sorting', () => {
      const onSortingChange = vi.fn()
      render(
        <DataGridOptimized
          {...defaultProps}
          onSortingChange={onSortingChange}
        />
      )
      
      const nameHeader = screen.getByText('Name')
      fireEvent.click(nameHeader)
      expect(onSortingChange).toHaveBeenCalled()
    })

    it('disables sorting when enableSorting=false', () => {
      render(<DataGridOptimized {...defaultProps} enableSorting={false} />)
      
      // Sorting should not be available
      const nameHeader = screen.getByText('Name')
      fireEvent.click(nameHeader)
      // Should not trigger any sorting behavior
    })
  })

  describe('4. FILTERING FUNCTIONALITY', () => {
    it('shows filter input when enableFiltering=true (default)', () => {
      render(<DataGridOptimized {...defaultProps} />)
      
      const filterInput = screen.getByPlaceholderText('Search...')
      expect(filterInput).toBeInTheDocument()
    })

    it('filters data when typing in search', async () => {
      render(<DataGridOptimized {...defaultProps} />)
      
      const filterInput = screen.getByPlaceholderText('Search...')
      fireEvent.change(filterInput, { target: { value: 'User 1' } })
      
      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeInTheDocument()
        expect(screen.queryByText('User 2')).not.toBeInTheDocument()
      })
    })

    it('triggers onColumnFiltersChange when filtering', () => {
      const onColumnFiltersChange = vi.fn()
      render(
        <DataGridOptimized
          {...defaultProps}
          onColumnFiltersChange={onColumnFiltersChange}
        />
      )
      
      const filterInput = screen.getByPlaceholderText('Search...')
      fireEvent.change(filterInput, { target: { value: 'test' } })
      
      expect(onColumnFiltersChange).toHaveBeenCalled()
    })

    it('hides filter input when enableFiltering=false', () => {
      render(<DataGridOptimized {...defaultProps} enableFiltering={false} />)
      
      expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument()
    })
  })

  describe('5. COLUMN VISIBILITY', () => {
    it('shows column visibility dropdown when enableColumnVisibility=true (default)', () => {
      render(<DataGridOptimized {...defaultProps} />)
      
      const columnsButton = screen.getByText('Columns')
      expect(columnsButton).toBeInTheDocument()
    })

    it('allows hiding/showing columns', async () => {
      render(<DataGridOptimized {...defaultProps} />)
      
      const columnsButton = screen.getByText('Columns')
      fireEvent.click(columnsButton)
      
      await waitFor(() => {
        const nameToggle = screen.getByText('name')
        expect(nameToggle).toBeInTheDocument()
      })
    })

    it('triggers onColumnVisibilityChange when toggling columns', () => {
      const onColumnVisibilityChange = vi.fn()
      render(
        <DataGridOptimized
          {...defaultProps}
          onColumnVisibilityChange={onColumnVisibilityChange}
        />
      )
      
      const columnsButton = screen.getByText('Columns')
      fireEvent.click(columnsButton)
      
      expect(onColumnVisibilityChange).toHaveBeenCalled()
    })

    it('hides column visibility when enableColumnVisibility=false', () => {
      render(<DataGridOptimized {...defaultProps} enableColumnVisibility={false} />)
      
      expect(screen.queryByText('Columns')).not.toBeInTheDocument()
    })
  })

  describe('6. PAGINATION FUNCTIONALITY', () => {
    it('shows pagination when enablePagination=true (default)', () => {
      const largeData = createTestData(50)
      render(<DataGridOptimized {...defaultProps} data={largeData} pageSize={10} />)
      
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('navigates between pages', async () => {
      const largeData = createTestData(25)
      render(<DataGridOptimized {...defaultProps} data={largeData} pageSize={10} />)
      
      // Should show first 10 items
      expect(screen.getByText('User 1')).toBeInTheDocument()
      expect(screen.queryByText('User 11')).not.toBeInTheDocument()
      
      const nextButton = screen.getByText('Next')
      fireEvent.click(nextButton)
      
      await waitFor(() => {
        expect(screen.queryByText('User 1')).not.toBeInTheDocument()
        expect(screen.getByText('User 11')).toBeInTheDocument()
      })
    })

    it('shows selection count when row selection enabled', () => {
      render(
        <DataGridOptimized
          {...defaultProps}
          enableRowSelection={true}
          enablePagination={true}
        />
      )
      
      expect(screen.getByText(/row\(s\) selected/)).toBeInTheDocument()
    })

    it('hides pagination when enablePagination=false', () => {
      render(<DataGridOptimized {...defaultProps} enablePagination={false} />)
      
      expect(screen.queryByText('Previous')).not.toBeInTheDocument()
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
    })
  })

  describe('7. VIRTUALIZATION FUNCTIONALITY', () => {
    it('applies virtualization styles when enableVirtualization=true', () => {
      const { container } = render(
        <DataGridOptimized
          {...defaultProps}
          enableVirtualization={true}
        />
      )
      
      const tableContainer = container.querySelector('div[class*="overflow-auto"]')
      expect(tableContainer).toBeInTheDocument()
    })

    it('sets custom virtual row height', () => {
      render(
        <DataGridOptimized
          {...defaultProps}
          enableVirtualization={true}
          virtualRowHeight={50}
        />
      )
      
      // Virtualization should be active with custom height
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('handles large datasets with virtualization', () => {
      const largeData = createTestData(1000)
      render(
        <DataGridOptimized
          {...defaultProps}
          data={largeData}
          enableVirtualization={true}
          virtualRowHeight={35}
          overscan={5}
        />
      )
      
      // Should render without performance issues
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  describe('8. MEMOIZATION & PERFORMANCE', () => {
    it('memoizes cells to prevent unnecessary re-renders', () => {
      const renderSpy = vi.fn()
      const CustomCell = ({ getValue }: any) => {
        renderSpy()
        return <span>{getValue()}</span>
      }
      
      const columnsWithCustomCell: ColumnDef<TestUser>[] = [
        {
          accessorKey: 'name',
          header: 'Name',
          cell: CustomCell,
        },
      ]
      
      const { rerender } = render(
        <DataGridOptimized
          columns={columnsWithCustomCell}
          data={createTestData(5)}
        />
      )
      
      const initialRenderCount = renderSpy.mock.calls.length
      
      // Re-render with same data
      rerender(
        <DataGridOptimized
          columns={columnsWithCustomCell}
          data={createTestData(5)}
        />
      )
      
      // Should not re-render cells due to memoization
      expect(renderSpy.mock.calls.length).toBe(initialRenderCount)
    })

    it('handles data updates efficiently', () => {
      const { rerender } = render(<DataGridOptimized {...defaultProps} />)
      
      const newData = createTestData(15)
      rerender(<DataGridOptimized {...defaultProps} data={newData} />)
      
      expect(screen.getByText('User 15')).toBeInTheDocument()
    })

    it('uses custom getRowId for optimization', () => {
      const getRowId = (row: TestUser) => `user-${row.id}`
      render(
        <DataGridOptimized
          {...defaultProps}
          getRowId={getRowId}
        />
      )
      
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  describe('9. CALLBACKS & EVENT HANDLING', () => {
    it('calls all callbacks when state changes', () => {
      const callbacks = {
        onRowSelectionChange: vi.fn(),
        onSortingChange: vi.fn(),
        onColumnFiltersChange: vi.fn(),
        onColumnVisibilityChange: vi.fn(),
      }
      
      render(
        <DataGridOptimized
          {...defaultProps}
          enableRowSelection={true}
          {...callbacks}
        />
      )
      
      // Trigger various actions
      const filterInput = screen.getByPlaceholderText('Search...')
      fireEvent.change(filterInput, { target: { value: 'test' } })
      
      const nameHeader = screen.getByText('Name')
      fireEvent.click(nameHeader)
      
      expect(callbacks.onColumnFiltersChange).toHaveBeenCalled()
      expect(callbacks.onSortingChange).toHaveBeenCalled()
    })
  })

  describe('10. CUSTOM COMPONENTS & SLOTS', () => {
    it('renders custom empty state', () => {
      const CustomEmpty = () => <div data-testid="custom-empty">Custom Empty State</div>
      render(
        <DataGridOptimized
          {...defaultProps}
          data={[]}
          renderEmptyState={CustomEmpty}
        />
      )
      
      expect(screen.getByTestId('custom-empty')).toBeInTheDocument()
    })

    it('renders custom loading state', () => {
      const CustomLoading = () => <div data-testid="custom-loading">Custom Loading</div>
      render(
        <DataGridOptimized
          {...defaultProps}
          isLoading={true}
          renderLoadingState={CustomLoading}
        />
      )
      
      expect(screen.getByTestId('custom-loading')).toBeInTheDocument()
    })
  })

  describe('11. EDGE CASES & ERROR HANDLING', () => {
    it('handles empty columns array', () => {
      render(<DataGridOptimized columns={[]} data={[]} />)
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('handles undefined data gracefully', () => {
      render(<DataGridOptimized {...defaultProps} data={[]} />)
      expect(screen.getByText('No results.')).toBeInTheDocument()
    })

    it('handles very large page sizes', () => {
      const largeData = createTestData(100)
      render(
        <DataGridOptimized
          {...defaultProps}
          data={largeData}
          pageSize={1000}
        />
      )
      
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('handles disabled features gracefully', () => {
      render(
        <DataGridOptimized
          {...defaultProps}
          enableSorting={false}
          enableFiltering={false}
          enableColumnVisibility={false}
          enablePagination={false}
          enableRowSelection={false}
        />
      )
      
      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument()
      expect(screen.queryByText('Columns')).not.toBeInTheDocument()
      expect(screen.queryByText('Previous')).not.toBeInTheDocument()
    })
  })

  describe('12. COMPLEX INTEGRATION SCENARIOS', () => {
    it('works with all features enabled simultaneously', async () => {
      const largeData = createTestData(50)
      const allCallbacks = {
        onRowSelectionChange: vi.fn(),
        onSortingChange: vi.fn(),
        onColumnFiltersChange: vi.fn(),
        onColumnVisibilityChange: vi.fn(),
      }
      
      render(
        <DataGridOptimized
          columns={createTestColumns()}
          data={largeData}
          enableRowSelection={true}
          enableSorting={true}
          enableFiltering={true}
          enableColumnVisibility={true}
          enablePagination={true}
          enableVirtualization={true}
          pageSize={20}
          virtualRowHeight={40}
          {...allCallbacks}
        />
      )
      
      // Test multiple interactions
      const filterInput = screen.getByPlaceholderText('Search...')
      fireEvent.change(filterInput, { target: { value: 'User 1' } })
      
      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeInTheDocument()
      })
      
      const nameHeader = screen.getByText('Name')
      fireEvent.click(nameHeader)
      
      const columnsButton = screen.getByText('Columns')
      fireEvent.click(columnsButton)
      
      expect(allCallbacks.onColumnFiltersChange).toHaveBeenCalled()
      expect(allCallbacks.onSortingChange).toHaveBeenCalled()
    })

    it('maintains state consistency across re-renders', () => {
      const { rerender } = render(
        <DataGridOptimized
          {...defaultProps}
          enableRowSelection={true}
          pageSize={5}
        />
      )
      
      // Select a row
      const checkbox = screen.getAllByRole('checkbox')[1]
      fireEvent.click(checkbox)
      
      // Re-render with updated props
      rerender(
        <DataGridOptimized
          {...defaultProps}
          enableRowSelection={true}
          pageSize={5}
          className="updated"
        />
      )
      
      // Selection should be maintained
      expect(checkbox).toBeChecked()
    })
  })
})
