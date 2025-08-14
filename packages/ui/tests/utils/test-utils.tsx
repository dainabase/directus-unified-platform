/**
 * Test utilities for React Testing Library
 * Provides custom render methods with providers
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

// Add user-event to exports
export { userEvent };

/**
 * Providers wrapper for tests
 * Add any global providers here (Theme, Router, etc.)
 */
interface ProvidersProps {
  children: React.ReactNode;
}

function Providers({ children }: ProvidersProps) {
  // Add any providers needed for tests here
  // For now, just return children
  return <>{children}</>;
}

/**
 * Custom render method that includes providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  return render(ui, { wrapper: Providers, ...options });
}

/**
 * Custom render hook with providers
 */
export { renderHook } from '@testing-library/react';

/**
 * Utility to wait for async operations
 */
export async function waitForAsync(ms: number = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Utility to create mock functions with TypeScript support
 */
export function createMockFn<T extends (...args: any[]) => any>(): jest.MockedFunction<T> {
  return jest.fn() as jest.MockedFunction<T>;
}

/**
 * Test ID helpers
 */
export const testIds = {
  button: (variant?: string) => `button${variant ? `-${variant}` : ''}`,
  input: (name?: string) => `input${name ? `-${name}` : ''}`,
  modal: (id?: string) => `modal${id ? `-${id}` : ''}`,
  // Add more as needed
};

/**
 * Accessibility testing helpers
 */
export const a11y = {
  /**
   * Check if element is accessible
   */
  isAccessible: (element: HTMLElement): boolean => {
    const hasRole = element.hasAttribute('role');
    const hasAriaLabel = element.hasAttribute('aria-label');
    const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
    const hasTextContent = element.textContent !== '';
    
    return hasRole || hasAriaLabel || hasAriaLabelledBy || hasTextContent;
  },
  
  /**
   * Check if element is keyboard navigable
   */
  isKeyboardNavigable: (element: HTMLElement): boolean => {
    const tabIndex = element.getAttribute('tabindex');
    const isNaturallyFocusable = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(
      element.tagName
    );
    
    return isNaturallyFocusable || (tabIndex !== null && parseInt(tabIndex) >= 0);
  },
};

/**
 * Mock data generators
 */
export const mockData = {
  user: (overrides = {}) => ({
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    ...overrides,
  }),
  
  item: (overrides = {}) => ({
    id: '1',
    title: 'Test Item',
    description: 'Test Description',
    ...overrides,
  }),
};
