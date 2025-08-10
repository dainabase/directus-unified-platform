# Contributing to @dainabase/ui Design System

Thank you for your interest in contributing to our Design System! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Component Guidelines](#component-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read and follow our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Accept feedback gracefully

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher
- Git
- VS Code (recommended) with these extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features

### Setup

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/directus-unified-platform.git
cd directus-unified-platform
```

3. Install dependencies:
```bash
pnpm install
```

4. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

## Development Workflow

### Working on Components

1. Navigate to the UI package:
```bash
cd packages/ui
```

2. Start Storybook for development:
```bash
pnpm sb
```

3. Create your component in the appropriate directory:
```
src/components/your-component/
├── index.ts              # Exports
├── your-component.tsx    # Component implementation
├── your-component.stories.tsx  # Storybook stories
├── your-component.mdx    # Documentation
└── your-component.test.tsx     # Tests
```

### Component Checklist

When creating or modifying a component, ensure:

- [ ] **TypeScript**: Full type safety with proper interfaces
- [ ] **Accessibility**: WCAG 2.1 AA compliant
- [ ] **Tokens**: Use design tokens from `tokens.ts`
- [ ] **Variants**: Support all necessary variants
- [ ] **Props**: Well-documented with JSDoc comments
- [ ] **Stories**: Complete Storybook stories
- [ ] **Documentation**: MDX documentation with examples
- [ ] **Tests**: Unit tests with good coverage
- [ ] **Responsive**: Works on all screen sizes
- [ ] **Dark Mode**: Supports light and dark themes

## Component Guidelines

### File Structure

```tsx
// your-component.tsx
import * as React from "react";
import { cn } from "../../lib/utils";
import { tokens } from "../../../tokens";

export interface YourComponentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Description of the prop */
  variant?: "primary" | "secondary";
  /** Another prop description */
  size?: "sm" | "md" | "lg";
}

export const YourComponent = React.forwardRef<
  HTMLDivElement,
  YourComponentProps
>(({ className, variant = "primary", size = "md", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        // Base styles
        "rounded-md transition-colors",
        // Variant styles
        variant === "primary" && "bg-primary text-primary-foreground",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        // Size styles
        size === "sm" && "p-2 text-sm",
        size === "md" && "p-4 text-base",
        size === "lg" && "p-6 text-lg",
        className
      )}
      {...props}
    />
  );
});

YourComponent.displayName = "YourComponent";
```

### Storybook Stories

```tsx
// your-component.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { YourComponent } from "./your-component";

const meta = {
  title: "Components/YourComponent",
  component: YourComponent,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Default Component",
  },
};

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary Variant",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary Variant",
  },
};
```

### Documentation

```mdx
// your-component.mdx
import { Meta, Story, Canvas, ArgsTable } from "@storybook/blocks";
import * as YourComponentStories from "./your-component.stories";

<Meta of={YourComponentStories} />

# YourComponent

A brief description of what the component does and when to use it.

## Usage

\`\`\`tsx
import { YourComponent } from "@dainabase/ui";

function Example() {
  return <YourComponent variant="primary">Content</YourComponent>;
}
\`\`\`

## Examples

<Canvas of={YourComponentStories.Default} />

## Props

<ArgsTable of={YourComponentStories.Default} />

## Accessibility

- Keyboard navigation support
- ARIA attributes
- Screen reader compatibility

## Best Practices

- When to use this component
- When not to use this component
- Common patterns
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:ci
```

### Writing Tests

```tsx
// your-component.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YourComponent } from "./your-component";

describe("YourComponent", () => {
  it("renders correctly", () => {
    render(<YourComponent>Test Content</YourComponent>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("applies variant styles", () => {
    const { rerender } = render(
      <YourComponent variant="primary">Primary</YourComponent>
    );
    expect(screen.getByText("Primary")).toHaveClass("bg-primary");

    rerender(<YourComponent variant="secondary">Secondary</YourComponent>);
    expect(screen.getByText("Secondary")).toHaveClass("bg-secondary");
  });

  it("handles user interactions", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<YourComponent onClick={handleClick}>Click me</YourComponent>);
    
    await user.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Documentation

### Guidelines

- Write clear, concise documentation
- Include code examples for all use cases
- Document all props with TypeScript/JSDoc
- Add accessibility notes
- Include migration guides for breaking changes

### Running Documentation

```bash
# Start Storybook locally
pnpm sb

# Build static documentation
pnpm build:sb:static
```

## Pull Request Process

### Before Submitting

1. **Validate your code**:
```bash
bash scripts/validate-ds.sh
```

2. **Format your code**:
```bash
pnpm format
```

3. **Update documentation** if needed

4. **Add changeset** for version management:
```bash
pnpm changeset
```

### PR Guidelines

1. **Title**: Use conventional commit format
   - `feat(ui): add new component`
   - `fix(ui): resolve button hover issue`
   - `docs(ui): update README`

2. **Description**: Include:
   - What changes were made
   - Why they were necessary
   - Screenshots for UI changes
   - Breaking changes (if any)

3. **Checklist**:
   - [ ] Code follows style guidelines
   - [ ] Tests pass
   - [ ] Documentation updated
   - [ ] Changeset added
   - [ ] Screenshots attached (for UI changes)

### Review Process

1. Automated checks must pass
2. Code review by maintainers
3. Changes requested (if needed)
4. Approval and merge

## Release Process

We use Changesets for versioning:

1. Contributors add changesets with their PRs
2. Maintainers run version command to update versions
3. Automated release to GitHub Packages

## Need Help?

- **Discord**: Join our community (coming soon)
- **Issues**: [GitHub Issues](https://github.com/dainabase/directus-unified-platform/issues)
- **Email**: admin@dainamics.ch

## Recognition

Contributors will be recognized in:
- Release notes
- README contributors section
- GitHub contributors page

Thank you for contributing to @dainabase/ui! 🎉
