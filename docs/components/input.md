# Input

A versatile text input component with validation support, multiple variants, and extensive customization options.

## Import

```tsx
import { Input } from '@dainabase/ui/input';
```

## Basic Usage

```tsx
import { Input } from '@dainabase/ui/input';

export default function InputExample() {
  return (
    <Input 
      type="email" 
      placeholder="Email address" 
    />
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| type | `string` | `"text"` | No | Input type (text, email, password, number, etc.) |
| placeholder | `string` | - | No | Placeholder text |
| value | `string \| number` | - | No | Controlled value |
| defaultValue | `string \| number` | - | No | Default value for uncontrolled input |
| disabled | `boolean` | `false` | No | Disable the input |
| readOnly | `boolean` | `false` | No | Make input read-only |
| required | `boolean` | `false` | No | Mark as required field |
| autoFocus | `boolean` | `false` | No | Auto-focus on mount |
| autoComplete | `string` | - | No | HTML autocomplete attribute |
| name | `string` | - | No | Input name attribute |
| id | `string` | - | No | Input ID attribute |
| className | `string` | - | No | Additional CSS classes |
| onChange | `(e: ChangeEvent) => void` | - | No | Change event handler |
| onBlur | `(e: FocusEvent) => void` | - | No | Blur event handler |
| onFocus | `(e: FocusEvent) => void` | - | No | Focus event handler |
| error | `boolean` | `false` | No | Error state |
| helperText | `string` | - | No | Helper text below input |

## Examples

### Basic Input Types

```tsx
// Text Input
<Input type="text" placeholder="Enter your name" />

// Email Input
<Input type="email" placeholder="email@example.com" />

// Password Input
<Input type="password" placeholder="Enter password" />

// Number Input
<Input type="number" placeholder="Enter amount" min="0" max="100" />

// Search Input
<Input type="search" placeholder="Search..." />

// URL Input
<Input type="url" placeholder="https://example.com" />

// Tel Input
<Input type="tel" placeholder="+1 (555) 000-0000" />
```

### Controlled Input

```tsx
import { useState } from 'react';
import { Input } from '@dainabase/ui/input';

function ControlledInput() {
  const [value, setValue] = useState('');

  return (
    <div className="space-y-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Controlled input"
      />
      <p>Value: {value}</p>
    </div>
  );
}
```

### Input with Label

```tsx
import { Input } from '@dainabase/ui/input';
import { Label } from '@dainabase/ui/label';

function LabeledInput() {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email Address</Label>
      <Input
        id="email"
        type="email"
        placeholder="email@example.com"
        required
      />
    </div>
  );
}
```

### Input with Validation

```tsx
import { useState } from 'react';
import { Input } from '@dainabase/ui/input';

function ValidatedInput() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setError('Email is required');
    } else if (!emailRegex.test(value)) {
      setError('Please enter a valid email');
    } else {
      setError('');
    }
  };

  return (
    <div className="space-y-2">
      <Input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          validateEmail(e.target.value);
        }}
        className={error ? 'border-red-500' : ''}
        placeholder="Enter email"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
```

### Input with Icons

```tsx
import { Input } from '@dainabase/ui/input';
import { Search, Mail, Lock } from 'lucide-react';

function InputWithIcons() {
  return (
    <div className="space-y-4">
      {/* Search with icon */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search" className="pl-8" />
      </div>

      {/* Email with icon */}
      <div className="relative">
        <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="email" placeholder="Email" className="pl-8" />
      </div>

      {/* Password with icon */}
      <div className="relative">
        <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="password" placeholder="Password" className="pl-8" />
      </div>
    </div>
  );
}
```

### Input Sizes

```tsx
// Small Input
<Input className="h-8 text-sm" placeholder="Small input" />

// Default Input
<Input placeholder="Default input" />

// Large Input
<Input className="h-12 text-lg" placeholder="Large input" />
```

### Disabled and Read-only States

```tsx
// Disabled Input
<Input disabled placeholder="Disabled input" value="Cannot edit" />

// Read-only Input
<Input readOnly placeholder="Read-only input" value="Read only value" />
```

### Input with Helper Text

```tsx
function InputWithHelper() {
  return (
    <div className="space-y-2">
      <Label htmlFor="username">Username</Label>
      <Input
        id="username"
        placeholder="Choose a username"
        aria-describedby="username-helper"
      />
      <p id="username-helper" className="text-sm text-muted-foreground">
        Must be 3-20 characters, letters and numbers only
      </p>
    </div>
  );
}
```

### File Input

```tsx
<Input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Selected file:', file.name);
    }
  }}
/>
```

### Input Group

```tsx
<div className="flex space-x-2">
  <Input placeholder="First name" />
  <Input placeholder="Last name" />
</div>
```

## Form Integration

### With React Hook Form

```tsx
import { useForm } from 'react-hook-form';
import { Input } from '@dainabase/ui/input';

function FormExample() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Invalid email address'
            }
          })}
          type="email"
          placeholder="Email"
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Styling

### Custom Styling

```tsx
<Input
  className="border-2 border-blue-500 focus:border-blue-600 rounded-lg"
  placeholder="Custom styled input"
/>
```

### Dark Mode

```tsx
<Input
  className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
  placeholder="Dark mode input"
/>
```

## Accessibility

- Proper label associations with `htmlFor` and `id`
- Support for `aria-label`, `aria-describedby`, and `aria-invalid`
- Keyboard navigation support
- Focus management
- Screen reader announcements for validation states
- Semantic HTML5 input types

## Best Practices

1. **Always use labels**: Every input should have an associated label
2. **Provide helpful placeholders**: But don't rely on them as labels
3. **Show validation feedback**: Clear error messages and visual indicators
4. **Use appropriate input types**: Helps with mobile keyboards and validation
5. **Consider autocomplete**: Help users fill forms faster
6. **Test keyboard navigation**: Ensure Tab order is logical

## Common Use Cases

- **Login forms**: Email and password inputs
- **Registration forms**: User information collection
- **Search bars**: Site or app search functionality
- **Settings panels**: Configuration inputs
- **Data entry**: Forms for creating or editing records
- **Filters**: Input fields for filtering data

## Performance Considerations

- Use controlled inputs sparingly for large forms
- Debounce onChange handlers for search inputs
- Consider virtualization for dynamic form fields
- Optimize validation to run only when necessary

## TypeScript

```tsx
import { Input, InputProps } from '@dainabase/ui/input';
import { ChangeEvent } from 'react';

const MyInput: React.FC<InputProps> = (props) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  return <Input {...props} onChange={handleChange} />;
};
```

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@dainabase/ui/input';

describe('Input', () => {
  it('accepts user input', () => {
    render(<Input placeholder="Test input" />);
    const input = screen.getByPlaceholderText('Test input');
    
    fireEvent.change(input, { target: { value: 'test value' } });
    expect(input).toHaveValue('test value');
  });

  it('can be disabled', () => {
    render(<Input disabled placeholder="Disabled input" />);
    const input = screen.getByPlaceholderText('Disabled input');
    
    expect(input).toBeDisabled();
  });
});
```

## Related Components

- [Form](./form.md)
- [Label](./label.md)
- [Textarea](./textarea.md)
- [Select](./select.md)
- [Checkbox](./checkbox.md)
- [RadioGroup](./radio-group.md)

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>
