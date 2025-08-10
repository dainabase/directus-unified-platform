import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Calendar } from './calendar';

describe('Calendar', () => {
  it('renders without crashing', () => {
    render(<Calendar />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('displays current month by default', () => {
    render(<Calendar />);
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    expect(screen.getByText(currentMonth)).toBeInTheDocument();
  });

  it('handles single date selection', () => {
    const onSelect = vi.fn();
    render(<Calendar mode="single" onSelect={onSelect} />);
    
    const dateButton = screen.getByText('15');
    fireEvent.click(dateButton);
    
    expect(onSelect).toHaveBeenCalled();
    expect(onSelect.mock.calls[0][0]).toBeInstanceOf(Date);
  });

  it('handles multiple date selection', () => {
    const onSelect = vi.fn();
    render(<Calendar mode="multiple" onSelect={onSelect} />);
    
    const date1 = screen.getByText('10');
    const date2 = screen.getByText('15');
    
    fireEvent.click(date1);
    fireEvent.click(date2);
    
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it('handles range selection', () => {
    const onSelect = vi.fn();
    render(<Calendar mode="range" onSelect={onSelect} />);
    
    const startDate = screen.getByText('10');
    const endDate = screen.getByText('20');
    
    fireEvent.click(startDate);
    fireEvent.click(endDate);
    
    expect(onSelect).toHaveBeenCalled();
    const lastCall = onSelect.mock.calls[onSelect.mock.calls.length - 1][0];
    expect(lastCall).toHaveProperty('from');
    expect(lastCall).toHaveProperty('to');
  });

  it('respects disabled dates', () => {
    const onSelect = vi.fn();
    const today = new Date();
    const disabledDate = new Date(today.getFullYear(), today.getMonth(), 15);
    
    render(
      <Calendar 
        mode="single" 
        onSelect={onSelect}
        disabled={[disabledDate]}
      />
    );
    
    const disabledButton = screen.getByText('15');
    expect(disabledButton).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows outside days when showOutsideDays is true', () => {
    render(<Calendar showOutsideDays={true} />);
    
    // Check for days from previous/next month
    const allDays = screen.getAllByRole('gridcell');
    expect(allDays.length).toBeGreaterThan(28); // More than just current month
  });

  it('applies custom className', () => {
    const { container } = render(<Calendar className="custom-calendar" />);
    expect(container.querySelector('.custom-calendar')).toBeInTheDocument();
  });

  it('navigates between months using navigation buttons', () => {
    render(<Calendar />);
    
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    expect(screen.getByText(currentMonth)).toBeInTheDocument();
    
    // Navigate to previous month
    const prevButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(prevButton);
    
    const prevMonth = new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    expect(screen.getByText(prevMonth)).toBeInTheDocument();
  });

  it('supports keyboard navigation', () => {
    render(<Calendar mode="single" />);
    
    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    fireEvent.keyDown(grid, { key: 'Enter' });
    
    // The focused date should be selected
    expect(document.activeElement).toHaveAttribute('aria-selected');
  });

  it('clears selection when undefined is passed', () => {
    const { rerender } = render(<Calendar mode="single" selected={new Date()} />);
    
    // Should have a selected date initially
    expect(screen.getByRole('gridcell', { selected: true })).toBeInTheDocument();
    
    // Clear the selection
    rerender(<Calendar mode="single" selected={undefined} />);
    
    // Should not have any selected dates
    const selectedCells = screen.queryAllByRole('gridcell', { selected: true });
    expect(selectedCells).toHaveLength(0);
  });
});
