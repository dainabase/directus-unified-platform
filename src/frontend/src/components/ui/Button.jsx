import React from 'react'
import { Loader2 } from 'lucide-react'

const variantClasses = {
  primary: 'ds-btn ds-btn-primary',
  secondary: 'ds-btn ds-btn-secondary',
  ghost: 'ds-btn ds-btn-ghost',
  plain: 'ds-btn ds-btn-plain',
  destructive: 'ds-btn ds-btn-destructive',
}

const sizeClasses = {
  sm: 'ds-btn-sm',
  md: '',
  lg: 'ds-btn-lg',
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconOnly = false,
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const classes = [
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || '',
    iconOnly ? 'ds-btn-icon' : '',
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0 flex items-center">{icon}</span>
      ) : null}
      {!iconOnly && children}
    </button>
  )
}

export { Button }
export default Button
