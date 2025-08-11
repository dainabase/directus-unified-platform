# Scroll Area

Custom scrollable area with styled scrollbars

## Import

```tsx
import { ScrollArea } from '@dainabase/ui/scroll-area';
```

## Basic Usage

```tsx
import { ScrollArea } from '@dainabase/ui/scroll-area';

export default function ScrollAreaExample() {
  return (
    <ScrollArea className="h-[200px] w-[300px]">
      <div className="p-4">
        {/* Long content that needs scrolling */}
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i}>Item {i + 1}</div>
        ))}
      </div>
    </ScrollArea>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| className | `string` | - | No | Container classes |
| scrollbarSize | `'sm' \| 'md' \| 'lg'` | 'md' | No | Scrollbar size |
| hideDelay | `number` | 1000 | No | Hide scrollbar delay (ms) |
| children | `ReactNode` | - | Yes | Scrollable content |

## Examples

### Horizontal Scroll

```tsx
<ScrollArea orientation="horizontal" className="w-full">
  <div className="flex gap-4 p-4">
    {items.map(item => <Card key={item.id} />)}
  </div>
</ScrollArea>
```

### Always Visible Scrollbar

```tsx
<ScrollArea hideDelay={0} className="h-[400px]">
  <div>{content}</div>
</ScrollArea>
```

## Related Components

- [Card](./card.md) - Often contains scrollable content
- [Table](./table.md) - May use scroll areas

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>