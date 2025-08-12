import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  FormProvider
} from './index';

// Mock component pour tester FormField avec React Hook Form
function TestFormWithField() {
  const form = useForm({
    defaultValues: {
      username: '',
      email: ''
    }
  });

  return (
    <FormProvider {...form}>
      <Form onSubmit={form.handleSubmit(() => {})}>
        <FormField
          name="username"
          render={({ value, onChange, onBlur, name, ref }) => (
            <FormItem>
              <FormLabel htmlFor={name}>Username</FormLabel>
              <FormControl>
                <input
                  id={name}
                  name={name}
                  value={value || ''}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  ref={ref}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </Form>
    </FormProvider>
  );
}

describe('Form Component', () => {
  describe('Form', () => {
    it('renders form element correctly', () => {
      render(
        <Form data-testid="test-form">
          <input type="text" />
        </Form>
      );
      
      const form = screen.getByTestId('test-form');
      expect(form).toBeInTheDocument();
      expect(form.tagName).toBe('FORM');
    });

    it('applies default spacing class', () => {
      render(
        <Form data-testid="test-form">
          <input type="text" />
        </Form>
      );
      
      expect(screen.getByTestId('test-form')).toHaveClass('space-y-4');
    });

    it('merges custom className', () => {
      render(
        <Form className="custom-class" data-testid="test-form">
          <input type="text" />
        </Form>
      );
      
      const form = screen.getByTestId('test-form');
      expect(form).toHaveClass('space-y-4', 'custom-class');
    });

    it('passes through HTML form attributes', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      
      render(
        <Form
          data-testid="test-form"
          onSubmit={handleSubmit}
          method="POST"
          action="/api/submit"
        >
          <button type="submit">Submit</button>
        </Form>
      );
      
      const form = screen.getByTestId('test-form');
      expect(form).toHaveAttribute('method', 'POST');
      expect(form).toHaveAttribute('action', '/api/submit');
    });

    it('handles form submission', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn((e) => e.preventDefault());
      
      render(
        <Form onSubmit={handleSubmit}>
          <button type="submit">Submit</button>
        </Form>
      );
      
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe('FormItem', () => {
    it('renders div element with spacing', () => {
      render(
        <FormItem data-testid="form-item">
          <input type="text" />
        </FormItem>
      );
      
      const item = screen.getByTestId('form-item');
      expect(item).toBeInTheDocument();
      expect(item.tagName).toBe('DIV');
      expect(item).toHaveClass('space-y-1.5');
    });

    it('merges custom className', () => {
      render(
        <FormItem className="custom-item" data-testid="form-item">
          <input type="text" />
        </FormItem>
      );
      
      expect(screen.getByTestId('form-item')).toHaveClass('space-y-1.5', 'custom-item');
    });
  });

  describe('FormLabel', () => {
    it('renders label element correctly', () => {
      render(<FormLabel htmlFor="test-input">Test Label</FormLabel>);
      
      const label = screen.getByText('Test Label');
      expect(label).toBeInTheDocument();
      expect(label.tagName).toBe('LABEL');
      expect(label).toHaveAttribute('for', 'test-input');
    });

    it('applies default styling classes', () => {
      render(<FormLabel>Test Label</FormLabel>);
      
      const label = screen.getByText('Test Label');
      expect(label).toHaveClass('block', 'text-sm', 'font-medium', 'text-neutral-900');
    });

    it('merges custom className', () => {
      render(<FormLabel className="text-lg">Test Label</FormLabel>);
      
      const label = screen.getByText('Test Label');
      expect(label).toHaveClass('block', 'text-sm', 'font-medium', 'text-neutral-900', 'text-lg');
    });
  });

  describe('FormControl', () => {
    it('renders wrapper div correctly', () => {
      render(
        <FormControl data-testid="form-control">
          <input type="text" />
        </FormControl>
      );
      
      const control = screen.getByTestId('form-control');
      expect(control).toBeInTheDocument();
      expect(control.tagName).toBe('DIV');
      expect(control).toHaveClass('mt-1');
    });

    it('wraps form inputs correctly', () => {
      render(
        <FormControl>
          <input type="text" placeholder="Enter text" />
        </FormControl>
      );
      
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });
  });

  describe('FormDescription', () => {
    it('renders description text correctly', () => {
      render(<FormDescription>This is a helpful description</FormDescription>);
      
      const description = screen.getByText('This is a helpful description');
      expect(description).toBeInTheDocument();
      expect(description.tagName).toBe('P');
    });

    it('applies default styling classes', () => {
      render(<FormDescription>Description text</FormDescription>);
      
      const description = screen.getByText('Description text');
      expect(description).toHaveClass('text-xs', 'text-neutral-600');
    });

    it('merges custom className', () => {
      render(
        <FormDescription className="text-blue-500">
          Description text
        </FormDescription>
      );
      
      const description = screen.getByText('Description text');
      expect(description).toHaveClass('text-xs', 'text-neutral-600', 'text-blue-500');
    });
  });

  describe('FormMessage', () => {
    it('renders error message correctly', () => {
      render(<FormMessage>This is an error message</FormMessage>);
      
      const message = screen.getByText('This is an error message');
      expect(message).toBeInTheDocument();
      expect(message.tagName).toBe('P');
    });

    it('applies error styling classes', () => {
      render(<FormMessage>Error message</FormMessage>);
      
      const message = screen.getByText('Error message');
      expect(message).toHaveClass('text-xs', 'font-medium', 'text-red-600');
    });

    it('returns null when no children provided', () => {
      const { container } = render(<FormMessage />);
      expect(container.firstChild).toBeNull();
    });

    it('returns null for empty string children', () => {
      const { container } = render(<FormMessage>{''}</FormMessage>);
      expect(container.firstChild).toBeNull();
    });

    it('merges custom className', () => {
      render(
        <FormMessage className="text-lg">
          Error message
        </FormMessage>
      );
      
      const message = screen.getByText('Error message');
      expect(message).toHaveClass('text-xs', 'font-medium', 'text-red-600', 'text-lg');
    });
  });

  describe('FormField with React Hook Form', () => {
    it('renders field with form context', async () => {
      render(<TestFormWithField />);
      
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('handles input changes', async () => {
      const user = userEvent.setup();
      render(<TestFormWithField />);
      
      const input = screen.getByLabelText('Username');
      await user.type(input, 'testuser');
      
      await waitFor(() => {
        expect(input).toHaveValue('testuser');
      });
    });

    it('applies field name as data attribute', () => {
      render(<TestFormWithField />);
      
      const fieldWrapper = document.querySelector('[data-field="username"]');
      expect(fieldWrapper).toBeInTheDocument();
    });

    it('displays validation errors', async () => {
      const FormWithValidation = () => {
        const form = useForm({
          defaultValues: { email: '' },
          mode: 'onChange'
        });

        // Simulate an error
        React.useEffect(() => {
          form.setError('email', { message: 'Email is required' });
        }, [form]);

        return (
          <FormProvider {...form}>
            <Form>
              <FormField
                name="email"
                render={({ value, onChange, onBlur, name, ref }) => (
                  <FormItem>
                    <FormLabel htmlFor={name}>Email</FormLabel>
                    <FormControl>
                      <input
                        id={name}
                        name={name}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                        ref={ref}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </Form>
          </FormProvider>
        );
      };

      render(<FormWithValidation />);
      
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });
  });

  describe('Complex Form Integration', () => {
    it('renders complete form with all components', () => {
      const CompleteForm = () => {
        const form = useForm({
          defaultValues: {
            name: '',
            bio: ''
          }
        });

        return (
          <FormProvider {...form}>
            <Form>
              <FormItem>
                <FormLabel htmlFor="name">Name</FormLabel>
                <FormControl>
                  <input id="name" placeholder="Enter your name" />
                </FormControl>
                <FormDescription>Your display name</FormDescription>
                <FormMessage>Name is required</FormMessage>
              </FormItem>
              
              <FormItem>
                <FormLabel htmlFor="bio">Bio</FormLabel>
                <FormControl>
                  <textarea id="bio" placeholder="Tell us about yourself" />
                </FormControl>
                <FormDescription>Brief description about you</FormDescription>
              </FormItem>
            </Form>
          </FormProvider>
        );
      };

      render(<CompleteForm />);
      
      // Check all elements are rendered
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Bio')).toBeInTheDocument();
      expect(screen.getByText('Your display name')).toBeInTheDocument();
      expect(screen.getByText('Brief description about you')).toBeInTheDocument();
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Tell us about yourself')).toBeInTheDocument();
    });

    it('maintains form context across components', async () => {
      const MultiFieldForm = () => {
        const form = useForm({
          defaultValues: {
            firstName: '',
            lastName: ''
          }
        });

        const onSubmit = vi.fn();

        return (
          <FormProvider {...form}>
            <Form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                name="firstName"
                render={({ value, onChange, name }) => (
                  <input
                    name={name}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="First Name"
                  />
                )}
              />
              <FormField
                name="lastName"
                render={({ value, onChange, name }) => (
                  <input
                    name={name}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Last Name"
                  />
                )}
              />
              <button type="submit">Submit</button>
            </Form>
          </FormProvider>
        );
      };

      const user = userEvent.setup();
      render(<MultiFieldForm />);
      
      const firstNameInput = screen.getByPlaceholderText('First Name');
      const lastNameInput = screen.getByPlaceholderText('Last Name');
      
      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      
      await waitFor(() => {
        expect(firstNameInput).toHaveValue('John');
        expect(lastNameInput).toHaveValue('Doe');
      });
    });
  });

  describe('Accessibility', () => {
    it('associates labels with form controls', () => {
      render(
        <Form>
          <FormItem>
            <FormLabel htmlFor="accessible-input">Accessible Label</FormLabel>
            <FormControl>
              <input id="accessible-input" type="text" />
            </FormControl>
          </FormItem>
        </Form>
      );
      
      const input = screen.getByLabelText('Accessible Label');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'accessible-input');
    });

    it('supports aria attributes', () => {
      render(
        <Form>
          <FormItem>
            <FormLabel htmlFor="aria-input">ARIA Input</FormLabel>
            <FormControl>
              <input
                id="aria-input"
                aria-required="true"
                aria-invalid="true"
                aria-describedby="aria-description"
              />
            </FormControl>
            <FormDescription id="aria-description">
              This field is required
            </FormDescription>
          </FormItem>
        </Form>
      );
      
      const input = screen.getByLabelText('ARIA Input');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'aria-description');
    });
  });
});
