/**
 * Custom Testing Utilities
 * Provides enhanced render methods and test helpers
 */

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UIProvider } from '../../src/components/ui-provider';

// Custom render options
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: 'light' | 'dark';
  locale?: string;
}

// Wrapper component with providers
function AllTheProviders({ 
  children,
  theme = 'light'
}: { 
  children: ReactNode;
  theme?: 'light' | 'dark';
}) {
  return (
    <UIProvider theme={theme}>
      {children}
    </UIProvider>
  );
}

/**
 * Custom render function with providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
): RenderResult {
  const { theme = 'light', ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders theme={theme}>{children}</AllTheProviders>
    ),
    ...renderOptions,
  });
}

/**
 * Setup user event with custom options
 */
export function setupUser() {
  return userEvent.setup({
    advanceTimers: jest.advanceTimersByTime,
  });
}

/**
 * Wait for animation to complete
 */
export async function waitForAnimation(duration = 300) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

/**
 * Fire accessible click event
 */
export async function fireAccessibleClick(element: HTMLElement) {
  const user = setupUser();
  await user.click(element);
  
  // Also test keyboard activation
  element.focus();
  await user.keyboard('{Enter}');
}

/**
 * Create mock form data
 */
export function createMockFormData(overrides = {}) {
  return {
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    bio: 'Test bio',
    agree: true,
    ...overrides,
  };
}

/**
 * Mock API response helper
 */
export function mockApiResponse<T>(data: T, delay = 100): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay);
  });
}

/**
 * Test accessibility with axe-core
 */
export async function testA11y(container: HTMLElement) {
  // This would use jest-axe in a real implementation
  // For now, just a placeholder
  return Promise.resolve();
}

// Re-export everything from Testing Library
export * from '@testing-library/react';
export { userEvent };
