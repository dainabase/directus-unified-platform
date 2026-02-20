import React from 'react'

const colorMap = {
  blue: 'var(--accent)',
  green: 'var(--success)',
  orange: 'var(--warning)',
  red: 'var(--danger)',
}

const ProgressBar = ({ value = 0, color = 'blue', size = 'sm', label, className = '' }) => {
  const height = size === 'sm' ? 3 : 6
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height, background: 'rgba(0,0,0,0.06)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${clamped}%`,
            background: colorMap[color] || colorMap.blue,
          }}
        />
      </div>
      {label && (
        <span className="ds-meta shrink-0">{typeof label === 'boolean' ? `${clamped}%` : label}</span>
      )}
    </div>
  )
}

export default ProgressBar
