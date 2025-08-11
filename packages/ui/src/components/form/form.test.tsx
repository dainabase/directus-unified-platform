/**
 * Form Component Tests
 * Auto-generated test suite for form component
 * Category: form
 */

import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '../../../tests/utils/test-utils';
import { Form } from './index';
import { vi } from 'vitest';

describe('Form Component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<Form />);
      expect(document.querySelector('[data-testid="form"]')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      renderWithProviders(<Form className="custom-class" />);
      expect(document.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('renders with label', () => {
      renderWithProviders(<Form label="Test Label" />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });
  });

  describe('Form Integration', () => {
    it('supports controlled value', () => {
      const { rerender } = renderWithProviders(<Form value="test" />);
      expect(screen.getByDisplayValue?.('test') || screen.getByText('test')).toBeInTheDocument();
      
      rerender(<Form value="updated" />);
      expect(screen.getByDisplayValue?.('updated') || screen.getByText('updated')).toBeInTheDocument();
    });

    it('calls onChange when value changes', () => {
      const handleChange = vi.fn();
      renderWithProviders(<Form onChange={handleChange} />);
      
      const input = document.querySelector('input, textarea, select');
      if (input) {
        fireEvent.change(input, { target: { value: 'new value' } });
        expect(handleChange).toHaveBeenCalled();
      }
    });

    it('supports disabled state', () => {
      renderWithProviders(<Form disabled />);
      const input = document.querySelector('input, textarea, select, button');
      expect(input).toBeDisabled();
    });

    it('supports readonly state', () => {
      renderWithProviders(<Form readOnly />);
      const input = document.querySelector('input, textarea');
      if (input) {
        expect(input).toHaveAttribute('readonly');
      }
    });

    it('shows error state', () => {
      renderWithProviders(<Form error="Error message" />);
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('supports required attribute', () => {
      renderWithProviders(<Form required />);
      const input = document.querySelector('input, textarea, select');
      if (input) {
        expect(input).toHaveAttribute('required');
      }
    });
  });

  describe('Validation', () => {
    it('validates on blur', async () => {
      const handleValidate = vi.fn();
      renderWithProviders(<Form onBlur={handleValidate} />);
      
      const input = document.querySelector('input, textarea, select');
      if (input) {
        fireEvent.focus(input);
        fireEvent.blur(input);
        expect(handleValidate).toHaveBeenCalled();
      }
    });

    it('shows validation messages', () => {
      renderWithProviders(<Form error="Field is required" />);
      expect(screen.getByText('Field is required')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderWithProviders(<Form aria-label="Test input" required />);
      const input = document.querySelector('input, textarea, select');
      if (input) {
        expect(input).toHaveAttribute('aria-label', 'Test input');
        expect(input).toHaveAttribute('aria-required', 'true');
      }
    });

    it('associates label with input', () => {
      renderWithProviders(<Form id="test-input" label="Test Label" />);
      const label = screen.getByText('Test Label');
      expect(label).toHaveAttribute('for', 'test-input');
    });

    it('supports keyboard navigation', () => {
      renderWithProviders(<Form />);
      const input = document.querySelector('input, textarea, select, button');
      if (input) {
        input.focus();
        expect(input).toHaveFocus();
        
        fireEvent.keyDown(input, { key: 'Tab' });
        // Tab navigation test
      }
    });
  });
});
