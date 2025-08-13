---
id: spinner
title: Spinner
sidebar_position: 33
---

import { Spinner } from '@dainabase/ui';

# Spinner

A versatile loading indicator component with multiple styles, sizes, and customization options for showing loading states.

## Preview

```jsx live
function SpinnerDemo() {
  return (
    <div className="flex items-center gap-4">
      <Spinner />
      <Spinner size="sm" />
      <Spinner size="lg" />
      <Spinner variant="dots" />
      <Spinner variant="pulse" />
      <Spinner className="text-primary" />
    </div>
  );
}
```

## Features

- 🎨 **Multiple variants** - Circle, dots, pulse, bars, and more
- 📏 **Flexible sizing** - Predefined sizes and custom dimensions
- 🎭 **Smooth animations** - Optimized CSS animations
- 🌈 **Custom colors** - Easy color customization via CSS
- ♿ **Accessible** - ARIA labels and live regions
- 🚀 **Lightweight** - Pure CSS animations, no JS required
- 📱 **Responsive** - Scales properly on all devices
- 🎯 **Overlay support** - Built-in fullscreen loading states
- ⚡ **Performance optimized** - GPU-accelerated animations
- 🎪 **Custom content** - Support for loading text and icons

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```jsx
import { Spinner } from '@dainabase/ui';

function MyComponent() {
  const [loading, setLoading] = useState(true);
  
  if (loading) {
    return <Spinner />;
  }
  
  return <div>Content loaded!</div>;
}
```

## Examples

### Basic Spinner

```jsx
// Default spinner
<Spinner />

// With label
<Spinner label="Loading..." />

// With custom size
<Spinner size="lg" />
```

### Different Sizes

```jsx
<div className="flex items-center gap-4">
  <Spinner size="xs" />
  <Spinner size="sm" />
  <Spinner size="md" />
  <Spinner size="lg" />
  <Spinner size="xl" />
  
  {/* Custom size */}
  <Spinner className="h-20 w-20" />
</div>
```

### Spinner Variants

```jsx
<div className="grid grid-cols-3 gap-4">
  {/* Circle spinner (default) */}
  <div className="text-center">
    <Spinner variant="circle" />
    <p className="mt-2 text-sm">Circle</p>
  </div>
  
  {/* Dots spinner */}
  <div className="text-center">
    <Spinner variant="dots" />
    <p className="mt-2 text-sm">Dots</p>
  </div>
  
  {/* Pulse spinner */}
  <div className="text-center">
    <Spinner variant="pulse" />
    <p className="mt-2 text-sm">Pulse</p>
  </div>
  
  {/* Bars spinner */}
  <div className="text-center">
    <Spinner variant="bars" />
    <p className="mt-2 text-sm">Bars</p>
  </div>
  
  {/* Ring spinner */}
  <div className="text-center">
    <Spinner variant="ring" />
    <p className="mt-2 text-sm">Ring</p>
  </div>
  
  {/* Square spinner */}
  <div className="text-center">
    <Spinner variant="square" />
    <p className="mt-2 text-sm">Square</p>
  </div>
</div>
```

### Custom Colors

```jsx
<div className="flex items-center gap-4">
  <Spinner className="text-blue-500" />
  <Spinner className="text-green-500" />
  <Spinner className="text-red-500" />
  <Spinner className="text-purple-500" />
  
  {/* Gradient spinner */}
  <Spinner className="text-gradient-to-r from-blue-500 to-purple-500" />
</div>
```

### With Loading Text

```jsx
// Below spinner
<div className="flex flex-col items-center gap-2">
  <Spinner />
  <p className="text-sm text-muted-foreground">Loading content...</p>
</div>

// Inline with spinner
<div className="flex items-center gap-2">
  <Spinner size="sm" />
  <span className="text-sm">Processing...</span>
</div>

// With percentage
function LoadingWithProgress() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => prev >= 100 ? 100 : prev + 10);
    }, 500);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="flex flex-col items-center gap-2">
      <Spinner />
      <p className="text-sm text-muted-foreground">{progress}%</p>
    </div>
  );
}
```

### Fullscreen Loading

```jsx
function FullscreenSpinner({ loading, children }) {
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-2">
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }
  
  return children;
}
```

### Button with Spinner

```jsx
function LoadingButton({ loading, children, ...props }) {
  return (
    <Button disabled={loading} {...props}>
      {loading && <Spinner size="sm" className="mr-2" />}
      {children}
    </Button>
  );
}

// Usage
<LoadingButton loading={isSubmitting}>
  Save Changes
</LoadingButton>
```

### Card Loading State

```jsx
function LoadingCard() {
  return (
    <Card className="relative">
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
        <Spinner />
      </div>
      <CardContent className="p-6">
        <p className="text-muted-foreground">Content will appear here</p>
      </CardContent>
    </Card>
  );
}
```

### Table Loading

```jsx
function TableWithLoading({ loading, data }) {
  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
          <Spinner />
        </div>
      )}
      <Table className={loading ? 'opacity-50' : ''}>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell>{item.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### Inline Loading

```jsx
function InlineLoading() {
  const [loading, setLoading] = useState(false);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span>Auto-save</span>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner size="xs" />
            Saving...
          </div>
        ) : (
          <span className="text-sm text-green-500">Saved</span>
        )}
      </div>
    </div>
  );
}
```

### Skeleton vs Spinner

```jsx
function ContentLoader({ useSkeletons }) {
  if (useSkeletons) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }
  
  return (
    <div className="flex justify-center py-8">
      <Spinner />
    </div>
  );
}
```

### Custom Animation Speed

```jsx
// Slow animation
<Spinner className="animate-spin-slow" />

// Fast animation
<Spinner className="animate-spin-fast" />

// Custom CSS
<style>
  .animate-spin-slow {
    animation: spin 2s linear infinite;
  }
  .animate-spin-fast {
    animation: spin 0.5s linear infinite;
  }
</style>
```

## API Reference

### Spinner Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"circle" \| "dots" \| "pulse" \| "bars" \| "ring" \| "square"` | `"circle"` | Visual style variant |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl"` | `"md"` | Predefined size |
| `className` | `string` | - | Additional CSS classes |
| `label` | `string` | - | Accessibility label |
| `color` | `string` | `"currentColor"` | Spinner color |
| `thickness` | `number` | `2` | Stroke thickness (circle/ring) |
| `speed` | `"slow" \| "normal" \| "fast"` | `"normal"` | Animation speed |
| `center` | `boolean` | `false` | Center in parent container |
| `overlay` | `boolean` | `false` | Show with overlay background |
| `fullscreen` | `boolean` | `false` | Fullscreen loading state |

### Size Values

| Size | Dimensions | Use Case |
|------|------------|----------|
| `xs` | 12x12px | Inline text, small buttons |
| `sm` | 16x16px | Buttons, form inputs |
| `md` | 24x24px | Cards, default loading |
| `lg` | 32x32px | Page sections |
| `xl` | 48x48px | Full page loading |

### Variant Styles

| Variant | Description | Best For |
|---------|-------------|----------|
| `circle` | Circular spinner with gap | General purpose |
| `dots` | Three bouncing dots | Inline loading |
| `pulse` | Pulsing circle | Subtle loading |
| `bars` | Vertical bars | Data processing |
| `ring` | Double ring spinner | Modern interfaces |
| `square` | Rotating square | Alternative style |

## Accessibility

The Spinner component follows accessibility best practices:

- ARIA `role="status"` for screen readers
- ARIA `aria-label` for description
- ARIA live regions for dynamic content
- Respects `prefers-reduced-motion`
- Proper color contrast ratios
- Keyboard focus indicators when interactive
- Screen reader announcements for state changes

## Best Practices

### ✅ Do's

- Show spinners for operations longer than 1 second
- Provide context with loading text when appropriate
- Use appropriate sizes for different contexts
- Position spinners where users expect feedback
- Consider using skeletons for content loading
- Test with screen readers
- Provide alternative text for accessibility
- Use consistent spinner styles across your app
- Consider the loading state UX holistically
- Implement proper error states after loading

### ❌ Don'ts

- Don't show multiple spinners simultaneously
- Avoid spinner overuse for quick operations
- Don't block all interactions unnecessarily
- Avoid poor contrast with backgrounds
- Don't forget to handle loading errors
- Avoid infinite loading states
- Don't use spinners for determinate progress
- Avoid jarring animations
- Don't place spinners in unexpected locations
- Avoid mixing different spinner styles

## Performance Tips

```jsx
// Lazy load spinner for code splitting
const Spinner = lazy(() => import('@dainabase/ui/spinner'));

// Debounce loading state to avoid flicker
function DebouncedSpinner({ loading, delay = 200 }) {
  const [showSpinner, setShowSpinner] = useState(false);
  
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setShowSpinner(true), delay);
      return () => clearTimeout(timer);
    } else {
      setShowSpinner(false);
    }
  }, [loading, delay]);
  
  return showSpinner ? <Spinner /> : null;
}

// Use CSS-only animations
<Spinner /> // Uses pure CSS, no JavaScript animations
```

## Use Cases

- **Page loading** - Initial application load
- **Data fetching** - API calls and data loading
- **Form submission** - Processing form data
- **File uploads** - Upload progress indication
- **Background tasks** - Long-running operations
- **Content refresh** - Updating dynamic content
- **Search operations** - Searching and filtering
- **Authentication** - Login/logout processes
- **Lazy loading** - Loading content on demand
- **Infinite scroll** - Loading more content

## Related Components

- [Skeleton](/docs/components/skeleton) - For content placeholder loading
- [Progress](/docs/components/progress) - For determinate progress
- [Button](/docs/components/button) - Buttons with loading states
- [Alert](/docs/components/alert) - For loading messages
- [Toast](/docs/components/toast) - For loading notifications
