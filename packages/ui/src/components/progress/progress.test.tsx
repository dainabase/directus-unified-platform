/**
 * Progress Component Tests
 * Auto-generated test suite for progress component
 * Category: feedback
 */

import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '../../../tests/utils/test-utils';
import { Progress } from './index';
import { vi } from 'vitest';

describe('Progress Component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<Progress />);
      expect(document.querySelector('[role="alert"], [role="dialog"], [role="status"]')).toBeInTheDocument();
    });

    it('renders with message content', () => {
      renderWithProviders(<Progress message="Test message" />);
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('renders with title and description', () => {
      renderWithProviders(
        <Progress title="Title" description="Description" />
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    const variants = ['default', 'success', 'warning', 'error', 'info'];
    
    variants.forEach(variant => {
      it(`renders ${variant} variant`, () => {
        renderWithProviders(<Progress variant={variant} />);
        const element = document.querySelector('[data-variant], [class*="' + variant + '"]');
        expect(element).toBeInTheDocument();
      });
    });
  });

  describe('Visibility Control', () => {
    it('shows and hides correctly', async () => {
      const { rerender } = renderWithProviders(<Progress open={true} />);
      expect(screen.getByRole?.('dialog') || document.querySelector('[data-state="open"]')).toBeInTheDocument();
      
      rerender(<Progress open={false} />);
      await waitFor(() => {
        expect(screen.queryByRole?.('dialog') || document.querySelector('[data-state="closed"]')).not.toBeInTheDocument();
      });
    });

    it('auto-dismisses after timeout', async () => {
      renderWithProviders(<Progress autoClose duration={1000} />);
      await waitFor(() => {
        expect(document.querySelector('[data-state="closed"]')).toBeInTheDocument();
      }, { timeout: 1500 });
    });

    it('handles close button click', () => {
      const handleClose = vi.fn();
      renderWithProviders(<Progress onClose={handleClose} />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('Actions', () => {
    it('renders action buttons', () => {
      renderWithProviders(
        <Progress 
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
        <Progress 
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
      renderWithProviders(<Progress />);
      const element = document.querySelector('[role="alert"], [role="dialog"], [role="status"]');
      expect(element).toBeInTheDocument();
    });

    it('manages focus for modals', () => {
      renderWithProviders(<Progress modal />);
      const dialog = screen.getByRole?.('dialog');
      if (dialog) {
        expect(dialog).toHaveAttribute('aria-modal', 'true');
      }
    });

    it('supports keyboard dismissal', () => {
      const handleClose = vi.fn();
      renderWithProviders(<Progress onClose={handleClose} />);
      
      fireEvent.keyDown(document.body, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
