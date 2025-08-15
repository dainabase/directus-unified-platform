import * as React from 'react';

// Theme context
interface Theme {
  mode: 'light' | 'dark' | 'system';
  primaryColor?: string;
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

interface UIContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toast: (message: string, options?: ToastOptions) => void;
  locale: string;
  setLocale: (locale: string) => void;
}

interface ToastOptions {
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const UIContext = React.createContext<UIContextValue | undefined>(undefined);

export interface UIProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultLocale?: string;
  storageKey?: string;
  enableSystemTheme?: boolean;
}

export const UIProvider: React.FC<UIProviderProps> = ({
  children,
  defaultTheme = { mode: 'system' },
  defaultLocale = 'en',
  storageKey = 'ui-theme',
  enableSystemTheme = true,
}) => {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return defaultTheme;
        }
      }
    }
    return defaultTheme;
  });

  const [locale, setLocaleState] = React.useState(defaultLocale);

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(newTheme));
        
        // Apply theme to document
        const root = document.documentElement;
        
        // Remove existing theme classes
        root.classList.remove('light', 'dark');
        
        // Determine actual theme mode
        let actualMode = newTheme.mode;
        if (actualMode === 'system' && enableSystemTheme) {
          actualMode = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
        }
        
        // Apply theme class
        if (actualMode === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
        
        // Apply custom properties
        if (newTheme.primaryColor) {
          root.style.setProperty('--primary', newTheme.primaryColor);
        }
        if (newTheme.radius) {
          root.style.setProperty('--radius', `var(--radius-${newTheme.radius})`);
        }
      }
    },
    [storageKey, enableSystemTheme]
  );

  const setLocale = React.useCallback((newLocale: string) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      document.documentElement.lang = newLocale;
      localStorage.setItem('ui-locale', newLocale);
    }
  }, []);

  const toast = React.useCallback((message: string, options?: ToastOptions) => {
    // This is a placeholder for toast functionality
    // In a real implementation, this would integrate with a toast library
    console.log('Toast:', message, options);
    
    // Create a custom event that other components can listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ui-toast', {
          detail: { message, ...options },
        })
      );
    }
  }, []);

  // Apply initial theme
  React.useEffect(() => {
    setTheme(theme);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for system theme changes
  React.useEffect(() => {
    if (!enableSystemTheme || theme.mode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setTheme(theme);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, setTheme, enableSystemTheme]);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      toast,
      locale,
      setLocale,
    }),
    [theme, setTheme, toast, locale, setLocale]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = React.useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export default UIProvider;
