---
id: sonner
title: Sonner
sidebar_position: 31
---

import { Toaster, toast } from '@dainabase/ui';

# Sonner

An opinionated toast notification library with a beautiful API, smooth animations, and extensive customization options.

## Preview

```jsx live
function SonnerDemo() {
  return (
    <div>
      <Toaster />
      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => toast('Event has been created')}>
          Default
        </Button>
        <Button onClick={() => toast.success('Successfully saved!')}>
          Success
        </Button>
        <Button onClick={() => toast.error('Something went wrong')}>
          Error
        </Button>
        <Button onClick={() => toast.warning('Please verify your email')}>
          Warning
        </Button>
        <Button onClick={() => toast.info('New version available')}>
          Info
        </Button>
        <Button 
          onClick={() => {
            const promise = new Promise((resolve) => {
              setTimeout(() => resolve({ name: 'Sonner' }), 2000);
            });
            
            toast.promise(promise, {
              loading: 'Loading...',
              success: (data) => `${data.name} toast has been added`,
              error: 'Error',
            });
          }}
        >
          Promise
        </Button>
      </div>
    </div>
  );
}
```

## Features

- 🎯 **Beautiful by default** - Carefully designed with attention to detail
- 🎨 **Highly customizable** - Styling, positioning, and behavior options
- 🚀 **Promise API** - Built-in loading, success, and error states
- 📱 **Responsive** - Works perfectly on mobile and desktop
- ♿ **Accessible** - Screen reader friendly with ARIA live regions
- 🎭 **Rich content** - Support for custom JSX components
- 🔄 **Auto-dismiss** - Configurable duration with pause on hover
- 📚 **Stacking** - Smart toast stacking and management
- 🎪 **Smooth animations** - Beautiful enter and exit animations
- 🌙 **Dark mode** - Automatic theme detection and support

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```jsx
// Add the Toaster component to your app root
import { Toaster } from '@dainabase/ui';

function App() {
  return (
    <>
      <Toaster />
      <YourApp />
    </>
  );
}

// Then use toast from anywhere
import { toast } from '@dainabase/ui';

function MyComponent() {
  return (
    <Button onClick={() => toast('Hello World')}>
      Show Toast
    </Button>
  );
}
```

## Examples

### Basic Toast Types

```jsx
// Default toast
toast('Event has been created');

// Success toast
toast.success('Successfully saved!');

// Error toast
toast.error('Something went wrong');

// Warning toast  
toast.warning('Please verify your email');

// Info toast
toast.info('New version available');
```

### Custom Toast with JSX

```jsx
toast(
  <div className="flex items-center gap-2">
    <Avatar>
      <AvatarImage src="/user.jpg" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
    <div>
      <div className="font-semibold">John Doe</div>
      <div className="text-sm text-muted-foreground">
        Sent you a message
      </div>
    </div>
  </div>
);
```

### Toast with Action Button

```jsx
toast('File uploaded successfully', {
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo'),
  },
});

// Or with custom action
toast(
  <div>
    <div>Meeting invitation received</div>
    <div className="flex gap-2 mt-2">
      <Button size="sm" onClick={() => toast.dismiss()}>
        Accept
      </Button>
      <Button size="sm" variant="outline" onClick={() => toast.dismiss()}>
        Decline
      </Button>
    </div>
  </div>
);
```

### Promise Toast

```jsx
// Simple promise
const promise = fetch('/api/data').then(res => res.json());

toast.promise(promise, {
  loading: 'Loading data...',
  success: 'Data loaded successfully',
  error: 'Failed to load data',
});

// With dynamic messages
toast.promise(
  saveUser(userData),
  {
    loading: 'Saving user...',
    success: (data) => `User ${data.name} saved successfully`,
    error: (err) => `Error: ${err.message}`,
  }
);
```

### Dismissible Toast

```jsx
// Manual dismiss
const toastId = toast('This can be dismissed');

// Dismiss after action
setTimeout(() => {
  toast.dismiss(toastId);
}, 3000);

// Dismiss all toasts
toast.dismiss();

// Toast with close button (default)
toast('Dismissible toast', {
  dismissible: true,
});
```

### Custom Duration

```jsx
// 10 second duration
toast('This will stay for 10 seconds', {
  duration: 10000,
});

// Infinite duration (manual dismiss only)
toast('This won\'t auto-dismiss', {
  duration: Infinity,
});

// Different durations for different types
toast.success('Quick success', {
  duration: 2000,
});

toast.error('Important error', {
  duration: 7000,
});
```

### Positioning

```jsx
// Configure position in Toaster component
<Toaster position="top-center" />
<Toaster position="top-right" />
<Toaster position="bottom-center" />
<Toaster position="bottom-right" />
<Toaster position="bottom-left" />
<Toaster position="top-left" />

// Or per toast
toast('Custom position', {
  position: 'top-center',
});
```

### Styled Toasts

```jsx
// Custom styles
toast('Styled toast', {
  style: {
    background: 'linear-gradient(to right, #00b4db, #0083b0)',
    color: 'white',
  },
  className: 'my-custom-toast',
});

// Custom icons
toast('Custom icon', {
  icon: '🚀',
});

toast.success('Custom success icon', {
  icon: '✅',
});

// Remove icons
toast.success('No icon', {
  icon: false,
});
```

### Rich Content Toast

```jsx
toast(
  <div className="w-full">
    <div className="flex items-center justify-between mb-2">
      <span className="font-semibold">Upload Progress</span>
      <span className="text-sm text-muted-foreground">75%</span>
    </div>
    <Progress value={75} className="h-2" />
    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
      <span>15 MB / 20 MB</span>
      <span>~5 seconds remaining</span>
    </div>
  </div>,
  {
    duration: Infinity,
  }
);
```

### Form Validation Toasts

```jsx
function handleSubmit(data) {
  const errors = validateForm(data);
  
  if (errors.length > 0) {
    errors.forEach(error => {
      toast.error(error.message, {
        description: error.field,
      });
    });
    return;
  }
  
  toast.promise(
    submitForm(data),
    {
      loading: 'Submitting form...',
      success: 'Form submitted successfully!',
      error: (err) => `Submission failed: ${err.message}`,
    }
  );
}
```

### Global Configuration

```jsx
// Configure all toasts globally
<Toaster
  position="bottom-center"
  toastOptions={{
    duration: 5000,
    style: {
      background: '#363636',
      color: '#fff',
    },
    className: 'my-toast-class',
    dismissible: true,
  }}
  expand={false}
  richColors
  closeButton
/>
```

## API Reference

### Toaster Component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `Position` | `"bottom-right"` | Position of toasts on screen |
| `hotkey` | `string[]` | `["altKey", "KeyT"]` | Keyboard shortcut to open toasts |
| `richColors` | `boolean` | `false` | Use more colorful toasts |
| `expand` | `boolean` | `true` | Expand toasts by default |
| `duration` | `number` | `4000` | Default duration in ms |
| `gap` | `number` | `14` | Gap between toasts in pixels |
| `visibleToasts` | `number` | `3` | Number of visible toasts |
| `closeButton` | `boolean` | `false` | Show close button on all toasts |
| `toastOptions` | `ToastOptions` | - | Default options for all toasts |
| `className` | `string` | - | CSS class for toaster container |
| `style` | `CSSProperties` | - | Inline styles for container |
| `offset` | `string \| number` | `"32px"` | Offset from screen edge |
| `dir` | `"ltr" \| "rtl" \| "auto"` | `"auto"` | Text direction |
| `theme` | `"light" \| "dark" \| "system"` | `"system"` | Theme mode |
| `invert` | `boolean` | `false` | Invert toast colors |

### Toast Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `toast()` | Show a default toast | `message, options?` |
| `toast.success()` | Show a success toast | `message, options?` |
| `toast.error()` | Show an error toast | `message, options?` |
| `toast.warning()` | Show a warning toast | `message, options?` |
| `toast.info()` | Show an info toast | `message, options?` |
| `toast.promise()` | Show promise-based toast | `promise, messages, options?` |
| `toast.custom()` | Show custom component toast | `component, options?` |
| `toast.dismiss()` | Dismiss toast(s) | `toastId?` |
| `toast.message()` | Show a message toast | `message, options?` |

### Toast Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | `string \| number` | - | Unique identifier for toast |
| `duration` | `number` | `4000` | Duration in milliseconds |
| `position` | `Position` | - | Override position for this toast |
| `dismissible` | `boolean` | `true` | Can be dismissed |
| `description` | `string \| ReactNode` | - | Toast description |
| `action` | `Action` | - | Action button configuration |
| `cancel` | `Action` | - | Cancel button configuration |
| `onDismiss` | `(toast: Toast) => void` | - | Callback when dismissed |
| `onAutoClose` | `(toast: Toast) => void` | - | Callback when auto-closed |
| `important` | `boolean` | `false` | Prevent auto-dismiss |
| `icon` | `ReactNode \| boolean` | - | Custom icon or disable |
| `className` | `string` | - | CSS class for toast |
| `style` | `CSSProperties` | - | Inline styles |
| `descriptionClassName` | `string` | - | CSS class for description |
| `unstyled` | `boolean` | `false` | Remove default styles |

### Position Values

- `"top-left"`
- `"top-center"`
- `"top-right"`
- `"bottom-left"`
- `"bottom-center"`
- `"bottom-right"`

## Accessibility

Sonner is built with accessibility in mind:

- Uses ARIA live regions for screen reader announcements
- Polite announcement mode by default
- Keyboard dismissible with Escape key
- Focus management for action buttons
- High contrast mode support
- Reduced motion support
- Semantic HTML structure
- Proper ARIA labels and descriptions

## Best Practices

### ✅ Do's

- Use appropriate toast types for different messages
- Keep messages concise and actionable
- Provide undo actions when possible
- Use promise toasts for async operations
- Position toasts consistently across your app
- Test with screen readers
- Consider toast duration based on content length
- Group related toasts when possible
- Use descriptions for additional context
- Implement proper error handling

### ❌ Don'ts

- Don't overwhelm users with too many toasts
- Avoid using toasts for critical information only
- Don't use long durations unnecessarily
- Avoid blocking user interaction with toasts
- Don't rely solely on color to convey meaning
- Avoid complex interactions in toasts
- Don't use toasts for form validation only
- Avoid inconsistent positioning
- Don't forget to handle promise rejections
- Avoid auto-dismissing important messages too quickly

## Use Cases

- **Form submissions** - Success/error feedback
- **File uploads** - Progress and completion notifications
- **Save operations** - Confirmation messages
- **Network status** - Online/offline notifications
- **User actions** - Undo/redo notifications
- **System updates** - Version and maintenance notices
- **Authentication** - Login/logout confirmations
- **Data syncing** - Sync status updates
- **Notifications** - Real-time message alerts
- **Validation** - Input validation feedback

## Related Components

- [Toast](/docs/components/toast) - Alternative toast implementation
- [Alert](/docs/components/alert) - Static alert messages
- [Alert Dialog](/docs/components/alert-dialog) - Modal alerts
- [Dialog](/docs/components/dialog) - Modal dialogs
- [Popover](/docs/components/popover) - Contextual popover content
