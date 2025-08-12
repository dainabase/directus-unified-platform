# ⚡ Performance Optimization Guide

## 📊 Bundle Size Optimization

### Current Status
- **Target**: < 500KB total
- **Main Bundle**: < 200KB
- **CSS Bundle**: < 100KB
- **Per Component**: < 10KB

### Strategies

#### 1. Code Splitting
```typescript
// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Route-based splitting
const routes = [
  {
    path: '/dashboard',
    component: lazy(() => import('./pages/Dashboard')),
  },
];
```

#### 2. Tree Shaking
```typescript
// ❌ Bad - imports entire library
import * as utils from './utils';

// ✅ Good - imports only what's needed
import { formatDate, parseNumber } from './utils';
```

#### 3. Optimize Dependencies
```json
// Use lighter alternatives
{
  "dependencies": {
    "date-fns": "^2.0.0",  // Instead of moment.js
    "clsx": "^2.0.0",      // Instead of classnames
    "nanoid": "^5.0.0"     // Instead of uuid
  }
}
```

#### 4. CSS Optimization
```css
/* Use CSS modules for scoping */
.button {
  /* Local styles */
}

/* Purge unused CSS with PurgeCSS */
/* Tree-shake Tailwind classes */
```

### Monitoring

```bash
# Analyze bundle
npm run analyze:bundle

# Check size limits
npm run check:size

# Generate report
npm run report:bundle
```

## 🚀 Runtime Performance

### React Optimizations

#### 1. Memoization
```typescript
// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(props.data);
}, [props.data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Memoize components
const MemoizedComponent = memo(Component, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id;
});
```

#### 2. Virtual Scrolling
```typescript
// For large lists
import { FixedSizeList } from 'react-window';

const VirtualList = ({ items }) => (
  <FixedSizeList
    height={600}
    itemCount={items.length}
    itemSize={50}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        {items[index].name}
      </div>
    )}
  </FixedSizeList>
);
```

#### 3. Suspense & Concurrent Features
```typescript
const DataComponent = () => {
  return (
    <Suspense fallback={<Skeleton />}>
      <AsyncDataComponent />
    </Suspense>
  );
};
```

### Image Optimization

```typescript
// Lazy load images
const LazyImage = ({ src, alt }) => {
  return (
    <img
      loading="lazy"
      src={src}
      alt={alt}
      decoding="async"
    />
  );
};

// Use responsive images
<picture>
  <source media="(max-width: 768px)" srcset="small.webp" />
  <source media="(min-width: 769px)" srcset="large.webp" />
  <img src="fallback.jpg" alt="Description" />
</picture>
```

## 📈 Metrics & Monitoring

### Core Web Vitals

```typescript
// Monitor performance metrics
import { getCLS, getFID, getLCP } from 'web-vitals';

getCLS(console.log);  // Cumulative Layout Shift
getFID(console.log);  // First Input Delay
getLCP(console.log);  // Largest Contentful Paint
```

### Performance Budget

```javascript
// webpack.config.js
module.exports = {
  performance: {
    maxAssetSize: 200000,      // 200KB
    maxEntrypointSize: 400000, // 400KB
    hints: 'error',
  },
};
```

## 🔧 Build Optimizations

### Webpack Configuration

```javascript
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
      }),
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
  },
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8,
    }),
  ],
};
```

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { compression } from 'vite-plugin-compression2';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@dainabase/ui'],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  plugins: [
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
});
```

## 🎯 Component-Specific Optimizations

### Form Components
```typescript
// Debounce input handlers
const DebouncedInput = () => {
  const [value, setValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [value]);
  
  return <input value={value} onChange={e => setValue(e.target.value)} />;
};
```

### Data Tables
```typescript
// Virtualize large tables
// Paginate data
// Implement column visibility toggles
// Use skeleton loading states
```

### Modals & Overlays
```typescript
// Portal to body
// Lazy load content
// Trap focus
// Prevent body scroll
```

## 📱 Mobile Optimizations

### Touch Optimizations
```css
/* Improve touch targets */
.button {
  min-height: 44px;
  min-width: 44px;
}

/* Disable touch delays */
html {
  touch-action: manipulation;
}
```

### Responsive Loading
```typescript
const ResponsiveComponent = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return isMobile ? <MobileView /> : <DesktopView />;
};
```

## 🔍 Debugging Performance

### React DevTools Profiler
1. Record a performance profile
2. Identify components that render frequently
3. Look for unnecessary re-renders
4. Check render duration

### Chrome DevTools
1. Performance tab for runtime analysis
2. Coverage tab for unused code
3. Network tab for bundle sizes
4. Lighthouse for overall score

### Custom Performance Marks
```typescript
performance.mark('myComponent-start');
// Component logic
performance.mark('myComponent-end');
performance.measure(
  'myComponent',
  'myComponent-start',
  'myComponent-end'
);
```

## 📋 Checklist

### Before Release
- [ ] Bundle size < 500KB
- [ ] No console.logs in production
- [ ] Images optimized and lazy loaded
- [ ] Code splitting implemented
- [ ] Critical CSS inlined
- [ ] Gzip/Brotli compression enabled
- [ ] Service worker for caching
- [ ] Performance budget enforced
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals passing

### Monitoring
- [ ] Bundle size tracking
- [ ] Performance metrics collection
- [ ] Error tracking
- [ ] User analytics
- [ ] A/B testing for optimizations

---

*Keep it fast, keep it light! ⚡*