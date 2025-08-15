import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from '../../components/form';
import { Input } from '../../components/input';
import { Select } from '../../components/select';
import { Checkbox } from '../../components/checkbox';
import { RadioGroup } from '../../components/radio-group';
import { Textarea } from '../../components/textarea';
import { Button } from '../../components/button';
import { Dialog } from '../../components/dialog';
import { Toast } from '../../components/toast';
import { Label } from '../../components/label';
import { ErrorBoundary } from '../../components/error-boundary';
import { UIProvider } from '../../components/ui-provider';

describe('Form Workflow Integration Tests', () => {
  const user = userEvent.setup();

  describe('Complete Form Submission Workflow', () => {
    it('should handle multi-step form with validation', async () => {
      const onSubmit = jest.fn();
      const { container } = render(
        <UIProvider>
          <Form onSubmit={onSubmit}>
            <div data-step="1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              />
              
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
              />
            </div>
            
            <div data-step="2">
              <Label htmlFor="country">Country</Label>
              <Select name="country" required>
                <option value="">Select a country</option>
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="ca">Canada</option>
              </Select>
              
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                maxLength={500}
                placeholder="Tell us about yourself"
              />
            </div>
            
            <div data-step="3">
              <RadioGroup name="plan" required>
                <label>
                  <input type="radio" value="free" name="plan" />
                  Free Plan
                </label>
                <label>
                  <input type="radio" value="pro" name="plan" />
                  Pro Plan
                </label>
                <label>
                  <input type="radio" value="enterprise" name="plan" />
                  Enterprise Plan
                </label>
              </RadioGroup>
              
              <Checkbox name="terms" required>
                I accept the terms and conditions
              </Checkbox>
            </div>
            
            <Button type="submit">Submit</Button>
          </Form>
        </UIProvider>
      );

      // Test invalid email
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab();
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');

      // Test valid email
      await user.clear(emailInput);
      await user.type(emailInput, 'test@example.com');
      expect(emailInput).toHaveAttribute('aria-invalid', 'false');

      // Test password validation
      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, 'short');
      expect(passwordInput).toBeInvalid();
      
      await user.clear(passwordInput);
      await user.type(passwordInput, 'ValidPassword123!');
      expect(passwordInput).toBeValid();

      // Test select field
      const countrySelect = screen.getByRole('combobox');
      await user.selectOptions(countrySelect, 'us');
      expect(countrySelect).toHaveValue('us');

      // Test textarea with character limit
      const bioTextarea = screen.getByLabelText(/bio/i);
      const longText = 'a'.repeat(600);
      await user.type(bioTextarea, longText);
      expect(bioTextarea.value).toHaveLength(500);

      // Test radio group
      const proPlan = screen.getByLabelText(/pro plan/i);
      await user.click(proPlan);
      expect(proPlan).toBeChecked();

      // Test checkbox
      const termsCheckbox = screen.getByRole('checkbox', { name: /terms/i });
      await user.click(termsCheckbox);
      expect(termsCheckbox).toBeChecked();

      // Submit form
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'test@example.com',
            password: 'ValidPassword123!',
            country: 'us',
            plan: 'pro',
            terms: true
          })
        );
      });
    });

    it('should handle async validation with loading states', async () => {
      const checkUsername = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(true), 100))
      );

      render(
        <UIProvider>
          <Form>
            <Input
              name="username"
              placeholder="Username"
              onBlur={async (e) => {
                const input = e.target as HTMLInputElement;
                input.setCustomValidity('Checking...');
                const isValid = await checkUsername(input.value);
                input.setCustomValidity(isValid ? '' : 'Username taken');
              }}
            />
            <span data-testid="validation-message">Validation status</span>
          </Form>
        </UIProvider>
      );

      const usernameInput = screen.getByPlaceholderText('Username');
      await user.type(usernameInput, 'testuser');
      fireEvent.blur(usernameInput);

      expect(checkUsername).toHaveBeenCalledWith('testuser');
      
      await waitFor(() => {
        expect(usernameInput).toBeValid();
      });
    });

    it('should integrate with Dialog for confirmation', async () => {
      const onConfirm = jest.fn();
      
      render(
        <UIProvider>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              const dialog = document.getElementById('confirm-dialog');
              if (dialog) {
                (dialog as HTMLDialogElement).showModal();
              }
            }}
          >
            <Input name="data" defaultValue="Important data" />
            <Button type="submit">Delete</Button>
          </Form>
          
          <Dialog id="confirm-dialog">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this data?</p>
            <Button onClick={onConfirm}>Confirm</Button>
          </Dialog>
        </UIProvider>
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/confirm deletion/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);
      expect(onConfirm).toHaveBeenCalled();
    });

    it('should show toast notifications on form events', async () => {
      const { container } = render(
        <UIProvider>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              const toast = new CustomEvent('show-toast', {
                detail: { message: 'Form submitted successfully!', type: 'success' }
              });
              window.dispatchEvent(toast);
            }}
            onReset={() => {
              const toast = new CustomEvent('show-toast', {
                detail: { message: 'Form reset', type: 'info' }
              });
              window.dispatchEvent(toast);
            }}
          >
            <Input name="field" />
            <Button type="submit">Submit</Button>
            <Button type="reset">Reset</Button>
          </Form>
          <Toast />
        </UIProvider>
      );

      // Test submit toast
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(container.querySelector('[role="alert"]')).toBeInTheDocument();
      });

      // Test reset toast
      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      await waitFor(() => {
        const alerts = container.querySelectorAll('[role="alert"]');
        expect(alerts.length).toBeGreaterThan(0);
      });
    });

    it('should handle field dependencies and conditional rendering', async () => {
      const DynamicForm = () => {
        const [showAddress, setShowAddress] = React.useState(false);
        const [country, setCountry] = React.useState('');

        return (
          <Form>
            <Checkbox
              name="needsShipping"
              onChange={(e) => setShowAddress(e.target.checked)}
            >
              Needs Shipping
            </Checkbox>

            {showAddress && (
              <>
                <Select
                  name="country"
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <option value="">Select Country</option>
                  <option value="us">United States</option>
                  <option value="ca">Canada</option>
                </Select>

                {country === 'us' && (
                  <Select name="state">
                    <option value="">Select State</option>
                    <option value="ca">California</option>
                    <option value="ny">New York</option>
                  </Select>
                )}

                {country === 'ca' && (
                  <Select name="province">
                    <option value="">Select Province</option>
                    <option value="on">Ontario</option>
                    <option value="bc">British Columbia</option>
                  </Select>
                )}
              </>
            )}
          </Form>
        );
      };

      render(
        <UIProvider>
          <DynamicForm />
        </UIProvider>
      );

      // Initially no address fields
      expect(screen.queryByText(/select country/i)).not.toBeInTheDocument();

      // Check shipping checkbox
      const shippingCheckbox = screen.getByRole('checkbox');
      await user.click(shippingCheckbox);

      // Country field should appear
      await waitFor(() => {
        expect(screen.getByText(/select country/i)).toBeInTheDocument();
      });

      // Select US
      const countrySelect = screen.getByRole('combobox');
      await user.selectOptions(countrySelect, 'us');

      // State field should appear
      await waitFor(() => {
        expect(screen.getByText(/select state/i)).toBeInTheDocument();
      });

      // Change to Canada
      await user.selectOptions(countrySelect, 'ca');

      // Province field should appear, state field should disappear
      await waitFor(() => {
        expect(screen.queryByText(/select state/i)).not.toBeInTheDocument();
        expect(screen.getByText(/select province/i)).toBeInTheDocument();
      });
    });

    it('should maintain form state through error boundaries', async () => {
      const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
        if (shouldThrow) throw new Error('Form component error');
        return <div>Form content</div>;
      };

      const FormWithErrorBoundary = () => {
        const [formData, setFormData] = React.useState({ name: 'John' });
        const [hasError, setHasError] = React.useState(false);

        return (
          <ErrorBoundary
            fallback={<div>Error occurred. Form data preserved: {formData.name}</div>}
            onError={() => setHasError(true)}
          >
            <Form>
              <Input
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
              />
              <ThrowError shouldThrow={hasError} />
              <Button onClick={() => setHasError(true)}>Trigger Error</Button>
            </Form>
          </ErrorBoundary>
        );
      };

      render(
        <UIProvider>
          <FormWithErrorBoundary />
        </UIProvider>
      );

      // Update form data
      const nameInput = screen.getByRole('textbox');
      await user.clear(nameInput);
      await user.type(nameInput, 'Jane');

      // Trigger error
      const errorButton = screen.getByRole('button', { name: /trigger error/i });
      await user.click(errorButton);

      // Check that form data is preserved
      await waitFor(() => {
        expect(screen.getByText(/form data preserved: Jane/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation States', () => {
    it('should handle all HTML5 validation attributes', async () => {
      render(
        <UIProvider>
          <Form>
            <Input type="email" required pattern=".*@company\.com$" />
            <Input type="number" min={0} max={100} step={5} />
            <Input type="text" minLength={3} maxLength={10} />
            <Input type="date" min="2024-01-01" max="2024-12-31" />
            <Button type="submit">Submit</Button>
          </Form>
        </UIProvider>
      );

      const submitButton = screen.getByRole('button');
      
      // Try to submit empty form
      await user.click(submitButton);
      
      const emailInput = screen.getByRole('textbox', { name: '' });
      expect(emailInput).toBeInvalid();
    });
  });
});