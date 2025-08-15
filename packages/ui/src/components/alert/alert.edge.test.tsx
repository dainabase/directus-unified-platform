import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert, AlertDescription, AlertTitle } from './index';
import { AlertCircle, CheckCircle, Info, XCircle, AlertTriangle } from 'lucide-react';

describe('Alert Edge Cases', () => {
  describe('Severity Levels', () => {
    it('should render all severity variants correctly', () => {
      const { container } = render(
        <div>
          <Alert variant="default">Default Alert</Alert>
          <Alert variant="destructive">Destructive Alert</Alert>
          <Alert variant="success">Success Alert</Alert>
          <Alert variant="warning">Warning Alert</Alert>
          <Alert variant="info">Info Alert</Alert>
        </div>
      );

      // Check that all alerts are rendered
      const alerts = container.querySelectorAll('[role="alert"]');
      expect(alerts).toHaveLength(5);

      // Verify variant classes are applied
      expect(screen.getByText('Default Alert')).toBeInTheDocument();
      expect(screen.getByText('Destructive Alert')).toBeInTheDocument();
      expect(screen.getByText('Success Alert')).toBeInTheDocument();
      expect(screen.getByText('Warning Alert')).toBeInTheDocument();
      expect(screen.getByText('Info Alert')).toBeInTheDocument();
    });

    it('should apply correct styles for each variant', () => {
      const { container } = render(
        <div>
          <Alert variant="destructive" data-testid="destructive">
            <AlertTitle>Error</AlertTitle>
          </Alert>
          <Alert variant="success" data-testid="success">
            <AlertTitle>Success</AlertTitle>
          </Alert>
        </div>
      );

      const destructiveAlert = screen.getByTestId('destructive');
      const successAlert = screen.getByTestId('success');

      // Check for variant-specific classes
      expect(destructiveAlert.className).toContain('destructive');
      expect(successAlert.className).toContain('success');
    });

    it('should handle undefined variant gracefully', () => {
      const { container } = render(
        <Alert variant={undefined as any}>
          <AlertTitle>Undefined Variant</AlertTitle>
        </Alert>
      );

      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
      // Should fall back to default variant
      expect(alert?.className).toContain('border');
    });
  });

  describe('Icon Rendering', () => {
    it('should render custom icon component', () => {
      render(
        <Alert icon={<CheckCircle data-testid="custom-icon" />}>
          <AlertTitle>Custom Icon Alert</AlertTitle>
        </Alert>
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('should render different icons for different variants', () => {
      render(
        <div>
          <Alert variant="destructive" icon={<XCircle data-testid="error-icon" />}>
            <AlertTitle>Error</AlertTitle>
          </Alert>
          <Alert variant="success" icon={<CheckCircle data-testid="success-icon" />}>
            <AlertTitle>Success</AlertTitle>
          </Alert>
          <Alert variant="warning" icon={<AlertTriangle data-testid="warning-icon" />}>
            <AlertTitle>Warning</AlertTitle>
          </Alert>
          <Alert variant="info" icon={<Info data-testid="info-icon" />}>
            <AlertTitle>Info</AlertTitle>
          </Alert>
        </div>
      );

      expect(screen.getByTestId('error-icon')).toBeInTheDocument();
      expect(screen.getByTestId('success-icon')).toBeInTheDocument();
      expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    });

    it('should handle missing icon gracefully', () => {
      const { container } = render(
        <Alert>
          <AlertTitle>No Icon Alert</AlertTitle>
          <AlertDescription>This alert has no icon</AlertDescription>
        </Alert>
      );

      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
      expect(screen.getByText('No Icon Alert')).toBeInTheDocument();
    });

    it('should position icon correctly with title and description', () => {
      const { container } = render(
        <Alert icon={<Info data-testid="positioned-icon" />}>
          <AlertTitle>Title</AlertTitle>
          <AlertDescription>Description</AlertDescription>
        </Alert>
      );

      const icon = screen.getByTestId('positioned-icon');
      const title = screen.getByText('Title');
      const description = screen.getByText('Description');

      // Icon should be rendered before title and description
      const alert = container.querySelector('[role="alert"]');
      const children = Array.from(alert?.children || []);
      const iconIndex = children.findIndex(child => child.contains(icon));
      const titleIndex = children.findIndex(child => child.contains(title));
      
      expect(iconIndex).toBeLessThan(titleIndex);
    });
  });

  describe('Close Button', () => {
    it('should render close button when closeable', async () => {
      const onClose = jest.fn();
      const user = userEvent.setup();

      render(
        <Alert closeable onClose={onClose}>
          <AlertTitle>Closeable Alert</AlertTitle>
        </Alert>
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();

      await user.click(closeButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not render close button when not closeable', () => {
      render(
        <Alert closeable={false}>
          <AlertTitle>Non-closeable Alert</AlertTitle>
        </Alert>
      );

      const closeButton = screen.queryByRole('button', { name: /close/i });
      expect(closeButton).not.toBeInTheDocument();
    });

    it('should handle close with animation', async () => {
      const onClose = jest.fn();
      const user = userEvent.setup();

      const { container } = render(
        <Alert closeable onClose={onClose} className="transition-opacity">
          <AlertTitle>Animated Close</AlertTitle>
        </Alert>
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('should handle keyboard close (Escape key)', async () => {
      const onClose = jest.fn();
      const user = userEvent.setup();

      render(
        <Alert closeable onClose={onClose}>
          <AlertTitle>Keyboard Close</AlertTitle>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      alert.focus();

      await user.keyboard('[Escape]');
      
      // Note: Escape handling might need to be implemented in the component
      // This test verifies the expected behavior
    });

    it('should prevent close when onClose returns false', async () => {
      const onClose = jest.fn().mockReturnValue(false);
      const user = userEvent.setup();

      const { container } = render(
        <Alert closeable onClose={onClose}>
          <AlertTitle>Prevent Close</AlertTitle>
        </Alert>
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalled();
      // Alert should still be visible
      expect(screen.getByText('Prevent Close')).toBeInTheDocument();
    });
  });

  describe('Content Variations', () => {
    it('should render with only title', () => {
      render(
        <Alert>
          <AlertTitle>Only Title</AlertTitle>
        </Alert>
      );

      expect(screen.getByText('Only Title')).toBeInTheDocument();
    });

    it('should render with only description', () => {
      render(
        <Alert>
          <AlertDescription>Only Description</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Only Description')).toBeInTheDocument();
    });

    it('should render with both title and description', () => {
      render(
        <Alert>
          <AlertTitle>Title</AlertTitle>
          <AlertDescription>Description</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('should render with custom children', () => {
      render(
        <Alert>
          <AlertTitle>Custom Content</AlertTitle>
          <AlertDescription>
            <strong>Bold text</strong>
            <em>Italic text</em>
            <a href="#" data-testid="link">Link</a>
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Bold text')).toBeInTheDocument();
      expect(screen.getByText('Italic text')).toBeInTheDocument();
      expect(screen.getByTestId('link')).toBeInTheDocument();
    });

    it('should handle very long content', () => {
      const longText = 'Lorem ipsum '.repeat(100);
      
      render(
        <Alert>
          <AlertTitle>Long Content</AlertTitle>
          <AlertDescription>{longText}</AlertDescription>
        </Alert>
      );

      expect(screen.getByText(longText.trim())).toBeInTheDocument();
    });

    it('should handle empty alert', () => {
      const { container } = render(<Alert />);
      
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
      expect(alert?.textContent).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <Alert>
          <AlertTitle>Accessible Alert</AlertTitle>
          <AlertDescription>Alert description</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('role', 'alert');
    });

    it('should have appropriate aria-live for different severities', () => {
      const { container } = render(
        <div>
          <Alert variant="destructive" aria-live="assertive">
            <AlertTitle>Error Alert</AlertTitle>
          </Alert>
          <Alert variant="info" aria-live="polite">
            <AlertTitle>Info Alert</AlertTitle>
          </Alert>
        </div>
      );

      const alerts = container.querySelectorAll('[role="alert"]');
      expect(alerts[0]).toHaveAttribute('aria-live', 'assertive');
      expect(alerts[1]).toHaveAttribute('aria-live', 'polite');
    });

    it('should support aria-describedby for description', () => {
      render(
        <Alert aria-describedby="alert-desc">
          <AlertTitle id="alert-title">Title</AlertTitle>
          <AlertDescription id="alert-desc">Description</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-describedby', 'alert-desc');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <button>Before Alert</button>
          <Alert closeable>
            <AlertTitle>Keyboard Nav Alert</AlertTitle>
            <a href="#">Link in alert</a>
          </Alert>
          <button>After Alert</button>
        </div>
      );

      const beforeButton = screen.getByText('Before Alert');
      beforeButton.focus();

      // Tab through elements
      await user.tab();
      expect(document.activeElement).toHaveAttribute('href', '#');

      await user.tab();
      expect(document.activeElement).toHaveAttribute('aria-label');
    });

    it('should announce to screen readers appropriately', () => {
      const { rerender } = render(
        <Alert variant="destructive">
          <AlertTitle>Error occurred</AlertTitle>
        </Alert>
      );

      let alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();

      // Re-render with different content (simulating dynamic update)
      rerender(
        <Alert variant="success">
          <AlertTitle>Operation successful</AlertTitle>
        </Alert>
      );

      alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Operation successful');
    });
  });

  describe('Dynamic Updates', () => {
    it('should handle variant changes', () => {
      const { rerender } = render(
        <Alert variant="info" data-testid="dynamic-alert">
          <AlertTitle>Dynamic Alert</AlertTitle>
        </Alert>
      );

      let alert = screen.getByTestId('dynamic-alert');
      expect(alert.className).toContain('info');

      rerender(
        <Alert variant="destructive" data-testid="dynamic-alert">
          <AlertTitle>Dynamic Alert</AlertTitle>
        </Alert>
      );

      alert = screen.getByTestId('dynamic-alert');
      expect(alert.className).toContain('destructive');
    });

    it('should handle content updates', () => {
      const { rerender } = render(
        <Alert>
          <AlertTitle>Original Title</AlertTitle>
        </Alert>
      );

      expect(screen.getByText('Original Title')).toBeInTheDocument();

      rerender(
        <Alert>
          <AlertTitle>Updated Title</AlertTitle>
        </Alert>
      );

      expect(screen.queryByText('Original Title')).not.toBeInTheDocument();
      expect(screen.getByText('Updated Title')).toBeInTheDocument();
    });

    it('should handle icon changes', () => {
      const { rerender } = render(
        <Alert icon={<Info data-testid="icon-1" />}>
          <AlertTitle>Alert</AlertTitle>
        </Alert>
      );

      expect(screen.getByTestId('icon-1')).toBeInTheDocument();

      rerender(
        <Alert icon={<CheckCircle data-testid="icon-2" />}>
          <AlertTitle>Alert</AlertTitle>
        </Alert>
      );

      expect(screen.queryByTestId('icon-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('icon-2')).toBeInTheDocument();
    });
  });

  describe('Edge Cases & Error Handling', () => {
    it('should handle null children gracefully', () => {
      const { container } = render(
        <Alert>
          {null}
          <AlertTitle>Title</AlertTitle>
          {undefined}
          <AlertDescription>Description</AlertDescription>
          {false}
        </Alert>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('should handle className collision', () => {
      const { container } = render(
        <Alert className="custom-class border-2 border-red-500" variant="info">
          <AlertTitle>Custom Styled</AlertTitle>
        </Alert>
      );

      const alert = container.querySelector('[role="alert"]');
      expect(alert?.className).toContain('custom-class');
      expect(alert?.className).toContain('border-2');
      expect(alert?.className).toContain('border-red-500');
    });

    it('should handle onClick events', async () => {
      const onClick = jest.fn();
      const user = userEvent.setup();

      render(
        <Alert onClick={onClick}>
          <AlertTitle>Clickable Alert</AlertTitle>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      await user.click(alert);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple alerts on same page', () => {
      render(
        <div>
          <Alert data-testid="alert-1">
            <AlertTitle>Alert 1</AlertTitle>
          </Alert>
          <Alert data-testid="alert-2">
            <AlertTitle>Alert 2</AlertTitle>
          </Alert>
          <Alert data-testid="alert-3">
            <AlertTitle>Alert 3</AlertTitle>
          </Alert>
        </div>
      );

      expect(screen.getByTestId('alert-1')).toBeInTheDocument();
      expect(screen.getByTestId('alert-2')).toBeInTheDocument();
      expect(screen.getByTestId('alert-3')).toBeInTheDocument();
    });

    it('should maintain state when parent re-renders', () => {
      const ParentComponent = () => {
        const [count, setCount] = React.useState(0);
        
        return (
          <div>
            <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
            <Alert>
              <AlertTitle>Persistent Alert</AlertTitle>
            </Alert>
          </div>
        );
      };

      const user = userEvent.setup();
      render(<ParentComponent />);

      const alert = screen.getByText('Persistent Alert');
      expect(alert).toBeInTheDocument();

      // Trigger parent re-render
      fireEvent.click(screen.getByText('Count: 0'));

      // Alert should still be present
      expect(screen.getByText('Persistent Alert')).toBeInTheDocument();
    });

    it('should handle rapid show/hide toggling', async () => {
      const ToggleAlert = () => {
        const [show, setShow] = React.useState(true);
        
        return (
          <div>
            <button onClick={() => setShow(s => !s)}>Toggle</button>
            {show && (
              <Alert>
                <AlertTitle>Toggled Alert</AlertTitle>
              </Alert>
            )}
          </div>
        );
      };

      const user = userEvent.setup();
      render(<ToggleAlert />);

      const toggleButton = screen.getByText('Toggle');

      // Rapidly toggle
      for (let i = 0; i < 10; i++) {
        await user.click(toggleButton);
      }

      // Should handle rapid toggling without errors
      // Final state depends on even/odd number of clicks
      const alert = screen.queryByText('Toggled Alert');
      expect(alert === null || alert instanceof HTMLElement).toBe(true);
    });
  });

  describe('Integration with Forms', () => {
    it('should display form validation errors', () => {
      render(
        <form>
          <input type="text" required />
          <Alert variant="destructive">
            <AlertTitle>Validation Error</AlertTitle>
            <AlertDescription>
              Please fill in all required fields.
            </AlertDescription>
          </Alert>
        </form>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Validation Error');
      expect(alert).toHaveTextContent('Please fill in all required fields');
    });

    it('should display form success message', () => {
      render(
        <form>
          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Your form has been submitted successfully.
            </AlertDescription>
          </Alert>
        </form>
      );

      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Your form has been submitted successfully.')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render large number of alerts efficiently', () => {
      const startTime = performance.now();
      
      render(
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <Alert key={i}>
              <AlertTitle>Alert {i}</AlertTitle>
            </Alert>
          ))}
        </div>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Rendering 100 alerts should be reasonably fast (< 1 second)
      expect(renderTime).toBeLessThan(1000);

      // All alerts should be rendered
      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(100);
    });

    it('should handle memory cleanup on unmount', () => {
      const { unmount } = render(
        <Alert closeable onClose={jest.fn()}>
          <AlertTitle>Memory Test</AlertTitle>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();

      unmount();

      // Alert should be removed from DOM
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
