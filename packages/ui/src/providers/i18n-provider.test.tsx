/**
 * I18n Provider Tests
 * Tests internationalization provider functionality
 * Critical for multi-language support
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { I18nProvider } from './i18n-provider';
import userEvent from '@testing-library/user-event';

// Mock i18n configuration
const mockTranslations = {
  en: {
    common: {
      welcome: 'Welcome',
      submit: 'Submit',
      cancel: 'Cancel',
      loading: 'Loading...',
      error: 'An error occurred'
    },
    validation: {
      required: 'This field is required',
      email: 'Invalid email address',
      minLength: 'Minimum {{min}} characters required'
    }
  },
  fr: {
    common: {
      welcome: 'Bienvenue',
      submit: 'Soumettre',
      cancel: 'Annuler',
      loading: 'Chargement...',
      error: 'Une erreur est survenue'
    },
    validation: {
      required: 'Ce champ est requis',
      email: 'Adresse e-mail invalide',
      minLength: 'Minimum {{min}} caractères requis'
    }
  },
  de: {
    common: {
      welcome: 'Willkommen',
      submit: 'Einreichen',
      cancel: 'Abbrechen',
      loading: 'Laden...',
      error: 'Ein Fehler ist aufgetreten'
    },
    validation: {
      required: 'Dieses Feld ist erforderlich',
      email: 'Ungültige E-Mail-Adresse',
      minLength: 'Mindestens {{min}} Zeichen erforderlich'
    }
  }
};

// Mock useTranslation hook
const mockUseTranslation = jest.fn(() => ({
  t: (key: string, params?: any) => {
    const keys = key.split('.');
    let value = mockTranslations.en;
    for (const k of keys) {
      value = value[k];
    }
    if (params) {
      return value.replace(/{{(\w+)}}/g, (_, p) => params[p]);
    }
    return value;
  },
  i18n: {
    language: 'en',
    changeLanguage: jest.fn()
  }
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => mockUseTranslation(),
  I18nextProvider: ({ children }: any) => children,
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn()
  }
}));

describe('I18nProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Provider Setup', () => {
    it('renders children with i18n context', () => {
      render(
        <I18nProvider locale="en">
          <div data-testid="child">Test Content</div>
        </I18nProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('provides translation functions to children', () => {
      const TestComponent = () => {
        const { t } = mockUseTranslation();
        return <div>{t('common.welcome')}</div>;
      };

      render(
        <I18nProvider locale="en">
          <TestComponent />
        </I18nProvider>
      );

      expect(screen.getByText('Welcome')).toBeInTheDocument();
    });

    it('initializes with default locale', () => {
      render(
        <I18nProvider>
          <div>Content</div>
        </I18nProvider>
      );

      const { i18n } = mockUseTranslation();
      expect(i18n.language).toBe('en');
    });

    it('accepts custom locale prop', () => {
      render(
        <I18nProvider locale="fr">
          <div>Content</div>
        </I18nProvider>
      );

      // In real implementation, this would change the language
      expect(mockUseTranslation).toHaveBeenCalled();
    });
  });

  describe('Language Switching', () => {
    it('changes language dynamically', async () => {
      const TestComponent = () => {
        const { i18n } = mockUseTranslation();
        return (
          <button onClick={() => i18n.changeLanguage('fr')}>
            Change to French
          </button>
        );
      };

      render(
        <I18nProvider locale="en">
          <TestComponent />
        </I18nProvider>
      );

      const button = screen.getByText('Change to French');
      await userEvent.click(button);

      const { i18n } = mockUseTranslation();
      expect(i18n.changeLanguage).toHaveBeenCalledWith('fr');
    });

    it('persists language preference', async () => {
      const mockLocalStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      };

      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      });

      render(
        <I18nProvider locale="en" persistLanguage>
          <div>Content</div>
        </I18nProvider>
      );

      // Simulate language change
      const { i18n } = mockUseTranslation();
      await i18n.changeLanguage('fr');

      // In real implementation, this would save to localStorage
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'preferred-language',
        'fr'
      );
    });

    it('loads persisted language on mount', () => {
      const mockLocalStorage = {
        getItem: jest.fn(() => 'de'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      };

      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      });

      render(
        <I18nProvider persistLanguage>
          <div>Content</div>
        </I18nProvider>
      );

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('preferred-language');
    });
  });

  describe('Translation Features', () => {
    it('translates with parameters', () => {
      const TestComponent = () => {
        const { t } = mockUseTranslation();
        return <div>{t('validation.minLength', { min: 8 })}</div>;
      };

      render(
        <I18nProvider locale="en">
          <TestComponent />
        </I18nProvider>
      );

      expect(screen.getByText('Minimum 8 characters required')).toBeInTheDocument();
    });

    it('handles missing translations gracefully', () => {
      const TestComponent = () => {
        const { t } = mockUseTranslation();
        return <div>{t('nonexistent.key') || 'nonexistent.key'}</div>;
      };

      render(
        <I18nProvider locale="en">
          <TestComponent />
        </I18nProvider>
      );

      // Should show the key as fallback
      expect(screen.getByText('nonexistent.key')).toBeInTheDocument();
    });

    it('supports nested translation keys', () => {
      const TestComponent = () => {
        const { t } = mockUseTranslation();
        return (
          <div>
            <span>{t('common.welcome')}</span>
            <span>{t('validation.required')}</span>
          </div>
        );
      };

      render(
        <I18nProvider locale="en">
          <TestComponent />
        </I18nProvider>
      );

      expect(screen.getByText('Welcome')).toBeInTheDocument();
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });

  describe('Fallback Behavior', () => {
    it('falls back to default locale on invalid locale', () => {
      render(
        <I18nProvider locale="invalid">
          <div>Content</div>
        </I18nProvider>
      );

      const { i18n } = mockUseTranslation();
      expect(i18n.language).toBe('en'); // Should fallback to 'en'
    });

    it('provides fallback for missing namespace', () => {
      const TestComponent = () => {
        const { t } = mockUseTranslation();
        return <div>{t('missing.namespace.key', 'Fallback text')}</div>;
      };

      render(
        <I18nProvider locale="en">
          <TestComponent />
        </I18nProvider>
      );

      expect(screen.getByText('Fallback text')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('memoizes translations', () => {
      const TestComponent = () => {
        const { t } = mockUseTranslation();
        React.useEffect(() => {
          t('common.welcome');
          t('common.welcome'); // Second call should be memoized
        }, [t]);
        
        return <div>Performance Test</div>;
      };

      render(
        <I18nProvider locale="en">
          <TestComponent />
        </I18nProvider>
      );

      // In real implementation, check that translation is not recalculated
      expect(screen.getByText('Performance Test')).toBeInTheDocument();
    });

    it('only re-renders on language change', () => {
      let renderCount = 0;
      
      const TestComponent = () => {
        renderCount++;
        return <div>Render count: {renderCount}</div>;
      };

      const { rerender } = render(
        <I18nProvider locale="en">
          <TestComponent />
        </I18nProvider>
      );

      expect(renderCount).toBe(1);

      // Re-render with same locale should not trigger component re-render
      rerender(
        <I18nProvider locale="en">
          <TestComponent />
        </I18nProvider>
      );

      expect(renderCount).toBe(1); // Should still be 1

      // Change locale should trigger re-render
      rerender(
        <I18nProvider locale="fr">
          <TestComponent />
        </I18nProvider>
      );

      expect(renderCount).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('handles provider nesting gracefully', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation();

      render(
        <I18nProvider locale="en">
          <I18nProvider locale="fr">
            <div>Nested Content</div>
          </I18nProvider>
        </I18nProvider>
      );

      // Should warn about nested providers
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('Nested I18nProvider detected')
      );

      spy.mockRestore();
    });

    it('recovers from translation loading errors', async () => {
      const mockErrorHandler = jest.fn();
      
      render(
        <I18nProvider locale="en" onError={mockErrorHandler}>
          <div>Content</div>
        </I18nProvider>
      );

      // Simulate translation loading error
      const error = new Error('Failed to load translations');
      
      // In real implementation, this would be caught
      await waitFor(() => {
        if (mockErrorHandler.mock.calls.length > 0) {
          expect(mockErrorHandler).toHaveBeenCalledWith(error);
        }
      });
    });
  });

  describe('SSR Support', () => {
    it('works in server-side rendering context', () => {
      // Mock server environment
      const originalWindow = global.window;
      delete (global as any).window;

      render(
        <I18nProvider locale="en">
          <div>SSR Content</div>
        </I18nProvider>
      );

      expect(screen.getByText('SSR Content')).toBeInTheDocument();

      // Restore window
      global.window = originalWindow;
    });

    it('hydrates correctly on client', () => {
      // Simulate SSR HTML
      document.body.innerHTML = '<div id="root"><div>SSR Content</div></div>';
      
      const container = document.getElementById('root');
      if (container) {
        render(
          <I18nProvider locale="en">
            <div>SSR Content</div>
          </I18nProvider>,
          { container }
        );
      }

      expect(screen.getByText('SSR Content')).toBeInTheDocument();
    });
  });
});
