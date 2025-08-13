---
id: navigation-menu
title: Navigation Menu
sidebar_position: 29
---

import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, NavigationMenuViewport } from '@dainabase/ui';

# Navigation Menu

A collection of links for navigating websites with multi-level dropdown support, animations, and keyboard navigation.

## Preview

```jsx live
function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Dainabase UI
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Beautifully designed components built with Radix UI and Tailwind CSS.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/docs" title="Introduction">
                Re-usable components built using Radix UI and Tailwind CSS.
              </ListItem>
              <ListItem href="/docs/installation" title="Installation">
                How to install dependencies and structure your app.
              </ListItem>
              <ListItem href="/docs/primitives/typography" title="Typography">
                Styles for headings, paragraphs, lists...etc
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
```

## Features

- 🎯 **Multi-level dropdowns** - Support for nested navigation structures
- 🎨 **Smooth animations** - Beautiful enter/exit animations with CSS transitions
- ⌨️ **Full keyboard navigation** - Navigate with Tab, Arrow keys, Enter, and Escape
- 📱 **Responsive design** - Adapts to different screen sizes automatically
- ♿ **ARIA compliant** - Full screen reader support and ARIA attributes
- 🎭 **Flexible styling** - Easy to customize with Tailwind classes
- 🔄 **Controlled/Uncontrolled** - Works in both controlled and uncontrolled modes
- 🎪 **Portal support** - Renders dropdowns in portal for better positioning
- 🎯 **Focus management** - Automatic focus trap and restoration
- 🚀 **Performance optimized** - Lazy rendering of dropdown content

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```jsx
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@dainabase/ui';
```

## Examples

### Basic Navigation Menu

```jsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuLink href="/home">
        Home
      </NavigationMenuLink>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink href="/about">
        About
      </NavigationMenuLink>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink href="/contact">
        Contact
      </NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

### With Dropdown Content

```jsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Products</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
          <li>
            <NavigationMenuLink href="/products/ui">
              <div className="text-sm font-medium">UI Components</div>
              <p className="text-sm text-muted-foreground">
                Beautiful and accessible components
              </p>
            </NavigationMenuLink>
          </li>
          <li>
            <NavigationMenuLink href="/products/templates">
              <div className="text-sm font-medium">Templates</div>
              <p className="text-sm text-muted-foreground">
                Ready-to-use application templates
              </p>
            </NavigationMenuLink>
          </li>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

### Complex Multi-Column Layout

```jsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="w-[600px] p-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h4 className="mb-2 text-sm font-medium">Documentation</h4>
              <ul className="space-y-2">
                <li><NavigationMenuLink href="/docs/getting-started">Getting Started</NavigationMenuLink></li>
                <li><NavigationMenuLink href="/docs/components">Components</NavigationMenuLink></li>
                <li><NavigationMenuLink href="/docs/api">API Reference</NavigationMenuLink></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium">Community</h4>
              <ul className="space-y-2">
                <li><NavigationMenuLink href="/community/discord">Discord</NavigationMenuLink></li>
                <li><NavigationMenuLink href="/community/github">GitHub</NavigationMenuLink></li>
                <li><NavigationMenuLink href="/community/twitter">Twitter</NavigationMenuLink></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium">Support</h4>
              <ul className="space-y-2">
                <li><NavigationMenuLink href="/support/faq">FAQ</NavigationMenuLink></li>
                <li><NavigationMenuLink href="/support/contact">Contact</NavigationMenuLink></li>
                <li><NavigationMenuLink href="/support/enterprise">Enterprise</NavigationMenuLink></li>
              </ul>
            </div>
          </div>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

### With Icons and Badges

```jsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>
        <Icon name="folder" className="mr-2 h-4 w-4" />
        Projects
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="w-[400px] p-4 space-y-2">
          <li>
            <NavigationMenuLink href="/projects/active">
              <Icon name="activity" className="mr-2 h-4 w-4" />
              Active Projects
              <Badge className="ml-auto">12</Badge>
            </NavigationMenuLink>
          </li>
          <li>
            <NavigationMenuLink href="/projects/archived">
              <Icon name="archive" className="mr-2 h-4 w-4" />
              Archived
              <Badge variant="secondary" className="ml-auto">5</Badge>
            </NavigationMenuLink>
          </li>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

### Controlled Navigation Menu

```jsx
function ControlledNavigation() {
  const [value, setValue] = useState("item-1");
  
  return (
    <NavigationMenu value={value} onValueChange={setValue}>
      <NavigationMenuList>
        <NavigationMenuItem value="item-1">
          <NavigationMenuTrigger>Item 1</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="p-4">Content for Item 1</div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="item-2">
          <NavigationMenuTrigger>Item 2</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="p-4">Content for Item 2</div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
```

### With Featured Content

```jsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="w-[800px] p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <NavigationMenuLink href="/solutions/analytics">
                <div className="p-3 rounded-lg hover:bg-accent">
                  <h4 className="text-sm font-medium mb-1">Analytics</h4>
                  <p className="text-sm text-muted-foreground">
                    Track and analyze your data
                  </p>
                </div>
              </NavigationMenuLink>
              <NavigationMenuLink href="/solutions/automation">
                <div className="p-3 rounded-lg hover:bg-accent">
                  <h4 className="text-sm font-medium mb-1">Automation</h4>
                  <p className="text-sm text-muted-foreground">
                    Automate repetitive tasks
                  </p>
                </div>
              </NavigationMenuLink>
              <NavigationMenuLink href="/solutions/integration">
                <div className="p-3 rounded-lg hover:bg-accent">
                  <h4 className="text-sm font-medium mb-1">Integration</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect all your tools
                  </p>
                </div>
              </NavigationMenuLink>
              <NavigationMenuLink href="/solutions/security">
                <div className="p-3 rounded-lg hover:bg-accent">
                  <h4 className="text-sm font-medium mb-1">Security</h4>
                  <p className="text-sm text-muted-foreground">
                    Enterprise-grade protection
                  </p>
                </div>
              </NavigationMenuLink>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-medium mb-2">Featured</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Discover our latest solution for modern teams
              </p>
              <Button size="sm" className="w-full">Learn More</Button>
            </div>
          </div>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

### Mobile-Friendly Navigation

```jsx
<NavigationMenu className="w-full">
  <NavigationMenuList className="flex-col sm:flex-row">
    <NavigationMenuItem className="w-full sm:w-auto">
      <NavigationMenuTrigger className="w-full sm:w-auto justify-between sm:justify-center">
        Menu
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="w-screen sm:w-[400px] p-4">
          <li><NavigationMenuLink href="/home">Home</NavigationMenuLink></li>
          <li><NavigationMenuLink href="/about">About</NavigationMenuLink></li>
          <li><NavigationMenuLink href="/services">Services</NavigationMenuLink></li>
          <li><NavigationMenuLink href="/contact">Contact</NavigationMenuLink></li>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
  <NavigationMenuViewport className="w-full sm:w-auto" />
</NavigationMenu>
```

### With Search Integration

```jsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Search</NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="w-[400px] p-4">
          <Input 
            type="search" 
            placeholder="Search documentation..." 
            className="mb-4"
          />
          <div className="space-y-2">
            <h4 className="text-sm font-medium mb-2">Popular searches</h4>
            <NavigationMenuLink href="/search?q=installation">Installation</NavigationMenuLink>
            <NavigationMenuLink href="/search?q=components">Components</NavigationMenuLink>
            <NavigationMenuLink href="/search?q=themes">Themes</NavigationMenuLink>
          </div>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

### With User Profile Dropdown

```jsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src="/user.jpg" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        John Doe
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="w-[200px] p-2">
          <li>
            <NavigationMenuLink href="/profile">
              <Icon name="user" className="mr-2 h-4 w-4" />
              Profile
            </NavigationMenuLink>
          </li>
          <li>
            <NavigationMenuLink href="/settings">
              <Icon name="settings" className="mr-2 h-4 w-4" />
              Settings
            </NavigationMenuLink>
          </li>
          <Separator className="my-2" />
          <li>
            <NavigationMenuLink href="/logout">
              <Icon name="log-out" className="mr-2 h-4 w-4" />
              Log out
            </NavigationMenuLink>
          </li>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

### With Mega Menu

```jsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Products</NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="w-screen max-w-screen-xl p-6">
          <div className="grid grid-cols-4 gap-6">
            <div>
              <h3 className="font-medium mb-3">Platform</h3>
              <ul className="space-y-2">
                <li><NavigationMenuLink href="/platform/cloud">Cloud</NavigationMenuLink></li>
                <li><NavigationMenuLink href="/platform/on-premise">On-Premise</NavigationMenuLink></li>
                <li><NavigationMenuLink href="/platform/hybrid">Hybrid</NavigationMenuLink></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-3">Solutions</h3>
              <ul className="space-y-2">
                <li><NavigationMenuLink href="/solutions/enterprise">Enterprise</NavigationMenuLink></li>
                <li><NavigationMenuLink href="/solutions/startup">Startup</NavigationMenuLink></li>
                <li><NavigationMenuLink href="/solutions/smb">SMB</NavigationMenuLink></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-3">Industries</h3>
              <ul className="space-y-2">
                <li><NavigationMenuLink href="/industries/finance">Finance</NavigationMenuLink></li>
                <li><NavigationMenuLink href="/industries/healthcare">Healthcare</NavigationMenuLink></li>
                <li><NavigationMenuLink href="/industries/retail">Retail</NavigationMenuLink></li>
              </ul>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-medium mb-2">What's New</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Check out our latest features and updates
              </p>
              <Button size="sm" variant="secondary" className="w-full">
                View Changelog
              </Button>
            </div>
          </div>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
  <NavigationMenuViewport />
</NavigationMenu>
```

## API Reference

### NavigationMenu

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | The controlled value of the menu item to activate |
| `onValueChange` | `(value: string) => void` | - | Event handler called when the value changes |
| `defaultValue` | `string` | - | The value of the menu item to activate initially (uncontrolled) |
| `delayDuration` | `number` | `200` | The duration from when the mouse enters a trigger until the content opens |
| `skipDelayDuration` | `number` | `300` | How much time a user has to enter another trigger without incurring a delay again |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | The reading direction |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | The orientation of the menu |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | The navigation menu content |

### NavigationMenuList

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | The navigation menu items |

### NavigationMenuItem

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | A unique value that associates the item with an active value |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | The navigation menu item content |

### NavigationMenuTrigger

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | The trigger content |
| `disabled` | `boolean` | `false` | Whether the trigger is disabled |

### NavigationMenuContent

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | The dropdown content |
| `forceMount` | `boolean` | - | Used to force mounting when more control is needed |

### NavigationMenuLink

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `active` | `boolean` | - | Whether the link is active |
| `className` | `string` | - | Additional CSS classes |
| `href` | `string` | - | The URL to navigate to |
| `asChild` | `boolean` | `false` | Render as child element |
| `children` | `ReactNode` | - | The link content |

### NavigationMenuViewport

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `forceMount` | `boolean` | - | Used to force mounting when more control is needed |

## Accessibility

The Navigation Menu component follows WAI-ARIA guidelines:

- Full keyboard navigation support with Tab, Arrow keys, Enter, and Escape
- ARIA attributes for screen readers (aria-expanded, aria-haspopup, etc.)
- Focus management with focus trap in open dropdowns
- Proper semantic HTML structure
- Support for reduced motion preferences
- Announces state changes to screen readers
- Maintains focus visibility for keyboard users

## Best Practices

### ✅ Do's

- Keep navigation items concise and descriptive
- Group related items logically
- Use consistent styling across all menu items
- Provide visual feedback for hover and active states
- Test keyboard navigation thoroughly
- Include skip navigation links for accessibility
- Use semantic HTML elements
- Consider mobile users with touch-friendly targets
- Implement proper focus management
- Use appropriate ARIA labels for complex menus

### ❌ Don'ts

- Don't create more than 2-3 levels of nesting
- Avoid too many top-level items (7±2 rule)
- Don't disable keyboard navigation
- Avoid auto-opening menus on hover for mobile
- Don't use navigation menus for actions (use buttons instead)
- Avoid inconsistent animations or delays
- Don't hide important content only in dropdowns
- Avoid overly complex mega menus
- Don't rely solely on hover for interaction
- Avoid poor color contrast in dropdown content

## Use Cases

- **Main website navigation** - Primary navigation for multi-page applications
- **Application menus** - Complex app navigation with categories
- **E-commerce categories** - Product categories with subcategories
- **Documentation sites** - Organized docs with sections and subsections
- **Admin dashboards** - Multi-level admin panel navigation
- **Corporate websites** - Services, products, and resources organization
- **User account menus** - Profile, settings, and account actions
- **Language/region selectors** - Internationalization options
- **Search interfaces** - Advanced search with filters
- **Mobile app navigation** - Responsive navigation for mobile web apps

## Related Components

- [Dropdown Menu](/docs/components/dropdown-menu) - For single-level action menus
- [Menubar](/docs/components/menubar) - For application-style menu bars
- [Context Menu](/docs/components/context-menu) - For right-click menus
- [Tabs](/docs/components/tabs) - For content switching within a page
- [Breadcrumbs](/docs/components/breadcrumbs) - For showing navigation hierarchy
- [Sheet](/docs/components/sheet) - For mobile navigation drawers
