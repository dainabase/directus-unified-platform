// Export centralisé du thème
export { colors, createGlassColor, tablerColors } from './colors'
export { typography, applyTextStyle } from './typography'
export { spacing, borderRadius, zIndex, breakpoints, containers, grid } from './spacing'

// Configuration du thème complet
export const theme = {
  colors: require('./colors').colors,
  typography: require('./typography').typography,
  spacing: require('./spacing').spacing,
  borderRadius: require('./spacing').borderRadius,
  zIndex: require('./spacing').zIndex,
  breakpoints: require('./spacing').breakpoints,
  containers: require('./spacing').containers,
  grid: require('./spacing').grid,
}

// Effets glassmorphism prédéfinis
export const glassEffects = {
  // Effet de base
  base: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },
  
  // Effet léger
  light: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(5px)',
    WebkitBackdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
  },
  
  // Effet moyen
  medium: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },
  
  // Effet fort
  strong: {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 12px 48px 0 rgba(31, 38, 135, 0.45)',
  },
  
  // Effet sombre
  dark: {
    background: 'rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  },
  
  // Effet coloré (fonction)
  colored: (color, opacity = 0.2) => ({
    background: `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: `1px solid ${color}30`,
    boxShadow: `0 8px 32px 0 ${color}40`,
  }),
}

// Media queries helpers
export const mediaQueries = {
  up: (breakpoint) => `@media (min-width: ${theme.breakpoints[breakpoint]})`,
  down: (breakpoint) => `@media (max-width: ${parseInt(theme.breakpoints[breakpoint]) - 1}px)`,
  between: (min, max) => `@media (min-width: ${theme.breakpoints[min]}) and (max-width: ${parseInt(theme.breakpoints[max]) - 1}px)`,
  only: (breakpoint) => {
    const breakpointKeys = Object.keys(theme.breakpoints.values)
    const index = breakpointKeys.indexOf(breakpoint)
    const nextBreakpoint = breakpointKeys[index + 1]
    
    if (nextBreakpoint) {
      return `@media (min-width: ${theme.breakpoints[breakpoint]}) and (max-width: ${parseInt(theme.breakpoints[nextBreakpoint]) - 1}px)`
    }
    return `@media (min-width: ${theme.breakpoints[breakpoint]})`
  },
}

export default theme