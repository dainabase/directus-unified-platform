---
id: breadcrumbs
title: Breadcrumbs
sidebar_position: 13
---

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@dainabase/ui';

# Breadcrumbs

Shows the current page location within a navigational hierarchy.

<div className="component-preview">
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/">Home</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href="/docs">Documentation</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>Breadcrumbs</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
</div>

## Features

- **Accessible Navigation**: ARIA landmarks and proper semantics
- **Flexible Separators**: Custom separators between items
- **Responsive Design**: Collapsible on mobile devices
- **Router Integration**: Works with any routing library
- **TypeScript Support**: Full type safety
- **Customizable**: Extensive styling options

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@dainabase/ui';

export function BreadcrumbDemo() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Current Page</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
```

## Examples

### Basic Breadcrumbs

```jsx live
function BasicBreadcrumbs() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/products">Products</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Shoes</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
```

### With Icons

```jsx live
function BreadcrumbsWithIcons() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">
            <HomeIcon className="h-4 w-4" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/settings">
            <SettingsIcon className="h-4 w-4 mr-1" />
            Settings
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>
            <UserIcon className="h-4 w-4 mr-1" />
            Profile
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
```

### Custom Separator

```jsx live
function CustomSeparator() {
  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRightIcon className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRightIcon className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Components</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Root</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/folder">Folder</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>File</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
```

### Collapsible Breadcrumbs

```jsx live
function CollapsibleBreadcrumbs() {
  const [collapsed, setCollapsed] = React.useState(true);
  
  const items = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Electronics", href: "/products/electronics" },
    { label: "Computers", href: "/products/electronics/computers" },
    { label: "Laptops", href: "/products/electronics/computers/laptops" },
    { label: "Gaming Laptops", current: true },
  ];
  
  const visibleItems = collapsed ? [items[0], items[items.length - 1]] : items;
  
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {visibleItems.map((item, index) => (
          <React.Fragment key={item.label}>
            {index > 0 && collapsed && index === 1 && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <button
                    onClick={() => setCollapsed(false)}
                    className="px-2 py-1 text-sm hover:bg-muted rounded"
                  >
                    ...
                  </button>
                </BreadcrumbItem>
              </>
            )}
            {index > 0 && !collapsed && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.current ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
```

### Dynamic Breadcrumbs

```jsx live
function DynamicBreadcrumbs() {
  const [path, setPath] = React.useState("/home/documents/projects/ui");
  
  const segments = path.split('/').filter(Boolean);
  
  return (
    <div className="space-y-4">
      <input
        type="text"
        value={path}
        onChange={(e) => setPath(e.target.value)}
        placeholder="Enter path..."
        className="w-full px-3 py-2 border rounded"
      />
      
      <Breadcrumb>
        <BreadcrumbList>
          {segments.map((segment, index) => (
            <React.Fragment key={index}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {index === segments.length - 1 ? (
                  <BreadcrumbPage>{segment}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink 
                    href={`/${segments.slice(0, index + 1).join('/')}`}
                  >
                    {segment}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
```

### With Dropdown

```jsx live
function BreadcrumbsWithDropdown() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1">
              Products
              <ChevronDownIcon className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Electronics</DropdownMenuItem>
              <DropdownMenuItem>Clothing</DropdownMenuItem>
              <DropdownMenuItem>Books</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Current Item</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
```

## API Reference

### Breadcrumb Props

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
        <td><code>className</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>Additional CSS classes</td>
      </tr>
      <tr>
        <td><code>separator</code></td>
        <td><code>ReactNode</code></td>
        <td><code>'/'</code></td>
        <td>Default separator between items</td>
      </tr>
    </tbody>
  </table>
</div>

### BreadcrumbLink Props

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
        <td><code>href</code></td>
        <td><code>string</code></td>
        <td>Required</td>
        <td>Link destination</td>
      </tr>
      <tr>
        <td><code>asChild</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Render as child component</td>
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

The Breadcrumbs component follows WAI-ARIA guidelines:
- Uses `<nav>` with `aria-label="Breadcrumb"`
- Semantic list structure with `<ol>`
- Current page marked with `aria-current="page"`
- Links are keyboard navigable
- Screen reader announcements for navigation
- Proper focus management

## Best Practices

### Do's ✅

- Always include Home as the first item
- Use clear, concise labels
- Mark the current page appropriately
- Maintain consistent separators
- Test with keyboard navigation
- Consider mobile responsive design

### Don'ts ❌

- Don't make breadcrumbs too deep (>5 levels)
- Don't use for primary navigation
- Don't include the current page as a link
- Don't hide breadcrumbs on important pages
- Don't use inconsistent terminology

## Use Cases

- **E-commerce**: Product category navigation
- **Documentation**: Section hierarchy
- **File Systems**: Folder structure navigation
- **Multi-step Forms**: Progress indication
- **Content Management**: Site structure
- **Dashboards**: Settings navigation

## Related Components

- [Navigation Menu](/docs/components/navigation-menu) - Primary navigation
- [Tabs](/docs/components/tabs) - Alternative navigation pattern
- [Link](/docs/components/link) - Individual links
- [Dropdown Menu](/docs/components/dropdown-menu) - For breadcrumb menus
