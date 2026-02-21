import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const StatCard = ({ label, value, currency, delta, deltaLabel, icon: Icon, className = '' }) => {
  const deltaNum = typeof delta === 'number' ? delta : parseFloat(delta)
  const direction = deltaNum > 0 ? 'up' : deltaNum < 0 ? 'down' : 'neutral'

  const deltaColors = {
    up: { bg: 'var(--tint-green)', color: 'var(--semantic-green)' },
    down: { bg: 'var(--tint-red)', color: 'var(--semantic-red)' },
    neutral: { bg: 'var(--fill-1)', color: 'var(--label-2)' },
  }

  const DeltaIcon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus

  return (
    <div className={`ds-card p-4 ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="ds-label">{label}</span>
        {Icon && (
          <div
            className="flex items-center justify-center shrink-0"
            style={{ width: 34, height: 34, borderRadius: 'var(--r-md)', background: 'var(--accent-light)' }}
          >
            <Icon size={18} style={{ color: 'var(--accent)' }} />
          </div>
        )}
      </div>
      <div style={{ fontSize: 'var(--size-28)', fontWeight: 700, letterSpacing: 'var(--ls-tight)', color: 'var(--label-1)', lineHeight: 'var(--lh-tight)' }}>
        {currency && <span style={{ fontSize: 'var(--size-17)', fontWeight: 600 }}>{currency} </span>}
        {value}
      </div>
      {delta != null && (
        <div className="flex items-center gap-2 mt-2">
          <span
            className="ds-badge"
            style={{ background: deltaColors[direction].bg, color: deltaColors[direction].color }}
          >
            <DeltaIcon size={10} />
            {deltaNum > 0 ? '+' : ''}{deltaNum}%
          </span>
          {deltaLabel && <span className="ds-meta">{deltaLabel}</span>}
        </div>
      )}
    </div>
  )
}

export { StatCard }
export default StatCard
