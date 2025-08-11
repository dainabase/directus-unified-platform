# Error Boundary

Error handling wrapper

## Import

```tsx
import { ErrorBoundary } from '@dainabase/ui/error-boundary';
```

## Basic Usage

```tsx
import { ErrorBoundary } from '@dainabase/ui/error-boundary';

export default function ErrorBoundaryExample() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>