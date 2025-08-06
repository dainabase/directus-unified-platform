// Export centralisé du design system
export * from './theme'
export * from './animations'
export * from './hooks'
export * from './constants'

// Composants de base glassmorphism (à créer plus tard)
export const GlassComponents = {
  Card: 'glass-card',
  Button: 'glass-button',
  Input: 'glass-input',
  Modal: 'glass-modal',
  Badge: 'glass-badge',
  Navbar: 'glass-navbar',
  Sidebar: 'glass-sidebar',
  Dropdown: 'glass-dropdown',
  Table: 'glass-table',
  Tooltip: 'glass-tooltip'
}

// Utilitaires pour appliquer facilement les effets glass
export const glassUtils = {
  // Créer une classe glass avec options
  createGlassClass: (variant = 'base', hover = false, colorScheme = null) => {
    const classes = ['glass']
    
    if (variant !== 'base') {
      classes.push(`glass-${variant}`)
    }
    
    if (hover) {
      classes.push('glass-hover')
    }
    
    if (colorScheme) {
      classes.push(`glass-${colorScheme}`)
    }
    
    return classes.join(' ')
  },
  
  // Créer un style inline pour glass effect
  createGlassStyle: (opacity = 0.1, blur = 10, borderOpacity = 0.18) => ({
    background: `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  }),
  
  // Créer un style pour glass coloré
  createColoredGlass: (r, g, b, opacity = 0.1, blur = 10) => ({
    background: `rgba(${r}, ${g}, ${b}, ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: `1px solid rgba(${r}, ${g}, ${b}, ${opacity * 3})`,
    boxShadow: `0 8px 32px 0 rgba(${r}, ${g}, ${b}, ${opacity * 4})`,
  })
}