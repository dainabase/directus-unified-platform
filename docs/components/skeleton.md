# Skeleton

Loading placeholder component

## Import

```tsx
import { Skeleton } from '@dainabase/ui/skeleton';
```

## Basic Usage

```tsx
import { Skeleton } from '@dainabase/ui/skeleton';

export default function SkeletonExample() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[150px]" />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| className | `string` | - | No | Size and style classes |
| animation | `'pulse' \| 'wave' \| 'none'` | 'pulse' | No | Animation type |

## Related Components

- [Progress](./progress.md) - Progress indicator
- [Card](./card.md) - Container for skeletons

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>