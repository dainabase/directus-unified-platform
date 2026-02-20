import React from 'react'

const variantStyles = {
  success: 'ds-badge ds-badge-success',
  warning: 'ds-badge ds-badge-warning',
  danger: 'ds-badge ds-badge-danger',
  info: 'ds-badge ds-badge-info',
  default: 'ds-badge ds-badge-default',
}

const Badge = ({ children, variant = 'default', fixedWidth, className = '', ...props }) => {
  const style = fixedWidth
    ? { minWidth: typeof fixedWidth === 'number' ? `${fixedWidth}px` : '64px', textAlign: 'center' }
    : undefined

  return (
    <span
      className={`${variantStyles[variant] || variantStyles.default} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge
