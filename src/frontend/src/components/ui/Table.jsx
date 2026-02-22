import React from 'react'

const Table = ({ columns, data, loading, emptyState, className = '' }) => {
  if (loading) {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <table className="w-full">
          <thead>
            <tr>
              {(columns || [{ key: 1 }, { key: 2 }, { key: 3 }]).map((col) => (
                <th
                  key={col.key || col}
                  className="text-left px-4 py-3"
                  style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--label-3)' }}
                >
                  <div className="ds-skeleton h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {(columns || [{ key: 1 }, { key: 2 }, { key: 3 }]).map((col) => (
                  <td key={col.key || col} className="px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <div className="ds-skeleton h-4 w-24" />
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
      <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--label-2)' }}>
        {emptyState || <p className="ds-body">Aucune donnee</p>}
      </div>
    )
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-4 py-3"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  color: 'var(--label-3)',
                  borderBottom: '1px solid rgba(0,0,0,0.08)',
                }}
              >
                {col.label}
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
                  style={{
                    fontSize: '13.5px',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
