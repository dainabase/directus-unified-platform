---
id: toast
title: Toast
sidebar_position: 52
---

import { Toast, ToastProvider, useToast } from '@dainabase/ui';

# Toast

A notification component that displays temporary messages to users. Perfect for success messages, error notifications, warnings, and informational alerts.

<div className="component-preview">
  <button onClick={() => showToast('Hello from Toast! 🎉')}>
    Show Toast
  </button>
</div>

## Features

- **Multiple Types**: Success, error, warning, info, and custom styles
- **Positioning**: Top, bottom, left, right, center positions
- **Auto Dismiss**: Configurable duration with manual dismiss option
- **Stacking**: Multiple toasts with smart stacking
- **Actions**: Support for action buttons within toasts
- **Progress Bar**: Visual timer for auto-dismiss
- **Swipe to Dismiss**: Touch-friendly gesture support
- **Accessibility**: Screen reader announcements
- **Promise States**: Loading, success, and error states for async operations
- **Custom Rendering**: Fully customizable toast content

## Installation

```bash
npm install @dainabase/ui sonner
```

## Usage

```tsx
import { ToastProvider, useToast } from '@dainabase/ui';

// Wrap your app with ToastProvider
function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  );
}

// Use the toast hook in any component
function YourComponent() {
  const { toast } = useToast();

  const showToast = () => {
    toast({
      title: "Success!",
      description: "Your changes have been saved.",
    });
  };

  return <button onClick={showToast}>Show Toast</button>;
}
```

## Examples

### Basic Toast Types

```jsx live
function BasicToastExample() {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => toast({
          title: "Success!",
          description: "Your action was completed successfully.",
          variant: "success"
        })}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Success Toast
      </button>
      
      <button
        onClick={() => toast({
          title: "Error!",
          description: "Something went wrong. Please try again.",
          variant: "error"
        })}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Error Toast
      </button>
      
      <button
        onClick={() => toast({
          title: "Warning",
          description: "Please review your input before continuing.",
          variant: "warning"
        })}
        className="px-4 py-2 bg-yellow-500 text-white rounded"
      >
        Warning Toast
      </button>
      
      <button
        onClick={() => toast({
          title: "Info",
          description: "Here's some helpful information.",
          variant: "info"
        })}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Info Toast
      </button>
    </div>
  );
}
```

### Toast with Actions

```jsx live
function ToastWithActionsExample() {
  const { toast } = useToast();

  const showActionToast = () => {
    toast({
      title: "Undo Action",
      description: "You deleted an important file.",
      action: (
        <button
          onClick={() => console.log('Undo clicked')}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Undo
        </button>
      ),
      duration: 10000 // Longer duration for action toasts
    });
  };

  const showConfirmToast = () => {
    toast({
      title: "Confirm Delete?",
      description: "This action cannot be undone.",
      action: (
        <div className="flex gap-2">
          <button
            onClick={() => {
              console.log('Deleted');
              toast.dismiss();
            }}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-3 py-1 border rounded text-sm"
          >
            Cancel
          </button>
        </div>
      ),
      duration: Infinity // Won't auto-dismiss
    });
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={showActionToast}
        className="px-4 py-2 bg-purple-500 text-white rounded"
      >
        Toast with Undo
      </button>
      <button
        onClick={showConfirmToast}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Confirmation Toast
      </button>
    </div>
  );
}
```

### Promise-based Toast

```jsx live
function PromiseToastExample() {
  const { toast } = useToast();

  const handleSave = () => {
    const savePromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        // Randomly succeed or fail
        Math.random() > 0.5 ? resolve('Data saved!') : reject('Save failed');
      }, 2000);
    });

    toast.promise(savePromise, {
      loading: 'Saving your data...',
      success: (data) => `${data}`,
      error: (err) => `Error: ${err}`
    });
  };

  const handleUpload = async () => {
    const uploadPromise = new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress >= 100) {
          clearInterval(interval);
          resolve('Upload complete!');
        }
      }, 200);
    });

    toast.promise(uploadPromise, {
      loading: 'Uploading file...',
      success: 'File uploaded successfully!',
      error: 'Upload failed'
    });
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Save (Promise)
      </button>
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Upload File
      </button>
    </div>
  );
}
```

### Custom Styled Toast

```jsx live
function CustomToastExample() {
  const { toast } = useToast();

  const showCustomToast = () => {
    toast.custom((t) => (
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <h3 className="font-bold">Congratulations!</h3>
            <p className="text-sm opacity-90">You've unlocked a new achievement!</p>
          </div>
          <button
            onClick={() => toast.dismiss(t)}
            className="ml-auto text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
    ));
  };

  const showRichToast = () => {
    toast.custom((t) => (
      <div className="bg-white border rounded-lg shadow-lg p-4 max-w-md">
        <div className="flex gap-3">
          <img
            src="https://via.placeholder.com/50"
            alt="Avatar"
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1">
            <h4 className="font-semibold">New Message from John</h4>
            <p className="text-sm text-gray-600">Hey! Are you available for a quick call?</p>
            <div className="flex gap-2 mt-2">
              <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
                Reply
              </button>
              <button className="px-3 py-1 border rounded text-sm">
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={showCustomToast}
        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded"
      >
        Custom Gradient Toast
      </button>
      <button
        onClick={showRichToast}
        className="px-4 py-2 bg-indigo-500 text-white rounded"
      >
        Rich Content Toast
      </button>
    </div>
  );
}
```

### Toast Positions

```jsx live
function ToastPositionsExample() {
  const { toast } = useToast();

  const positions = [
    { label: 'Top Left', value: 'top-left' },
    { label: 'Top Center', value: 'top-center' },
    { label: 'Top Right', value: 'top-right' },
    { label: 'Bottom Left', value: 'bottom-left' },
    { label: 'Bottom Center', value: 'bottom-center' },
    { label: 'Bottom Right', value: 'bottom-right' }
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {positions.map((pos) => (
        <button
          key={pos.value}
          onClick={() => toast({
            title: pos.label,
            description: 'Toast notification',
            position: pos.value
          })}
          className="px-3 py-2 bg-gray-500 text-white rounded text-sm"
        >
          {pos.label}
        </button>
      ))}
    </div>
  );
}
```

### Multiple Toasts

```jsx live
function MultipleToastsExample() {
  const { toast } = useToast();
  let counter = 0;

  const showMultipleToasts = () => {
    const messages = [
      'First notification',
      'Second notification',
      'Third notification',
      'Fourth notification',
      'Fifth notification'
    ];

    messages.forEach((msg, index) => {
      setTimeout(() => {
        toast({
          title: `Notification ${index + 1}`,
          description: msg,
          variant: index % 2 === 0 ? 'success' : 'info'
        });
      }, index * 500);
    });
  };

  const showRapidToasts = () => {
    for (let i = 0; i < 5; i++) {
      toast({
        title: `Quick Toast ${++counter}`,
        description: 'Rapid fire notification!',
        duration: 2000
      });
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={showMultipleToasts}
        className="px-4 py-2 bg-purple-500 text-white rounded"
      >
        Staggered Toasts
      </button>
      <button
        onClick={showRapidToasts}
        className="px-4 py-2 bg-orange-500 text-white rounded"
      >
        Rapid Toasts
      </button>
    </div>
  );
}
```

### Form Validation Toast

```jsx live
function FormValidationToastExample() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Validation Error",
        description: "Please enter your email address.",
        variant: "error"
      });
      return;
    }

    if (!email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "warning"
      });
      return;
    }

    toast({
      title: "Success!",
      description: "Your email has been submitted.",
      variant: "success",
      action: (
        <button className="text-xs underline">View Details</button>
      )
    });
    
    setEmail('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="px-3 py-2 border rounded"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Submit
      </button>
    </form>
  );
}
```

## API Reference

### ToastProvider

The provider component that enables toast functionality.

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
        <td><code>position</code></td>
        <td><code>Position</code></td>
        <td><code>'bottom-right'</code></td>
        <td>Default position for toasts</td>
      </tr>
      <tr>
        <td><code>duration</code></td>
        <td><code>number</code></td>
        <td><code>4000</code></td>
        <td>Default duration in milliseconds</td>
      </tr>
      <tr>
        <td><code>maxToasts</code></td>
        <td><code>number</code></td>
        <td><code>3</code></td>
        <td>Maximum number of toasts to show</td>
      </tr>
      <tr>
        <td><code>expand</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Expand toasts by default</td>
      </tr>
      <tr>
        <td><code>richColors</code></td>
        <td><code>boolean</code></td>
        <td><code>true</code></td>
        <td>Use rich colors for variants</td>
      </tr>
      <tr>
        <td><code>closeButton</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Show close button on all toasts</td>
      </tr>
    </tbody>
  </table>
</div>

### useToast Hook

The hook that provides toast methods.

```tsx
const { toast } = useToast();

// Basic toast
toast('Hello World');

// Toast with options
toast({
  title: 'Title',
  description: 'Description',
  variant: 'success',
  duration: 5000,
  action: <button>Action</button>
});

// Promise toast
toast.promise(promise, {
  loading: 'Loading...',
  success: 'Success!',
  error: 'Error!'
});

// Custom toast
toast.custom((t) => <CustomComponent />);

// Dismiss toast
toast.dismiss(toastId);
toast.dismiss(); // Dismiss all
```

### Toast Options

<div className="props-table">
  <table>
    <thead>
      <tr>
        <th>Option</th>
        <th>Type</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>title</code></td>
        <td><code>string</code></td>
        <td>Toast title</td>
      </tr>
      <tr>
        <td><code>description</code></td>
        <td><code>string</code></td>
        <td>Toast description</td>
      </tr>
      <tr>
        <td><code>variant</code></td>
        <td><code>'default' | 'success' | 'error' | 'warning' | 'info'</code></td>
        <td>Toast variant</td>
      </tr>
      <tr>
        <td><code>duration</code></td>
        <td><code>number | Infinity</code></td>
        <td>Duration in ms</td>
      </tr>
      <tr>
        <td><code>position</code></td>
        <td><code>Position</code></td>
        <td>Toast position</td>
      </tr>
      <tr>
        <td><code>action</code></td>
        <td><code>ReactNode</code></td>
        <td>Action element</td>
      </tr>
      <tr>
        <td><code>dismissible</code></td>
        <td><code>boolean</code></td>
        <td>Can be dismissed</td>
      </tr>
      <tr>
        <td><code>onDismiss</code></td>
        <td><code>Function</code></td>
        <td>Dismiss callback</td>
      </tr>
      <tr>
        <td><code>id</code></td>
        <td><code>string</code></td>
        <td>Unique toast ID</td>
      </tr>
    </tbody>
  </table>
</div>

## Accessibility

The Toast component follows accessibility best practices:

- Uses ARIA live regions for screen reader announcements
- Polite announcements for info/success, assertive for errors
- Keyboard accessible dismiss buttons
- Focus management for action buttons
- Proper color contrast for all variants
- Respects `prefers-reduced-motion` for animations

## Best Practices

### Do's ✅

- Keep messages concise and actionable
- Use appropriate variants for context
- Provide undo actions when possible
- Group related notifications
- Test with screen readers
- Consider toast placement on mobile
- Use loading states for async operations

### Don'ts ❌

- Don't show too many toasts at once
- Don't use for critical errors requiring user action
- Don't auto-dismiss important messages too quickly
- Don't use for form validation inline errors
- Don't block user interaction
- Don't use for permanent messages

## Common Patterns

### Network Status

```tsx
// Online/Offline detection
window.addEventListener('online', () => {
  toast.success('Back online!');
});

window.addEventListener('offline', () => {
  toast.error('Connection lost');
});
```

### Copy to Clipboard

```tsx
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  } catch {
    toast.error('Failed to copy');
  }
};
```

### Auto-save Notification

```tsx
const autoSave = () => {
  const id = toast.loading('Saving...');
  
  saveData()
    .then(() => {
      toast.success('Auto-saved', { id });
    })
    .catch(() => {
      toast.error('Auto-save failed', { id });
    });
};
```

## Styling

```css
/* Custom toast styles */
.toast-container {
  --toast-background: white;
  --toast-text: #1a1a1a;
  --toast-border: #e5e7eb;
  --toast-success: #10b981;
  --toast-error: #ef4444;
  --toast-warning: #f59e0b;
  --toast-info: #3b82f6;
}
```

## Related Components

- [Alert](/docs/components/alert) - Static alert messages
- [Snackbar](/docs/components/snackbar) - Material Design notifications
- [Notification](/docs/components/notification) - Persistent notifications
- [Dialog](/docs/components/dialog) - Modal dialogs
- [Banner](/docs/components/banner) - Page-level announcements
