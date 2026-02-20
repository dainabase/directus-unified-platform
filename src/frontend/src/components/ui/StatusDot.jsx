import React from 'react'

const colorMap = {
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  info: 'var(--accent)',
}

const StatusDot = ({ status = 'info', size = 8, animate = false, className = '' }) => {
  return (
    <span
      className={`inline-block rounded-full shrink-0 ${animate ? 'ds-pulse' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        background: colorMap[status] || colorMap.info,
      }}
    />
  )
}

export default StatusDot
