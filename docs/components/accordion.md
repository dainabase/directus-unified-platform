# Accordion

Collapsible content sections

## Import

```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@dainabase/ui/accordion';
```

## Basic Usage

```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@dainabase/ui/accordion';

export default function AccordionExample() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Section 1</AccordionTrigger>
        <AccordionContent>Content 1</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section 2</AccordionTrigger>
        <AccordionContent>Content 2</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

## Related Components

- [Collapsible](./collapsible.md) - Single collapsible

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>