import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from './index';

describe('Switch Component', () => {
  describe('Rendering', () => {
    it('renders correctly without label', () => {
      render(<Switch />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeInTheDocument();
    });

    it('renders with label when provided', () => {
      render(<Switch label="Toggle feature" />);
      expect(screen.getByText('Toggle feature')).toBeInTheDocument();
    });

    it('associates label with switch for accessibility', () => {
      render(<Switch label="Dark mode" />);
      const switchElement = screen.getByRole('switch');
      const label = screen.getByText('Dark mode');
      expect(switchElement).toBeInTheDocument();
      expect(label).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Switch className="custom-switch" />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('custom-switch');
    });
  });

  describe('Interactions', () => {
    it('toggles state when clicked', async () => {
      const user = userEvent.setup();
      render(<Switch />);
      const switchElement = screen.getByRole('switch');
      
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
      
      await user.click(switchElement);
      expect(switchElement).toHaveAttribute('data-state', 'checked');
      
      await user.click(switchElement);
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
    });

    it('calls onCheckedChange callback when toggled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(<Switch onCheckedChange={handleChange} />);
      const switchElement = screen.getByRole('switch');
      
      await user.click(switchElement);
      expect(handleChange).toHaveBeenCalledWith(true);
      
      await user.click(switchElement);
      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it('toggles when label is clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(<Switch label="Click me" onCheckedChange={handleChange} />);
      const label = screen.getByText('Click me');
      
      await user.click(label);
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Controlled State', () => {
    it('respects checked prop when controlled', () => {
      const { rerender } = render(<Switch checked={false} />);
      const switchElement = screen.getByRole('switch');
      
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
      
      rerender(<Switch checked={true} />);
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });

    it('does not toggle when controlled without onChange', async () => {
      const user = userEvent.setup();
      render(<Switch checked={false} />);
      const switchElement = screen.getByRole('switch');
      
      await user.click(switchElement);
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
    });
  });

  describe('Disabled State', () => {
    it('supports disabled state', () => {
      render(<Switch disabled />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeDisabled();
    });

    it('does not toggle when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(<Switch disabled onCheckedChange={handleChange} />);
      const switchElement = screen.getByRole('switch');
      
      await user.click(switchElement);
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('maintains visual disabled state with label', () => {
      render(<Switch disabled label="Disabled switch" />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeDisabled();
      expect(screen.getByText('Disabled switch')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes when unchecked', () => {
      render(<Switch />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });

    it('has correct ARIA attributes when checked', () => {
      render(<Switch checked={true} />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('can be toggled using keyboard', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(<Switch onCheckedChange={handleChange} />);
      const switchElement = screen.getByRole('switch');
      
      switchElement.focus();
      await user.keyboard(' ');
      expect(handleChange).toHaveBeenCalledWith(true);
      
      await user.keyboard(' ');
      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it('supports aria-label', () => {
      render(<Switch aria-label="Toggle dark mode" />);
      const switchElement = screen.getByLabelText('Toggle dark mode');
      expect(switchElement).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <div>
          <Switch aria-describedby="help-text" />
          <span id="help-text">This toggles the feature on and off</span>
        </div>
      );
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-describedby', 'help-text');
    });
  });

  describe('Styling', () => {
    it('applies correct default styles', () => {
      render(<Switch />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('relative', 'h-6', 'w-10', 'cursor-pointer', 'rounded-full');
    });

    it('applies checked state styles', () => {
      render(<Switch checked={true} />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });

    it('merges custom className with default styles', () => {
      render(<Switch className="bg-blue-500" />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('bg-blue-500');
      expect(switchElement).toHaveClass('relative', 'h-6', 'w-10');
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid clicks correctly', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(<Switch onCheckedChange={handleChange} />);
      const switchElement = screen.getByRole('switch');
      
      await user.tripleClick(switchElement);
      
      // Should have been called 3 times
      expect(handleChange).toHaveBeenCalledTimes(3);
    });

    it('renders correctly with empty label', () => {
      render(<Switch label="" />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeInTheDocument();
    });

    it('handles defaultChecked prop', () => {
      render(<Switch defaultChecked={true} />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<Switch ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });
});
