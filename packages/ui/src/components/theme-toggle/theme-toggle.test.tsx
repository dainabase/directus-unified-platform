/**
 * ThemeToggle Component Tests
 * Auto-generated test suite for theme-toggle component
 * Category: interactive
 */

import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '../../../tests/utils/test-utils';
import { ThemeToggle } from './index';
import { vi } from 'vitest';

describe('ThemeToggle Component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<ThemeToggle />);
      expect(document.querySelector('[role="button"], [data-testid="theme-toggle"]')).toBeInTheDocument();
    });

    it('renders with label', () => {
      renderWithProviders(<ThemeToggle label="Click me" />);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderWithProviders(<ThemeToggle className="custom-interactive" />);
      expect(document.querySelector('.custom-interactive')).toBeInTheDocument();
    });
  });

  describe('Interaction States', () => {
    it('handles hover state', () => {
      renderWithProviders(<ThemeToggle />);
      const element = document.querySelector('[role="button"]');
      
      fireEvent.mouseEnter(element);
      expect(element).toHaveClass('hover');
      
      fireEvent.mouseLeave(element);
      expect(element).not.toHaveClass('hover');
    });

    it('handles focus state', () => {
      renderWithProviders(<ThemeToggle />);
      const element = document.querySelector('[role="button"]');
      
      element.focus();
      expect(element).toHaveFocus();
      expect(element).toHaveClass('focus');
    });

    it('handles active/pressed state', () => {
      renderWithProviders(<ThemeToggle />);
      const element = document.querySelector('[role="button"]');
      
      fireEvent.mouseDown(element);
      expect(element).toHaveClass('active');
      
      fireEvent.mouseUp(element);
      expect(element).not.toHaveClass('active');
    });

    it('handles disabled state', () => {
      renderWithProviders(<ThemeToggle disabled />);
      const element = document.querySelector('[role="button"]');
      
      expect(element).toBeDisabled();
      expect(element).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Click Handling', () => {
    it('triggers onClick handler', () => {
      const handleClick = vi.fn();
      renderWithProviders(<ThemeToggle onClick={handleClick} />);
      
      const element = document.querySelector('[role="button"]');
      fireEvent.click(element);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('prevents click when disabled', () => {
      const handleClick = vi.fn();
      renderWithProviders(<ThemeToggle disabled onClick={handleClick} />);
      
      const element = document.querySelector('[role="button"]');
      fireEvent.click(element);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles double click', () => {
      const handleDoubleClick = vi.fn();
      renderWithProviders(<ThemeToggle onDoubleClick={handleDoubleClick} />);
      
      const element = document.querySelector('[role="button"]');
      fireEvent.doubleClick(element);
      
      expect(handleDoubleClick).toHaveBeenCalled();
    });
  });

  describe('Keyboard Interaction', () => {
    it('triggers action on Enter key', () => {
      const handleAction = vi.fn();
      renderWithProviders(<ThemeToggle onClick={handleAction} />);
      
      const element = document.querySelector('[role="button"]');
      element.focus();
      fireEvent.keyDown(element, { key: 'Enter' });
      
      expect(handleAction).toHaveBeenCalled();
    });

    it('triggers action on Space key', () => {
      const handleAction = vi.fn();
      renderWithProviders(<ThemeToggle onClick={handleAction} />);
      
      const element = document.querySelector('[role="button"]');
      element.focus();
      fireEvent.keyDown(element, { key: ' ' });
      
      expect(handleAction).toHaveBeenCalled();
    });

    it('supports keyboard navigation', () => {
      renderWithProviders(
        <>
          <ThemeToggle />
          <ThemeToggle />
          <ThemeToggle />
        </>
      );
      
      const elements = document.querySelectorAll('[role="button"]');
      elements[0].focus();
      
      fireEvent.keyDown(elements[0], { key: 'Tab' });
      expect(elements[1]).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderWithProviders(<ThemeToggle aria-label="Interactive element" />);
      const element = document.querySelector('[role="button"]');
      
      expect(element).toHaveAttribute('aria-label', 'Interactive element');
      expect(element).toHaveAttribute('tabindex', '0');
    });

    it('announces state changes', () => {
      const { rerender } = renderWithProviders(<ThemeToggle pressed={false} />);
      const element = document.querySelector('[role="button"]');
      
      expect(element).toHaveAttribute('aria-pressed', 'false');
      
      rerender(<ThemeToggle pressed={true} />);
      expect(element).toHaveAttribute('aria-pressed', 'true');
    });

    it('supports custom key bindings', () => {
      const handleShortcut = vi.fn();
      renderWithProviders(<ThemeToggle onShortcut={handleShortcut} shortcut="ctrl+s" />);
      
      fireEvent.keyDown(document.body, { key: 's', ctrlKey: true });
      expect(handleShortcut).toHaveBeenCalled();
    });
  });
});
