import React from 'react'
import PropTypes from 'prop-types'
import { ChevronDown } from 'lucide-react'

const Select = React.forwardRef(({ 
  label,
  error,
  hint,
  options = [],
  placeholder = 'Sélectionner...',
  className = '',
  containerClassName = '',
  ...props 
}, ref) => {
  const selectClasses = `
    glass-input
    appearance-none
    pr-10
    ${error ? 'border-red-500 focus:border-red-500' : ''}
    ${className}
  `.trim()

  return (
    <div className={`${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          className={selectClasses}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
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
        
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
      </div>
      
      {hint && !error && (
        <p className="mt-1 text-sm text-gray-500">{hint}</p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

Select.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  hint: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool
  })),
  placeholder: PropTypes.string,
  className: PropTypes.string,
  containerClassName: PropTypes.string
}

export default Select