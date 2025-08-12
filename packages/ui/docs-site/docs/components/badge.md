---
id: badge
title: Badge
sidebar_position: 12
---

import { Badge } from '@dainabase/ui';

# Badge

Displays a badge or label, typically for status or notification.

<div className="component-preview">
  <Badge>Badge</Badge>
</div>

## Features

- **Multiple Variants**: Default, secondary, destructive, outline, and more
- **Flexible Sizing**: Small to large sizes available
- **Icon Support**: Leading and trailing icons
- **Accessible**: Semantic HTML with ARIA support
- **Lightweight**: Minimal DOM footprint
- **TypeScript**: Full type safety

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import { Badge } from '@dainabase/ui';

export function BadgeDemo() {
  return <Badge variant="outline">Badge</Badge>;
}
```

## Examples

### Badge Variants

```jsx live
function BadgeVariants() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  );
}
```

### Badge Sizes

```jsx live
function BadgeSizes() {
  return (
    <div className="flex items-center gap-2">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  );
}
```

### Badge with Icons

```jsx live
function BadgeWithIcons() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge>
        <CheckIcon className="mr-1 h-3 w-3" />
        Completed
      </Badge>
      <Badge variant="destructive">
        <XIcon className="mr-1 h-3 w-3" />
        Failed
      </Badge>
      <Badge variant="warning">
        <AlertIcon className="mr-1 h-3 w-3" />
        Warning
      </Badge>
      <Badge variant="info">
        Info
        <InfoIcon className="ml-1 h-3 w-3" />
      </Badge>
    </div>
  );
}
```

### Notification Badge

```jsx live
function NotificationBadge() {
  return (
    <div className="flex gap-4">
      <div className="relative">
        <BellIcon className="h-6 w-6" />
        <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
          3
        </Badge>
      </div>
      <div className="relative">
        <MailIcon className="h-6 w-6" />
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
        >
          9+
        </Badge>
      </div>
    </div>
  );
}
```

### Status Badges

```jsx live
function StatusBadges() {
  const statuses = [
    { label: "Active", variant: "success" },
    { label: "Pending", variant: "warning" },
    { label: "Archived", variant: "secondary" },
    { label: "Draft", variant: "outline" },
    { label: "Published", variant: "default" },
  ];
  
  return (
    <div className="space-y-2">
      {statuses.map((status) => (
        <div key={status.label} className="flex items-center gap-2">
          <span className="w-20 text-sm">{status.label}:</span>
          <Badge variant={status.variant}>
            <span className="h-2 w-2 rounded-full bg-current mr-1" />
            {status.label}
          </Badge>
        </div>
      ))}
    </div>
  );
}
```

### Removable Badges

```jsx live
function RemovableBadges() {
  const [tags, setTags] = React.useState(["React", "TypeScript", "UI"]);
  
  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary">
          {tag}
          <button
            onClick={() => removeTag(tag)}
            className="ml-1 hover:text-destructive"
          >
            ×
          </button>
        </Badge>
      ))}
      {tags.length === 0 && (
        <button onClick={() => setTags(["React", "TypeScript", "UI"])}>
          Reset tags
        </button>
      )}
    </div>
  );
}
```

### Badge Groups

```jsx live
function BadgeGroups() {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2">Technologies</h4>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline">JavaScript</Badge>
          <Badge variant="outline">Python</Badge>
          <Badge variant="outline">Go</Badge>
          <Badge variant="outline">Rust</Badge>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium mb-2">Difficulty</h4>
        <div className="flex gap-1">
          <Badge variant="success">Easy</Badge>
          <Badge variant="warning">Medium</Badge>
          <Badge variant="destructive">Hard</Badge>
        </div>
      </div>
    </div>
  );
}
```

## API Reference

### Badge Props

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
        <td><code>variant</code></td>
        <td><code>'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'</code></td>
        <td><code>'default'</code></td>
        <td>Visual style variant</td>
      </tr>
      <tr>
        <td><code>size</code></td>
        <td><code>'sm' | 'md' | 'lg'</code></td>
        <td><code>'md'</code></td>
        <td>Size of the badge</td>
      </tr>
      <tr>
        <td><code>className</code></td>
        <td><code>string</code></td>
        <td><code>undefined</code></td>
        <td>Additional CSS classes</td>
      </tr>
      <tr>
        <td><code>children</code></td>
        <td><code>ReactNode</code></td>
        <td><code>undefined</code></td>
        <td>Badge content</td>
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

## Styling

### CSS Variables

```css
--badge-background: hsl(var(--primary));
--badge-foreground: hsl(var(--primary-foreground));
--badge-border: transparent;
--badge-radius: var(--radius);
```

### Variants Styling

- **Default**: Primary colors with solid background
- **Secondary**: Muted colors for less emphasis
- **Destructive**: Red/error colors for warnings
- **Outline**: Border only with transparent background
- **Success**: Green colors for positive states
- **Warning**: Yellow/orange for caution
- **Info**: Blue colors for informational content

## Accessibility

The Badge component ensures accessibility through:
- Semantic HTML elements
- Proper color contrast ratios (WCAG AA)
- Screen reader friendly content
- `aria-label` when used as status indicators
- Keyboard navigation for interactive badges
- Focus indicators for clickable badges

## Best Practices

### Do's ✅

- Use appropriate variants for context
- Keep badge text concise and clear
- Ensure adequate color contrast
- Group related badges together
- Use consistent sizing within a context
- Provide alternative text for icon-only badges

### Don'ts ❌

- Don't overuse badges (visual clutter)
- Don't rely solely on color to convey meaning
- Don't make badges too small to read
- Don't use badges for long text
- Don't mix too many variants in one area

## Use Cases

- **Status indicators**: Show item states (active, pending, archived)
- **Notifications**: Display unread counts
- **Tags/Labels**: Categorize content
- **Feature flags**: Mark beta/new features
- **User roles**: Display permissions or access levels
- **Filters**: Show active filter selections
- **Metadata**: Display counts, versions, or IDs

## Related Components

- [Button](/docs/components/button) - For interactive actions
- [Alert](/docs/components/alert) - For important messages
- [Avatar](/docs/components/avatar) - For user representations
- [Card](/docs/components/card) - For containing badge groups
