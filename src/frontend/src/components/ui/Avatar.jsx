import React from 'react'

const sizes = { sm: 28, md: 36, lg: 48 }

const Avatar = ({ name = '', src, size = 'md', className = '' }) => {
  const px = sizes[size] || sizes.md
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const fontSize = px < 32 ? 'var(--size-10)' : px < 40 ? 'var(--size-12)' : 'var(--size-14)'

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{ width: px, height: px }}
      />
    )
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full shrink-0 ${className}`}
      style={{
        width: px,
        height: px,
        background: 'var(--fill-2)',
        color: 'var(--label-2)',
        fontSize,
        fontWeight: 600,
      }}
    >
      {initials || '?'}
    </div>
  )
}

export { Avatar }
export default Avatar
