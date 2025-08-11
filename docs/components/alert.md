# Alert

Display important messages and notifications to users with various severity levels and styling options.

## Import

```tsx
import { Alert, AlertDescription, AlertTitle } from '@dainabase/ui/alert';
```

## Basic Usage

```tsx
import { Alert, AlertDescription, AlertTitle } from '@dainabase/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function AlertExample() {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the cli.
      </AlertDescription>
    </Alert>
  );
}
```

## Props

### Alert
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| variant | `"default" \| "destructive" \| "success" \| "warning" \| "info"` | `"default"` | No | Alert style variant |
| className | `string` | - | No | Additional CSS classes |
| children | `ReactNode` | - | Yes | Alert content |

### AlertTitle
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| className | `string` | - | No | Additional CSS classes |
| children | `ReactNode` | - | Yes | Title text |

### AlertDescription
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| className | `string` | - | No | Additional CSS classes |
| children | `ReactNode` | - | Yes | Description text |

## Examples

### Alert Variants

```tsx
import { Alert, AlertDescription, AlertTitle } from '@dainabase/ui/alert';
import { Terminal, AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

function AlertVariants() {
  return (
    <div className="space-y-4">
      {/* Default Alert */}
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Default Alert</AlertTitle>
        <AlertDescription>
          This is a default alert with neutral styling.
        </AlertDescription>
      </Alert>

      {/* Success Alert */}
      <Alert variant="success">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Success!</AlertTitle>
        <AlertDescription>
          Your action was completed successfully.
        </AlertDescription>
      </Alert>

      {/* Warning Alert */}
      <Alert variant="warning">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Please review this important information.
        </AlertDescription>
      </Alert>

      {/* Error/Destructive Alert */}
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was a problem with your request.
        </AlertDescription>
      </Alert>

      {/* Info Alert */}
      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          Here's some helpful information for you.
        </AlertDescription>
      </Alert>
    </div>
  );
}
```

### Simple Alert (No Title)

```tsx
<Alert>
  <AlertDescription>
    This is a simple alert message without a title.
  </AlertDescription>
</Alert>
```

### Alert with Actions

```tsx
import { Button } from '@dainabase/ui/button';

function AlertWithActions() {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <div className="flex-1">
        <AlertTitle>Update Available</AlertTitle>
        <AlertDescription>
          A new version of the application is available.
        </AlertDescription>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline">Later</Button>
        <Button size="sm">Update Now</Button>
      </div>
    </Alert>
  );
}
```

### Dismissible Alert

```tsx
import { useState } from 'react';
import { X } from 'lucide-react';

function DismissibleAlert() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <Alert>
      <Info className="h-4 w-4" />
      <div className="flex-1">
        <AlertTitle>Pro Tip</AlertTitle>
        <AlertDescription>
          You can use keyboard shortcuts to navigate faster.
        </AlertDescription>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"
      >
        <X className="h-4 w-4" />
      </button>
    </Alert>
  );
}
```

### Alert with List

```tsx
<Alert>
  <AlertCircle className="h-4 w-4" />
  <div>
    <AlertTitle>Form Validation Errors</AlertTitle>
    <AlertDescription>
      <ul className="list-disc list-inside mt-2">
        <li>Email address is required</li>
        <li>Password must be at least 8 characters</li>
        <li>Please accept the terms and conditions</li>
      </ul>
    </AlertDescription>
  </div>
</Alert>
```

### Alert with Code

```tsx
<Alert>
  <Terminal className="h-4 w-4" />
  <div>
    <AlertTitle>Installation</AlertTitle>
    <AlertDescription>
      Run the following command to install:
      <pre className="mt-2 rounded bg-gray-100 p-2">
        <code>npm install @dainabase/ui</code>
      </pre>
    </AlertDescription>
  </div>
</Alert>
```

### Alert with Progress

```tsx
import { Progress } from '@dainabase/ui/progress';

function AlertWithProgress() {
  const [progress, setProgress] = useState(33);

  return (
    <Alert>
      <div className="w-full">
        <AlertTitle>Uploading Files</AlertTitle>
        <AlertDescription className="mt-2">
          Uploading 3 of 9 files...
        </AlertDescription>
        <Progress value={progress} className="mt-3" />
      </div>
    </Alert>
  );
}
```

### Inline Alert

```tsx
<Alert className="border-0 bg-blue-50 text-blue-900">
  <Info className="h-4 w-4 text-blue-600" />
  <AlertDescription className="text-blue-800">
    This is an inline informational message with custom colors.
  </AlertDescription>
</Alert>
```

### Alert Stack

```tsx
function AlertStack() {
  const alerts = [
    { id: 1, type: 'success', message: 'Settings saved successfully!' },
    { id: 2, type: 'warning', message: 'Your session will expire in 5 minutes' },
    { id: 3, type: 'info', message: '3 new notifications' }
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {alerts.map(alert => (
        <Alert key={alert.id} variant={alert.type}>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
```

## Styling

### Custom Colors

```tsx
<Alert className="border-purple-200 bg-purple-50 text-purple-900">
  <AlertTitle className="text-purple-900">Custom Styled Alert</AlertTitle>
  <AlertDescription className="text-purple-700">
    This alert uses custom colors via Tailwind classes.
  </AlertDescription>
</Alert>
```

### Borderless Alert

```tsx
<Alert className="border-0 shadow-md">
  <AlertTitle>Borderless Alert</AlertTitle>
  <AlertDescription>
    This alert has no border but includes a shadow.
  </AlertDescription>
</Alert>
```

### Full Width Alert

```tsx
<Alert className="rounded-none border-x-0">
  <AlertTitle>System Maintenance</AlertTitle>
  <AlertDescription>
    The system will be under maintenance from 2:00 AM to 4:00 AM.
  </AlertDescription>
</Alert>
```

## Animation

### Fade In Alert

```tsx
function FadeInAlert() {
  const [show, setShow] = useState(false);

  return (
    <>
      <Button onClick={() => setShow(true)}>Show Alert</Button>
      {show && (
        <Alert className="animate-fade-in">
          <AlertTitle>Animated Alert</AlertTitle>
          <AlertDescription>
            This alert fades in when displayed.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
```

### Auto-Dismiss Alert

```tsx
function AutoDismissAlert() {
  const [alerts, setAlerts] = useState([]);

  const addAlert = () => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, message: 'Auto-dismiss alert!' }]);
    
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 5000);
  };

  return (
    <>
      <Button onClick={addAlert}>Add Alert</Button>
      <div className="space-y-2 mt-4">
        {alerts.map(alert => (
          <Alert key={alert.id} className="animate-slide-in">
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        ))}
      </div>
    </>
  );
}
```

## Accessibility

- **Semantic HTML**: Uses proper ARIA roles (`alert`, `status`)
- **Screen Reader Support**: Content is announced when alert appears
- **Color Contrast**: Meets WCAG guidelines for text contrast
- **Icon Support**: Decorative icons marked with `aria-hidden`
- **Keyboard Navigation**: Dismissible alerts are keyboard accessible
- **Live Regions**: Dynamic alerts use ARIA live regions

## Best Practices

1. **Choose appropriate variants**: Match severity to message importance
2. **Keep messages concise**: Get to the point quickly
3. **Use icons consistently**: Help users recognize alert types
4. **Provide actions when needed**: Let users resolve the alert
5. **Don't overuse**: Reserve for truly important messages
6. **Consider placement**: Top for global, inline for contextual
7. **Make dismissible when appropriate**: But not for critical errors

## Common Use Cases

- **Form validation**: Display validation errors
- **Success messages**: Confirm successful actions
- **System notifications**: Maintenance, updates, status
- **Warnings**: Important information that needs attention
- **Error messages**: Failed operations or problems
- **Information**: Tips, hints, or helpful information
- **Progress updates**: Long-running operations

## Related Components

- [Toast](./toast.md)
- [Dialog](./dialog.md)
- [Banner](./banner.md)
- [Notification](./notification.md)
- [Badge](./badge.md)

## Testing

```tsx
import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from '@dainabase/ui/alert';

describe('Alert', () => {
  it('renders alert with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Test Title</AlertTitle>
        <AlertDescription>Test Description</AlertDescription>
      </Alert>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('applies variant styles', () => {
    const { container } = render(
      <Alert variant="destructive">
        <AlertDescription>Error message</AlertDescription>
      </Alert>
    );
    
    expect(container.firstChild).toHaveClass('destructive');
  });
});
```

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>
