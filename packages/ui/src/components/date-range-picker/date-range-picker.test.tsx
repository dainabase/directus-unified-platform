import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DateRangePicker } from './date-range-picker';
import { DateRange } from 'react-day-picker';

describe('DateRangePicker', () => {
  it('renders with default placeholder', () => {
    render(<DateRangePicker />);
    expect(screen.getByText('Pick a date range')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<DateRangePicker placeholder="Select booking dates" />);
    expect(screen.getByText('Select booking dates')).toBeInTheDocument();
  });

  it('opens calendar popover on click', async () => {
    render(<DateRangePicker />);
    
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  it('displays selected date range', () => {
    const dateRange: DateRange = {
      from: new Date(2025, 7, 1),
      to: new Date(2025, 7, 7),
    };
    
    render(<DateRangePicker dateRange={dateRange} />);
    
    const button = screen.getByRole('button');
    expect(button.textContent).toContain('Aug 01, 2025');
    expect(button.textContent).toContain('Aug 07, 2025');
  });

  it('displays single date when only from is selected', () => {
    const dateRange: DateRange = {
      from: new Date(2025, 7, 15),
      to: undefined,
    };
    
    render(<DateRangePicker dateRange={dateRange} />);
    
    const button = screen.getByRole('button');
    expect(button.textContent).toContain('Aug 15, 2025');
    expect(button.textContent).not.toContain(' - ');
  });

  it('calls onDateRangeChange when date is selected', async () => {
    const onDateRangeChange = vi.fn();
    render(<DateRangePicker onDateRangeChange={onDateRangeChange} />);
    
    // Open the popover
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
    
    // Select a date
    const dateButton = screen.getByText('15');
    fireEvent.click(dateButton);
    
    expect(onDateRangeChange).toHaveBeenCalled();
  });

  it('shows correct number of months', async () => {
    render(<DateRangePicker numberOfMonths={3} />);
    
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    await waitFor(() => {
      const grids = screen.getAllByRole('grid');
      expect(grids).toHaveLength(3);
    });
  });

  it('clears date range when Clear button is clicked', async () => {
    const onDateRangeChange = vi.fn();
    const dateRange: DateRange = {
      from: new Date(2025, 7, 1),
      to: new Date(2025, 7, 7),
    };
    
    render(
      <DateRangePicker 
        dateRange={dateRange} 
        onDateRangeChange={onDateRangeChange}
      />
    );
    
    // Open the popover
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
    
    // Click Clear button
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);
    
    expect(onDateRangeChange).toHaveBeenCalledWith(undefined);
  });

  it('selects last 7 days preset', async () => {
    const onDateRangeChange = vi.fn();
    render(<DateRangePicker onDateRangeChange={onDateRangeChange} />);
    
    // Open the popover
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
    
    // Click Last 7 days button
    const presetButton = screen.getByText('Last 7 days');
    fireEvent.click(presetButton);
    
    expect(onDateRangeChange).toHaveBeenCalled();
    const call = onDateRangeChange.mock.calls[0][0];
    expect(call).toHaveProperty('from');
    expect(call).toHaveProperty('to');
    
    // Check the date range is roughly 7 days
    const daysDiff = Math.ceil(
      (call.to.getTime() - call.from.getTime()) / (1000 * 60 * 60 * 24)
    );
    expect(daysDiff).toBe(7);
  });

  it('selects last 30 days preset', async () => {
    const onDateRangeChange = vi.fn();
    render(<DateRangePicker onDateRangeChange={onDateRangeChange} />);
    
    // Open the popover
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
    
    // Click Last 30 days button
    const presetButton = screen.getByText('Last 30 days');
    fireEvent.click(presetButton);
    
    expect(onDateRangeChange).toHaveBeenCalled();
    const call = onDateRangeChange.mock.calls[0][0];
    expect(call).toHaveProperty('from');
    expect(call).toHaveProperty('to');
  });

  it('applies custom className', () => {
    const { container } = render(
      <DateRangePicker className="custom-picker" />
    );
    expect(container.querySelector('.custom-picker')).toBeInTheDocument();
  });

  it('respects disabled dates', async () => {
    const disabledDates = [new Date(2025, 7, 15)];
    
    render(<DateRangePicker disabled={disabledDates} />);
    
    // Open the popover
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
    
    // Check if the date is disabled
    const disabledDate = screen.getByText('15');
    expect(disabledDate).toHaveAttribute('aria-disabled', 'true');
  });

  it('closes popover after selecting both dates', async () => {
    const onDateRangeChange = vi.fn();
    render(<DateRangePicker onDateRangeChange={onDateRangeChange} />);
    
    // Open the popover
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
    
    // Select first date
    const startDate = screen.getByText('10');
    fireEvent.click(startDate);
    
    // Popover should still be open
    expect(screen.getByRole('grid')).toBeInTheDocument();
    
    // Select second date
    const endDate = screen.getByText('20');
    fireEvent.click(endDate);
    
    // Popover should close after selecting range
    await waitFor(() => {
      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    });
  });

  it('shows calendar icon', () => {
    render(<DateRangePicker />);
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });
});
