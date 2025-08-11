# Radio Group

Radio button group for single selection

## Import

```tsx
import { RadioGroup, RadioGroupItem } from '@dainabase/ui/radio-group';
```

## Basic Usage

```tsx
import { RadioGroup, RadioGroupItem } from '@dainabase/ui/radio-group';

export default function RadioGroupExample() {
  return (
    <RadioGroup defaultValue="option1">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="r1" />
        <label htmlFor="r1">Option 1</label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="r2" />
        <label htmlFor="r2">Option 2</label>
      </div>
    </RadioGroup>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| value | `string` | - | No | Selected value |
| defaultValue | `string` | - | No | Initial selection |
| onValueChange | `(value: string) => void` | - | No | Selection callback |
| disabled | `boolean` | false | No | Disable all options |

## Related Components

- [Select](./select.md) - Dropdown alternative
- [Checkbox](./checkbox.md) - Multiple selection

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>