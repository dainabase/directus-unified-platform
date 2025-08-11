/**
 * DropdownMenu Component Tests
 * Auto-generated test suite for dropdown-menu component
 * Category: interactive
 */

import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '../../../tests/utils/test-utils';
import { DropdownMenu } from './index';
import { vi } from 'vitest';

describe('DropdownMenu Component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<DropdownMenu />);
      expect(document.querySelector('[role="button"], [data-testid="dropdown-menu"]')).toBeInTheDocument();
    });

    it('renders with label', () => {
      renderWithProviders(<DropdownMenu label="Click me" />);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderWithProviders(<DropdownMenu className="custom-interactive" />);
      expect(document.querySelector('.custom-interactive')).toBeInTheDocument();
    });
  });

  describe('Interaction States', () => {
    it('handles hover state', () => {
      renderWithProviders(<DropdownMenu />);
      const element = document.querySelector('[role="button"]');
      
      fireEvent.mouseEnter(element);
      expect(element).toHaveClass('hover');
      
      fireEvent.mouseLeave(element);
      expect(element).not.toHaveClass('hover');
    });

    it('handles focus state', () => {
      renderWithProviders(<DropdownMenu />);
      const element = document.querySelector('[role="button"]');
      
      element.focus();
      expect(element).toHaveFocus();
      expect(element).toHaveClass('focus');
    });

    it('handles active/pressed state', () => {
      renderWithProviders(<DropdownMenu />);
      const element = document.querySelector('[role="button"]');
      
      fireEvent.mouseDown(element);
      expect(element).toHaveClass('active');
      
      fireEvent.mouseUp(element);
      expect(element).not.toHaveClass('active');
    });

    it('handles disabled state', () => {
      renderWithProviders(<DropdownMenu disabled />);
      const element = document.querySelector('[role="button"]');
      
      expect(element).toBeDisabled();
      expect(element).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Click Handling', () => {
    it('triggers onClick handler', () => {
      const handleClick = vi.fn();
      renderWithProviders(<DropdownMenu onClick={handleClick} />);
      
      const element = document.querySelector('[role="button"]');
      fireEvent.click(element);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('prevents click when disabled', () => {
      const handleClick = vi.fn();
      renderWithProviders(<DropdownMenu disabled onClick={handleClick} />);
      
      const element = document.querySelector('[role="button"]');
      fireEvent.click(element);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles double click', () => {
      const handleDoubleClick = vi.fn();
      renderWithProviders(<DropdownMenu onDoubleClick={handleDoubleClick} />);
      
      const element = document.querySelector('[role="button"]');
      fireEvent.doubleClick(element);
      
      expect(handleDoubleClick).toHaveBeenCalled();
    });
  });

  describe('Keyboard Interaction', () => {
    it('triggers action on Enter key', () => {
      const handleAction = vi.fn();
      renderWithProviders(<DropdownMenu onClick={handleAction} />);
      
      const element = document.querySelector('[role="button"]');
      element.focus();
      fireEvent.keyDown(element, { key: 'Enter' });
      
      expect(handleAction).toHaveBeenCalled();
    });

    it('triggers action on Space key', () => {
      const handleAction = vi.fn();
      renderWithProviders(<DropdownMenu onClick={handleAction} />);
      
      const element = document.querySelector('[role="button"]');
      element.focus();
      fireEvent.keyDown(element, { key: ' ' });
      
      expect(handleAction).toHaveBeenCalled();
    });

    it('supports keyboard navigation', () => {
      renderWithProviders(
        <>
          <DropdownMenu />
          <DropdownMenu />
          <DropdownMenu />
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
      renderWithProviders(<DropdownMenu aria-label="Interactive element" />);
      const element = document.querySelector('[role="button"]');
      
      expect(element).toHaveAttribute('aria-label', 'Interactive element');
      expect(element).toHaveAttribute('tabindex', '0');
    });

    it('announces state changes', () => {
      const { rerender } = renderWithProviders(<DropdownMenu pressed={false} />);
      const element = document.querySelector('[role="button"]');
      
      expect(element).toHaveAttribute('aria-pressed', 'false');
      
      rerender(<DropdownMenu pressed={true} />);
      expect(element).toHaveAttribute('aria-pressed', 'true');
    });

    it('supports custom key bindings', () => {
      const handleShortcut = vi.fn();
      renderWithProviders(<DropdownMenu onShortcut={handleShortcut} shortcut="ctrl+s" />);
      
      fireEvent.keyDown(document.body, { key: 's', ctrlKey: true });
      expect(handleShortcut).toHaveBeenCalled();
    });
  });
});
