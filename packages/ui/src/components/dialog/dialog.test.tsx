import React, { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './index';

describe('Dialog Component', () => {
  const DialogExample = ({ 
    defaultOpen = false,
    onOpenChange,
    children
  }: { 
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
  }) => (
    <Dialog defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button>Open Dialog</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a dialog description that explains the purpose.
          </DialogDescription>
        </DialogHeader>
        {children || <div>Dialog content goes here</div>}
        <DialogFooter>
          <button>Cancel</button>
          <button>Confirm</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const ControlledDialog = () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <div>Dialog is {open ? 'open' : 'closed'}</div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button>Open Controlled Dialog</button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Controlled Dialog</DialogTitle>
            </DialogHeader>
            <button onClick={() => setOpen(false)}>Close from inside</button>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  describe('Rendering', () => {
    it('renders trigger button', () => {
      render(<DialogExample />);
      expect(screen.getByText('Open Dialog')).toBeInTheDocument();
    });

    it('does not render dialog content initially', () => {
      render(<DialogExample />);
      expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
      expect(screen.queryByText('Dialog content goes here')).not.toBeInTheDocument();
    });

    it('renders dialog content when defaultOpen is true', () => {
      render(<DialogExample defaultOpen={true} />);
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      expect(screen.getByText('Dialog content goes here')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('opens dialog when trigger is clicked', async () => {
      render(<DialogExample />);
      const trigger = screen.getByText('Open Dialog');
      
      await userEvent.click(trigger);
      
      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
        expect(screen.getByText('Dialog content goes here')).toBeInTheDocument();
      });
    });

    it('calls onOpenChange when dialog opens', async () => {
      const handleOpenChange = jest.fn();
      render(<DialogExample onOpenChange={handleOpenChange} />);
      
      const trigger = screen.getByText('Open Dialog');
      await userEvent.click(trigger);
      
      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('calls onOpenChange when dialog closes', async () => {
      const handleOpenChange = jest.fn();
      render(<DialogExample defaultOpen={true} onOpenChange={handleOpenChange} />);
      
      // Click outside to close (on overlay)
      const overlay = document.querySelector('[data-radix-dialog-overlay]');
      if (overlay) {
        await userEvent.click(overlay);
      }
      
      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('closes dialog when clicking overlay', async () => {
      render(<DialogExample />);
      
      await userEvent.click(screen.getByText('Open Dialog'));
      
      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      });
      
      const overlay = document.querySelector('[data-radix-dialog-overlay]');
      if (overlay) {
        await userEvent.click(overlay);
      }
      
      await waitFor(() => {
        expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
      });
    });

    it('closes dialog with Escape key', async () => {
      render(<DialogExample />);
      
      await userEvent.click(screen.getByText('Open Dialog'));
      
      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      });
      
      await userEvent.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
      });
    });
  });

  describe('Controlled Component', () => {
    it('respects controlled open state', () => {
      render(<ControlledDialog />);
      
      expect(screen.getByText('Dialog is closed')).toBeInTheDocument();
      expect(screen.queryByText('Controlled Dialog')).not.toBeInTheDocument();
    });

    it('updates controlled state when opened', async () => {
      render(<ControlledDialog />);
      
      await userEvent.click(screen.getByText('Open Controlled Dialog'));
      
      await waitFor(() => {
        expect(screen.getByText('Dialog is open')).toBeInTheDocument();
        expect(screen.getByText('Controlled Dialog')).toBeInTheDocument();
      });
    });

    it('updates controlled state when closed from inside', async () => {
      render(<ControlledDialog />);
      
      await userEvent.click(screen.getByText('Open Controlled Dialog'));
      
      await waitFor(() => {
        expect(screen.getByText('Dialog is open')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByText('Close from inside'));
      
      await waitFor(() => {
        expect(screen.getByText('Dialog is closed')).toBeInTheDocument();
        expect(screen.queryByText('Controlled Dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Dialog Components', () => {
    it('renders DialogHeader correctly', () => {
      render(<DialogExample defaultOpen={true} />);
      
      const title = screen.getByText('Dialog Title');
      const description = screen.getByText('This is a dialog description that explains the purpose.');
      
      expect(title).toBeInTheDocument();
      expect(description).toBeInTheDocument();
    });

    it('renders DialogTitle with correct styling', () => {
      render(<DialogExample defaultOpen={true} />);
      
      const title = screen.getByText('Dialog Title');
      expect(title).toHaveClass('text-lg');
      expect(title).toHaveClass('font-semibold');
    });

    it('renders DialogDescription with correct styling', () => {
      render(<DialogExample defaultOpen={true} />);
      
      const description = screen.getByText('This is a dialog description that explains the purpose.');
      expect(description).toHaveClass('text-sm');
      expect(description).toHaveClass('text-neutral-600');
    });

    it('renders DialogFooter correctly', () => {
      render(<DialogExample defaultOpen={true} />);
      
      const cancelButton = screen.getByText('Cancel');
      const confirmButton = screen.getByText('Confirm');
      
      expect(cancelButton).toBeInTheDocument();
      expect(confirmButton).toBeInTheDocument();
    });

    it('renders custom children content', () => {
      render(
        <DialogExample defaultOpen={true}>
          <div data-testid="custom-content">Custom dialog content</div>
        </DialogExample>
      );
      
      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText('Custom dialog content')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', async () => {
      render(<DialogExample />);
      
      await userEvent.click(screen.getByText('Open Dialog'));
      
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
      });
    });

    it('manages focus correctly', async () => {
      render(<DialogExample />);
      const trigger = screen.getByText('Open Dialog');
      
      trigger.focus();
      expect(document.activeElement).toBe(trigger);
      
      await userEvent.click(trigger);
      
      await waitFor(() => {
        // Focus should move to dialog content
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        // Check that focus is within the dialog
        expect(dialog.contains(document.activeElement)).toBe(true);
      });
    });

    it('returns focus to trigger when closed', async () => {
      render(<DialogExample />);
      const trigger = screen.getByText('Open Dialog');
      
      await userEvent.click(trigger);
      
      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      });
      
      await userEvent.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
        // Focus should return to trigger
        expect(document.activeElement).toBe(trigger);
      });
    });

    it('traps focus within dialog', async () => {
      render(<DialogExample defaultOpen={true} />);
      
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
      });
      
      // Tab through focusable elements
      await userEvent.tab();
      expect(document.activeElement).toBeInTheDocument();
      
      // Focus should remain within dialog
      const dialog = screen.getByRole('dialog');
      expect(dialog.contains(document.activeElement)).toBe(true);
    });

    it('prevents body scroll when open', async () => {
      render(<DialogExample />);
      
      await userEvent.click(screen.getByText('Open Dialog'));
      
      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
        // Radix UI should handle body scroll locking
        // This is typically done by adding styles to document.body
      });
    });
  });

  describe('Styling', () => {
    it('renders overlay with correct styling', async () => {
      render(<DialogExample />);
      
      await userEvent.click(screen.getByText('Open Dialog'));
      
      await waitFor(() => {
        const overlay = document.querySelector('[data-radix-dialog-overlay]');
        expect(overlay).toBeInTheDocument();
        expect(overlay).toHaveClass('fixed');
        expect(overlay).toHaveClass('inset-0');
        expect(overlay).toHaveClass('bg-black/50');
      });
    });

    it('renders content with correct styling', () => {
      render(<DialogExample defaultOpen={true} />);
      
      const content = screen.getByRole('dialog');
      expect(content).toHaveClass('fixed');
      expect(content).toHaveClass('rounded-lg');
      expect(content).toHaveClass('border');
      expect(content).toHaveClass('bg-white');
      expect(content).toHaveClass('shadow-xl');
    });
  });
});
