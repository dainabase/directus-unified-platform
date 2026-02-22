import React from 'react'

const Input = React.forwardRef(({
  type = 'text',
  label,
  error,
  icon,
  className = '',
  ...props
}, ref) => {
  return (
    <div>
      {label && (
        <label className="ds-label block mb-1">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--label-3)' }}>
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`ds-input ${icon ? 'pl-9' : ''} ${error ? '!border-[var(--semantic-red)]' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1" style={{ fontSize: 11, color: 'var(--semantic-red)' }}>{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
