---
id: skeleton
title: Skeleton
sidebar_position: 37
---

import { Skeleton } from '@dainabase/ui';

# Skeleton

Use to show a placeholder while content is loading. Provides a better user experience than spinners for content-heavy interfaces.

## Preview

<div className="space-y-4">
  <Skeleton className="h-4 w-[250px]" />
  <Skeleton className="h-4 w-[200px]" />
  <Skeleton className="h-4 w-[300px]" />
</div>

## Features

- **Customizable Shapes**: Rectangle, circle, and custom shapes
- **Animated Shimmer**: Smooth loading animation effect
- **Responsive Sizing**: Adapts to container dimensions
- **Accessibility**: Proper ARIA labels for screen readers
- **Performance**: Lightweight CSS animations
- **Theme Integration**: Adapts to light/dark themes
- **Flexible Layouts**: Build complex loading states
- **Smooth Transitions**: Fade in/out when content loads
- **Low Contrast**: Subtle appearance that doesn't distract

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import { Skeleton } from '@dainabase/ui';

export default function SkeletonDemo() {
  return <Skeleton className="h-12 w-12 rounded-full" />;
}
```

## Examples

### Basic Skeleton

```tsx
<div className="space-y-2">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-[90%]" />
  <Skeleton className="h-4 w-[80%]" />
</div>
```

### Card Skeleton

```tsx
function CardSkeleton() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[150px]" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-[100px]" />
      </CardFooter>
    </Card>
  );
}
```

### Avatar Skeleton

```tsx
<div className="flex items-center space-x-4">
  <Skeleton className="h-12 w-12 rounded-full" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-[200px]" />
    <Skeleton className="h-4 w-[150px]" />
  </div>
</div>
```

### Table Skeleton

```tsx
function TableSkeleton() {
  return (
    <div className="w-full">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex space-x-4 p-4 border-b">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[80px]" />
        </div>
        
        {/* Rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex space-x-4 p-4 border-b">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[80px]" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Form Skeleton

```tsx
function FormSkeleton() {
  return (
    <div className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-20 w-full" />
      </div>
      
      <Skeleton className="h-10 w-[120px]" />
    </div>
  );
}
```

### Post/Article Skeleton

```tsx
function PostSkeleton() {
  return (
    <article className="space-y-4 p-6">
      {/* Title */}
      <Skeleton className="h-8 w-[70%]" />
      
      {/* Meta */}
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-[120px]" />
          <Skeleton className="h-3 w-[80px]" />
        </div>
      </div>
      
      {/* Image */}
      <Skeleton className="h-[200px] w-full rounded-lg" />
      
      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[85%]" />
        <Skeleton className="h-4 w-[95%]" />
        <Skeleton className="h-4 w-[70%]" />
      </div>
      
      {/* Actions */}
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-[80px]" />
        <Skeleton className="h-8 w-[80px]" />
        <Skeleton className="h-8 w-[80px]" />
      </div>
    </article>
  );
}
```

### Grid Skeleton

```tsx
function GridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-[125px] w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### List Skeleton

```tsx
function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3">
          <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[60%]" />
            <Skeleton className="h-3 w-[40%]" />
          </div>
          <Skeleton className="h-8 w-[60px]" />
        </div>
      ))}
    </div>
  );
}
```

### Navigation Skeleton

```tsx
function NavigationSkeleton() {
  return (
    <nav className="flex items-center justify-between p-4">
      <Skeleton className="h-8 w-[120px]" />
      <div className="flex space-x-4">
        <Skeleton className="h-4 w-[60px]" />
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-4 w-[70px]" />
        <Skeleton className="h-4 w-[90px]" />
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </nav>
  );
}
```

### Conditional Loading

```tsx
function ConditionalLoading() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData({
        title: "Hello World",
        description: "This is loaded content",
        image: "/placeholder.jpg"
      });
      setIsLoading(false);
    }, 2000);
  }, []);

  if (isLoading) {
    return (
      <Card className="w-[350px]">
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[250px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
        <CardDescription>{data.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <img 
          src={data.image} 
          alt={data.title}
          className="h-[200px] w-full object-cover rounded-lg"
        />
      </CardContent>
    </Card>
  );
}
```

## API Reference

### Skeleton

The skeleton loading placeholder component.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes for styling |
| `animation` | `'pulse' \| 'wave' \| 'none'` | `'pulse'` | Animation type |
| `duration` | `number` | `1.5` | Animation duration in seconds |
| `variant` | `'text' \| 'circular' \| 'rectangular'` | `'rectangular'` | Skeleton shape variant |
| `width` | `string \| number` | - | Width of the skeleton |
| `height` | `string \| number` | - | Height of the skeleton |

## Styling

The Skeleton component can be styled using Tailwind classes:

```tsx
// Different sizes
<Skeleton className="h-4 w-32" />  // Small text
<Skeleton className="h-12 w-12" /> // Square
<Skeleton className="h-20 w-full" /> // Large rectangle

// Different shapes
<Skeleton className="h-12 w-12 rounded-full" /> // Circle
<Skeleton className="h-16 w-16 rounded-lg" />   // Rounded square
<Skeleton className="h-4 w-full rounded" />      // Rounded text

// Custom colors (if needed)
<Skeleton className="bg-gray-200 dark:bg-gray-700" />
```

## Accessibility

The Skeleton component includes accessibility features:

- **ARIA Labels**: Uses `aria-busy="true"` during loading
- **Screen Readers**: Announces loading state
- **Reduced Motion**: Respects `prefers-reduced-motion`
- **Role**: Uses appropriate ARIA roles for loading indicators
- **Live Regions**: Can be wrapped in live regions for updates

## Best Practices

### Do's ✅

- Match skeleton layout to actual content structure
- Use appropriate shapes (circles for avatars, rectangles for text)
- Keep animations subtle and not distracting
- Provide consistent loading states across the app
- Use skeleton for content-heavy interfaces
- Consider progressive loading for large datasets

### Don'ts ❌

- Don't use skeleton for instant operations (< 300ms)
- Don't mix skeleton with spinners in the same view
- Don't make skeletons too different from actual content
- Don't forget to handle error states
- Don't use excessive animations
- Don't show skeleton indefinitely

## Performance Considerations

- Use CSS animations instead of JavaScript
- Lazy load skeleton components for better initial load
- Consider virtualization for long lists
- Optimize skeleton count (show fewer for mobile)
- Use `will-change: transform` for smoother animations

## Use Cases

- **Data Tables**: Loading state for table rows
- **Card Grids**: Product cards, user profiles
- **Lists**: Comments, posts, notifications
- **Forms**: Loading form fields from API
- **Dashboards**: Charts and statistics loading
- **Media**: Image and video placeholders
- **Navigation**: Menu items loading
- **Search Results**: Results loading state
- **Infinite Scroll**: New items loading

## Related Components

- [Progress](./progress) - For determinate loading states
- [Spinner](./spinner) - For indeterminate operations
- [Card](./card) - Often used with skeleton loading
- [Table](./table) - Table skeleton patterns
- [Avatar](./avatar) - Avatar skeleton loading