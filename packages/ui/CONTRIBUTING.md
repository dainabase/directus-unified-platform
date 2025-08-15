# Contributing to @dainabase/ui Design System

Thank you for your interest in contributing to the Dainabase UI Design System! We're excited to have you help us build a world-class component library.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Testing Guidelines](#testing-guidelines)
- [Component Guidelines](#component-guidelines)
- [Pull Request Process](#pull-request-process)
- [Commit Convention](#commit-convention)

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to maintain a welcoming environment for all contributors.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/directus-unified-platform.git
   cd directus-unified-platform/packages/ui
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run tests to ensure everything works:
   ```bash
   npm test
   ```

5. Start the development environment:
   ```bash
   npm run dev
   npm run storybook
   ```

## Development Workflow

### Directory Structure

```
packages/ui/
├── src/
│   └── components/
│       └── [component-name]/
│           ├── index.ts           # Exports
│           ├── [component].tsx    # Component implementation
│           ├── [component].test.tsx # Tests (REQUIRED)
│           ├── [component].stories.tsx # Storybook stories
│           └── types.ts          # TypeScript types
```

### Creating a New Component

1. Create the component directory:
   ```bash
   mkdir -p src/components/my-component
   ```

2. Implement the component following our patterns
3. Write comprehensive tests (minimum 80% coverage)
4. Create Storybook stories
5. Update the main export in `src/index.ts`

### Component Requirements

Every component MUST have:
- ✅ TypeScript types
- ✅ Unit tests (>80% coverage)
- ✅ Storybook stories
- ✅ JSDoc documentation
- ✅ Accessibility compliance (WCAG 2.1 AA)
- ✅ Responsive design
- ✅ Dark mode support

## Testing Guidelines

### Test Coverage Requirements

- **Minimum**: 80% per component
- **Target**: 95% overall
- **Required for**: All new components and modifications

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific component tests
npm test button

# Run E2E tests
npm run test:e2e

# Analyze coverage
npm run test:analyze
```

### Writing Tests

Use our test template from `test-utils/test-template.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './my-component';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByRole('...')).toBeInTheDocument();
  });

  it('handles interactions', () => {
    // Test user interactions
  });

  it('supports accessibility', () => {
    // Test ARIA attributes and keyboard navigation
  });
});
```

## Component Guidelines

### Naming Conventions

- **Components**: PascalCase (`Button`, `DatePicker`)
- **Files**: kebab-case (`date-picker.tsx`)
- **CSS classes**: Use our `cn()` utility
- **Props interfaces**: `ComponentNameProps`

### Performance

- Use `React.memo()` for expensive components
- Implement lazy loading where appropriate
- Keep bundle size minimal (<1KB per simple component)
- Optimize re-renders

### Accessibility

All components must:
- Have proper ARIA labels
- Support keyboard navigation
- Work with screen readers
- Meet color contrast requirements
- Include focus indicators

## Pull Request Process

### Before Submitting

1. **Test your changes**:
   ```bash
   npm test
   npm run type-check
   npm run lint
   ```

2. **Check bundle size**:
   ```bash
   npm run build:size
   ```

3. **Update documentation** if needed

### PR Guidelines

- **Title**: Use conventional commits format
- **Description**: Explain what and why
- **Size**: Keep PRs small and focused
- **Screenshots**: Include for UI changes
- **Tests**: All tests must pass
- **Reviews**: Requires 1 approval

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
- [ ] Coverage maintained/improved
- [ ] E2E tests updated

## Screenshots
(if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No bundle size regression
```

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions/changes
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
feat(button): add loading state
fix(dialog): resolve focus trap issue
docs: update contributing guidelines
test(card): improve coverage to 95%
chore: bump version to 1.3.0
```

## Release Process

We use semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes

Releases are automated via GitHub Actions when changes are merged to `main`.

## Getting Help

- 📖 [Documentation](https://github.com/dainabase/directus-unified-platform/wiki)
- 💬 [Discord](https://discord.gg/dainabase)
- 🐛 [Issue Tracker](https://github.com/dainabase/directus-unified-platform/issues)
- 📧 [Email](mailto:dev@dainabase.com)

## Recognition

Contributors are recognized in:
- [CONTRIBUTORS.md](CONTRIBUTORS.md)
- Release notes
- Project README

Thank you for contributing to @dainabase/ui! 🎉
