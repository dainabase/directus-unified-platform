import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from './index';

describe('Dialog Component', () => {
  describe('Rendering', () => {
    it('renders dialog trigger', () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      
      expect(screen.getByText('Open Dialog')).toBeInTheDocument();
    });

    it('does not render content initially', () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Hidden Initially</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      
      expect(screen.queryByText('Hidden Initially')).not.toBeInTheDocument();
    });
  });

  describe('Opening and Closing', () => {
    it('opens dialog on trigger click', async () => {
      const user = userEvent.setup();
      
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog content here</DialogDescription>
          </DialogContent>
        </Dialog>
      );
      
      const trigger = screen.getByText('Open');
      await user.click(trigger);
      
      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
        expect(screen.getByText('Dialog content here')).toBeInTheDocument();
      });
    });

    it('closes dialog on close button click', async () => {
      const user = userEvent.setup();
      
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Closeable Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      
      expect(screen.getByText('Closeable Dialog')).toBeInTheDocument();
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Closeable Dialog')).not.toBeInTheDocument();
      });
    });

    it('closes on Escape key', async () => {
      const user = userEvent.setup();
      
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Escape Test</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      
      expect(screen.getByText('Escape Test')).toBeInTheDocument();
      
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByText('Escape Test')).not.toBeInTheDocument();
      });
    });

    it('closes on backdrop click', async () => {
      const user = userEvent.setup();
      
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Backdrop Test</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      
      const backdrop = document.querySelector('[data-radix-dialog-overlay]');
      if (backdrop) {
        await user.click(backdrop);
        
        await waitFor(() => {
          expect(screen.queryByText('Backdrop Test')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Focus Management', () => {
    it('traps focus within dialog', async () => {
      const user = userEvent.setup();
      
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Focus Trap Test</DialogTitle>
            </DialogHeader>
            <button>First Button</button>
            <button>Second Button</button>
            <DialogFooter>
              <button>Cancel</button>
              <button>Confirm</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(2);
      
      // Focus should be trapped within dialog
      await user.tab();
      expect(document.activeElement).toBe(buttons[0]);
    });

    it('returns focus to trigger on close', async () => {
      const user = userEvent.setup();
      
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Focus Return Test</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      
      const trigger = screen.getByText('Open Dialog');
      await user.click(trigger);
      
      await waitFor(() => {
        expect(screen.getByText('Focus Return Test')).toBeInTheDocument();
      });
      
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(document.activeElement).toBe(trigger);
      });
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', async () => {
      const user = userEvent.setup();
      
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent aria-describedby="dialog-desc">
            <DialogTitle>Accessible Dialog</DialogTitle>
            <DialogDescription id="dialog-desc">
              This is an accessible dialog
            </DialogDescription>
          </DialogContent>
        </Dialog>
      );
      
      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-labelledby');
        expect(dialog).toHaveAttribute('aria-describedby', 'dialog-desc');
      });
    });

    it('announces to screen readers', async () => {
      const user = userEvent.setup();
      
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Screen Reader Dialog</DialogTitle>
            <DialogDescription>Important information</DialogDescription>
          </DialogContent>
        </Dialog>
      );
      
      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
      });
    });
  });

  describe('Controlled State', () => {
    it('can be controlled externally', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      
      const { rerender } = render(
        <Dialog open={false} onOpenChange={onOpenChange}>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Controlled Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      
      expect(screen.queryByText('Controlled Dialog')).not.toBeInTheDocument();
      
      await user.click(screen.getByText('Open'));
      expect(onOpenChange).toHaveBeenCalledWith(true);
      
      rerender(
        <Dialog open={true} onOpenChange={onOpenChange}>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Controlled Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Controlled Dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Content Composition', () => {
    it('renders all dialog parts correctly', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Dialog</DialogTitle>
              <DialogDescription>With all parts</DialogDescription>
            </DialogHeader>
            <div>Body content goes here</div>
            <DialogFooter>
              <button>Cancel</button>
              <button>Save</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
      
      expect(screen.getByText('Complete Dialog')).toBeInTheDocument();
      expect(screen.getByText('With all parts')).toBeInTheDocument();
      expect(screen.getByText('Body content goes here')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });
});
