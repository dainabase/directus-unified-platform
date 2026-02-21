import React from 'react'

const variantStyles = {
  green: 'ds-badge ds-badge-success',
  success: 'ds-badge ds-badge-success',
  red: 'ds-badge ds-badge-danger',
  danger: 'ds-badge ds-badge-danger',
  orange: 'ds-badge ds-badge-warning',
  warning: 'ds-badge ds-badge-warning',
  blue: 'ds-badge ds-badge-info',
  info: 'ds-badge ds-badge-info',
  gray: 'ds-badge ds-badge-default',
  default: 'ds-badge ds-badge-default',
}

const dotColors = {
  green: 'var(--semantic-green)',
  success: 'var(--semantic-green)',
  red: 'var(--semantic-red)',
  danger: 'var(--semantic-red)',
  orange: 'var(--semantic-orange)',
  warning: 'var(--semantic-orange)',
  blue: 'var(--semantic-blue)',
  info: 'var(--semantic-blue)',
  gray: 'var(--gray-1)',
  default: 'var(--gray-1)',
}

const Badge = ({ children, variant = 'default', dot = false, fixedWidth, className = '', ...props }) => {
  const style = fixedWidth
    ? { minWidth: typeof fixedWidth === 'number' ? `${fixedWidth}px` : '64px', textAlign: 'center' }
    : undefined

  return (
    <span
      className={`${variantStyles[variant] || variantStyles.default} ${className}`}
      style={style}
      {...props}
    >
      {dot && (
        <span
          className="inline-block rounded-full shrink-0"
          style={{ width: 6, height: 6, background: dotColors[variant] || dotColors.default }}
        />
      )}
      {children}
    </span>
  )
}

export { Badge }
export default Badge
