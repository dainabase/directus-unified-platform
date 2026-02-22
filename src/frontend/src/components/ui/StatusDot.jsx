import React from 'react'

const colorMap = {
  success: 'var(--semantic-green)',
  warning: 'var(--semantic-orange)',
  danger: 'var(--semantic-red)',
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
