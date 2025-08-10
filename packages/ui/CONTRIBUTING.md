# 🤝 Contributing to @dainabase/ui

First off, thank you for considering contributing to our Design System! 🎉

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Component Development](#component-development)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Style Guide](#style-guide)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/dainabase/directus-unified-platform.git
cd directus-unified-platform

# Install dependencies
pnpm install

# Navigate to the UI package
cd packages/ui

# Start development
pnpm dev
```

## 🛠️ Development Setup

### Environment Setup
```bash
# Install dependencies
pnpm install

# Build the Design System
pnpm build

# Run Storybook for development
pnpm sb

# Run tests
pnpm test

# Run linting
pnpm lint

# Format code
pnpm format
```

### Project Structure
```
packages/ui/
├── src/
│   ├── components/      # Component implementations
│   │   ├── [component]/
│   │   │   ├── index.tsx
│   │   │   ├── [component].tsx
│   │   │   ├── [component].stories.tsx
│   │   │   ├── [component].test.tsx
│   │   │   └── [component].mdx
│   ├── lib/             # Utilities and helpers
│   └── index.ts         # Main exports
├── tokens.ts            # Design tokens
└── tailwind.config.ts   # Tailwind configuration
```

## 🎯 How to Contribute

### Types of Contributions

#### 🐛 Bug Reports
- Use the bug report template
- Include reproduction steps
- Provide system information
- Include screenshots if applicable

#### ✨ Feature Requests
- Use the feature request template
- Explain the use case
- Provide examples
- Consider backwards compatibility

#### 🔧 Code Contributions
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Update documentation
6. Submit a pull request

## 🎨 Component Development

### Creating a New Component

1. **Plan the Component**
   - Define props interface
   - Consider accessibility
   - Plan variants and states
   - Review existing patterns

2. **Create Component Structure**
```bash
# Use the component generator
pnpm create:component ComponentName
```

This creates:
- `ComponentName/index.tsx` - Component export
- `ComponentName/ComponentName.tsx` - Implementation
- `ComponentName/ComponentName.stories.tsx` - Storybook stories
- `ComponentName/ComponentName.test.tsx` - Unit tests
- `ComponentName/ComponentName.mdx` - Documentation

3. **Implementation Checklist**
- [ ] TypeScript types defined
- [ ] Props documented with JSDoc
- [ ] Accessibility attributes (ARIA)
- [ ] Keyboard navigation
- [ ] Theme support (dark/light)
- [ ] Responsive design
- [ ] RTL support ready
- [ ] Performance optimized

### Component Guidelines

#### Props
```typescript
interface ComponentProps {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'outline';
  
  /** Size of the component */
  size?: 'sm' | 'md' | 'lg';
  
  /** Additional CSS classes */
  className?: string;
  
  /** Accessibility label */
  'aria-label'?: string;
}
```

#### Styling
- Use Tailwind classes via `cn()` utility
- Follow design tokens
- Support dark mode
- Ensure responsive behavior

#### Example Component
```typescript
import * as React from 'react';
import { cn } from '@/lib/utils';
import { ComponentProps } from './types';

export const Component = React.forwardRef<
  HTMLDivElement,
  ComponentProps
>(({ className, variant = 'primary', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'base-styles',
        variants[variant],
        className
      )}
      {...props}
    />
  );
});

Component.displayName = 'Component';
```

## 🧪 Testing Guidelines

### Test Requirements
- Minimum 90% coverage
- Test all props and variants
- Test accessibility
- Test keyboard navigation
- Test error states

### Test Structure
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Component } from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component>Content</Component>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    
    render(<Component onClick={onClick}>Click me</Component>);
    await user.click(screen.getByText('Click me'));
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is accessible', () => {
    const { container } = render(<Component aria-label="Test" />);
    expect(container.firstChild).toHaveAttribute('aria-label', 'Test');
  });
});
```

## 📚 Documentation

### Storybook Stories
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Component } from './Component';

const meta: Meta<typeof Component> = {
  title: 'Components/Component',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Component',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Component variant="primary">Primary</Component>
      <Component variant="secondary">Secondary</Component>
      <Component variant="outline">Outline</Component>
    </div>
  ),
};
```

### MDX Documentation
- Include usage examples
- Document all props
- Provide accessibility notes
- Include do's and don'ts
- Add migration guides if breaking changes

## 🔄 Pull Request Process

### Before Submitting
1. **Check existing PRs** to avoid duplicates
2. **Update from main** to avoid conflicts
3. **Run all checks locally**:
```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

### PR Requirements
- [ ] Clear, descriptive title
- [ ] Description of changes
- [ ] Link to related issue
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Screenshots for UI changes

### PR Title Format
```
type(scope): description

Examples:
feat(button): add loading state
fix(dialog): resolve focus trap issue
docs(select): update usage examples
perf(data-grid): optimize rendering
```

### Review Process
1. Automated checks must pass
2. Code review by maintainer
3. Design review for UI changes
4. Accessibility review if applicable
5. Performance review for large changes

## 🎨 Style Guide

### Code Style
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Import sorting

### Git Commit Messages
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `perf`: Performance
- `test`: Testing
- `chore`: Maintenance

### Component Naming
- PascalCase for components
- camelCase for utilities
- kebab-case for files
- SCREAMING_SNAKE_CASE for constants

### File Organization
```
ComponentName/
├── index.ts                    # Exports
├── ComponentName.tsx           # Implementation
├── ComponentName.types.ts      # TypeScript types
├── ComponentName.stories.tsx   # Storybook
├── ComponentName.test.tsx      # Tests
├── ComponentName.mdx          # Documentation
└── ComponentName.module.css   # Styles (if needed)
```

## 🏆 Recognition

Contributors are recognized in:
- README.md contributors section
- GitHub contributors page
- Release notes
- Component documentation

## 💬 Getting Help

- **Discord**: [Join our community](https://discord.gg/dainabase)
- **GitHub Issues**: For bugs and features
- **GitHub Discussions**: For questions
- **Email**: dev@dainabase.com

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to @dainabase/ui! 🙏

Your efforts help make our Design System better for everyone.
