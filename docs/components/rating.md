# Rating

Star rating input component

## Import

```tsx
import { Rating } from '@dainabase/ui/rating';
```

## Basic Usage

```tsx
import { Rating } from '@dainabase/ui/rating';

export default function RatingExample() {
  return (
    <Rating 
      defaultValue={3}
      max={5}
      onChange={(value) => console.log(value)}
    />
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| value | `number` | - | No | Current rating |
| defaultValue | `number` | 0 | No | Initial rating |
| max | `number` | 5 | No | Maximum rating |
| onChange | `(value: number) => void` | - | No | Rating change callback |
| readonly | `boolean` | false | No | Read-only mode |

## Related Components

- [Slider](./slider.md) - Numeric input alternative

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>