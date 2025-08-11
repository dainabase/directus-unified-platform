/**
 * TreeView Component Tests
 * Auto-generated test suite for tree-view component
 * Category: display
 */

import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '../../../tests/utils/test-utils';
import { TreeView } from './index';
import { vi } from 'vitest';

describe('TreeView Component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<TreeView />);
      expect(document.querySelector('[data-testid="tree-view"]')).toBeInTheDocument();
    });

    it('renders with content', () => {
      renderWithProviders(
        <TreeView>
          <span>Display content</span>
        </TreeView>
      );
      expect(screen.getByText('Display content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderWithProviders(<TreeView className="custom-display" />);
      expect(document.querySelector('.custom-display')).toBeInTheDocument();
    });
  });

  describe('Display Properties', () => {
    it('renders with different sizes', () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];
      sizes.forEach(size => {
        const { container } = renderWithProviders(<TreeView size={size} />);
        expect(container.firstChild).toHaveClass(size);
      });
    });

    it('supports different variants', () => {
      const variants = ['default', 'primary', 'secondary'];
      variants.forEach(variant => {
        const { container } = renderWithProviders(<TreeView variant={variant} />);
        expect(container.firstChild).toHaveClass(variant);
      });
    });

    it('handles loading state', () => {
      renderWithProviders(<TreeView loading />);
      expect(document.querySelector('[role="status"]')).toBeInTheDocument();
    });

    it('handles empty state', () => {
      renderWithProviders(<TreeView data={[]} emptyMessage="No data" />);
      expect(screen.getByText('No data')).toBeInTheDocument();
    });
  });

  describe('Media Support', () => {
    it('renders images correctly', () => {
      renderWithProviders(
        <TreeView image="/test.jpg" alt="Test image" />
      );
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/test.jpg');
      expect(img).toHaveAttribute('alt', 'Test image');
    });

    it('handles image loading errors', () => {
      const handleError = vi.fn();
      renderWithProviders(
        <TreeView image="/invalid.jpg" onImageError={handleError} />
      );
      
      const img = screen.getByRole('img');
      fireEvent.error(img);
      expect(handleError).toHaveBeenCalled();
    });

    it('renders icons', () => {
      renderWithProviders(<TreeView icon="star" />);
      expect(document.querySelector('[data-icon="star"]')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles click events when clickable', () => {
      const handleClick = vi.fn();
      renderWithProviders(<TreeView onClick={handleClick} />);
      
      fireEvent.click(document.querySelector('[role="button"]'));
      expect(handleClick).toHaveBeenCalled();
    });

    it('shows tooltip on hover', async () => {
      renderWithProviders(<TreeView tooltip="Additional info" />);
      
      const element = document.querySelector('[data-testid="tree-view"]');
      fireEvent.mouseEnter(element);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toHaveTextContent('Additional info');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic HTML', () => {
      renderWithProviders(<TreeView />);
      // Check for appropriate semantic elements
    });

    it('supports ARIA labels', () => {
      renderWithProviders(<TreeView aria-label="Display component" />);
      const element = document.querySelector('[aria-label="Display component"]');
      expect(element).toBeInTheDocument();
    });

    it('handles reduced motion preference', () => {
      renderWithProviders(<TreeView animated />);
      // Test animation behavior with prefers-reduced-motion
    });
  });
});
