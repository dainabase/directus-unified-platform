/**
 * Badge Component Tests
 * Auto-generated test suite for badge component
 * Category: display
 */

import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '../../../tests/utils/test-utils';
import { Badge } from './index';
import { vi } from 'vitest';

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<Badge />);
      expect(document.querySelector('[data-testid="badge"]')).toBeInTheDocument();
    });

    it('renders with content', () => {
      renderWithProviders(
        <Badge>
          <span>Display content</span>
        </Badge>
      );
      expect(screen.getByText('Display content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderWithProviders(<Badge className="custom-display" />);
      expect(document.querySelector('.custom-display')).toBeInTheDocument();
    });
  });

  describe('Display Properties', () => {
    it('renders with different sizes', () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];
      sizes.forEach(size => {
        const { container } = renderWithProviders(<Badge size={size} />);
        expect(container.firstChild).toHaveClass(size);
      });
    });

    it('supports different variants', () => {
      const variants = ['default', 'primary', 'secondary'];
      variants.forEach(variant => {
        const { container } = renderWithProviders(<Badge variant={variant} />);
        expect(container.firstChild).toHaveClass(variant);
      });
    });

    it('handles loading state', () => {
      renderWithProviders(<Badge loading />);
      expect(document.querySelector('[role="status"]')).toBeInTheDocument();
    });

    it('handles empty state', () => {
      renderWithProviders(<Badge data={[]} emptyMessage="No data" />);
      expect(screen.getByText('No data')).toBeInTheDocument();
    });
  });

  describe('Media Support', () => {
    it('renders images correctly', () => {
      renderWithProviders(
        <Badge image="/test.jpg" alt="Test image" />
      );
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/test.jpg');
      expect(img).toHaveAttribute('alt', 'Test image');
    });

    it('handles image loading errors', () => {
      const handleError = vi.fn();
      renderWithProviders(
        <Badge image="/invalid.jpg" onImageError={handleError} />
      );
      
      const img = screen.getByRole('img');
      fireEvent.error(img);
      expect(handleError).toHaveBeenCalled();
    });

    it('renders icons', () => {
      renderWithProviders(<Badge icon="star" />);
      expect(document.querySelector('[data-icon="star"]')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles click events when clickable', () => {
      const handleClick = vi.fn();
      renderWithProviders(<Badge onClick={handleClick} />);
      
      fireEvent.click(document.querySelector('[role="button"]'));
      expect(handleClick).toHaveBeenCalled();
    });

    it('shows tooltip on hover', async () => {
      renderWithProviders(<Badge tooltip="Additional info" />);
      
      const element = document.querySelector('[data-testid="badge"]');
      fireEvent.mouseEnter(element);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toHaveTextContent('Additional info');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic HTML', () => {
      renderWithProviders(<Badge />);
      // Check for appropriate semantic elements
    });

    it('supports ARIA labels', () => {
      renderWithProviders(<Badge aria-label="Display component" />);
      const element = document.querySelector('[aria-label="Display component"]');
      expect(element).toBeInTheDocument();
    });

    it('handles reduced motion preference', () => {
      renderWithProviders(<Badge animated />);
      // Test animation behavior with prefers-reduced-motion
    });
  });
});
