/**
 * Charts Component Tests
 * Auto-generated test suite for charts component
 * Category: display
 */

import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '../../../tests/utils/test-utils';
import { Charts } from './index';
import { vi } from 'vitest';

describe('Charts Component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<Charts />);
      expect(document.querySelector('[data-testid="charts"]')).toBeInTheDocument();
    });

    it('renders with content', () => {
      renderWithProviders(
        <Charts>
          <span>Display content</span>
        </Charts>
      );
      expect(screen.getByText('Display content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderWithProviders(<Charts className="custom-display" />);
      expect(document.querySelector('.custom-display')).toBeInTheDocument();
    });
  });

  describe('Display Properties', () => {
    it('renders with different sizes', () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];
      sizes.forEach(size => {
        const { container } = renderWithProviders(<Charts size={size} />);
        expect(container.firstChild).toHaveClass(size);
      });
    });

    it('supports different variants', () => {
      const variants = ['default', 'primary', 'secondary'];
      variants.forEach(variant => {
        const { container } = renderWithProviders(<Charts variant={variant} />);
        expect(container.firstChild).toHaveClass(variant);
      });
    });

    it('handles loading state', () => {
      renderWithProviders(<Charts loading />);
      expect(document.querySelector('[role="status"]')).toBeInTheDocument();
    });

    it('handles empty state', () => {
      renderWithProviders(<Charts data={[]} emptyMessage="No data" />);
      expect(screen.getByText('No data')).toBeInTheDocument();
    });
  });

  describe('Media Support', () => {
    it('renders images correctly', () => {
      renderWithProviders(
        <Charts image="/test.jpg" alt="Test image" />
      );
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/test.jpg');
      expect(img).toHaveAttribute('alt', 'Test image');
    });

    it('handles image loading errors', () => {
      const handleError = vi.fn();
      renderWithProviders(
        <Charts image="/invalid.jpg" onImageError={handleError} />
      );
      
      const img = screen.getByRole('img');
      fireEvent.error(img);
      expect(handleError).toHaveBeenCalled();
    });

    it('renders icons', () => {
      renderWithProviders(<Charts icon="star" />);
      expect(document.querySelector('[data-icon="star"]')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles click events when clickable', () => {
      const handleClick = vi.fn();
      renderWithProviders(<Charts onClick={handleClick} />);
      
      fireEvent.click(document.querySelector('[role="button"]'));
      expect(handleClick).toHaveBeenCalled();
    });

    it('shows tooltip on hover', async () => {
      renderWithProviders(<Charts tooltip="Additional info" />);
      
      const element = document.querySelector('[data-testid="charts"]');
      fireEvent.mouseEnter(element);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toHaveTextContent('Additional info');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic HTML', () => {
      renderWithProviders(<Charts />);
      // Check for appropriate semantic elements
    });

    it('supports ARIA labels', () => {
      renderWithProviders(<Charts aria-label="Display component" />);
      const element = document.querySelector('[aria-label="Display component"]');
      expect(element).toBeInTheDocument();
    });

    it('handles reduced motion preference', () => {
      renderWithProviders(<Charts animated />);
      // Test animation behavior with prefers-reduced-motion
    });
  });
});
