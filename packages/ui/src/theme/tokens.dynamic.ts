/**
 * Dynamic token system for runtime theming
 * Allows overriding design tokens via CSS variables
 */

export interface DynamicTokens {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    foreground?: string;
    muted?: string;
    card?: string;
    popover?: string;
    border?: string;
    input?: string;
    ring?: string;
    destructive?: string;
    success?: string;
    warning?: string;
    info?: string;
  };
  spacing?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
    '3xl'?: string;
  };
  radius?: {
    none?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    full?: string;
  };
  font?: {
    sans?: string;
    mono?: string;
    size?: {
      xs?: string;
      sm?: string;
      base?: string;
      lg?: string;
      xl?: string;
      '2xl'?: string;
      '3xl'?: string;
      '4xl'?: string;
      '5xl'?: string;
    };
  };
  shadows?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
    inner?: string;
  };
}

/**
 * Apply dynamic tokens to the document
 */
export function applyDynamicTokens(tokens: DynamicTokens): void {
  const root = document.documentElement;

  // Apply color tokens
  if (tokens.colors) {
    Object.entries(tokens.colors).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--color-${key}`, value);
      }
    });
  }

  // Apply spacing tokens
  if (tokens.spacing) {
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--spacing-${key}`, value);
      }
    });
  }

  // Apply radius tokens
  if (tokens.radius) {
    Object.entries(tokens.radius).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--radius-${key}`, value);
      }
    });
  }

  // Apply font tokens
  if (tokens.font) {
    if (tokens.font.sans) {
      root.style.setProperty('--font-sans', tokens.font.sans);
    }
    if (tokens.font.mono) {
      root.style.setProperty('--font-mono', tokens.font.mono);
    }
    if (tokens.font.size) {
      Object.entries(tokens.font.size).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--font-size-${key}`, value);
        }
      });
    }
  }

  // Apply shadow tokens
  if (tokens.shadows) {
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--shadow-${key}`, value);
      }
    });
  }
}

/**
 * Reset all dynamic tokens to defaults
 */
export function resetDynamicTokens(): void {
  const root = document.documentElement;
  
  // Remove all custom properties starting with our prefixes
  const customProps = Array.from(root.style).filter(prop => 
    prop.startsWith('--color-') ||
    prop.startsWith('--spacing-') ||
    prop.startsWith('--radius-') ||
    prop.startsWith('--font-') ||
    prop.startsWith('--shadow-')
  );
  
  customProps.forEach(prop => {
    root.style.removeProperty(prop);
  });
}

/**
 * Get current dynamic tokens from CSS variables
 */
export function getCurrentTokens(): DynamicTokens {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  const tokens: DynamicTokens = {
    colors: {},
    spacing: {},
    radius: {},
    font: { size: {} },
    shadows: {},
  };

  // Extract color tokens
  const colorKeys = ['primary', 'secondary', 'accent', 'background', 'foreground', 'muted', 'card', 'popover', 'border', 'input', 'ring', 'destructive', 'success', 'warning', 'info'];
  colorKeys.forEach(key => {
    const value = computedStyle.getPropertyValue(`--color-${key}`);
    if (value) {
      tokens.colors![key as keyof typeof tokens.colors] = value.trim();
    }
  });

  // Extract spacing tokens
  const spacingKeys = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
  spacingKeys.forEach(key => {
    const value = computedStyle.getPropertyValue(`--spacing-${key}`);
    if (value) {
      tokens.spacing![key as keyof typeof tokens.spacing] = value.trim();
    }
  });

  // Extract radius tokens
  const radiusKeys = ['none', 'sm', 'md', 'lg', 'xl', 'full'];
  radiusKeys.forEach(key => {
    const value = computedStyle.getPropertyValue(`--radius-${key}`);
    if (value) {
      tokens.radius![key as keyof typeof tokens.radius] = value.trim();
    }
  });

  // Extract font tokens
  const fontSans = computedStyle.getPropertyValue('--font-sans');
  if (fontSans) tokens.font!.sans = fontSans.trim();
  
  const fontMono = computedStyle.getPropertyValue('--font-mono');
  if (fontMono) tokens.font!.mono = fontMono.trim();

  const fontSizeKeys = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];
  fontSizeKeys.forEach(key => {
    const value = computedStyle.getPropertyValue(`--font-size-${key}`);
    if (value) {
      tokens.font!.size![key as keyof typeof tokens.font.size] = value.trim();
    }
  });

  // Extract shadow tokens
  const shadowKeys = ['sm', 'md', 'lg', 'xl', '2xl', 'inner'];
  shadowKeys.forEach(key => {
    const value = computedStyle.getPropertyValue(`--shadow-${key}`);
    if (value) {
      tokens.shadows![key as keyof typeof tokens.shadows] = value.trim();
    }
  });

  return tokens;
}

/**
 * Presets for common theme variations
 */
export const themePresets = {
  highContrast: {
    colors: {
      background: '#000000',
      foreground: '#FFFFFF',
      primary: '#FFFF00',
      secondary: '#00FFFF',
      border: '#FFFFFF',
    },
  },
  dark: {
    colors: {
      background: '#09090B',
      foreground: '#FAFAFA',
      card: '#09090B',
      popover: '#09090B',
      primary: '#FAFAFA',
      secondary: '#27272A',
      muted: '#27272A',
      accent: '#27272A',
      border: '#27272A',
      input: '#27272A',
      ring: '#D4D4D8',
    },
  },
  light: {
    colors: {
      background: '#FFFFFF',
      foreground: '#09090B',
      card: '#FFFFFF',
      popover: '#FFFFFF',
      primary: '#18181B',
      secondary: '#F4F4F5',
      muted: '#F4F4F5',
      accent: '#F4F4F5',
      border: '#E4E4E7',
      input: '#E4E4E7',
      ring: '#18181B',
    },
  },
  brand: {
    colors: {
      primary: '#0A84FF',
      secondary: '#5E5CE6',
      accent: '#FF9F0A',
    },
  },
} as const;

/**
 * Apply a theme preset
 */
export function applyThemePreset(preset: keyof typeof themePresets | DynamicTokens): void {
  const tokens = typeof preset === 'string' ? themePresets[preset] : preset;
  applyDynamicTokens(tokens);
}
