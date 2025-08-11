# Command Palette

Command search and execution

## Import

```tsx
import { CommandPalette } from '@dainabase/ui/command-palette';
```

## Basic Usage

```tsx
import { CommandPalette } from '@dainabase/ui/command-palette';

export default function CommandPaletteExample() {
  return (
    <CommandPalette
      commands={[
        { id: '1', label: 'Search', action: () => {} },
        { id: '2', label: 'Create New', action: () => {} },
      ]}
      placeholder="Type a command..."
    />
  );
}
```

## Related Components

- [Select](./select.md) - Dropdown selection

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>