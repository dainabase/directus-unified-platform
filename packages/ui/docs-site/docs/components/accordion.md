---
id: accordion
title: Accordion
sidebar_position: 10
---

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@dainabase/ui';

# Accordion

A vertically stacked set of interactive headings that reveal content.

<div className="component-preview">
  <Accordion type="single" collapsible>
    <AccordionItem value="item-1">
      <AccordionTrigger>Is it accessible?</AccordionTrigger>
      <AccordionContent>
        Yes. It adheres to the WAI-ARIA design pattern.
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</div>

## Features

- **Accessible**: Full keyboard navigation and ARIA support
- **Flexible**: Single or multiple panels can be expanded
- **Animated**: Smooth expand/collapse animations
- **Customizable**: Extensive styling options
- **TypeScript**: Complete type definitions
- **Responsive**: Works perfectly on all devices

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@dainabase/ui';

export function AccordionDemo() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Section 1</AccordionTrigger>
        <AccordionContent>
          Content for section 1
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

## Examples

### Single Accordion

```jsx live
function SingleAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is Dainabase UI?</AccordionTrigger>
        <AccordionContent>
          Dainabase UI is a comprehensive React component library built with accessibility and performance in mind.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that can be easily customized with Tailwind CSS.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It includes smooth animations powered by Radix UI.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

### Multiple Accordion

```jsx live
function MultipleAccordion() {
  return (
    <Accordion type="multiple" className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Can I expand multiple items?</AccordionTrigger>
        <AccordionContent>
          Yes, when using type="multiple", you can expand multiple panels simultaneously.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How does it work?</AccordionTrigger>
        <AccordionContent>
          Each panel operates independently, allowing users to view multiple sections at once.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

### Controlled Accordion

```jsx live
function ControlledAccordion() {
  const [value, setValue] = React.useState("item-1");
  
  return (
    <>
      <div className="mb-4">
        <button onClick={() => setValue("item-1")}>Open First</button>
        <button onClick={() => setValue("item-2")} className="ml-2">Open Second</button>
      </div>
      <Accordion type="single" value={value} onValueChange={setValue}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Controlled Panel 1</AccordionTrigger>
          <AccordionContent>
            This accordion is controlled by external state.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Controlled Panel 2</AccordionTrigger>
          <AccordionContent>
            You can programmatically control which panel is open.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
```

### Nested Accordion

```jsx live
function NestedAccordion() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="parent">
        <AccordionTrigger>Parent Section</AccordionTrigger>
        <AccordionContent>
          <p>This section contains a nested accordion:</p>
          <Accordion type="single" collapsible className="mt-4">
            <AccordionItem value="child-1">
              <AccordionTrigger>Child Section 1</AccordionTrigger>
              <AccordionContent>
                Nested content 1
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="child-2">
              <AccordionTrigger>Child Section 2</AccordionTrigger>
              <AccordionContent>
                Nested content 2
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

## API Reference

### Accordion Props

<div className="props-table">
  <table>
    <thead>
      <tr>
        <th>Prop</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>type</code></td>
        <td><code>'single' | 'multiple'</code></td>
        <td><code>'single'</code></td>
        <td>Whether one or multiple items can be opened</td>
      </tr>
      <tr>
        <td><code>value</code></td>
        <td><code>string | string[]</code></td>
        <td><code>undefined</code></td>
        <td>Controlled value</td>
      </tr>
      <tr>
        <td><code>defaultValue</code></td>
        <td><code>string | string[]</code></td>
        <td><code>undefined</code></td>
        <td>Default value for uncontrolled</td>
      </tr>
      <tr>
        <td><code>onValueChange</code></td>
        <td><code>function</code></td>
        <td><code>undefined</code></td>
        <td>Callback when value changes</td>
      </tr>
      <tr>
        <td><code>collapsible</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Allow closing when type is 'single'</td>
      </tr>
      <tr>
        <td><code>disabled</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Disable all items</td>
      </tr>
      <tr>
        <td><code>className</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>Additional CSS classes</td>
      </tr>
    </tbody>
  </table>
</div>

### AccordionItem Props

<div className="props-table">
  <table>
    <thead>
      <tr>
        <th>Prop</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>value</code></td>
        <td><code>string</code></td>
        <td>Required</td>
        <td>Unique identifier for the item</td>
      </tr>
      <tr>
        <td><code>disabled</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Disable this specific item</td>
      </tr>
      <tr>
        <td><code>className</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>Additional CSS classes</td>
      </tr>
    </tbody>
  </table>
</div>

## Accessibility

The Accordion component follows WAI-ARIA Accordion pattern:
- Arrow keys navigate between triggers
- Enter/Space toggles panels
- Home/End keys for first/last navigation
- Proper ARIA attributes (`aria-expanded`, `aria-controls`)
- Focus management and indicators
- Screen reader announcements

## Best Practices

### Do's ✅

- Use descriptive trigger labels
- Keep content organized and scannable
- Consider default expanded states for important content
- Test keyboard navigation thoroughly
- Ensure sufficient color contrast
- Use appropriate heading levels

### Don'ts ❌

- Don't nest too many levels deep
- Don't auto-collapse without user action
- Don't hide critical information by default
- Don't disable without clear indication
- Don't use for navigation menus

## Use Cases

- **FAQs**: Organize frequently asked questions
- **Settings panels**: Group related configuration options
- **Content organization**: Break down long content into sections
- **Form sections**: Organize complex forms into collapsible parts
- **Documentation**: Structure technical documentation
- **Product features**: Display feature lists with details

## Related Components

- [Collapsible](/docs/components/collapsible) - For simple expand/collapse
- [Tabs](/docs/components/tabs) - For horizontal organization
- [Dialog](/docs/components/dialog) - For modal content
- [Sheet](/docs/components/sheet) - For slide-out panels
