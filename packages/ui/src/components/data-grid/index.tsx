"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (item: T, rowIndex: number) => React.ReactNode;
  sortable?: boolean;
}

export interface DataGridProps<T> {
  columns: Column<T>[];
  data: T[];
  onSort?: (key: string, direction: "asc" | "desc") => void;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  selectable?: boolean;
  selectedRows?: Set<number>;
  onSelectRow?: (index: number, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  className?: string;
  emptyMessage?: string;
}

export function DataGrid<T extends Record<string, any>>({
  columns,
  data,
  onSort,
  sortKey,
  sortDirection,
  selectable = false,
  selectedRows = new Set(),
  onSelectRow,
  onSelectAll,
  className,
  emptyMessage = "Aucune donnée disponible",
}: DataGridProps<T>) {
  const handleSort = (key: string) => {
    if (!onSort) return;
    const newDirection =
      sortKey === key && sortDirection === "asc" ? "desc" : "asc";
    onSort(key, newDirection);
  };

  const allSelected = data.length > 0 && selectedRows.size === data.length;
  const someSelected = selectedRows.size > 0 && selectedRows.size < data.length;

  return (
    <div className={twMerge("overflow-auto rounded-lg border border-border dark:border-neutral-800", className)}>
      <table className="w-full border-collapse">
        <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200">
          <tr>
            {selectable && (
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                  className="h-4 w-4"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={twMerge(
                  "px-4 py-3 text-left text-sm font-medium",
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right",
                  column.sortable && "cursor-pointer select-none hover:bg-neutral-100"
                )}
                style={{ width: column.width }}
                onClick={() => column.sortable && handleSort(String(column.key))}
              >
                <div className="flex items-center gap-1">
                  {column.header}
                  {column.sortable && sortKey === String(column.key) && (
                    <span className="text-xs">
                      {sortDirection === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-8 text-center text-sm text-neutral-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                className={twMerge(
                  "border-b border-neutral-200 bg-white dark:bg-neutral-900 hover:bg-neutral-50",
                  selectedRows.has(rowIndex) && "bg-blue-50"
                )}
              >
                {selectable && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(rowIndex)}
                      onChange={(e) => onSelectRow?.(rowIndex, e.target.checked)}
                      className="h-4 w-4"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={twMerge(
                      "px-4 py-3 text-sm",
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right"
                    )}
                  >
                    {column.render
                      ? column.render(item, rowIndex)
                      : (item[column.key as keyof T] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}