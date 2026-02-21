import React from 'react'
import { Menu, X } from 'lucide-react'

const MobileMenuButton = ({ isOpen, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="ds-touch-target flex items-center justify-center lg:hidden"
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: 'var(--accent)',
        color: '#FFFFFF',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 500,
        border: 'none',
        cursor: 'pointer',
      }}
      aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
    >
      {isOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
  )
}

export default MobileMenuButton
