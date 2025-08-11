# Button Component

Interactive button component with multiple variants, sizes, and states.

## Overview

The Button component is a fundamental UI element that triggers actions when clicked. It supports various styles, sizes, loading states, and can include icons.

<div align="center">

![Button Examples](https://img.shields.io/badge/Status-Stable-green)
![Accessibility](https://img.shields.io/badge/Accessibility-AA-success)

</div>

## Installation

```tsx
import { Button } from '@directus/ui';
import '@directus/ui/dist/styles.css';
```

## Props API

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  
  /** Button size */
  size?: 'sm' | 'md' | 'lg' | 'icon';
  
  /** Loading state */
  loading?: boolean;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Full width button */
  fullWidth?: boolean;
  
  /** Icon to display before text */
  leftIcon?: React.ReactNode;
  
  /** Icon to display after text */
  rightIcon?: React.ReactNode;
  
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Children content */
  children?: React.ReactNode;
  
  /** Render as a different element */
  as?: React.ElementType;
  
  /** Accessible label */
  'aria-label'?: string;
}
```

## Usage Examples

### Basic Usage

```tsx
import { Button } from '@directus/ui';

function BasicExample() {
  return (
    <Button onClick={() => console.log('Clicked!')}>
      Click me
    </Button>
  );
}
```

### Variants

```tsx
function VariantsExample() {
  return (
    <div className="flex gap-4">
      <Button variant="default">Default</Button>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  );
}
```

### Sizes

```tsx
function SizesExample() {
  return (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Settings">
        <IconSettings />
      </Button>
    </div>
  );
}
```

### With Icons

```tsx
import { Button } from '@directus/ui';
import { Download, ChevronRight, Settings } from 'lucide-react';

function IconExample() {
  return (
    <div className="flex gap-4">
      <Button leftIcon={<Download size={16} />}>
        Download
      </Button>
      
      <Button rightIcon={<ChevronRight size={16} />}>
        Next
      </Button>
      
      <Button 
        variant="outline"
        leftIcon={<Settings size={16} />}
        rightIcon={<ChevronRight size={16} />}
      >
        Settings
      </Button>
    </div>
  );
}
```

### Loading State

```tsx
function LoadingExample() {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    await someAsyncOperation();
    setLoading(false);
  };
  
  return (
    <Button 
      loading={loading}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? 'Processing...' : 'Submit'}
    </Button>
  );
}
```

### Full Width

```tsx
function FullWidthExample() {
  return (
    <div className="w-full max-w-md">
      <Button fullWidth variant="primary">
        Full Width Button
      </Button>
    </div>
  );
}
```

### Button Group

```tsx
function ButtonGroupExample() {
  return (
    <div className="inline-flex rounded-lg shadow-sm" role="group">
      <Button variant="outline" className="rounded-r-none">
        Previous
      </Button>
      <Button variant="outline" className="rounded-none border-x-0">
        Current
      </Button>
      <Button variant="outline" className="rounded-l-none">
        Next
      </Button>
    </div>
  );
}
```

### As Link

```tsx
import { Link } from 'react-router-dom';

function LinkButtonExample() {
  return (
    <Button as={Link} to="/dashboard" variant="primary">
      Go to Dashboard
    </Button>
  );
}
```

## Styling

### CSS Variables

```css
:root {
  /* Colors */
  --button-primary-bg: #2563eb;
  --button-primary-hover: #1d4ed8;
  --button-primary-text: #ffffff;
  
  --button-secondary-bg: #64748b;
  --button-secondary-hover: #475569;
  --button-secondary-text: #ffffff;
  
  --button-destructive-bg: #dc2626;
  --button-destructive-hover: #b91c1c;
  --button-destructive-text: #ffffff;
  
  /* Sizing */
  --button-padding-sm: 0.25rem 0.75rem;
  --button-padding-md: 0.5rem 1rem;
  --button-padding-lg: 0.75rem 1.5rem;
  
  --button-font-size-sm: 0.875rem;
  --button-font-size-md: 1rem;
  --button-font-size-lg: 1.125rem;
  
  /* Other */
  --button-border-radius: 0.375rem;
  --button-font-weight: 500;
  --button-transition: all 0.2s ease;
}
```

### Custom Styling

```tsx
// Using className
<Button className="custom-button">
  Custom Styled
</Button>

// CSS
.custom-button {
  background: linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%);
  border: 0;
  color: white;
  padding: 0 30px;
  box-shadow: 0 3px 5px 2px rgba(255, 105, 135, .3);
}
```

## Accessibility

The Button component follows WAI-ARIA best practices:

- ✅ **Keyboard Navigation**: Full keyboard support with Tab, Space, and Enter keys
- ✅ **Focus Management**: Clear focus indicators
- ✅ **ARIA Labels**: Support for aria-label, aria-pressed, aria-disabled
- ✅ **Screen Readers**: Proper announcements for all states
- ✅ **Color Contrast**: WCAG AA compliant color combinations

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Focus button |
| `Space` | Activate button |
| `Enter` | Activate button |

### ARIA Examples

```tsx
// Icon-only button
<Button size="icon" aria-label="Open settings">
  <Settings />
</Button>

// Toggle button
<Button 
  aria-pressed={isPressed}
  onClick={() => setIsPressed(!isPressed)}
>
  Toggle
</Button>

// Loading button
<Button 
  loading={loading}
  aria-busy={loading}
  aria-disabled={loading}
>
  Submit
</Button>
```

## Best Practices

### ✅ Do's

- Use descriptive text that clearly indicates the action
- Provide `aria-label` for icon-only buttons
- Use appropriate variants for different actions (e.g., destructive for delete)
- Group related buttons together
- Disable buttons during async operations

### ❌ Don'ts

- Don't use vague labels like "Click here"
- Don't rely only on color to convey meaning
- Don't use buttons for navigation (use links instead)
- Don't make buttons too small on mobile (min 44x44px)

## Performance

### Lazy Loading

For better performance, the Button component can be lazy loaded:

```tsx
import { lazy, Suspense } from 'react';

const Button = lazy(() => 
  import('@directus/ui').then(mod => ({ default: mod.Button }))
);

function App() {
  return (
    <Suspense fallback={<span>Loading...</span>}>
      <Button>Lazy Loaded Button</Button>
    </Suspense>
  );
}
```

### Optimization Tips

1. Use `React.memo` for buttons that re-render frequently
2. Memoize click handlers with `useCallback`
3. Avoid inline styles and functions
4. Use CSS classes instead of style props

## Common Patterns

### Form Submit Button

```tsx
function FormSubmitButton() {
  const [loading, setLoading] = useState(false);
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <Button 
        type="submit"
        variant="primary"
        loading={loading}
        fullWidth
      >
        Submit Form
      </Button>
    </form>
  );
}
```

### Confirmation Dialog

```tsx
function DeleteButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  
  return (
    <>
      <Button 
        variant="destructive"
        onClick={() => setShowConfirm(true)}
      >
        Delete
      </Button>
      
      {showConfirm && (
        <Dialog>
          <p>Are you sure?</p>
          <Button onClick={handleDelete}>Confirm</Button>
          <Button variant="ghost" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
        </Dialog>
      )}
    </>
  );
}
```

## Related Components

- [IconButton](./icon-button.md) - Specialized icon-only button
- [Toggle](./toggle.md) - Toggle button for on/off states
- [ToggleGroup](./toggle-group.md) - Group of toggle buttons
- [Link](./link.md) - For navigation

## API Reference

- [ButtonProps Interface](../api/button.md#props)
- [Button Variants](../api/button.md#variants)
- [Button Methods](../api/button.md#methods)

---

<div align="center">

[← Back to Components](./README.md) | [View in Storybook →](https://storybook.directus.io/?path=/story/button)

</div>
