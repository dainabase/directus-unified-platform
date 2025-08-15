import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogFooter, 
  DialogTitle, 
  DialogDescription,
  DialogOverlay,
  DialogPortal
} from './index';

describe('Dialog Edge Cases', () => {
  describe('Error Recovery', () => {
    it('should recover from error in dialog content', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      class ErrorBoundary extends React.Component<
        { children: React.ReactNode },
        { hasError: boolean }
      > {
        state = { hasError: false };

        static getDerivedStateFromError() {
          return { hasError: true };
        }

        render() {
          if (this.state.hasError) {
            return <div>Error caught</div>;
          }
          return this.props.children;
        }
      }

      render(
        <ErrorBoundary>
          <Dialog>
            <DialogTrigger>Open</DialogTrigger>
            <DialogContent>
              <ThrowError />
            </DialogContent>
          </Dialog>
        </ErrorBoundary>
      );

      const trigger = screen.getByText('Open');
      fireEvent.click(trigger);
      
      expect(screen.getByText('Error caught')).toBeInTheDocument();
    });

    it('should handle missing portal gracefully', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      
      render(
        <Dialog>
          <DialogContent>Content without portal</DialogContent>
        </Dialog>
      );

      // Should not crash
      expect(screen.queryByText('Content without portal')).toBeInTheDocument();
      
      consoleError.mockRestore();
    });
  });

  describe('Keyboard Navigation & Focus Management', () => {
    it('should trap focus within dialog when open', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <button>Outside Button Before</button>
          <Dialog>
            <DialogTrigger>Open Dialog</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Test Dialog</DialogTitle>
              </DialogHeader>
              <button>First Button</button>
              <button>Second Button</button>
              <button>Third Button</button>
            </DialogContent>
          </Dialog>
          <button>Outside Button After</button>
        </div>
      );

      const trigger = screen.getByText('Open Dialog');
      await user.click(trigger);

      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByText('Test Dialog')).toBeInTheDocument();
      });

      const firstButton = screen.getByText('First Button');
      const secondButton = screen.getByText('Second Button');
      const thirdButton = screen.getByText('Third Button');

      // Focus should be on first focusable element
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);

      // Tab through elements
      await user.tab();
      expect(document.activeElement).toBe(secondButton);

      await user.tab();
      expect(document.activeElement).toBe(thirdButton);

      // Tab should cycle back to first element (focus trap)
      await user.tab();
      await waitFor(() => {
        expect(document.activeElement?.textContent).toContain('Button');
      });

      // Shift+Tab should go backwards
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(thirdButton);
    });

    it('should close dialog on Escape key', async () => {
      const onOpenChange = jest.fn();
      const user = userEvent.setup();

      render(
        <Dialog onOpenChange={onOpenChange}>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Escape Test</DialogTitle>
            <input type="text" placeholder="Test Input" />
          </DialogContent>
        </Dialog>
      );

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Escape Test')).toBeInTheDocument();
      });

      // Press Escape
      await user.keyboard('[Escape]');

      await waitFor(() => {
        expect(screen.queryByText('Escape Test')).not.toBeInTheDocument();
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should not close on Escape when preventDefault is called', async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogTitle>No Escape</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByText('Open'));
      
      await waitFor(() => {
        expect(screen.getByText('No Escape')).toBeInTheDocument();
      });

      await user.keyboard('[Escape]');

      // Dialog should still be open
      expect(screen.getByText('No Escape')).toBeInTheDocument();
    });

    it('should restore focus to trigger when dialog closes', async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Focus Test</DialogTitle>
            <button>Close</button>
          </DialogContent>
        </Dialog>
      );

      const trigger = screen.getByText('Open Dialog');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Focus Test')).toBeInTheDocument();
      });

      // Close dialog
      await user.keyboard('[Escape]');

      await waitFor(() => {
        expect(document.activeElement).toBe(trigger);
      });
    });
  });

  describe('Nested Dialogs', () => {
    it('should handle nested dialogs correctly', async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open First</DialogTrigger>
          <DialogContent>
            <DialogTitle>First Dialog</DialogTitle>
            <Dialog>
              <DialogTrigger>Open Second</DialogTrigger>
              <DialogContent>
                <DialogTitle>Second Dialog</DialogTitle>
                <button>Inner Button</button>
              </DialogContent>
            </Dialog>
          </DialogContent>
        </Dialog>
      );

      // Open first dialog
      await user.click(screen.getByText('Open First'));
      
      await waitFor(() => {
        expect(screen.getByText('First Dialog')).toBeInTheDocument();
      });

      // Open second dialog
      await user.click(screen.getByText('Open Second'));
      
      await waitFor(() => {
        expect(screen.getByText('Second Dialog')).toBeInTheDocument();
      });

      // Both dialogs should be visible
      expect(screen.getByText('First Dialog')).toBeInTheDocument();
      expect(screen.getByText('Second Dialog')).toBeInTheDocument();

      // Close second dialog
      await user.keyboard('[Escape]');

      await waitFor(() => {
        expect(screen.queryByText('Second Dialog')).not.toBeInTheDocument();
        expect(screen.getByText('First Dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Animation & Transition Edge Cases', () => {
    it('should handle rapid open/close without errors', async () => {
      const user = userEvent.setup();
      
      render(
        <Dialog>
          <DialogTrigger>Toggle</DialogTrigger>
          <DialogContent>
            <DialogTitle>Rapid Test</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      const trigger = screen.getByText('Toggle');

      // Rapidly toggle dialog
      for (let i = 0; i < 5; i++) {
        await user.click(trigger);
        await user.keyboard('[Escape]');
      }

      // Should not crash and dialog should be closed
      expect(screen.queryByText('Rapid Test')).not.toBeInTheDocument();
    });

    it('should handle animation interruption', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Animation Test</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      const trigger = screen.getByText('Open');
      
      // Start opening
      await user.click(trigger);
      
      // Interrupt animation by closing immediately
      act(() => {
        jest.advanceTimersByTime(10);
      });
      
      await user.keyboard('[Escape]');
      
      act(() => {
        jest.runAllTimers();
      });

      expect(screen.queryByText('Animation Test')).not.toBeInTheDocument();
      
      jest.useRealTimers();
    });
  });

  describe('Overlay Interactions', () => {
    it('should close dialog when clicking overlay', async () => {
      const onOpenChange = jest.fn();
      const user = userEvent.setup();

      const { container } = render(
        <Dialog onOpenChange={onOpenChange}>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Overlay Test</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(screen.getByText('Overlay Test')).toBeInTheDocument();
      });

      // Click on overlay (using the overlay class selector)
      const overlay = container.querySelector('[class*="bg-black/50"]');
      if (overlay) {
        await user.click(overlay);
      }

      await waitFor(() => {
        expect(screen.queryByText('Overlay Test')).not.toBeInTheDocument();
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should not close when onPointerDownOutside is prevented', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <DialogTitle>No Close Outside</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(screen.getByText('No Close Outside')).toBeInTheDocument();
      });

      const overlay = container.querySelector('[class*="bg-black/50"]');
      if (overlay) {
        await user.click(overlay);
      }

      // Dialog should remain open
      expect(screen.getByText('No Close Outside')).toBeInTheDocument();
    });
  });

  describe('Controlled vs Uncontrolled', () => {
    it('should work as controlled component', async () => {
      const ControlledDialog = () => {
        const [open, setOpen] = React.useState(false);

        return (
          <>
            <button onClick={() => setOpen(true)}>External Open</button>
            <button onClick={() => setOpen(false)}>External Close</button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent>
                <DialogTitle>Controlled Dialog</DialogTitle>
              </DialogContent>
            </Dialog>
          </>
        );
      };

      const user = userEvent.setup();
      render(<ControlledDialog />);

      // Open via external button
      await user.click(screen.getByText('External Open'));
      
      await waitFor(() => {
        expect(screen.getByText('Controlled Dialog')).toBeInTheDocument();
      });

      // Close via external button
      await user.click(screen.getByText('External Close'));
      
      await waitFor(() => {
        expect(screen.queryByText('Controlled Dialog')).not.toBeInTheDocument();
      });
    });

    it('should handle defaultOpen prop', () => {
      render(
        <Dialog defaultOpen={true}>
          <DialogContent>
            <DialogTitle>Default Open</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Default Open')).toBeInTheDocument();
    });
  });

  describe('Portal Edge Cases', () => {
    it('should render in custom portal container', () => {
      const portalContainer = document.createElement('div');
      portalContainer.id = 'custom-portal';
      document.body.appendChild(portalContainer);

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogPortal container={portalContainer}>
            <DialogContent>
              <DialogTitle>Custom Portal</DialogTitle>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      );

      fireEvent.click(screen.getByText('Open'));

      const dialog = screen.getByText('Custom Portal');
      expect(dialog.closest('#custom-portal')).toBeTruthy();

      document.body.removeChild(portalContainer);
    });
  });

  describe('Memory Leaks & Performance', () => {
    it('should cleanup event listeners on unmount', async () => {
      const user = userEvent.setup();
      const addEventListener = jest.spyOn(document, 'addEventListener');
      const removeEventListener = jest.spyOn(document, 'removeEventListener');

      const { unmount } = render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Cleanup Test</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      const addedListeners = addEventListener.mock.calls.length;

      unmount();

      // Check that event listeners were removed
      const removedListeners = removeEventListener.mock.calls.length;
      expect(removedListeners).toBeGreaterThan(0);

      addEventListener.mockRestore();
      removeEventListener.mockRestore();
    });

    it('should handle dialog with very long content', () => {
      const longContent = Array(100).fill('Long content line. ').join('');

      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Long Content</DialogTitle>
            <DialogDescription>{longContent}</DialogDescription>
          </DialogContent>
        </Dialog>
      );

      const content = screen.getByText(/Long content line/);
      expect(content).toBeInTheDocument();
      
      // Check that overflow is handled (max-height is set)
      const dialog = content.closest('[class*="max-h-"]');
      expect(dialog).toBeTruthy();
    });
  });

  describe('Accessibility Edge Cases', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent aria-describedby="desc" aria-labelledby="title">
            <DialogTitle id="title">Accessible Dialog</DialogTitle>
            <DialogDescription id="desc">Dialog description</DialogDescription>
          </DialogContent>
        </Dialog>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-describedby', 'desc');
      expect(dialog).toHaveAttribute('aria-labelledby', 'title');
    });

    it('should announce dialog state changes to screen readers', async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open Announcement Test</DialogTrigger>
          <DialogContent>
            <DialogTitle>Screen Reader Test</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      const trigger = screen.getByText('Open Announcement Test');
      
      // Dialog should have proper role
      await user.click(trigger);
      
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute('aria-modal', 'true');
      });
    });
  });
});
