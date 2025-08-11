# Badge

Small labeling component

## Import

```tsx
import { Badge } from '@dainabase/ui/badge';
```

## Basic Usage

```tsx
import { Badge } from '@dainabase/ui/badge';

export default function BadgeExample() {
  return (
    <div className="flex gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| variant | `'default' \| 'secondary' \| 'destructive' \| 'outline'` | 'default' | No | Badge style |
| className | `string` | - | No | Additional CSS classes |

## Related Components

- [Button](./button.md) - Action buttons
- [Alert](./alert.md) - Alert messages

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>