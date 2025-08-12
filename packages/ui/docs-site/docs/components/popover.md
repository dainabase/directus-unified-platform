---
id: popover
title: Popover
sidebar_position: 18
---

import { Popover, PopoverTrigger, PopoverContent } from '@dainabase/ui';

# Popover

Displays rich content in a portal, triggered by a button.

<div className="component-preview">
  <Popover>
    <PopoverTrigger asChild>
      <button className="px-4 py-2 border rounded">Open Popover</button>
    </PopoverTrigger>
    <PopoverContent>
      <div className="space-y-2">
        <h4 className="font-medium">Popover Title</h4>
        <p className="text-sm text-muted-foreground">
          This is a popover with rich content.
        </p>
      </div>
    </PopoverContent>
  </Popover>
</div>

## Features

- **Rich Content**: Support for any React content
- **Positioning**: Smart positioning with collision detection
- **Portal Rendering**: Avoids z-index issues
- **Keyboard Support**: Escape to close, focus management
- **Customizable**: Full control over styling
- **Accessible**: ARIA compliant

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import { Popover, PopoverContent, PopoverTrigger } from '@dainabase/ui';

export function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent>
        Place content here.
      </PopoverContent>
    </Popover>
  );
}
```

## Examples

### Basic Popover

```jsx live
function BasicPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="px-4 py-2 border rounded hover:bg-accent">
          Click me
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="width">Width</label>
              <input
                id="width"
                defaultValue="100%"
                className="col-span-2 h-8 px-2 border rounded"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="height">Height</label>
              <input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8 px-2 border rounded"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### Form in Popover

```jsx live
function FormPopover() {
  const [open, setOpen] = React.useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setOpen(false);
    alert('Settings saved!');
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="px-4 py-2 border rounded">
          Settings
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Preferences</h4>
            <p className="text-sm text-muted-foreground">
              Update your preferences here.
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Display Name
              </label>
              <input
                id="name"
                placeholder="Enter your name"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="notifications" />
              <label htmlFor="notifications" className="text-sm">
                Send me notifications
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-primary text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
```

### Color Picker Popover

```jsx live
function ColorPickerPopover() {
  const [color, setColor] = React.useState("#3b82f6");
  
  const colors = [
    "#ef4444", "#f97316", "#f59e0b", "#eab308",
    "#84cc16", "#22c55e", "#10b981", "#14b8a6",
    "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
    "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
    "#f43f5e", "#64748b", "#475569", "#1e293b"
  ];
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 border rounded">
          <div 
            className="w-4 h-4 rounded border"
            style={{ backgroundColor: color }}
          />
          <span>Choose Color</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Pick a color</h4>
          <div className="grid grid-cols-5 gap-2">
            {colors.map((c) => (
              <button
                key={c}
                className={`w-10 h-10 rounded border-2 ${
                  color === c ? "border-primary" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-full"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="px-2 border rounded flex-1"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### User Info Popover

```jsx live
function UserInfoPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/dainabase.png" />
            <AvatarFallback>DA</AvatarFallback>
          </Avatar>
          <span>@dainabase</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="https://github.com/dainabase.png" />
            <AvatarFallback>DA</AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-semibold">Dainabase</h4>
            <p className="text-sm text-muted-foreground">
              Building amazing UI components
            </p>
            <div className="flex items-center pt-2 text-xs text-muted-foreground">
              <CalendarIcon className="mr-2 h-3 w-3" />
              Joined December 2024
            </div>
            <div className="flex gap-4 pt-3">
              <div>
                <div className="text-xs text-muted-foreground">Following</div>
                <div className="text-sm font-medium">230</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Followers</div>
                <div className="text-sm font-medium">1.2K</div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### Position Examples

```jsx live
function PopoverPositions() {
  return (
    <div className="flex gap-4 flex-wrap">
      <Popover>
        <PopoverTrigger asChild>
          <button className="px-3 py-1 border rounded text-sm">Top</button>
        </PopoverTrigger>
        <PopoverContent side="top">
          <p className="text-sm">I'm on top!</p>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <button className="px-3 py-1 border rounded text-sm">Right</button>
        </PopoverTrigger>
        <PopoverContent side="right">
          <p className="text-sm">I'm on the right!</p>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <button className="px-3 py-1 border rounded text-sm">Bottom</button>
        </PopoverTrigger>
        <PopoverContent side="bottom">
          <p className="text-sm">I'm on bottom!</p>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <button className="px-3 py-1 border rounded text-sm">Left</button>
        </PopoverTrigger>
        <PopoverContent side="left">
          <p className="text-sm">I'm on the left!</p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

### Search Popover

```jsx live
function SearchPopover() {
  const [search, setSearch] = React.useState("");
  const [recent] = React.useState([
    "React components",
    "TypeScript tutorial",
    "CSS Grid layout",
    "JavaScript async"
  ]);
  
  const filtered = recent.filter(item => 
    item.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 border rounded">
          <SearchIcon className="h-4 w-4" />
          Search
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="flex items-center border-b px-3">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input
            className="flex-1 px-2 py-3 text-sm outline-none"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="max-h-64 overflow-auto">
          {filtered.length > 0 ? (
            <>
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                Recent Searches
              </div>
              {filtered.map((item) => (
                <button
                  key={item}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-accent"
                >
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-3 w-3 text-muted-foreground" />
                    {item}
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No results found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

## API Reference

### Popover Props

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
        <td><code>false</code></td>
        <td>Modal behavior (traps focus)</td>
      </tr>
    </tbody>
  </table>
</div>

### PopoverContent Props

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
        <td><code>side</code></td>
        <td><code>'top' | 'right' | 'bottom' | 'left'</code></td>
        <td><code>'bottom'</code></td>
        <td>Preferred side</td>
      </tr>
      <tr>
        <td><code>align</code></td>
        <td><code>'start' | 'center' | 'end'</code></td>
        <td><code>'center'</code></td>
        <td>Alignment on the side</td>
      </tr>
      <tr>
        <td><code>sideOffset</code></td>
        <td><code>number</code></td>
        <td><code>4</code></td>
        <td>Distance from trigger</td>
      </tr>
      <tr>
        <td><code>alignOffset</code></td>
        <td><code>number</code></td>
        <td><code>0</code></td>
        <td>Offset along the alignment</td>
      </tr>
      <tr>
        <td><code>avoidCollisions</code></td>
        <td><code>boolean</code></td>
        <td><code>true</code></td>
        <td>Avoid viewport edges</td>
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

The Popover component ensures accessibility:
- Focus management when opening/closing
- Escape key closes the popover
- Click outside to close
- `aria-haspopup` on trigger
- `aria-expanded` indicates state
- Proper ARIA roles
- Screen reader announcements

## Best Practices

### Do's ✅

- Use for rich interactive content
- Keep content focused and relevant
- Provide clear triggers
- Test positioning in different viewports
- Include close actions for forms
- Consider mobile touch interactions

### Don'ts ❌

- Don't use for simple tooltips (use Tooltip)
- Don't auto-open on hover
- Don't nest popovers
- Don't put critical actions only in popovers
- Don't make too wide (consider Dialog)

## Use Cases

- **Forms**: Quick edit forms and settings
- **Pickers**: Color, date, or emoji pickers
- **Information**: User cards or product details
- **Search**: Search interfaces with results
- **Filters**: Advanced filter options
- **Previews**: Content previews
- **Menus**: Rich menus with custom content

## Related Components

- [Tooltip](/docs/components/tooltip) - For simple hover text
- [Dialog](/docs/components/dialog) - For modal interactions
- [Dropdown Menu](/docs/components/dropdown-menu) - For action menus
- [Hover Card](/docs/components/hover-card) - For hover previews
