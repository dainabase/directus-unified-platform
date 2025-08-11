# Icon

Flexible icon component wrapping Lucide React icons

## Import

```tsx
import { Icon } from '@dainabase/ui/icon';
```

## Basic Usage

```tsx
import { Icon } from '@dainabase/ui/icon';
import { Home } from 'lucide-react';

export default function IconExample() {
  return (
    <Icon icon={Home} size={24} />
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| icon | `LucideIcon` | - | Yes | The Lucide icon component to render |
| size | `number` | 24 | No | Size of the icon in pixels |
| color | `string` | currentColor | No | Color of the icon |
| strokeWidth | `number` | 2 | No | Stroke width of the icon |
| className | `string` | - | No | Additional CSS classes |
| ...props | `SVGAttributes` | - | No | Standard SVG attributes |

## Examples

### Basic Icon

```tsx
import { Icon } from '@dainabase/ui/icon';
import { Settings } from 'lucide-react';

<Icon icon={Settings} />
```

### Icon with Custom Size

```tsx
import { Icon } from '@dainabase/ui/icon';
import { Heart } from 'lucide-react';

<Icon icon={Heart} size={32} />
```

### Colored Icon

```tsx
import { Icon } from '@dainabase/ui/icon';
import { Star } from 'lucide-react';

<Icon 
  icon={Star} 
  color="#FFD700" 
  size={24}
/>
```

### Advanced Icon Usage

```tsx
import { Icon } from '@dainabase/ui/icon';
import { Bell } from 'lucide-react';
import { useState } from 'react';

function IconAdvanced() {
  const [isActive, setIsActive] = useState(false);
  
  return (
    <Icon
      icon={Bell}
      size={24}
      color={isActive ? '#3B82F6' : '#6B7280'}
      className="cursor-pointer transition-colors"
      onClick={() => setIsActive(!isActive)}
    />
  );
}
```

## Icon Library

The Icon component works with all Lucide React icons. Common icons include:

- **Navigation**: `Home`, `Menu`, `ArrowLeft`, `ArrowRight`
- **Actions**: `Save`, `Download`, `Upload`, `Share`
- **UI**: `Settings`, `Search`, `Filter`, `Plus`, `Minus`
- **Status**: `Check`, `X`, `AlertCircle`, `Info`
- **Media**: `Play`, `Pause`, `Volume`, `Image`

## Accessibility

- Icons include proper ARIA attributes
- Support for `aria-label` and `aria-hidden`
- Meaningful icons should have descriptive labels
- Decorative icons should use `aria-hidden="true"`
- Consider using text labels alongside icons for clarity

## Best Practices

1. **Choose meaningful icons** that users will recognize
2. **Maintain consistent sizing** across your application
3. **Use semantic colors** (success=green, error=red, etc.)
4. **Add tooltips** for complex or uncommon icons
5. **Test icon visibility** on different backgrounds

## Common Use Cases

- Navigation menus and toolbars
- Button icons and icon buttons
- Status indicators and alerts
- Form field decorations
- Loading and progress indicators

## API Reference

### Icon Component

The Icon component extends standard SVG attributes and adds:

- `icon`: Required Lucide icon component
- `size`: Icon dimensions (width and height)
- `color`: Fill/stroke color
- `strokeWidth`: Line thickness
- `className`: Additional styling

## Styling

### With Tailwind CSS
```tsx
<Icon 
  icon={Heart} 
  className="text-red-500 hover:text-red-600 transition-colors" 
/>
```

### With CSS Variables
```tsx
<Icon 
  icon={Star} 
  style={{ color: 'var(--primary-color)' }} 
/>
```

### Animated Icons
```tsx
<Icon 
  icon={Loader} 
  className="animate-spin" 
/>
```

## TypeScript

Full TypeScript support with type definitions:

```tsx
import { Icon, IconProps } from '@dainabase/ui/icon';
import { LucideIcon } from 'lucide-react';

interface CustomIconProps extends IconProps {
  onIconClick?: () => void;
}

const CustomIcon: React.FC<CustomIconProps> = ({ onIconClick, ...props }) => {
  return <Icon {...props} onClick={onIconClick} />;
};
```

## Testing

Example test with React Testing Library:

```tsx
import { render, screen } from '@testing-library/react';
import { Icon } from '@dainabase/ui/icon';
import { Home } from 'lucide-react';

describe('Icon', () => {
  it('renders the icon correctly', () => {
    render(<Icon icon={Home} aria-label="Home" />);
    expect(screen.getByLabelText('Home')).toBeInTheDocument();
  });
  
  it('applies custom size', () => {
    const { container } = render(<Icon icon={Home} size={32} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });
});
```

## Performance Considerations

- Icons are tree-shakeable when imported individually
- Minimal runtime overhead
- SVG-based for crisp rendering at any size
- Lazy loading support for icon libraries

## Migration Guide

### From Font Awesome
```tsx
// Before (Font Awesome)
<i className="fas fa-home"></i>

// After (Directus UI)
<Icon icon={Home} />
```

### From Material Icons
```tsx
// Before (Material Icons)
<HomeIcon />

// After (Directus UI)
<Icon icon={Home} />
```

## Related Components

- [Button](./button.md) - Buttons with icon support
- [Navigation Menu](./navigation-menu.md) - Icons in navigation
- [Alert](./alert.md) - Icons for alert states
- [Badge](./badge.md) - Icon badges

## Resources

- [Lucide Icons Library](https://lucide.dev/icons)
- [Component Source](https://github.com/dainabase/directus-unified-platform/tree/main/packages/ui/src/components/icon)
- [Storybook Demo](https://directus-ui.vercel.app/?path=/story/icon)

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>