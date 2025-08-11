# Stepper

Step-by-step progress indicator

## Import

```tsx
import { Stepper, Step } from '@dainabase/ui/stepper';
```

## Basic Usage

```tsx
import { Stepper, Step } from '@dainabase/ui/stepper';

export default function StepperExample() {
  return (
    <Stepper activeStep={1}>
      <Step label="Select campaign" />
      <Step label="Create ad group" />
      <Step label="Create ad" />
    </Stepper>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| activeStep | `number` | 0 | No | Current active step |
| orientation | `'horizontal' \| 'vertical'` | 'horizontal' | No | Stepper orientation |
| variant | `'dots' \| 'numbers' \| 'icons'` | 'numbers' | No | Step indicator style |

## Related Components

- [Progress](./progress.md) - Progress indicator
- [Timeline](./timeline.md) - Timeline display

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>