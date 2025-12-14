import React from 'react'
import PropTypes from 'prop-types'

const Badge = ({ 
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  ...props 
}) => {
  const variants = {
    default: 'glass-badge',
    primary: 'glass-badge-primary',
    success: 'glass-badge-success',
    warning: 'glass-badge-warning',
    error: 'glass-badge-error',
    info: 'glass-badge glass-badge-primary'
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  const baseClasses = `
    inline-flex items-center
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `.trim()

  return (
    <span className={baseClasses} {...props}>
      {dot && (
        <span className={`
          w-2 h-2 rounded-full mr-1.5
          ${variant === 'success' ? 'bg-green-500' : ''}
          ${variant === 'warning' ? 'bg-yellow-500' : ''}
          ${variant === 'error' ? 'bg-red-500' : ''}
          ${variant === 'primary' || variant === 'info' ? 'bg-blue-500' : ''}
          ${variant === 'default' ? 'bg-gray-500' : ''}
        `} />
      )}
      {children}
    </span>
  )
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'error', 'info']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  dot: PropTypes.bool,
  className: PropTypes.string
}

export default Badge