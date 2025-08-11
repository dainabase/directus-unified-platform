# Toggle Group

Group of toggle buttons

## Import

```tsx
import { ToggleGroup, ToggleGroupItem } from '@dainabase/ui/toggle-group';
```

## Basic Usage

```tsx
import { ToggleGroup, ToggleGroupItem } from '@dainabase/ui/toggle-group';

export default function ToggleGroupExample() {
  return (
    <ToggleGroup type="single">
      <ToggleGroupItem value="bold">B</ToggleGroupItem>
      <ToggleGroupItem value="italic">I</ToggleGroupItem>
      <ToggleGroupItem value="underline">U</ToggleGroupItem>
    </ToggleGroup>
  );
}
```

## Related Components

- [Toggle](./toggle.md) - Single toggle
- [Radio Group](./radio-group.md) - Radio selection

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>