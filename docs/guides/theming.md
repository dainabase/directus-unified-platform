# Theming Guide

## Overview

The Directus Unified Platform UI library provides a powerful and flexible theming system that allows you to customize the appearance of all components to match your brand and design requirements.

## Theme Architecture

Our theming system is built on:
- CSS Custom Properties (CSS Variables)
- Theme Provider Pattern
- Dark/Light mode support
- Component-level customization
- Runtime theme switching

## Basic Setup

### Using the UIProvider

```tsx
import { UIProvider } from '@dainabase/directus-ui';

const App = () => {
  return (
    <UIProvider
      theme={{
        mode: 'light',
        primaryColor: '#3b82f6',
        radius: 'md',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* Your application */}
    </UIProvider>
  );
};
```

## Theme Configuration

### Complete Theme Object

```typescript
interface Theme {
  // Color Mode
  mode: 'light' | 'dark' | 'auto';
  
  // Primary Colors
  primaryColor: string;
  primaryColorHover: string;
  primaryColorActive: string;
  
  // Secondary Colors
  secondaryColor: string;
  secondaryColorHover: string;
  secondaryColorActive: string;
  
  // Semantic Colors
  successColor: string;
  warningColor: string;
  errorColor: string;
  infoColor: string;
  
  // Neutral Colors
  backgroundColor: string;
  foregroundColor: string;
  borderColor: string;
  mutedColor: string;
  
  // Typography
  fontFamily: string;
  fontFamilyMono: string;
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  
  // Spacing
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  
  // Border Radius
  radius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  
  // Shadows
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  // Transitions
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
  
  // Z-Index
  zIndex: {
    dropdown: number;
    modal: number;
    popover: number;
    tooltip: number;
    toast: number;
  };
}
```

## Color Schemes

### Light Mode

```tsx
const lightTheme = {
  mode: 'light',
  primaryColor: '#3b82f6',
  backgroundColor: '#ffffff',
  foregroundColor: '#000000',
  borderColor: '#e5e7eb',
  mutedColor: '#6b7280',
  // ... other properties
};
```

### Dark Mode

```tsx
const darkTheme = {
  mode: 'dark',
  primaryColor: '#60a5fa',
  backgroundColor: '#0a0a0a',
  foregroundColor: '#ffffff',
  borderColor: '#27272a',
  mutedColor: '#a1a1aa',
  // ... other properties
};
```

### Automatic Mode

Automatically switches between light and dark based on system preference:

```tsx
<UIProvider theme={{ mode: 'auto' }}>
  {/* Components will adapt to system preference */}
</UIProvider>
```

## CSS Variables

### Available CSS Variables

```css
:root {
  /* Colors */
  --ui-primary: 59 130 246;
  --ui-primary-foreground: 255 255 255;
  --ui-secondary: 100 116 139;
  --ui-secondary-foreground: 255 255 255;
  --ui-background: 255 255 255;
  --ui-foreground: 0 0 0;
  --ui-muted: 245 245 245;
  --ui-muted-foreground: 107 114 128;
  --ui-border: 229 231 235;
  
  /* Semantic Colors */
  --ui-success: 34 197 94;
  --ui-warning: 251 191 36;
  --ui-error: 239 68 68;
  --ui-info: 59 130 246;
  
  /* Spacing */
  --ui-spacing-xs: 0.25rem;
  --ui-spacing-sm: 0.5rem;
  --ui-spacing-md: 1rem;
  --ui-spacing-lg: 1.5rem;
  --ui-spacing-xl: 2rem;
  
  /* Border Radius */
  --ui-radius-sm: 0.25rem;
  --ui-radius-md: 0.5rem;
  --ui-radius-lg: 0.75rem;
  
  /* Typography */
  --ui-font-sans: Inter, system-ui, sans-serif;
  --ui-font-mono: 'Fira Code', monospace;
}
```

### Using CSS Variables in Custom Components

```css
.custom-component {
  background-color: rgb(var(--ui-background));
  color: rgb(var(--ui-foreground));
  border: 1px solid rgb(var(--ui-border));
  border-radius: var(--ui-radius-md);
  padding: var(--ui-spacing-md);
}

.custom-button {
  background-color: rgb(var(--ui-primary));
  color: rgb(var(--ui-primary-foreground));
  transition: all 0.2s;
}

.custom-button:hover {
  opacity: 0.9;
}
```

## Component-Level Theming

### Using Style Props

```tsx
import { Button, Card } from '@dainabase/directus-ui';

// Direct style customization
<Button
  style={{
    '--button-bg': '#8b5cf6',
    '--button-hover-bg': '#7c3aed',
  }}
>
  Custom Purple Button
</Button>

// Using className for theming
<Card className="custom-card-theme">
  Content
</Card>
```

### Component Variants

```tsx
// Built-in variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
```

## Dynamic Theme Switching

### Using useTheme Hook

```tsx
import { useTheme } from '@dainabase/directus-ui';

const ThemeSwitcher = () => {
  const { theme, setTheme, toggleMode } = useTheme();
  
  return (
    <div>
      <button onClick={toggleMode}>
        Current mode: {theme.mode}
      </button>
      
      <button onClick={() => setTheme({ primaryColor: '#10b981' })}>
        Green Theme
      </button>
      
      <button onClick={() => setTheme({ primaryColor: '#f59e0b' })}>
        Orange Theme
      </button>
    </div>
  );
};
```

### Runtime Theme Updates

```tsx
import { useState } from 'react';
import { UIProvider, ColorPicker } from '@dainabase/directus-ui';

const ThemedApp = () => {
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  
  return (
    <UIProvider theme={{ primaryColor }}>
      <ColorPicker
        value={primaryColor}
        onChange={setPrimaryColor}
        label="Choose Primary Color"
      />
      {/* Rest of your app */}
    </UIProvider>
  );
};
```

## Preset Themes

### Blue Theme (Default)

```tsx
const blueTheme = {
  primaryColor: '#3b82f6',
  primaryColorHover: '#2563eb',
  primaryColorActive: '#1d4ed8',
};
```

### Green Theme

```tsx
const greenTheme = {
  primaryColor: '#10b981',
  primaryColorHover: '#059669',
  primaryColorActive: '#047857',
};
```

### Purple Theme

```tsx
const purpleTheme = {
  primaryColor: '#8b5cf6',
  primaryColorHover: '#7c3aed',
  primaryColorActive: '#6d28d9',
};
```

### Corporate Theme

```tsx
const corporateTheme = {
  primaryColor: '#1e40af',
  fontFamily: 'IBM Plex Sans, sans-serif',
  radius: {
    sm: '2px',
    md: '4px',
    lg: '6px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
  },
};
```

## Advanced Theming

### Creating Custom Theme Variants

```tsx
import { createTheme } from '@dainabase/directus-ui';

const customTheme = createTheme({
  name: 'ocean',
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
  },
  fonts: {
    heading: 'Poppins, sans-serif',
    body: 'Inter, sans-serif',
    mono: 'Fira Code, monospace',
  },
});
```

### Theme Composition

```tsx
import { mergeThemes } from '@dainabase/directus-ui';

const baseTheme = { /* base configuration */ };
const brandTheme = { /* brand overrides */ };
const seasonalTheme = { /* seasonal adjustments */ };

const finalTheme = mergeThemes(baseTheme, brandTheme, seasonalTheme);
```

## Accessibility Considerations

### Color Contrast

```tsx
// Ensure WCAG AA compliance
const accessibleTheme = {
  // Minimum 4.5:1 contrast ratio for normal text
  primaryColor: '#0066cc',
  foregroundColor: '#212121',
  backgroundColor: '#ffffff',
  
  // Minimum 3:1 contrast ratio for large text
  mutedColor: '#666666',
};
```

### High Contrast Mode

```tsx
const highContrastTheme = {
  mode: 'high-contrast',
  primaryColor: '#000000',
  backgroundColor: '#ffffff',
  borderColor: '#000000',
  // Increased contrast for better visibility
};
```

## Theme Persistence

### Local Storage

```tsx
import { useEffect, useState } from 'react';

const usePersistedTheme = () => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('app-theme');
    return saved ? JSON.parse(saved) : defaultTheme;
  });
  
  useEffect(() => {
    localStorage.setItem('app-theme', JSON.stringify(theme));
  }, [theme]);
  
  return [theme, setTheme];
};
```

## Performance Optimization

### CSS Variable Scoping

```css
/* Global scope */
:root {
  --ui-primary: 59 130 246;
}

/* Component scope for better performance */
.button-component {
  --button-bg: rgb(var(--ui-primary));
  --button-hover: rgb(var(--ui-primary) / 0.9);
}
```

### Lazy Theme Loading

```tsx
import { lazy, Suspense } from 'react';

const ThemeProvider = lazy(() => import('./ThemeProvider'));

const App = () => (
  <Suspense fallback={<div>Loading theme...</div>}>
    <ThemeProvider>
      {/* Your app */}
    </ThemeProvider>
  </Suspense>
);
```

## Best Practices

1. **Consistent Naming**: Use semantic color names (primary, secondary, success) rather than color values (blue, green)
2. **Theme Tokens**: Define reusable tokens for consistency
3. **Responsive Theming**: Consider different themes for different screen sizes
4. **Performance**: Use CSS variables for runtime changes
5. **Accessibility**: Always test color contrast ratios
6. **Documentation**: Document your theme values and their purposes

## Next Steps

- Explore [Component Documentation](../components/) for component-specific theming
- Review [Accessibility Guide](./accessibility.md) for theme accessibility
- Check [Patterns Guide](./patterns.md) for theming patterns
