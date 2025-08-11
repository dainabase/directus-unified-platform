# Textarea

Multi-line text input component

## Import

```tsx
import { Textarea } from '@dainabase/ui/textarea';
```

## Basic Usage

```tsx
import { Textarea } from '@dainabase/ui/textarea';

export default function TextareaExample() {
  return (
    <Textarea 
      placeholder="Enter your message..."
      rows={4}
    />
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| rows | `number` | 3 | No | Number of visible rows |
| maxLength | `number` | - | No | Maximum character limit |
| resize | `boolean` | true | No | Allow resizing |
| className | `string` | - | No | Additional CSS classes |
| ...props | `TextareaHTMLAttributes` | - | No | Standard textarea attributes |

## Examples

### Auto-resize Textarea

```tsx
<Textarea 
  placeholder="This textarea auto-resizes"
  className="min-h-[100px] max-h-[300px]"
/>
```

## Related Components

- [Input](./input.md) - Single-line text input
- [Form](./form.md) - Form wrapper

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>