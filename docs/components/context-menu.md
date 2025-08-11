# Context Menu

Right-click context menu

## Import

```tsx
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@dainabase/ui/context-menu';
```

## Basic Usage

```tsx
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@dainabase/ui/context-menu';

export default function ContextMenuExample() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="border p-8">
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Copy</ContextMenuItem>
        <ContextMenuItem>Paste</ContextMenuItem>
        <ContextMenuItem>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

## Related Components

- [Dropdown Menu](./dropdown-menu.md) - Click menu
- [Menubar](./menubar.md) - Menu bar

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>