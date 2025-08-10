# Migration Guide: v0.4.0 → v1.0.0

This guide will help you migrate from @dainabase/ui v0.4.0 to v1.0.0. While we've maintained backward compatibility for most APIs, there are some breaking changes related to bundle optimization and dependency management.

## 🚨 Breaking Changes

### 1. Dependency Management

The biggest change in v1.0.0 is the move of heavy dependencies to `peerDependencies` to reduce bundle size.

#### Before (v0.4.0)
```json
{
  "dependencies": {
    "@dainabase/ui": "^0.4.0"
  }
}
```

#### After (v1.0.0)

**Option A: Core Components Only (45KB)**
```json
{
  "dependencies": {
    "@dainabase/ui": "^1.0.0"
  }
}
```

**Option B: With Specific Features**
```json
{
  "dependencies": {
    "@dainabase/ui": "^1.0.0",
    "recharts": "^2.10.3",           // Only if using Charts
    "@tanstack/react-table": "^8.10.0", // Only if using DataGrid
    "date-fns": "^3.6.0",            // Only if using date components
    "react-hook-form": "^7.48.2",   // Only if using Form
    "zod": "^3.22.4"                 // Only if using form validation
  }
}
```

**Option C: Full Installation (All Features)**
```bash
pnpm add @dainabase/ui recharts @tanstack/react-table date-fns framer-motion react-hook-form zod cmdk react-day-picker
```

### 2. Import Changes for Heavy Components

Components that depend on large libraries now require different import paths and Suspense boundaries.

#### Charts Component

**Before (v0.4.0)**
```tsx
import { Charts } from '@dainabase/ui';

<Charts data={data} />
```

**After (v1.0.0)**
```tsx
import { Suspense } from 'react';
import { Charts } from '@dainabase/ui/lazy';
import { Skeleton } from '@dainabase/ui';

<Suspense fallback={<Skeleton className="h-[300px]" />}>
  <Charts data={data} />
</Suspense>
```

#### DataGrid Component

**Before (v0.4.0)**
```tsx
import { DataGrid } from '@dainabase/ui';

<DataGrid columns={columns} data={data} />
```

**After (v1.0.0)**
```tsx
import { Suspense } from 'react';
import { DataGrid } from '@dainabase/ui/lazy';
import { Skeleton } from '@dainabase/ui';

<Suspense fallback={<Skeleton className="h-[400px]" />}>
  <DataGrid columns={columns} data={data} />
</Suspense>
```

### 3. Components Affected by Lazy Loading

The following components are now lazy-loaded and require Suspense:

- `Charts` - Requires `recharts` peer dependency
- `DataGrid` - Requires `@tanstack/react-table`
- `DataGridAdv` - Requires `@tanstack/react-table`
- `Calendar` - Requires `date-fns` and `react-day-picker`
- `DatePicker` - Requires `date-fns` and `react-day-picker`
- `DateRangePicker` - Requires `date-fns` and `react-day-picker`
- `Form` - Requires `react-hook-form` and `zod`
- `FormsDemo` - Requires `react-hook-form` and `zod`
- `CommandMenu` - Requires `cmdk`

### 4. New Import Paths

v1.0.0 introduces granular import paths for better tree-shaking:

```tsx
// Core components (always available)
import { Button, Card, Badge } from '@dainabase/ui';

// Lazy-loaded components
import { Charts, DataGrid } from '@dainabase/ui/lazy';

// Direct chunk imports (advanced usage)
import { Charts } from '@dainabase/ui/charts';
import { DataGrid } from '@dainabase/ui/data-grid';
```

## ✅ Components That Haven't Changed

The following core components work exactly the same as v0.4.0:

- `Button`, `Card`, `Badge`, `Icon`, `Avatar`, `Tooltip`, `Skeleton`
- `Alert`, `AlertDialog`, `AspectRatio`, `Breadcrumb`
- `Checkbox`, `Dialog`, `Dropdown`, `Input`, `Label`
- `Progress`, `RadioGroup`, `ScrollArea`, `Select`, `Separator`
- `Sheet`, `Slider`, `Switch`, `Tabs`, `Textarea`, `Toast`

## 🚀 Migration Steps

### Step 1: Update Package Version

```bash
pnpm update @dainabase/ui@^1.0.0
```

### Step 2: Install Required Peer Dependencies

Check which components you're using and install only the necessary peer dependencies:

```bash
# Check your codebase for usage
grep -r "Charts\|DataGrid\|Calendar\|DatePicker\|Form" src/

# Install based on usage
pnpm add recharts  # If using Charts
pnpm add @tanstack/react-table  # If using DataGrid
pnpm add date-fns react-day-picker  # If using date components
pnpm add react-hook-form zod  # If using Form
```

### Step 3: Update Imports

Use your IDE's search and replace to update imports:

```bash
# Find all UI imports
grep -r "from '@dainabase/ui'" src/

# Update heavy component imports manually
# Add /lazy to imports for: Charts, DataGrid, Calendar, DatePicker, Form
```

### Step 4: Add Suspense Boundaries

Wrap lazy-loaded components with Suspense:

```tsx
// Create a reusable loading component
const ComponentLoader = ({ height = "400px" }) => (
  <Skeleton className={`w-full h-[${height}]`} />
);

// Use with lazy components
<Suspense fallback={<ComponentLoader />}>
  <Charts data={data} />
</Suspense>
```

### Step 5: Test Your Application

```bash
# Run type checking
pnpm typecheck

# Run your test suite
pnpm test

# Start dev server and check for errors
pnpm dev
```

## 💡 Tips for Smooth Migration

### 1. Gradual Migration

You don't need to migrate everything at once. Start with updating the package and only add peer dependencies as needed.

### 2. Bundle Analysis

Check your bundle size improvement:

```bash
# Before migration
pnpm build && pnpm analyze

# After migration
pnpm build && pnpm analyze
```

### 3. Preloading Strategy

For better UX, preload heavy components when you know they'll be needed:

```tsx
// Preload Charts component when user hovers over navigation
const preloadCharts = () => {
  import('@dainabase/ui/lazy').then(module => {
    // Component is now cached
  });
};

<NavLink onMouseEnter={preloadCharts}>Analytics</NavLink>
```

### 4. Error Boundaries

Add error boundaries around lazy-loaded components:

```tsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<div>Failed to load component</div>}>
  <Suspense fallback={<Skeleton />}>
    <Charts data={data} />
  </Suspense>
</ErrorBoundary>
```

## 🆕 New Components in v1.0.0

Take advantage of these new components:

- `Accordion` - Collapsible content sections
- `Rating` - Star rating input
- `Timeline` - Event timeline display
- `Stepper` - Multi-step forms
- `Pagination` - Advanced pagination
- `Carousel` - Image/content carousel
- `ColorPicker` - Color selection
- `FileUpload` - File upload with drag-and-drop

## 📊 Expected Results

After migration, you should see:

- **Bundle Size**: ~50% reduction (95KB → 48KB)
- **Load Time**: ~60% faster initial load
- **Tree Shaking**: Only load what you use
- **Performance**: Lighthouse score 95+

## 🤝 Getting Help

If you encounter issues during migration:

1. Check the [CHANGELOG](./CHANGELOG.md) for detailed changes
2. Review the [Storybook documentation](https://dainabase.github.io/directus-unified-platform/)
3. Open an issue on [GitHub](https://github.com/dainabase/directus-unified-platform/issues)
4. Contact support at support@dainamics.ch

## 🎉 What's Next

After successful migration:

1. Remove unused peer dependencies
2. Optimize your imports further
3. Implement code splitting in your app
4. Monitor bundle size with CI/CD checks

---

Thank you for using @dainabase/ui! We're confident these optimizations will significantly improve your application's performance.
