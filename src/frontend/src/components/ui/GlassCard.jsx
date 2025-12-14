import React from 'react'
import PropTypes from 'prop-types'

const GlassCard = ({ 
  children, 
  className = '', 
  onClick,
  hoverable = false,
  padding = 'p-6',
  ...props 
}) => {
  const baseClasses = `
    glass-card
    ${padding}
    ${hoverable ? 'cursor-pointer hover:scale-[1.02]' : ''}
    ${className}
  `.trim()

  return (
    <div 
      className={baseClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}

GlassCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
  hoverable: PropTypes.bool,
  padding: PropTypes.string
}

export default GlassCard