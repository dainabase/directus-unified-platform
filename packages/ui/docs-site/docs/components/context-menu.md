---
id: context-menu
title: ContextMenu
sidebar_position: 16
---

import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuCheckboxItem, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuLabel, ContextMenuShortcut } from '@dainabase/ui';

# ContextMenu

Displays a menu to the user — typically triggered by right-clicking. Provides context-sensitive actions for any element.

## Preview

<ContextMenu>
  <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
    Right click here
  </ContextMenuTrigger>
  <ContextMenuContent className="w-64">
    <ContextMenuItem>Back</ContextMenuItem>
    <ContextMenuItem>Forward</ContextMenuItem>
    <ContextMenuItem>Reload</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem>Save Page As...</ContextMenuItem>
    <ContextMenuItem>Print</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>

## Features

- **Native Feel**: Mimics OS-native context menus
- **Keyboard Navigation**: Full keyboard support with arrow keys
- **Nested Menus**: Support for submenus and nested items
- **Icons & Shortcuts**: Display icons and keyboard shortcuts
- **Checkboxes & Radio**: Built-in checkbox and radio items
- **Disabled States**: Individual items can be disabled
- **Custom Triggers**: Works with any element
- **Collision Detection**: Smart positioning in viewport
- **Accessibility**: Full ARIA support and screen reader compatible

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@dainabase/ui';

export default function ContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>Right click me</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Action 1</ContextMenuItem>
        <ContextMenuItem>Action 2</ContextMenuItem>
        <ContextMenuItem>Action 3</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

## Examples

### Basic Context Menu

```tsx
<ContextMenu>
  <ContextMenuTrigger className="border-2 border-dashed rounded p-8">
    <p>Right-click this area</p>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Cut</ContextMenuItem>
    <ContextMenuItem>Copy</ContextMenuItem>
    <ContextMenuItem>Paste</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem>Delete</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

### With Icons and Shortcuts

```tsx
<ContextMenu>
  <ContextMenuTrigger asChild>
    <div className="rounded-lg bg-muted p-12 text-center">
      Right-click for options
    </div>
  </ContextMenuTrigger>
  <ContextMenuContent className="w-56">
    <ContextMenuItem>
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back
      <ContextMenuShortcut>Alt+←</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuItem>
      <ArrowRight className="mr-2 h-4 w-4" />
      Forward
      <ContextMenuShortcut>Alt+→</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuItem>
      <RotateCw className="mr-2 h-4 w-4" />
      Reload
      <ContextMenuShortcut>Ctrl+R</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem>
      <Save className="mr-2 h-4 w-4" />
      Save As...
      <ContextMenuShortcut>Ctrl+S</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuItem>
      <Printer className="mr-2 h-4 w-4" />
      Print
      <ContextMenuShortcut>Ctrl+P</ContextMenuShortcut>
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

### With Submenus

```tsx
<ContextMenu>
  <ContextMenuTrigger className="h-32 border rounded">
    Right-click me
  </ContextMenuTrigger>
  <ContextMenuContent className="w-56">
    <ContextMenuItem>New File</ContextMenuItem>
    <ContextMenuSub>
      <ContextMenuSubTrigger>
        <FolderPlus className="mr-2 h-4 w-4" />
        New Folder
      </ContextMenuSubTrigger>
      <ContextMenuSubContent className="w-48">
        <ContextMenuItem>
          <Folder className="mr-2 h-4 w-4" />
          Regular Folder
        </ContextMenuItem>
        <ContextMenuItem>
          <FolderLock className="mr-2 h-4 w-4" />
          Protected Folder
        </ContextMenuItem>
        <ContextMenuItem>
          <FolderOpen className="mr-2 h-4 w-4" />
          Shared Folder
        </ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>
    <ContextMenuSeparator />
    <ContextMenuSub>
      <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
      <ContextMenuSubContent className="w-48">
        <ContextMenuItem>
          <Mail className="mr-2 h-4 w-4" />
          Email
        </ContextMenuItem>
        <ContextMenuItem>
          <MessageSquare className="mr-2 h-4 w-4" />
          Messages
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <Link className="mr-2 h-4 w-4" />
          Copy Link
        </ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>
  </ContextMenuContent>
</ContextMenu>
```

### With Checkboxes

```tsx
function CheckboxContextMenu() {
  const [showGrid, setShowGrid] = useState(true);
  const [showRuler, setShowRuler] = useState(false);
  const [showGuides, setShowGuides] = useState(true);

  return (
    <ContextMenu>
      <ContextMenuTrigger className="border-2 rounded p-8">
        Design Canvas
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuLabel>View Options</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem
          checked={showGrid}
          onCheckedChange={setShowGrid}
        >
          <Grid className="mr-2 h-4 w-4" />
          Show Grid
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem
          checked={showRuler}
          onCheckedChange={setShowRuler}
        >
          <Ruler className="mr-2 h-4 w-4" />
          Show Rulers
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem
          checked={showGuides}
          onCheckedChange={setShowGuides}
        >
          <Minus className="mr-2 h-4 w-4" />
          Show Guides
        </ContextMenuCheckboxItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

### With Radio Groups

```tsx
function RadioContextMenu() {
  const [quality, setQuality] = useState('high');

  return (
    <ContextMenu>
      <ContextMenuTrigger className="border rounded p-8">
        Video Player
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuLabel>Playback Quality</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup value={quality} onValueChange={setQuality}>
          <ContextMenuRadioItem value="auto">
            <Zap className="mr-2 h-4 w-4" />
            Auto
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="high">
            <Monitor className="mr-2 h-4 w-4" />
            High (1080p)
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="medium">
            <Tablet className="mr-2 h-4 w-4" />
            Medium (720p)
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="low">
            <Smartphone className="mr-2 h-4 w-4" />
            Low (480p)
          </ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

### File Manager Context Menu

```tsx
<ContextMenu>
  <ContextMenuTrigger asChild>
    <div className="flex items-center gap-2 p-2 rounded hover:bg-muted">
      <FileText className="h-4 w-4" />
      <span>document.pdf</span>
    </div>
  </ContextMenuTrigger>
  <ContextMenuContent className="w-64">
    <ContextMenuItem>
      <FileOpen className="mr-2 h-4 w-4" />
      Open
    </ContextMenuItem>
    <ContextMenuItem>
      <FolderOpen className="mr-2 h-4 w-4" />
      Open Containing Folder
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem>
      <Copy className="mr-2 h-4 w-4" />
      Copy
      <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuItem>
      <Scissors className="mr-2 h-4 w-4" />
      Cut
      <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem>
      <Edit className="mr-2 h-4 w-4" />
      Rename
      <ContextMenuShortcut>F2</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuItem>
      <Download className="mr-2 h-4 w-4" />
      Download
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem className="text-destructive">
      <Trash className="mr-2 h-4 w-4" />
      Delete
      <ContextMenuShortcut>Del</ContextMenuShortcut>
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

### Text Editor Context Menu

```tsx
<ContextMenu>
  <ContextMenuTrigger asChild>
    <div className="min-h-[200px] p-4 border rounded">
      <p>Select and right-click this text for editing options.</p>
    </div>
  </ContextMenuTrigger>
  <ContextMenuContent className="w-56">
    <ContextMenuItem>
      <Undo className="mr-2 h-4 w-4" />
      Undo
      <ContextMenuShortcut>Ctrl+Z</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuItem>
      <Redo className="mr-2 h-4 w-4" />
      Redo
      <ContextMenuShortcut>Ctrl+Y</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem>
      <Scissors className="mr-2 h-4 w-4" />
      Cut
      <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuItem>
      <Copy className="mr-2 h-4 w-4" />
      Copy
      <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuItem>
      <Clipboard className="mr-2 h-4 w-4" />
      Paste
      <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuSub>
      <ContextMenuSubTrigger>
        <Type className="mr-2 h-4 w-4" />
        Format
      </ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem>
          <Bold className="mr-2 h-4 w-4" />
          Bold
        </ContextMenuItem>
        <ContextMenuItem>
          <Italic className="mr-2 h-4 w-4" />
          Italic
        </ContextMenuItem>
        <ContextMenuItem>
          <Underline className="mr-2 h-4 w-4" />
          Underline
        </ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>
  </ContextMenuContent>
</ContextMenu>
```

### Table Row Context Menu

```tsx
<Table>
  <TableBody>
    {data.map((row) => (
      <ContextMenu key={row.id}>
        <ContextMenuTrigger asChild>
          <TableRow>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell>{row.date}</TableCell>
          </TableRow>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={() => viewDetails(row.id)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </ContextMenuItem>
          <ContextMenuItem onClick={() => editRow(row.id)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </ContextMenuItem>
          <ContextMenuItem onClick={() => duplicateRow(row.id)}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem 
            className="text-destructive"
            onClick={() => deleteRow(row.id)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    ))}
  </TableBody>
</Table>
```

### Image Context Menu

```tsx
<ContextMenu>
  <ContextMenuTrigger asChild>
    <img 
      src="/image.jpg" 
      alt="Sample" 
      className="w-64 h-48 object-cover rounded"
    />
  </ContextMenuTrigger>
  <ContextMenuContent className="w-56">
    <ContextMenuItem>
      <ExternalLink className="mr-2 h-4 w-4" />
      Open Image in New Tab
    </ContextMenuItem>
    <ContextMenuItem>
      <Download className="mr-2 h-4 w-4" />
      Save Image As...
    </ContextMenuItem>
    <ContextMenuItem>
      <Copy className="mr-2 h-4 w-4" />
      Copy Image
    </ContextMenuItem>
    <ContextMenuItem>
      <Link className="mr-2 h-4 w-4" />
      Copy Image Address
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuSub>
      <ContextMenuSubTrigger>
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem>Facebook</ContextMenuItem>
        <ContextMenuItem>Twitter</ContextMenuItem>
        <ContextMenuItem>LinkedIn</ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>
  </ContextMenuContent>
</ContextMenu>
```

## API Reference

### ContextMenu

The root component that provides context.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Trigger and content elements |
| `onOpenChange` | `(open: boolean) => void` | - | Callback when menu opens/closes |
| `modal` | `boolean` | `true` | Whether to render as modal |

### ContextMenuTrigger

The element that triggers the context menu.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Merge props with child element |
| `disabled` | `boolean` | `false` | Disable context menu trigger |
| `children` | `ReactNode` | - | Trigger element |

### ContextMenuContent

The context menu container.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `align` | `'start' \| 'center' \| 'end'` | `'start'` | Alignment relative to trigger |
| `alignOffset` | `number` | `0` | Offset from alignment |
| `avoidCollisions` | `boolean` | `true` | Avoid viewport edges |
| `className` | `string` | - | Additional CSS classes |

### ContextMenuItem

Individual menu item.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `disabled` | `boolean` | `false` | Disable the item |
| `onSelect` | `(event: Event) => void` | - | Handle selection |
| `className` | `string` | - | Additional CSS classes |

### ContextMenuCheckboxItem

Checkbox menu item.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | - | Checked state |
| `onCheckedChange` | `(checked: boolean) => void` | - | Handle state change |
| `disabled` | `boolean` | `false` | Disable the item |

### ContextMenuRadioGroup

Container for radio items.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Selected value |
| `onValueChange` | `(value: string) => void` | - | Handle selection change |

### ContextMenuRadioItem

Radio menu item.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Item value |
| `disabled` | `boolean` | `false` | Disable the item |

## Accessibility

The ContextMenu follows WAI-ARIA menu pattern:

- **Keyboard Navigation**:
  - `Right Click` or `Menu Key`: Opens context menu
  - `Arrow Keys`: Navigate menu items
  - `Enter`: Select focused item
  - `Space`: Toggle checkboxes
  - `Escape`: Close menu
  - `Tab`: Exit menu
- **Screen Readers**: Full ARIA support
- **Focus Management**: Proper focus restoration
- **Roles**: Correct menu and menuitem roles

## Best Practices

### Do's ✅

- Provide context-relevant actions
- Include keyboard shortcuts where applicable
- Use icons for better recognition
- Group related items with separators
- Keep menus concise (5-10 items max)
- Test on different devices and browsers

### Don'ts ❌

- Don't override browser's native context menu unnecessarily
- Don't put critical actions only in context menus
- Don't nest more than 2 levels deep
- Don't include too many items
- Don't forget mobile alternatives
- Don't use for primary navigation

## Use Cases

- **File Management**: File/folder operations
- **Text Editors**: Text formatting and editing
- **Tables**: Row-specific actions
- **Images**: Image operations and sharing
- **Design Tools**: Canvas and element operations
- **Code Editors**: Code-specific actions
- **Media Players**: Playback controls
- **Games**: In-game actions and options

## Related Components

- [DropdownMenu](./dropdown-menu) - For button-triggered menus
- [Menubar](./menubar) - For application menu bars
- [Popover](./popover) - For interactive floating content
- [Select](./select) - For form selections
- [Command](./command-palette) - For command palettes