import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { Button } from "../button"
import { Checkbox } from "../checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu"
import { Input } from "../input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table"
import { cn } from "../../lib/utils"

// Optimized cell renderer with memoization
const MemoizedCell = React.memo(({ cell }: { cell: any }) => {
  return flexRender(cell.column.columnDef.cell, cell.getContext())
})
MemoizedCell.displayName = "MemoizedCell"

// Optimized header renderer with memoization
const MemoizedHeader = React.memo(({ header }: { header: any }) => {
  return flexRender(
    header.column.columnDef.header,
    header.getContext()
  )
})
MemoizedHeader.displayName = "MemoizedHeader"

export interface DataGridOptimizedProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  className?: string
  // Performance options
  enableVirtualization?: boolean
  virtualRowHeight?: number
  overscan?: number
  // Feature flags
  enableSorting?: boolean
  enableFiltering?: boolean
  enableColumnVisibility?: boolean
  enableRowSelection?: boolean
  enablePagination?: boolean
  pageSize?: number
  // Callbacks
  onRowSelectionChange?: (selection: any) => void
  onSortingChange?: (sorting: SortingState) => void
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void
  onColumnVisibilityChange?: (visibility: VisibilityState) => void
  // Custom components
  renderEmptyState?: () => React.ReactNode
  renderLoadingState?: () => React.ReactNode
  // Performance callbacks
  getRowId?: (row: TData) => string
  isLoading?: boolean
}

export function DataGridOptimized<TData, TValue>({
  columns,
  data,
  className,
  enableVirtualization = false,
  virtualRowHeight = 35,
  overscan = 5,
  enableSorting = true,
  enableFiltering = true,
  enableColumnVisibility = true,
  enableRowSelection = false,
  enablePagination = true,
  pageSize = 10,
  onRowSelectionChange,
  onSortingChange,
  onColumnFiltersChange,
  onColumnVisibilityChange,
  renderEmptyState,
  renderLoadingState,
  getRowId,
  isLoading = false,
}: DataGridOptimizedProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")

  // Memoize column definitions to prevent re-renders
  const memoizedColumns = React.useMemo(() => {
    const cols = [...columns]
    
    if (enableRowSelection) {
      cols.unshift({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      })
    }
    
    return cols
  }, [columns, enableRowSelection])

  // Memoize data to prevent unnecessary re-renders
  const memoizedData = React.useMemo(() => data, [data])

  const table = useReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    onSortingChange: (updater) => {
      setSorting(updater)
      onSortingChange?.(typeof updater === "function" ? updater(sorting) : updater)
    },
    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater)
      onColumnFiltersChange?.(typeof updater === "function" ? updater(columnFilters) : updater)
    },
    onColumnVisibilityChange: (updater) => {
      setColumnVisibility(updater)
      onColumnVisibilityChange?.(typeof updater === "function" ? updater(columnVisibility) : updater)
    },
    onRowSelectionChange: (updater) => {
      setRowSelection(updater)
      onRowSelectionChange?.(typeof updater === "function" ? updater(rowSelection) : updater)
    },
    getRowId,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  })

  // Virtual scrolling setup
  const tableContainerRef = React.useRef<HTMLDivElement>(null)
  const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: 20 })

  React.useEffect(() => {
    if (!enableVirtualization || !tableContainerRef.current) return

    const handleScroll = () => {
      const container = tableContainerRef.current
      if (!container) return

      const scrollTop = container.scrollTop
      const start = Math.max(0, Math.floor(scrollTop / virtualRowHeight) - overscan)
      const end = Math.min(
        table.getRowModel().rows.length,
        Math.ceil((scrollTop + container.clientHeight) / virtualRowHeight) + overscan
      )

      setVisibleRange({ start, end })
    }

    const container = tableContainerRef.current
    container.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => {
      container.removeEventListener("scroll", handleScroll)
    }
  }, [enableVirtualization, virtualRowHeight, overscan, table])

  const rows = table.getRowModel().rows
  const visibleRows = enableVirtualization 
    ? rows.slice(visibleRange.start, visibleRange.end)
    : rows

  if (isLoading && renderLoadingState) {
    return renderLoadingState()
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Filters and Controls */}
      <div className="flex items-center justify-between">
        {enableFiltering && (
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="h-8 w-[150px] lg:w-[250px]"
            />
          </div>
        )}
        {enableColumnVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Table */}
      <div
        ref={tableContainerRef}
        className={cn(
          "rounded-md border",
          enableVirtualization && "h-[400px] overflow-auto"
        )}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : <MemoizedHeader header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {enableVirtualization && visibleRange.start > 0 && (
              <tr style={{ height: visibleRange.start * virtualRowHeight }} />
            )}
            {visibleRows.length ? (
              visibleRows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  style={enableVirtualization ? { height: virtualRowHeight } : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <MemoizedCell cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {renderEmptyState ? renderEmptyState() : "No results."}
                </TableCell>
              </TableRow>
            )}
            {enableVirtualization && visibleRange.end < rows.length && (
              <tr style={{ height: (rows.length - visibleRange.end) * virtualRowHeight }} />
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {enablePagination && (
        <div className="flex items-center justify-end space-x-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {enableRowSelection && (
              <>
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </>
            )}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Export memoized version
export default React.memo(DataGridOptimized)
