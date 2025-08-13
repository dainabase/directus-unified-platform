---
id: alert-dialog
title: AlertDialog
sidebar_position: 3
---

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@dainabase/ui';

# AlertDialog

A modal dialog that interrupts the user with important content and expects a response. Used for confirmations, warnings, and critical decisions.

## Preview

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete Account</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete your
        account and remove your data from our servers.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

## Features

- **Modal Behavior**: Blocks interaction with the rest of the app
- **Focus Management**: Traps focus within dialog
- **Keyboard Support**: Escape to cancel, Enter to confirm
- **Accessible**: Full ARIA support and screen reader compatible
- **Customizable Actions**: Flexible button configurations
- **Controlled/Uncontrolled**: Works in both modes
- **Animation**: Smooth open/close transitions
- **Backdrop**: Dims background content
- **Critical Actions**: Perfect for destructive operations

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@dainabase/ui';

export default function AlertDialogDemo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>Open</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

## Examples

### Basic Confirmation

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button>Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Item</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to delete this item? This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Destructive Action

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">
      <Trash className="mr-2 h-4 w-4" />
      Delete Account
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Account</AlertDialogTitle>
      <AlertDialogDescription>
        This will permanently delete your account and all associated data.
        This action is irreversible.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <div className="my-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
      <p className="text-sm text-destructive">
        <strong>Warning:</strong> All your data will be permanently removed.
        This includes:
      </p>
      <ul className="mt-2 text-sm text-destructive list-disc list-inside">
        <li>Profile information</li>
        <li>Saved preferences</li>
        <li>Transaction history</li>
        <li>Connected services</li>
      </ul>
    </div>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
        Delete My Account
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Save Changes Dialog

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="ghost">
      <X className="h-4 w-4" />
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Save changes?</AlertDialogTitle>
      <AlertDialogDescription>
        You have unsaved changes. Do you want to save them before leaving?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter className="sm:space-x-2">
      <AlertDialogCancel asChild>
        <Button variant="destructive">Don't Save</Button>
      </AlertDialogCancel>
      <AlertDialogCancel asChild>
        <Button variant="outline">Cancel</Button>
      </AlertDialogCancel>
      <AlertDialogAction>Save Changes</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Controlled Dialog

```tsx
function ControlledAlertDialog() {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    // Perform delete action
    console.log("Item deleted");
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Delete Item</Button>
      
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

### With Form Input

```tsx
function DeleteWithConfirmation() {
  const [confirmText, setConfirmText] = useState("");
  const expectedText = "DELETE";
  const isValid = confirmText === expectedText;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Project</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently delete the project and all its data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4 space-y-2">
          <Label htmlFor="confirm">
            Type <strong>{expectedText}</strong> to confirm:
          </Label>
          <Input
            id="confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            disabled={!isValid}
            className="bg-destructive text-destructive-foreground"
          >
            Delete Project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### Logout Confirmation

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="outline">
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Logout</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to logout? You'll need to sign in again to access your account.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Stay Logged In</AlertDialogCancel>
      <AlertDialogAction>Logout</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Subscription Cancellation

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="outline" className="text-destructive">
      Cancel Subscription
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to cancel your Pro subscription?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <div className="my-4 space-y-3">
      <p className="text-sm text-muted-foreground">
        You will lose access to:
      </p>
      <ul className="space-y-2 text-sm">
        <li className="flex items-center gap-2">
          <X className="h-4 w-4 text-destructive" />
          Unlimited projects
        </li>
        <li className="flex items-center gap-2">
          <X className="h-4 w-4 text-destructive" />
          Advanced analytics
        </li>
        <li className="flex items-center gap-2">
          <X className="h-4 w-4 text-destructive" />
          Priority support
        </li>
      </ul>
      <p className="text-sm text-muted-foreground">
        Your subscription will remain active until the end of the billing period.
      </p>
    </div>
    <AlertDialogFooter>
      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
      <AlertDialogAction className="bg-destructive text-destructive-foreground">
        Cancel Subscription
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Permission Request

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button>
      <Camera className="mr-2 h-4 w-4" />
      Take Photo
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Camera Permission Required</AlertDialogTitle>
      <AlertDialogDescription>
        This app needs access to your camera to take photos. 
        Would you like to grant permission?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <div className="my-4 p-4 bg-muted rounded-lg">
      <p className="text-sm">
        We will only use your camera when you explicitly choose to take a photo.
        You can revoke this permission at any time in your settings.
      </p>
    </div>
    <AlertDialogFooter>
      <AlertDialogCancel>Deny</AlertDialogCancel>
      <AlertDialogAction>Allow Access</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Error Recovery

```tsx
function ErrorDialog({ error, onRetry, onCancel }) {
  return (
    <AlertDialog open={!!error}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Operation Failed
            </div>
          </AlertDialogTitle>
          <AlertDialogDescription>
            {error?.message || "An unexpected error occurred. Please try again."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4 p-3 bg-destructive/10 rounded">
          <p className="text-xs font-mono text-destructive">
            Error Code: {error?.code || "UNKNOWN"}
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onRetry}>Retry</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### Terms Acceptance

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button>Continue to Checkout</Button>
  </AlertDialogTrigger>
  <AlertDialogContent className="max-w-2xl">
    <AlertDialogHeader>
      <AlertDialogTitle>Terms and Conditions</AlertDialogTitle>
      <AlertDialogDescription>
        Please review and accept our terms before proceeding.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <ScrollArea className="h-[300px] my-4 rounded border p-4">
      <div className="space-y-4 text-sm">
        <h4 className="font-medium">1. Terms of Service</h4>
        <p>Lorem ipsum dolor sit amet...</p>
        <h4 className="font-medium">2. Privacy Policy</h4>
        <p>Lorem ipsum dolor sit amet...</p>
        <h4 className="font-medium">3. Refund Policy</h4>
        <p>Lorem ipsum dolor sit amet...</p>
      </div>
    </ScrollArea>
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <label htmlFor="terms" className="text-sm">
        I agree to the terms and conditions
      </label>
    </div>
    <AlertDialogFooter>
      <AlertDialogCancel>Decline</AlertDialogCancel>
      <AlertDialogAction>Accept & Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## API Reference

### AlertDialog

The root component that provides context.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Default open state |
| `onOpenChange` | `(open: boolean) => void` | - | Callback when open state changes |

### AlertDialogTrigger

The button that opens the dialog.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Merge props with child element |
| `children` | `ReactNode` | - | Trigger element |

### AlertDialogContent

The dialog container.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void` | - | Handle escape key |
| `onPointerDownOutside` | `(event: PointerEvent) => void` | - | Handle outside clicks |

### AlertDialogHeader

Container for title and description.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Header content |

### AlertDialogTitle

The dialog title.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Title text |

### AlertDialogDescription

The dialog description.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Description text |

### AlertDialogFooter

Container for action buttons.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Footer content |

### AlertDialogAction

Primary action button.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `onClick` | `(event: MouseEvent) => void` | - | Click handler |
| `disabled` | `boolean` | `false` | Disable button |

### AlertDialogCancel

Cancel action button.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `onClick` | `(event: MouseEvent) => void` | - | Click handler |

## Accessibility

The AlertDialog follows WAI-ARIA guidelines:

- **Focus Management**: Focus trapped within dialog
- **Keyboard Support**:
  - `Escape`: Closes dialog (cancel action)
  - `Enter`: Confirms action when button focused
  - `Tab`: Cycles through focusable elements
- **ARIA Attributes**: Proper roles and labels
- **Screen Readers**: Announces dialog content
- **Modal Behavior**: Prevents interaction with background

## Best Practices

### Do's ✅

- Use for destructive or irreversible actions
- Provide clear, concise descriptions
- Use descriptive button labels
- Consider adding confirmation inputs for critical actions
- Test keyboard navigation
- Include warning messages for destructive actions

### Don'ts ❌

- Don't use for non-critical confirmations
- Don't include too much content
- Don't auto-open on page load
- Don't nest dialogs
- Don't use for regular forms (use Dialog instead)
- Don't dismiss automatically

## Use Cases

- **Delete Confirmations**: Confirm before deleting data
- **Logout Warnings**: Confirm before logging out
- **Save Reminders**: Remind about unsaved changes
- **Subscription Changes**: Confirm plan changes
- **Permission Requests**: Request system permissions
- **Error Handling**: Display critical errors
- **Terms Acceptance**: Accept terms and conditions
- **Destructive Actions**: Any irreversible operation

## Related Components

- [Dialog](./dialog) - For general modal dialogs
- [Alert](./alert) - For inline alerts
- [Toast](./toast) - For temporary notifications
- [Sheet](./sheet) - For slide-in panels
- [Popover](./popover) - For non-modal overlays