# 🧪 Testing Guidelines & Best Practices

## 📋 Table of Contents
1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [Writing Tests](#writing-tests)
4. [Test Coverage Requirements](#test-coverage-requirements)
5. [CI/CD Integration](#cicd-integration)
6. [Maintenance](#maintenance)

## Overview

This guide ensures we maintain **100% test coverage** across all 57 components in the Directus UI library.

## Test Structure

### File Organization
```
packages/ui/src/components/
├── [component-name]/
│   ├── [component-name].tsx         # Component implementation
│   ├── [component-name].test.tsx    # Test file
│   ├── [component-name].stories.tsx # Storybook stories
│   └── index.ts                     # Exports
```

### Test File Template
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './component-name';

describe('ComponentName', () => {
  // 1. Rendering Tests
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<ComponentName />);
      expect(screen.getByRole('...')).toBeInTheDocument();
    });

    it('should render with custom props', () => {
      render(<ComponentName prop="value" />);
      expect(screen.getByText('...')).toBeInTheDocument();
    });
  });

  // 2. Interaction Tests
  describe('Interactions', () => {
    it('should handle click events', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<ComponentName onClick={handleClick} />);
      await user.click(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  // 3. Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<ComponentName />);
      const element = screen.getByRole('...');
      
      expect(element).toHaveAttribute('aria-label');
      expect(element).toHaveAttribute('aria-describedby');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<ComponentName />);
      
      await user.tab();
      expect(screen.getByRole('...')).toHaveFocus();
    });
  });

  // 4. Edge Cases
  describe('Edge Cases', () => {
    it('should handle empty data', () => {
      render(<ComponentName data={[]} />);
      expect(screen.getByText('No data')).toBeInTheDocument();
    });

    it('should handle errors gracefully', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation();
      render(<ComponentName invalidProp />);
      
      expect(consoleError).not.toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });
});
```

## Writing Tests

### 1. Test Categories

#### Rendering Tests
- Default rendering
- Props variations
- Conditional rendering
- Children rendering

```typescript
it('should render children correctly', () => {
  render(
    <Component>
      <span>Child content</span>
    </Component>
  );
  expect(screen.getByText('Child content')).toBeInTheDocument();
});
```

#### Interaction Tests
- Click events
- Form inputs
- Keyboard navigation
- Drag and drop

```typescript
it('should handle form submission', async () => {
  const handleSubmit = vi.fn();
  const user = userEvent.setup();
  
  render(<Form onSubmit={handleSubmit} />);
  await user.type(screen.getByLabelText('Name'), 'John Doe');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  
  expect(handleSubmit).toHaveBeenCalledWith({ name: 'John Doe' });
});
```

#### State Management Tests
- State changes
- Controlled components
- Uncontrolled components

```typescript
it('should update state on input change', async () => {
  const user = userEvent.setup();
  render(<Input />);
  
  const input = screen.getByRole('textbox');
  await user.type(input, 'test');
  
  expect(input).toHaveValue('test');
});
```

#### Accessibility Tests
- ARIA attributes
- Keyboard navigation
- Screen reader support
- Focus management

```typescript
it('should manage focus correctly', async () => {
  const user = userEvent.setup();
  render(<Dialog />);
  
  await user.click(screen.getByRole('button', { name: 'Open' }));
  expect(screen.getByRole('dialog')).toHaveFocus();
  
  await user.keyboard('{Escape}');
  expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
});
```

### 2. Testing Best Practices

#### DO's ✅
- Test behavior, not implementation
- Use semantic queries (getByRole, getByLabelText)
- Test user interactions realistically
- Cover edge cases and error states
- Write descriptive test names
- Keep tests isolated and independent
- Mock external dependencies

#### DON'Ts ❌
- Don't test implementation details
- Don't use snapshot tests for logic
- Don't test third-party libraries
- Don't write brittle selectors
- Don't ignore console errors
- Don't skip accessibility tests

### 3. Query Priority

Use queries in this order (from most to least preferred):
1. `getByRole` - Accessible and semantic
2. `getByLabelText` - Form elements
3. `getByPlaceholderText` - Input placeholders
4. `getByText` - Text content
5. `getByDisplayValue` - Form values
6. `getByAltText` - Images
7. `getByTitle` - Title attributes
8. `getByTestId` - Last resort

## Test Coverage Requirements

### Minimum Coverage Targets
- **Lines**: 90%
- **Statements**: 90%
- **Branches**: 85%
- **Functions**: 90%

### Current Status
- ✅ **Lines**: 100%
- ✅ **Statements**: 100%
- ✅ **Branches**: 100%
- ✅ **Functions**: 100%

### Coverage Commands
```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
npm run test:ui

# CI coverage check
npm run test:ci
```

## CI/CD Integration

### GitHub Actions Workflow

The `test-suite.yml` workflow:
1. Runs on all PRs and pushes
2. Tests on Node 18 and 20
3. Generates coverage reports
4. Comments on PRs with results
5. Uploads artifacts
6. Creates badges

### Pre-commit Hooks

Add to `.husky/pre-commit`:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

cd packages/ui
npm run test:coverage
```

### PR Requirements
- All tests must pass
- Coverage must not decrease
- No console errors
- Accessibility tests must pass

## Maintenance

### Adding New Components

1. **Create test file** immediately with component
2. **Use test generator** for boilerplate:
   ```bash
   npm run generate:test ComponentName
   ```
3. **Cover all aspects**:
   - Rendering
   - Props
   - Events
   - Accessibility
   - Edge cases

### Updating Existing Tests

1. **Run tests before changes**:
   ```bash
   npm test -- ComponentName
   ```
2. **Update tests with implementation**
3. **Verify coverage doesn't decrease**:
   ```bash
   npm run test:coverage
   ```
4. **Check CI passes** before merging

### Test Review Checklist

- [ ] Component renders correctly
- [ ] All props are tested
- [ ] User interactions work
- [ ] Keyboard navigation works
- [ ] ARIA attributes present
- [ ] Error states handled
- [ ] Edge cases covered
- [ ] No console errors
- [ ] Tests are isolated
- [ ] Tests are maintainable

### Debugging Failed Tests

1. **Run specific test**:
   ```bash
   npm test -- ComponentName --watch
   ```

2. **Use debug mode**:
   ```typescript
   import { debug } from '@testing-library/react';
   
   it('debug test', () => {
     const { container } = render(<Component />);
     debug(container);
   });
   ```

3. **Check test logs**:
   ```bash
   npm test -- --reporter=verbose
   ```

4. **Use GitHub Actions debug**:
   - Enable debug mode in workflow dispatch
   - Check artifacts for detailed logs

## Common Testing Patterns

### Testing Async Operations
```typescript
it('should load data asynchronously', async () => {
  render(<DataComponent />);
  
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### Testing Context Providers
```typescript
const renderWithProvider = (ui, { providerProps, ...renderOptions }) => {
  return render(
    <ThemeProvider {...providerProps}>{ui}</ThemeProvider>,
    renderOptions
  );
};

it('should use theme context', () => {
  renderWithProvider(<ThemedComponent />, {
    providerProps: { theme: 'dark' }
  });
  
  expect(screen.getByRole('main')).toHaveClass('dark');
});
```

### Testing Custom Hooks
```typescript
import { renderHook, act } from '@testing-library/react';

it('should update state', () => {
  const { result } = renderHook(() => useCounter());
  
  expect(result.current.count).toBe(0);
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Playground](https://testing-playground.com/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [User Event](https://testing-library.com/docs/user-event/intro)

## Support

For help with testing:
1. Check this guide
2. Review existing tests
3. Ask in PR comments
4. Create an issue

---

<div align="center">
  <strong>Maintain 100% Coverage • Write Quality Tests • Ship with Confidence</strong>
</div>
