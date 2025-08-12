---
id: dialog
title: Dialog
sidebar_position: 4
---

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@dainabase/ui';

# Dialog

A modal window that appears on top of the main content, used for important interactions that require user attention.

<div className="component-preview">
  <Dialog>
    <DialogTrigger asChild>
      <button>Open Dialog</button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogDescription>
          This action cannot be undone. This will permanently delete your account.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <button>Cancel</button>
        <button>Continue</button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</div>

## Features

- **Accessible**: Full keyboard navigation and screen reader support
- **Focus Management**: Traps focus within dialog when open
- **Customizable**: Fully styled with Tailwind CSS
- **Portal Rendering**: Renders in a portal to avoid z-index issues
- **Animation**: Smooth open/close transitions
- **Responsive**: Adapts to mobile and desktop screens

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@dainabase/ui';

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button>Edit Profile</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <input placeholder="Name" />
          <input placeholder="Email" />
        </div>
        <DialogFooter>
          <button type="submit">Save changes</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Examples

### Basic Dialog

```jsx live
function BasicDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="px-4 py-2 bg-blue-500 text-white rounded">
          Open Dialog
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome!</DialogTitle>
          <DialogDescription>
            This is a simple dialog example.
          </DialogDescription>
        </DialogHeader>
        <p>Dialog content goes here...</p>
      </DialogContent>
    </Dialog>
  );
}
```

### Confirmation Dialog

```jsx live
function ConfirmationDialog() {
  const [open, setOpen] = React.useState(false);
  
  const handleConfirm = () => {
    alert('Confirmed!');
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="px-4 py-2 bg-red-500 text-white rounded">
          Delete Item
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            item and remove all associated data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button 
            className="px-4 py-2 border rounded"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={handleConfirm}
          >
            Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Form Dialog

```jsx live
function FormDialog() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    message: ''
  });
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="px-4 py-2 bg-green-500 text-white rounded">
          Contact Us
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contact Form</DialogTitle>
          <DialogDescription>
            Fill out the form below and we'll get back to you soon.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              placeholder="John Doe"
              className="px-3 py-2 border rounded"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="john@example.com"
              className="px-3 py-2 border rounded"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              placeholder="Your message..."
              className="px-3 py-2 border rounded"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => alert('Form submitted!')}
          >
            Send Message
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Custom Styled Dialog

```jsx live
function CustomDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
          Open Custom Dialog
        </button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <DialogHeader>
          <DialogTitle className="text-purple-900">
            ✨ Premium Feature
          </DialogTitle>
          <DialogDescription className="text-purple-700">
            Unlock amazing features with our premium plan.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>Unlimited projects</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>Priority support</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>Advanced analytics</span>
          </div>
        </div>
        <DialogFooter>
          <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
            Upgrade Now
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## API Reference

### Dialog Props

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
        <td><code>false</code></td>
        <td>Controls the open state of the dialog</td>
      </tr>
      <tr>
        <td><code>onOpenChange</code></td>
        <td><code>(open: boolean) => void</code></td>
        <td><code>undefined</code></td>
        <td>Callback when the open state changes</td>
      </tr>
      <tr>
        <td><code>modal</code></td>
        <td><code>boolean</code></td>
        <td><code>true</code></td>
        <td>Whether the dialog should be modal</td>
      </tr>
      <tr>
        <td><code>defaultOpen</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>The initial open state when uncontrolled</td>
      </tr>
    </tbody>
  </table>
</div>

### DialogContent Props

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
        <td><code>className</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>Additional CSS classes</td>
      </tr>
      <tr>
        <td><code>onCloseAutoFocus</code></td>
        <td><code>(e: Event) => void</code></td>
        <td><code>undefined</code></td>
        <td>Callback when focus returns to trigger</td>
      </tr>
      <tr>
        <td><code>onEscapeKeyDown</code></td>
        <td><code>(e: KeyboardEvent) => void</code></td>
        <td><code>undefined</code></td>
        <td>Callback when escape key is pressed</td>
      </tr>
      <tr>
        <td><code>onPointerDownOutside</code></td>
        <td><code>(e: PointerEvent) => void</code></td>
        <td><code>undefined</code></td>
        <td>Callback when clicking outside</td>
      </tr>
    </tbody>
  </table>
</div>

## Accessibility

The Dialog component follows WAI-ARIA Dialog pattern and includes:

- **Focus Management**: Focus is trapped within the dialog when open
- **Keyboard Navigation**: 
  - `Escape` - Closes the dialog
  - `Tab` - Cycles through focusable elements
  - `Shift + Tab` - Cycles backwards
- **Screen Reader Support**: Proper ARIA attributes for announcements
- **Portal Rendering**: Ensures proper stacking context

## Best Practices

### Do's ✅

- Use clear and descriptive titles
- Provide a description for complex dialogs
- Include clear action buttons
- Handle escape key and outside clicks appropriately
- Ensure the trigger is keyboard accessible
- Test with screen readers

### Don'ts ❌

- Don't use for non-critical information
- Don't auto-open dialogs without user action
- Don't nest multiple dialogs
- Don't forget to handle the close action
- Don't make dialogs too large on mobile

## Related Components

- [Alert Dialog](/docs/components/alert-dialog) - For confirmation dialogs
- [Sheet](/docs/components/sheet) - For slide-in panels
- [Popover](/docs/components/popover) - For non-modal overlays
- [Drawer](/docs/components/drawer) - For navigation panels