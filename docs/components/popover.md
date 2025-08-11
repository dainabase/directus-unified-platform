# Popover

Floating content container

## Import

```tsx
import { Popover, PopoverContent, PopoverTrigger } from '@dainabase/ui/popover';
```

## Basic Usage

```tsx
import { Popover, PopoverContent, PopoverTrigger } from '@dainabase/ui/popover';

export default function PopoverExample() {
  return (
    <Popover>
      <PopoverTrigger>Open Popover</PopoverTrigger>
      <PopoverContent>
        <div className="p-4">
          <h4>Popover Title</h4>
          <p>Popover content</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| align | `'start' \| 'center' \| 'end'` | 'center' | No | Alignment |
| side | `'top' \| 'right' \| 'bottom' \| 'left'` | 'bottom' | No | Position |

## Related Components

- [Tooltip](./tooltip.md) - Simple hover tooltip
- [Dropdown Menu](./dropdown-menu.md) - Menu dropdown

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>