# Toast

Temporary notification messages

## Import

```tsx
import { toast } from '@dainabase/ui/toast';
```

## Basic Usage

```tsx
import { toast } from '@dainabase/ui/toast';
import { Button } from '@dainabase/ui/button';

export default function ToastExample() {
  return (
    <Button onClick={() => toast('Hello World!')}>
      Show Toast
    </Button>
  );
}
```

## API

```tsx
// Success toast
toast.success('Operation successful!');

// Error toast
toast.error('Something went wrong!');

// Warning toast
toast.warning('Please review your input');

// Info toast
toast.info('New update available');
```

## Related Components

- [Sonner](./sonner.md) - Advanced toasts
- [Alert](./alert.md) - Static alerts

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>