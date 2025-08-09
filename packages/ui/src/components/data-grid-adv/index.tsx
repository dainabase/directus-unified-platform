"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getVisibilityState,
  useReactTable,
  ColumnFiltersState,
  SortingState,
  RowSelectionState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { twMerge } from "tailwind-merge";
import { Button } from "../button";
import { Input } from "../input";
import { Checkbox } from "../checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../dropdown-menu";
import { Select } from "../select";

export type Density = "compact" | "normal" | "spacious";

export type RowAction<T> = {
  id: string;
  label: string;
  onAction: (row: T) => void;
};

export type DataGridAdvProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  className?: string;
  virtualization?: boolean;
  initialDensity?: Density;
  actionsPerRow?: RowAction<TData>[];
  onRowAction?: (actionId: string, row: TData) => void;
  globalFilterPlaceholder?: string;
};

function exportCSV<T>(rows: T[], filename = "export.csv") {
  if (!rows.length) return;
  const headers = Object.keys(rows[0] as any);
  const lines = rows.map((r: any) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","));
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function DataGridAdv<TData, TValue>({
  columns,
  data,
  className,
  virtualization = true,
  initialDensity = "normal",
  actionsPerRow,
  onRowAction,
  globalFilterPlaceholder = "Search…",
}: DataGridAdvProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = React.useState(getVisibilityState({}));

  const table = useReactTable({
    data,
    columns: React.useMemo(() => {
      if (!actionsPerRow?.length) return columns;
      // Ajoute une colonne Actions à la fin si demandée
      return [
        ...columns,
        {
          id: "__actions",
          header: "Actions",
          cell: ({ row }) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Actions ▾</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {actionsPerRow.map((a) => (
                  <DropdownMenuItem
                    key={a.id}
                    onSelect={() => (onRowAction ? onRowAction(a.id, row.original) : a.onAction(row.original))}
                  >
                    {a.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ),
          enableSorting: false,
        } as ColumnDef<TData, any>,
      ];
    }, [columns, actionsPerRow, onRowAction]),
    state: { sorting, globalFilter, columnFilters, rowSelection, columnVisibility },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });

  // Densité = hauteur des lignes
  const rowHeights: Record<Density, number> = { compact: 34, normal: 42, spacious: 54 };
  const [density, setDensity] = React.useState<Density>(initialDensity);

  const parentRef = React.useRef<HTMLDivElement | null>(null);
  const rows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeights[density],
    overscan: 12,
    enabled: virtualization,
  });

  const virtualItems = virtualization ? rowVirtualizer.getVirtualItems() : rows.map((_, i) => ({ index: i }));

  const pageInfo = {
    page: table.getState().pagination.pageIndex + 1,
    pageCount: table.getPageCount() || 1,
  };

  return (
    <div className={twMerge("w-full space-y-3", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder={globalFilterPlaceholder}
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-64"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Colonnes ▾</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {table.getAllLeafColumns().map((col) => (
                <DropdownMenuItem
                  key={col.id}
                  onSelect={(e) => {
                    e.preventDefault();
                    col.toggleVisibility();
                  }}
                >
                  <span className="mr-2">
                    <Checkbox
                      checked={col.getIsVisible()}
                      onCheckedChange={() => col.toggleVisibility()}
                    />
                  </span>
                  {col.id}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Select
            value={density}
            onValueChange={(v) => setDensity(v as Density)}
            items={[
              { label: "Compact", value: "compact" },
              { label: "Normal", value: "normal" },
              { label: "Spacieux", value: "spacious" },
            ]}
            placeholder="Densité"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => exportCSV(table.getFilteredRowModel().rows.map((r) => r.original))}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => table.resetColumnFilters()}
            title="Réinitialiser filtres"
          >
            Reset filtres
          </Button>
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-neutral-50 text-neutral-700">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                <th className="px-2 py-2 w-8">
                  <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                    aria-label="Select all"
                  />
                </th>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="select-none px-3 py-2 text-left font-medium"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {{{"asc":" ▲","desc":" ▼"}[header.column.getIsSorted() as string] ?? null}}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody
            ref={parentRef}
            className="block max-h-[540px] overflow-auto"
            style={{ position: "relative" }}
          >
            <tr style={{ height: virtualization ? rowVirtualizer.getTotalSize() : undefined }}>
              <td colSpan={table.getAllLeafColumns().length + 1} style={{ padding: 0 }}>
                <div style={{ position: "relative" }}>
                  {virtualItems.map((vi: any) => {
                    const row = rows[vi.index];
                    if (!row) return null;
                    return (
                      <div
                        key={row.id}
                        data-index={vi.index}
                        style={{
                          position: virtualization ? "absolute" : "relative",
                          transform: virtualization ? `translateY(${vi.start}px)` : undefined,
                          height: rowHeights[density],
                          width: "100%",
                        }}
                        className="border-b border-neutral-200"
                      >
                        <div className="table w-full">
                          <div className="table-row">
                            <div className="table-cell align-middle px-2 w-8">
                              <Checkbox
                                checked={row.getIsSelected()}
                                onCheckedChange={(v) => row.toggleSelected(!!v)}
                                aria-label="Select row"
                              />
                            </div>
                            {row.getVisibleCells().map((cell) => (
                              <div key={cell.id} className="table-cell align-middle px-3">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-neutral-600">
          {Object.keys(rowSelection).length} sélectionné(s) • Page {pageInfo.page}/{pageInfo.pageCount}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            «
          </Button>
          <Button variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Prev
          </Button>
          <Button variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
          <Button variant="outline" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
            »
          </Button>
        </div>
      </div>
    </div>
  );
}