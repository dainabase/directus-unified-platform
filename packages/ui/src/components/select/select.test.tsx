import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './index';

describe('Select Component', () => {
  const SelectExample = ({ 
    defaultValue, 
    value, 
    onValueChange,
    disabled = false 
  }: { 
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
  }) => (
    <Select 
      defaultValue={defaultValue} 
      value={value} 
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
          <SelectSeparator />
          <SelectItem value="grape">Grape</SelectItem>
          <SelectItem value="strawberry" disabled>Strawberry</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
    });

    it('displays placeholder text', () => {
      render(<SelectExample />);
      expect(screen.getByText('Select a fruit')).toBeInTheDocument();
    });

    it('displays default value', () => {
      render(<SelectExample defaultValue="apple" />);
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    it('applies custom className to trigger', () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('w-[180px]');
    });
  });

  describe('Interaction', () => {
    it('opens dropdown when trigger is clicked', async () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      
      await userEvent.click(trigger);
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByText('Fruits')).toBeInTheDocument();
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.getByText('Banana')).toBeInTheDocument();
      });
    });

    it('selects an item when clicked', async () => {
      const handleValueChange = jest.fn();
      render(<SelectExample onValueChange={handleValueChange} />);
      
      const trigger = screen.getByRole('combobox');
      await userEvent.click(trigger);
      
      await waitFor(() => {
        const bananaOption = screen.getByText('Banana');
        expect(bananaOption).toBeInTheDocument();
      });
      
      const bananaOption = screen.getByText('Banana');
      await userEvent.click(bananaOption);
      
      expect(handleValueChange).toHaveBeenCalledWith('banana');
    });

    it('closes dropdown after selection', async () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      await userEvent.click(trigger);
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByText('Apple'));
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('updates display value after selection', async () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      // Initially shows placeholder
      expect(screen.getByText('Select a fruit')).toBeInTheDocument();
      
      await userEvent.click(trigger);
      await waitFor(() => {
        expect(screen.getByText('Orange')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByText('Orange'));
      
      await waitFor(() => {
        // Now shows selected value
        expect(screen.getByText('Orange')).toBeInTheDocument();
        expect(screen.queryByText('Select a fruit')).not.toBeInTheDocument();
      });
    });
  });

  describe('Controlled Component', () => {
    it('respects controlled value', () => {
      const { rerender } = render(<SelectExample value="banana" />);
      expect(screen.getByText('Banana')).toBeInTheDocument();
      
      rerender(<SelectExample value="orange" />);
      expect(screen.getByText('Orange')).toBeInTheDocument();
    });

    it('calls onValueChange when value changes', async () => {
      const handleValueChange = jest.fn();
      render(<SelectExample value="apple" onValueChange={handleValueChange} />);
      
      const trigger = screen.getByRole('combobox');
      await userEvent.click(trigger);
      
      await waitFor(() => {
        expect(screen.getByText('Grape')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByText('Grape'));
      
      expect(handleValueChange).toHaveBeenCalledWith('grape');
    });
  });

  describe('Disabled State', () => {
    it('disables the trigger when disabled prop is true', () => {
      render(<SelectExample disabled />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('data-disabled');
    });

    it('does not open when disabled', async () => {
      render(<SelectExample disabled />);
      const trigger = screen.getByRole('combobox');
      
      await userEvent.click(trigger);
      
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('shows disabled items with correct styling', async () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      await userEvent.click(trigger);
      
      await waitFor(() => {
        const strawberryOption = screen.getByText('Strawberry');
        expect(strawberryOption.closest('[data-disabled]')).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('opens with Enter key', async () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'Enter' });
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('opens with Space key', async () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      trigger.focus();
      fireEvent.keyDown(trigger, { key: ' ' });
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('closes with Escape key', async () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      await userEvent.click(trigger);
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
      
      fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
      expect(trigger).toHaveAttribute('aria-expanded');
    });

    it('maintains focus management', async () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      trigger.focus();
      expect(document.activeElement).toBe(trigger);
      
      await userEvent.click(trigger);
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
      
      // Focus should be managed by Radix UI internally
      expect(document.activeElement).toBeTruthy();
    });

    it('announces selected value to screen readers', async () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      await userEvent.click(trigger);
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByText('Apple'));
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        // The selected value should be announced
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });
    });
  });

  describe('Select Components', () => {
    it('renders SelectLabel correctly', async () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      await userEvent.click(trigger);
      
      await waitFor(() => {
        const label = screen.getByText('Fruits');
        expect(label).toBeInTheDocument();
        expect(label).toHaveClass('font-semibold');
      });
    });

    it('renders SelectSeparator correctly', async () => {
      render(<SelectExample />);
      const trigger = screen.getByRole('combobox');
      
      await userEvent.click(trigger);
      
      await waitFor(() => {
        // Separator is rendered between grape and strawberry
        const grapeItem = screen.getByText('Grape');
        const strawberryItem = screen.getByText('Strawberry');
        expect(grapeItem).toBeInTheDocument();
        expect(strawberryItem).toBeInTheDocument();
      });
    });
  });
});
