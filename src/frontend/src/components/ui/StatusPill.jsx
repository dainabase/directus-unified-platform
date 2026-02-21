import React from 'react'

const statusConfig = {
  online: { color: 'var(--semantic-green)', label: 'Connecte' },
  warning: { color: 'var(--semantic-orange)', label: 'Attention' },
  offline: { color: 'var(--semantic-red)', label: 'Hors ligne' },
  idle: { color: 'var(--gray-1)', label: 'Inactif' },
}

const StatusPill = ({ status = 'idle', label, className = '' }) => {
  const config = statusConfig[status] || statusConfig.idle
  const displayLabel = label || config.label

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${className}`}
      style={{ fontSize: 'var(--size-11)', fontWeight: 500, background: 'var(--fill-1)', color: 'var(--label-2)' }}
    >
      <span
        className="inline-block rounded-full shrink-0"
        style={{ width: 6, height: 6, background: config.color }}
      />
      {displayLabel}
    </span>
  )
}

export { StatusPill }
export default StatusPill
