# 🚀 Advanced Features Guide

## Overview

This guide covers the advanced features of the @dainabase/ui Design System including RTL support, internationalization, dynamic theming, keyboard shortcuts, and feature flags.

## RTL Support

### Setup

```tsx
import { useEffect } from 'react';
import { getTextDirection } from '@dainabase/ui/i18n';
import '@dainabase/ui/theme/rtl.css';

function App() {
  const locale = 'ar-SA'; // or 'he-IL'
  
  useEffect(() => {
    document.dir = getTextDirection(locale);
  }, [locale]);
  
  return (
    <div dir={getTextDirection(locale)}>
      {/* Your app content */}
    </div>
  );
}
```

### CSS Classes

The RTL stylesheet automatically handles:
- Text alignment
- Margin and padding
- Border radius
- Icon positioning
- Animation directions
- Progress bars
- Breadcrumb separators

### Logical Properties

Use logical properties for better RTL support:

```css
/* Instead of */
.element {
  margin-left: 1rem;
  padding-right: 0.5rem;
}

/* Use */
.element {
  margin-inline-start: 1rem;
  padding-inline-end: 0.5rem;
}
```

## Internationalization (i18n)

### Formatters

```tsx
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  formatRelativeTime,
  formatFileSize,
  formatList,
  pluralize
} from '@dainabase/ui/i18n';

// Currency formatting
formatCurrency(1234.56, 'en-US', 'USD'); // $1,234.56
formatCurrency(1234.56, 'fr-FR', 'EUR'); // 1 234,56 €

// Date formatting
formatDate(new Date(), 'en-US'); // August 10, 2025
formatDate(new Date(), 'fr-FR'); // 10 août 2025

// Relative time
formatRelativeTime(Date.now() - 3600000); // 1 hour ago

// Number formatting
formatNumber(1234567.89, 'en-US'); // 1,234,567.89
formatNumber(1234567.89, 'de-DE'); // 1.234.567,89

// Percentage
formatPercent(85, 'en-US', 1); // 85.0%

// File size
formatFileSize(1536); // 1.5 KB

// Lists
formatList(['Apple', 'Orange', 'Banana'], 'en-US'); // Apple, Orange, and Banana

// Pluralization
pluralize(1, 'item'); // item
pluralize(5, 'item'); // items
```

### Supported Locales

- `en-US` - English (United States)
- `fr-FR` - French (France)
- `de-DE` - German (Germany)
- `es-ES` - Spanish (Spain)
- `it-IT` - Italian (Italy)
- `pt-BR` - Portuguese (Brazil)
- `zh-CN` - Chinese (Simplified)
- `ja-JP` - Japanese
- `ar-SA` - Arabic (Saudi Arabia)
- `he-IL` - Hebrew (Israel)

## Dynamic Theming

### Apply Custom Tokens

```tsx
import { applyDynamicTokens, resetDynamicTokens } from '@dainabase/ui/theme/tokens.dynamic';

// Apply custom theme
applyDynamicTokens({
  colors: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    accent: '#FFE66D',
  },
  spacing: {
    md: '1.5rem',
    lg: '2rem',
  },
  radius: {
    md: '0.5rem',
    lg: '1rem',
  }
});

// Reset to defaults
resetDynamicTokens();
```

### Theme Presets

```tsx
import { applyThemePreset } from '@dainabase/ui/theme/tokens.dynamic';

// Apply preset
applyThemePreset('highContrast');
applyThemePreset('dark');
applyThemePreset('light');
applyThemePreset('brand');

// Or custom theme
applyThemePreset({
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
  }
});
```

### Get Current Tokens

```tsx
import { getCurrentTokens } from '@dainabase/ui/theme/tokens.dynamic';

const currentTheme = getCurrentTokens();
console.log(currentTheme.colors.primary);
```

## Keyboard Shortcuts

### Global Shortcuts Configuration

```tsx
import { CommandPalette } from '@dainabase/ui';

const shortcuts = {
  'cmd+k': () => openCommandPalette(),
  'cmd+/': () => toggleSearch(),
  'cmd+b': () => toggleSidebar(),
  'cmd+d': () => toggleDarkMode(),
  'cmd+,': () => openSettings(),
  'esc': () => closeAllModals(),
};

function App() {
  useKeyboardShortcuts(shortcuts);
  
  return <CommandPalette shortcuts={shortcuts} />;
}
```

### Component Shortcuts

```tsx
// DataGrid shortcuts
const dataGridShortcuts = {
  'ArrowUp': () => selectPreviousRow(),
  'ArrowDown': () => selectNextRow(),
  'Enter': () => editCell(),
  'Escape': () => cancelEdit(),
  'cmd+a': () => selectAll(),
  'cmd+c': () => copySelection(),
  'cmd+v': () => pasteSelection(),
};
```

## Feature Flags

### Check Feature Status

```tsx
import { isFeatureEnabled, FEATURE_FLAGS } from '@dainabase/ui/flags';

if (isFeatureEnabled(FEATURE_FLAGS.ENABLE_DATA_GRID_EXPERIMENTAL)) {
  // Use experimental features
}
```

### Enable/Disable Features

```tsx
import { 
  enableFeature, 
  disableFeature, 
  toggleFeature,
  FEATURE_FLAGS 
} from '@dainabase/ui/flags';

// Enable a feature
enableFeature(FEATURE_FLAGS.ENABLE_CHARTS_3D);

// Disable a feature
disableFeature(FEATURE_FLAGS.ENABLE_ANIMATION_HEAVY);

// Toggle a feature
const newState = toggleFeature(FEATURE_FLAGS.ENABLE_DEBUG_MODE);
```

### React Hook

```tsx
import { useFeatureFlag, FEATURE_FLAGS } from '@dainabase/ui/flags';

function MyComponent() {
  const is3DEnabled = useFeatureFlag(FEATURE_FLAGS.ENABLE_CHARTS_3D);
  
  return is3DEnabled ? <Chart3D /> : <Chart2D />;
}
```

### HOC Pattern

```tsx
import { withFeatureFlag, FEATURE_FLAGS } from '@dainabase/ui/flags';

const EnhancedDataGrid = withFeatureFlag(
  FEATURE_FLAGS.ENABLE_DATA_GRID_EXPERIMENTAL,
  ExperimentalDataGrid,
  StandardDataGrid // Fallback
);
```

### Available Flags

#### Component Features
- `ENABLE_DATA_GRID_EXPERIMENTAL` - Experimental DataGrid features
- `ENABLE_CHARTS_3D` - 3D chart visualizations
- `ENABLE_AI_COMPONENTS` - AI-powered components
- `ENABLE_ANIMATION_HEAVY` - Heavy animations

#### Theme Features
- `ENABLE_CUSTOM_THEMES` - Custom theme creation
- `ENABLE_THEME_BUILDER` - Visual theme builder
- `ENABLE_COLOR_PICKER` - Color picker component

#### Performance Features
- `ENABLE_VIRTUALIZATION` - List virtualization (default: true)
- `ENABLE_WEB_WORKERS` - Web Workers for heavy operations
- `ENABLE_LAZY_LOADING` - Lazy component loading (default: true)
- `ENABLE_PREFETCH` - Resource prefetching

#### Accessibility Features
- `ENABLE_SCREEN_READER_ENHANCED` - Enhanced screen reader support
- `ENABLE_KEYBOARD_NAVIGATION_HINTS` - Keyboard navigation hints
- `ENABLE_HIGH_CONTRAST_AUTO` - Auto high-contrast mode

#### Developer Features
- `ENABLE_DEBUG_MODE` - Debug mode
- `ENABLE_PERFORMANCE_MONITOR` - Performance monitoring
- `ENABLE_COMPONENT_INSPECTOR` - Component inspector
- `ENABLE_STYLE_DEBUGGER` - Style debugging tools

### Configuration Methods

1. **Environment Variables**
```bash
REACT_APP_ENABLE_DEBUG_MODE=true
REACT_APP_ENABLE_CHARTS_3D=true
```

2. **URL Parameters**
```
https://app.com?feature_enable_debug_mode=true
```

3. **LocalStorage**
```javascript
localStorage.setItem('ds_feature_enable_debug_mode', 'true');
```

## Best Practices

### RTL
- Always use logical properties for spacing
- Test with both LTR and RTL languages
- Use the `dir` attribute on the root element
- Avoid hardcoded left/right values

### i18n
- Always use formatters for user-facing content
- Support date/time in user's locale
- Handle pluralization correctly
- Test with different number formats

### Theming
- Define tokens at the root level
- Use CSS variables for dynamic values
- Provide theme presets
- Allow user preference persistence

### Feature Flags
- Use environment variables for build-time flags
- Use localStorage for runtime flags
- Provide fallbacks for disabled features
- Clean up flags after feature stabilization

## Examples

### Complete RTL + i18n Setup

```tsx
import { useState, useEffect } from 'react';
import { 
  getTextDirection, 
  formatDate,
  SUPPORTED_LOCALES 
} from '@dainabase/ui/i18n';
import '@dainabase/ui/theme/rtl.css';

function InternationalApp() {
  const [locale, setLocale] = useState<SupportedLocale>('en-US');
  
  useEffect(() => {
    document.dir = getTextDirection(locale);
    document.lang = locale;
  }, [locale]);
  
  return (
    <div>
      <select 
        value={locale} 
        onChange={(e) => setLocale(e.target.value as SupportedLocale)}
      >
        {SUPPORTED_LOCALES.map(loc => (
          <option key={loc} value={loc}>{loc}</option>
        ))}
      </select>
      
      <p>{formatDate(new Date(), locale)}</p>
    </div>
  );
}
```

### Theme Switcher with Persistence

```tsx
import { useState, useEffect } from 'react';
import { applyThemePreset, getCurrentTokens } from '@dainabase/ui/theme/tokens.dynamic';

function ThemeSwitcher() {
  const [theme, setTheme] = useState(() => 
    localStorage.getItem('preferred-theme') || 'light'
  );
  
  useEffect(() => {
    applyThemePreset(theme as any);
    localStorage.setItem('preferred-theme', theme);
  }, [theme]);
  
  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="highContrast">High Contrast</option>
      <option value="brand">Brand</option>
    </select>
  );
}
```

---

*Last updated: August 10, 2025*
