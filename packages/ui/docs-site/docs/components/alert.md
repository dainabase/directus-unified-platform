---
id: alert
title: Alert
sidebar_position: 9
---

import { Alert, AlertDescription, AlertTitle } from '@dainabase/ui';

# Alert

Displays a callout for user attention with contextual feedback.

<div className="component-preview">
  <Alert>
    <AlertTitle>Heads up!</AlertTitle>
    <AlertDescription>
      You can add components to your app using the Dainabase UI library.
    </AlertDescription>
  </Alert>
</div>

## Features

- **Accessible**: WCAG 2.1 AA compliant with proper ARIA attributes
- **Responsive**: Adapts to all screen sizes
- **Themeable**: Supports dark mode and custom themes
- **TypeScript**: Full type safety and IntelliSense support
- **Variants**: Multiple styles for different contexts (info, success, warning, error)
- **Icons**: Built-in icon support with customization options

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import { Alert, AlertDescription, AlertTitle } from '@dainabase/ui';

export function AlertDemo() {
  return (
    <Alert>
      <AlertTitle>Alert Title</AlertTitle>
      <AlertDescription>
        This is an alert description with important information.
      </AlertDescription>
    </Alert>
  );
}
```

## Examples

### Basic Alert

```jsx live
function BasicAlert() {
  return (
    <Alert>
      <AlertDescription>
        This is a basic alert message.
      </AlertDescription>
    </Alert>
  );
}
```

### Alert with Title

```jsx live
function AlertWithTitle() {
  return (
    <Alert>
      <AlertTitle>Important Notice</AlertTitle>
      <AlertDescription>
        Please review the following information carefully.
      </AlertDescription>
    </Alert>
  );
}
```

### Alert Variants

```jsx live
function AlertVariants() {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertTitle>Default</AlertTitle>
        <AlertDescription>This is a default alert.</AlertDescription>
      </Alert>
      
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong!</AlertDescription>
      </Alert>
      
      <Alert variant="success">
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>Operation completed successfully!</AlertDescription>
      </Alert>
      
      <Alert variant="warning">
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Please proceed with caution.</AlertDescription>
      </Alert>
    </div>
  );
}
```

### Alert with Icon

```jsx live
function AlertWithIcon() {
  return (
    <Alert>
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        This alert includes an icon for better visual hierarchy.
      </AlertDescription>
    </Alert>
  );
}
```

### Dismissible Alert

```jsx live
function DismissibleAlert() {
  const [visible, setVisible] = React.useState(true);
  
  if (!visible) {
    return (
      <button onClick={() => setVisible(true)}>
        Show Alert
      </button>
    );
  }
  
  return (
    <Alert>
      <AlertTitle>Dismissible Alert</AlertTitle>
      <AlertDescription>
        This alert can be dismissed by the user.
      </AlertDescription>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-2 top-2"
      >
        ×
      </button>
    </Alert>
  );
}
```

## API Reference

### Alert Props

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
        <td><code>'default' | 'destructive' | 'success' | 'warning'</code></td>
        <td><code>'default'</code></td>
        <td>The visual style variant of the alert</td>
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
        <td>Content to display in the alert</td>
      </tr>
    </tbody>
  </table>
</div>

### AlertTitle Props

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
        <td><code>className</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>Additional CSS classes</td>
      </tr>
      <tr>
        <td><code>children</code></td>
        <td><code>ReactNode</code></td>
        <td><code>undefined</code></td>
        <td>Title content</td>
      </tr>
    </tbody>
  </table>
</div>

### AlertDescription Props

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
        <td><code>className</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>Additional CSS classes</td>
      </tr>
      <tr>
        <td><code>children</code></td>
        <td><code>ReactNode</code></td>
        <td><code>undefined</code></td>
        <td>Description content</td>
      </tr>
    </tbody>
  </table>
</div>

## Accessibility

The Alert component follows WAI-ARIA guidelines and includes:
- Proper `role="alert"` for important messages
- `aria-live="polite"` for non-critical updates
- `aria-atomic="true"` to announce the entire alert
- Semantic HTML structure for screen readers
- Sufficient color contrast ratios
- Focus management for dismissible alerts

## Best Practices

### Do's ✅

- Use appropriate variants to convey the message importance
- Keep alert messages concise and actionable
- Provide clear titles for complex messages
- Include relevant actions when needed
- Test with screen readers
- Ensure sufficient color contrast

### Don'ts ❌

- Don't use alerts for decorative purposes
- Don't auto-dismiss critical error messages
- Don't rely solely on color to convey meaning
- Don't overuse alerts on a single page
- Don't use alerts for marketing messages

## Use Cases

- **Form validation**: Display validation errors or success messages
- **System status**: Inform users about system updates or maintenance
- **User actions**: Confirm successful operations or warn about consequences
- **Information notices**: Highlight important information or tips
- **Error handling**: Display error messages with recovery options

## Related Components

- [Toast](/docs/components/toast) - For temporary notifications
- [Dialog](/docs/components/dialog) - For modal alerts requiring user action
- [Badge](/docs/components/badge) - For status indicators
- [Card](/docs/components/card) - For grouping related content
