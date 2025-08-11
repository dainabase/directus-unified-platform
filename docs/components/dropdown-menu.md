# Dropdown Menu

Contextual dropdown menu

## Import

```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@dainabase/ui/dropdown-menu';
```

## Basic Usage

```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@dainabase/ui/dropdown-menu';

export default function DropdownMenuExample() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Options</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| align | `'start' \| 'center' \| 'end'` | 'center' | No | Menu alignment |

## Related Components

- [Context Menu](./context-menu.md) - Right-click menu
- [Menubar](./menubar.md) - Menu bar

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>