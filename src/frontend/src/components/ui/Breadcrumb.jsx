import React from 'react'
import { ChevronRight } from 'lucide-react'

const Breadcrumb = ({ items = [], className = '' }) => {
  return (
    <nav className={`flex items-center gap-1 ${className}`} aria-label="Breadcrumb">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight size={12} style={{ color: 'var(--label-3)', flexShrink: 0 }} />}
          {item.href || item.onClick ? (
            <a
              href={item.href}
              onClick={item.onClick}
              style={{
                fontSize: 'var(--size-12)',
                color: i === items.length - 1 ? 'var(--label-1)' : 'var(--label-3)',
                fontWeight: i === items.length - 1 ? 500 : 400,
                textDecoration: 'none',
              }}
              className="hover:underline"
            >
              {item.label}
            </a>
          ) : (
            <span
              style={{
                fontSize: 'var(--size-12)',
                color: i === items.length - 1 ? 'var(--label-1)' : 'var(--label-3)',
                fontWeight: i === items.length - 1 ? 500 : 400,
              }}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

export { Breadcrumb }
export default Breadcrumb
