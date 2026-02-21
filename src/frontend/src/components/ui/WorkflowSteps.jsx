import React from 'react'
import { Check } from 'lucide-react'

const WorkflowSteps = ({ steps = [], className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{
                width: 28,
                height: 28,
                background: step.status === 'done' ? 'var(--semantic-green)' : step.status === 'active' ? 'var(--accent)' : 'var(--fill-2)',
                color: step.status === 'pending' ? 'var(--label-3)' : '#FFFFFF',
                fontSize: 'var(--size-11)',
                fontWeight: 600,
              }}
            >
              {step.status === 'done' ? <Check size={14} /> : i + 1}
            </div>
            <span
              style={{
                fontSize: 'var(--size-12)',
                fontWeight: step.status === 'active' ? 600 : 400,
                color: step.status === 'pending' ? 'var(--label-3)' : 'var(--label-1)',
              }}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="flex-1 mx-3"
              style={{
                height: 1,
                background: step.status === 'done' ? 'var(--semantic-green)' : 'var(--sep-opaque)',
                minWidth: 24,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export { WorkflowSteps }
export default WorkflowSteps
