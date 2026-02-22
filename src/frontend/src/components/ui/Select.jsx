import React from 'react'
import { ChevronDown } from 'lucide-react'

const Select = React.forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'Selectionner...',
  className = '',
  ...props
}, ref) => {
  return (
    <div>
      {label && (
        <label className="ds-label block mb-1">{label}</label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`ds-input appearance-none pr-9 ${error ? '!border-[var(--semantic-red)]' : ''} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>{placeholder}</option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--label-3)' }}
        />
      </div>
      {error && (
        <p className="mt-1" style={{ fontSize: 11, color: 'var(--semantic-red)' }}>{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
