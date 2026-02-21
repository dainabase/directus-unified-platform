import React from 'react'

const Toggle = ({ checked = false, onChange, label, subLabel, disabled = false, className = '' }) => {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-40 pointer-events-none' : ''} ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        disabled={disabled}
        className={`ds-toggle ${checked ? 'ds-toggle-active' : ''}`}
      >
        <span className="ds-toggle-knob" />
      </button>
      {(label || subLabel) && (
        <div>
          {label && <span style={{ fontSize: 'var(--size-13)', fontWeight: 500, color: 'var(--label-1)' }}>{label}</span>}
          {subLabel && <p style={{ fontSize: 'var(--size-11)', color: 'var(--label-3)', marginTop: 1 }}>{subLabel}</p>}
        </div>
      )}
    </label>
  )
}

export { Toggle }
export default Toggle
