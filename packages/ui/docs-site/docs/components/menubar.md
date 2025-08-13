---
id: menubar
title: Menubar
sidebar_position: 30
---

import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem } from '@dainabase/ui';

# Menubar

A visually persistent menu common in desktop applications that provides quick access to a consistent set of commands.

## Preview

```jsx live
function MenubarDemo() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            New Window <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>New Incognito Window</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Email link</MenubarItem>
              <MenubarItem>Messages</MenubarItem>
              <MenubarItem>Notes</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>
            Print... <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Cut</MenubarItem>
          <MenubarItem>Copy</MenubarItem>
          <MenubarItem>Paste</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem>Always Show Bookmarks Bar</MenubarCheckboxItem>
          <MenubarCheckboxItem checked>Always Show Full URLs</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarRadioGroup value="comfortable">
            <MenubarRadioItem value="comfortable">Comfortable</MenubarRadioItem>
            <MenubarRadioItem value="compact">Compact</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
```

## Features

- 🎯 **Desktop-style menus** - Familiar menubar pattern from desktop applications
- ⌨️ **Keyboard shortcuts** - Display and support keyboard shortcuts
- 📝 **Checkbox items** - Support for toggleable menu items
- 🔘 **Radio groups** - Mutually exclusive option selection
- 🎪 **Nested submenus** - Support for multi-level menu structures
- ♿ **Full accessibility** - ARIA compliant with screen reader support
- 🎨 **Customizable styling** - Easy theming with CSS variables
- 🔄 **Controlled/Uncontrolled** - Flexible state management
- 🎯 **Focus management** - Smart focus trap and restoration
- 🚀 **Performance optimized** - Lazy rendering of menu content

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```jsx
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@dainabase/ui';
```

## Examples

### Basic Menubar

```jsx
<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New</MenubarItem>
      <MenubarItem>Open</MenubarItem>
      <MenubarItem>Save</MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Exit</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
  <MenubarMenu>
    <MenubarTrigger>Edit</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>Undo</MenubarItem>
      <MenubarItem>Redo</MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Cut</MenubarItem>
      <MenubarItem>Copy</MenubarItem>
      <MenubarItem>Paste</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

### With Keyboard Shortcuts

```jsx
<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>
        New File
        <MenubarShortcut>⌘N</MenubarShortcut>
      </MenubarItem>
      <MenubarItem>
        Open...
        <MenubarShortcut>⌘O</MenubarShortcut>
      </MenubarItem>
      <MenubarItem>
        Save
        <MenubarShortcut>⌘S</MenubarShortcut>
      </MenubarItem>
      <MenubarItem>
        Save As...
        <MenubarShortcut>⇧⌘S</MenubarShortcut>
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem>
        Quit
        <MenubarShortcut>⌘Q</MenubarShortcut>
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

### With Checkbox Items

```jsx
function MenubarWithCheckboxes() {
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [showActivityBar, setShowActivityBar] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem 
            checked={showStatusBar}
            onCheckedChange={setShowStatusBar}
          >
            Show Status Bar
          </MenubarCheckboxItem>
          <MenubarCheckboxItem 
            checked={showActivityBar}
            onCheckedChange={setShowActivityBar}
          >
            Show Activity Bar
          </MenubarCheckboxItem>
          <MenubarCheckboxItem 
            checked={showPanel}
            onCheckedChange={setShowPanel}
          >
            Show Panel
          </MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
```

### With Radio Groups

```jsx
function MenubarWithRadioGroups() {
  const [fontSize, setFontSize] = useState("medium");
  const [theme, setTheme] = useState("light");
  
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Preferences</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Settings...</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Font Size</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarRadioGroup value={fontSize} onValueChange={setFontSize}>
                <MenubarRadioItem value="small">Small</MenubarRadioItem>
                <MenubarRadioItem value="medium">Medium</MenubarRadioItem>
                <MenubarRadioItem value="large">Large</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSub>
            <MenubarSubTrigger>Theme</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarRadioGroup value={theme} onValueChange={setTheme}>
                <MenubarRadioItem value="light">Light</MenubarRadioItem>
                <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
                <MenubarRadioItem value="system">System</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
```

### With Nested Submenus

```jsx
<Menubar>
  <MenubarMenu>
    <MenubarTrigger>Format</MenubarTrigger>
    <MenubarContent>
      <MenubarSub>
        <MenubarSubTrigger>Font</MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarItem>Bold</MenubarItem>
          <MenubarItem>Italic</MenubarItem>
          <MenubarItem>Underline</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>More Styles</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Strikethrough</MenubarItem>
              <MenubarItem>Superscript</MenubarItem>
              <MenubarItem>Subscript</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarSubContent>
      </MenubarSub>
      <MenubarSub>
        <MenubarSubTrigger>Paragraph</MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarItem>Align Left</MenubarItem>
          <MenubarItem>Align Center</MenubarItem>
          <MenubarItem>Align Right</MenubarItem>
          <MenubarItem>Justify</MenubarItem>
        </MenubarSubContent>
      </MenubarSub>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

### With Icons

```jsx
<Menubar>
  <MenubarMenu>
    <MenubarTrigger>
      <Icon name="file" className="mr-2 h-4 w-4" />
      File
    </MenubarTrigger>
    <MenubarContent>
      <MenubarItem>
        <Icon name="file-plus" className="mr-2 h-4 w-4" />
        New File
      </MenubarItem>
      <MenubarItem>
        <Icon name="folder-open" className="mr-2 h-4 w-4" />
        Open Folder
      </MenubarItem>
      <MenubarItem>
        <Icon name="save" className="mr-2 h-4 w-4" />
        Save
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem>
        <Icon name="log-out" className="mr-2 h-4 w-4" />
        Exit
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

### Complex Application Menubar

```jsx
<Menubar className="w-full">
  <MenubarMenu>
    <MenubarTrigger>Application</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>About Dainabase UI</MenubarItem>
      <MenubarSeparator />
      <MenubarItem>
        Preferences... <MenubarShortcut>⌘,</MenubarShortcut>
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Services</MenubarItem>
      <MenubarSeparator />
      <MenubarItem>
        Hide Application <MenubarShortcut>⌘H</MenubarShortcut>
      </MenubarItem>
      <MenubarItem>Hide Others</MenubarItem>
      <MenubarItem>Show All</MenubarItem>
      <MenubarSeparator />
      <MenubarItem>
        Quit <MenubarShortcut>⌘Q</MenubarShortcut>
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
  
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>
        New Project <MenubarShortcut>⌘N</MenubarShortcut>
      </MenubarItem>
      <MenubarItem>
        Open Project... <MenubarShortcut>⌘O</MenubarShortcut>
      </MenubarItem>
      <MenubarSub>
        <MenubarSubTrigger>Recent Projects</MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarItem>Project Alpha</MenubarItem>
          <MenubarItem>Project Beta</MenubarItem>
          <MenubarItem>Project Gamma</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Clear Recent</MenubarItem>
        </MenubarSubContent>
      </MenubarSub>
      <MenubarSeparator />
      <MenubarItem>
        Save <MenubarShortcut>⌘S</MenubarShortcut>
      </MenubarItem>
      <MenubarItem>
        Save As... <MenubarShortcut>⇧⌘S</MenubarShortcut>
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
  
  <MenubarMenu>
    <MenubarTrigger>Edit</MenubarTrigger>
    <MenubarContent>
      <MenubarItem disabled>
        Undo <MenubarShortcut>⌘Z</MenubarShortcut>
      </MenubarItem>
      <MenubarItem disabled>
        Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem>
        Cut <MenubarShortcut>⌘X</MenubarShortcut>
      </MenubarItem>
      <MenubarItem>
        Copy <MenubarShortcut>⌘C</MenubarShortcut>
      </MenubarItem>
      <MenubarItem>
        Paste <MenubarShortcut>⌘V</MenubarShortcut>
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

### With Actions and Callbacks

```jsx
function MenubarWithActions() {
  const handleNewFile = () => console.log('Creating new file...');
  const handleOpenFile = () => console.log('Opening file...');
  const handleSaveFile = () => console.log('Saving file...');
  const handlePrint = () => window.print();
  
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onSelect={handleNewFile}>
            New File
          </MenubarItem>
          <MenubarItem onSelect={handleOpenFile}>
            Open...
          </MenubarItem>
          <MenubarItem onSelect={handleSaveFile}>
            Save
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onSelect={handlePrint}>
            Print...
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
```

### With Custom Styling

```jsx
<Menubar className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
  <MenubarMenu>
    <MenubarTrigger className="data-[state=open]:bg-white/20">
      Custom Style
    </MenubarTrigger>
    <MenubarContent className="bg-purple-900 text-white border-purple-700">
      <MenubarItem className="focus:bg-purple-700">
        Option 1
      </MenubarItem>
      <MenubarItem className="focus:bg-purple-700">
        Option 2
      </MenubarItem>
      <MenubarSeparator className="bg-purple-700" />
      <MenubarItem className="focus:bg-purple-700">
        Option 3
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

### Context-Aware Menubar

```jsx
function ContextAwareMenubar({ userRole, hasUnsavedChanges }) {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New</MenubarItem>
          <MenubarItem>Open</MenubarItem>
          <MenubarItem disabled={!hasUnsavedChanges}>
            Save
          </MenubarItem>
          <MenubarSeparator />
          {userRole === 'admin' && (
            <>
              <MenubarItem>Admin Settings</MenubarItem>
              <MenubarSeparator />
            </>
          )}
          <MenubarItem>Exit</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      
      {userRole === 'admin' && (
        <MenubarMenu>
          <MenubarTrigger>Admin</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>User Management</MenubarItem>
            <MenubarItem>System Settings</MenubarItem>
            <MenubarItem>Logs</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      )}
    </Menubar>
  );
}
```

## API Reference

### Menubar

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | The controlled value of the menu to open |
| `onValueChange` | `(value: string) => void` | - | Event handler called when the open menu changes |
| `defaultValue` | `string` | - | The value of the menu to open initially (uncontrolled) |
| `loop` | `boolean` | `true` | Whether keyboard navigation should loop |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | The reading direction |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | The menubar content |

### MenubarMenu

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | A unique value that associates the menu with an open value |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | The menu content |

### MenubarTrigger

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `disabled` | `boolean` | `false` | Whether the trigger is disabled |
| `children` | `ReactNode` | - | The trigger content |

### MenubarContent

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `align` | `"start" \| "center" \| "end"` | `"start"` | The preferred alignment |
| `alignOffset` | `number` | `0` | Offset from the align position |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` | The preferred side |
| `sideOffset` | `number` | `0` | Offset from the side position |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | The content |

### MenubarItem

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `disabled` | `boolean` | `false` | Whether the item is disabled |
| `onSelect` | `(event: Event) => void` | - | Event handler called when selected |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | The item content |

### MenubarCheckboxItem

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean \| "indeterminate"` | - | The controlled checked state |
| `onCheckedChange` | `(checked: boolean) => void` | - | Event handler for checked state changes |
| `disabled` | `boolean` | `false` | Whether the item is disabled |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | The item content |

### MenubarRadioGroup

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | The controlled value |
| `onValueChange` | `(value: string) => void` | - | Event handler for value changes |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | The radio items |

### MenubarRadioItem

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | The value of the radio item |
| `disabled` | `boolean` | `false` | Whether the item is disabled |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | The item content |

### MenubarSeparator

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |

### MenubarShortcut

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | The shortcut text |

### MenubarSub

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultOpen` | `boolean` | `false` | Whether the submenu is open by default |
| `open` | `boolean` | - | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | - | Event handler for open state changes |
| `children` | `ReactNode` | - | The submenu content |

### MenubarSubTrigger

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `disabled` | `boolean` | `false` | Whether the trigger is disabled |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | The trigger content |

### MenubarSubContent

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | The submenu content |

## Accessibility

The Menubar component follows WAI-ARIA guidelines:

- Full keyboard navigation with arrow keys, Tab, Enter, and Escape
- ARIA attributes for screen readers (role="menubar", aria-expanded, etc.)
- Focus management with roving tabindex
- Proper semantic structure with menu roles
- Support for disabled items
- Announces state changes to screen readers
- Maintains focus visibility for keyboard users
- Support for RTL languages

## Best Practices

### ✅ Do's

- Use familiar menu structures from desktop applications
- Keep menu labels short and descriptive
- Group related items with separators
- Show keyboard shortcuts for common actions
- Use checkbox items for toggleable options
- Use radio groups for mutually exclusive options
- Provide visual feedback for hover and active states
- Test keyboard navigation thoroughly
- Disable unavailable items rather than hiding them
- Use consistent ordering across the application

### ❌ Don'ts

- Don't create deeply nested menu structures (max 2-3 levels)
- Avoid too many top-level menus
- Don't use menubars for primary navigation on web
- Avoid mixing actions and navigation in the same menu
- Don't use custom keyboard shortcuts that conflict with browser/OS
- Avoid long menu item labels
- Don't put critical actions only in menus
- Avoid inconsistent menu structures across views
- Don't forget to handle edge cases (empty states, errors)
- Avoid poor contrast between menu states

## Use Cases

- **Desktop applications** - Traditional application menus
- **Text editors** - File, Edit, View, Format menus
- **IDE interfaces** - Development environment menus
- **Creative tools** - Design software menu systems
- **Admin panels** - Complex administrative interfaces
- **Document editors** - Word processing applications
- **Spreadsheet apps** - Data manipulation tools
- **Email clients** - Message management menus
- **Project management** - Task and project menus
- **Settings panels** - Configuration and preferences

## Related Components

- [Dropdown Menu](/docs/components/dropdown-menu) - For simpler action menus
- [Navigation Menu](/docs/components/navigation-menu) - For website navigation
- [Context Menu](/docs/components/context-menu) - For right-click menus
- [Select](/docs/components/select) - For single option selection
- [Checkbox](/docs/components/checkbox) - For standalone toggles
- [Radio Group](/docs/components/radio-group) - For standalone radio options
