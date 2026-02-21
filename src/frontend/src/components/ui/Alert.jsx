import React from 'react'
import { Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
}

const Alert = ({ variant = 'info', title, children, className = '' }) => {
  const Icon = icons[variant] || icons.info

  return (
    <div className={`ds-alert ds-alert-${variant} ${className}`}>
      <Icon size={16} className="shrink-0 mt-0.5" />
      <div>
        {title && <p style={{ fontWeight: 600, marginBottom: 2 }}>{title}</p>}
        <div style={{ opacity: 0.85 }}>{children}</div>
      </div>
    </div>
  )
}

export { Alert }
export default Alert
