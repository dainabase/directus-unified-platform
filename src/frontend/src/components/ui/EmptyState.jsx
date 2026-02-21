import React from 'react'
import { Inbox } from 'lucide-react'

const EmptyState = ({ icon: Icon = Inbox, title = 'Aucun element', description, action, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      <div
        className="flex items-center justify-center mb-4"
        style={{ width: 48, height: 48, borderRadius: 'var(--r-lg)', background: 'var(--fill-1)' }}
      >
        <Icon size={24} style={{ color: 'var(--label-3)' }} />
      </div>
      <h3 style={{ fontSize: 'var(--size-15)', fontWeight: 600, color: 'var(--label-1)', marginBottom: 4 }}>{title}</h3>
      {description && (
        <p style={{ fontSize: 'var(--size-13)', color: 'var(--label-3)', maxWidth: 320 }}>{description}</p>
      )}
      {action && (
        <button className="ds-btn ds-btn-primary ds-btn-sm mt-4" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}

export { EmptyState }
export default EmptyState
