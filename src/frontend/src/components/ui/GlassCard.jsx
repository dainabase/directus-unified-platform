import React from 'react'

const GlassCard = ({ children, className = '', padding = 'p-6', ...props }) => (
  <div className={`ds-card ${padding} ${className}`} {...props}>
    {children}
  </div>
)

export default GlassCard
