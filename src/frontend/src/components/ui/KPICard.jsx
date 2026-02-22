import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

const KPICard = ({ label, value, trend, trendDirection, subValue, icon: Icon, className = '' }) => {
  const isUp = trendDirection === 'up' || (trend && parseFloat(trend) > 0)
  const isDown = trendDirection === 'down' || (trend && parseFloat(trend) < 0)

  return (
    <div className={`ds-card p-4 ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="ds-label">{label}</span>
        {Icon && (
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: 'var(--accent-light)',
            }}
          >
            <Icon size={18} style={{ color: 'var(--accent)' }} />
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: '-0.5px',
          color: 'var(--label-1)',
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>

      <div className="flex items-center gap-2 mt-1.5">
        {trend != null && (
          <span
            className="ds-badge"
            style={{
              background: isUp ? 'var(--tint-green)' : isDown ? 'var(--tint-red)' : 'rgba(0,0,0,0.06)',
              color: isUp ? 'var(--semantic-green)' : isDown ? 'var(--semantic-red)' : 'var(--label-2)',
            }}
          >
            {isUp && <TrendingUp size={10} className="mr-0.5" />}
            {isDown && <TrendingDown size={10} className="mr-0.5" />}
            {typeof trend === 'number' ? `${trend > 0 ? '+' : ''}${trend}%` : trend}
          </span>
        )}
        {subValue && (
          <span className="ds-meta">{subValue}</span>
        )}
      </div>
    </div>
  )
}

export default KPICard
