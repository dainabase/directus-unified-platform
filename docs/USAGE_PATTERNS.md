# 📚 Usage Patterns & Best Practices

## Overview

This guide provides patterns, best practices, and common pitfalls when using the @dainabase/ui Design System.

## Core Principles

1. **Tokens First** - Always use design tokens
2. **Composition** - Build complex UIs from simple components
3. **Accessibility** - Every interaction must be accessible
4. **Performance** - Lazy load when possible
5. **Consistency** - Follow established patterns

## Component Patterns

### Forms

#### ✅ DO: Use Form Component with Validation

```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@dainabase/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function LoginForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

#### ❌ DON'T: Mix Form Libraries

```tsx
// Bad: Mixing Formik with our Form component
import { Formik } from 'formik';
import { Input } from '@dainabase/ui';
```

### Data Display

#### ✅ DO: Use DataGrid for Large Datasets

```tsx
import { DataGridAdv } from '@dainabase/ui';

function UserTable({ users }) {
  const columns = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Email', accessorKey: 'email' },
  ];

  return (
    <DataGridAdv
      data={users}
      columns={columns}
      enableVirtualization
      enableSorting
      enableFiltering
    />
  );
}
```

#### ❌ DON'T: Render Large Lists Without Virtualization

```tsx
// Bad: Will cause performance issues
function UserList({ users }) {
  return (
    <div>
      {users.map(user => (
        <Card key={user.id}>{user.name}</Card>
      ))}
    </div>
  );
}
```

### Loading States

#### ✅ DO: Use Skeleton for Content Loading

```tsx
import { Skeleton } from '@dainabase/ui';

function ContentLoader() {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    );
  }
  
  return <Content />;
}
```

#### ❌ DON'T: Use Generic Spinners Everywhere

```tsx
// Bad: Poor UX
if (loading) return <Spinner />;
```

### Modals & Overlays

#### ✅ DO: Use Appropriate Overlay Component

```tsx
// Simple confirmation
<Dialog>
  <DialogTrigger>Delete</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
    </DialogHeader>
  </DialogContent>
</Dialog>

// Side panel for forms
<Sheet>
  <SheetTrigger>Edit Profile</SheetTrigger>
  <SheetContent>
    <ProfileForm />
  </SheetContent>
</Sheet>

// Quick actions
<Tooltip>
  <TooltipTrigger>?</TooltipTrigger>
  <TooltipContent>Help text</TooltipContent>
</Tooltip>
```

#### ❌ DON'T: Nest Modals

```tsx
// Bad: Confusing UX
<Dialog>
  <DialogContent>
    <Dialog>
      <DialogContent>Nested modal</DialogContent>
    </Dialog>
  </DialogContent>
</Dialog>
```

## Styling Patterns

### ✅ DO: Use Design Tokens

```tsx
// Good: Using tokens
import { tokens } from '@dainabase/ui/tokens';

const styles = {
  color: tokens.colors.primary,
  spacing: tokens.spacing.md,
};
```

### ❌ DON'T: Use Arbitrary Values

```tsx
// Bad: Magic numbers
const styles = {
  color: '#0A84FF',
  padding: '16px',
};
```

### ✅ DO: Use Tailwind Utilities

```tsx
// Good: Consistent spacing
<div className="p-4 m-2 rounded-lg bg-card">
  <h2 className="text-lg font-semibold">Title</h2>
</div>
```

### ❌ DON'T: Mix Styling Approaches

```tsx
// Bad: Inconsistent
<div 
  className="p-4" 
  style={{ margin: '8px', backgroundColor: '#fff' }}
>
```

## Performance Patterns

### ✅ DO: Lazy Load Heavy Components

```tsx
import { lazy, Suspense } from 'react';

const Charts = lazy(() => import('@dainabase/ui/charts'));

function Dashboard() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Charts data={data} />
    </Suspense>
  );
}
```

### ❌ DON'T: Import Everything

```tsx
// Bad: Increases bundle size
import * as UI from '@dainabase/ui';
```

### ✅ DO: Use Memoization Wisely

```tsx
import { memo, useMemo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  const processed = useMemo(
    () => processData(data),
    [data]
  );
  
  return <DataGrid data={processed} />;
});
```

### ❌ DON'T: Over-Optimize

```tsx
// Bad: Unnecessary for simple components
const Button = memo(() => {
  return <button>Click</button>;
});
```

## Accessibility Patterns

### ✅ DO: Provide Proper Labels

```tsx
<FormItem>
  <FormLabel htmlFor="email">Email Address</FormLabel>
  <Input id="email" type="email" aria-required="true" />
</FormItem>
```

### ❌ DON'T: Use Placeholder as Label

```tsx
// Bad: Not accessible
<Input placeholder="Enter email" />
```

### ✅ DO: Handle Focus Management

```tsx
function Modal({ isOpen, onClose }) {
  const closeRef = useRef();
  
  useEffect(() => {
    if (isOpen) {
      closeRef.current?.focus();
    }
  }, [isOpen]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogClose ref={closeRef} />
      </DialogContent>
    </Dialog>
  );
}
```

## Common Mistakes

### 1. Forgetting to Import Styles

```tsx
// ❌ Missing styles import
import { Button } from '@dainabase/ui';

// ✅ Include styles
import '@dainabase/ui/styles.css';
import { Button } from '@dainabase/ui';
```

### 2. Not Handling Loading States

```tsx
// ❌ No loading state
function DataView() {
  const { data } = useQuery();
  return <DataGrid data={data} />;
}

// ✅ Proper loading handling
function DataView() {
  const { data, loading } = useQuery();
  
  if (loading) return <Skeleton />;
  return <DataGrid data={data} />;
}
```

### 3. Incorrect Event Handler Usage

```tsx
// ❌ Creating new function on each render
<Button onClick={() => handleClick(id)}>Click</Button>

// ✅ Stable reference
const handleButtonClick = useCallback(
  () => handleClick(id),
  [id]
);
<Button onClick={handleButtonClick}>Click</Button>
```

### 4. Missing Error Boundaries

```tsx
// ✅ Wrap complex components
<ErrorBoundary fallback={<ErrorFallback />}>
  <ComplexDataGrid />
</ErrorBoundary>
```

## Testing Patterns

### Component Testing

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('button click', async () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  await userEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Accessibility Testing

```tsx
import { axe } from '@axe-core/react';

test('no accessibility violations', async () => {
  const { container } = render(<Form />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Migration Guide

### From v0.1.x to v0.2.x

```tsx
// Old (v0.1.x)
import { Calendar } from '@dainabase/ui/calendar';

// New (v0.2.x)
import { Calendar } from '@dainabase/ui';
```

### From Other Libraries

#### From Material-UI

```tsx
// MUI
import { TextField } from '@mui/material';
<TextField label="Email" />

// @dainabase/ui
import { Input, FormLabel } from '@dainabase/ui';
<>
  <FormLabel>Email</FormLabel>
  <Input />
</>
```

#### From Ant Design

```tsx
// Ant Design
import { Table } from 'antd';
<Table dataSource={data} columns={columns} />

// @dainabase/ui
import { DataGrid } from '@dainabase/ui';
<DataGrid data={data} columns={columns} />
```

---

*Last updated: August 10, 2025*
