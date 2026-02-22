/**
 * EmptyState — Reusable empty state component
 * Props: icon (lucide component), title, subtitle, actionLabel, onAction
 */
import React from 'react'

const EmptyState = ({ icon: Icon, title, subtitle, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    {Icon && (
      <Icon
        size={48}
        className="mb-4"
        style={{ color: 'var(--label-3)' }}
      />
    )}
    <p
      className="text-base font-medium mb-1"
      style={{ color: 'var(--label-2)' }}
    >
      {title}
    </p>
    {subtitle && (
      <p className="text-sm max-w-sm" style={{ color: 'var(--label-3)' }}>
        {subtitle}
      </p>
    )}
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
        style={{ background: 'var(--accent-hover)' }}
      >
        {actionLabel}
      </button>
    )}
  </div>
)

export default EmptyState
