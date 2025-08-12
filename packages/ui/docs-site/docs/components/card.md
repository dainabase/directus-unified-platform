---
id: card
title: Card
sidebar_position: 2
---

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@dainabase/ui';

# Card

Cards are versatile containers used to group and display content in a clean, organized way. They're fundamental building blocks for creating layouts and organizing information.

<div className="component-preview">
  <Card className="w-[350px]">
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
      <CardDescription>Card description goes here</CardDescription>
    </CardHeader>
    <CardContent>
      <p>Card content with any elements you need.</p>
    </CardContent>
    <CardFooter>
      <p>Card footer content</p>
    </CardFooter>
  </Card>
</div>

## Features

- **Flexible Layout**: Header, content, and footer sections
- **Responsive Design**: Adapts to container width
- **Hover Effects**: Optional elevation on hover
- **Dark Mode**: Automatic theme adaptation
- **Customizable**: Full styling control with className
- **Semantic HTML**: Proper structure for accessibility

## Installation

```bash
npm install @dainabase/ui
```

## Usage

```tsx
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@dainabase/ui';

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>Your profile overview</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Main content goes here</p>
      </CardContent>
      <CardFooter>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
```

## Examples

### Basic Card

```jsx live
function BasicCard() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm">Your call has been confirmed.</p>
          <p className="text-sm text-muted-foreground">1 hour ago</p>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Interactive Card

```jsx live
function InteractiveCard() {
  const [liked, setLiked] = React.useState(false);
  
  return (
    <Card className="w-[350px] hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Beautiful Sunset</CardTitle>
        <CardDescription>Photography by John Doe</CardDescription>
      </CardHeader>
      <CardContent>
        <img 
          src="https://via.placeholder.com/350x200" 
          alt="Sunset" 
          className="w-full h-[200px] object-cover rounded-md"
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setLiked(!liked)}
        >
          {liked ? '❤️' : '🤍'} {liked ? 'Liked' : 'Like'}
        </Button>
        <Button variant="ghost" size="sm">
          Share
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Card Grid

```jsx live
function CardGrid() {
  const cards = [
    { title: "Total Revenue", value: "$45,231.89", change: "+20.1%" },
    { title: "Subscriptions", value: "+2350", change: "+180.1%" },
    { title: "Sales", value: "+12,234", change: "+19%" },
    { title: "Active Now", value: "+573", change: "+201" }
  ];
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {card.change}
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### Profile Card

```jsx live
function ProfileCard() {
  return (
    <Card className="w-[350px]">
      <CardHeader className="text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
          JD
        </div>
        <CardTitle>Jane Doe</CardTitle>
        <CardDescription>Software Engineer</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground">
          Building amazing products with modern technologies.
          Passionate about clean code and user experience.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center gap-2">
        <Button size="sm">Connect</Button>
        <Button size="sm" variant="outline">Message</Button>
      </CardFooter>
    </Card>
  );
}
```

### Form Card

```jsx live
function FormCard() {
  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Enter your details to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border rounded-md"
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input 
            type="email" 
            className="w-full px-3 py-2 border rounded-md"
            placeholder="john@example.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <input 
            type="password" 
            className="w-full px-3 py-2 border rounded-md"
            placeholder="••••••••"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Create Account</Button>
      </CardFooter>
    </Card>
  );
}
```

## API Reference

### Card Props

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
        <td><code>children</code></td>
        <td><code>ReactNode</code></td>
        <td><code>undefined</code></td>
        <td>Card content</td>
      </tr>
      <tr>
        <td><code>onClick</code></td>
        <td><code>() => void</code></td>
        <td><code>undefined</code></td>
        <td>Click handler for interactive cards</td>
      </tr>
      <tr>
        <td><code>variant</code></td>
        <td><code>"default" | "outline" | "ghost"</code></td>
        <td><code>"default"</code></td>
        <td>Visual variant</td>
      </tr>
    </tbody>
  </table>
</div>

### Sub-components

All sub-components accept `className` and `children` props:

- **CardHeader** - Container for title and description
- **CardTitle** - Main heading of the card
- **CardDescription** - Subtitle or description text
- **CardContent** - Main content area
- **CardFooter** - Bottom section for actions

## Styling

### CSS Variables

```css
:root {
  --card-background: white;
  --card-border: 1px solid #e5e7eb;
  --card-radius: 0.5rem;
  --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  --card-padding: 1.5rem;
}

[data-theme='dark'] {
  --card-background: #1f2937;
  --card-border: 1px solid #374151;
}
```

### Custom Styles

```tsx
// With Tailwind classes
<Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
  <CardContent>Gradient Card</CardContent>
</Card>

// With hover effects
<Card className="hover:shadow-xl transition-shadow duration-300">
  <CardContent>Hoverable Card</CardContent>
</Card>

// Clickable card
<Card 
  className="cursor-pointer hover:bg-gray-50"
  onClick={() => console.log('Clicked')}
>
  <CardContent>Clickable Card</CardContent>
</Card>
```

## Accessibility

The Card component follows accessibility best practices:

- **Semantic HTML**: Uses appropriate elements (`article`, `header`, `footer`)
- **Keyboard Navigation**: Clickable cards are keyboard accessible
- **ARIA Labels**: Proper labeling for screen readers
- **Focus Management**: Clear focus indicators
- **Color Contrast**: Meets WCAG AA standards

## Best Practices

### Do's ✅

- Use cards to group related content
- Include clear headings with CardTitle
- Provide descriptions when helpful
- Maintain consistent card sizes in grids
- Use appropriate padding and spacing

### Don'ts ❌

- Don't nest cards within cards
- Don't overload cards with too much content
- Don't use cards for single elements
- Don't mix card styles inconsistently
- Don't forget hover/focus states for interactive cards

## Common Patterns

### Dashboard Widget

```tsx
function DashboardWidget({ title, value, icon, trend }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}
```

### Article Preview

```tsx
function ArticleCard({ article }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{article.title}</CardTitle>
        <CardDescription>
          By {article.author} • {article.date}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3">{article.excerpt}</p>
      </CardContent>
      <CardFooter>
        <Button variant="link" className="p-0">
          Read more →
        </Button>
      </CardFooter>
    </Card>
  );
}
```

## Related Components

- [Button](/docs/components/button) - For card actions
- [Avatar](/docs/components/avatar) - For profile cards
- [Badge](/docs/components/badge) - For status indicators
- [Separator](/docs/components/separator) - For dividing content
- [Skeleton](/docs/components/skeleton) - For loading states

## Resources

- [Material Design Cards](https://material.io/components/cards)
- [Card Pattern Guidelines](https://www.nngroup.com/articles/cards-component/)
- [Inclusive Components: Cards](https://inclusive-components.design/cards/)
