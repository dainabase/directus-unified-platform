import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Separator } from './separator';

describe('Separator Component', () => {
  it('renders without crashing', () => {
    render(<Separator />);
    const separator = screen.getByRole('separator');
    expect(separator).toBeInTheDocument();
  });

  it('renders as horizontal separator by default', () => {
    render(<Separator />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveClass('h-[1px]');
    expect(separator).toHaveClass('w-full');
  });

  it('renders as vertical separator when orientation is vertical', () => {
    render(<Separator orientation="vertical" />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveClass('w-[1px]');
    expect(separator).toHaveClass('h-full');
  });

  it('applies custom className', () => {
    render(<Separator className="custom-separator" />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveClass('custom-separator');
  });

  it('applies decorative attribute for accessibility', () => {
    render(<Separator decorative />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveAttribute('aria-orientation');
  });

  it('renders with default background color', () => {
    render(<Separator />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveClass('bg-border');
  });

  it('supports custom colors through className', () => {
    render(<Separator className="bg-red-500" />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveClass('bg-red-500');
  });

  it('maintains proper ARIA attributes', () => {
    render(<Separator orientation="horizontal" />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('renders with proper vertical ARIA attributes', () => {
    render(<Separator orientation="vertical" />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('supports data attributes', () => {
    render(
      <Separator 
        data-testid="custom-separator" 
        data-value="test"
      />
    );
    const separator = screen.getByTestId('custom-separator');
    expect(separator).toHaveAttribute('data-value', 'test');
  });

  it('combines default and custom classes correctly', () => {
    render(<Separator className="my-2" />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveClass('h-[1px]');
    expect(separator).toHaveClass('w-full');
    expect(separator).toHaveClass('bg-border');
    expect(separator).toHaveClass('my-2');
  });

  it('renders with spacing classes', () => {
    render(<Separator className="mx-4 my-8" />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveClass('mx-4');
    expect(separator).toHaveClass('my-8');
  });

  it('supports different thickness for horizontal', () => {
    render(<Separator className="h-[2px]" />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveClass('h-[2px]');
  });

  it('supports different thickness for vertical', () => {
    render(<Separator orientation="vertical" className="w-[2px]" />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveClass('w-[2px]');
  });

  it('preserves ref forwarding', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Separator ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('bg-border');
  });

  it('renders as div element', () => {
    const { container } = render(<Separator />);
    const separator = container.querySelector('div[role="separator"]');
    expect(separator).toBeInTheDocument();
  });

  it('supports style prop', () => {
    render(<Separator style={{ opacity: 0.5 }} />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveStyle({ opacity: '0.5' });
  });

  it('handles multiple orientations in sequence', () => {
    const { rerender } = render(<Separator orientation="horizontal" />);
    let separator = screen.getByRole('separator');
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
    
    rerender(<Separator orientation="vertical" />);
    separator = screen.getByRole('separator');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('maintains semantic HTML structure', () => {
    const { container } = render(<Separator />);
    const separator = container.firstChild;
    expect(separator).toHaveAttribute('role', 'separator');
  });
});
