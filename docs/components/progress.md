# Progress

Progress indicator for tasks

## Import

```tsx
import { Progress } from '@dainabase/ui/progress';
```

## Basic Usage

```tsx
import { Progress } from '@dainabase/ui/progress';

export default function ProgressExample() {
  return (
    <Progress value={60} className="w-full" />
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| value | `number` | 0 | No | Progress value (0-100) |
| max | `number` | 100 | No | Maximum value |
| variant | `'default' \| 'indeterminate'` | 'default' | No | Progress variant |
| className | `string` | - | No | Additional CSS classes |

## Related Components

- [Skeleton](./skeleton.md) - Loading placeholder
- [Stepper](./stepper.md) - Step progress

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>