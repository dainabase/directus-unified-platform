import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Rating } from './rating';

describe('Rating', () => {
  it('renders correct number of icons', () => {
    render(<Rating max={5} />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
  });

  it('displays default value correctly', () => {
    render(<Rating defaultValue={3} max={5} />);
    
    const buttons = screen.getAllByRole('button');
    // First 3 should be filled (check by class or aria)
    expect(buttons[0]).toHaveAttribute('aria-label', 'Rate 1 out of 5');
    expect(buttons[2]).toHaveAttribute('aria-label', 'Rate 3 out of 5');
  });

  it('handles click to change rating', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    
    render(
      <Rating
        defaultValue={2}
        max={5}
        onValueChange={onValueChange}
      />
    );
    
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[3]); // Click 4th star
    
    expect(onValueChange).toHaveBeenCalledWith(4);
  });

  it('clears rating when clicking current value', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    
    render(
      <Rating
        defaultValue={3}
        max={5}
        onValueChange={onValueChange}
      />
    );
    
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[2]); // Click 3rd star (current value)
    
    expect(onValueChange).toHaveBeenCalledWith(0);
  });

  it('handles hover events', async () => {
    const onHoverChange = vi.fn();
    const user = userEvent.setup();
    
    render(
      <Rating
        defaultValue={2}
        max={5}
        onHoverChange={onHoverChange}
      />
    );
    
    const buttons = screen.getAllByRole('button');
    
    await user.hover(buttons[3]);
    expect(onHoverChange).toHaveBeenCalledWith(4);
    
    await user.unhover(buttons[3]);
    expect(onHoverChange).toHaveBeenCalledWith(null);
  });

  it('shows label when showLabel is true', () => {
    render(
      <Rating
        defaultValue={3}
        max={5}
        showLabel
      />
    );
    
    expect(screen.getByText('3 / 5')).toBeInTheDocument();
  });

  it('shows custom labels', () => {
    render(
      <Rating
        defaultValue={2}
        max={3}
        showLabel
        labels={['Bad', 'Good', 'Excellent']}
      />
    );
    
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  it('respects readOnly prop', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    
    render(
      <Rating
        value={3}
        max={5}
        readOnly
        onValueChange={onValueChange}
      />
    );
    
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);
    
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('respects disabled prop', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    
    render(
      <Rating
        defaultValue={3}
        max={5}
        disabled
        onValueChange={onValueChange}
      />
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
    
    await user.click(buttons[0]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('handles controlled value', () => {
    const { rerender } = render(
      <Rating value={2} max={5} />
    );
    
    let buttons = screen.getAllByRole('button');
    expect(buttons[1]).toHaveAttribute('aria-label', 'Rate 2 out of 5');
    
    rerender(<Rating value={4} max={5} />);
    
    buttons = screen.getAllByRole('button');
    expect(buttons[3]).toHaveAttribute('aria-label', 'Rate 4 out of 5');
  });

  it('applies size classes correctly', () => {
    const { container } = render(
      <Rating defaultValue={3} max={5} size="lg" />
    );
    
    const icons = container.querySelectorAll('svg');
    expect(icons[0]).toHaveClass('h-6', 'w-6');
  });

  it('applies color classes correctly', () => {
    const { container } = render(
      <Rating defaultValue={3} max={5} color="danger" />
    );
    
    const icons = container.querySelectorAll('svg');
    // First 3 icons should have danger color
    expect(icons[0]).toHaveClass('text-red-500');
  });

  it('supports custom max values', () => {
    render(<Rating max={10} />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(10);
  });

  it('handles half ratings when allowHalf is true', () => {
    render(
      <Rating
        defaultValue={2.5}
        max={5}
        allowHalf
        showLabel
      />
    );
    
    expect(screen.getByText('2.5 / 5')).toBeInTheDocument();
  });
});