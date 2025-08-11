# Collapsible

Expandable/collapsible content container

## Import

```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@dainabase/ui/collapsible';
```

## Basic Usage

```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@dainabase/ui/collapsible';

export default function CollapsibleExample() {
  return (
    <Collapsible>
      <CollapsibleTrigger>Click to expand</CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4">
          Hidden content that appears when expanded
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| open | `boolean` | - | No | Controlled open state |
| defaultOpen | `boolean` | false | No | Initial open state |
| onOpenChange | `(open: boolean) => void` | - | No | Open state change callback |
| disabled | `boolean` | false | No | Disable collapse/expand |
| className | `string` | - | No | Container classes |

## Examples

### Controlled Collapsible

```tsx
const [isOpen, setIsOpen] = useState(false);

<Collapsible open={isOpen} onOpenChange={setIsOpen}>
  <CollapsibleTrigger>
    {isOpen ? 'Hide' : 'Show'} Details
  </CollapsibleTrigger>
  <CollapsibleContent>
    <div>Detailed information</div>
  </CollapsibleContent>
</Collapsible>
```

## Related Components

- [Accordion](./accordion.md) - Multiple collapsible sections
- [Sheet](./sheet.md) - Slide-out panels

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>