# Contributing to @dainabase/ui

Thank you for your interest in contributing to our Design System! This guide will help you get started.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/dainabase/directus-unified-platform.git
cd directus-unified-platform/packages/ui

# Install dependencies
pnpm install

# Start Storybook for development
pnpm sb

# Run tests in watch mode
pnpm test:watch
```

## 📋 Development Workflow

### 1. Creating a New Component

```bash
# Use the component template
mkdir src/components/YourComponent
touch src/components/YourComponent/YourComponent.tsx
touch src/components/YourComponent/YourComponent.stories.tsx
touch src/components/YourComponent/YourComponent.test.tsx
touch src/components/YourComponent/index.ts
```

### 2. Component Requirements

Every component must have:
- ✅ TypeScript implementation (.tsx)
- ✅ Storybook stories (.stories.tsx)
- ✅ Unit tests (.test.tsx)
- ✅ Proper TypeScript types
- ✅ JSDoc documentation
- ✅ Accessibility compliance (WCAG AAA)

### 3. Component Template

```tsx
// YourComponent.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const yourComponentVariants = cva(
  'base-classes',
  {
    variants: {
      variant: {
        default: 'default-classes',
        secondary: 'secondary-classes',
      },
      size: {
        sm: 'small-classes',
        md: 'medium-classes',
        lg: 'large-classes',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface YourComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof yourComponentVariants> {
  /** Additional prop documentation */
  customProp?: string;
}

/**
 * YourComponent displays...
 * 
 * @example
 * <YourComponent variant="secondary" size="lg">
 *   Content
 * </YourComponent>
 */
export const YourComponent = React.forwardRef<
  HTMLDivElement,
  YourComponentProps
>(({ className, variant, size, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(yourComponentVariants({ variant, size }), className)}
      {...props}
    />
  );
});

YourComponent.displayName = 'YourComponent';
```

## 🧪 Testing Guidelines

### Unit Tests
```tsx
import { render, screen } from '@testing-library/react';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent>Test</YourComponent>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
  
  it('applies variant classes', () => {
    const { container } = render(
      <YourComponent variant="secondary">Test</YourComponent>
    );
    expect(container.firstChild).toHaveClass('secondary-classes');
  });
});
```

### Storybook Stories
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from './YourComponent';

const meta: Meta<typeof YourComponent> = {
  title: 'Components/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Your Component',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <YourComponent>Default</YourComponent>
      <YourComponent variant="secondary">Secondary</YourComponent>
    </div>
  ),
};
```

## 📏 Code Standards

### TypeScript
- Strict mode enabled
- All props must be typed
- Use interfaces over types for component props
- Export types that consumers might need

### Styling
- Use Tailwind classes only
- No inline styles
- Use design tokens from `tokens.ts`
- Follow mobile-first responsive design

### Accessibility
- WCAG AAA compliance required
- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly

### Performance
- Components should be under 5KB gzipped
- Use React.memo for expensive components
- Lazy load heavy dependencies
- Implement proper code splitting

## 🔄 Pull Request Process

### 1. Before Submitting

```bash
# Run all checks
pnpm lint
pnpm typecheck
pnpm test:ci
pnpm build
pnpm size
```

### 2. PR Requirements

- [ ] Descriptive title following conventional commits
- [ ] Clear description of changes
- [ ] Tests pass with >95% coverage
- [ ] No bundle size regression (check with `pnpm size`)
- [ ] Storybook stories added/updated
- [ ] Documentation updated
- [ ] Screenshots for visual changes

### 3. PR Title Format

```
feat(component): add new YourComponent
fix(button): resolve hover state issue
docs(readme): update installation instructions
perf(lazy): optimize lazy loading strategy
```

## 🎨 Design Tokens

Always use design tokens from `tokens.ts`:

```tsx
// Good ✅
className="text-foreground bg-background"

// Bad ❌
className="text-gray-900 bg-white"
```

## 📦 Bundle Size

Keep bundle size under control:

```bash
# Check component size
pnpm size

# If adding new dependency
# 1. Consider if it's really needed
# 2. Check its size impact
# 3. Consider making it a peer dependency
# 4. Implement lazy loading if >5KB
```

## 🐛 Reporting Issues

### Bug Reports
Include:
- Component name and version
- Reproduction steps
- Expected vs actual behavior
- Code sandbox link if possible

### Feature Requests
Include:
- Use case description
- Proposed API
- Examples from other libraries
- Mockups if applicable

## 📚 Resources

- [Storybook](https://dainabase.github.io/directus-unified-platform/)
- [Design Tokens](./tokens.ts)
- [Tailwind Config](./tailwind.config.ts)
- [Component Guidelines](./COMPONENT_GUIDELINES.md)

## 💬 Getting Help

- GitHub Issues: [Bug Reports & Features](https://github.com/dainabase/directus-unified-platform/issues)
- Email: support@dainamics.ch
- Discord: [Join our community](https://discord.gg/dainamics)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to @dainabase/ui! 🎉
