/**
 * IntegrationStatusBar — Story C.7
 * Horizontal bar showing live status of all external integrations.
 * Uses useIntegrationStatus hook (React Query, 60s polling).
 * Apple Premium Design System — semantic colors only.
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Plug, ChevronRight } from 'lucide-react'
import { useIntegrationStatus } from '../../../hooks/useIntegrationStatus'

const STATUS_CONFIG = {
  online:  { color: 'var(--semantic-green)',  bg: 'var(--tint-green)',  label: 'Connecte' },
  warning: { color: 'var(--semantic-orange)', bg: 'var(--tint-orange)', label: 'Attention' },
  offline: { color: 'var(--semantic-red)',    bg: 'var(--tint-red)',    label: 'Hors ligne' },
  unknown: { color: 'var(--gray-1)',          bg: 'var(--fill-1)',      label: 'Inconnu' }
}

const StatusDot = ({ status, isLoading }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unknown

  return (
    <span
      className={`inline-block rounded-full shrink-0 ${isLoading ? 'animate-pulse' : ''}`}
      style={{
        width: 8,
        height: 8,
        backgroundColor: config.color,
        boxShadow: status === 'online' ? `0 0 6px ${config.color}` : 'none'
      }}
    />
  )
}

const ServiceItem = ({ service, onClick }) => {
  const config = STATUS_CONFIG[service.status] || STATUS_CONFIG.unknown

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-150 group"
      style={{ background: 'transparent' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = config.bg }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      title={service.warningText || service.errorText || config.label}
    >
      <StatusDot status={service.status} isLoading={service.isLoading} />
      <span
        className="text-xs font-medium whitespace-nowrap"
        style={{ color: 'var(--label-1)' }}
      >
        {service.name}
      </span>
      {service.warningText && (
        <span
          className="text-xs whitespace-nowrap hidden sm:inline"
          style={{ color: 'var(--semantic-orange)', fontSize: 11 }}
        >
          {service.warningText}
        </span>
      )}
    </button>
  )
}

const IntegrationStatusBar = () => {
  const navigate = useNavigate()
  const { services, isLoading } = useIntegrationStatus()

  const onlineCount = services.filter(s => s.status === 'online').length
  const totalCount = services.length
  const hasIssue = services.some(s => s.status === 'offline' || s.status === 'warning')

  return (
    <div
      className="ds-card px-4 py-3"
      style={{
        border: hasIssue
          ? '1px solid color-mix(in srgb, var(--semantic-orange) 30%, transparent)'
          : '1px solid var(--sep)'
      }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: label */}
        <div className="flex items-center gap-2 shrink-0">
          <Plug size={14} style={{ color: 'var(--label-2)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--label-2)' }}>
            Integrations
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full"
            style={{
              background: hasIssue ? 'var(--tint-orange)' : 'var(--tint-green)',
              color: hasIssue ? 'var(--semantic-orange)' : 'var(--semantic-green)',
              fontSize: 11,
              fontWeight: 600
            }}
          >
            {isLoading ? '...' : `${onlineCount}/${totalCount}`}
          </span>
        </div>

        {/* Center: service pills */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1 justify-center">
          {services.map(service => (
            <ServiceItem
              key={service.id}
              service={service}
              onClick={() => navigate(service.path)}
            />
          ))}
        </div>

        {/* Right: link to settings */}
        <button
          onClick={() => navigate('/superadmin/settings')}
          className="flex items-center gap-1 text-xs shrink-0 transition-colors duration-150"
          style={{ color: 'var(--accent)' }}
        >
          <span className="hidden sm:inline">Configurer</span>
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  )
}

export default IntegrationStatusBar
