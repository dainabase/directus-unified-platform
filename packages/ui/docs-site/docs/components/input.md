---
id: input
title: Input
sidebar_position: 3
---

import { Input } from '@dainabase/ui';

# Input

Input fields allow users to enter text and data. They are fundamental form elements that support various types of text entry including passwords, emails, numbers, and more.

<div className="component-preview">
  <Input type="text" placeholder="Enter text..." className="w-[300px]" />
</div>

## Features

- **Multiple Types**: Text, password, email, number, tel, url, search, and more
- **Validation States**: Error, success, warning, and disabled states
- **Icon Support**: Leading and trailing icons
- **Auto-complete**: Native browser auto-complete support
- **Accessibility**: Full ARIA support and keyboard navigation
- **Responsive**: Adapts to container width
- **Theme Support**: Automatic dark mode adaptation

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import { Input } from '@dainabase/ui';

export function Example() {
  const [value, setValue] = useState('');
  
  return (
    <Input
      type="text"
      placeholder="Enter your name"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
```

## Examples

### Input Types

```jsx live
function InputTypes() {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Text Input</label>
        <Input type="text" placeholder="Enter text..." />
      </div>
      
      <div>
        <label className="text-sm font-medium">Email Input</label>
        <Input type="email" placeholder="email@example.com" />
      </div>
      
      <div>
        <label className="text-sm font-medium">Password Input</label>
        <Input type="password" placeholder="••••••••" />
      </div>
      
      <div>
        <label className="text-sm font-medium">Number Input</label>
        <Input type="number" placeholder="123" min="0" max="100" />
      </div>
      
      <div>
        <label className="text-sm font-medium">Search Input</label>
        <Input type="search" placeholder="Search..." />
      </div>
    </div>
  );
}
```

### Controlled Input

```jsx live
function ControlledInput() {
  const [value, setValue] = React.useState('');
  
  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Type something..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <p className="text-sm text-muted-foreground">
        You typed: {value || '(nothing yet)'}
      </p>
      <button 
        onClick={() => setValue('')}
        className="px-3 py-1 text-sm border rounded"
      >
        Clear
      </button>
    </div>
  );
}
```

### With Icons

```jsx live
function InputWithIcons() {
  return (
    <div className="space-y-4">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          🔍
        </span>
        <Input 
          type="search" 
          placeholder="Search..." 
          className="pl-10"
        />
      </div>
      
      <div className="relative">
        <Input 
          type="email" 
          placeholder="Email address" 
          className="pr-10"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          ✉️
        </span>
      </div>
      
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          👤
        </span>
        <Input 
          type="text" 
          placeholder="Username" 
          className="px-10"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
          ✓
        </span>
      </div>
    </div>
  );
}
```

### Validation States

```jsx live
function ValidationStates() {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Default</label>
        <Input type="text" placeholder="Normal input" />
      </div>
      
      <div>
        <label className="text-sm font-medium text-green-600">Success</label>
        <Input 
          type="text" 
          placeholder="Valid input" 
          className="border-green-500 focus:ring-green-500"
          defaultValue="Valid entry"
        />
        <p className="mt-1 text-sm text-green-600">✓ Looks good!</p>
      </div>
      
      <div>
        <label className="text-sm font-medium text-red-600">Error</label>
        <Input 
          type="email" 
          placeholder="Invalid input" 
          className="border-red-500 focus:ring-red-500"
          defaultValue="not-an-email"
        />
        <p className="mt-1 text-sm text-red-600">Please enter a valid email</p>
      </div>
      
      <div>
        <label className="text-sm font-medium text-yellow-600">Warning</label>
        <Input 
          type="password" 
          placeholder="Weak password" 
          className="border-yellow-500 focus:ring-yellow-500"
          defaultValue="123"
        />
        <p className="mt-1 text-sm text-yellow-600">Password is too weak</p>
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-400">Disabled</label>
        <Input 
          type="text" 
          placeholder="Disabled input" 
          disabled
          defaultValue="Cannot edit"
        />
      </div>
    </div>
  );
}
```

### Sizes

```jsx live
function InputSizes() {
  return (
    <div className="space-y-4">
      <Input 
        type="text" 
        placeholder="Small input" 
        className="h-8 text-sm"
      />
      
      <Input 
        type="text" 
        placeholder="Default input" 
      />
      
      <Input 
        type="text" 
        placeholder="Large input" 
        className="h-12 text-lg"
      />
    </div>
  );
}
```

### Form Example

```jsx live
function FormExample() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Form submitted: ' + JSON.stringify(formData, null, 2));
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Name *
        </label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange('name')}
          required
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email *
        </label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={handleChange('email')}
          required
        />
      </div>
      
      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-2">
          Phone
        </label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={formData.phone}
          onChange={handleChange('phone')}
        />
      </div>
      
      <button 
        type="submit"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Submit
      </button>
    </form>
  );
}
```

## API Reference

### Input Props

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
        <td><code>type</code></td>
        <td><code>string</code></td>
        <td><code>"text"</code></td>
        <td>Input type (text, password, email, number, etc.)</td>
      </tr>
      <tr>
        <td><code>placeholder</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>Placeholder text</td>
      </tr>
      <tr>
        <td><code>value</code></td>
        <td><code>string | number</code></td>
        <td><code>undefined</code></td>
        <td>Controlled value</td>
      </tr>
      <tr>
        <td><code>defaultValue</code></td>
        <td><code>string | number</code></td>
        <td><code>undefined</code></td>
        <td>Default value for uncontrolled input</td>
      </tr>
      <tr>
        <td><code>onChange</code></td>
        <td><code>(e: ChangeEvent) => void</code></td>
        <td><code>undefined</code></td>
        <td>Change event handler</td>
      </tr>
      <tr>
        <td><code>disabled</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Disable the input</td>
      </tr>
      <tr>
        <td><code>required</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Mark as required field</td>
      </tr>
      <tr>
        <td><code>autoFocus</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Auto-focus on mount</td>
      </tr>
      <tr>
        <td><code>autoComplete</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>Browser autocomplete hint</td>
      </tr>
      <tr>
        <td><code>className</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>Additional CSS classes</td>
      </tr>
      <tr>
        <td><code>min</code></td>
        <td><code>string | number</code></td>
        <td><code>undefined</code></td>
        <td>Minimum value (for number/date inputs)</td>
      </tr>
      <tr>
        <td><code>max</code></td>
        <td><code>string | number</code></td>
        <td><code>undefined</code></td>
        <td>Maximum value (for number/date inputs)</td>
      </tr>
      <tr>
        <td><code>pattern</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>Validation pattern (regex)</td>
      </tr>
      <tr>
        <td><code>maxLength</code></td>
        <td><code>number</code></td>
        <td><code>undefined</code></td>
        <td>Maximum character length</td>
      </tr>
    </tbody>
  </table>
</div>

### Events

All standard input events are supported:

- `onChange` - Value change
- `onFocus` - Input focused
- `onBlur` - Input lost focus
- `onKeyDown` - Key pressed
- `onKeyUp` - Key released
- `onInput` - Input event
- `onInvalid` - Validation failed
- `onPaste` - Content pasted

## Styling

### CSS Variables

```css
:root {
  --input-height: 2.5rem;
  --input-padding: 0.5rem 0.75rem;
  --input-font-size: 0.875rem;
  --input-border: 1px solid #d1d5db;
  --input-radius: 0.375rem;
  --input-background: white;
  --input-focus-ring: 2px solid #3b82f6;
}

[data-theme='dark'] {
  --input-background: #1f2937;
  --input-border: 1px solid #374151;
}
```

### Custom Styles

```tsx
// Gradient border
<Input className="border-0 bg-gradient-to-r from-purple-500 to-pink-500 p-[1px]">
  <div className="bg-white px-3 py-2 rounded">
    Gradient border input
  </div>
</Input>

// Rounded full
<Input className="rounded-full px-4" placeholder="Rounded input" />

// With shadow
<Input className="shadow-sm" placeholder="Input with shadow" />
```

## Accessibility

The Input component is fully accessible:

- **ARIA Attributes**: Proper labeling and descriptions
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Clear announcements
- **Focus Management**: Visible focus indicators
- **Error Announcements**: Validation errors announced
- **Required Fields**: Clear indication of required fields

### Keyboard Support

| Key | Action |
|-----|--------|
| `Tab` | Move focus to/from input |
| `Shift + Tab` | Move focus backwards |
| `Enter` | Submit form (in forms) |
| `Escape` | Clear search (type="search") |

## Best Practices

### Do's ✅

- Always provide labels for inputs
- Use appropriate input types
- Provide helpful placeholder text
- Show validation feedback clearly
- Include helper text when needed
- Use autocomplete attributes

### Don'ts ❌

- Don't use placeholder as label
- Don't make all fields required
- Don't hide important helper text
- Don't use custom validation without feedback
- Don't disable copy/paste for passwords

## Common Patterns

### Password with Toggle

```tsx
function PasswordInput() {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        placeholder="Enter password"
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-2 top-1/2 -translate-y-1/2"
      >
        {showPassword ? "👁️" : "👁️‍🗨️"}
      </button>
    </div>
  );
}
```

### Search with Clear

```tsx
function SearchInput() {
  const [search, setSearch] = useState('');
  
  return (
    <div className="relative">
      <Input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
        className="pr-10"
      />
      {search && (
        <button
          onClick={() => setSearch('')}
          className="absolute right-2 top-1/2 -translate-y-1/2"
        >
          ✕
        </button>
      )}
    </div>
  );
}
```

## Related Components

- [Form](/docs/components/form) - Form wrapper with validation
- [Label](/docs/components/label) - Accessible labels
- [Textarea](/docs/components/textarea) - Multi-line text input
- [Select](/docs/components/select) - Dropdown selection
- [Button](/docs/components/button) - Form submission

## Resources

- [MDN Input Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input)
- [WAI-ARIA Text Input](https://www.w3.org/WAI/ARIA/apg/patterns/textbox/)
- [Form Design Best Practices](https://www.nngroup.com/articles/form-design-patterns/)
