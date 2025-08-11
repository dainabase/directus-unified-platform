# Navigation Menu

Main navigation menu component

## Import

```tsx
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink } from '@dainabase/ui/navigation-menu';
```

## Basic Usage

```tsx
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink } from '@dainabase/ui/navigation-menu';

export default function NavigationMenuExample() {
  return (
    <NavigationMenu>
      <NavigationMenuItem>
        <NavigationMenuLink href="/home">Home</NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink href="/about">About</NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink href="/contact">Contact</NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenu>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| orientation | `'horizontal' \| 'vertical'` | 'horizontal' | No | Menu orientation |
| className | `string` | - | No | Additional CSS classes |

## Related Components

- [Menubar](./menubar.md) - Menu bar
- [Tabs](./tabs.md) - Tab navigation

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>