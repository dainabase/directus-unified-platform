# 🚀 @dainabase/ui Cheatsheet

## Quick Install

```bash
# npm
npm install @dainabase/ui

# pnpm
pnpm add @dainabase/ui

# yarn
yarn add @dainabase/ui
```

## Basic Setup

```tsx
// App.tsx
import '@dainabase/ui/styles.css';
import { ThemeProvider } from '@dainabase/ui';

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      {/* Your app */}
    </ThemeProvider>
  );
}
```

## Common Imports

```tsx
// Layout
import { AppShell, Card } from '@dainabase/ui';

// Forms
import { Button, Input, Select, Checkbox, Switch } from '@dainabase/ui';

// Feedback
import { Toast, Skeleton, Progress, Badge } from '@dainabase/ui';

// Overlays
import { Dialog, Sheet, Tooltip, DropdownMenu } from '@dainabase/ui';

// Data
import { DataGrid, DataGridAdv, Charts } from '@dainabase/ui';

// Date
import { Calendar, DatePicker, DateRangePicker } from '@dainabase/ui';

// Utils
import { cn } from '@dainabase/ui/lib/utils';
import { tokens } from '@dainabase/ui/tokens';
```

## Component Snippets

### Button Variants

```tsx
<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// States
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>
```

### Form with Validation

```tsx
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { email: '', password: '' }
});

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
    <Button type="submit">Submit</Button>
  </form>
</Form>
```

### Dialog Modal

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### DataGrid

```tsx
const columns = [
  { header: 'Name', accessorKey: 'name' },
  { header: 'Email', accessorKey: 'email' },
  {
    header: 'Actions',
    cell: ({ row }) => (
      <Button size="sm" onClick={() => edit(row.original)}>
        Edit
      </Button>
    )
  }
];

<DataGrid 
  data={users} 
  columns={columns}
  enableSorting
  enableFiltering
  enablePagination
/>
```

### Toast Notifications

```tsx
import { useToast } from '@dainabase/ui';

const { toast } = useToast();

// Success
toast({
  title: "Success",
  description: "Operation completed",
});

// Error
toast({
  title: "Error",
  description: "Something went wrong",
  variant: "destructive",
});
```

### Dropdown Menu

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={() => {}}>Edit</DropdownMenuItem>
    <DropdownMenuItem>Duplicate</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-destructive">
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Loading States

```tsx
// Skeleton
<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-4 w-[200px]" />

// Progress
<Progress value={33} />
<Progress value={66} className="w-[60%]" />
```

### Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

## Utility Classes

```tsx
// Spacing
className="p-4 m-2 space-y-4"

// Flexbox
className="flex items-center justify-between gap-4"

// Grid
className="grid grid-cols-3 gap-4"

// Typography
className="text-lg font-semibold text-muted-foreground"

// Background & Borders
className="bg-card border rounded-lg"

// Responsive
className="sm:flex md:grid lg:hidden"
```

## Hooks

```tsx
// Theme
import { useTheme } from '@dainabase/ui';
const { theme, setTheme } = useTheme();

// Toast
import { useToast } from '@dainabase/ui';
const { toast } = useToast();

// Media Query
import { useMediaQuery } from '@dainabase/ui/hooks';
const isMobile = useMediaQuery('(max-width: 768px)');
```

## Tokens Usage

```tsx
import { tokens } from '@dainabase/ui/tokens';

// Colors
style={{ color: tokens.colors.primary }}

// Spacing
style={{ padding: tokens.spacing.md }}

// Radius
style={{ borderRadius: tokens.radius.lg }}

// Shadows
style={{ boxShadow: tokens.shadows.lg }}
```

## i18n Formatters

```tsx
import { formatCurrency, formatDate, formatRelativeTime } from '@dainabase/ui/i18n';

formatCurrency(1234.56, 'en-US', 'USD'); // $1,234.56
formatDate(new Date(), 'fr-FR'); // 10 août 2025
formatRelativeTime(Date.now() - 3600000); // 1 hour ago
```

## Feature Flags

```tsx
import { isFeatureEnabled, FEATURE_FLAGS } from '@dainabase/ui/flags';

if (isFeatureEnabled(FEATURE_FLAGS.ENABLE_EXPERIMENTAL)) {
  // Use experimental feature
}
```

## Performance Tips

```tsx
// Lazy load heavy components
const Charts = lazy(() => import('@dainabase/ui/charts'));

// Use virtualization for large lists
<DataGridAdv 
  data={largeDataset} 
  enableVirtualization 
/>

// Memoize expensive computations
const processed = useMemo(
  () => expensiveOperation(data),
  [data]
);
```

## Common Patterns

```tsx
// Conditional rendering
{loading ? <Skeleton /> : <Content />}

// Error boundary
<ErrorBoundary fallback={<ErrorFallback />}>
  <Component />
</ErrorBoundary>

// Suspense for lazy loading
<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

## TypeScript

```tsx
// Component props
import type { ButtonProps } from '@dainabase/ui';

// Tokens type
import type { Tokens } from '@dainabase/ui/tokens';

// Extending components
interface CustomButtonProps extends ButtonProps {
  customProp?: string;
}
```

---

*Version: 0.2.0 | Updated: August 2025*
