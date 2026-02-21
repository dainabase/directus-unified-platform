import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

const Banner = ({ children, action, onClose, className = '' }) => {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg ${className}`}
      style={{ background: 'var(--tint-orange)', color: 'var(--semantic-orange)' }}
    >
      <AlertTriangle size={16} className="shrink-0" />
      <div className="flex-1 text-sm">{children}</div>
      {action && (
        <button className="ds-btn ds-btn-sm ds-btn-secondary shrink-0" onClick={action.onClick}>
          {action.label}
        </button>
      )}
      {onClose && (
        <button onClick={onClose} className="shrink-0 p-1 rounded hover:opacity-70 transition-opacity">
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export { Banner }
export default Banner
