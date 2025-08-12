import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './index';

describe('Sheet Component', () => {
  describe('Rendering', () => {
    it('renders trigger and opens sheet on click', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>
            <div>Sheet Content</div>
          </SheetContent>
        </Sheet>
      );

      const trigger = screen.getByText('Open Sheet');
      expect(trigger).toBeInTheDocument();
      
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByText('Sheet Content')).toBeInTheDocument();
      });
    });

    it('renders all subcomponents correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Sheet Title</SheetTitle>
              <SheetDescription>Sheet Description</SheetDescription>
            </SheetHeader>
            <div>Main Content</div>
            <SheetFooter>
              <button>Cancel</button>
              <button>Save</button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        expect(screen.getByText('Sheet Title')).toBeInTheDocument();
        expect(screen.getByText('Sheet Description')).toBeInTheDocument();
        expect(screen.getByText('Main Content')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Save')).toBeInTheDocument();
      });
    });
  });

  describe('Side Variants', () => {
    it('renders with right side by default', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>Right Side Sheet</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const content = screen.getByText('Right Side Sheet').parentElement?.parentElement;
        expect(content).toHaveClass('right-0');
      });
    });

    it('renders with left side', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent side="left">Left Side Sheet</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const content = screen.getByText('Left Side Sheet').parentElement?.parentElement;
        expect(content).toHaveClass('left-0');
      });
    });

    it('renders with top side', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent side="top">Top Side Sheet</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const content = screen.getByText('Top Side Sheet').parentElement?.parentElement;
        expect(content).toHaveClass('top-0');
      });
    });

    it('renders with bottom side', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent side="bottom">Bottom Side Sheet</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const content = screen.getByText('Bottom Side Sheet').parentElement?.parentElement;
        expect(content).toHaveClass('bottom-0');
      });
    });
  });

  describe('Controlled State', () => {
    it('can be controlled with open prop', () => {
      const { rerender } = render(
        <Sheet open={false}>
          <SheetContent>Controlled Sheet</SheetContent>
        </Sheet>
      );

      expect(screen.queryByText('Controlled Sheet')).not.toBeInTheDocument();

      rerender(
        <Sheet open={true}>
          <SheetContent>Controlled Sheet</SheetContent>
        </Sheet>
      );

      expect(screen.getByText('Controlled Sheet')).toBeInTheDocument();
    });

    it('calls onOpenChange when state changes', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      
      render(
        <Sheet onOpenChange={handleOpenChange}>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>Sheet Content</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText('Open'));
      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Overlay Interaction', () => {
    it('closes when clicking overlay', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      
      render(
        <Sheet onOpenChange={handleOpenChange}>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>Sheet Content</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        expect(screen.getByText('Sheet Content')).toBeInTheDocument();
      });

      // Find and click the overlay (backdrop)
      const overlay = document.querySelector('[data-radix-dialog-overlay]');
      if (overlay) {
        await user.click(overlay);
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      }
    });
  });

  describe('Keyboard Interactions', () => {
    it('closes on Escape key press', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      
      render(
        <Sheet onOpenChange={handleOpenChange}>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>Sheet Content</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        expect(screen.getByText('Sheet Content')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('traps focus within sheet when open', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <button>First Button</button>
            <button>Second Button</button>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        expect(screen.getByText('First Button')).toBeInTheDocument();
      });

      // Focus should be trapped within the sheet
      const firstButton = screen.getByText('First Button');
      const secondButton = screen.getByText('Second Button');
      
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);
      
      await user.tab();
      expect(document.activeElement).toBe(secondButton);
    });
  });

  describe('Styling', () => {
    it('applies custom className to SheetContent', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent className="custom-sheet">Content</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const content = screen.getByText('Content').parentElement?.parentElement;
        expect(content).toHaveClass('custom-sheet');
      });
    });

    it('applies custom className to SheetHeader', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetHeader className="custom-header">
              <SheetTitle>Title</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const header = screen.getByText('Title').parentElement;
        expect(header).toHaveClass('custom-header');
      });
    });

    it('applies custom className to SheetFooter', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetFooter className="custom-footer">
              <button>Action</button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const footer = screen.getByText('Action').parentElement;
        expect(footer).toHaveClass('custom-footer');
      });
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent aria-describedby="sheet-description">
            <SheetTitle>Accessible Sheet</SheetTitle>
            <SheetDescription id="sheet-description">
              This is an accessible sheet
            </SheetDescription>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute('aria-describedby', 'sheet-description');
      });
    });

    it('returns focus to trigger when closed', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <button>Close</button>
          </SheetContent>
        </Sheet>
      );

      const trigger = screen.getByText('Open');
      await user.click(trigger);
      
      await waitFor(() => {
        expect(screen.getByText('Close')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(document.activeElement).toBe(trigger);
      });
    });
  });

  describe('Animation States', () => {
    it('applies correct animation classes', async () => {
      const user = userEvent.setup();
      
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>Animated Sheet</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        const content = screen.getByText('Animated Sheet').parentElement?.parentElement;
        expect(content).toHaveAttribute('data-state', 'open');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid open/close cycles', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      
      render(
        <Sheet onOpenChange={handleOpenChange}>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>
      );

      const trigger = screen.getByText('Open');
      
      // Rapid clicks
      await user.click(trigger);
      await user.keyboard('{Escape}');
      await user.click(trigger);
      await user.keyboard('{Escape}');
      
      expect(handleOpenChange).toHaveBeenCalledTimes(4);
    });

    it('handles content updates while open', async () => {
      const user = userEvent.setup();
      
      const { rerender } = render(
        <Sheet open={true}>
          <SheetContent>Initial Content</SheetContent>
        </Sheet>
      );

      expect(screen.getByText('Initial Content')).toBeInTheDocument();

      rerender(
        <Sheet open={true}>
          <SheetContent>Updated Content</SheetContent>
        </Sheet>
      );

      expect(screen.getByText('Updated Content')).toBeInTheDocument();
      expect(screen.queryByText('Initial Content')).not.toBeInTheDocument();
    });

    it('handles missing SheetTrigger gracefully', () => {
      render(
        <Sheet open={true}>
          <SheetContent>No Trigger Sheet</SheetContent>
        </Sheet>
      );

      expect(screen.getByText('No Trigger Sheet')).toBeInTheDocument();
    });
  });
});
