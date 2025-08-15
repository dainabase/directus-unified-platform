import * as React from 'react';
import { cn } from '../../lib/utils';

export interface DataGridAdvancedProps extends React.HTMLAttributes<HTMLDivElement> {
  data: any[];
  columns: ColumnDef[];
  pageSize?: number;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean;
  enableColumnResizing?: boolean;
  onRowClick?: (row: any) => void;
  onSelectionChange?: (selectedRows: any[]) => void;
  loading?: boolean;
  error?: Error | null;
}

export interface ColumnDef {
  id: string;
  header: string | React.ReactNode;
  accessor?: string | ((row: any) => any);
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  cell?: (props: { value: any; row: any }) => React.ReactNode;
  footer?: string | React.ReactNode;
}

interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  column: string;
  value: string;
}

const DataGridLoading: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-muted-foreground">
      <svg
        className="animate-spin h-8 w-8 mx-auto mb-2"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <p className="text-sm">Loading data...</p>
    </div>
  </div>
);

const DataGridError: React.FC<{ error: Error }> = ({ error }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <p className="text-destructive font-medium mb-1">Failed to load data</p>
      <p className="text-sm text-muted-foreground">{error.message}</p>
    </div>
  </div>
);

const DataGridEmpty: React.FC = () => (
  <div className="flex items-center justify-center h-64 text-muted-foreground">
    <p>No data available</p>
  </div>
);

export const DataGridAdvanced = React.forwardRef<HTMLDivElement, DataGridAdvancedProps>(
  ({
    className,
    data,
    columns,
    pageSize = 10,
    enableSorting = true,
    enableFiltering = true,
    enablePagination = true,
    enableRowSelection = false,
    enableColumnResizing = false,
    onRowClick,
    onSelectionChange,
    loading = false,
    error = null,
    ...props
  }, ref) => {
    const [currentPage, setCurrentPage] = React.useState(0);
    const [sortConfig, setSortConfig] = React.useState<SortConfig | null>(null);
    const [filters, setFilters] = React.useState<FilterConfig[]>([]);
    const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set());
    const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>({});

    // Apply filters
    const filteredData = React.useMemo(() => {
      if (!enableFiltering || filters.length === 0) return data;
      
      return data.filter(row => {
        return filters.every(filter => {
          const column = columns.find(col => col.id === filter.column);
          if (!column) return true;
          
          const value = column.accessor
            ? typeof column.accessor === 'function'
              ? column.accessor(row)
              : row[column.accessor]
            : row[column.id];
          
          return String(value).toLowerCase().includes(filter.value.toLowerCase());
        });
      });
    }, [data, filters, columns, enableFiltering]);

    // Apply sorting
    const sortedData = React.useMemo(() => {
      if (!enableSorting || !sortConfig) return filteredData;
      
      return [...filteredData].sort((a, b) => {
        const column = columns.find(col => col.id === sortConfig.column);
        if (!column) return 0;
        
        const aValue = column.accessor
          ? typeof column.accessor === 'function'
            ? column.accessor(a)
            : a[column.accessor]
          : a[column.id];
        
        const bValue = column.accessor
          ? typeof column.accessor === 'function'
            ? column.accessor(b)
            : b[column.accessor]
          : b[column.id];
        
        if (aValue === bValue) return 0;
        
        const comparison = aValue > bValue ? 1 : -1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }, [filteredData, sortConfig, columns, enableSorting]);

    // Apply pagination
    const paginatedData = React.useMemo(() => {
      if (!enablePagination) return sortedData;
      
      const start = currentPage * pageSize;
      const end = start + pageSize;
      return sortedData.slice(start, end);
    }, [sortedData, currentPage, pageSize, enablePagination]);

    const totalPages = Math.ceil(sortedData.length / pageSize);

    const handleSort = (columnId: string) => {
      if (!enableSorting) return;
      
      setSortConfig(prev => {
        if (!prev || prev.column !== columnId) {
          return { column: columnId, direction: 'asc' };
        }
        if (prev.direction === 'asc') {
          return { column: columnId, direction: 'desc' };
        }
        return null;
      });
    };

    const handleFilter = (columnId: string, value: string) => {
      if (!enableFiltering) return;
      
      setFilters(prev => {
        const filtered = prev.filter(f => f.column !== columnId);
        if (value) {
          filtered.push({ column: columnId, value });
        }
        return filtered;
      });
      setCurrentPage(0);
    };

    const handleSelectAll = () => {
      if (selectedRows.size === paginatedData.length) {
        setSelectedRows(new Set());
      } else {
        setSelectedRows(new Set(paginatedData.map((_, index) => index)));
      }
    };

    const handleSelectRow = (index: number) => {
      const newSelection = new Set(selectedRows);
      if (newSelection.has(index)) {
        newSelection.delete(index);
      } else {
        newSelection.add(index);
      }
      setSelectedRows(newSelection);
      
      if (onSelectionChange) {
        const selected = paginatedData.filter((_, i) => newSelection.has(i));
        onSelectionChange(selected);
      }
    };

    if (loading) return <DataGridLoading />;
    if (error) return <DataGridError error={error} />;
    if (!data || data.length === 0) return <DataGridEmpty />;

    return (
      <div ref={ref} className={cn('w-full space-y-4', className)} {...props}>
        {/* Filters */}
        {enableFiltering && (
          <div className="flex flex-wrap gap-2">
            {columns.filter(col => col.filterable !== false).map(column => (
              <input
                key={column.id}
                type="text"
                placeholder={`Filter ${column.header}...`}
                onChange={(e) => handleFilter(column.id, e.target.value)}
                className="px-3 py-1 text-sm border rounded-md"
              />
            ))}
          </div>
        )}

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  {enableRowSelection && (
                    <th className="p-2 text-left">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4"
                      />
                    </th>
                  )}
                  {columns.map(column => (
                    <th
                      key={column.id}
                      className={cn(
                        'p-2 text-left text-sm font-medium',
                        column.sortable !== false && enableSorting && 'cursor-pointer hover:bg-muted/70'
                      )}
                      style={{ 
                        width: columnWidths[column.id] || column.width,
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth
                      }}
                      onClick={() => column.sortable !== false && handleSort(column.id)}
                    >
                      <div className="flex items-center gap-2">
                        {column.header}
                        {enableSorting && column.sortable !== false && sortConfig?.column === column.id && (
                          <span className="text-xs">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={cn(
                      'border-t hover:bg-muted/30',
                      onRowClick && 'cursor-pointer',
                      selectedRows.has(rowIndex) && 'bg-muted/50'
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {enableRowSelection && (
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(rowIndex)}
                          onChange={() => handleSelectRow(rowIndex)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4"
                        />
                      </td>
                    )}
                    {columns.map(column => {
                      const value = column.accessor
                        ? typeof column.accessor === 'function'
                          ? column.accessor(row)
                          : row[column.accessor]
                        : row[column.id];
                      
                      return (
                        <td key={column.id} className="p-2 text-sm">
                          {column.cell ? column.cell({ value, row }) : String(value ?? '')}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {enablePagination && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, sortedData.length)} of {sortedData.length} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

DataGridAdvanced.displayName = 'DataGridAdvanced';

export default DataGridAdvanced;
