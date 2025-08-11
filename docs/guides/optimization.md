# Optimization Guide

## Overview

This guide covers comprehensive optimization strategies for the Directus Unified Platform UI library, helping you achieve maximum performance in your applications.

## Bundle Size Optimization

### Current Metrics

- **Total Bundle**: <600KB (minified + gzipped)
- **Initial Load**: ~200KB (core components)
- **Lazy Loaded**: ~400KB (19 heavy components)
- **Reduction**: 59% from original size

### Tree Shaking

Our library fully supports tree shaking. Import only what you need:

```tsx
// ✅ Good - Only imports Button
import { Button } from '@dainabase/directus-ui';

// ❌ Avoid - Imports entire library
import * as UI from '@dainabase/directus-ui';
```

### Component-Specific Imports

```tsx
// ✅ Optimal - Direct imports
import Button from '@dainabase/directus-ui/components/Button';
import Card from '@dainabase/directus-ui/components/Card';

// Also good - Named imports (tree-shaken)
import { Button, Card } from '@dainabase/directus-ui';
```

## Build Configuration

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          'ui-core': ['@dainabase/directus-ui'],
          'ui-forms': [
            '@dainabase/directus-ui/components/Form',
            '@dainabase/directus-ui/components/Input',
          ],
          'ui-data': [
            '@dainabase/directus-ui/components/DataGrid',
            '@dainabase/directus-ui/components/Table',
          ],
        },
      },
    },
  },
});
```

### Webpack Configuration

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    usedExports: true,
    sideEffects: false,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        ui: {
          test: /[\\/]node_modules[\\/]@dainabase[\\/]directus-ui/,
          name: 'directus-ui',
          priority: 10,
        },
      },
    },
  },
};
```

## Runtime Performance

### Memoization Strategies

```tsx
import { memo, useMemo, useCallback } from 'react';
import { DataGrid, Button } from '@dainabase/directus-ui';

// Memoize expensive components
const MemoizedDataGrid = memo(DataGrid, (prevProps, nextProps) => {
  return (
    prevProps.data === nextProps.data &&
    prevProps.columns === nextProps.columns
  );
});

// Optimize renders
const OptimizedComponent = () => {
  // Memoize expensive computations
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      computed: expensiveComputation(item),
    }));
  }, [data]);
  
  // Memoize callbacks
  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id);
  }, []);
  
  return (
    <MemoizedDataGrid
      data={processedData}
      onRowClick={handleClick}
    />
  );
};
```

### Virtual Scrolling

```tsx
import { DataGrid, VirtualList } from '@dainabase/directus-ui';

// DataGrid with virtual scrolling (automatic for >100 rows)
<DataGrid
  data={largeDataset} // 10,000+ rows
  columns={columns}
  virtual={true}
  rowHeight={40}
  visibleRows={20}
/>

// Custom virtual list
<VirtualList
  items={items}
  itemHeight={50}
  containerHeight={600}
  renderItem={(item, index) => (
    <div key={index}>{item.name}</div>
  )}
/>
```

### Debouncing and Throttling

```tsx
import { useMemo } from 'react';
import { Input, useDebounce, useThrottle } from '@dainabase/directus-ui';

const SearchComponent = () => {
  const [search, setSearch] = useState('');
  
  // Debounce search input
  const debouncedSearch = useDebounce(search, 300);
  
  // Throttle scroll events
  const handleScroll = useThrottle((e) => {
    console.log('Scrolled:', e.target.scrollTop);
  }, 100);
  
  useEffect(() => {
    // API call with debounced value
    if (debouncedSearch) {
      fetchResults(debouncedSearch);
    }
  }, [debouncedSearch]);
  
  return (
    <div onScroll={handleScroll}>
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
      />
    </div>
  );
};
```

## Image Optimization

### Lazy Loading Images

```tsx
import { Image, Avatar } from '@dainabase/directus-ui';

// Automatic lazy loading
<Image
  src="/large-image.jpg"
  alt="Description"
  lazy={true}
  placeholder="/placeholder.jpg"
/>

// Avatar with optimized loading
<Avatar
  src="/user-avatar.jpg"
  fallback="JD"
  size="lg"
  loading="lazy"
/>
```

### Responsive Images

```tsx
const ResponsiveImage = () => (
  <Image
    src="/hero.jpg"
    srcSet={
      "/hero-mobile.jpg 640w, " +
      "/hero-tablet.jpg 1024w, " +
      "/hero-desktop.jpg 1920w"
    }
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    alt="Hero image"
  />
);
```

## CSS Optimization

### Critical CSS

```tsx
// Extract critical CSS for above-the-fold content
import { extractCritical } from '@dainabase/directus-ui/utils';

const { css, ids } = extractCritical(html);

// Inline critical CSS
<style dangerouslySetInnerHTML={{ __html: css }} />
```

### CSS-in-JS Optimization

```tsx
// Use CSS variables for dynamic styles
const OptimizedButton = ({ color }) => (
  <Button
    style={{ '--button-color': color } as React.CSSProperties}
    className="optimized-button"
  >
    Click me
  </Button>
);

// CSS
.optimized-button {
  background-color: var(--button-color);
  transition: opacity 0.2s;
}
```

### Unused CSS Removal

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: ['./src/**/*.tsx'],
      safelist: [
        /^ui-/, // Keep all UI library classes
      ],
    }),
  ],
};
```

## State Management Optimization

### Context Optimization

```tsx
import { createContext, useContext, useMemo } from 'react';

// Split contexts to avoid unnecessary re-renders
const ThemeContext = createContext();
const UserContext = createContext();
const DataContext = createContext();

// Optimized provider
const OptimizedProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  
  // Memoize context values
  const themeValue = useMemo(
    () => ({ theme, setTheme }),
    [theme]
  );
  
  const userValue = useMemo(
    () => ({ user, setUser }),
    [user]
  );
  
  return (
    <ThemeContext.Provider value={themeValue}>
      <UserContext.Provider value={userValue}>
        {children}
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
};
```

### Redux DevTools in Production

```typescript
// Disable Redux DevTools in production
const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
});
```

## Network Optimization

### API Response Caching

```tsx
import { useQuery } from '@tanstack/react-query';
import { DataGrid } from '@dainabase/directus-ui';

const CachedDataGrid = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['grid-data'],
    queryFn: fetchGridData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
  
  if (isLoading) return <Skeleton />;
  
  return <DataGrid data={data} />;
};
```

### Prefetching

```tsx
import { prefetchQuery } from '@tanstack/react-query';

// Prefetch data on hover
const NavigationLink = ({ href, label }) => {
  const handleMouseEnter = () => {
    prefetchQuery({
      queryKey: ['page-data', href],
      queryFn: () => fetchPageData(href),
    });
  };
  
  return (
    <Link
      href={href}
      onMouseEnter={handleMouseEnter}
    >
      {label}
    </Link>
  );
};
```

## Memory Management

### Component Cleanup

```tsx
import { useEffect, useRef } from 'react';

const MemoryOptimizedComponent = () => {
  const intervalRef = useRef<NodeJS.Timeout>();
  const abortController = useRef<AbortController>();
  
  useEffect(() => {
    // Create abort controller
    abortController.current = new AbortController();
    
    // Set up interval
    intervalRef.current = setInterval(() => {
      fetchData({ signal: abortController.current.signal });
    }, 5000);
    
    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);
  
  return <div>Optimized Component</div>;
};
```

### WeakMap for Caching

```typescript
// Cache computed values without memory leaks
const cache = new WeakMap();

function getComputedValue(object: any) {
  if (cache.has(object)) {
    return cache.get(object);
  }
  
  const computed = expensiveComputation(object);
  cache.set(object, computed);
  return computed;
}
```

## Monitoring and Profiling

### Performance Metrics

```tsx
import { useEffect } from 'react';

const PerformanceMonitor = () => {
  useEffect(() => {
    // Measure First Contentful Paint
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach((entry) => {
      console.log(`${entry.name}: ${entry.startTime}ms`);
    });
    
    // Measure component render time
    performance.mark('component-start');
    
    return () => {
      performance.mark('component-end');
      performance.measure(
        'component-render',
        'component-start',
        'component-end'
      );
      
      const measure = performance.getEntriesByName('component-render')[0];
      console.log(`Render time: ${measure.duration}ms`);
    };
  }, []);
  
  return <YourComponent />;
};
```

### React DevTools Profiler

```tsx
import { Profiler } from 'react';

const onRenderCallback = (
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
) => {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
};

<Profiler id="DataGrid" onRender={onRenderCallback}>
  <DataGrid data={data} columns={columns} />
</Profiler>
```

## Production Checklist

### Before Deployment

- [ ] Enable production build mode
- [ ] Remove console.log statements
- [ ] Enable gzip/brotli compression
- [ ] Implement proper caching headers
- [ ] Optimize images and assets
- [ ] Enable CDN for static assets
- [ ] Implement error boundaries
- [ ] Add performance monitoring
- [ ] Test with slow network throttling
- [ ] Verify lazy loading works correctly

### Build Analysis

```bash
# Analyze bundle size
npm run build:analyze

# Check for duplicates
npm run find-duplicates

# Measure performance
npm run lighthouse
```

## Next Steps

- Review [Lazy Loading Guide](./lazy-loading.md) for component-specific optimization
- Check [Patterns Guide](./patterns.md) for optimization patterns
- Explore [Component Documentation](../components/) for component-specific tips
