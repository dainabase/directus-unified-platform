import React from 'react'

const Card = ({ children, header, action, className = '', padding = 'p-5', ...props }) => {
  return (
    <div className={`ds-card ${className}`} {...props}>
      {(header || action) && (
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <h3 className="ds-card-title">{header}</h3>
          {action && (
            <button
              className="text-xs font-medium hover:underline"
              style={{ color: 'var(--accent)' }}
              onClick={typeof action === 'object' ? action.onClick : undefined}
            >
              {typeof action === 'string' ? action : action.label}
            </button>
          )}
        </div>
      )}
      <div className={header || action ? padding : padding}>
        {children}
      </div>
    </div>
  )
}

export default Card
