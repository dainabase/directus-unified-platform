---
id: tooltip
title: Tooltip
sidebar_position: 42
---

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@dainabase/ui';

# Tooltip

A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.

## Preview

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover over me</TooltipTrigger>
    <TooltipContent>
      <p>This is a helpful tooltip</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

## Features

- **Accessible**: Follows WAI-ARIA Tooltip pattern
- **Customizable Delay**: Control show/hide timing
- **Positioning**: Automatic positioning with collision detection
- **Keyboard Support**: Shows on focus, hides on Escape
- **Portal Rendering**: Renders in portal to avoid z-index issues
- **Side & Alignment**: Multiple positioning options
- **Skip Delay**: Instant show when moving between tooltips
- **Touch Support**: Proper handling for touch devices
- **Arrow Support**: Optional arrow pointing to trigger

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@dainabase/ui';

export default function TooltipDemo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>
          <p>Tooltip content</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

## Examples

### Basic Tooltip

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover for info</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>This action cannot be undone</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### With Custom Delay

```tsx
<TooltipProvider delayDuration={200}>
  <Tooltip>
    <TooltipTrigger asChild>
      <InfoIcon className="h-4 w-4" />
    </TooltipTrigger>
    <TooltipContent>
      <p>Shows after 200ms</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Different Positions

```tsx
<TooltipProvider>
  <div className="flex gap-4">
    <Tooltip>
      <TooltipTrigger asChild>
        <Button>Top</Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>Tooltip on top</p>
      </TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger asChild>
        <Button>Right</Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>Tooltip on right</p>
      </TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger asChild>
        <Button>Bottom</Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>Tooltip on bottom</p>
      </TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger asChild>
        <Button>Left</Button>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>Tooltip on left</p>
      </TooltipContent>
    </Tooltip>
  </div>
</TooltipProvider>
```

### With Arrow

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">With Arrow</Button>
    </TooltipTrigger>
    <TooltipContent className="flex items-center gap-2">
      <InfoIcon className="h-4 w-4" />
      <p>Tooltip with arrow indicator</p>
      <TooltipArrow />
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Icon Buttons with Tooltips

```tsx
import { Bold, Italic, Underline, Link } from 'lucide-react';

<TooltipProvider>
  <div className="flex gap-2">
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon">
          <Bold className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Bold (Ctrl+B)</p>
      </TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon">
          <Italic className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Italic (Ctrl+I)</p>
      </TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon">
          <Underline className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Underline (Ctrl+U)</p>
      </TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon">
          <Link className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Insert Link (Ctrl+K)</p>
      </TooltipContent>
    </Tooltip>
  </div>
</TooltipProvider>
```

### Form Field Tooltips

```tsx
<Form>
  <FormField>
    <div className="flex items-center gap-2">
      <Label htmlFor="password">Password</Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Password must contain:</p>
            <ul className="mt-2 text-xs">
              <li>• At least 8 characters</li>
              <li>• One uppercase letter</li>
              <li>• One number</li>
              <li>• One special character</li>
            </ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    <Input id="password" type="password" />
  </FormField>
</Form>
```

### Disabled Element Tooltip

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <span tabIndex={0}>
        <Button disabled>
          Disabled Action
        </Button>
      </span>
    </TooltipTrigger>
    <TooltipContent>
      <p>This action requires admin privileges</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Rich Content Tooltip

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Avatar>
        <AvatarImage src="/user.jpg" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    </TooltipTrigger>
    <TooltipContent className="p-0">
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/user.jpg" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">John Doe</p>
            <p className="text-sm text-muted-foreground">john@example.com</p>
          </div>
        </div>
        <div className="flex gap-2 text-xs">
          <Badge>Pro User</Badge>
          <Badge variant="outline">Online</Badge>
        </div>
      </div>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Controlled Tooltip

```tsx
function ControlledTooltip() {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <Button 
            variant="outline"
            onClick={() => setOpen(!open)}
          >
            Click or Hover
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Controlled tooltip (open: {open.toString()})</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

### Status Indicators

```tsx
<TooltipProvider>
  <div className="flex gap-4">
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="h-3 w-3 rounded-full bg-green-500" />
      </TooltipTrigger>
      <TooltipContent>
        <p>System Operational</p>
      </TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger asChild>
        <div className="h-3 w-3 rounded-full bg-yellow-500" />
      </TooltipTrigger>
      <TooltipContent>
        <p>Partial Outage</p>
      </TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger asChild>
        <div className="h-3 w-3 rounded-full bg-red-500" />
      </TooltipTrigger>
      <TooltipContent>
        <p>Major Incident</p>
      </TooltipContent>
    </Tooltip>
  </div>
</TooltipProvider>
```

## API Reference

### TooltipProvider

Wraps your app to provide global tooltip configuration.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `delayDuration` | `number` | `700` | Delay in ms before tooltip shows |
| `skipDelayDuration` | `number` | `300` | Delay when moving between tooltips |
| `disableHoverableContent` | `boolean` | `false` | Prevent tooltip hover interaction |
| `children` | `ReactNode` | - | Child components |

### Tooltip

The root component that contains all tooltip parts.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Default open state (uncontrolled) |
| `onOpenChange` | `(open: boolean) => void` | - | Callback for open state changes |
| `delayDuration` | `number` | - | Override provider delay |

### TooltipTrigger

The element that triggers the tooltip.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Merge props with child element |
| `children` | `ReactNode` | - | Trigger element |

### TooltipContent

The component that pops out when the tooltip is open.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | Preferred side |
| `sideOffset` | `number` | `4` | Distance from trigger |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Alignment relative to trigger |
| `alignOffset` | `number` | `0` | Offset from alignment |
| `avoidCollisions` | `boolean` | `true` | Avoid viewport edges |
| `collisionPadding` | `number` | `8` | Padding from viewport edges |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Tooltip content |

## Accessibility

The Tooltip component follows WAI-ARIA guidelines:

- **Keyboard Navigation**:
  - Shows on focus of trigger element
  - Hides on `Escape` key press
  - Hides when trigger loses focus
- **Screen Readers**: Content is announced when tooltip appears
- **ARIA Attributes**: Uses `role="tooltip"` and proper `aria-describedby`
- **Focus Management**: Does not steal focus from trigger
- **Touch Devices**: Alternative interaction for mobile

## Best Practices

### Do's ✅

- Keep tooltip content concise (1-2 short sentences)
- Use for supplementary information only
- Provide keyboard accessibility
- Use consistent positioning throughout the app
- Include keyboard shortcuts in tooltips for actions
- Test on mobile devices

### Don'ts ❌

- Don't put essential information only in tooltips
- Don't include interactive elements in tooltip content
- Don't use for error messages (use form validation instead)
- Don't make tooltips too wide (max ~250px recommended)
- Don't use tooltips on mobile-primary interfaces
- Don't nest tooltips within tooltips

## Use Cases

- **Icon Buttons**: Explain icon-only button functions
- **Form Fields**: Provide input format hints or requirements
- **Truncated Text**: Show full text for truncated content
- **Status Indicators**: Explain status dots or badges
- **Keyboard Shortcuts**: Display keyboard shortcut hints
- **Feature Discovery**: Highlight new or pro features
- **Data Points**: Show additional data on hover (charts, tables)

## Related Components

- [Popover](./popover) - For interactive floating content
- [HoverCard](./hover-card) - For rich preview content
- [Dialog](./dialog) - For modal interactions
- [ContextMenu](./context-menu) - For right-click menus
- [Button](./button) - Often used with icon button tooltips