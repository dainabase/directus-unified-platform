/**
 * AlertDialog Component Tests
 * Auto-generated test suite for alert-dialog component
 * Category: feedback
 */

import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '../../../tests/utils/test-utils';
import { AlertDialog } from './index';
import { vi } from 'vitest';

describe('AlertDialog Component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<AlertDialog />);
      expect(document.querySelector('[role="alert"], [role="dialog"], [role="status"]')).toBeInTheDocument();
    });

    it('renders with message content', () => {
      renderWithProviders(<AlertDialog message="Test message" />);
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('renders with title and description', () => {
      renderWithProviders(
        <AlertDialog title="Title" description="Description" />
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    const variants = ['default', 'success', 'warning', 'error', 'info'];
    
    variants.forEach(variant => {
      it(`renders ${variant} variant`, () => {
        renderWithProviders(<AlertDialog variant={variant} />);
        const element = document.querySelector('[data-variant], [class*="' + variant + '"]');
        expect(element).toBeInTheDocument();
      });
    });
  });

  describe('Visibility Control', () => {
    it('shows and hides correctly', async () => {
      const { rerender } = renderWithProviders(<AlertDialog open={true} />);
      expect(screen.getByRole?.('dialog') || document.querySelector('[data-state="open"]')).toBeInTheDocument();
      
      rerender(<AlertDialog open={false} />);
      await waitFor(() => {
        expect(screen.queryByRole?.('dialog') || document.querySelector('[data-state="closed"]')).not.toBeInTheDocument();
      });
    });

    it('auto-dismisses after timeout', async () => {
      renderWithProviders(<AlertDialog autoClose duration={1000} />);
      await waitFor(() => {
        expect(document.querySelector('[data-state="closed"]')).toBeInTheDocument();
      }, { timeout: 1500 });
    });

    it('handles close button click', () => {
      const handleClose = vi.fn();
      renderWithProviders(<AlertDialog onClose={handleClose} />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('Actions', () => {
    it('renders action buttons', () => {
      renderWithProviders(
        <AlertDialog 
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
        <AlertDialog 
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
      renderWithProviders(<AlertDialog />);
      const element = document.querySelector('[role="alert"], [role="dialog"], [role="status"]');
      expect(element).toBeInTheDocument();
    });

    it('manages focus for modals', () => {
      renderWithProviders(<AlertDialog modal />);
      const dialog = screen.getByRole?.('dialog');
      if (dialog) {
        expect(dialog).toHaveAttribute('aria-modal', 'true');
      }
    });

    it('supports keyboard dismissal', () => {
      const handleClose = vi.fn();
      renderWithProviders(<AlertDialog onClose={handleClose} />);
      
      fireEvent.keyDown(document.body, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
