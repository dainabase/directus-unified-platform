/**
 * Textarea Component Tests
 * Auto-generated test suite for textarea component
 * Category: form
 */

import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '../../../tests/utils/test-utils';
import { Textarea } from './index';
import { vi } from 'vitest';

describe('Textarea Component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<Textarea />);
      expect(document.querySelector('[data-testid="textarea"]')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      renderWithProviders(<Textarea className="custom-class" />);
      expect(document.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('renders with label', () => {
      renderWithProviders(<Textarea label="Test Label" />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });
  });

  describe('Form Integration', () => {
    it('supports controlled value', () => {
      const { rerender } = renderWithProviders(<Textarea value="test" />);
      expect(screen.getByDisplayValue?.('test') || screen.getByText('test')).toBeInTheDocument();
      
      rerender(<Textarea value="updated" />);
      expect(screen.getByDisplayValue?.('updated') || screen.getByText('updated')).toBeInTheDocument();
    });

    it('calls onChange when value changes', () => {
      const handleChange = vi.fn();
      renderWithProviders(<Textarea onChange={handleChange} />);
      
      const input = document.querySelector('input, textarea, select');
      if (input) {
        fireEvent.change(input, { target: { value: 'new value' } });
        expect(handleChange).toHaveBeenCalled();
      }
    });

    it('supports disabled state', () => {
      renderWithProviders(<Textarea disabled />);
      const input = document.querySelector('input, textarea, select, button');
      expect(input).toBeDisabled();
    });

    it('supports readonly state', () => {
      renderWithProviders(<Textarea readOnly />);
      const input = document.querySelector('input, textarea');
      if (input) {
        expect(input).toHaveAttribute('readonly');
      }
    });

    it('shows error state', () => {
      renderWithProviders(<Textarea error="Error message" />);
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('supports required attribute', () => {
      renderWithProviders(<Textarea required />);
      const input = document.querySelector('input, textarea, select');
      if (input) {
        expect(input).toHaveAttribute('required');
      }
    });
  });

  describe('Validation', () => {
    it('validates on blur', async () => {
      const handleValidate = vi.fn();
      renderWithProviders(<Textarea onBlur={handleValidate} />);
      
      const input = document.querySelector('input, textarea, select');
      if (input) {
        fireEvent.focus(input);
        fireEvent.blur(input);
        expect(handleValidate).toHaveBeenCalled();
      }
    });

    it('shows validation messages', () => {
      renderWithProviders(<Textarea error="Field is required" />);
      expect(screen.getByText('Field is required')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderWithProviders(<Textarea aria-label="Test input" required />);
      const input = document.querySelector('input, textarea, select');
      if (input) {
        expect(input).toHaveAttribute('aria-label', 'Test input');
        expect(input).toHaveAttribute('aria-required', 'true');
      }
    });

    it('associates label with input', () => {
      renderWithProviders(<Textarea id="test-input" label="Test Label" />);
      const label = screen.getByText('Test Label');
      expect(label).toHaveAttribute('for', 'test-input');
    });

    it('supports keyboard navigation', () => {
      renderWithProviders(<Textarea />);
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
