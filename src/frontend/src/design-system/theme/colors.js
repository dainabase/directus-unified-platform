// Palette de couleurs pour le design glassmorphism
export const colors = {
  // Couleurs principales avec transparence
  glass: {
    white: 'rgba(255, 255, 255, 0.1)',
    whiteLight: 'rgba(255, 255, 255, 0.05)',
    whiteMedium: 'rgba(255, 255, 255, 0.15)',
    whiteStrong: 'rgba(255, 255, 255, 0.25)',
    dark: 'rgba(0, 0, 0, 0.1)',
    darkLight: 'rgba(0, 0, 0, 0.05)',
    darkMedium: 'rgba(0, 0, 0, 0.15)',
    darkStrong: 'rgba(0, 0, 0, 0.25)',
  },
  
  // Couleurs d'accentuation
  accent: {
    primary: '#3B82F6',
    primaryGlass: 'rgba(59, 130, 246, 0.2)',
    secondary: '#8B5CF6',
    secondaryGlass: 'rgba(139, 92, 246, 0.2)',
    success: '#10B981',
    successGlass: 'rgba(16, 185, 129, 0.2)',
    warning: '#F59E0B',
    warningGlass: 'rgba(245, 158, 11, 0.2)',
    danger: '#EF4444',
    dangerGlass: 'rgba(239, 68, 68, 0.2)',
    info: '#06B6D4',
    infoGlass: 'rgba(6, 182, 212, 0.2)',
  },
  
  // Couleurs de texte
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    light: '#E5E7EB',
    white: '#FFFFFF',
    dark: '#111827',
  },
  
  // Couleurs de fond
  background: {
    primary: '#F9FAFB',
    secondary: '#F3F4F6',
    tertiary: '#E5E7EB',
    dark: '#111827',
    darkSecondary: '#1F2937',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  
  // Bordures glass
  border: {
    glass: 'rgba(255, 255, 255, 0.18)',
    glassLight: 'rgba(255, 255, 255, 0.1)',
    glassStrong: 'rgba(255, 255, 255, 0.3)',
  },
  
  // Ombres
  shadow: {
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    glassLight: '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
    glassStrong: '0 12px 48px 0 rgba(31, 38, 135, 0.45)',
    colored: (color) => `0 8px 32px 0 ${color}40`,
  },
}

// Fonction helper pour créer des variantes de couleur glass
export const createGlassColor = (r, g, b, opacity = 0.1) => {
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

// Export des couleurs Tabler pour compatibilité
export const tablerColors = {
  blue: '#206bc4',
  azure: '#4299e1',
  indigo: '#4263eb',
  purple: '#ae3ec9',
  pink: '#d6336c',
  red: '#d63939',
  orange: '#f76707',
  yellow: '#f59f00',
  lime: '#74b816',
  green: '#2fb344',
  teal: '#0ca678',
  cyan: '#17a2b8',
}