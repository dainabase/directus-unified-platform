# Color Picker

Visual color selection tool

## Import

```tsx
import { ColorPicker } from '@dainabase/ui/color-picker';
```

## Basic Usage

```tsx
import { ColorPicker } from '@dainabase/ui/color-picker';

export default function ColorPickerExample() {
  return (
    <ColorPicker 
      defaultValue="#3B82F6"
      onChange={(color) => console.log(color)}
    />
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| value | `string` | - | No | Selected color |
| defaultValue | `string` | '#000000' | No | Initial color |
| onChange | `(color: string) => void` | - | No | Color change callback |
| format | `'hex' \| 'rgb' \| 'hsl'` | 'hex' | No | Color format |

## Related Components

- [Input](./input.md) - Text color input

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>