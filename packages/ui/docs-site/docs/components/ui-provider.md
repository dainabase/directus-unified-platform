---
id: ui-provider
title: UI Provider
sidebar_position: 56
---

import { UIProvider } from '@dainabase/ui';

The global provider component that wraps your entire application, providing theme context, design tokens, internationalization, and global configuration for all UI components in the Design System.

## Preview

```jsx live
function UIProviderDemo() {
  const [theme, setTheme] = useState('light');
  const [locale, setLocale] = useState('en');
  
  return (
    <UIProvider 
      theme={theme}
      locale={locale}
      config={{
        animations: true,
        rtl: false,
        density: 'normal'
      }}
    >
      <div className="p-6 bg-background text-foreground rounded">
        <h3>UI Provider Context</h3>
        <p>Current theme: {theme}</p>
        <p>Current locale: {locale}</p>
        
        <div className="flex gap-2 mt-4">
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Toggle Theme
          </button>
          <button 
            onClick={() => setLocale(locale === 'en' ? 'fr' : 'en')}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded"
          >
            Toggle Language
          </button>
        </div>
      </div>
    </UIProvider>
  );
}
```

## Features

- 🎨 **Theme Management**: Global theme context and switching
- 🌍 **Internationalization**: Built-in i18n support with locale management
- 🎭 **Design Tokens**: Centralized design system tokens
- ⚡ **Performance**: Optimized context updates with memoization
- 🔧 **Configuration**: Global UI configuration options
- 📱 **Responsive**: Breakpoint and media query management
- ♿ **Accessibility**: Global accessibility preferences
- 🎯 **Type Safety**: Full TypeScript support
- 🔄 **Hot Reload**: Theme changes without page refresh
- 🧩 **Extensible**: Plugin system for custom providers

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```jsx
import { UIProvider } from '@dainabase/ui';
import App from './App';

function Root() {
  return (
    <UIProvider>
      <App />
    </UIProvider>
  );
}
```

## Examples

### Basic Provider Setup

```jsx
<UIProvider
  theme="light"
  locale="en"
  defaultTheme="system"
>
  <YourApplication />
</UIProvider>
```

### With Theme Configuration

```jsx
const customTheme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8'
  },
  fonts: {
    body: 'Inter, sans-serif',
    heading: 'Poppins, sans-serif',
    mono: 'Fira Code, monospace'
  },
  radii: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    full: '9999px'
  }
};

<UIProvider theme={customTheme}>
  <App />
</UIProvider>
```

### With Multiple Providers

```jsx
function RootProvider({ children }) {
  return (
    <UIProvider>
      <AuthProvider>
        <RouterProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </RouterProvider>
      </AuthProvider>
    </UIProvider>
  );
}
```

### With Internationalization

```jsx
const translations = {
  en: {
    welcome: 'Welcome',
    goodbye: 'Goodbye'
  },
  fr: {
    welcome: 'Bienvenue',
    goodbye: 'Au revoir'
  },
  es: {
    welcome: 'Bienvenido',
    goodbye: 'Adiós'
  }
};

<UIProvider
  locale="en"
  translations={translations}
  fallbackLocale="en"
>
  <InternationalApp />
</UIProvider>
```

### With Dark Mode

```jsx
function DarkModeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return (
    <UIProvider theme={theme} onThemeChange={setTheme}>
      {children}
    </UIProvider>
  );
}
```

### With Global Configuration

```jsx
const globalConfig = {
  // Animation settings
  animations: {
    enabled: true,
    duration: 200,
    easing: 'ease-in-out'
  },
  
  // Layout settings
  layout: {
    rtl: false,
    density: 'normal', // 'compact' | 'normal' | 'comfortable'
    containerWidth: '1200px'
  },
  
  // Accessibility
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    focusVisible: true
  },
  
  // Toast notifications
  toasts: {
    position: 'bottom-right',
    duration: 5000,
    limit: 3
  },
  
  // Date/Time settings
  dateTime: {
    firstDayOfWeek: 1, // Monday
    hourCycle: 24,
    timezone: 'UTC'
  }
};

<UIProvider config={globalConfig}>
  <App />
</UIProvider>
```

### With Custom Hooks

```jsx
// useTheme hook
function ThemeToggle() {
  const { theme, setTheme, themes } = useTheme();
  
  return (
    <select 
      value={theme} 
      onChange={(e) => setTheme(e.target.value)}
    >
      {themes.map(t => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
  );
}

// useLocale hook
function LanguageSelector() {
  const { locale, setLocale, availableLocales } = useLocale();
  
  return (
    <select 
      value={locale}
      onChange={(e) => setLocale(e.target.value)}
    >
      {availableLocales.map(lang => (
        <option key={lang} value={lang}>{lang}</option>
      ))}
    </select>
  );
}

// useUIConfig hook
function DensityControl() {
  const { config, updateConfig } = useUIConfig();
  
  return (
    <div>
      <label>
        <input
          type="radio"
          value="compact"
          checked={config.layout.density === 'compact'}
          onChange={() => updateConfig({ layout: { density: 'compact' } })}
        />
        Compact
      </label>
    </div>
  );
}
```

### With Persistent Settings

```jsx
function PersistentUIProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    // Load from localStorage
    const saved = localStorage.getItem('ui-settings');
    return saved ? JSON.parse(saved) : {
      theme: 'light',
      locale: 'en',
      density: 'normal'
    };
  });
  
  const updateSettings = (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('ui-settings', JSON.stringify(updated));
  };
  
  return (
    <UIProvider
      theme={settings.theme}
      locale={settings.locale}
      config={{ layout: { density: settings.density } }}
      onThemeChange={(theme) => updateSettings({ theme })}
      onLocaleChange={(locale) => updateSettings({ locale })}
    >
      {children}
    </UIProvider>
  );
}
```

### With SSR Support

```jsx
// server.jsx
import { renderToString } from 'react-dom/server';

function ServerApp({ initialTheme, initialLocale }) {
  const html = renderToString(
    <UIProvider
      theme={initialTheme}
      locale={initialLocale}
      isSSR={true}
    >
      <App />
    </UIProvider>
  );
  
  return html;
}

// client.jsx
import { hydrateRoot } from 'react-dom/client';

hydrateRoot(
  document.getElementById('root'),
  <UIProvider
    theme={window.__INITIAL_THEME__}
    locale={window.__INITIAL_LOCALE__}
    isSSR={false}
  >
    <App />
  </UIProvider>
);
```

### With Feature Flags

```jsx
const featureFlags = {
  newNavigation: true,
  betaFeatures: false,
  experimentalAnimations: true
};

<UIProvider
  features={featureFlags}
>
  <App />
</UIProvider>

// In components
function Navigation() {
  const { features } = useUIProvider();
  
  if (features.newNavigation) {
    return <NewNavigation />;
  }
  
  return <LegacyNavigation />;
}
```

## API Reference

### UIProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | Required | Application components |
| `theme` | `'light' \| 'dark' \| 'system' \| Theme` | `'system'` | Current theme |
| `defaultTheme` | `string` | `'light'` | Default theme fallback |
| `locale` | `string` | `'en'` | Current locale |
| `translations` | `object` | `{}` | Translation strings |
| `config` | `UIConfig` | `{}` | Global configuration |
| `features` | `object` | `{}` | Feature flags |
| `onThemeChange` | `(theme) => void` | - | Theme change handler |
| `onLocaleChange` | `(locale) => void` | - | Locale change handler |
| `isSSR` | `boolean` | `false` | Server-side rendering |
| `storageKey` | `string` | `'ui-theme'` | LocalStorage key |
| `enableSystem` | `boolean` | `true` | Enable system theme |
| `forcedTheme` | `string` | - | Force specific theme |

### UIConfig Interface

```typescript
interface UIConfig {
  animations?: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
  layout?: {
    rtl: boolean;
    density: 'compact' | 'normal' | 'comfortable';
    containerWidth: string;
  };
  accessibility?: {
    reducedMotion: boolean;
    highContrast: boolean;
    focusVisible: boolean;
  };
  toasts?: {
    position: Position;
    duration: number;
    limit: number;
  };
  dateTime?: {
    firstDayOfWeek: number;
    hourCycle: 12 | 24;
    timezone: string;
  };
}
```

### Hooks

```typescript
// Theme hook
const useTheme = () => {
  theme: string;
  setTheme: (theme: string) => void;
  themes: string[];
  resolvedTheme: string;
};

// Locale hook
const useLocale = () => {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: object) => string;
  availableLocales: string[];
};

// Config hook
const useUIConfig = () => {
  config: UIConfig;
  updateConfig: (config: Partial<UIConfig>) => void;
};

// Provider hook
const useUIProvider = () => {
  theme: string;
  locale: string;
  config: UIConfig;
  features: object;
};
```

## Accessibility

The UI Provider ensures accessibility across the entire application:

- **Theme Persistence**: Respects user's system preferences
- **Reduced Motion**: Honors prefers-reduced-motion
- **High Contrast**: Supports high contrast mode
- **Focus Management**: Consistent focus styling
- **Screen Reader**: Proper ARIA announcements
- **Keyboard Navigation**: Global keyboard shortcuts
- **RTL Support**: Right-to-left language support

```jsx
<UIProvider
  config={{
    accessibility: {
      reducedMotion: window.matchMedia('(prefers-reduced-motion)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      focusVisible: true
    }
  }}
>
  {children}
</UIProvider>
```

## Best Practices

### Do's ✅

- Wrap entire app with UIProvider
- Use at the root level of your application
- Persist user preferences
- Provide theme switching UI
- Support system preferences
- Include fallback values
- Memoize context values
- Use provided hooks
- Handle SSR properly
- Test with different configurations

### Don'ts ❌

- Don't nest multiple UIProviders
- Don't modify theme directly
- Don't forget SSR considerations
- Don't ignore system preferences
- Don't hardcode values
- Don't skip error boundaries
- Don't forget locale fallbacks
- Don't ignore accessibility
- Don't pollute global scope
- Don't forget to clean up listeners

## Use Cases

1. **Application Theming**: Global theme management
2. **Multi-language Apps**: Internationalization support
3. **Design Systems**: Centralized design tokens
4. **Enterprise Apps**: Global configuration management
5. **Dashboard Applications**: User preference persistence
6. **E-commerce**: Locale and currency settings
7. **Content Platforms**: Reading preferences
8. **Admin Panels**: Density and layout settings
9. **Progressive Web Apps**: Offline settings sync
10. **Multi-tenant Apps**: Tenant-specific configurations

## Troubleshooting

Common issues and solutions:

```jsx
// Issue: Theme not applying
// Solution: Ensure UIProvider is at root
// ✅ Correct
<UIProvider>
  <Router>
    <App />
  </Router>
</UIProvider>

// Issue: Locale not changing
// Solution: Check translation keys
const translations = {
  en: { key: 'value' }, // Ensure keys match
  fr: { key: 'valeur' }
};

// Issue: SSR hydration mismatch
// Solution: Use same initial values
<UIProvider
  theme={typeof window !== 'undefined' ? savedTheme : 'light'}
  isSSR={typeof window === 'undefined'}
>
```

## Related Components

- [ThemeProvider](./theme-provider) - Theme-specific provider
- [ToastProvider](./toast) - Toast notification provider
- [ErrorBoundary](./error-boundary) - Error handling wrapper
- [LocaleProvider](./locale-provider) - i18n provider
- [ConfigProvider](./config-provider) - Configuration provider