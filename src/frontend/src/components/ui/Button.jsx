import React from 'react'
import { Loader2 } from 'lucide-react'

const variantClasses = {
  primary: 'ds-btn ds-btn-primary',
  secondary: 'ds-btn ds-btn-secondary',
  ghost: 'ds-btn ds-btn-ghost',
}

const sizeClasses = {
  sm: 'text-xs !py-1 !px-2.5',
  md: '',
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const classes = [
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || '',
    fullWidth ? 'w-full' : '',
    (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0 flex items-center" style={{ width: 14, height: 14 }}>{icon}</span>
      ) : null}
      {children}
    </button>
  )
}

export default Button
