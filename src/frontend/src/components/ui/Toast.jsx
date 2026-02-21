import React, { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const borderColors = {
  success: 'var(--semantic-green)',
  error: 'var(--semantic-red)',
  warning: 'var(--semantic-orange)',
  info: 'var(--semantic-blue)',
}

const Toast = ({ id, variant = 'info', message, duration = 4000, onClose }) => {
  const [exiting, setExiting] = useState(false)
  const Icon = icons[variant] || icons.info

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setExiting(true)
        setTimeout(() => onClose?.(id), 200)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, id, onClose])

  return (
    <div
      className="ds-toast"
      style={{
        borderLeft: `3px solid ${borderColors[variant]}`,
        animation: exiting ? 'ds-toast-out 0.2s ease forwards' : undefined,
      }}
    >
      <Icon size={16} style={{ color: borderColors[variant], flexShrink: 0 }} />
      <span className="flex-1" style={{ color: 'var(--label-1)' }}>{message}</span>
      <button onClick={() => { setExiting(true); setTimeout(() => onClose?.(id), 200) }} className="shrink-0 p-0.5 rounded" style={{ color: 'var(--label-3)' }}>
        <X size={14} />
      </button>
    </div>
  )
}

export { Toast }
export default Toast
