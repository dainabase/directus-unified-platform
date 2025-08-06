// Configuration typographique pour le design glassmorphism
export const typography = {
  // Familles de polices
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
    display: ['Cal Sans', 'Inter', 'sans-serif'],
  },
  
  // Tailles de police
  fontSize: {
    '2xs': '0.625rem',    // 10px
    xs: '0.75rem',        // 12px
    sm: '0.875rem',       // 14px
    base: '1rem',         // 16px
    lg: '1.125rem',       // 18px
    xl: '1.25rem',        // 20px
    '2xl': '1.5rem',      // 24px
    '3xl': '1.875rem',    // 30px
    '4xl': '2.25rem',     // 36px
    '5xl': '3rem',        // 48px
    '6xl': '3.75rem',     // 60px
    '7xl': '4.5rem',      // 72px
  },
  
  // Hauteurs de ligne
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  // Graisses de police
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // Espacements de lettres
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  
  // Styles de texte prédéfinis
  textStyles: {
    // Titres
    h1: {
      fontSize: '3rem',
      lineHeight: '1.2',
      fontWeight: '700',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '2.25rem',
      lineHeight: '1.25',
      fontWeight: '600',
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.875rem',
      lineHeight: '1.375',
      fontWeight: '600',
      letterSpacing: '-0.025em',
    },
    h4: {
      fontSize: '1.5rem',
      lineHeight: '1.375',
      fontWeight: '600',
    },
    h5: {
      fontSize: '1.25rem',
      lineHeight: '1.5',
      fontWeight: '600',
    },
    h6: {
      fontSize: '1.125rem',
      lineHeight: '1.5',
      fontWeight: '600',
    },
    
    // Corps
    body: {
      fontSize: '1rem',
      lineHeight: '1.5',
      fontWeight: '400',
    },
    bodySmall: {
      fontSize: '0.875rem',
      lineHeight: '1.5',
      fontWeight: '400',
    },
    bodyLarge: {
      fontSize: '1.125rem',
      lineHeight: '1.625',
      fontWeight: '400',
    },
    
    // Labels et légendes
    label: {
      fontSize: '0.875rem',
      lineHeight: '1.25',
      fontWeight: '500',
      letterSpacing: '0.025em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: '1.25',
      fontWeight: '400',
      letterSpacing: '0.025em',
    },
    overline: {
      fontSize: '0.75rem',
      lineHeight: '1.25',
      fontWeight: '600',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
    
    // Code
    code: {
      fontFamily: 'monospace',
      fontSize: '0.875rem',
      lineHeight: '1.5',
      fontWeight: '400',
    },
  },
}

// Fonction helper pour appliquer un style de texte
export const applyTextStyle = (styleName) => {
  const style = typography.textStyles[styleName]
  if (!style) return {}
  
  return {
    fontSize: style.fontSize,
    lineHeight: style.lineHeight,
    fontWeight: style.fontWeight,
    letterSpacing: style.letterSpacing || 'normal',
    textTransform: style.textTransform || 'none',
    fontFamily: style.fontFamily || typography.fontFamily.sans.join(', '),
  }
}