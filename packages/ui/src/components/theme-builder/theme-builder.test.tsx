import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeBuilder } from './theme-builder';

// Mock du clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

describe('ThemeBuilder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ThemeBuilder />);
    expect(screen.getByText(/Theme Builder/i)).toBeInTheDocument();
  });

  it('displays color palette section', () => {
    render(<ThemeBuilder />);
    expect(screen.getByText(/Color Palette/i)).toBeInTheDocument();
  });

  it('displays typography section', () => {
    render(<ThemeBuilder />);
    expect(screen.getByText(/Typography/i)).toBeInTheDocument();
  });

  it('displays spacing section', () => {
    render(<ThemeBuilder />);
    expect(screen.getByText(/Spacing/i)).toBeInTheDocument();
  });

  it('displays border radius section', () => {
    render(<ThemeBuilder />);
    expect(screen.getByText(/Border Radius/i)).toBeInTheDocument();
  });

  it('allows switching between light and dark mode', () => {
    render(<ThemeBuilder />);
    const darkModeToggle = screen.getByRole('switch', { name: /dark mode/i });
    
    expect(darkModeToggle).toBeInTheDocument();
    fireEvent.click(darkModeToggle);
    
    // Verify dark mode is activated
    expect(darkModeToggle).toBeChecked();
  });

  it('allows color customization', () => {
    render(<ThemeBuilder />);
    const primaryColorInput = screen.getByLabelText(/primary color/i);
    
    expect(primaryColorInput).toBeInTheDocument();
    fireEvent.change(primaryColorInput, { target: { value: '#FF0000' } });
    
    expect(primaryColorInput).toHaveValue('#FF0000');
  });

  it('allows font size customization', () => {
    render(<ThemeBuilder />);
    const baseFontSizeInput = screen.getByLabelText(/base font size/i);
    
    expect(baseFontSizeInput).toBeInTheDocument();
    fireEvent.change(baseFontSizeInput, { target: { value: '18' } });
    
    expect(baseFontSizeInput).toHaveValue('18');
  });

  it('generates CSS variables', () => {
    render(<ThemeBuilder />);
    const cssOutput = screen.getByTestId('css-output');
    
    expect(cssOutput).toBeInTheDocument();
    expect(cssOutput.textContent).toContain('--primary');
    expect(cssOutput.textContent).toContain('--secondary');
    expect(cssOutput.textContent).toContain('--background');
  });

  it('allows exporting theme configuration', async () => {
    render(<ThemeBuilder />);
    const exportButton = screen.getByRole('button', { name: /export theme/i });
    
    expect(exportButton).toBeInTheDocument();
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  it('allows importing theme configuration', () => {
    render(<ThemeBuilder />);
    const importButton = screen.getByRole('button', { name: /import theme/i });
    
    expect(importButton).toBeInTheDocument();
    fireEvent.click(importButton);
    
    // Verify import modal/dialog appears
    expect(screen.getByText(/Import Theme Configuration/i)).toBeInTheDocument();
  });

  it('provides preset themes', () => {
    render(<ThemeBuilder />);
    const presetSelect = screen.getByLabelText(/preset themes/i);
    
    expect(presetSelect).toBeInTheDocument();
    fireEvent.change(presetSelect, { target: { value: 'dark' } });
    
    // Verify theme changes are applied
    expect(screen.getByTestId('css-output').textContent).toContain('--background: #0a0a0a');
  });

  it('allows resetting to default theme', () => {
    render(<ThemeBuilder />);
    
    // Make some changes first
    const primaryColorInput = screen.getByLabelText(/primary color/i);
    fireEvent.change(primaryColorInput, { target: { value: '#FF0000' } });
    
    // Reset
    const resetButton = screen.getByRole('button', { name: /reset to default/i });
    fireEvent.click(resetButton);
    
    // Verify default values are restored
    expect(primaryColorInput).not.toHaveValue('#FF0000');
  });

  it('provides live preview of theme changes', () => {
    render(<ThemeBuilder />);
    const previewSection = screen.getByTestId('theme-preview');
    
    expect(previewSection).toBeInTheDocument();
    
    // Change a color
    const primaryColorInput = screen.getByLabelText(/primary color/i);
    fireEvent.change(primaryColorInput, { target: { value: '#FF0000' } });
    
    // Verify preview updates
    const previewButton = previewSection.querySelector('.btn-primary');
    expect(previewButton).toHaveStyle({ backgroundColor: '#FF0000' });
  });

  it('handles accessibility features', () => {
    render(<ThemeBuilder />);
    
    // Check for ARIA labels
    expect(screen.getByRole('region', { name: /theme customization/i })).toBeInTheDocument();
    
    // Check for keyboard navigation
    const colorInputs = screen.getAllByRole('textbox', { name: /color/i });
    colorInputs.forEach(input => {
      expect(input).toHaveAttribute('aria-label');
    });
  });

  it('validates color input formats', () => {
    render(<ThemeBuilder />);
    const primaryColorInput = screen.getByLabelText(/primary color/i);
    
    // Invalid color format
    fireEvent.change(primaryColorInput, { target: { value: 'not-a-color' } });
    
    // Should show validation error
    expect(screen.getByText(/Invalid color format/i)).toBeInTheDocument();
  });

  it('supports color format conversion', () => {
    render(<ThemeBuilder />);
    const colorFormatToggle = screen.getByRole('button', { name: /color format/i });
    
    fireEvent.click(colorFormatToggle);
    
    // Should show format options
    expect(screen.getByText(/HEX/i)).toBeInTheDocument();
    expect(screen.getByText(/RGB/i)).toBeInTheDocument();
    expect(screen.getByText(/HSL/i)).toBeInTheDocument();
  });

  it('maintains theme state across component re-renders', () => {
    const { rerender } = render(<ThemeBuilder />);
    
    // Make changes
    const primaryColorInput = screen.getByLabelText(/primary color/i);
    fireEvent.change(primaryColorInput, { target: { value: '#FF0000' } });
    
    // Re-render
    rerender(<ThemeBuilder />);
    
    // Verify state is maintained
    expect(screen.getByLabelText(/primary color/i)).toHaveValue('#FF0000');
  });

  it('provides undo/redo functionality', () => {
    render(<ThemeBuilder />);
    
    const primaryColorInput = screen.getByLabelText(/primary color/i);
    const originalValue = primaryColorInput.value;
    
    // Make a change
    fireEvent.change(primaryColorInput, { target: { value: '#FF0000' } });
    
    // Undo
    const undoButton = screen.getByRole('button', { name: /undo/i });
    fireEvent.click(undoButton);
    expect(primaryColorInput).toHaveValue(originalValue);
    
    // Redo
    const redoButton = screen.getByRole('button', { name: /redo/i });
    fireEvent.click(redoButton);
    expect(primaryColorInput).toHaveValue('#FF0000');
  });
});
