---
id: dialog
title: Dialog
sidebar_position: 19
---

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@dainabase/ui';

# Dialog

A modal dialog component that interrupts the user with important content and expects a response. Built on top of Radix UI Dialog primitive.

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
- **Focus Management**: Automatic focus trap and restoration
- **Customizable**: Flexible styling and positioning options
- **Portal Rendering**: Renders in a portal to avoid z-index issues
- **Controlled & Uncontrolled**: Works in both modes
- **Animation Ready**: Smooth open/close transitions
- **Responsive**: Adapts to mobile and desktop screens
- **Backdrop**: Optional backdrop with click-to-close

## Installation

```bash
npm install @dainabase/ui @radix-ui/react-dialog
```

## Usage

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@dainabase/ui';

export function BasicDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button>Open Dialog</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            Dialog description goes here.
          </DialogDescription>
        </DialogHeader>
        <p>Dialog content...</p>
        <DialogFooter>
          <button>Action</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Examples

### Basic Dialog

```jsx live
function BasicDialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="px-4 py-2 bg-blue-500 text-white rounded">
          Open Dialog
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome!</DialogTitle>
          <DialogDescription>
            This is a basic dialog example with a title and description.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>Here's some additional content in the dialog body.</p>
        </div>
        <DialogFooter>
          <button className="px-4 py-2 border rounded">Cancel</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            Continue
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Controlled Dialog

```jsx live
function ControlledDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Open Controlled Dialog
      </button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Controlled Dialog</DialogTitle>
            <DialogDescription>
              This dialog's open state is controlled programmatically.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>You can close this dialog by clicking the X or the button below.</p>
          </div>
          <DialogFooter>
            <button 
              onClick={() => setOpen(false)}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Close Dialog
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### Confirmation Dialog

```jsx live
function ConfirmationDialogExample() {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsDeleting(false);
    // Close dialog after deletion
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="px-4 py-2 bg-red-500 text-white rounded">
          Delete Account
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <button 
            className="px-4 py-2 border rounded"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Form Dialog

```jsx live
function FormDialogExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Close dialog after submission
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="px-4 py-2 bg-green-500 text-white rounded">
          Contact Us
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Contact Form</DialogTitle>
          <DialogDescription>
            Fill out the form below and we'll get back to you soon.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input 
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea 
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full p-2 border rounded"
              rows={4}
              required
            />
          </div>
          <DialogFooter>
            <button type="button" className="px-4 py-2 border rounded">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">
              Send Message
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Scrollable Dialog

```jsx live
function ScrollableDialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="px-4 py-2 bg-purple-500 text-white rounded">
          Terms & Conditions
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Terms & Conditions</DialogTitle>
          <DialogDescription>
            Please read our terms and conditions carefully.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[50vh] py-4">
          <h3 className="font-semibold mb-2">1. Introduction</h3>
          <p className="mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua.
          </p>
          
          <h3 className="font-semibold mb-2">2. User Agreement</h3>
          <p className="mb-4">
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
            ut aliquip ex ea commodo consequat.
          </p>
          
          <h3 className="font-semibold mb-2">3. Privacy Policy</h3>
          <p className="mb-4">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
            dolore eu fugiat nulla pariatur.
          </p>
          
          <h3 className="font-semibold mb-2">4. Terms of Service</h3>
          <p className="mb-4">
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum.
          </p>
          
          <h3 className="font-semibold mb-2">5. Disclaimers</h3>
          <p className="mb-4">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium.
          </p>
        </div>
        <DialogFooter>
          <button className="px-4 py-2 border rounded">Decline</button>
          <button className="px-4 py-2 bg-purple-500 text-white rounded">
            Accept Terms
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Nested Dialogs

```jsx live
function NestedDialogsExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="px-4 py-2 bg-indigo-500 text-white rounded">
          Open First Dialog
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>First Dialog</DialogTitle>
          <DialogDescription>
            This is the first dialog. You can open another dialog from here.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Dialog>
            <DialogTrigger asChild>
              <button className="px-4 py-2 bg-indigo-400 text-white rounded">
                Open Second Dialog
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Second Dialog</DialogTitle>
                <DialogDescription>
                  This is a nested dialog opened from the first one.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <button className="px-4 py-2 bg-gray-500 text-white rounded">
                  Close
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <DialogFooter>
          <button className="px-4 py-2 border rounded">Close</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## API Reference

### Dialog

The root component that provides dialog context.

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
        <td><code>onOpenChange</code></td>
        <td><code>(open: boolean) => void</code></td>
        <td><code>undefined</code></td>
        <td>Callback when open state changes</td>
      </tr>
      <tr>
        <td><code>defaultOpen</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Default open state for uncontrolled mode</td>
      </tr>
      <tr>
        <td><code>modal</code></td>
        <td><code>boolean</code></td>
        <td><code>true</code></td>
        <td>Whether to render as modal</td>
      </tr>
    </tbody>
  </table>
</div>

### DialogTrigger

The trigger element that opens the dialog.

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
        <td><code>asChild</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Render as child element</td>
      </tr>
      <tr>
        <td><code>children</code></td>
        <td><code>ReactNode</code></td>
        <td><code>undefined</code></td>
        <td>Trigger element</td>
      </tr>
    </tbody>
  </table>
</div>

### DialogContent

The main content container for the dialog.

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
        <td><code>onInteractOutside</code></td>
        <td><code>Function</code></td>
        <td><code>undefined</code></td>
        <td>Callback when clicking outside</td>
      </tr>
      <tr>
        <td><code>onEscapeKeyDown</code></td>
        <td><code>Function</code></td>
        <td><code>undefined</code></td>
        <td>Callback when pressing Escape</td>
      </tr>
      <tr>
        <td><code>showClose</code></td>
        <td><code>boolean</code></td>
        <td><code>true</code></td>
        <td>Show close button</td>
      </tr>
    </tbody>
  </table>
</div>

### DialogHeader

Container for dialog title and description.

### DialogTitle

The dialog title component.

### DialogDescription

The dialog description component.

### DialogFooter

Container for dialog action buttons.

## Accessibility

The Dialog component follows WAI-ARIA dialog pattern:

- Focus is trapped within the dialog
- Escape key closes the dialog
- Focus returns to trigger after closing
- Proper ARIA attributes (`role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`)
- Screen reader announcements
- Keyboard navigation between interactive elements

## Best Practices

### Do's ✅

- Provide clear titles and descriptions
- Use semantic HTML within dialog content
- Include a visible close button
- Handle loading states for async actions
- Test keyboard navigation
- Consider mobile viewport sizes
- Use controlled mode for complex flows

### Don'ts ❌

- Don't nest too many dialogs
- Don't auto-open dialogs on page load
- Don't disable backdrop click without good reason
- Don't make dialogs too wide on mobile
- Don't forget to handle form validation
- Don't use for non-critical information

## Common Patterns

### With Loading State

```tsx
const [isLoading, setIsLoading] = useState(false);

<Dialog>
  <DialogContent>
    {isLoading ? (
      <div className="p-8 text-center">
        <Spinner />
        <p>Loading...</p>
      </div>
    ) : (
      <>
        <DialogHeader>...</DialogHeader>
        <DialogFooter>...</DialogFooter>
      </>
    )}
  </DialogContent>
</Dialog>
```

### With Form Validation

```tsx
<Dialog>
  <DialogContent>
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>...</DialogHeader>
      <div className="space-y-4">
        {/* Form fields */}
      </div>
      <DialogFooter>
        <button type="submit" disabled={!isValid}>
          Submit
        </button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

## Styling

The Dialog component can be styled using:

- **CSS classes**: Add custom classes to any dialog part
- **CSS variables**: Override default CSS variables
- **Tailwind**: Use Tailwind utility classes
- **CSS-in-JS**: Use styled-components or emotion

```css
/* Custom dialog styles */
.dialog-content {
  --dialog-background: white;
  --dialog-border-radius: 12px;
  --dialog-padding: 24px;
  --dialog-max-width: 600px;
}
```

## Related Components

- [AlertDialog](/docs/components/alert-dialog) - For destructive actions
- [Sheet](/docs/components/sheet) - Side panel alternative
- [Popover](/docs/components/popover) - For non-modal content
- [Drawer](/docs/components/drawer) - Mobile-friendly modal
- [Toast](/docs/components/toast) - For notifications
