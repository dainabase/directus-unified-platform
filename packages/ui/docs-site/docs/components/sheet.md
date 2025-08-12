---
id: sheet
title: Sheet
sidebar_position: 36
---

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '@dainabase/ui';

# Sheet

Extends the Dialog component to display content that complements the main content of the screen. Slides in from the edge of the screen.

## Preview

<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Open Sheet</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Edit Profile</SheetTitle>
      <SheetDescription>
        Make changes to your profile here. Click save when you're done.
      </SheetDescription>
    </SheetHeader>
    <div className="py-4">
      {/* Content */}
    </div>
    <SheetFooter>
      <SheetClose asChild>
        <Button type="submit">Save changes</Button>
      </SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>

## Features

- **Multiple Positions**: Slide in from top, right, bottom, or left
- **Responsive**: Adapts to mobile and desktop layouts
- **Accessible**: Full keyboard navigation and screen reader support
- **Backdrop**: Optional backdrop with customizable opacity
- **Controlled/Uncontrolled**: Works in both modes
- **Smooth Animations**: Customizable slide and fade animations
- **Focus Management**: Traps focus within sheet when open
- **Scroll Lock**: Prevents body scroll when open
- **Custom Sizes**: Predefined sizes or custom widths

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@dainabase/ui';

export default function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger>Open</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Are you sure?</SheetTitle>
          <SheetDescription>
            This action cannot be undone.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
```

## Examples

### Basic Sheet

```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Open Sheet</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Sheet Title</SheetTitle>
      <SheetDescription>
        Sheet description goes here.
      </SheetDescription>
    </SheetHeader>
    <div className="py-4">
      <p>Your content here</p>
    </div>
  </SheetContent>
</Sheet>
```

### Different Positions

```tsx
function SheetPositions() {
  return (
    <div className="flex gap-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Right</Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Right Sheet</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Left</Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Left Sheet</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Top</Button>
        </SheetTrigger>
        <SheetContent side="top">
          <SheetHeader>
            <SheetTitle>Top Sheet</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Bottom</Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Bottom Sheet</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}
```

### Form in Sheet

```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button>Edit Profile</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Edit profile</SheetTitle>
      <SheetDescription>
        Make changes to your profile here. Click save when you're done.
      </SheetDescription>
    </SheetHeader>
    <Form className="space-y-4 py-4">
      <FormField>
        <Label htmlFor="name">Name</Label>
        <Input id="name" value="John Doe" />
      </FormField>
      <FormField>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value="john@example.com" />
      </FormField>
      <FormField>
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" placeholder="Tell us about yourself" />
      </FormField>
    </Form>
    <SheetFooter>
      <SheetClose asChild>
        <Button variant="outline">Cancel</Button>
      </SheetClose>
      <Button type="submit">Save changes</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

### Shopping Cart Sheet

```tsx
function ShoppingCartSheet() {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Product 1', price: 29.99, quantity: 2 },
    { id: 2, name: 'Product 2', price: 49.99, quantity: 1 },
    { id: 3, name: 'Product 3', price: 19.99, quantity: 3 },
  ]);

  const total = cartItems.reduce((sum, item) => 
    sum + item.price * item.quantity, 0
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <ShoppingCart className="h-4 w-4" />
          <span className="sr-only">Open cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({cartItems.length})</SheetTitle>
          <SheetDescription>
            Review your items before checkout
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-8 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded bg-muted" />
              <div className="flex-1">
                <h4 className="font-semibold">{item.name}</h4>
                <p className="text-sm text-muted-foreground">
                  ${item.price} × {item.quantity}
                </p>
              </div>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-8 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>$5.00</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${(total + 5).toFixed(2)}</span>
          </div>
        </div>
        
        <SheetFooter className="mt-8">
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </SheetClose>
          <Button className="w-full">
            Checkout
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

### Settings Sheet

```tsx
function SettingsSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px]">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Manage your application preferences
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Appearance</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme">Dark mode</Label>
              <Switch id="theme" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="compact">Compact view</Label>
              <Switch id="compact" />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="font-medium">Notifications</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notif">Email notifications</Label>
              <Switch id="email-notif" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notif">Push notifications</Label>
              <Switch id="push-notif" />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="font-medium">Privacy</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="analytics">Analytics</Label>
              <Switch id="analytics" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="marketing">Marketing emails</Label>
              <Switch id="marketing" />
            </div>
          </div>
        </div>
        
        <SheetFooter>
          <Button variant="outline">Reset to defaults</Button>
          <Button>Save preferences</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

### Mobile Navigation Sheet

```tsx
function MobileNavSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="mt-6">
          <ul className="space-y-3">
            <li>
              <a href="#" className="block py-2 hover:text-primary">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="block py-2 hover:text-primary">
                Products
              </a>
            </li>
            <li>
              <a href="#" className="block py-2 hover:text-primary">
                About
              </a>
            </li>
            <li>
              <a href="#" className="block py-2 hover:text-primary">
                Contact
              </a>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Button className="w-full">Sign In</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

### Controlled Sheet

```tsx
function ControlledSheet() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Sheet</Button>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Controlled Sheet</SheetTitle>
            <SheetDescription>
              This sheet is controlled by state
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <p>Sheet is {open ? 'open' : 'closed'}</p>
            <Button onClick={() => setOpen(false)}>
              Close programmatically
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
```

### Custom Sizes

```tsx
function CustomSizeSheets() {
  return (
    <div className="flex gap-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Small</Button>
        </SheetTrigger>
        <SheetContent className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Small Sheet</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Medium</Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[500px]">
          <SheetHeader>
            <SheetTitle>Medium Sheet</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Large</Button>
        </SheetTrigger>
        <SheetContent className="w-[500px] sm:w-[700px]">
          <SheetHeader>
            <SheetTitle>Large Sheet</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Full</Button>
        </SheetTrigger>
        <SheetContent className="w-full">
          <SheetHeader>
            <SheetTitle>Full Width Sheet</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}
```

### Scrollable Content

```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button>Long Content</Button>
  </SheetTrigger>
  <SheetContent className="overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Terms of Service</SheetTitle>
      <SheetDescription>
        Please read our terms carefully
      </SheetDescription>
    </SheetHeader>
    <div className="py-4 space-y-4">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i}>
          <h3 className="font-semibold">Section {i + 1}</h3>
          <p className="text-sm text-muted-foreground">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      ))}
    </div>
    <SheetFooter>
      <Button variant="outline">Decline</Button>
      <Button>Accept</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

## API Reference

### Sheet

The root component that provides context.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Default open state (uncontrolled) |
| `onOpenChange` | `(open: boolean) => void` | - | Callback when open state changes |
| `modal` | `boolean` | `true` | Whether to render as modal |

### SheetTrigger

The button that opens the sheet.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Merge props with child element |
| `children` | `ReactNode` | - | Trigger element |

### SheetContent

The sheet panel that slides in.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'right'` | Side to slide from |
| `className` | `string` | - | Additional CSS classes |
| `onInteractOutside` | `(event: Event) => void` | - | Handle outside interactions |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void` | - | Handle escape key |

### SheetHeader

Container for the sheet header content.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Header content |

### SheetTitle

The sheet title component.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Title text |

### SheetDescription

The sheet description component.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Description text |

### SheetFooter

Container for sheet footer actions.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Footer content |

### SheetClose

A button that closes the sheet.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Merge props with child element |
| `children` | `ReactNode` | - | Close button content |

## Accessibility

The Sheet component follows WAI-ARIA dialog pattern:

- **Focus Management**: Focus trapped within sheet when open
- **Keyboard Navigation**:
  - `Escape`: Closes the sheet
  - `Tab`: Cycles through focusable elements
  - `Shift + Tab`: Reverse cycle
- **ARIA Attributes**: Proper roles and labels
- **Screen Readers**: Announces sheet content
- **Backdrop Click**: Closes sheet (configurable)

## Best Practices

### Do's ✅

- Use for secondary tasks and information
- Keep content focused and relevant
- Provide clear close actions
- Use appropriate sizes for content
- Test on mobile devices
- Include proper headers and descriptions

### Don'ts ❌

- Don't use for critical alerts (use AlertDialog)
- Don't nest sheets within sheets
- Don't make sheets too wide on mobile
- Don't auto-open sheets on page load
- Don't put primary navigation in sheets on desktop
- Don't forget to handle long content with scroll

## Use Cases

- **Mobile Navigation**: Off-canvas menu for mobile
- **Settings Panels**: App configuration options
- **Shopping Carts**: E-commerce cart review
- **Filters**: Product or content filters
- **Quick Forms**: Contact forms, feedback
- **Detail Views**: Additional information panels
- **User Profiles**: Account settings and info
- **Notifications**: Notification center

## Related Components

- [Dialog](./dialog) - For modal dialogs
- [Drawer](./drawer) - Similar sliding panel pattern
- [Popover](./popover) - For small floating panels
- [AlertDialog](./alert-dialog) - For confirmation dialogs
- [Navigation Menu](./navigation-menu) - For desktop navigation