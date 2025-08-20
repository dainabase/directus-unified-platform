"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "../button";
import { Input } from "../input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "../dropdown-menu";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (item: T, rowIndex: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  sticky?: boolean;
}

export interface DataGridAdvProps<T> {
  columns: Column<T>[];
  data: T[];
  height?: number;
  rowHeight?: number;
  onSort?: (key: string, direction: "asc" | "desc") => void;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  selectable?: boolean;
  selectedRows?: Set<number>;
  onSelectRow?: (index: number, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  className?: string;
  emptyMessage?: string;
  enableColumnToggle?: boolean;
  enableGlobalFilter?: boolean;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  enableExport?: boolean;
  onExport?: (format: "csv" | "json") => void;
}

export function DataGridAdv<T extends Record<string, any>>({
  columns: initialColumns,
  data,
  height = 600,
  rowHeight = 48,
  onSort,
  sortKey,
  sortDirection,
  selectable = false,
  selectedRows = new Set(),
  onSelectRow,
  onSelectAll,
  className,
  emptyMessage = "Aucune donnée disponible",
  enableColumnToggle = false,
  enableGlobalFilter = false,
  globalFilter = "",
  onGlobalFilterChange,
  enableExport = false,
  onExport,
}: DataGridAdvProps<T>) {
  const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(
    new Set(initialColumns.map((c) => String(c.key)))
  );

  const columns = initialColumns.filter((c) =>
    visibleColumns.has(String(c.key))
  );

  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    size: data.length,
    parentRef,
    estimateSize: React.useCallback(() => rowHeight, [rowHeight]),
    overscan: 10,
  });

  const handleSort = (key: string) => {
    if (!onSort) return;
    const newDirection =
      sortKey === key && sortDirection === "asc" ? "desc" : "asc";
    onSort(key, newDirection);
  };

  const allSelected = data.length > 0 && selectedRows.size === data.length;
  const someSelected = selectedRows.size > 0 && selectedRows.size < data.length;

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className={twMerge("flex flex-col gap-2", className)}>
      {/* Toolbar */}
      {(enableGlobalFilter || enableColumnToggle || enableExport) && (
        <div className="flex items-center gap-2">
          {enableGlobalFilter && (
            <Input
              placeholder="Rechercher..."
              value={globalFilter}
              onChange={(e) => onGlobalFilterChange?.(e.target.value)}
              className="max-w-xs"
            />
          )}
          <div className="ml-auto flex gap-2">
            {enableColumnToggle && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Colonnes
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {initialColumns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={String(column.key)}
                      checked={visibleColumns.has(String(column.key))}
                      onCheckedChange={() => toggleColumn(String(column.key))}
                    >
                      {column.header}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {enableExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Exporter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => onExport?.("csv")}>
                    Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onExport?.("json")}>
                    Export JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="overflow-auto rounded-lg border border-border dark:border-neutral-800">
        <div className="relative">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200">
            <div className="flex">
              {selectable && (
                <div className="sticky left-0 z-20 flex w-12 items-center bg-neutral-50 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
              )}
              {columns.map((column) => (
                <div
                  key={String(column.key)}
                  className={twMerge(
                    "flex items-center px-4 py-3 text-sm font-medium",
                    column.align === "center" && "justify-center",
                    column.align === "right" && "justify-end",
                    column.sortable && "cursor-pointer select-none hover:bg-neutral-100",
                    column.sticky && "sticky left-0 z-10 bg-neutral-50"
                  )}
                  style={{ width: column.width || "auto", minWidth: column.width }}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  {column.header}
                  {column.sortable && sortKey === String(column.key) && (
                    <span className="ml-1 text-xs">
                      {sortDirection === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          <div
            ref={parentRef}
            className="relative"
            style={{ height }}
          >
            <div
              style={{
                height: `${rowVirtualizer.totalSize}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.virtualItems.map((virtualRow) => {
                const rowIndex = virtualRow.index;
                const item = data[rowIndex];
                const isSelected = selectedRows.has(rowIndex);

                return (
                  <div
                    key={virtualRow.index}
                    className={twMerge(
                      "absolute left-0 top-0 flex w-full border-b border-neutral-200 dark:border-neutral-800",
                      isSelected ? "bg-blue-50" : "bg-white hover:bg-neutral-50"
                    )}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {selectable && (
                      <div className="sticky left-0 z-10 flex w-12 items-center bg-inherit px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => onSelectRow?.(rowIndex, e.target.checked)}
                          className="h-4 w-4"
                        />
                      </div>
                    )}
                    {columns.map((column) => (
                      <div
                        key={String(column.key)}
                        className={twMerge(
                          "flex items-center px-4 text-sm",
                          column.align === "center" && "justify-center",
                          column.align === "right" && "justify-end",
                          column.sticky && "sticky left-0 z-10 bg-inherit"
                        )}
                        style={{ width: column.width || "auto", minWidth: column.width }}
                      >
                        {column.render
                          ? column.render(item, rowIndex)
                          : (item[column.key as keyof T] as React.ReactNode)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {data.length === 0 && (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-neutral-500">{emptyMessage}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}