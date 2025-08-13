---
id: hover-card
title: HoverCard
sidebar_position: 23
---

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@dainabase/ui';

# HoverCard

For sighted users to preview content available behind a link. Displays rich content in a floating card when hovering over a trigger element.

## Preview

<HoverCard>
  <HoverCardTrigger asChild>
    <Button variant="link">@nextjs</Button>
  </HoverCardTrigger>
  <HoverCardContent className="w-80">
    <div className="flex justify-between space-x-4">
      <Avatar>
        <AvatarImage src="https://github.com/vercel.png" />
        <AvatarFallback>VC</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold">@nextjs</h4>
        <p className="text-sm">
          The React Framework – created and maintained by @vercel.
        </p>
        <div className="flex items-center pt-2">
          <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
          <span className="text-xs text-muted-foreground">
            Joined December 2021
          </span>
        </div>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>

## Features

- **Rich Content Preview**: Display detailed information on hover
- **Delay Control**: Customizable open/close delays
- **Portal Rendering**: Renders in portal to avoid z-index issues
- **Collision Detection**: Smart positioning to stay in viewport
- **Keyboard Accessible**: Can be triggered via keyboard focus
- **Smooth Animations**: Fade and scale animations
- **Auto-close**: Closes when moving cursor away
- **Custom Styling**: Full control over appearance
- **Async Content**: Support for loading content dynamically

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@dainabase/ui';

export default function HoverCardDemo() {
  return (
    <HoverCard>
      <HoverCardTrigger>Hover me</HoverCardTrigger>
      <HoverCardContent>
        <p>This is the hover card content</p>
      </HoverCardContent>
    </HoverCard>
  );
}
```

## Examples

### Basic Hover Card

```tsx
<HoverCard>
  <HoverCardTrigger asChild>
    <span className="underline cursor-pointer">Hover for details</span>
  </HoverCardTrigger>
  <HoverCardContent>
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">Information</h4>
      <p className="text-sm text-muted-foreground">
        This is additional information that appears on hover.
      </p>
    </div>
  </HoverCardContent>
</HoverCard>
```

### User Profile Card

```tsx
<HoverCard>
  <HoverCardTrigger asChild>
    <Button variant="link" className="p-0 h-auto">
      John Doe
    </Button>
  </HoverCardTrigger>
  <HoverCardContent className="w-80">
    <div className="flex gap-4">
      <Avatar className="h-12 w-12">
        <AvatarImage src="/user.jpg" alt="John Doe" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <div className="space-y-1 flex-1">
        <h4 className="text-sm font-semibold">John Doe</h4>
        <p className="text-sm text-muted-foreground">
          Software Engineer at Acme Corp
        </p>
        <div className="flex items-center gap-2 pt-2">
          <Badge variant="secondary">Pro</Badge>
          <span className="text-xs text-muted-foreground">
            500 followers
          </span>
        </div>
        <div className="flex gap-2 pt-3">
          <Button size="sm">Follow</Button>
          <Button size="sm" variant="outline">Message</Button>
        </div>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>
```

### Link Preview Card

```tsx
<HoverCard>
  <HoverCardTrigger asChild>
    <a href="#" className="text-blue-600 hover:underline">
      https://example.com/article
    </a>
  </HoverCardTrigger>
  <HoverCardContent className="w-96">
    <div className="space-y-3">
      <img 
        src="/preview.jpg" 
        alt="Article preview"
        className="w-full h-48 object-cover rounded"
      />
      <div>
        <h3 className="font-semibold">Article Title</h3>
        <p className="text-sm text-muted-foreground mt-1">
          This is a preview of the article content that gives users
          an idea of what they'll find when they click the link.
        </p>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <Globe className="h-3 w-3" />
          example.com
          <span>•</span>
          5 min read
        </div>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>
```

### Product Preview Card

```tsx
<HoverCard>
  <HoverCardTrigger asChild>
    <div className="cursor-pointer">
      <img 
        src="/product-thumb.jpg" 
        alt="Product"
        className="w-32 h-32 object-cover rounded"
      />
    </div>
  </HoverCardTrigger>
  <HoverCardContent className="w-80">
    <div className="space-y-3">
      <img 
        src="/product-full.jpg" 
        alt="Product"
        className="w-full h-48 object-cover rounded"
      />
      <div>
        <h3 className="font-semibold">Premium Headphones</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Wireless noise-canceling headphones with 30-hour battery life
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-2xl font-bold">$299</span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">4.8 (2.3k)</span>
          </div>
        </div>
        <Button className="w-full mt-3">Quick View</Button>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>
```

### GitHub Repository Card

```tsx
<HoverCard>
  <HoverCardTrigger asChild>
    <a href="#" className="font-mono text-sm">
      vercel/next.js
    </a>
  </HoverCardTrigger>
  <HoverCardContent className="w-96">
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <GitHubLogoIcon className="h-5 w-5" />
          <div>
            <h4 className="text-sm font-semibold">vercel/next.js</h4>
            <p className="text-xs text-muted-foreground">Public</p>
          </div>
        </div>
        <Button size="sm" variant="outline">
          <Star className="h-3 w-3 mr-1" />
          Star
        </Button>
      </div>
      
      <p className="text-sm">
        The React Framework for Production
      </p>
      
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          JavaScript
        </span>
        <span className="flex items-center gap-1">
          <Star className="h-4 w-4" />
          118k
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="h-4 w-4" />
          23.5k
        </span>
      </div>
      
      <div className="pt-2 flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src="/contributor1.jpg" />
        </Avatar>
        <Avatar className="h-6 w-6">
          <AvatarImage src="/contributor2.jpg" />
        </Avatar>
        <Avatar className="h-6 w-6">
          <AvatarImage src="/contributor3.jpg" />
        </Avatar>
        <span className="text-xs text-muted-foreground">
          +2,847 contributors
        </span>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>
```

### Calendar Event Card

```tsx
<HoverCard>
  <HoverCardTrigger asChild>
    <Button variant="outline" className="w-full justify-start">
      <CalendarDays className="mr-2 h-4 w-4" />
      Team Meeting
    </Button>
  </HoverCardTrigger>
  <HoverCardContent className="w-80">
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Team Meeting</h4>
        <Badge>Recurring</Badge>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>2:00 PM - 3:00 PM</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>Conference Room A</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>12 attendees</span>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <p className="text-sm font-medium mb-2">Agenda:</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Q3 Review</li>
          <li>• Product Updates</li>
          <li>• Team Announcements</li>
        </ul>
      </div>
      
      <div className="flex gap-2">
        <Button size="sm" className="flex-1">Join</Button>
        <Button size="sm" variant="outline" className="flex-1">
          Details
        </Button>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>
```

### Image Gallery Preview

```tsx
<HoverCard>
  <HoverCardTrigger asChild>
    <Button variant="ghost" size="sm">
      <Image className="h-4 w-4 mr-2" />
      4 images
    </Button>
  </HoverCardTrigger>
  <HoverCardContent className="w-80 p-2">
    <div className="grid grid-cols-2 gap-2">
      {[1, 2, 3, 4].map((i) => (
        <img
          key={i}
          src={`/gallery-${i}.jpg`}
          alt={`Image ${i}`}
          className="w-full h-32 object-cover rounded"
        />
      ))}
    </div>
    <p className="text-xs text-center text-muted-foreground mt-2">
      Click to view full gallery
    </p>
  </HoverCardContent>
</HoverCard>
```

### Data Visualization Preview

```tsx
<HoverCard>
  <HoverCardTrigger asChild>
    <div className="inline-flex items-center gap-2 cursor-pointer">
      <TrendingUp className="h-4 w-4 text-green-500" />
      <span className="text-sm font-medium">+24.5%</span>
    </div>
  </HoverCardTrigger>
  <HoverCardContent className="w-96">
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold">Revenue Growth</h4>
        <p className="text-xs text-muted-foreground">
          Last 30 days vs previous period
        </p>
      </div>
      
      <div className="h-32 flex items-end gap-1">
        {[40, 55, 35, 70, 45, 80, 65, 90, 75, 95].map((height, i) => (
          <div
            key={i}
            className="flex-1 bg-primary rounded-t"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div>
          <p className="text-xs text-muted-foreground">Current</p>
          <p className="text-lg font-semibold">$48,250</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Previous</p>
          <p className="text-lg font-semibold">$38,750</p>
        </div>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>
```

### Code Preview Card

```tsx
<HoverCard>
  <HoverCardTrigger asChild>
    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm cursor-pointer">
      Button.tsx
    </code>
  </HoverCardTrigger>
  <HoverCardContent className="w-96">
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold font-mono">Button.tsx</h4>
        <Badge variant="secondary">Component</Badge>
      </div>
      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
        <code>{`export function Button({ 
  children, 
  variant = 'default',
  size = 'default',
  ...props 
}) {
  return (
    <button
      className={cn(
        buttonVariants({ variant, size }),
        props.className
      )}
      {...props}
    >
      {children}
    </button>
  );
}`}</code>
      </pre>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>15 lines</span>
        <span>•</span>
        <span>TypeScript</span>
        <span>•</span>
        <span>Last modified 2h ago</span>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>
```

## API Reference

### HoverCard

The root component that provides context.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Default open state |
| `onOpenChange` | `(open: boolean) => void` | - | Callback when open state changes |
| `openDelay` | `number` | `200` | Delay before showing (ms) |
| `closeDelay` | `number` | `100` | Delay before hiding (ms) |

### HoverCardTrigger

The element that triggers the hover card.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Merge props with child element |
| `children` | `ReactNode` | - | Trigger element |

### HoverCardContent

The hovering card content.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` | Preferred side |
| `sideOffset` | `number` | `4` | Distance from trigger |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Alignment |
| `alignOffset` | `number` | `0` | Offset from alignment |
| `avoidCollisions` | `boolean` | `true` | Avoid viewport edges |
| `collisionPadding` | `number` | `8` | Viewport edge padding |
| `className` | `string` | - | Additional CSS classes |

## Accessibility

The HoverCard component follows accessibility best practices:

- **Keyboard Support**: Can be triggered via focus
- **ARIA Attributes**: Proper roles and descriptions
- **Screen Readers**: Content is accessible
- **Delay Management**: Prevents accidental triggers
- **Focus Behavior**: Does not steal focus
- **Mobile Friendly**: Falls back gracefully on touch

## Best Practices

### Do's ✅

- Use for supplementary information preview
- Keep content concise and relevant
- Provide adequate delays to prevent flickering
- Test on both desktop and mobile
- Use for enhancing user experience
- Consider loading states for async content

### Don'ts ❌

- Don't put critical information only in hover cards
- Don't make hover areas too small
- Don't include interactive elements (use Popover)
- Don't use for mobile-first interfaces
- Don't nest hover cards
- Don't auto-play media in hover cards

## Use Cases

- **User Profiles**: Preview user information
- **Link Previews**: Show page content preview
- **Product Cards**: Display product details
- **Code Files**: Preview file contents
- **Calendar Events**: Show event details
- **Data Points**: Explain metrics or charts
- **Image Galleries**: Preview image collections
- **Repository Info**: Show GitHub/GitLab details

## Related Components

- [Tooltip](./tooltip) - For simple text hints
- [Popover](./popover) - For interactive floating content
- [Dialog](./dialog) - For modal interactions
- [Card](./card) - For static card layouts
- [ContextMenu](./context-menu) - For right-click menus