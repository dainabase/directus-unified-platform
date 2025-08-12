---
id: dropdown-menu
title: Dropdown Menu
sidebar_position: 17
---

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@dainabase/ui';

# Dropdown Menu

A list of options that appears when triggered.

<div className="component-preview">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="px-4 py-2 border rounded">Open Menu</button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>Profile</DropdownMenuItem>
      <DropdownMenuItem>Settings</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Logout</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>

## Features

- **Keyboard Navigation**: Full keyboard support with arrow keys
- **Sub-menus**: Nested menu support
- **Checkboxes & Radio**: Built-in selection items
- **Customizable**: Extensive styling options
- **Accessible**: ARIA compliant
- **Portal Rendering**: Renders in portal to avoid z-index issues

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@dainabase/ui';

export function DropdownMenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Item 1</DropdownMenuItem>
        <DropdownMenuItem>Item 2</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Examples

### Basic Dropdown Menu

```jsx live
function BasicDropdownMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="px-4 py-2 border rounded hover:bg-accent">
          Actions
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem>
          <FileIcon className="mr-2 h-4 w-4" />
          New File
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FolderIcon className="mr-2 h-4 w-4" />
          New Folder
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <DownloadIcon className="mr-2 h-4 w-4" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ShareIcon className="mr-2 h-4 w-4" />
          Share
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <TrashIcon className="mr-2 h-4 w-4" />
          Delete (disabled)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### With Checkboxes

```jsx live
function DropdownMenuWithCheckboxes() {
  const [showStatusBar, setShowStatusBar] = React.useState(true);
  const [showActivityBar, setShowActivityBar] = React.useState(false);
  const [showPanel, setShowPanel] = React.useState(false);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="px-4 py-2 border rounded">
          View Options
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={showStatusBar}
          onCheckedChange={setShowStatusBar}
        >
          Status Bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showActivityBar}
          onCheckedChange={setShowActivityBar}
        >
          Activity Bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showPanel}
          onCheckedChange={setShowPanel}
        >
          Panel
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### With Radio Group

```jsx live
function DropdownMenuWithRadio() {
  const [position, setPosition] = React.useState("bottom");
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="px-4 py-2 border rounded">
          Position: {position}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
          <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="left">Left</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### With Sub-menus

```jsx live
function DropdownMenuWithSubmenus() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="px-4 py-2 border rounded">
          More Options
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem>
          <UserIcon className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CreditCardIcon className="mr-2 h-4 w-4" />
          Billing
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <UsersIcon className="mr-2 h-4 w-4" />
            Invite users
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>
              <MailIcon className="mr-2 h-4 w-4" />
              Email
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MessageIcon className="mr-2 h-4 w-4" />
              Message
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <PlusIcon className="mr-2 h-4 w-4" />
              More...
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOutIcon className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Context Menu Style

```jsx live
function ContextMenuExample() {
  return (
    <div className="border-2 border-dashed rounded-lg p-8 text-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="cursor-context-menu">
            Right-click me
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          <DropdownMenuItem inset>
            Back
            <DropdownMenuShortcut>⌘[</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem inset disabled>
            Forward
            <DropdownMenuShortcut>⌘]</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem inset>
            Reload
            <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger inset>More Tools</DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              <DropdownMenuItem>
                Save Page As...
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>Create Shortcut...</DropdownMenuItem>
              <DropdownMenuItem>Name Window...</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Developer Tools</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem inset>
            Show Bookmarks Bar
            <DropdownMenuShortcut>⌘⇧B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem inset>Show Full URLs</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
```

### User Account Menu

```jsx live
function UserAccountMenu() {
  const [theme, setTheme] = React.useState("system");
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 border rounded">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/dainabase.png" />
            <AvatarFallback>DA</AvatarFallback>
          </Avatar>
          <span>My Account</span>
          <ChevronDownIcon className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCardIcon className="mr-2 h-4 w-4" />
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <SettingsIcon className="mr-2 h-4 w-4" />
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <KeyboardIcon className="mr-2 h-4 w-4" />
            Keyboard shortcuts
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
            <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOutIcon className="mr-2 h-4 w-4" />
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## API Reference

### DropdownMenu Props

<div className="props-table">
  <table>
    <thead>
      <tr>
        <th>Prop</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>open</code></td>
        <td><code>boolean</code></td>
        <td><code>undefined</code></td>
        <td>Controlled open state</td>
      </tr>
      <tr>
        <td><code>defaultOpen</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Default open state</td>
      </tr>
      <tr>
        <td><code>onOpenChange</code></td>
        <td><code>(open: boolean) => void</code></td>
        <td><code>undefined</code></td>
        <td>Callback when open state changes</td>
      </tr>
      <tr>
        <td><code>modal</code></td>
        <td><code>boolean</code></td>
        <td><code>true</code></td>
        <td>Modal behavior</td>
      </tr>
    </tbody>
  </table>
</div>

### DropdownMenuContent Props

<div className="props-table">
  <table>
    <thead>
      <tr>
        <th>Prop</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>align</code></td>
        <td><code>'start' | 'center' | 'end'</code></td>
        <td><code>'center'</code></td>
        <td>Alignment relative to trigger</td>
      </tr>
      <tr>
        <td><code>side</code></td>
        <td><code>'top' | 'right' | 'bottom' | 'left'</code></td>
        <td><code>'bottom'</code></td>
        <td>Side relative to trigger</td>
      </tr>
      <tr>
        <td><code>sideOffset</code></td>
        <td><code>number</code></td>
        <td><code>0</code></td>
        <td>Offset from trigger</td>
      </tr>
      <tr>
        <td><code>className</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>Additional CSS classes</td>
      </tr>
    </tbody>
  </table>
</div>

## Accessibility

The Dropdown Menu follows WAI-ARIA Menu pattern:
- Arrow keys navigate menu items
- Enter/Space activates items
- Escape closes the menu
- Tab moves focus out
- Type-ahead focus navigation
- `role="menu"` and `role="menuitem"`
- Proper focus management

## Best Practices

### Do's ✅

- Use clear, action-oriented labels
- Group related items with separators
- Include icons for visual clarity
- Show keyboard shortcuts
- Keep menus concise
- Test keyboard navigation

### Don'ts ❌

- Don't nest too many levels deep
- Don't use for navigation (use Navigation Menu)
- Don't put forms inside menus
- Don't auto-close on hover out
- Don't use for few items (use buttons)

## Use Cases

- **User menus**: Account and profile options
- **Context menus**: Right-click actions
- **Action menus**: Bulk actions on items
- **Settings menus**: Quick settings access
- **File menus**: File operations
- **View options**: Toggle view settings

## Related Components

- [Context Menu](/docs/components/context-menu) - For right-click menus
- [Navigation Menu](/docs/components/navigation-menu) - For site navigation
- [Popover](/docs/components/popover) - For rich content
- [Select](/docs/components/select) - For form selections
