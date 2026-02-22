/**
 * KPICard — Reusable KPI card component (CDC §14.6)
 * Props: title, value, subtitle, icon (lucide component), trend (optional number)
 */
import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

const KPICard = ({ title, value, subtitle, icon: Icon, trend, onClick }) => (
  <div
    className="ds-card p-5 transition-all duration-200 hover:shadow-md"
    style={onClick ? { cursor: 'pointer' } : undefined}
    onClick={onClick}
  >
    <div className="flex items-start justify-between mb-3">
      {Icon && (
        <div
          className="w-[34px] h-[34px] rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(0,113,227,0.10)' }}
        >
          <Icon size={18} style={{ color: 'var(--accent-hover)' }} />
        </div>
      )}
      {trend != null && trend !== 0 && (
        <div className="flex items-center gap-1 text-xs font-medium" style={{color: trend > 0 ? 'var(--semantic-green)' : 'var(--semantic-red)'}}>
          {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <p
      className="font-bold mb-0.5"
      style={{ fontSize: 26, lineHeight: '32px', color: 'var(--label-1)' }}
    >
      {value}
    </p>
    <p className="text-sm" style={{ color: 'var(--label-2)' }}>{title}</p>
    {subtitle && (
      <p className="text-xs mt-1" style={{ color: 'var(--label-3)' }}>{subtitle}</p>
    )}
  </div>
)

export default KPICard
