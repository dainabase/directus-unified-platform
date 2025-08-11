# Slider

Range slider for numeric input

## Import

```tsx
import { Slider } from '@dainabase/ui/slider';
```

## Basic Usage

```tsx
import { Slider } from '@dainabase/ui/slider';

export default function SliderExample() {
  return (
    <Slider 
      defaultValue={[50]} 
      max={100} 
      step={1}
      className="w-full"
    />
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| value | `number[]` | - | No | Controlled value |
| defaultValue | `number[]` | [0] | No | Initial value |
| min | `number` | 0 | No | Minimum value |
| max | `number` | 100 | No | Maximum value |
| step | `number` | 1 | No | Step increment |
| onValueChange | `(value: number[]) => void` | - | No | Change callback |

## Related Components

- [Input](./input.md) - Numeric input alternative

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>