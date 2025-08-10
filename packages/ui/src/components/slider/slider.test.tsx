import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Slider } from './slider';

describe('Slider', () => {
  it('renders correctly', () => {
    render(<Slider defaultValue={[50]} max={100} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('aria-valuenow', '50');
    expect(slider).toHaveAttribute('aria-valuemax', '100');
  });

  it('handles value change', () => {
    const onValueChange = vi.fn();
    render(
      <Slider
        defaultValue={[50]}
        max={100}
        onValueChange={onValueChange}
      />
    );

    const slider = screen.getByRole('slider');
    
    // Simulate dragging slider
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onValueChange).toHaveBeenCalled();
  });

  it('respects min and max values', () => {
    render(
      <Slider
        defaultValue={[5]}
        min={0}
        max={10}
      />
    );

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '10');
    expect(slider).toHaveAttribute('aria-valuenow', '5');
  });

  it('handles step prop correctly', () => {
    const onValueChange = vi.fn();
    render(
      <Slider
        defaultValue={[0]}
        max={100}
        step={10}
        onValueChange={onValueChange}
      />
    );

    const slider = screen.getByRole('slider');
    
    // Arrow right should increase by step value
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onValueChange).toHaveBeenLastCalledWith([10]);
  });

  it('shows value when showValue is true', () => {
    render(
      <Slider
        defaultValue={[50]}
        max={100}
        showValue
      />
    );

    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('formats value with custom formatter', () => {
    render(
      <Slider
        defaultValue={[50]}
        max={100}
        showValue
        formatValue={(v) => `${v}%`}
      />
    );

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders marks when provided', () => {
    render(
      <Slider
        defaultValue={[50]}
        max={100}
        marks={[
          { value: 0, label: 'Start' },
          { value: 50, label: 'Middle' },
          { value: 100, label: 'End' },
        ]}
      />
    );

    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Middle')).toBeInTheDocument();
    expect(screen.getByText('End')).toBeInTheDocument();
  });

  it('handles range values', () => {
    render(
      <Slider
        defaultValue={[25, 75]}
        max={100}
      />
    );

    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(2);
    expect(sliders[0]).toHaveAttribute('aria-valuenow', '25');
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '75');
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <Slider
        defaultValue={[50]}
        max={100}
        disabled
      />
    );

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-disabled', 'true');
  });

  it('applies variant styles', () => {
    const { container } = render(
      <Slider
        defaultValue={[50]}
        max={100}
        variant="success"
      />
    );

    const range = container.querySelector('[data-orientation="horizontal"] span');
    expect(range).toHaveClass('bg-green-500');
  });

  it('handles keyboard navigation', () => {
    const onValueChange = vi.fn();
    render(
      <Slider
        defaultValue={[50]}
        max={100}
        onValueChange={onValueChange}
      />
    );

    const slider = screen.getByRole('slider');
    
    // Test arrow keys
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onValueChange).toHaveBeenCalledWith([51]);
    
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(onValueChange).toHaveBeenCalled();
    
    fireEvent.keyDown(slider, { key: 'ArrowUp' });
    expect(onValueChange).toHaveBeenCalled();
    
    fireEvent.keyDown(slider, { key: 'ArrowDown' });
    expect(onValueChange).toHaveBeenCalled();
  });

  it('updates when controlled value changes', () => {
    const { rerender } = render(
      <Slider value={[25]} max={100} />
    );

    let slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuenow', '25');

    rerender(<Slider value={[75]} max={100} />);
    
    slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuenow', '75');
  });
});