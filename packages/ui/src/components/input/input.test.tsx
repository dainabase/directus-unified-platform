import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input, ExecutiveInput, ValidationInput, AnalyticsInput, FinanceInput, validationRules } from './index';

// ===============================
// 🧪 TEST UTILITIES
// ===============================

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <div data-testid="theme-container">
      {component}
    </div>
  );
};

const mockValidationCallback = jest.fn();

beforeEach(() => {
  mockValidationCallback.mockClear();
});

// ===============================
// 🧪 BASIC INPUT COMPONENT TESTS
// ===============================

describe('Input Component - Basic Functionality', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter text here" />);
      const input = screen.getByPlaceholderText('Enter text here');
      expect(input).toBeInTheDocument();
    });

    it('renders with different input types', () => {
      const { rerender } = render(<Input type="email" />);
      let input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');

      rerender(<Input type="password" />);
      input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'password');

      rerender(<Input type="tel" />);
      input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('renders with label', () => {
      render(<Input label="Email Address" />);
      const label = screen.getByText('Email Address');
      expect(label).toBeInTheDocument();
      expect(label.tagName).toBe('LABEL');
    });

    it('renders with helper text', () => {
      render(<Input helperText="Enter your email address" />);
      const helperText = screen.getByText('Enter your email address');
      expect(helperText).toBeInTheDocument();
    });

    it('renders with required indicator when validation includes required', () => {
      render(<Input label="Email" validation={[validationRules.required()]} />);
      const asterisk = screen.getByText('*');
      expect(asterisk).toBeInTheDocument();
      expect(asterisk).toHaveClass('text-red-500');
    });
  });

  describe('Value Management', () => {
    it('handles value changes', async () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      
      await userEvent.type(input, 'Hello World');
      expect(handleChange).toHaveBeenCalledTimes(11); // Once for each character
      expect(input).toHaveValue('Hello World');
    });

    it('supports controlled input', () => {
      const { rerender } = render(<Input value="initial" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('initial');

      rerender(<Input value="updated" onChange={() => {}} />);
      expect(input).toHaveValue('updated');
    });

    it('supports uncontrolled input with defaultValue', () => {
      render(<Input defaultValue="default text" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('default text');
    });
  });

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:cursor-not-allowed');
      expect(input).toHaveClass('disabled:opacity-50');
    });

    it('handles readonly state', () => {
      render(<Input readOnly value="readonly text" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
      expect(input).toHaveValue('readonly text');
    });

    it('handles required state', () => {
      render(<Input required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('handles autoFocus', () => {
      render(<Input autoFocus />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveFocus();
    });
  });

  describe('Events', () => {
    it('handles focus and blur events', () => {
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();
      
      render(<Input onFocus={handleFocus} onBlur={handleBlur} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.focus(input);
      expect(handleFocus).toHaveBeenCalledTimes(1);
      
      fireEvent.blur(input);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('handles key events', () => {
      const handleKeyPress = jest.fn();
      const handleKeyDown = jest.fn();
      const handleKeyUp = jest.fn();
      
      render(
        <Input 
          onKeyPress={handleKeyPress}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
        />
      );
      const input = screen.getByRole('textbox');
      
      fireEvent.keyPress(input, { key: 'Enter' });
      expect(handleKeyPress).toHaveBeenCalledTimes(1);
      
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
      
      fireEvent.keyUp(input, { key: 'Enter' });
      expect(handleKeyUp).toHaveBeenCalledTimes(1);
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.tagName).toBe('INPUT');
    });

    it('ref can be used to focus the input', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      
      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });
});

// ===============================
// 🧪 THEME SYSTEM TESTS
// ===============================

describe('Input Component - Theme System', () => {
  const themes = ['executive', 'dashboard', 'finance', 'analytics', 'minimal', 'default'] as const;

  themes.forEach(theme => {
    describe(`${theme} theme`, () => {
      it(`renders with ${theme} theme styles`, () => {
        render(<Input theme={theme} data-testid={`input-${theme}`} />);
        const input = screen.getByTestId(`input-${theme}`);
        expect(input).toBeInTheDocument();
        
        // Check that theme-specific classes are applied
        const classList = input.className;
        expect(classList).toBeTruthy();
      });

      it(`applies focus states for ${theme} theme`, () => {
        render(<Input theme={theme} data-testid={`input-${theme}`} />);
        const input = screen.getByTestId(`input-${theme}`);
        
        fireEvent.focus(input);
        expect(input).toHaveFocus();
      });
    });
  });

  it('applies executive theme gradient background', () => {
    render(<Input theme="executive" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('bg-gradient-to-r');
  });

  it('applies finance theme emerald colors', () => {
    render(<Input theme="finance" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-emerald-200');
  });

  it('applies analytics theme purple colors', () => {
    render(<Input theme="analytics" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-purple-200');
  });
});

// ===============================
// 🧪 VARIANT SYSTEM TESTS
// ===============================

describe('Input Component - Variant System', () => {
  const variants = [
    'primary', 'secondary', 'executive', 'dashboard', 'finance', 'analytics',
    'error', 'success', 'ghost', 'outline', 'link', 'icon', 'floating'
  ] as const;

  variants.forEach(variant => {
    it(`renders with ${variant} variant`, () => {
      render(<Input variant={variant} data-testid={`input-${variant}`} />);
      const input = screen.getByTestId(`input-${variant}`);
      expect(input).toBeInTheDocument();
    });
  });

  it('applies error variant styling', () => {
    render(<Input variant="error" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
    expect(input).toHaveClass('focus:border-red-600');
  });

  it('applies success variant styling', () => {
    render(<Input variant="success" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-green-500');
    expect(input).toHaveClass('focus:border-green-600');
  });

  it('applies ghost variant with transparent background', () => {
    render(<Input variant="ghost" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('bg-transparent');
    expect(input).toHaveClass('border-0');
  });
});

// ===============================
// 🧪 SIZE VARIANTS TESTS
// ===============================

describe('Input Component - Size Variants', () => {
  const sizes = ['sm', 'default', 'lg', 'xl'] as const;

  sizes.forEach(size => {
    it(`renders with ${size} size`, () => {
      render(<Input size={size} data-testid={`input-${size}`} />);
      const input = screen.getByTestId(`input-${size}`);
      expect(input).toBeInTheDocument();
    });
  });

  it('applies small size styles', () => {
    render(<Input size="sm" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('h-8');
    expect(input).toHaveClass('px-2');
    expect(input).toHaveClass('text-xs');
  });

  it('applies large size styles', () => {
    render(<Input size="lg" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('h-12');
    expect(input).toHaveClass('px-4');
    expect(input).toHaveClass('text-base');
  });

  it('applies extra large size styles', () => {
    render(<Input size="xl" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('h-14');
    expect(input).toHaveClass('px-5');
    expect(input).toHaveClass('text-lg');
  });
});

// ===============================
// 🧪 ICON SYSTEM TESTS
// ===============================

describe('Input Component - Icon System', () => {
  const icons = [
    'user', 'email', 'search', 'lock', 'briefcase', 
    'chartBar', 'currency', 'check', 'exclamation', 'loading'
  ] as const;

  icons.forEach(icon => {
    it(`renders with ${icon} icon`, () => {
      render(<Input icon={icon} />);
      const container = screen.getByRole('textbox').parentElement;
      const iconElement = container?.querySelector('svg');
      expect(iconElement).toBeInTheDocument();
    });
  });

  it('renders with right icon', () => {
    render(<Input rightIcon="search" />);
    const container = screen.getByRole('textbox').parentElement;
    const iconElement = container?.querySelector('svg');
    expect(iconElement).toBeInTheDocument();
  });

  it('adjusts padding for left icon', () => {
    render(<Input icon="user" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('pl-10');
  });

  it('adjusts padding for right icon', () => {
    render(<Input rightIcon="search" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('pr-10');
  });

  it('renders loading icon when loading state is true', () => {
    render(<Input loading />);
    const container = screen.getByRole('textbox').parentElement;
    const loadingIcon = container?.querySelector('.animate-spin');
    expect(loadingIcon).toBeInTheDocument();
  });
});

// ===============================
// 🧪 VALIDATION SYSTEM TESTS
// ===============================

describe('Input Component - Validation System', () => {
  describe('Validation Rules', () => {
    it('validates required fields', async () => {
      render(
        <Input 
          validation={[validationRules.required()]}
          onValidationChange={mockValidationCallback}
        />
      );
      const input = screen.getByRole('textbox');
      
      // Trigger blur without entering text
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(mockValidationCallback).toHaveBeenCalledWith(false, ['This field is required']);
      });
      
      const errorMessage = screen.getByText('This field is required');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('text-red-600');
    });

    it('validates email format', async () => {
      render(
        <Input 
          validation={[validationRules.email()]}
          onValidationChange={mockValidationCallback}
        />
      );
      const input = screen.getByRole('textbox');
      
      await userEvent.type(input, 'invalid-email');
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(mockValidationCallback).toHaveBeenCalledWith(false, ['Please enter a valid email address']);
      });
    });

    it('validates minimum length', async () => {
      render(
        <Input 
          validation={[validationRules.minLength(5)]}
          onValidationChange={mockValidationCallback}
        />
      );
      const input = screen.getByRole('textbox');
      
      await userEvent.type(input, 'abc');
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(mockValidationCallback).toHaveBeenCalledWith(false, ['Must be at least 5 characters long']);
      });
    });

    it('validates maximum length', async () => {
      render(
        <Input 
          validation={[validationRules.maxLength(3)]}
          onValidationChange={mockValidationCallback}
        />
      );
      const input = screen.getByRole('textbox');
      
      await userEvent.type(input, 'abcdef');
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(mockValidationCallback).toHaveBeenCalledWith(false, ['Must be no more than 3 characters long']);
      });
    });

    it('validates phone numbers', async () => {
      render(
        <Input 
          validation={[validationRules.phoneNumber()]}
          onValidationChange={mockValidationCallback}
        />
      );
      const input = screen.getByRole('textbox');
      
      await userEvent.type(input, 'invalid-phone');
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(mockValidationCallback).toHaveBeenCalledWith(false, ['Please enter a valid phone number']);
      });
    });

    it('validates currency format', async () => {
      render(
        <Input 
          validation={[validationRules.currency()]}
          onValidationChange={mockValidationCallback}
        />
      );
      const input = screen.getByRole('textbox');
      
      await userEvent.type(input, 'abc.def');
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(mockValidationCallback).toHaveBeenCalledWith(false, ['Please enter a valid amount']);
      });
    });

    it('validates alphanumeric input', async () => {
      render(
        <Input 
          validation={[validationRules.alphanumeric()]}
          onValidationChange={mockValidationCallback}
        />
      );
      const input = screen.getByRole('textbox');
      
      await userEvent.type(input, 'test-123!');
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(mockValidationCallback).toHaveBeenCalledWith(false, ['Only letters and numbers are allowed']);
      });
    });

    it('validates with custom pattern', async () => {
      render(
        <Input 
          validation={[validationRules.pattern(/^\d{3}-\d{3}-\d{4}$/, 'Must be in format: 123-456-7890')]}
          onValidationChange={mockValidationCallback}
        />
      );
      const input = screen.getByRole('textbox');
      
      await userEvent.type(input, '1234567890');
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(mockValidationCallback).toHaveBeenCalledWith(false, ['Must be in format: 123-456-7890']);
      });
    });
  });

  describe('Validation Behavior', () => {
    it('validates on change when validateOnChange is true', async () => {
      render(
        <Input 
          validation={[validationRules.email()]}
          validateOnChange
          onValidationChange={mockValidationCallback}
        />
      );
      const input = screen.getByRole('textbox');
      
      await userEvent.type(input, 'invalid');
      
      await waitFor(() => {
        expect(mockValidationCallback).toHaveBeenCalledWith(false, ['Please enter a valid email address']);
      });
    });

    it('shows success state when validation passes', async () => {
      render(
        <Input 
          validation={[validationRules.email()]}
          successText="Valid email address"
        />
      );
      const input = screen.getByRole('textbox');
      
      await userEvent.type(input, 'test@example.com');
      fireEvent.blur(input);
      
      await waitFor(() => {
        const successMessage = screen.getByText('Valid email address');
        expect(successMessage).toBeInTheDocument();
        expect(successMessage).toHaveClass('text-green-600');
      });
      
      // Check for success icon
      const container = input.parentElement;
      const successIcon = container?.querySelector('.text-green-500');
      expect(successIcon).toBeInTheDocument();
    });

    it('combines multiple validation rules', async () => {
      render(
        <Input 
          validation={[
            validationRules.required(),
            validationRules.minLength(8),
            validationRules.email()
          ]}
          onValidationChange={mockValidationCallback}
        />
      );
      const input = screen.getByRole('textbox');
      
      await userEvent.type(input, 'short');
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(mockValidationCallback).toHaveBeenCalledWith(false, expect.arrayContaining([
          'Must be at least 8 characters long',
          'Please enter a valid email address'
        ]));
      });
    });

    it('can disable validation display', () => {
      render(
        <Input 
          validation={[validationRules.required()]}
          showValidation={false}
        />
      );
      const input = screen.getByRole('textbox');
      
      fireEvent.blur(input);
      
      // No error message should be displayed
      expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
    });
  });
});

// ===============================
// 🧪 SPECIALIZED COMPONENTS TESTS
// ===============================

describe('Specialized Input Components', () => {
  describe('ExecutiveInput', () => {
    it('renders with executive theme and variant', () => {
      render(<ExecutiveInput />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('bg-gradient-to-r');
      expect(input).toHaveClass('h-12'); // lg size
    });

    it('supports all standard input props', () => {
      render(<ExecutiveInput placeholder="Enter executive data" disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Enter executive data');
      expect(input).toBeDisabled();
    });
  });

  describe('ValidationInput', () => {
    it('applies email validation automatically', async () => {
      render(
        <ValidationInput 
          validationType="email"
          onValidationChange={mockValidationCallback}
        />
      );
      const input = screen.getByRole('textbox');
      
      await userEvent.type(input, 'invalid-email');
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(mockValidationCallback).toHaveBeenCalledWith(false, ['Please enter a valid email address']);
      });
    });

    it('applies phone validation automatically', async () => {
      render(
        <ValidationInput 
          validationType="phone"
          onValidationChange={mockValidationCallback}
        />
      );
      const input = screen.getByRole('textbox');
      
      await userEvent.type(input, 'invalid-phone');
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(mockValidationCallback).toHaveBeenCalledWith(false, ['Please enter a valid phone number']);
      });
    });

    it('combines custom validation with type validation', async () => {
      render(
        <ValidationInput 
          validationType="email"
          validation={[validationRules.required()]}
          onValidationChange={mockValidationCallback}
        />
      );
      const input = screen.getByRole('textbox');
      
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(mockValidationCallback).toHaveBeenCalledWith(false, ['This field is required']);
      });
    });
  });

  describe('AnalyticsInput', () => {
    it('renders with analytics theme and chart icon', () => {
      render(<AnalyticsInput />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-purple-200');
      expect(input).toHaveClass('pl-10'); // Icon padding
      
      const container = input.parentElement;
      const chartIcon = container?.querySelector('svg');
      expect(chartIcon).toBeInTheDocument();
    });
  });

  describe('FinanceInput', () => {
    it('renders with finance theme and currency icon', () => {
      render(<FinanceInput />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-emerald-200');
      expect(input).toHaveClass('pl-10'); // Icon padding
      
      const container = input.parentElement;
      const currencyIcon = container?.querySelector('svg');
      expect(currencyIcon).toBeInTheDocument();
    });
  });
});

// ===============================
// 🧪 ADVANCED FEATURES TESTS
// ===============================

describe('Input Component - Advanced Features', () => {
  describe('Loading States', () => {
    it('displays loading spinner when loading is true', () => {
      render(<Input loading />);
      const container = screen.getByRole('textbox').parentElement;
      const spinner = container?.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('adjusts padding for loading spinner', () => {
      render(<Input loading />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pr-10');
    });

    it('does not show right icon when loading', () => {
      render(<Input loading rightIcon="search" />);
      const container = screen.getByRole('textbox').parentElement;
      const spinner = container?.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      
      // Should only have one icon (the spinner)
      const icons = container?.querySelectorAll('svg');
      expect(icons).toHaveLength(1);
    });
  });

  describe('Success States', () => {
    it('displays success icon when success is true', () => {
      render(<Input success />);
      const container = screen.getByRole('textbox').parentElement;
      const successIcon = container?.querySelector('.text-green-500');
      expect(successIcon).toBeInTheDocument();
    });

    it('shows success message when provided', () => {
      render(<Input success successText="Successfully validated!" />);
      const successMessage = screen.getByText('Successfully validated!');
      expect(successMessage).toBeInTheDocument();
      expect(successMessage).toHaveClass('text-green-600');
    });
  });

  describe('Focus Management', () => {
    it('applies focus styles correctly', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      
      fireEvent.focus(input);
      expect(input).toHaveFocus();
    });

    it('updates label color on focus', () => {
      render(<Input label="Test Label" />);
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Test Label');
      
      fireEvent.focus(input);
      expect(label).toHaveClass('text-blue-600');
    });
  });

  describe('Container Styling', () => {
    it('applies container className', () => {
      render(<Input containerClassName="custom-container" />);
      const container = screen.getByRole('textbox').closest('div');
      expect(container).toHaveClass('custom-container');
    });

    it('applies label className', () => {
      render(<Input label="Test" labelClassName="custom-label" />);
      const label = screen.getByText('Test');
      expect(label).toHaveClass('custom-label');
    });

    it('applies helper className', () => {
      render(<Input helperText="Helper" helperClassName="custom-helper" />);
      const helper = screen.getByText('Helper');
      expect(helper).toHaveClass('custom-helper');
    });
  });
});

// ===============================
// 🧪 ACCESSIBILITY TESTS
// ===============================

describe('Input Component - Accessibility', () => {
  it('supports aria-label', () => {
    render(<Input aria-label="Email input" />);
    const input = screen.getByLabelText('Email input');
    expect(input).toBeInTheDocument();
  });

  it('supports aria-describedby', () => {
    render(
      <>
        <Input aria-describedby="help-text" />
        <span id="help-text">Enter your email address</span>
      </>
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'help-text');
  });

  it('supports aria-invalid for error states', () => {
    render(<Input variant="error" aria-invalid="true" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('associates label with input correctly', () => {
    render(<Input label="Email Address" id="email-input" />);
    const label = screen.getByText('Email Address');
    const input = screen.getByRole('textbox');
    
    expect(label).toHaveAttribute('for', 'email-input');
    expect(input).toHaveAttribute('id', 'email-input');
  });

  it('provides proper focus indicators', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    
    expect(input).toHaveClass('focus-visible:outline-none');
    expect(input).toHaveClass('focus:outline-none');
  });

  it('supports keyboard navigation', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    
    input.focus();
    expect(input).toHaveFocus();
    
    fireEvent.keyDown(input, { key: 'Tab' });
    // Tab navigation should work naturally
  });
});

// ===============================
// 🧪 BUSINESS SCENARIOS TESTS
// ===============================

describe('Input Component - Business Scenarios', () => {
  it('handles user registration form', async () => {
    const onValidationChange = jest.fn();
    
    render(
      <div>
        <Input 
          label="Full Name"
          validation={[validationRules.required(), validationRules.minLength(2)]}
          onValidationChange={onValidationChange}
        />
        <ValidationInput 
          label="Email"
          validationType="email"
          validation={[validationRules.required()]}
        />
        <Input 
          label="Password"
          type="password"
          validation={[validationRules.required(), validationRules.minLength(8)]}
        />
      </div>
    );
    
    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    
    // Fill out the form
    await userEvent.type(nameInput, 'John Doe');
    await userEvent.type(emailInput, 'john@example.com');
    await userEvent.type(passwordInput, 'securepassword123');
    
    expect(nameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john@example.com');
    expect(passwordInput).toHaveValue('securepassword123');
  });

  it('handles financial data entry', async () => {
    render(
      <div>
        <FinanceInput 
          label="Amount"
          validation={[validationRules.required(), validationRules.currency()]}
          placeholder="0.00"
        />
        <Input 
          label="Description"
          validation={[validationRules.required()]}
        />
      </div>
    );
    
    const amountInput = screen.getByLabelText('Amount');
    const descriptionInput = screen.getByLabelText('Description');
    
    await userEvent.type(amountInput, '1234.56');
    await userEvent.type(descriptionInput, 'Office supplies');
    
    expect(amountInput).toHaveValue('1234.56');
    expect(descriptionInput).toHaveValue('Office supplies');
  });

  it('handles analytics dashboard filters', async () => {
    render(
      <div>
        <AnalyticsInput 
          label="Metric Name"
          placeholder="Enter metric to track"
        />
        <Input 
          label="Date Range"
          type="date"
        />
      </div>
    );
    
    const metricInput = screen.getByLabelText('Metric Name');
    const dateInput = screen.getByLabelText('Date Range');
    
    await userEvent.type(metricInput, 'Monthly Revenue');
    
    expect(metricInput).toHaveValue('Monthly Revenue');
    expect(dateInput).toBeInTheDocument();
  });

  it('handles search and filtering', async () => {
    const onSearch = jest.fn();
    
    render(
      <Input 
        icon="search"
        placeholder="Search users, projects, or documents..."
        onChange={onSearch}
        variant="ghost"
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search users, projects, or documents...');
    
    await userEvent.type(searchInput, 'project alpha');
    
    expect(searchInput).toHaveValue('project alpha');
    expect(onSearch).toHaveBeenCalled();
  });
});

// ===============================
// 🧪 PERFORMANCE TESTS
// ===============================

describe('Input Component - Performance', () => {
  it('does not re-render unnecessarily', () => {
    const renderSpy = jest.fn();
    
    const TestComponent = () => {
      renderSpy();
      return <Input defaultValue="test" />;
    };
    
    const { rerender } = render(<TestComponent />);
    
    expect(renderSpy).toHaveBeenCalledTimes(1);
    
    // Re-render with same props
    rerender(<TestComponent />);
    
    // Should not cause unnecessary re-renders
    expect(renderSpy).toHaveBeenCalledTimes(2);
  });

  it('handles rapid typing efficiently', async () => {
    const onChange = jest.fn();
    render(<Input onChange={onChange} />);
    
    const input = screen.getByRole('textbox');
    const longText = 'a'.repeat(1000);
    
    await userEvent.type(input, longText);
    
    expect(input).toHaveValue(longText);
    expect(onChange).toHaveBeenCalledTimes(1000);
  });

  it('validates efficiently with multiple rules', async () => {
    const onValidationChange = jest.fn();
    
    render(
      <Input 
        validation={[
          validationRules.required(),
          validationRules.minLength(5),
          validationRules.maxLength(50),
          validationRules.email(),
          validationRules.pattern(/^[a-zA-Z0-9@.]+$/, 'Special chars not allowed')
        ]}
        onValidationChange={onValidationChange}
        validateOnChange
      />
    );
    
    const input = screen.getByRole('textbox');
    
    await userEvent.type(input, 'test@example.com');
    
    // Should call validation for each character
    expect(onValidationChange).toHaveBeenCalled();
  });
});

// ===============================
// 🧪 EDGE CASES TESTS
// ===============================

describe('Input Component - Edge Cases', () => {
  it('handles empty validation array', () => {
    render(<Input validation={[]} />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('handles null validation callback', () => {
    render(<Input onValidationChange={undefined} validation={[validationRules.required()]} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.blur(input);
    // Should not throw error
    expect(input).toBeInTheDocument();
  });

  it('handles extremely long text input', async () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    const veryLongText = 'a'.repeat(10000);
    
    await userEvent.type(input, veryLongText);
    expect(input).toHaveValue(veryLongText);
  });

  it('handles special characters in validation', async () => {
    render(
      <Input 
        validation={[validationRules.pattern(/^[a-zA-Z0-9!@#$%^&*()]+$/, 'Invalid characters')]}
      />
    );
    const input = screen.getByRole('textbox');
    
    await userEvent.type(input, 'test!@#$%^&*()123');
    fireEvent.blur(input);
    
    // Should not show error for valid special characters
    expect(screen.queryByText('Invalid characters')).not.toBeInTheDocument();
  });

  it('handles rapid theme changes', () => {
    const { rerender } = render(<Input theme="default" />);
    
    rerender(<Input theme="executive" />);
    rerender(<Input theme="finance" />);
    rerender(<Input theme="analytics" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('handles concurrent validation and value changes', async () => {
    const onValidationChange = jest.fn();
    
    render(
      <Input 
        validation={[validationRules.email()]}
        onValidationChange={onValidationChange}
        validateOnChange
      />
    );
    
    const input = screen.getByRole('textbox');
    
    // Rapidly type and trigger validation
    await userEvent.type(input, 'te');
    await userEvent.type(input, 'st@');
    await userEvent.type(input, 'example.com');
    
    expect(input).toHaveValue('test@example.com');
  });
});