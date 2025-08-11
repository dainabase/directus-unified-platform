/**
 * Skeleton Component Tests
 * Auto-generated test suite for skeleton component
 * Category: feedback
 */

import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '../../../tests/utils/test-utils';
import { Skeleton } from './index';
import { vi } from 'vitest';

describe('Skeleton Component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<Skeleton />);
      expect(document.querySelector('[role="alert"], [role="dialog"], [role="status"]')).toBeInTheDocument();
    });

    it('renders with message content', () => {
      renderWithProviders(<Skeleton message="Test message" />);
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('renders with title and description', () => {
      renderWithProviders(
        <Skeleton title="Title" description="Description" />
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    const variants = ['default', 'success', 'warning', 'error', 'info'];
    
    variants.forEach(variant => {
      it(`renders ${variant} variant`, () => {
        renderWithProviders(<Skeleton variant={variant} />);
        const element = document.querySelector('[data-variant], [class*="' + variant + '"]');
        expect(element).toBeInTheDocument();
      });
    });
  });

  describe('Visibility Control', () => {
    it('shows and hides correctly', async () => {
      const { rerender } = renderWithProviders(<Skeleton open={true} />);
      expect(screen.getByRole?.('dialog') || document.querySelector('[data-state="open"]')).toBeInTheDocument();
      
      rerender(<Skeleton open={false} />);
      await waitFor(() => {
        expect(screen.queryByRole?.('dialog') || document.querySelector('[data-state="closed"]')).not.toBeInTheDocument();
      });
    });

    it('auto-dismisses after timeout', async () => {
      renderWithProviders(<Skeleton autoClose duration={1000} />);
      await waitFor(() => {
        expect(document.querySelector('[data-state="closed"]')).toBeInTheDocument();
      }, { timeout: 1500 });
    });

    it('handles close button click', () => {
      const handleClose = vi.fn();
      renderWithProviders(<Skeleton onClose={handleClose} />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('Actions', () => {
    it('renders action buttons', () => {
      renderWithProviders(
        <Skeleton 
          primaryAction={{ label: 'Confirm', onClick: vi.fn() }}
          secondaryAction={{ label: 'Cancel', onClick: vi.fn() }}
        />
      );
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('handles action clicks', () => {
      const handleConfirm = vi.fn();
      const handleCancel = vi.fn();
      renderWithProviders(
        <Skeleton 
          primaryAction={{ label: 'Confirm', onClick: handleConfirm }}
          secondaryAction={{ label: 'Cancel', onClick: handleCancel }}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
      expect(handleConfirm).toHaveBeenCalled();
      
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(handleCancel).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA role', () => {
      renderWithProviders(<Skeleton />);
      const element = document.querySelector('[role="alert"], [role="dialog"], [role="status"]');
      expect(element).toBeInTheDocument();
    });

    it('manages focus for modals', () => {
      renderWithProviders(<Skeleton modal />);
      const dialog = screen.getByRole?.('dialog');
      if (dialog) {
        expect(dialog).toHaveAttribute('aria-modal', 'true');
      }
    });

    it('supports keyboard dismissal', () => {
      const handleClose = vi.fn();
      renderWithProviders(<Skeleton onClose={handleClose} />);
      
      fireEvent.keyDown(document.body, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
