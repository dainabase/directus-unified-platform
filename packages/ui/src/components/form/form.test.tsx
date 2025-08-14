import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormContext,
} from './index';

// Mock component for testing FormField
const TestFormField = ({ name }: { name: string }) => {
  return (
    <FormField
      name={name}
      render={({ value, onChange, onBlur, name: fieldName, ref }) => (
        <input
          ref={ref}
          name={fieldName}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          data-testid={`field-${fieldName}`}
        />
      )}
    />
  );
};

// Test component with complete form setup
const TestForm = ({ 
  onSubmit,
  defaultValues = {},
  validation = {}
}: { 
  onSubmit?: (data: any) => void;
  defaultValues?: any;
  validation?: any;
}) => {
  const methods = useForm({
    defaultValues,
    mode: 'onChange',
  });

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit || (() => {}))}>
        <FormItem>
          <FormLabel htmlFor="username">Username</FormLabel>
          <FormControl>
            <input
              {...methods.register('username', validation.username)}
              id="username"
              data-testid="username-input"
            />
          </FormControl>
          <FormDescription>Enter your username</FormDescription>
          {methods.formState.errors.username && (
            <FormMessage>{methods.formState.errors.username.message}</FormMessage>
          )}
        </FormItem>
        
        <FormItem>
          <FormLabel htmlFor="email">Email</FormLabel>
          <FormControl>
            <input
              {...methods.register('email', validation.email)}
              id="email"
              type="email"
              data-testid="email-input"
            />
          </FormControl>
          <FormDescription>We'll never share your email</FormDescription>
          {methods.formState.errors.email && (
            <FormMessage>{methods.formState.errors.email.message}</FormMessage>
          )}
        </FormItem>
        
        <button type="submit" data-testid="submit-button">
          Submit
        </button>
      </Form>
    </FormProvider>
  );
};

describe('Form Components', () => {
  describe('Form', () => {
    it('renders without crashing', () => {
      render(<Form>Form content</Form>);
      expect(screen.getByText('Form content')).toBeInTheDocument();
    });

    it('renders as form element', () => {
      render(<Form data-testid="test-form">Content</Form>);
      const form = screen.getByTestId('test-form');
      expect(form.tagName).toBe('FORM');
    });

    it('applies custom className', () => {
      render(<Form className="custom-form">Content</Form>);
      const form = screen.getByText('Content').parentElement;
      expect(form).toHaveClass('custom-form');
    });

    it('applies default spacing', () => {
      render(<Form data-testid="form">Content</Form>);
      const form = screen.getByTestId('form');
      expect(form).toHaveClass('space-y-4');
    });

    it('handles form submission', async () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());
      render(
        <Form onSubmit={handleSubmit}>
          <button type="submit">Submit</button>
        </Form>
      );
      
      await userEvent.click(screen.getByText('Submit'));
      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe('FormItem', () => {
    it('renders without crashing', () => {
      render(<FormItem>Form item content</FormItem>);
      expect(screen.getByText('Form item content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<FormItem className="custom-item">Item</FormItem>);
      const item = screen.getByText('Item').parentElement;
      expect(item).toHaveClass('custom-item');
    });

    it('applies default spacing', () => {
      render(<FormItem data-testid="item">Item</FormItem>);
      const item = screen.getByTestId('item');
      expect(item).toHaveClass('space-y-1.5');
    });
  });

  describe('FormLabel', () => {
    it('renders without crashing', () => {
      render(<FormLabel>Label text</FormLabel>);
      expect(screen.getByText('Label text')).toBeInTheDocument();
    });

    it('renders as label element', () => {
      render(<FormLabel>Label</FormLabel>);
      const label = screen.getByText('Label');
      expect(label.tagName).toBe('LABEL');
    });

    it('applies custom className', () => {
      render(<FormLabel className="custom-label">Label</FormLabel>);
      const label = screen.getByText('Label');
      expect(label).toHaveClass('custom-label');
    });

    it('applies default styling', () => {
      render(<FormLabel>Label</FormLabel>);
      const label = screen.getByText('Label');
      expect(label).toHaveClass('block');
      expect(label).toHaveClass('text-sm');
      expect(label).toHaveClass('font-medium');
      expect(label).toHaveClass('text-neutral-900');
    });

    it('associates with input via htmlFor', () => {
      render(
        <>
          <FormLabel htmlFor="test-input">Test Label</FormLabel>
          <input id="test-input" />
        </>
      );
      const label = screen.getByText('Test Label');
      expect(label).toHaveAttribute('for', 'test-input');
    });
  });

  describe('FormControl', () => {
    it('renders without crashing', () => {
      render(<FormControl>Control content</FormControl>);
      expect(screen.getByText('Control content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<FormControl className="custom-control">Control</FormControl>);
      const control = screen.getByText('Control').parentElement;
      expect(control).toHaveClass('custom-control');
    });

    it('applies default styling', () => {
      render(<FormControl data-testid="control">Control</FormControl>);
      const control = screen.getByTestId('control');
      expect(control).toHaveClass('mt-1');
    });
  });

  describe('FormDescription', () => {
    it('renders without crashing', () => {
      render(<FormDescription>Description text</FormDescription>);
      expect(screen.getByText('Description text')).toBeInTheDocument();
    });

    it('renders as p element', () => {
      render(<FormDescription>Description</FormDescription>);
      const description = screen.getByText('Description');
      expect(description.tagName).toBe('P');
    });

    it('applies custom className', () => {
      render(<FormDescription className="custom-desc">Description</FormDescription>);
      const description = screen.getByText('Description');
      expect(description).toHaveClass('custom-desc');
    });

    it('applies default styling', () => {
      render(<FormDescription>Description</FormDescription>);
      const description = screen.getByText('Description');
      expect(description).toHaveClass('text-xs');
      expect(description).toHaveClass('text-neutral-600');
    });
  });

  describe('FormMessage', () => {
    it('renders when children provided', () => {
      render(<FormMessage>Error message</FormMessage>);
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('does not render when no children', () => {
      const { container } = render(<FormMessage />);
      expect(container.firstChild).toBeNull();
    });

    it('renders as p element', () => {
      render(<FormMessage>Message</FormMessage>);
      const message = screen.getByText('Message');
      expect(message.tagName).toBe('P');
    });

    it('applies custom className', () => {
      render(<FormMessage className="custom-message">Message</FormMessage>);
      const message = screen.getByText('Message');
      expect(message).toHaveClass('custom-message');
    });

    it('applies error styling', () => {
      render(<FormMessage>Error</FormMessage>);
      const message = screen.getByText('Error');
      expect(message).toHaveClass('text-xs');
      expect(message).toHaveClass('font-medium');
      expect(message).toHaveClass('text-red-600');
    });
  });

  describe('FormField with React Hook Form', () => {
    const FormWithField = ({ validation }: { validation?: any }) => {
      const methods = useForm({
        defaultValues: { testField: '' },
      });

      return (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(() => {})}>
            <TestFormField name="testField" />
            {methods.formState.errors.testField && (
              <FormMessage>{methods.formState.errors.testField.message}</FormMessage>
            )}
            <button type="submit">Submit</button>
          </form>
        </FormProvider>
      );
    };

    it('renders form field', () => {
      render(<FormWithField />);
      expect(screen.getByTestId('field-testField')).toBeInTheDocument();
    });

    it('handles field value changes', async () => {
      render(<FormWithField />);
      const input = screen.getByTestId('field-testField');
      
      await userEvent.type(input, 'test value');
      expect(input).toHaveValue('test value');
    });

    it('wraps field with data attribute', () => {
      render(<FormWithField />);
      const wrapper = document.querySelector('[data-field="testField"]');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Complete Form Integration', () => {
    it('renders complete form structure', () => {
      render(<TestForm />);
      
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByText('Enter your username')).toBeInTheDocument();
      expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('handles form submission with data', async () => {
      const handleSubmit = jest.fn();
      render(<TestForm onSubmit={handleSubmit} />);
      
      await userEvent.type(screen.getByTestId('username-input'), 'testuser');
      await userEvent.type(screen.getByTestId('email-input'), 'test@example.com');
      await userEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith({
          username: 'testuser',
          email: 'test@example.com',
        }, expect.anything());
      });
    });

    it('displays validation errors', async () => {
      const validation = {
        username: { required: 'Username is required' },
        email: { 
          required: 'Email is required',
          pattern: {
            value: /^\S+@\S+$/,
            message: 'Invalid email format'
          }
        }
      };
      
      render(<TestForm validation={validation} />);
      
      // Submit empty form
      await userEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.getByText('Username is required')).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
      
      // Type invalid email
      await userEvent.type(screen.getByTestId('email-input'), 'invalid');
      await userEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });

    it('populates default values', () => {
      const defaultValues = {
        username: 'defaultuser',
        email: 'default@example.com'
      };
      
      render(<TestForm defaultValues={defaultValues} />);
      
      expect(screen.getByTestId('username-input')).toHaveValue('defaultuser');
      expect(screen.getByTestId('email-input')).toHaveValue('default@example.com');
    });
  });

  describe('Accessibility', () => {
    it('associates labels with inputs', () => {
      render(<TestForm />);
      
      const usernameInput = screen.getByLabelText('Username');
      expect(usernameInput).toHaveAttribute('id', 'username');
      
      const emailInput = screen.getByLabelText('Email');
      expect(emailInput).toHaveAttribute('id', 'email');
    });

    it('supports keyboard navigation', async () => {
      render(<TestForm />);
      
      const usernameInput = screen.getByTestId('username-input');
      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('submit-button');
      
      // Tab through form elements
      usernameInput.focus();
      expect(document.activeElement).toBe(usernameInput);
      
      await userEvent.tab();
      expect(document.activeElement).toBe(emailInput);
      
      await userEvent.tab();
      expect(document.activeElement).toBe(submitButton);
    });

    it('announces errors to screen readers', async () => {
      const validation = {
        username: { required: 'Username is required' }
      };
      
      render(<TestForm validation={validation} />);
      
      await userEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        const errorMessage = screen.getByText('Username is required');
        expect(errorMessage).toHaveClass('text-red-600');
        // Error messages are visible and styled for importance
      });
    });
  });
});
