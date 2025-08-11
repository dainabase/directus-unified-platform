# Label

Semantic label component for form inputs

## Import

```tsx
import { Label } from '@dainabase/ui/label';
```

## Basic Usage

```tsx
import { Label } from '@dainabase/ui/label';
import { Input } from '@dainabase/ui/input';

export default function LabelExample() {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email Address</Label>
      <Input id="email" type="email" placeholder="Enter your email" />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| htmlFor | `string` | - | No | Associates label with form control |
| required | `boolean` | false | No | Shows required indicator |
| disabled | `boolean` | false | No | Disabled state styling |
| error | `boolean` | false | No | Error state styling |
| className | `string` | - | No | Additional CSS classes |
| children | `ReactNode` | - | Yes | Label text content |
| ...props | `LabelHTMLAttributes` | - | No | Standard label attributes |

## Examples

### Basic Label

```tsx
<Label htmlFor="username">Username</Label>
```

### Required Field Label

```tsx
<Label htmlFor="password" required>
  Password
</Label>
```

### Label with Error State

```tsx
<Label htmlFor="email" error>
  Email Address
</Label>
```

### Advanced Label Usage

```tsx
import { Label } from '@dainabase/ui/label';
import { Input } from '@dainabase/ui/input';
import { useState } from 'react';

function LabelAdvanced() {
  const [value, setValue] = useState('');
  const hasError = value.length > 0 && value.length < 3;
  
  return (
    <div className="space-y-2">
      <Label 
        htmlFor="username" 
        required 
        error={hasError}
      >
        Username (min 3 characters)
      </Label>
      <Input 
        id="username" 
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={hasError ? 'border-red-500' : ''}
      />
    </div>
  );
}
```

## Accessibility

- Properly associates with form controls via `htmlFor`
- Supports screen readers
- Indicates required fields accessibly
- Error states communicated to assistive technology
- Follows WCAG 2.1 guidelines

## Best Practices

1. Always use `htmlFor` to associate with inputs
2. Keep label text concise and descriptive
3. Place labels consistently (above or to the left)
4. Use required indicators for mandatory fields
5. Provide helpful text for complex inputs

## Common Use Cases

- Form field labels
- Checkbox and radio labels
- Toggle switch labels
- File upload labels
- Settings panel labels

## API Reference

### Label Component

The Label component extends standard HTML label attributes:

- `htmlFor`: Links to input element ID
- `required`: Shows asterisk or indicator
- `disabled`: Applies disabled styling
- `error`: Applies error state styling
- `className`: Additional styling

## Styling

### With Tailwind CSS
```tsx
<Label 
  htmlFor="name" 
  className="text-sm font-medium text-gray-700"
>
  Full Name
</Label>
```

### Required Indicator
```tsx
<Label htmlFor="email" required>
  Email <span className="text-red-500">*</span>
</Label>
```

### Custom Styling
```tsx
<Label 
  htmlFor="bio" 
  className="block mb-2 text-sm font-semibold"
>
  Biography
</Label>
```

## TypeScript

Full TypeScript support with type definitions:

```tsx
import { Label, LabelProps } from '@dainabase/ui/label';

interface FormFieldProps extends LabelProps {
  fieldId: string;
  label: string;
}

const FormField: React.FC<FormFieldProps> = ({ fieldId, label, ...props }) => {
  return (
    <Label htmlFor={fieldId} {...props}>
      {label}
    </Label>
  );
};
```

## Testing

Example test with React Testing Library:

```tsx
import { render, screen } from '@testing-library/react';
import { Label } from '@dainabase/ui/label';

describe('Label', () => {
  it('renders label text correctly', () => {
    render(<Label htmlFor="test">Test Label</Label>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });
  
  it('associates with input correctly', () => {
    render(<Label htmlFor="input-id">Label Text</Label>);
    const label = screen.getByText('Label Text');
    expect(label).toHaveAttribute('for', 'input-id');
  });
});
```

## Performance Considerations

- Minimal DOM footprint
- No JavaScript overhead
- Efficient rendering
- Accessible by default

## Migration Guide

### From Material-UI
```tsx
// Before (MUI)
<InputLabel htmlFor="input">Label</InputLabel>

// After (Directus UI)
<Label htmlFor="input">Label</Label>
```

### From Ant Design
```tsx
// Before (Ant Design)
<Form.Item label="Username">

// After (Directus UI)
<Label htmlFor="username">Username</Label>
```

## Related Components

- [Input](./input.md) - Text input fields
- [Form](./form.md) - Form wrapper component
- [Checkbox](./checkbox.md) - Checkbox with label
- [Radio Group](./radio-group.md) - Radio buttons with labels

## Resources

- [Component Source](https://github.com/dainabase/directus-unified-platform/tree/main/packages/ui/src/components/label)
- [Storybook Demo](https://directus-ui.vercel.app/?path=/story/label)
- [Accessibility Guidelines](../guides/accessibility.md)

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>