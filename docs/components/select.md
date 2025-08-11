# Select

Dropdown selection with search and multi-select

## Import

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@dainabase/ui/select';
```

## Basic Usage

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@dainabase/ui/select';

export default function SelectExample() {
  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| value | `string` | - | No | Selected value |
| defaultValue | `string` | - | No | Default selection |
| onValueChange | `(value: string) => void` | - | No | Selection change callback |
| disabled | `boolean` | false | No | Disable selection |
| multiple | `boolean` | false | No | Allow multiple selection |

## Related Components

- [Form](./form.md) - Form integration
- [Radio Group](./radio-group.md) - Single selection alternative

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>