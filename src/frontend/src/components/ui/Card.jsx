import React from 'react'

const Card = ({ children, header, footer, action, variant = 'standard', className = '', padding = 'p-5', onClick, ...props }) => {
  const baseClass = variant === 'glass' ? 'ds-card-glass' : 'ds-card'
  const interactiveClass = variant === 'interactive' || onClick ? 'ds-card-interactive' : ''

  return (
    <div className={`${baseClass} ${interactiveClass} ${className}`} onClick={onClick} {...props}>
      {(header || action) && (
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--sep)' }}>
          <h3 className="ds-card-title">{header}</h3>
          {action && (
            <button
              className="ds-btn ds-btn-plain text-xs"
              onClick={typeof action === 'object' ? action.onClick : undefined}
            >
              {typeof action === 'string' ? action : action.label}
            </button>
          )}
        </div>
      )}
      <div className={padding}>
        {children}
      </div>
      {footer && (
        <div className="px-5 py-3" style={{ borderTop: '1px solid var(--sep)' }}>
          {footer}
        </div>
      )}
    </div>
  )
}

export { Card }
export default Card
