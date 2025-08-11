# Resizable

Resizable panel component

## Import

```tsx
import { Resizable } from '@dainabase/ui/resizable';
```

## Basic Usage

```tsx
import { Resizable } from '@dainabase/ui/resizable';

export default function ResizableExample() {
  return (
    <Resizable defaultSize={{ width: 200, height: 200 }}>
      <div>Resizable content</div>
    </Resizable>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| defaultSize | `{ width?: number, height?: number }` | - | No | Initial size |
| minWidth | `number` | 100 | No | Minimum width |
| minHeight | `number` | 100 | No | Minimum height |
| maxWidth | `number` | - | No | Maximum width |
| maxHeight | `number` | - | No | Maximum height |
| onResize | `(size: Size) => void` | - | No | Resize callback |
| className | `string` | - | No | Additional CSS classes |
| children | `ReactNode` | - | Yes | Content to make resizable |

## Examples

### Horizontal Resizable

```tsx
<Resizable defaultSize={{ width: 300 }} resizeHandles={['e']}>
  <div>Drag right edge to resize</div>
</Resizable>
```

### Multi-directional Resize

```tsx
<Resizable 
  defaultSize={{ width: 200, height: 200 }}
  resizeHandles={['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']}
>
  <div>Resize from any edge or corner</div>
</Resizable>
```

## Best Practices

1. Set appropriate min/max constraints
2. Provide visual resize handles
3. Save user preferences
4. Test on touch devices

## Related Components

- [Scroll Area](./scroll-area.md) - For scrollable content
- [Collapsible](./collapsible.md) - For expandable sections

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>