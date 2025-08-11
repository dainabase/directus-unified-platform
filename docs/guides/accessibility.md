# Accessibility Guide

## Overview

The Directus Unified Platform UI library is built with accessibility as a core principle. This guide covers accessibility features, best practices, and implementation patterns to ensure your applications are usable by everyone.

## WCAG Compliance

Our components are designed to meet WCAG 2.1 Level AA standards:

- **Perceivable**: Information and UI components are presentable in ways users can perceive
- **Operable**: UI components and navigation are operable
- **Understandable**: Information and UI operation are understandable
- **Robust**: Content is robust enough for various assistive technologies

## Built-in Accessibility Features

### Semantic HTML

All components use proper semantic HTML elements:

```tsx
// ✅ Good - Semantic HTML
<Button>Click me</Button>  // Renders <button>
<NavigationMenu>            // Renders <nav>
<Form>                      // Renders <form>
<Table>                     // Renders <table>

// ❌ Avoid - Non-semantic
<div onClick={handleClick}>Click me</div>
```

### ARIA Attributes

Components include appropriate ARIA attributes automatically:

```tsx
// Automatic ARIA attributes
<Dialog open={isOpen}>
  {/* Automatically includes:
    - role="dialog"
    - aria-modal="true"
    - aria-labelledby
    - aria-describedby
  */}
</Dialog>

<Tabs value={activeTab}>
  {/* Automatically includes:
    - role="tablist"
    - aria-orientation
    - aria-selected
  */}
</Tabs>
```

### Focus Management

```tsx
import { Dialog, Input } from '@dainabase/directus-ui';

// Focus trap in modals
const Modal = () => {
  const inputRef = useRef();
  
  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
      initialFocus={inputRef} // Set initial focus
    >
      <Dialog.Content>
        <Input ref={inputRef} placeholder="Auto-focused" />
      </Dialog.Content>
    </Dialog>
  );
};
```

## Keyboard Navigation

### Standard Keyboard Shortcuts

All interactive components support standard keyboard navigation:

| Component | Key | Action |
|-----------|-----|--------|
| Button | `Enter` / `Space` | Activate button |
| Dialog | `Escape` | Close dialog |
| Dropdown | `↓` / `↑` | Navigate options |
| Tabs | `←` / `→` | Navigate tabs |
| Form | `Tab` | Navigate fields |
| DataGrid | `↓` / `↑` / `←` / `→` | Navigate cells |

### Implementation Example

```tsx
import { Select } from '@dainabase/directus-ui';

// Keyboard navigation is built-in
<Select
  options={options}
  onKeyDown={(e) => {
    // Additional custom keyboard handling
    if (e.key === 'Enter' && e.ctrlKey) {
      // Custom action
    }
  }}
/>
```

### Skip Links

```tsx
const SkipToContent = () => (
  <a 
    href="#main-content" 
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
  >
    Skip to main content
  </a>
);

// Usage
<>
  <SkipToContent />
  <NavigationMenu />
  <main id="main-content">
    {/* Content */}
  </main>
</>
```

## Screen Reader Support

### Announcing Dynamic Content

```tsx
import { Toast, useToast } from '@dainabase/directus-ui';

const Notifications = () => {
  const { showToast } = useToast();
  
  const notify = (message) => {
    showToast({
      title: message,
      ariaLive: 'polite', // or 'assertive' for urgent
      role: 'status', // or 'alert' for errors
    });
  };
  
  return (
    <Button onClick={() => notify('Action completed')}>
      Perform Action
    </Button>
  );
};
```

### Live Regions

```tsx
// Announce loading states
const LoadingData = () => {
  const [loading, setLoading] = useState(true);
  
  return (
    <>
      <div aria-live="polite" aria-busy={loading}>
        {loading ? (
          <span className="sr-only">Loading data...</span>
        ) : (
          <span className="sr-only">Data loaded</span>
        )}
      </div>
      
      {loading ? <Skeleton /> : <DataGrid data={data} />}
    </>
  );
};
```

### Descriptive Labels

```tsx
// Provide context for screen readers
<Button
  aria-label="Delete item: Project Alpha"
  aria-describedby="delete-warning"
>
  <TrashIcon aria-hidden="true" />
</Button>
<span id="delete-warning" className="sr-only">
  This action cannot be undone
</span>
```

## Color and Contrast

### Color Contrast Requirements

```tsx
// Theme with WCAG AA compliant colors
const accessibleTheme = {
  // Normal text: 4.5:1 contrast ratio
  text: '#212121',        // on white: 16.1:1 ✅
  background: '#ffffff',
  
  // Large text: 3:1 contrast ratio
  heading: '#424242',     // on white: 11.5:1 ✅
  
  // Interactive elements: 3:1 contrast ratio
  primary: '#0066cc',     // on white: 5.5:1 ✅
  
  // Disabled states
  disabled: '#9e9e9e',    // on white: 2.8:1 (exempt)
};
```

### Color Independence

```tsx
// Don't rely on color alone
// ❌ Bad - Only color indicates status
<Badge color="red">Error</Badge>

// ✅ Good - Icon and text provide meaning
<Badge color="red">
  <ErrorIcon aria-hidden="true" />
  <span>Error: Invalid input</span>
</Badge>
```

### High Contrast Mode

```tsx
import { useMediaQuery } from '@dainabase/directus-ui/hooks';

const HighContrastAware = () => {
  const prefersHighContrast = useMediaQuery(
    '(prefers-contrast: high)'
  );
  
  return (
    <Card
      className={prefersHighContrast ? 'high-contrast' : ''}
      style={{
        borderWidth: prefersHighContrast ? '2px' : '1px',
      }}
    >
      {/* Content */}
    </Card>
  );
};
```

## Form Accessibility

### Label Association

```tsx
import { Form, Input, Select, Checkbox } from '@dainabase/directus-ui';

// Labels are automatically associated
<Form>
  <Input
    id="email"
    label="Email Address"
    type="email"
    required
    aria-describedby="email-help"
  />
  <span id="email-help" className="text-sm text-muted">
    We'll never share your email
  </span>
  
  <Select
    label="Country"
    required
    aria-required="true"
    options={countries}
  />
  
  <Checkbox
    id="terms"
    label="I agree to the terms and conditions"
  />
</Form>
```

### Error Messages

```tsx
const AccessibleForm = () => {
  const [errors, setErrors] = useState({});
  
  return (
    <Form>
      <Input
        label="Username"
        error={errors.username}
        aria-invalid={!!errors.username}
        aria-describedby={
          errors.username ? 'username-error' : 'username-help'
        }
      />
      {errors.username && (
        <span 
          id="username-error" 
          role="alert"
          className="text-red-600"
        >
          {errors.username}
        </span>
      )}
      <span id="username-help" className="text-sm text-muted">
        Choose a unique username
      </span>
    </Form>
  );
};
```

### Fieldset and Legend

```tsx
<Form>
  <fieldset>
    <legend className="text-lg font-semibold">Delivery Address</legend>
    <Input label="Street Address" name="street" />
    <Input label="City" name="city" />
    <Input label="Postal Code" name="postal" />
  </fieldset>
  
  <fieldset>
    <legend className="text-lg font-semibold">Payment Method</legend>
    <RadioGroup
      name="payment"
      options={[
        { value: 'card', label: 'Credit Card' },
        { value: 'paypal', label: 'PayPal' },
        { value: 'bank', label: 'Bank Transfer' },
      ]}
    />
  </fieldset>
</Form>
```

## Navigation Accessibility

### Landmark Regions

```tsx
const Layout = () => (
  <>
    <header role="banner">
      <NavigationMenu aria-label="Main navigation">
        {/* Navigation items */}
      </NavigationMenu>
    </header>
    
    <nav aria-label="Breadcrumb">
      <Breadcrumb>{/* Breadcrumb items */}</Breadcrumb>
    </nav>
    
    <main role="main" aria-labelledby="page-title">
      <h1 id="page-title">Page Title</h1>
      {/* Main content */}
    </main>
    
    <aside aria-label="Related links">
      {/* Sidebar content */}
    </aside>
    
    <footer role="contentinfo">
      {/* Footer content */}
    </footer>
  </>
);
```

### Navigation Menus

```tsx
<NavigationMenu aria-label="Main menu">
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Link 
        href="/dashboard"
        aria-current={pathname === '/dashboard' ? 'page' : undefined}
      >
        Dashboard
      </NavigationMenu.Link>
    </NavigationMenu.Item>
    
    <NavigationMenu.Item>
      <NavigationMenu.Trigger aria-expanded={isOpen}>
        Products
        <ChevronDown aria-hidden="true" />
      </NavigationMenu.Trigger>
      <NavigationMenu.Content>
        {/* Submenu items */}
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>
</NavigationMenu>
```

## Images and Media

### Alt Text

```tsx
import { Image, Avatar } from '@dainabase/directus-ui';

// Informative images
<Image
  src="/chart.png"
  alt="Sales increased by 25% in Q3 2024 compared to Q2"
/>

// Decorative images
<Image
  src="/decoration.png"
  alt="" // Empty alt for decorative images
  role="presentation"
/>

// User avatars
<Avatar
  src="/user.jpg"
  alt="John Doe's profile picture"
  fallback="JD"
/>
```

### Video Accessibility

```tsx
const AccessibleVideo = () => (
  <video
    controls
    aria-label="Product demonstration"
    aria-describedby="video-description"
  >
    <source src="demo.mp4" type="video/mp4" />
    <track
      kind="captions"
      src="captions-en.vtt"
      srcLang="en"
      label="English captions"
      default
    />
    <track
      kind="descriptions"
      src="descriptions-en.vtt"
      srcLang="en"
      label="English descriptions"
    />
    Your browser doesn't support video.
  </video>
);
```

## Data Tables

### Table Structure

```tsx
import { Table } from '@dainabase/directus-ui';

const AccessibleTable = () => (
  <Table
    caption="Q3 2024 Sales Report"
    summary="Sales data broken down by region and product category"
  >
    <Table.Header>
      <Table.Row>
        <Table.Head scope="col">Region</Table.Head>
        <Table.Head scope="col">Product</Table.Head>
        <Table.Head scope="col" className="text-right">
          Sales ($)
        </Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      <Table.Row>
        <Table.Cell scope="row">North America</Table.Cell>
        <Table.Cell>Electronics</Table.Cell>
        <Table.Cell className="text-right">45,000</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
);
```

### Sortable Columns

```tsx
<DataGrid
  columns={[
    {
      field: 'name',
      header: 'Name',
      sortable: true,
      ariaLabel: (sorted) => 
        sorted === 'asc' 
          ? 'Name, sorted ascending. Click to sort descending'
          : sorted === 'desc'
          ? 'Name, sorted descending. Click to remove sorting'
          : 'Name. Click to sort ascending',
    },
  ]}
/>
```

## Testing for Accessibility

### Automated Testing

```javascript
// jest-axe for unit tests
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('Button is accessible', async () => {
  const { container } = render(
    <Button>Click me</Button>
  );
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing Checklist

- [ ] **Keyboard Navigation**: Tab through entire page
- [ ] **Screen Reader**: Test with NVDA/JAWS (Windows) or VoiceOver (Mac)
- [ ] **Color Contrast**: Use browser DevTools or contrast checker
- [ ] **Zoom**: Test at 200% zoom level
- [ ] **Motion**: Test with reduced motion preference
- [ ] **Focus Indicators**: Visible focus for all interactive elements

### Browser Extensions

```tsx
// Test with these tools:
// - axe DevTools
// - WAVE
// - Lighthouse
// - Accessibility Insights
```

## Responsive and Mobile Accessibility

### Touch Targets

```tsx
// Minimum 44x44px touch targets for mobile
const MobileButton = () => (
  <Button
    className="min-h-[44px] min-w-[44px] p-3"
    aria-label="Menu"
  >
    <MenuIcon className="h-6 w-6" />
  </Button>
);
```

### Viewport Meta Tag

```html
<!-- Allow zooming for accessibility -->
<meta 
  name="viewport" 
  content="width=device-width, initial-scale=1, maximum-scale=5"
/>
```

## Motion and Animation

### Respecting Reduced Motion

```tsx
const AnimatedComponent = () => {
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)'
  );
  
  return (
    <div
      className={
        prefersReducedMotion
          ? 'transition-none'
          : 'transition-all duration-300'
      }
    >
      {/* Content */}
    </div>
  );
};
```

## Best Practices Summary

1. **Always provide text alternatives** for non-text content
2. **Ensure keyboard accessibility** for all interactive elements
3. **Use semantic HTML** and ARIA appropriately
4. **Maintain color contrast** ratios (4.5:1 for normal text)
5. **Provide clear focus indicators**
6. **Test with assistive technologies**
7. **Support user preferences** (reduced motion, high contrast)
8. **Write descriptive link text** (avoid "click here")
9. **Structure content with headings** in logical order
10. **Provide error identification** and suggestions

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

## Next Steps

- Review [Component Documentation](../components/) for component-specific a11y features
- Check [Patterns Guide](./patterns.md) for accessible implementation patterns
- Explore [Testing Guide](../guides/testing.md) for accessibility testing
