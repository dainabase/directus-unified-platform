# Sonner

Advanced toast notification system

## Import

```tsx
import { toast } from '@dainabase/ui/sonner';
```

## Basic Usage

```tsx
import { toast } from '@dainabase/ui/sonner';

export default function SonnerExample() {
  return (
    <button onClick={() => toast('Event has been created')}>
      Create Event
    </button>
  );
}
```

## Advanced Features

```tsx
// Promise toast
toast.promise(myPromise, {
  loading: 'Loading...',
  success: 'Success!',
  error: 'Error!'
});

// Custom toast
toast.custom((id) => (
  <div>Custom notification</div>
));
```

## Related Components

- [Toast](./toast.md) - Basic toasts
- [Alert](./alert.md) - Static notifications

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>