# Tooltip

Hover information display

## Import

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@dainabase/ui/tooltip';
```

## Basic Usage

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@dainabase/ui/tooltip';

export default function TooltipExample() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>
          <p>Tooltip content</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| delayDuration | `number` | 700 | No | Delay before showing |
| side | `'top' \| 'right' \| 'bottom' \| 'left'` | 'top' | No | Position |

## Related Components

- [Popover](./popover.md) - Click-triggered overlay
- [Hover Card](./hover-card.md) - Rich hover content

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>