# 📦 Bundle Optimization Guide

## 🎯 Goal: Reduce Bundle Size from 850KB to <600KB

This document outlines the optimization strategies implemented to achieve a 30%+ reduction in bundle size.

## 📊 Current Status

| Metric | Before | Target | Current |
|--------|--------|--------|---------|
| Main Bundle | 850KB | <600KB | TBD |
| Lazy Chunks | N/A | <50KB each | TBD |
| Total Reduction | 0% | -30% | TBD |

## 🚀 Optimization Strategies

### 1. Code Splitting & Lazy Loading

**File:** `src/components-lazy.ts`

- Heavy components loaded on-demand
- Intelligent preloading based on priority
- Predictive loading with IntersectionObserver

```javascript
// Example usage
import { Charts } from '@dainabase/ui/components-lazy';

// Component will be loaded only when needed
<Suspense fallback={<Loading />}>
  <Charts data={data} />
</Suspense>
```

### 2. Tree Shaking & Dead Code Elimination

**File:** `tsup.config.ts`

- Aggressive tree shaking enabled
- Unused code automatically removed
- Side-effect-free imports optimized

### 3. External Dependencies

Heavy dependencies are marked as external and not bundled:

- `recharts` (charting library)
- `@tanstack/react-table` (data grid)
- `date-fns` (date utilities)
- `framer-motion` (animations)

### 4. Build Optimization

**Two build systems configured:**

1. **tsup** (default) - Optimized for libraries
2. **Vite** - Alternative with visual analysis

## 🛠️ Available Scripts

```bash
# Default optimized build
npm run build

# Alternative Vite build
npm run build:vite

# Analyze bundle with visualization
npm run build:analyze

# Check bundle sizes
npm run build:size

# Clean build (removes dist first)
npm run build:clean

# Watch mode for development
npm run build:watch
```

## 📈 Bundle Analysis

After running `npm run build`, check:
- `dist/bundle-report.json` - Detailed size report
- Individual chunk sizes in console output

### How to Analyze

1. **Visual Analysis:**
   ```bash
   npm run build:analyze
   # Opens interactive treemap in browser
   ```

2. **Size Check:**
   ```bash
   npm run build:size
   # Shows size of each output file
   ```

3. **JSON Report:**
   ```bash
   npm run build
   # Check dist/bundle-report.json
   ```

## 🎯 Import Recommendations

### ✅ DO: Import specific components

```javascript
// Good - only imports what's needed
import { Button, Card } from '@dainabase/ui';
```

### ❌ DON'T: Import everything

```javascript
// Bad - imports entire library
import * as UI from '@dainabase/ui';
```

### 💡 LAZY: Load heavy components on-demand

```javascript
// Best for heavy components
import { lazy, Suspense } from 'react';
const Charts = lazy(() => import('@dainabase/ui/lazy/charts'));
```

## 📊 Component Size Reference

### Small Components (<5KB)
- Button, Badge, Icon, Avatar
- Tooltip, Skeleton, Separator

### Medium Components (5-15KB)
- Dialog, Sheet, Popover
- Select, Dropdown, Tabs

### Large Components (>15KB)
- Charts (~60KB) - Always lazy load
- DataGrid (~25KB) - Consider lazy loading
- Calendar (~15KB) - Consider lazy loading
- Form (~10KB) - Load based on route

## 🔧 Advanced Optimizations

### 1. Dynamic Imports for Routes

```javascript
// Route-based code splitting
const AdminDashboard = lazy(() => 
  import('./pages/AdminDashboard')
);
```

### 2. Preload Critical Components

```javascript
// Preload after initial render
useEffect(() => {
  import('@dainabase/ui/lazy/form');
}, []);
```

### 3. Conditional Loading

```javascript
// Load only when feature is enabled
if (features.charts) {
  const Charts = await import('@dainabase/ui/lazy/charts');
}
```

## 📝 Monitoring Bundle Size

### GitHub Actions (Coming Soon)

Bundle size will be automatically checked on each PR:
- Warning if increase >5%
- Block if increase >10%
- Celebrate if decrease >5% 🎉

### Local Development

Before committing:
```bash
npm run build:size
```

## 🎓 Best Practices

1. **Always lazy load data visualization components**
2. **Keep core components in main bundle** (Button, Card, etc.)
3. **Split by route** when possible
4. **Monitor bundle size** regularly
5. **Use production builds** for testing (`NODE_ENV=production`)

## 📚 Resources

- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [tsup Documentation](https://tsup.egoist.dev/)
- [Vite Build Optimization](https://vitejs.dev/guide/build.html)
- [React Lazy Loading](https://react.dev/reference/react/lazy)

## 🤝 Contributing

When adding new components:
1. Consider the component size
2. Add to lazy loading if >10KB
3. Test bundle impact with `npm run build:size`
4. Update this document if needed

---

**Target Achievement:** 🎯 <600KB total bundle size
