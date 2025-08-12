---
id: avatar
title: Avatar
sidebar_position: 11
---

import { Avatar, AvatarFallback, AvatarImage } from '@dainabase/ui';

# Avatar

An image element with fallback for representing the user.

<div className="component-preview">
  <Avatar>
    <AvatarImage src="https://github.com/dainabase.png" alt="@dainabase" />
    <AvatarFallback>DA</AvatarFallback>
  </Avatar>
</div>

## Features

- **Intelligent Fallback**: Automatic fallback to initials or icon
- **Loading States**: Smooth loading transitions
- **Size Variants**: Multiple pre-defined sizes
- **Shape Options**: Circle or square variants
- **Accessible**: Proper alt text and ARIA labels
- **Performance**: Lazy loading and optimization

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@dainabase/ui';

export function AvatarDemo() {
  return (
    <Avatar>
      <AvatarImage src="/avatar.jpg" alt="User Name" />
      <AvatarFallback>UN</AvatarFallback>
    </Avatar>
  );
}
```

## Examples

### Basic Avatar

```jsx live
function BasicAvatar() {
  return (
    <Avatar>
      <AvatarImage src="https://i.pravatar.cc/150?img=1" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  );
}
```

### Avatar Sizes

```jsx live
function AvatarSizes() {
  return (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <AvatarImage src="https://i.pravatar.cc/150?img=2" />
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar size="md">
        <AvatarImage src="https://i.pravatar.cc/150?img=3" />
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarImage src="https://i.pravatar.cc/150?img=4" />
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
      <Avatar size="xl">
        <AvatarImage src="https://i.pravatar.cc/150?img=5" />
        <AvatarFallback>XL</AvatarFallback>
      </Avatar>
    </div>
  );
}
```

### Avatar Group

```jsx live
function AvatarGroup() {
  const users = [
    { name: "Alice Johnson", src: "https://i.pravatar.cc/150?img=10" },
    { name: "Bob Smith", src: "https://i.pravatar.cc/150?img=11" },
    { name: "Carol White", src: "https://i.pravatar.cc/150?img=12" },
    { name: "David Brown", src: "https://i.pravatar.cc/150?img=13" },
  ];
  
  return (
    <div className="flex -space-x-2">
      {users.map((user, i) => (
        <Avatar key={i} className="border-2 border-white">
          <AvatarImage src={user.src} alt={user.name} />
          <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
      ))}
      <Avatar className="border-2 border-white">
        <AvatarFallback>+5</AvatarFallback>
      </Avatar>
    </div>
  );
}
```

### Avatar with Status

```jsx live
function AvatarWithStatus() {
  return (
    <div className="flex gap-4">
      <div className="relative">
        <Avatar>
          <AvatarImage src="https://i.pravatar.cc/150?img=20" />
          <AvatarFallback>ON</AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
      </div>
      <div className="relative">
        <Avatar>
          <AvatarImage src="https://i.pravatar.cc/150?img=21" />
          <AvatarFallback>AW</AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-yellow-500 border-2 border-white" />
      </div>
      <div className="relative">
        <Avatar>
          <AvatarImage src="https://i.pravatar.cc/150?img=22" />
          <AvatarFallback>OF</AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-gray-500 border-2 border-white" />
      </div>
    </div>
  );
}
```

### Square Avatar

```jsx live
function SquareAvatar() {
  return (
    <div className="flex gap-4">
      <Avatar variant="square">
        <AvatarImage src="https://i.pravatar.cc/150?img=30" />
        <AvatarFallback>SQ</AvatarFallback>
      </Avatar>
      <Avatar variant="square" className="rounded-lg">
        <AvatarImage src="https://i.pravatar.cc/150?img=31" />
        <AvatarFallback>RD</AvatarFallback>
      </Avatar>
    </div>
  );
}
```

### Fallback Examples

```jsx live
function FallbackExamples() {
  return (
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage src="https://broken-link.com/image.jpg" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>
          <UserIcon className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
```

## API Reference

### Avatar Props

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
        <td><code>size</code></td>
        <td><code>'sm' | 'md' | 'lg' | 'xl'</code></td>
        <td><code>'md'</code></td>
        <td>Size of the avatar</td>
      </tr>
      <tr>
        <td><code>variant</code></td>
        <td><code>'circle' | 'square'</code></td>
        <td><code>'circle'</code></td>
        <td>Shape variant</td>
      </tr>
      <tr>
        <td><code>className</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>Additional CSS classes</td>
      </tr>
      <tr>
        <td><code>asChild</code></td>
        <td><code>boolean</code></td>
        <td><code>false</code></td>
        <td>Render as child component</td>
      </tr>
    </tbody>
  </table>
</div>

### AvatarImage Props

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
        <td><code>src</code></td>
        <td><code>string</code></td>
        <td>Required</td>
        <td>Image source URL</td>
      </tr>
      <tr>
        <td><code>alt</code></td>
        <td><code>string</code></td>
        <td><code>''</code></td>
        <td>Alt text for accessibility</td>
      </tr>
      <tr>
        <td><code>onLoadingStatusChange</code></td>
        <td><code>function</code></td>
        <td><code>undefined</code></td>
        <td>Callback for loading status</td>
      </tr>
    </tbody>
  </table>
</div>

### AvatarFallback Props

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
        <td><code>children</code></td>
        <td><code>ReactNode</code></td>
        <td><code>undefined</code></td>
        <td>Fallback content (text or icon)</td>
      </tr>
      <tr>
        <td><code>delayMs</code></td>
        <td><code>number</code></td>
        <td><code>0</code></td>
        <td>Delay before showing fallback</td>
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

The Avatar component includes:
- Proper `alt` text for images
- `role="img"` for semantic meaning
- `aria-label` for screen readers
- Fallback content for missing images
- High contrast mode support
- Focus indicators when interactive

## Best Practices

### Do's ✅

- Always provide meaningful alt text
- Use initials as fallback for user avatars
- Optimize images for web (WebP, lazy loading)
- Consider different states (online, offline, away)
- Test fallback behavior
- Use consistent sizing across your app

### Don'ts ❌

- Don't use avatars as buttons without proper indication
- Don't rely on avatars alone to identify users
- Don't use low-quality or stretched images
- Don't forget to handle loading states
- Don't use inappropriate fallback content

## Use Cases

- **User profiles**: Display user photos in headers and lists
- **Comments sections**: Show commenter avatars
- **Team directories**: Employee or team member photos
- **Chat applications**: Participant avatars in conversations
- **Navigation**: User avatar in account menus
- **Cards**: Author avatars in content cards

## Related Components

- [Badge](/docs/components/badge) - For status indicators
- [Card](/docs/components/card) - For user cards
- [Dropdown Menu](/docs/components/dropdown-menu) - For avatar menus
- [Hover Card](/docs/components/hover-card) - For user details on hover
