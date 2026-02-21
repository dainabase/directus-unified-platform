import React from 'react'

const Segmented = ({ options = [], value, onChange, className = '' }) => {
  return (
    <div className={`ds-segmented ${className}`}>
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={`ds-segmented-item ${value === opt.value ? 'ds-segmented-active' : ''}`}
          onClick={() => onChange?.(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export { Segmented }
export default Segmented
