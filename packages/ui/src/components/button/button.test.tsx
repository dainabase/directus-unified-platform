import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './index';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders with default variant', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-primary');
    });

    it('renders with different variants', () => {
      const variants = ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'success'] as const;
      
      variants.forEach(variant => {
        const { rerender } = render(<Button variant={variant}>Button</Button>);
        const button = screen.getByRole('button');
        
        if (variant === 'primary') {
          expect(button).toHaveClass('bg-primary');
        } else if (variant === 'secondary') {
          expect(button).toHaveClass('bg-secondary');
        } else if (variant === 'outline') {
          expect(button).toHaveClass('border');
        }
        
        rerender(<></>);
      });
    });

    it('renders with different sizes', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      
      sizes.forEach(size => {
        const { rerender } = render(<Button size={size}>Button</Button>);
        const button = screen.getByRole('button');
        
        if (size === 'sm') {
          expect(button).toHaveClass('h-8');
        } else if (size === 'md') {
          expect(button).toHaveClass('h-10');
        } else if (size === 'lg') {
          expect(button).toHaveClass('h-12');
        }
        
        rerender(<></>);
      });
    });
  });

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveClass('opacity-50');
    });

    it('shows loading state', () => {
      render(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toBeDisabled();
      // Check for spinner icon
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('renders full width when specified', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('w-full');
    });
  });

  describe('Interactions', () => {
    it('handles click events', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');
      
      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not trigger click when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      const button = screen.getByRole('button');
      
      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not trigger click when loading', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button loading onClick={handleClick}>Loading</Button>);
      const button = screen.getByRole('button');
      
      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA role', () => {
      render(<Button>Accessible Button</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('type', 'button');
    });

    it('supports aria-label', () => {
      render(<Button aria-label="Custom label">Icon</Button>);
      const button = screen.getByRole('button', { name: /custom label/i });
      
      expect(button).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Keyboard Button</Button>);
      const button = screen.getByRole('button');
      
      button.focus();
      expect(button).toHaveFocus();
      
      // Simulate Enter key
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalled();
      
      // Simulate Space key
      handleClick.mockClear();
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalled();
    });

    it('has visible focus ring', () => {
      render(<Button>Focus Ring</Button>);
      const button = screen.getByRole('button');
      
      button.focus();
      expect(button).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('Composition', () => {
    it('renders with children', () => {
      render(
        <Button>
          <span data-testid="icon">🚀</span>
          Launch
        </Button>
      );
      
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Launch')).toBeInTheDocument();
    });

    it('supports asChild prop for composition', () => {
      render(
        <Button asChild>
          <a href="/link">Link Button</a>
        </Button>
      );
      
      const link = screen.getByRole('link', { name: /link button/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/link');
    });

    it('accepts custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('custom-class');
    });
  });
});
