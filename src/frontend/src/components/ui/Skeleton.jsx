import React from 'react'

const Skeleton = ({ width, height = 16, rounded = 'md', className = '' }) => {
  const radiusMap = { sm: 'var(--r-sm)', md: 'var(--r-md)', lg: 'var(--r-lg)', full: 'var(--r-full)' }

  return (
    <div
      className={`ds-skeleton ${className}`}
      style={{
        width: width || '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: radiusMap[rounded] || radiusMap.md,
      }}
    />
  )
}

export { Skeleton }
export default Skeleton
