/**
 * ProgressBar — Reusable progress bar component
 * Props: value (0-100), color (default var(--accent-hover)), height (default 6px)
 */
import React from 'react'

const ProgressBar = ({ value = 0, color = 'var(--accent-hover)', height = 6 }) => {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ height, background: 'rgba(0,0,0,0.06)' }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: color,
          transition: 'width 300ms ease'
        }}
      />
    </div>
  )
}

export default ProgressBar
