/**
 * Alert Component Tests
 * Tests alert variants, icons, and content areas
 */

import React from 'react';
import { renderWithProviders, screen } from '../../../tests/utils/test-utils';
import { Alert, AlertDescription, AlertTitle } from './index';
import { Terminal, AlertCircle } from 'lucide-react';

describe('Alert Component', () => {
  describe('Basic Rendering', () => {
    it('renders alert with content', () => {
      renderWithProviders(
        <Alert>
          <AlertDescription>This is an alert message</AlertDescription>
        </Alert>
      );
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('This is an alert message')).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      renderWithProviders(
        <Alert className="custom-alert">
          <AlertDescription>Custom alert</AlertDescription>
        </Alert>
      );
      
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('custom-alert');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      renderWithProviders(
        <Alert ref={ref}>
          <AlertDescription>Alert with ref</AlertDescription>
        </Alert>
      );
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Alert Variants', () => {
    it('renders default variant', () => {
      renderWithProviders(
        <Alert data-testid="default-alert">
          <AlertDescription>Default alert</AlertDescription>
        </Alert>
      );
      
      const alert = screen.getByTestId('default-alert');
      expect(alert).toHaveClass('bg-background', 'text-foreground');
    });

    it('renders destructive variant', () => {
      renderWithProviders(
        <Alert variant="destructive" data-testid="destructive-alert">
          <AlertDescription>Error alert</AlertDescription>
        </Alert>
      );
      
      const alert = screen.getByTestId('destructive-alert');
      expect(alert).toHaveClass('border-destructive/50', 'text-destructive');
    });

    it('renders with custom variant styling', () => {
      renderWithProviders(
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Your session has expired. Please log in again.
          </AlertDescription>
        </Alert>
      );
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  describe('AlertTitle', () => {
    it('renders title with correct styling', () => {
      renderWithProviders(
        <Alert>
          <AlertTitle data-testid="alert-title">Important Notice</AlertTitle>
        </Alert>
      );
      
      const title = screen.getByTestId('alert-title');
      expect(title).toHaveTextContent('Important Notice');
      expect(title.tagName).toBe('H5');
    });

    it('applies font weight styling', () => {
      renderWithProviders(
        <Alert>
          <AlertTitle data-testid="alert-title">Title</AlertTitle>
        </Alert>
      );
      
      const title = screen.getByTestId('alert-title');
      expect(title).toHaveClass('font-medium');
    });

    it('maintains proper spacing', () => {
      renderWithProviders(
        <Alert>
          <AlertTitle data-testid="alert-title">Title</AlertTitle>
          <AlertDescription>Description</AlertDescription>
        </Alert>
      );
      
      const title = screen.getByTestId('alert-title');
      expect(title).toHaveClass('leading-none');
    });
  });

  describe('AlertDescription', () => {
    it('renders description with correct styling', () => {
      renderWithProviders(
        <Alert>
          <AlertDescription data-testid="alert-desc">
            This is a detailed description
          </AlertDescription>
        </Alert>
      );
      
      const description = screen.getByTestId('alert-desc');
      expect(description).toHaveTextContent('This is a detailed description');
    });

    it('applies text sizing', () => {
      renderWithProviders(
        <Alert>
          <AlertDescription data-testid="alert-desc">
            Description text
          </AlertDescription>
        </Alert>
      );
      
      const description = screen.getByTestId('alert-desc');
      expect(description).toHaveClass('text-sm');
    });

    it('handles multi-line content', () => {
      renderWithProviders(
        <Alert>
          <AlertDescription>
            Line one of the description.
            Line two of the description.
            Line three of the description.
          </AlertDescription>
        </Alert>
      );
      
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Line one');
      expect(alert).toHaveTextContent('Line two');
      expect(alert).toHaveTextContent('Line three');
    });
  });

  describe('Alert with Icons', () => {
    it('renders with leading icon', () => {
      renderWithProviders(
        <Alert>
          <Terminal className="h-4 w-4" data-testid="alert-icon" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You can add components to your app using the cli.
          </AlertDescription>
        </Alert>
      );
      
      const icon = screen.getByTestId('alert-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-4', 'w-4');
    });

    it('aligns icon with content properly', () => {
      const { container } = renderWithProviders(
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <div>
            <AlertTitle>Notice</AlertTitle>
            <AlertDescription>Content with icon</AlertDescription>
          </div>
        </Alert>
      );
      
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
      const svg = alert?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Complex Alert Compositions', () => {
    it('renders info alert pattern', () => {
      renderWithProviders(
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            This is an informational message for the user.
          </AlertDescription>
        </Alert>
      );
      
      expect(screen.getByText('Information')).toBeInTheDocument();
      expect(screen.getByText(/informational message/)).toBeInTheDocument();
    });

    it('renders warning alert pattern', () => {
      renderWithProviders(
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Please review this important information.
          </AlertDescription>
        </Alert>
      );
      
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('border-yellow-500', 'bg-yellow-50');
    });

    it('renders success alert pattern', () => {
      renderWithProviders(
        <Alert className="border-green-500 bg-green-50">
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            Your changes have been saved successfully.
          </AlertDescription>
        </Alert>
      );
      
      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText(/saved successfully/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has alert role by default', () => {
      renderWithProviders(
        <Alert>
          <AlertDescription>Accessible alert</AlertDescription>
        </Alert>
      );
      
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('supports aria-live attribute', () => {
      renderWithProviders(
        <Alert aria-live="polite">
          <AlertDescription>Live region alert</AlertDescription>
        </Alert>
      );
      
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });

    it('supports aria-atomic for complete announcement', () => {
      renderWithProviders(
        <Alert aria-atomic="true">
          <AlertTitle>Complete Alert</AlertTitle>
          <AlertDescription>This entire alert will be announced</AlertDescription>
        </Alert>
      );
      
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-atomic', 'true');
    });

    it('maintains semantic HTML structure', () => {
      const { container } = renderWithProviders(
        <Alert>
          <AlertTitle>Semantic Title</AlertTitle>
          <AlertDescription>Semantic description</AlertDescription>
        </Alert>
      );
      
      const heading = container.querySelector('h5');
      expect(heading).toHaveTextContent('Semantic Title');
      
      const alert = screen.getByRole('alert');
      expect(alert).toContainElement(heading!);
    });
  });

  describe('Alert Dismissal', () => {
    it('can be made dismissible', () => {
      const handleDismiss = jest.fn();
      
      renderWithProviders(
        <Alert>
          <AlertDescription>Dismissible alert</AlertDescription>
          <button 
            onClick={handleDismiss}
            aria-label="Close alert"
            className="absolute right-2 top-2"
          >
            ×
          </button>
        </Alert>
      );
      
      const closeButton = screen.getByLabelText('Close alert');
      closeButton.click();
      
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Alert Actions', () => {
    it('supports action buttons', () => {
      const handleAction = jest.fn();
      
      renderWithProviders(
        <Alert>
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            Please take action on this alert.
          </AlertDescription>
          <div className="mt-4">
            <button onClick={handleAction}>Take Action</button>
          </div>
        </Alert>
      );
      
      const actionButton = screen.getByText('Take Action');
      actionButton.click();
      
      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('supports multiple actions', () => {
      renderWithProviders(
        <Alert>
          <AlertDescription>Choose an action</AlertDescription>
          <div className="mt-4 space-x-2">
            <button>Accept</button>
            <button>Decline</button>
            <button>Learn More</button>
          </div>
        </Alert>
      );
      
      expect(screen.getByText('Accept')).toBeInTheDocument();
      expect(screen.getByText('Decline')).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
    });
  });
});
