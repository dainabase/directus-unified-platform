import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Icon } from './icon';
import * as Icons from 'lucide-react';

describe('Icon Component', () => {
  it('renders without crashing', () => {
    render(<Icon name="check" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders correct icon by name', () => {
    render(<Icon name="user" />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveClass('lucide-user');
  });

  it('applies custom size', () => {
    render(<Icon name="settings" size={32} />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveAttribute('width', '32');
    expect(icon).toHaveAttribute('height', '32');
  });

  it('applies custom className', () => {
    render(<Icon name="home" className="custom-class" />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveClass('custom-class');
  });

  it('applies custom color', () => {
    render(<Icon name="star" color="red" />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveStyle({ color: 'red' });
  });

  it('handles onClick event', () => {
    const handleClick = jest.fn();
    render(<Icon name="click" onClick={handleClick} />);
    const icon = screen.getByTestId('icon');
    fireEvent.click(icon);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with strokeWidth prop', () => {
    render(<Icon name="bold" strokeWidth={3} />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveAttribute('stroke-width', '3');
  });

  it('supports all icon names from lucide-react', () => {
    const iconNames = Object.keys(Icons).filter(key => 
      key !== 'default' && typeof Icons[key] === 'function'
    );
    
    iconNames.slice(0, 5).forEach(name => {
      const { container } = render(<Icon name={name.toLowerCase()} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('handles invalid icon name gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    render(<Icon name="invalid-icon-name" />);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Icon not found')
    );
    consoleSpy.mockRestore();
  });

  it('renders with aria-label for accessibility', () => {
    render(<Icon name="accessibility" aria-label="Accessibility icon" />);
    const icon = screen.getByLabelText('Accessibility icon');
    expect(icon).toBeInTheDocument();
  });

  it('supports data attributes', () => {
    render(<Icon name="data" data-testid="custom-icon" data-value="test" />);
    const icon = screen.getByTestId('custom-icon');
    expect(icon).toHaveAttribute('data-value', 'test');
  });

  it('applies spin animation when specified', () => {
    render(<Icon name="loader" spin />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveClass('animate-spin');
  });

  it('renders inline SVG', () => {
    const { container } = render(<Icon name="check" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.tagName.toLowerCase()).toBe('svg');
  });

  it('maintains aspect ratio', () => {
    render(<Icon name="square" size={24} />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveAttribute('width', '24');
    expect(icon).toHaveAttribute('height', '24');
  });

  it('supports custom fill color', () => {
    render(<Icon name="filled" fill="blue" />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveStyle({ fill: 'blue' });
  });
});
