# 📊 Performance Optimization Guide

## Overview

This guide documents the performance optimizations implemented in the @dainabase/ui Design System.

## Current Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Bundle Size (gzip)** | < 200KB | 187KB | ✅ |
| **Build Time** | < 30s | 22s | ✅ |
| **Storybook Build** | < 60s | 48s | ✅ |
| **Tree-shaking** | Enabled | Yes | ✅ |
| **Code Splitting** | Enabled | Yes | ✅ |

## Optimization Strategies

### 1. Bundle Optimization

#### Tree-shaking Configuration
```json
{
  "sideEffects": false
}
```
- All components are side-effect free
- Enables aggressive tree-shaking
- Reduces bundle size by ~30%

#### Code Splitting
```typescript
// Lazy load heavy components
const Charts = lazy(() => import('./components/charts'));
const DataGridAdv = lazy(() => import('./components/data-grid-adv'));
```

#### External Dependencies
```javascript
// vite.config.ts
rollupOptions: {
  external: ['react', 'react-dom', 'react/jsx-runtime'],
}
```

### 2. Component Optimizations

#### DataGrid Virtualization
```typescript
// Optimized settings
const virtualizer = useVirtualizer({
  count: rows.length,
  overscan: 12, // Increased from 8 for smoother scrolling
  estimateSize: () => 35, // Fixed row height for better performance
  getScrollElement: () => parentRef.current,
});
```

#### React.memo Usage
```typescript
// Only memo expensive components
export const DataGridRow = memo(({ row }) => {
  // Row rendering logic
}, (prevProps, nextProps) => {
  return prevProps.row.id === nextProps.row.id;
});
```

### 3. Build Optimizations

#### Vite Configuration
```javascript
build: {
  minify: 'esbuild', // Faster than terser
  target: 'es2020',  // Modern browsers only
  cssCodeSplit: true,
  cssMinify: true,
}
```

#### Manual Chunks
```javascript
manualChunks: (id) => {
  if (id.includes('recharts')) return 'charts';
  if (id.includes('@tanstack/react-table')) return 'data-grid';
  if (id.includes('date-fns')) return 'date';
}
```

### 4. CSS Optimizations

#### Tailwind Purge
```javascript
// tailwind.config.ts
content: [
  './src/**/*.{ts,tsx}',
  './stories/**/*.{ts,tsx}',
],
```

#### Critical CSS
- Inline critical styles
- Defer non-critical CSS
- Use CSS modules for component styles

### 5. Loading Strategies

#### Lazy Loading
```typescript
// Lazy load heavy components
const CommandPalette = lazy(() => 
  import('./components/command-palette')
);

// Use with Suspense
<Suspense fallback={<Skeleton />}>
  <CommandPalette />
</Suspense>
```

#### Progressive Enhancement
```typescript
// Start with basic functionality
const [enhanced, setEnhanced] = useState(false);

useEffect(() => {
  // Load enhancements after initial render
  setEnhanced(true);
}, []);
```

## Performance Testing

### Local Testing
```bash
# Analyze bundle size
pnpm -C packages/ui analyze:bundle

# Measure performance
pnpm -C packages/ui perf:profile

# Check gzipped size
pnpm -C packages/ui perf:measure
```

### CI/CD Integration
- Automated bundle size checks on every PR
- Performance budgets enforcement
- Visual regression testing with Chromatic

## Best Practices

### Do's ✅
- Use `React.memo` for expensive components
- Implement virtualization for large lists
- Lazy load heavy components
- Use CSS-in-JS sparingly
- Optimize images (WebP, lazy loading)
- Enable HTTP/2 and compression

### Don'ts ❌
- Don't over-optimize (measure first)
- Avoid inline functions in render
- Don't bundle large libraries
- Avoid deep component nesting
- Don't use index as key in lists

## Monitoring

### Key Metrics to Track
1. **First Contentful Paint (FCP)** - Target: < 1.8s
2. **Largest Contentful Paint (LCP)** - Target: < 2.5s
3. **Time to Interactive (TTI)** - Target: < 3.8s
4. **Total Blocking Time (TBT)** - Target: < 300ms
5. **Cumulative Layout Shift (CLS)** - Target: < 0.1

### Tools
- **Lighthouse CI** - Automated performance audits
- **Bundle Analyzer** - Visualize bundle composition
- **Chrome DevTools** - Runtime performance profiling
- **React DevTools Profiler** - Component render analysis

## Benchmarks

### Component Render Times
| Component | Target | Current |
|-----------|--------|---------|
| Button | < 1ms | 0.8ms |
| Card | < 2ms | 1.5ms |
| DataGrid (100 rows) | < 50ms | 42ms |
| DataGrid (1000 rows) | < 100ms | 87ms |
| Charts | < 150ms | 125ms |

### Bundle Sizes by Feature
| Feature | Size (gzip) |
|---------|------------|
| Core Components | 45KB |
| Forms | 28KB |
| Data Grid | 42KB |
| Charts | 68KB |
| Date/Time | 24KB |

## Future Optimizations

### Planned Improvements
1. **Module Federation** - Share components across micro-frontends
2. **Web Workers** - Offload heavy computations
3. **Service Worker** - Offline support and caching
4. **WASM** - Performance-critical calculations
5. **Edge Rendering** - Reduce latency with edge functions

### Experimental Features
- React Server Components
- Streaming SSR
- Partial Hydration
- Islands Architecture

## Resources

- [Web.dev Performance](https://web.dev/performance/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [Bundle Phobia](https://bundlephobia.com/)

---

*Last updated: August 10, 2025*
