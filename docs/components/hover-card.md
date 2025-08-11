# Hover Card

Rich content on hover

## Import

```tsx
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@dainabase/ui/hover-card';
```

## Basic Usage

```tsx
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@dainabase/ui/hover-card';

export default function HoverCardExample() {
  return (
    <HoverCard>
      <HoverCardTrigger>@username</HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex space-x-4">
          <div>
            <h4>User Profile</h4>
            <p>Full bio and information</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| openDelay | `number` | 700 | No | Delay before showing |
| closeDelay | `number` | 300 | No | Delay before hiding |

## Related Components

- [Tooltip](./tooltip.md) - Simple tooltip
- [Popover](./popover.md) - Click overlay

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>