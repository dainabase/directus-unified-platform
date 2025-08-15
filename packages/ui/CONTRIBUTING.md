# Contributing to @dainabase/ui

First off, thank you for considering contributing to @dainabase/ui! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Testing Guidelines](#testing-guidelines)
- [Style Guidelines](#style-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Component Guidelines](#component-guidelines)

## 📜 Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **System information** (OS, browser, Node version)
- **Package version**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use case** - Why is this needed?
- **Proposed solution** - How should it work?
- **Alternative solutions** - What else did you consider?
- **Additional context** - Mockups, examples, etc.

### Contributing Code

1. **Find an issue** - Look for issues labeled `good first issue` or `help wanted`
2. **Comment on the issue** - Let us know you're working on it
3. **Fork the repository** - Create your own copy
4. **Create a branch** - Use a descriptive name
5. **Make your changes** - Follow our guidelines
6. **Test thoroughly** - Ensure 95%+ coverage
7. **Submit a PR** - Link to the issue

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- Git

### Setup Steps

```bash
# Clone the repository
git clone https://github.com/dainabase/directus-unified-platform.git
cd directus-unified-platform

# Install dependencies
pnpm install

# Navigate to UI package
cd packages/ui

# Start development
pnpm dev

# Run tests
pnpm test

# Build package
pnpm build
```

## 💻 Development Workflow

### Directory Structure

```
packages/ui/
├── src/
│   ├── components/     # Component source files
│   │   └── [name]/
│   │       ├── index.tsx
│   │       ├── [name].tsx
│   │       ├── [name].test.tsx
│   │       ├── [name].stories.tsx
│   │       └── types.ts
│   ├── lib/            # Utilities
│   ├── styles/         # Global styles
│   └── types/          # TypeScript types
├── tests/              # Integration tests
└── docs/               # Documentation
```

### Creating a New Component

1. **Create component directory**
```bash
mkdir src/components/my-component
```

2. **Create component files**
```tsx
// src/components/my-component/my-component.tsx
import React from 'react';
import { cn } from '../../lib/utils';

export interface MyComponentProps {
  children?: React.ReactNode;
  className?: string;
}

export const MyComponent = React.forwardRef<
  HTMLDivElement,
  MyComponentProps
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('my-component', className)}
      {...props}
    >
      {children}
    </div>
  );
});

MyComponent.displayName = 'MyComponent';
```

3. **Create tests** (REQUIRED - maintain 95% coverage)
```tsx
// src/components/my-component/my-component.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from './my-component';

describe('MyComponent', () => {
  it('renders children correctly', () => {
    render(<MyComponent>Test Content</MyComponent>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <MyComponent className="custom">Test</MyComponent>
    );
    expect(container.firstChild).toHaveClass('my-component', 'custom');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<MyComponent ref={ref}>Test</MyComponent>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
```

4. **Create Storybook story**
```tsx
// src/components/my-component/my-component.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './my-component';

const meta: Meta<typeof MyComponent> = {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default MyComponent',
  },
};

export const WithCustomClass: Story = {
  args: {
    children: 'Styled MyComponent',
    className: 'bg-blue-500 text-white p-4',
  },
};
```

5. **Export from index**
```tsx
// src/components/my-component/index.tsx
export * from './my-component';
```

6. **Add to main exports**
```tsx
// src/index.ts
export * from './components/my-component';
```

## 🧪 Testing Guidelines

### Test Requirements

- **Minimum 95% coverage** required
- All components must have tests
- Test all props and states
- Test accessibility features
- Test keyboard navigation

### Testing Patterns

```tsx
// Component rendering
it('renders without crashing', () => {
  render(<Component />);
});

// Props testing
it('handles all props correctly', () => {
  const props = {
    variant: 'primary',
    size: 'lg',
    disabled: true,
  };
  render(<Component {...props} />);
  // Assert prop effects
});

// Event handling
it('calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click</Button>);
  fireEvent.click(screen.getByText('Click'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});

// Accessibility
it('is keyboard navigable', () => {
  render(<Component />);
  const element = screen.getByRole('button');
  element.focus();
  expect(element).toHaveFocus();
});

// Edge cases
it('handles edge cases gracefully', () => {
  render(<Component value={null} />);
  // Should not crash
});
```

## 🎨 Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Provide complete type definitions
- Use interfaces over types when possible
- Export all public types

### React

- Use functional components with hooks
- Use `React.forwardRef` for components that need ref
- Implement proper display names
- Handle all edge cases

### CSS

- Use Tailwind CSS classes
- Follow mobile-first approach
- Ensure dark mode support
- Maintain consistent spacing

### Accessibility

- WCAG 2.1 AAA compliance required
- Proper ARIA attributes
- Keyboard navigation support
- Screen reader compatibility

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Code style changes
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding tests
- **chore**: Maintenance tasks
- **ci**: CI/CD changes

### Examples

```bash
feat(button): add loading state prop

fix(dialog): correct focus trap behavior

docs: update migration guide for v1.3

test(datagrid): add virtualization tests

perf(bundle): reduce size by 10KB
```

## 🚀 Pull Request Process

### Before Submitting

1. **Test coverage** - Ensure 95%+ coverage
2. **Lint** - Run `pnpm lint`
3. **Build** - Run `pnpm build`
4. **Tests** - Run `pnpm test`
5. **Bundle size** - Check with `pnpm analyze`

### PR Guidelines

1. **Link to issue** - Reference the issue being fixed
2. **Clear description** - Explain what and why
3. **Screenshots** - For UI changes
4. **Breaking changes** - Clearly marked
5. **Tests included** - All new code must be tested
6. **Documentation** - Update if needed

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Coverage maintained at 95%+
- [ ] Tested in multiple browsers

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
- [ ] Bundle size checked

## Screenshots
(if applicable)

Fixes #(issue number)
```

## 🏗️ Component Guidelines

### Component Checklist

- [ ] TypeScript definitions complete
- [ ] Props documented with JSDoc
- [ ] Ref forwarding implemented
- [ ] Display name set
- [ ] Memoization where appropriate
- [ ] Error boundaries considered
- [ ] Loading states handled
- [ ] Empty states handled
- [ ] Accessibility complete
- [ ] Dark mode supported
- [ ] RTL supported
- [ ] Tests written (95%+ coverage)
- [ ] Storybook story created
- [ ] Documentation added

### Performance Considerations

- Use `React.memo` for expensive components
- Implement `useMemo` and `useCallback` appropriately
- Consider virtualization for lists
- Lazy load heavy components
- Optimize re-renders

## 🎯 Acceptance Criteria

For a PR to be merged, it must:

1. **Pass all CI checks**
2. **Maintain 95% test coverage**
3. **Have no linting errors**
4. **Be reviewed by maintainer**
5. **Include tests for new code**
6. **Update documentation if needed**
7. **Not increase bundle size significantly**
8. **Follow all guidelines above**

## 📞 Getting Help

- **Discord**: [Join our community](https://discord.gg/dainabase)
- **Issues**: [GitHub Issues](https://github.com/dainabase/directus-unified-platform/issues)
- **Email**: dev@dainabase.com
- **Documentation**: [Read the docs](https://dainabase.github.io/ui)

## 🙏 Recognition

Contributors will be:
- Listed in our README
- Mentioned in release notes
- Given credit in the changelog
- Invited to our contributors Discord channel

Thank you for contributing to @dainabase/ui! 🚀

---

*Last updated: August 17, 2025*