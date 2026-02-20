import React, { useState } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react'

const DataTable = ({
  columns,
  data,
  loading,
  emptyState,
  page,
  pageSize = 10,
  total,
  onPageChange,
  onSort,
  sortKey,
  sortDir,
  className = '',
}) => {
  if (loading) {
    return (
      <div className={className}>
        <table className="w-full">
          <thead>
            <tr>
              {(columns || []).map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3"
                  style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-tertiary)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {(columns || []).map((col) => (
                  <td key={col.key} className="px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <div className="ds-skeleton h-4 w-24 rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="ds-meta mb-1">Aucune donnee</div>
        {emptyState && <div className="ds-label">{emptyState}</div>}
      </div>
    )
  }

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return <ArrowUpDown size={12} style={{ color: 'var(--text-tertiary)', opacity: 0.5 }} />
    return sortDir === 'asc'
      ? <ArrowUp size={12} style={{ color: 'var(--accent)' }} />
      : <ArrowDown size={12} style={{ color: 'var(--accent)' }} />
  }

  const totalPages = total && pageSize ? Math.ceil(total / pageSize) : null

  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left px-4 py-3 ${onSort ? 'cursor-pointer select-none' : ''}`}
                  style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-tertiary)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}
                  onClick={() => onSort?.(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {onSort && <SortIcon colKey={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={row.id || idx} className="transition-colors duration-150 hover:bg-black/[0.02]">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3"
                    style={{ fontSize: '13.5px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages && totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <span className="ds-meta">
            Page {page} sur {totalPages} ({total} resultats)
          </span>
          <div className="flex items-center gap-1">
            <button
              className="ds-btn ds-btn-ghost !p-1.5"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              className="ds-btn ds-btn-ghost !p-1.5"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
