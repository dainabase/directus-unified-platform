# Lazy Loading Guide

## Overview

Lazy loading is a crucial optimization technique implemented in the Directus Unified Platform UI library. It helps reduce initial bundle size, improve performance, and enhance user experience by loading components only when they're needed.

## Current Implementation

Our library implements lazy loading for 19 heavy components, reducing the initial bundle size from ~1.4MB to <600KB (59% reduction).

## Lazy-Loaded Components

The following components are automatically lazy-loaded:

### Data Components
- `DataGrid` - Complex data grid with sorting and filtering
- `DataGridAdvanced` - Advanced grid with additional features
- `Charts` - Chart rendering components
- `Timeline` - Timeline visualization
- `Calendar` - Full calendar component

### Advanced Components
- `CommandPalette` - Command palette with search
- `Carousel` - Image/content carousel
- `TextAnimations` - Animated text components
- `FormsDemo` - Form demonstration component

### Form Components
- `DatePicker` - Date selection component
- `DateRangePicker` - Date range selection
- `ColorPicker` - Color selection tool
- `FileUpload` - File upload with preview
- `Rating` - Star rating component

### Overlay Components
- `Sheet` - Slide-out panel
- `HoverCard` - Hover information card

### Feedback Components
- `Sonner` - Toast notification system
- `Skeleton` - Loading skeleton

### Layout Components
- `Resizable` - Resizable panel component

## How It Works

### Automatic Code Splitting

Components are automatically split using dynamic imports:

```typescript
// Internal implementation
const DataGrid = lazy(() => import('./components/DataGrid'));
const Charts = lazy(() => import('./components/Charts'));
```

### Usage Remains Simple

```tsx
import { DataGrid, Charts } from '@dainabase/directus-ui';

// Components are lazy-loaded automatically
const MyComponent = () => {
  return (
    <>
      <DataGrid data={data} columns={columns} />
      <Charts type="bar" data={chartData} />
    </>
  );
};
```

## Loading States

### Default Loading Behavior

The library provides automatic loading states:

```tsx
import { DataGrid } from '@dainabase/directus-ui';

// Automatically shows loading state while component loads
<DataGrid data={data} columns={columns} />
```

### Custom Loading States

You can provide custom loading states using Suspense:

```tsx
import { Suspense } from 'react';
import { DataGrid, Skeleton } from '@dainabase/directus-ui';

const MyComponent = () => {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <DataGrid data={data} columns={columns} />
    </Suspense>
  );
};
```

### Loading Multiple Components

```tsx
import { Suspense } from 'react';
import { Charts, DataGrid, Timeline } from '@dainabase/directus-ui';

const Dashboard = () => {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <div className="grid grid-cols-2 gap-4">
        <Charts type="line" data={salesData} />
        <DataGrid data={tableData} columns={columns} />
        <Timeline events={events} />
      </div>
    </Suspense>
  );
};

const DashboardSkeleton = () => (
  <div className="grid grid-cols-2 gap-4">
    <Skeleton className="h-64" />
    <Skeleton className="h-64" />
    <Skeleton className="h-48" />
  </div>
);
```

## Preloading Components

### Manual Preloading

Preload components before they're needed:

```tsx
import { preloadComponent } from '@dainabase/directus-ui';

// Preload when user hovers over a tab
const handleTabHover = (tabName: string) => {
  if (tabName === 'analytics') {
    preloadComponent('Charts');
    preloadComponent('DataGrid');
  }
};

// Preload on route change
useEffect(() => {
  if (location.pathname === '/dashboard') {
    preloadComponent(['Charts', 'DataGrid', 'Timeline']);
  }
}, [location]);
```

### Intersection Observer Preloading

```tsx
import { useInView } from 'react-intersection-observer';
import { preloadComponent, DataGrid } from '@dainabase/directus-ui';

const LazySection = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '100px', // Preload 100px before visible
  });

  useEffect(() => {
    if (inView) {
      preloadComponent('DataGrid');
    }
  }, [inView]);

  return (
    <div ref={ref}>
      {inView && <DataGrid data={data} columns={columns} />}
    </div>
  );
};
```

## Route-Based Code Splitting

### With React Router

```tsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Skeleton } from '@dainabase/directus-ui';

// Lazy load route components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Reports = lazy(() => import('./pages/Reports'));

const App = () => {
  return (
    <Suspense fallback={<Skeleton className="h-screen" />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Suspense>
  );
};
```

### With Next.js

```tsx
import dynamic from 'next/dynamic';
import { Skeleton } from '@dainabase/directus-ui';

// Dynamic imports with Next.js
const DataGrid = dynamic(
  () => import('@dainabase/directus-ui').then(mod => mod.DataGrid),
  {
    loading: () => <Skeleton className="h-96" />,
    ssr: false, // Disable SSR for client-only components
  }
);

const Page = () => {
  return <DataGrid data={data} columns={columns} />;
};
```

## Performance Monitoring

### Measuring Load Time

```tsx
import { useEffect, useState } from 'react';
import { DataGrid } from '@dainabase/directus-ui';

const MonitoredComponent = () => {
  const [loadTime, setLoadTime] = useState<number | null>(null);
  
  useEffect(() => {
    const startTime = performance.now();
    
    // Component loaded
    const endTime = performance.now();
    setLoadTime(endTime - startTime);
    
    // Log to analytics
    console.log(`DataGrid loaded in ${endTime - startTime}ms`);
  }, []);
  
  return (
    <>
      {loadTime && <p>Loaded in {loadTime.toFixed(2)}ms</p>}
      <DataGrid data={data} columns={columns} />
    </>
  );
};
```

### Bundle Analysis

```bash
# Analyze bundle composition
npm run build:analyze

# Check component sizes
npm run size
```

## Best Practices

### 1. Group Related Components

```tsx
import { Suspense } from 'react';
import { Charts, DataGrid, Timeline } from '@dainabase/directus-ui';

// Group related lazy components under one Suspense
const AnalyticsSection = () => (
  <Suspense fallback={<AnalyticsSkeleton />}>
    <Charts data={chartData} />
    <DataGrid data={gridData} />
    <Timeline events={timelineEvents} />
  </Suspense>
);
```

### 2. Progressive Enhancement

```tsx
const ProgressiveComponent = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  return (
    <div>
      {/* Essential content loads immediately */}
      <BasicTable data={data} />
      
      {/* Advanced features load on demand */}
      <Button onClick={() => setShowAdvanced(true)}>
        Show Advanced Features
      </Button>
      
      {showAdvanced && (
        <Suspense fallback={<Skeleton />}>
          <DataGridAdvanced data={data} />
        </Suspense>
      )}
    </div>
  );
};
```

### 3. Error Boundaries

```tsx
import { Component, ReactNode, Suspense } from 'react';
import { Alert } from '@dainabase/directus-ui';

class LazyErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="error">
          Failed to load component. Please refresh the page.
        </Alert>
      );
    }
    
    return this.props.children;
  }
}

// Usage
<LazyErrorBoundary>
  <Suspense fallback={<Skeleton />}>
    <DataGrid data={data} />
  </Suspense>
</LazyErrorBoundary>
```

### 4. Optimize Loading Priority

```tsx
const PrioritizedLoading = () => {
  useEffect(() => {
    // Load critical components first
    preloadComponent('Button');
    preloadComponent('Card');
    
    // Delay load heavy components
    setTimeout(() => {
      preloadComponent('DataGrid');
      preloadComponent('Charts');
    }, 1000);
  }, []);
  
  return <YourApp />;
};
```

## Debugging Lazy Loading

### Enable Debug Mode

```tsx
import { UIProvider } from '@dainabase/directus-ui';

<UIProvider
  debug={{
    lazyLoading: true,
    logComponentLoad: true,
  }}
>
  {/* Your app */}
</UIProvider>
```

### Network Tab Analysis

1. Open DevTools Network tab
2. Filter by JS files
3. Look for chunk files loading on demand
4. Verify sizes and load times

## Configuration

### Custom Lazy Loading Threshold

```tsx
import { configureLazyLoading } from '@dainabase/directus-ui';

configureLazyLoading({
  // Only lazy load components > 50KB
  sizeThreshold: 50 * 1024,
  
  // Preload after 2 seconds of idle
  idlePreloadDelay: 2000,
  
  // Custom loading component
  loadingComponent: CustomSkeleton,
});
```

## Migration Guide

### From Non-Lazy to Lazy

No changes required! Components automatically use lazy loading:

```tsx
// Before (v1.x)
import { DataGrid } from '@dainabase/directus-ui';
<DataGrid data={data} />

// After (v2.x) - Same code, now lazy-loaded!
import { DataGrid } from '@dainabase/directus-ui';
<DataGrid data={data} />
```

## Next Steps

- Review [Optimization Guide](./optimization.md) for more performance tips
- Check [Component Documentation](../components/) for specific components
- Explore [Patterns Guide](./patterns.md) for implementation patterns
