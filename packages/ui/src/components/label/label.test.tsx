import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Label } from './label';

describe('Label Component', () => {
  it('renders without crashing', () => {
    render(<Label>Test Label</Label>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with children text', () => {
    render(<Label>My Label Text</Label>);
    const label = screen.getByText('My Label Text');
    expect(label).toBeInTheDocument();
    expect(label.tagName.toLowerCase()).toBe('label');
  });

  it('applies htmlFor attribute correctly', () => {
    render(<Label htmlFor="input-id">Label for Input</Label>);
    const label = screen.getByText('Label for Input');
    expect(label).toHaveAttribute('for', 'input-id');
  });

  it('applies custom className', () => {
    render(<Label className="custom-label-class">Custom Class Label</Label>);
    const label = screen.getByText('Custom Class Label');
    expect(label).toHaveClass('custom-label-class');
  });

  it('renders with default styles', () => {
    render(<Label>Default Styled Label</Label>);
    const label = screen.getByText('Default Styled Label');
    expect(label).toHaveClass('text-sm');
    expect(label).toHaveClass('font-medium');
  });

  it('supports disabled state', () => {
    render(<Label disabled>Disabled Label</Label>);
    const label = screen.getByText('Disabled Label');
    expect(label).toHaveClass('opacity-50');
    expect(label).toHaveClass('cursor-not-allowed');
  });

  it('supports required indicator', () => {
    render(<Label required>Required Field</Label>);
    const label = screen.getByText(/Required Field/);
    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveClass('text-red-500');
  });

  it('handles onClick event', () => {
    const handleClick = jest.fn();
    render(<Label onClick={handleClick}>Clickable Label</Label>);
    const label = screen.getByText('Clickable Label');
    fireEvent.click(label);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with error state', () => {
    render(<Label error>Error Label</Label>);
    const label = screen.getByText('Error Label');
    expect(label).toHaveClass('text-red-500');
  });

  it('renders with success state', () => {
    render(<Label success>Success Label</Label>);
    const label = screen.getByText('Success Label');
    expect(label).toHaveClass('text-green-500');
  });

  it('supports data attributes', () => {
    render(
      <Label data-testid="custom-label" data-value="test">
        Data Attribute Label
      </Label>
    );
    const label = screen.getByTestId('custom-label');
    expect(label).toHaveAttribute('data-value', 'test');
  });

  it('supports aria attributes for accessibility', () => {
    render(
      <Label aria-label="Accessible Label" aria-describedby="description">
        Accessibility Label
      </Label>
    );
    const label = screen.getByLabelText('Accessible Label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('aria-describedby', 'description');
  });

  it('renders with nested elements', () => {
    render(
      <Label>
        <span>Nested</span> <strong>Content</strong>
      </Label>
    );
    expect(screen.getByText('Nested')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies variant styles', () => {
    render(<Label variant="secondary">Secondary Label</Label>);
    const label = screen.getByText('Secondary Label');
    expect(label).toHaveClass('text-gray-600');
  });

  it('supports size variations', () => {
    render(<Label size="lg">Large Label</Label>);
    const label = screen.getByText('Large Label');
    expect(label).toHaveClass('text-lg');
  });

  it('handles tooltip prop', () => {
    render(<Label tooltip="This is a helpful tooltip">Tooltip Label</Label>);
    const label = screen.getByText('Tooltip Label');
    expect(label).toHaveAttribute('title', 'This is a helpful tooltip');
  });

  it('combines multiple props correctly', () => {
    render(
      <Label
        htmlFor="combo-input"
        className="custom"
        required
        disabled
      >
        Combined Props
      </Label>
    );
    const label = screen.getByText(/Combined Props/);
    expect(label).toHaveAttribute('for', 'combo-input');
    expect(label).toHaveClass('custom');
    expect(label).toHaveClass('opacity-50');
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('preserves ref forwarding', () => {
    const ref = React.createRef<HTMLLabelElement>();
    render(<Label ref={ref}>Ref Label</Label>);
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
    expect(ref.current?.textContent).toBe('Ref Label');
  });
});
