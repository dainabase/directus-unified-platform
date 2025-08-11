# Checkbox

Checkbox input for boolean values

## Import

```tsx
import { Checkbox } from '@dainabase/ui/checkbox';
```

## Basic Usage

```tsx
import { Checkbox } from '@dainabase/ui/checkbox';

export default function CheckboxExample() {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <label htmlFor="terms">Accept terms and conditions</label>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| checked | `boolean \| 'indeterminate'` | - | No | Checked state |
| defaultChecked | `boolean` | false | No | Initial checked state |
| onCheckedChange | `(checked: boolean) => void` | - | No | Change callback |
| disabled | `boolean` | false | No | Disable checkbox |
| required | `boolean` | false | No | Required field |

## Related Components

- [Switch](./switch.md) - Toggle alternative
- [Radio Group](./radio-group.md) - Single selection

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>