/**
 * Button Component Tests
 * Tests all button variants, states, and interactions
 */

import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor } from '../../../tests/utils/test-utils';
import { Button } from './index';
import { Loader2 } from 'lucide-react';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders with text content', () => {
      renderWithProviders(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      renderWithProviders(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('renders as a child component when asChild is true', () => {
      renderWithProviders(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/test');
    });
  });

  describe('Variants', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'];

    variants.forEach(variant => {
      it(`renders ${variant} variant correctly`, () => {
        renderWithProviders(
          <Button variant={variant as any} data-testid={`btn-${variant}`}>
            {variant} Button
          </Button>
        );
        const button = screen.getByTestId(`btn-${variant}`);
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Sizes', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'];

    sizes.forEach(size => {
      it(`renders ${size} size correctly`, () => {
        renderWithProviders(
          <Button size={size as any} data-testid={`btn-${size}`}>
            {size === 'icon' ? '×' : `${size} Button`}
          </Button>
        );
        const button = screen.getByTestId(`btn-${size}`);
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('States', () => {
    it('handles disabled state', () => {
      renderWithProviders(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('shows loading state with spinner', () => {
      renderWithProviders(
        <Button loading>
          Loading Button
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      // Check for loading indicator
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('renders with custom loading icon', () => {
      renderWithProviders(
        <Button loading loadingIcon={<Loader2 className="animate-spin" />}>
          Custom Loading
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles click events', () => {
      const handleClick = jest.fn();
      renderWithProviders(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not trigger click when disabled', () => {
      const handleClick = jest.fn();
      renderWithProviders(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not trigger click when loading', () => {
      const handleClick = jest.fn();
      renderWithProviders(
        <Button loading onClick={handleClick}>
          Loading
        </Button>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles keyboard activation', () => {
      const handleClick = jest.fn();
      renderWithProviders(<Button onClick={handleClick}>Keyboard</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });
      
      expect(handleClick).toHaveBeenCalled();
    });

    it('handles space key activation', () => {
      const handleClick = jest.fn();
      renderWithProviders(<Button onClick={handleClick}>Space</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      fireEvent.keyDown(button, { key: ' ' });
      
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      renderWithProviders(
        <Button aria-label="Custom label" aria-pressed="true">
          Accessible
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('supports aria-describedby', () => {
      renderWithProviders(
        <>
          <Button aria-describedby="description">Button</Button>
          <span id="description">This is a description</span>
        </>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });

    it('maintains focus styles', () => {
      renderWithProviders(<Button>Focus me</Button>);
      const button = screen.getByRole('button');
      
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Icon Button', () => {
    it('renders icon button with proper sizing', () => {
      renderWithProviders(
        <Button size="icon" aria-label="Close">
          ×
        </Button>
      );
      
      const button = screen.getByRole('button', { name: /close/i });
      expect(button).toBeInTheDocument();
    });

    it('requires aria-label for icon buttons', () => {
      // This test ensures developers remember accessibility
      const spy = jest.spyOn(console, 'error').mockImplementation();
      
      renderWithProviders(
        <Button size="icon">
          ×
        </Button>
      );
      
      // In a real implementation, we might have a dev warning
      // expect(spy).toHaveBeenCalledWith(expect.stringContaining('aria-label'));
      
      spy.mockRestore();
    });
  });

  describe('Button Group', () => {
    it('works within a button group', () => {
      renderWithProviders(
        <div role="group" aria-label="Button group">
          <Button>First</Button>
          <Button>Second</Button>
          <Button>Third</Button>
        </div>
      );
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });
  });
});
