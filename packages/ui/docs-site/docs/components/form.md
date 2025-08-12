---
id: form
title: Form
sidebar_position: 14
---

import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@dainabase/ui';

# Form

A powerful form wrapper component with built-in validation, error handling, and accessibility features using React Hook Form and Zod validation.

<div className="component-preview">
  <Form>
    <FormField
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <input {...field} type="email" placeholder="Enter your email" />
          </FormControl>
          <FormDescription>We'll never share your email.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  </Form>
</div>

## Features

- **React Hook Form Integration**: Built on top of React Hook Form for optimal performance
- **Zod Validation**: Schema-based validation with TypeScript support
- **Accessible**: Full ARIA support and keyboard navigation
- **Error Handling**: Automatic error display with customizable messages
- **TypeScript Ready**: Full type safety with generic types
- **Flexible**: Works with any input component
- **Performance**: Minimal re-renders with uncontrolled components

## Installation

```bash
npm install @dainabase/ui react-hook-form zod @hookform/resolvers
```

## Usage

```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@dainabase/ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

export function ProfileForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  function onSubmit(values) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}
```

## Examples

### Basic Form with Validation

```jsx live
function BasicFormExample() {
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      message: ''
    }
  });

  const onSubmit = (data) => {
    console.log('Form submitted:', data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <input {...field} className="w-full p-2 border rounded" />
              </FormControl>
              <FormDescription>Your full name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <input {...field} type="email" className="w-full p-2 border rounded" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <textarea {...field} className="w-full p-2 border rounded" rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          Submit
        </button>
      </form>
    </Form>
  );
}
```

### Complex Form with Multiple Field Types

```jsx live
function ComplexFormExample() {
  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      age: '',
      country: '',
      subscribe: false,
      gender: '',
      bio: ''
    }
  });

  return (
    <Form {...form}>
      <form className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <input {...field} className="w-full p-2 border rounded" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <input {...field} className="w-full p-2 border rounded" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <select {...field} className="w-full p-2 border rounded">
                  <option value="">Select a country</option>
                  <option value="us">United States</option>
                  <option value="uk">United Kingdom</option>
                  <option value="ca">Canada</option>
                  <option value="au">Australia</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          name="subscribe"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <input type="checkbox" {...field} />
              </FormControl>
              <FormLabel>Subscribe to newsletter</FormLabel>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

### Form with Async Validation

```jsx live
function AsyncValidationExample() {
  const form = useForm();
  const [isChecking, setIsChecking] = useState(false);

  const checkUsername = async (username) => {
    setIsChecking(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsChecking(false);
    return username !== 'admin';
  };

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <input 
                  {...field} 
                  className="w-full p-2 border rounded"
                  onBlur={async (e) => {
                    const isValid = await checkUsername(e.target.value);
                    if (!isValid) {
                      form.setError('username', {
                        message: 'Username already taken'
                      });
                    }
                  }}
                />
              </FormControl>
              {isChecking && <p className="text-sm text-gray-500">Checking availability...</p>}
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

### Multi-Step Form

```jsx live
function MultiStepFormExample() {
  const [step, setStep] = useState(1);
  const form = useForm({
    defaultValues: {
      // Step 1
      name: '',
      email: '',
      // Step 2
      address: '',
      city: '',
      // Step 3
      cardNumber: '',
      expiryDate: ''
    }
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <Form {...form}>
      <form className="space-y-4">
        {/* Progress Bar */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className={`h-2 flex-1 mx-1 rounded ${
                i <= step ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <>
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <input {...field} className="w-full p-2 border rounded" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <input {...field} type="email" className="w-full p-2 border rounded" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Step 2: Address */}
        {step === 2 && (
          <>
            <FormField
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <input {...field} className="w-full p-2 border rounded" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <input {...field} className="w-full p-2 border rounded" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <>
            <FormField
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <input {...field} className="w-full p-2 border rounded" placeholder="1234 5678 9012 3456" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <input {...field} className="w-full p-2 border rounded" placeholder="MM/YY" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          {step > 1 && (
            <button 
              type="button" 
              onClick={prevStep}
              className="px-4 py-2 border rounded"
            >
              Previous
            </button>
          )}
          {step < 3 ? (
            <button 
              type="button" 
              onClick={nextStep}
              className="px-4 py-2 bg-blue-500 text-white rounded ml-auto"
            >
              Next
            </button>
          ) : (
            <button 
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded ml-auto"
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </Form>
  );
}
```

## API Reference

### Form

The root component that provides form context.

<div className="props-table">
  <table>
    <thead>
      <tr>
        <th>Prop</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>...form</code></td>
        <td><code>UseFormReturn</code></td>
        <td>Required</td>
        <td>Form instance from React Hook Form</td>
      </tr>
      <tr>
        <td><code>children</code></td>
        <td><code>ReactNode</code></td>
        <td><code>undefined</code></td>
        <td>Form content</td>
      </tr>
    </tbody>
  </table>
</div>

### FormField

Renders a form field with automatic registration and validation.

<div className="props-table">
  <table>
    <thead>
      <tr>
        <th>Prop</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>name</code></td>
        <td><code>string</code></td>
        <td>Required</td>
        <td>Field name for registration</td>
      </tr>
      <tr>
        <td><code>control</code></td>
        <td><code>Control</code></td>
        <td>Required</td>
        <td>Form control from useForm</td>
      </tr>
      <tr>
        <td><code>render</code></td>
        <td><code>Function</code></td>
        <td>Required</td>
        <td>Render function for the field</td>
      </tr>
    </tbody>
  </table>
</div>

### FormItem

Container for form field elements.

### FormLabel

Label element with automatic association to form field.

### FormControl

Wrapper for form input elements with automatic props spreading.

### FormDescription

Helper text for form fields.

### FormMessage

Error message display component.

## Validation

The Form component works seamlessly with Zod for schema validation:

```tsx
import { z } from 'zod';

const formSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().min(18).max(100),
  website: z.string().url().optional(),
  bio: z.string().max(500)
});
```

## Accessibility

The Form component follows WAI-ARIA guidelines:

- Automatic `aria-invalid` on invalid fields
- `aria-describedby` for error messages
- Proper label association with `htmlFor`
- Keyboard navigation support
- Screen reader announcements for errors
- Focus management on validation

## Best Practices

### Do's ✅

- Always use validation schemas with Zod
- Provide clear error messages
- Use FormDescription for helper text
- Group related fields together
- Implement proper loading states
- Handle async validation properly
- Use progressive disclosure for complex forms

### Don'ts ❌

- Don't disable the submit button during validation
- Don't hide important fields
- Don't use placeholder as label
- Don't forget server-side validation
- Don't make all fields required
- Don't use generic error messages

## Common Patterns

### Custom Input Components

```tsx
// Custom input that works with Form
const CustomInput = React.forwardRef(({ ...props }, ref) => {
  return (
    <input
      ref={ref}
      className="custom-input"
      {...props}
    />
  );
});

// Usage in form
<FormControl>
  <CustomInput {...field} />
</FormControl>
```

### Conditional Fields

```tsx
<FormField
  name="hasWebsite"
  render={({ field }) => (
    <FormItem>
      <FormControl>
        <input type="checkbox" {...field} />
      </FormControl>
      <FormLabel>I have a website</FormLabel>
    </FormItem>
  )}
/>

{form.watch('hasWebsite') && (
  <FormField
    name="websiteUrl"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Website URL</FormLabel>
        <FormControl>
          <input {...field} type="url" />
        </FormControl>
      </FormItem>
    )}
  />
)}
```

## Related Components

- [Input](/docs/components/input) - Text input component
- [Select](/docs/components/select) - Dropdown selection
- [Button](/docs/components/button) - Form submission
- [Checkbox](/docs/components/checkbox) - Boolean fields
- [RadioGroup](/docs/components/radio-group) - Single choice fields
- [DatePicker](/docs/components/date-picker) - Date selection
