# Switch

Toggle switch for on/off states

## Import

```tsx
import { Switch } from '@dainabase/ui/switch';
```

## Basic Usage

```tsx
import { Switch } from '@dainabase/ui/switch';

export default function SwitchExample() {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <label htmlFor="airplane-mode">Airplane Mode</label>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| checked | `boolean` | - | No | Controlled state |
| defaultChecked | `boolean` | false | No | Initial state |
| onCheckedChange | `(checked: boolean) => void` | - | No | Change callback |
| disabled | `boolean` | false | No | Disable switch |

## Related Components

- [Checkbox](./checkbox.md) - Checkbox alternative
- [Toggle](./toggle.md) - Toggle button

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>