# Dialog

A modal dialog overlay component for important user interactions, confirmations, and content display.

## Import

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@dainabase/ui/dialog';
```

## Basic Usage

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@dainabase/ui/dialog';
import { Button } from '@dainabase/ui/button';

export default function DialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Props

### Dialog
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| open | `boolean` | - | No | Controlled open state |
| defaultOpen | `boolean` | `false` | No | Default open state |
| onOpenChange | `(open: boolean) => void` | - | No | Callback when open state changes |
| modal | `boolean` | `true` | No | Modal behavior (backdrop click/escape to close) |

### DialogTrigger
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| asChild | `boolean` | `false` | No | Merge props with child element |
| children | `ReactNode` | - | Yes | Trigger element |

### DialogContent
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| className | `string` | - | No | Additional CSS classes |
| onPointerDownOutside | `(e: Event) => void` | - | No | Handle outside clicks |
| onEscapeKeyDown | `(e: Event) => void` | - | No | Handle escape key |
| onInteractOutside | `(e: Event) => void` | - | No | Handle outside interactions |

### DialogHeader, DialogFooter
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| className | `string` | - | No | Additional CSS classes |
| children | `ReactNode` | - | No | Content |

### DialogTitle
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| className | `string` | - | No | Additional CSS classes |
| children | `ReactNode` | - | Yes | Title text |

### DialogDescription
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| className | `string` | - | No | Additional CSS classes |
| children | `ReactNode` | - | Yes | Description text |

## Examples

### Controlled Dialog

```tsx
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@dainabase/ui/dialog';
import { Button } from '@dainabase/ui/button';

function ControlledDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Controlled Dialog</DialogTitle>
            <DialogDescription>
              This dialog is controlled by state.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### Confirmation Dialog

```tsx
function ConfirmationDialog() {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    // Perform delete action
    console.log('Item deleted');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Item</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Item</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this item? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Form Dialog

```tsx
import { Input } from '@dainabase/ui/input';
import { Label } from '@dainabase/ui/label';

function FormDialog() {
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Enter the details for the new user account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Information Dialog

```tsx
function InfoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View Details</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Product Information</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Description</h4>
            <p className="text-sm text-muted-foreground">
              This is a detailed description of the product with all its features
              and specifications.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Specifications</h4>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              <li>Dimension: 10 x 20 x 30 cm</li>
              <li>Weight: 500g</li>
              <li>Material: Aluminum</li>
              <li>Color: Silver</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Dialog with Custom Close

```tsx
function CustomCloseDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => {
          e.preventDefault(); // Prevent closing on outside click
        }}
      >
        <DialogHeader>
          <DialogTitle>Cannot close by clicking outside</DialogTitle>
          <DialogDescription>
            You must use the close button to dismiss this dialog.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close Dialog</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Scrollable Dialog

```tsx
function ScrollableDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>View Terms</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i}>
              <h3 className="font-medium">Section {i + 1}</h3>
              <p className="text-sm text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline">Decline</Button>
          <Button>Accept</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Nested Dialogs

```tsx
function NestedDialogs() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open First Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>First Dialog</DialogTitle>
          <DialogDescription>
            This dialog contains another dialog trigger.
          </DialogDescription>
        </DialogHeader>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Second Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Second Dialog</DialogTitle>
              <DialogDescription>
                This is a nested dialog.
              </DialogDescription>
            </DialogHeader>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
```

## Styling

### Custom Sizes

```tsx
// Small Dialog
<DialogContent className="sm:max-w-[325px]">
  {/* Content */}
</DialogContent>

// Medium Dialog (default)
<DialogContent className="sm:max-w-[425px]">
  {/* Content */}
</DialogContent>

// Large Dialog
<DialogContent className="sm:max-w-[625px]">
  {/* Content */}
</DialogContent>

// Extra Large Dialog
<DialogContent className="sm:max-w-[825px]">
  {/* Content */}
</DialogContent>

// Full Width Dialog
<DialogContent className="sm:max-w-[90vw]">
  {/* Content */}
</DialogContent>
```

## Accessibility

- **Focus Management**: Focus trapped within dialog when open
- **Keyboard Navigation**: 
  - `Escape` key closes the dialog
  - `Tab` cycles through focusable elements
  - Focus returns to trigger when closed
- **ARIA Attributes**:
  - Proper roles (`dialog`, `alertdialog`)
  - `aria-labelledby` for title association
  - `aria-describedby` for description association
- **Screen Reader Support**: Announces dialog content and state changes

## Best Practices

1. **Use for important interactions**: Don't overuse dialogs for trivial actions
2. **Keep content focused**: One primary action or decision per dialog
3. **Provide clear actions**: Label buttons clearly (avoid generic "OK")
4. **Consider alternatives**: Use inline editing or sheets for less critical actions
5. **Handle edge cases**: Loading states, errors, and validation
6. **Test keyboard navigation**: Ensure all interactive elements are accessible

## Common Use Cases

- **Confirmations**: Delete actions, important changes
- **Forms**: Quick data entry, settings
- **Information**: Help content, details, terms
- **Media**: Image galleries, video players
- **Wizards**: Multi-step processes
- **Alerts**: Important notifications

## Performance Considerations

- Use portal rendering for proper stacking context
- Lazy load heavy content within dialogs
- Clean up event listeners on unmount
- Consider virtualization for long lists in dialogs

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@dainabase/ui/dialog';
import { Button } from '@dainabase/ui/button';

describe('Dialog', () => {
  it('opens when trigger is clicked', () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const trigger = screen.getByText('Open');
    fireEvent.click(trigger);
    
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
  });
});
```

## Related Components

- [Sheet](./sheet.md)
- [AlertDialog](./alert-dialog.md)
- [Popover](./popover.md)
- [Drawer](./drawer.md)
- [Modal](./modal.md)

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>
