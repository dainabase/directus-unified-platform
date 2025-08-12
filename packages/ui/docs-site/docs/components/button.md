---
id: button
title: Button
sidebar_position: 1
---

import { Button } from '@dainabase/ui';

# Button

Buttons trigger actions or events when activated. They are fundamental interactive elements that enable users to perform actions and make choices with a single click or tap.

<div className="component-preview">
  <Button>Click me</Button>
</div>

## Features

- **Multiple Variants**: Primary, secondary, destructive, outline, ghost, and link styles
- **Size Options**: Small, medium, large, and icon-only sizes
- **Loading States**: Built-in loading spinner with disabled interaction
- **Full Accessibility**: Keyboard navigation, ARIA attributes, and focus management
- **Icon Support**: Leading and trailing icon positions
- **Flexible Rendering**: Render as button, anchor, or custom component with `asChild`

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import { Button } from '@dainabase/ui';

export function Example() {
  return <Button>Click me</Button>;
}
```

## Examples

### Variants

Use the `variant` prop to change the visual style of the button.

```jsx live
function VariantsExample() {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button variant="default">Default</Button>
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

Use the `size` prop to change the size of the button.

```jsx live
function SizesExample() {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <span>🚀</span>
      </Button>
    </div>
  );
}
```

### With Icons

Add icons to enhance button meaning and visual hierarchy.

```tsx
import { Button } from '@dainabase/ui';
import { ChevronRight, Download, Heart } from 'lucide-react';

export function IconExample() {
  return (
    <div className="flex gap-4">
      <Button>
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
      
      <Button variant="outline">
        <Heart className="mr-2 h-4 w-4" />
        Like
      </Button>
      
      <Button>
        Continue
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
```

### Loading State

Show a loading state to indicate ongoing operations.

```jsx live
function LoadingExample() {
  const [isLoading, setIsLoading] = React.useState(false);
  
  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };
  
  return (
    <Button 
      onClick={handleClick} 
      disabled={isLoading}
    >
      {isLoading ? 'Processing...' : 'Submit'}
    </Button>
  );
}
```

### Disabled State

Disable buttons to prevent interaction when actions are unavailable.

```tsx
<Button disabled>Disabled Button</Button>
```

### As Link

Render the button as a link for navigation purposes.

```tsx
import { Button } from '@dainabase/ui';

export function LinkExample() {
  return (
    <Button asChild>
      <a href="/docs">Documentation</a>
    </Button>
  );
}
```

### Button Group

Group related actions together.

```jsx live
function ButtonGroup() {
  return (
    <div style={{ display: 'flex', gap: '0' }}>
      <Button 
        variant="outline" 
        style={{ borderRadius: '4px 0 0 4px' }}
      >
        Previous
      </Button>
      <Button 
        variant="outline" 
        style={{ borderLeft: 'none', borderRadius: '0' }}
      >
        1
      </Button>
      <Button 
        variant="outline" 
        style={{ borderLeft: 'none', borderRadius: '0' }}
      >
        2
      </Button>
      <Button 
        variant="outline" 
        style={{ borderLeft: 'none', borderRadius: '0' }}
      >
        3
      </Button>
      <Button 
        variant="outline" 
        style={{ borderLeft: 'none', borderRadius: '0 4px 4px 0' }}
      >
        Next
      </Button>
    </div>
  );
}
```

## API Reference

### Button Props

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
        <td><code>variant</code></td>
        <td><code>"default" | "secondary" | "destructive" | "outline" | "ghost" | "link"</code></td>
        <td><code>"default"</code></td>
        <td>The visual style variant of the button</td>
      </tr>
      <tr>
        <td><code>size</code></td>
        <td><code>"default" | "sm" | "lg" | "icon"</code></td>
        <td><code>"default"</code></td>
        <td>The size of the button</td>
      </tr>
      <tr>
        <td><code>asChild</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Render as a child component</td>
      </tr>
      <tr>
        <td><code>disabled</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Whether the button is disabled</td>
      </tr>
      <tr>
        <td><code>loading</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Show loading spinner</td>
      </tr>
      <tr>
        <td><code>className</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>Additional CSS classes</td>
      </tr>
      <tr>
        <td><code>children</code></td>
        <td><code>ReactNode</code></td>
        <td><code>undefined</code></td>
        <td>Button content</td>
      </tr>
      <tr>
        <td><code>onClick</code></td>
        <td><code>(event: MouseEvent) => void</code></td>
        <td><code>undefined</code></td>
        <td>Click event handler</td>
      </tr>
    </tbody>
  </table>
</div>

### Events

All standard button events are supported:

- `onClick` - Fired when the button is clicked
- `onFocus` - Fired when the button receives focus
- `onBlur` - Fired when the button loses focus
- `onMouseEnter` - Fired when mouse enters the button
- `onMouseLeave` - Fired when mouse leaves the button
- `onKeyDown` - Fired when a key is pressed
- `onKeyUp` - Fired when a key is released

## Styling

### CSS Variables

Customize the button appearance using CSS variables:

```css
:root {
  --button-radius: 0.5rem;
  --button-height: 2.5rem;
  --button-padding-x: 1rem;
  --button-font-size: 0.875rem;
  --button-font-weight: 500;
}
```

### Custom Styles

Apply custom styles using the `className` prop:

```tsx
<Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
  Gradient Button
</Button>
```

## Accessibility

The Button component follows WAI-ARIA guidelines:

- **Keyboard Navigation**: Buttons can be activated with Enter or Space keys
- **Focus Management**: Proper focus ring and focus-visible styles
- **ARIA Attributes**: Includes appropriate role and aria-pressed states
- **Screen Reader Support**: Descriptive labels and states announced

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Move focus to the button |
| `Enter` | Activate the button |
| `Space` | Activate the button |

## Best Practices

### Do's ✅

- Use descriptive, action-oriented labels (e.g., "Save Changes" not just "Save")
- Provide visual feedback for hover, focus, and active states
- Group related actions using button groups
- Use appropriate variants for different action types
- Include icons to enhance meaning when helpful

### Don'ts ❌

- Don't use buttons for navigation (use links instead)
- Don't disable buttons without clear indication why
- Don't use too many button styles on the same page
- Don't make buttons too small on touch devices
- Don't rely solely on color to convey meaning

## Patterns

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
        Delete Account
      </Button>
      
      {showConfirm && (
        <Dialog>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
```

### Form Submission

```tsx
function SubmitButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitForm();
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Button 
      onClick={handleSubmit}
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Submitting...' : 'Submit Form'}
    </Button>
  );
}
```

## Related Components

- [Link](/docs/components/link) - For navigation
- [IconButton](/docs/components/icon-button) - Icon-only buttons
- [Toggle](/docs/components/toggle) - For on/off states
- [DropdownMenu](/docs/components/dropdown-menu) - For button with menu

## Resources

- [WAI-ARIA Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- [MDN Button Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button)
- [Button UX Best Practices](https://www.nngroup.com/articles/buttons/)
