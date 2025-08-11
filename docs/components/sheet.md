# Sheet

Slide-out panel overlay

## Import

```tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@dainabase/ui/sheet';
```

## Basic Usage

```tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@dainabase/ui/sheet';

export default function SheetExample() {
  return (
    <Sheet>
      <SheetTrigger>Open Sheet</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
        </SheetHeader>
        <div>Sheet content goes here</div>
      </SheetContent>
    </Sheet>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| side | `'left' \| 'right' \| 'top' \| 'bottom'` | 'right' | No | Slide direction |
| open | `boolean` | - | No | Controlled state |

## Related Components

- [Dialog](./dialog.md) - Modal dialog
- [Drawer](./drawer.md) - Mobile drawer

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>