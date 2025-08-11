# Tabs

Tabbed content organization

## Import

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@dainabase/ui/tabs';
```

## Basic Usage

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@dainabase/ui/tabs';

export default function TabsExample() {
  return (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content 1</TabsContent>
      <TabsContent value="tab2">Content 2</TabsContent>
      <TabsContent value="tab3">Content 3</TabsContent>
    </Tabs>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| value | `string` | - | No | Active tab |
| defaultValue | `string` | - | No | Default active tab |
| orientation | `'horizontal' \| 'vertical'` | 'horizontal' | No | Tab orientation |

## Related Components

- [Navigation Menu](./navigation-menu.md) - Navigation
- [Stepper](./stepper.md) - Step navigation

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>