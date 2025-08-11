# Card

A versatile container component with optional header, content, and footer sections for organizing related content.

## Import

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@dainabase/ui/card';
```

## Basic Usage

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@dainabase/ui/card';

export default function CardExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here. This is the main body of the card.</p>
      </CardContent>
      <CardFooter>
        <p>Card footer content</p>
      </CardFooter>
    </Card>
  );
}
```

## Props

### Card
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| className | `string` | - | No | Additional CSS classes |
| children | `ReactNode` | - | No | Card content |

### CardHeader
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| className | `string` | - | No | Additional CSS classes |
| children | `ReactNode` | - | No | Header content |

### CardTitle
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| className | `string` | - | No | Additional CSS classes |
| children | `ReactNode` | - | No | Title text |
| as | `ElementType` | `h3` | No | HTML element to render |

### CardDescription
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| className | `string` | - | No | Additional CSS classes |
| children | `ReactNode` | - | No | Description text |

### CardContent
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| className | `string` | - | No | Additional CSS classes |
| children | `ReactNode` | - | No | Main content |

### CardFooter
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| className | `string` | - | No | Additional CSS classes |
| children | `ReactNode` | - | No | Footer content |

## Examples

### Simple Card

```tsx
<Card className="w-[350px]">
  <CardHeader>
    <CardTitle>Simple Card</CardTitle>
  </CardHeader>
  <CardContent>
    <p>This is a simple card with minimal content.</p>
  </CardContent>
</Card>
```

### Card with Description

```tsx
<Card>
  <CardHeader>
    <CardTitle>Notifications</CardTitle>
    <CardDescription>You have 3 unread messages.</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <p>Message 1: Your order has been confirmed.</p>
      <p>Message 2: Payment received successfully.</p>
      <p>Message 3: Item shipped!</p>
    </div>
  </CardContent>
</Card>
```

### Card with Actions

```tsx
<Card className="w-[380px]">
  <CardHeader>
    <CardTitle>Create New Project</CardTitle>
    <CardDescription>
      Deploy your new project in one-click.
    </CardDescription>
  </CardHeader>
  <CardContent>
    <form>
      <div className="grid w-full items-center gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Name of your project" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="framework">Framework</Label>
          <Select>
            <SelectTrigger id="framework">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="next">Next.js</SelectItem>
              <SelectItem value="sveltekit">SvelteKit</SelectItem>
              <SelectItem value="astro">Astro</SelectItem>
              <SelectItem value="nuxt">Nuxt.js</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </form>
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Cancel</Button>
    <Button>Deploy</Button>
  </CardFooter>
</Card>
```

### Interactive Card

```tsx
<Card className="cursor-pointer hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle>Interactive Card</CardTitle>
    <CardDescription>Click to see more details</CardDescription>
  </CardHeader>
  <CardContent>
    <p>This card responds to hover and click events.</p>
  </CardContent>
</Card>
```

### Card Grid Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {[1, 2, 3, 4, 5, 6].map((item) => (
    <Card key={item}>
      <CardHeader>
        <CardTitle>Card {item}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Content for card {item}</p>
      </CardContent>
    </Card>
  ))}
</div>
```

## Styling

### With Tailwind CSS

```tsx
<Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
  <CardHeader>
    <CardTitle className="text-2xl font-bold">Gradient Card</CardTitle>
  </CardHeader>
  <CardContent>
    <p>A card with gradient background</p>
  </CardContent>
</Card>
```

### Dark Mode Support

```tsx
<Card className="dark:bg-gray-800 dark:border-gray-700">
  <CardHeader>
    <CardTitle className="dark:text-white">Dark Mode Card</CardTitle>
    <CardDescription className="dark:text-gray-400">
      Automatically adjusts to dark mode
    </CardDescription>
  </CardHeader>
  <CardContent className="dark:text-gray-300">
    <p>Content that adapts to theme changes</p>
  </CardContent>
</Card>
```

## Accessibility

- Semantic HTML structure with proper sections
- Supports keyboard navigation when interactive
- Proper heading hierarchy with CardTitle
- ARIA attributes for screen readers
- Focus management for interactive elements

## Best Practices

1. **Use semantic structure**: Always use the appropriate Card sub-components
2. **Keep it focused**: Each card should represent one cohesive piece of content
3. **Consistent spacing**: Use consistent padding and margins across cards
4. **Responsive design**: Consider how cards stack on mobile devices
5. **Limit content**: Don't overload cards with too much information

## Common Use Cases

- **Dashboard widgets**: Display metrics and KPIs
- **Product cards**: E-commerce product listings
- **User profiles**: Display user information
- **Content previews**: Blog posts, articles, media
- **Form containers**: Group related form fields
- **Notification cards**: System messages and alerts

## Performance Considerations

- Cards are lightweight components with minimal overhead
- Use lazy loading for cards with heavy content (images, charts)
- Consider virtualization for large lists of cards
- Optimize images within cards for web delivery

## TypeScript

Full TypeScript support with exported types:

```tsx
import type { 
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps 
} from '@dainabase/ui/card';

const MyCard: React.FC<CardProps> = (props) => {
  return <Card {...props} />;
};
```

## Testing

Example test with React Testing Library:

```tsx
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent } from '@dainabase/ui/card';

describe('Card', () => {
  it('renders card with title and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
        <CardContent>Test Content</CardContent>
      </Card>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
```

## Related Components

- [Button](./button.md)
- [Dialog](./dialog.md)
- [Alert](./alert.md)
- [Sheet](./sheet.md)
- [Accordion](./accordion.md)

## Resources

- [Component Source](https://github.com/dainabase/directus-unified-platform/tree/main/packages/ui/src/components/card)
- [Storybook Demo](https://directus-ui.vercel.app/?path=/story/card)
- [Design System Guidelines](../guides/design-system.md)

---

<div align="center">
  <a href="./README.md">← Back to Components</a>
</div>
