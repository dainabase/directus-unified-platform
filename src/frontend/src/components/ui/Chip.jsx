import React from 'react'
import { X } from 'lucide-react'

const Chip = ({ children, onRemove, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${className}`}
      style={{ fontSize: 'var(--size-12)', fontWeight: 500, background: 'var(--fill-1)', color: 'var(--label-1)' }}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="shrink-0 rounded-full p-0.5 transition-colors"
          style={{ color: 'var(--label-3)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--label-1)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--label-3)'}
        >
          <X size={12} />
        </button>
      )}
    </span>
  )
}

export { Chip }
export default Chip
