import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChromaticTest } from './chromatic-test';

describe('ChromaticTest', () => {
  it('renders without crashing', () => {
    render(<ChromaticTest />);
    expect(screen.getByTestId('chromatic-test')).toBeInTheDocument();
  });

  it('displays visual regression test elements', () => {
    render(<ChromaticTest />);
    
    // Check for presence of test elements
    expect(screen.getByText(/Chromatic Visual Test/i)).toBeInTheDocument();
  });

  it('renders color swatches for visual testing', () => {
    render(<ChromaticTest />);
    
    const colorSwatches = screen.getAllByTestId('color-swatch');
    expect(colorSwatches.length).toBeGreaterThan(0);
  });

  it('renders typography samples for visual testing', () => {
    render(<ChromaticTest />);
    
    const typographySamples = screen.getAllByTestId('typography-sample');
    expect(typographySamples.length).toBeGreaterThan(0);
  });

  it('renders spacing examples for visual testing', () => {
    render(<ChromaticTest />);
    
    const spacingExamples = screen.getAllByTestId('spacing-example');
    expect(spacingExamples.length).toBeGreaterThan(0);
  });

  it('maintains consistent structure for snapshot testing', () => {
    const { container } = render(<ChromaticTest />);
    
    // Verify the structure has not changed unexpectedly
    expect(container.firstChild).toHaveClass('chromatic-test-container');
  });
});
