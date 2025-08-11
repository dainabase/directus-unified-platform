# Separator

Visual divider for content sections

## Import

```tsx
import { Separator } from '@dainabase/ui/separator';
```

## Basic Usage

```tsx
import { Separator } from '@dainabase/ui/separator';

export default function SeparatorExample() {
  return (
    <div>
      <div>Content above</div>
      <Separator />
      <div>Content below</div>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| orientation | `'horizontal' \| 'vertical'` | 'horizontal' | No | Separator orientation |
| decorative | `boolean` | true | No | Whether separator is decorative |
| className | `string` | - | No | Additional CSS classes |
| ...props | `HTMLAttributes` | - | No | Standard HTML attributes |

## Examples

### Basic Separator

```tsx
<Separator />
```

### Vertical Separator

```tsx
<div className="flex items-center">
  <span>Left</span>
  <Separator orientation="vertical" className="mx-4 h-6" />
  <span>Right</span>
</div>
```

### Styled Separator

```tsx
<Separator className="my-8 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
```

## Accessibility

- Uses proper ARIA role for semantic meaning
- Decorative separators hidden from screen readers
- Non-decorative separators announced properly

## Related Components

- [Card](./card.md) - Often uses separators
- [Navigation Menu](./navigation-menu.md) - Menu item separation

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>