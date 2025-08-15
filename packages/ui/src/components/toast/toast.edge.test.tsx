import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toaster, toast } from './index';

describe('Toast Edge Cases', () => {
  beforeEach(() => {
    // Clear all toasts before each test
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // Clean up after each test
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  describe('Queue Management', () => {
    it('should handle multiple toasts in queue correctly', async () => {
      render(<Toaster />);

      act(() => {
        toast('First toast');
        toast('Second toast');
        toast('Third toast');
        toast('Fourth toast');
        toast('Fifth toast');
      });

      await waitFor(() => {
        // All toasts should be visible
        expect(screen.getByText('First toast')).toBeInTheDocument();
        expect(screen.getByText('Second toast')).toBeInTheDocument();
        expect(screen.getByText('Third toast')).toBeInTheDocument();
        expect(screen.getByText('Fourth toast')).toBeInTheDocument();
        expect(screen.getByText('Fifth toast')).toBeInTheDocument();
      });
    });

    it('should respect max toast limit', async () => {
      render(<Toaster max={3} />);

      act(() => {
        for (let i = 1; i <= 10; i++) {
          toast(`Toast ${i}`);
        }
      });

      await waitFor(() => {
        // Only last 3 toasts should be visible
        const toasts = screen.queryAllByRole('status');
        expect(toasts).toHaveLength(3);
      });
    });

    it('should handle rapid toast creation without memory leaks', async () => {
      render(<Toaster />);

      // Create 100 toasts rapidly
      act(() => {
        for (let i = 0; i < 100; i++) {
          toast(`Rapid toast ${i}`);
        }
      });

      // Dismiss all toasts
      act(() => {
        toast.dismiss();
      });

      await waitFor(() => {
        const toasts = screen.queryAllByRole('status');
        expect(toasts).toHaveLength(0);
      });
    });

    it('should maintain queue order with mixed toast types', async () => {
      render(<Toaster />);

      act(() => {
        toast.success('Success toast');
        toast.error('Error toast');
        toast.warning('Warning toast');
        toast.info('Info toast');
        toast('Default toast');
      });

      await waitFor(() => {
        const toasts = screen.getAllByRole('status');
        expect(toasts[0]).toHaveTextContent('Success toast');
        expect(toasts[1]).toHaveTextContent('Error toast');
        expect(toasts[2]).toHaveTextContent('Warning toast');
        expect(toasts[3]).toHaveTextContent('Info toast');
        expect(toasts[4]).toHaveTextContent('Default toast');
      });
    });
  });

  describe('Auto-dismiss Timing', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should auto-dismiss after default duration', async () => {
      render(<Toaster />);

      act(() => {
        toast('Auto dismiss test');
      });

      expect(screen.getByText('Auto dismiss test')).toBeInTheDocument();

      // Fast-forward default duration (usually 4-5 seconds)
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.queryByText('Auto dismiss test')).not.toBeInTheDocument();
      });
    });

    it('should respect custom duration', async () => {
      render(<Toaster />);

      act(() => {
        toast('Custom duration', { duration: 1000 });
      });

      expect(screen.getByText('Custom duration')).toBeInTheDocument();

      // Should still be visible at 900ms
      act(() => {
        jest.advanceTimersByTime(900);
      });
      expect(screen.getByText('Custom duration')).toBeInTheDocument();

      // Should be dismissed after 1000ms
      act(() => {
        jest.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(screen.queryByText('Custom duration')).not.toBeInTheDocument();
      });
    });

    it('should handle Infinity duration (no auto-dismiss)', async () => {
      render(<Toaster />);

      act(() => {
        toast('Persistent toast', { duration: Infinity });
      });

      expect(screen.getByText('Persistent toast')).toBeInTheDocument();

      // Even after a long time, toast should still be visible
      act(() => {
        jest.advanceTimersByTime(100000);
      });

      expect(screen.getByText('Persistent toast')).toBeInTheDocument();
    });

    it('should pause dismiss timer on hover', async () => {
      const user = userEvent.setup({ delay: null });
      render(<Toaster />);

      act(() => {
        toast('Hover pause test', { duration: 2000 });
      });

      const toastElement = screen.getByText('Hover pause test');

      // Advance timer partially
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Hover over toast (should pause timer)
      await user.hover(toastElement);

      // Advance timer more than remaining duration
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Toast should still be visible (timer was paused)
      expect(screen.getByText('Hover pause test')).toBeInTheDocument();

      // Unhover
      await user.unhover(toastElement);

      // Now advance the remaining time
      act(() => {
        jest.advanceTimersByTime(1100);
      });

      await waitFor(() => {
        expect(screen.queryByText('Hover pause test')).not.toBeInTheDocument();
      });
    });
  });

  describe('Swipe to Dismiss', () => {
    it('should dismiss on swipe right', async () => {
      const user = userEvent.setup();
      render(<Toaster />);

      act(() => {
        toast('Swipe test');
      });

      const toastElement = screen.getByText('Swipe test').closest('[role="status"]');
      
      if (toastElement) {
        // Simulate swipe right
        fireEvent.pointerDown(toastElement, { clientX: 0, clientY: 0 });
        fireEvent.pointerMove(toastElement, { clientX: 100, clientY: 0 });
        fireEvent.pointerUp(toastElement, { clientX: 100, clientY: 0 });
      }

      await waitFor(() => {
        expect(screen.queryByText('Swipe test')).not.toBeInTheDocument();
      });
    });

    it('should not dismiss on small swipe', async () => {
      render(<Toaster />);

      act(() => {
        toast('Small swipe test');
      });

      const toastElement = screen.getByText('Small swipe test').closest('[role="status"]');
      
      if (toastElement) {
        // Simulate small swipe (not enough to dismiss)
        fireEvent.pointerDown(toastElement, { clientX: 0, clientY: 0 });
        fireEvent.pointerMove(toastElement, { clientX: 10, clientY: 0 });
        fireEvent.pointerUp(toastElement, { clientX: 10, clientY: 0 });
      }

      // Toast should still be visible
      expect(screen.getByText('Small swipe test')).toBeInTheDocument();
    });

    it('should handle swipe cancellation', async () => {
      render(<Toaster />);

      act(() => {
        toast('Cancel swipe test');
      });

      const toastElement = screen.getByText('Cancel swipe test').closest('[role="status"]');
      
      if (toastElement) {
        // Start swipe
        fireEvent.pointerDown(toastElement, { clientX: 0, clientY: 0 });
        fireEvent.pointerMove(toastElement, { clientX: 50, clientY: 0 });
        
        // Cancel swipe by moving back
        fireEvent.pointerMove(toastElement, { clientX: 0, clientY: 0 });
        fireEvent.pointerUp(toastElement, { clientX: 0, clientY: 0 });
      }

      // Toast should still be visible
      expect(screen.getByText('Cancel swipe test')).toBeInTheDocument();
    });
  });

  describe('Toast Actions', () => {
    it('should handle action button clicks', async () => {
      const actionCallback = jest.fn();
      const user = userEvent.setup();
      
      render(<Toaster />);

      act(() => {
        toast('Action toast', {
          action: {
            label: 'Undo',
            onClick: actionCallback
          }
        });
      });

      const actionButton = await screen.findByText('Undo');
      await user.click(actionButton);

      expect(actionCallback).toHaveBeenCalled();
    });

    it('should handle cancel button', async () => {
      const cancelCallback = jest.fn();
      const user = userEvent.setup();
      
      render(<Toaster />);

      act(() => {
        toast('Cancel toast', {
          cancel: {
            label: 'Cancel',
            onClick: cancelCallback
          }
        });
      });

      const cancelButton = await screen.findByText('Cancel');
      await user.click(cancelButton);

      expect(cancelCallback).toHaveBeenCalled();
    });

    it('should handle close button click', async () => {
      const onDismiss = jest.fn();
      const user = userEvent.setup();
      
      render(<Toaster closeButton />);

      act(() => {
        toast('Closeable toast', { onDismiss });
      });

      // Find close button (usually an X or ×)
      const closeButton = await screen.findByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Closeable toast')).not.toBeInTheDocument();
        expect(onDismiss).toHaveBeenCalled();
      });
    });
  });

  describe('Toast Promises', () => {
    it('should handle promise loading state', async () => {
      render(<Toaster />);

      const promise = new Promise((resolve) => {
        setTimeout(() => resolve('Success!'), 100);
      });

      act(() => {
        toast.promise(promise, {
          loading: 'Loading...',
          success: 'Success!',
          error: 'Error!'
        });
      });

      // Should show loading state first
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      await waitFor(() => {
        // Should show success state after promise resolves
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        expect(screen.getByText('Success!')).toBeInTheDocument();
      });
    });

    it('should handle promise rejection', async () => {
      render(<Toaster />);

      const promise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Failed!')), 100);
      });

      act(() => {
        toast.promise(promise, {
          loading: 'Loading...',
          success: 'Success!',
          error: 'Error occurred!'
        });
      });

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        expect(screen.getByText('Error occurred!')).toBeInTheDocument();
      });
    });

    it('should handle promise with custom error handler', async () => {
      render(<Toaster />);

      const promise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Custom error')), 100);
      });

      act(() => {
        toast.promise(promise, {
          loading: 'Loading...',
          success: 'Success!',
          error: (err: Error) => `Error: ${err.message}`
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Error: Custom error')).toBeInTheDocument();
      });
    });
  });

  describe('Position & Layout', () => {
    it('should render toasts in correct position', () => {
      const positions = [
        'top-left',
        'top-center', 
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right'
      ] as const;

      positions.forEach(position => {
        const { container } = render(<Toaster position={position} />);
        
        act(() => {
          toast(`Toast at ${position}`);
        });

        const toasterContainer = container.querySelector('[data-sonner-toaster]');
        expect(toasterContainer).toHaveAttribute('data-position', position);
      });
    });

    it('should handle expand prop correctly', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<Toaster expand={false} />);

      act(() => {
        toast('Collapsed toast 1');
        toast('Collapsed toast 2');
        toast('Collapsed toast 3');
      });

      // Toasts should be stacked when not expanded
      let toasts = screen.getAllByRole('status');
      expect(toasts).toHaveLength(3);

      // Re-render with expand=true
      rerender(<Toaster expand={true} />);

      // Toasts should be expanded
      toasts = screen.getAllByRole('status');
      expect(toasts).toHaveLength(3);
    });

    it('should handle offset prop', () => {
      const { container } = render(<Toaster offset="100px" />);

      act(() => {
        toast('Offset toast');
      });

      const toaster = container.querySelector('[data-sonner-toaster]');
      const styles = window.getComputedStyle(toaster!);
      
      // Check if offset is applied (exact implementation may vary)
      expect(styles.getPropertyValue('--offset')).toBe('100px');
    });
  });

  describe('Custom Rendering', () => {
    it('should support custom toast component', () => {
      const CustomToast = ({ toast }: any) => (
        <div data-testid="custom-toast">
          Custom: {toast.title}
        </div>
      );

      render(<Toaster toastOptions={{ custom: CustomToast }} />);

      act(() => {
        toast.custom({ title: 'Custom content' });
      });

      expect(screen.getByTestId('custom-toast')).toHaveTextContent('Custom: Custom content');
    });

    it('should handle JSX content in toast', () => {
      render(<Toaster />);

      act(() => {
        toast(
          <div>
            <strong>Bold text</strong>
            <em>Italic text</em>
          </div>
        );
      });

      expect(screen.getByText('Bold text')).toBeInTheDocument();
      expect(screen.getByText('Italic text')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Toaster />);

      act(() => {
        toast('Styled toast', {
          className: 'custom-toast-class'
        });
      });

      const toastElement = screen.getByText('Styled toast').closest('[role="status"]');
      expect(toastElement).toHaveClass('custom-toast-class');
    });

    it('should apply custom styles', () => {
      render(<Toaster />);

      act(() => {
        toast('Styled toast', {
          style: {
            background: 'red',
            color: 'white'
          }
        });
      });

      const toastElement = screen.getByText('Styled toast').closest('[role="status"]');
      expect(toastElement).toHaveStyle({
        background: 'red',
        color: 'white'
      });
    });
  });

  describe('Memory & Performance', () => {
    it('should clean up dismissed toasts from DOM', async () => {
      jest.useFakeTimers();
      render(<Toaster />);

      act(() => {
        toast('Memory test', { duration: 1000 });
      });

      expect(screen.getByText('Memory test')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        // Toast should be completely removed from DOM
        expect(screen.queryByText('Memory test')).not.toBeInTheDocument();
        const toasts = document.querySelectorAll('[role="status"]');
        expect(toasts).toHaveLength(0);
      });

      jest.useRealTimers();
    });

    it('should handle rapid dismiss/recreate cycles', async () => {
      render(<Toaster />);

      for (let i = 0; i < 10; i++) {
        act(() => {
          const id = toast(`Cycle ${i}`);
          toast.dismiss(id);
          toast(`Cycle ${i} recreated`);
        });
      }

      await waitFor(() => {
        const toasts = screen.getAllByRole('status');
        expect(toasts.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Toaster />);

      act(() => {
        toast.success('Success message');
        toast.error('Error message');
        toast.warning('Warning message');
      });

      const toasts = screen.getAllByRole('status');
      toasts.forEach(toast => {
        expect(toast).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Toaster />);

      act(() => {
        toast('Keyboard test', {
          action: {
            label: 'Action',
            onClick: jest.fn()
          }
        });
      });

      const actionButton = await screen.findByText('Action');
      
      // Should be focusable
      actionButton.focus();
      expect(document.activeElement).toBe(actionButton);

      // Should respond to Enter key
      await user.keyboard('[Enter]');
    });

    it('should announce important toasts immediately', () => {
      render(<Toaster />);

      act(() => {
        toast.error('Critical error!', { important: true });
      });

      const errorToast = screen.getByText('Critical error!').closest('[role="status"]');
      expect(errorToast).toHaveAttribute('aria-live', 'assertive');
    });
  });

  describe('Theme Support', () => {
    it('should respect theme prop', () => {
      const { container, rerender } = render(<Toaster theme="light" />);

      act(() => {
        toast('Theme test');
      });

      let toaster = container.querySelector('[data-sonner-toaster]');
      expect(toaster).toHaveAttribute('data-theme', 'light');

      rerender(<Toaster theme="dark" />);

      toaster = container.querySelector('[data-sonner-toaster]');
      expect(toaster).toHaveAttribute('data-theme', 'dark');
    });

    it('should support system theme', () => {
      const { container } = render(<Toaster theme="system" />);

      act(() => {
        toast('System theme test');
      });

      const toaster = container.querySelector('[data-sonner-toaster]');
      expect(toaster).toHaveAttribute('data-theme', 'system');
    });
  });
});
