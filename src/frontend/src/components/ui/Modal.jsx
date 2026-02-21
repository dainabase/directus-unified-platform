import React, { useEffect } from 'react'
import { X } from 'lucide-react'

const Modal = ({ open, onClose, title, children, footer, width = 520, className = '' }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape' && onClose) onClose() }
    if (open) {
      window.addEventListener('keydown', handleEsc)
      return () => window.removeEventListener('keydown', handleEsc)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div className="ds-modal-backdrop" onClick={onClose} />
      <div className={`ds-modal ${className}`} style={{ width: `min(90vw, ${width}px)` }}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--sep)' }}>
            <h2 style={{ fontSize: 'var(--size-15)', fontWeight: 600, color: 'var(--label-1)' }}>{title}</h2>
            {onClose && (
              <button onClick={onClose} className="ds-btn ds-btn-ghost ds-btn-icon" style={{ marginRight: -8 }}>
                <X size={16} />
              </button>
            )}
          </div>
        )}
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid var(--sep)' }}>
            {footer}
          </div>
        )}
      </div>
    </>
  )
}

export { Modal }
export default Modal
