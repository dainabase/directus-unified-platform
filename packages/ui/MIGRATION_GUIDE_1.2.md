# Migration Guide: v1.1.0 → v1.2.0

## 🚀 Overview

Version 1.2.0 brings significant improvements to the @dainabase/ui design system with 5 new major components, performance optimizations, and enhanced developer experience.

## 📅 Release Date
**Target: August 26-30, 2025**

## ✨ What's New in v1.2.0

### New Components (5)

#### 1. **Advanced Filter**
Complex filtering UI with query builder capabilities.

```tsx
import { AdvancedFilter } from '@dainabase/ui';

// Basic usage
<AdvancedFilter
  fields={[
    { name: 'name', type: 'text', label: 'Name' },
    { name: 'age', type: 'number', label: 'Age' },
    { name: 'status', type: 'select', label: 'Status', options: ['active', 'inactive'] }
  ]}
  onFilterChange={(filters) => console.log(filters)}
/>
```

#### 2. **Dashboard Grid**
Drag-and-drop dashboard layout system with resizable widgets.

```tsx
import { DashboardGrid } from '@dainabase/ui';

// Basic usage
<DashboardGrid
  widgets={[
    { id: '1', x: 0, y: 0, w: 4, h: 2, content: <Chart /> },
    { id: '2', x: 4, y: 0, w: 2, h: 2, content: <Stats /> }
  ]}
  onLayoutChange={(layout) => console.log(layout)}
/>
```

#### 3. **Notification Center**
Comprehensive notification management system.

```tsx
import { NotificationCenter, useNotifications } from '@dainabase/ui';

// Basic usage
const { addNotification } = useNotifications();

<NotificationCenter position="top-right" />

// Add notification
addNotification({
  title: 'Success',
  message: 'Operation completed',
  type: 'success'
});
```

#### 4. **Theme Builder**
Visual theme customization tool.

```tsx
import { ThemeBuilder } from '@dainabase/ui';

// Basic usage
<ThemeBuilder
  defaultTheme={currentTheme}
  onThemeChange={(theme) => applyTheme(theme)}
  onExport={(config) => saveTheme(config)}
/>
```

#### 5. **Virtualized Table**
High-performance table for large datasets.

```tsx
import { VirtualizedTable } from '@dainabase/ui';

// Basic usage
<VirtualizedTable
  data={largeDataset} // Can handle 100k+ rows
  columns={columns}
  rowHeight={40}
  height={600}
/>
```

### Performance Improvements

- 🎯 **Bundle Size**: Reduced from 50KB to ~45KB
- ⚡ **Lazy Loading**: Heavy components now support dynamic imports
- 🌳 **Tree Shaking**: Better dead code elimination
- 📦 **Code Splitting**: Separate chunks for large components

## 🔄 Breaking Changes

### 1. Peer Dependencies
Some heavy dependencies moved to peerDependencies. You now need to install them separately:

```bash
npm install lucide-react recharts date-fns
```

### 2. Lazy Loading
Large components now require lazy loading for optimal bundle size:

```tsx
// Before (v1.1.0)
import { Charts } from '@dainabase/ui';

// After (v1.2.0) - for better performance
import { lazy, Suspense } from 'react';
const Charts = lazy(() => import('@dainabase/ui/lazy/charts'));

// Usage with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <Charts {...props} />
</Suspense>
```

### 3. Import Paths
Some components have new optimized import paths:

```tsx
// Standard imports (unchanged)
import { Button, Card, Input } from '@dainabase/ui';

// Lazy imports for heavy components (new)
import Charts from '@dainabase/ui/lazy/charts';
import DataGridAdvanced from '@dainabase/ui/lazy/data-grid';
import RichTextEditor from '@dainabase/ui/lazy/editor';
import PDFViewer from '@dainabase/ui/lazy/pdf';
```

## 📝 Migration Steps

### Step 1: Update Package
```bash
npm update @dainabase/ui@^1.2.0
```

### Step 2: Install New Peer Dependencies
```bash
npm install lucide-react@^0.294.0 recharts@^2.10.3 date-fns@^2.30.0
```

### Step 3: Update Heavy Component Imports
Replace direct imports with lazy loading for these components:
- Charts
- DataGridAdvanced
- RichTextEditor
- PDFViewer
- CodeEditor
- ImageCropper
- VideoPlayer

### Step 4: Test Your Application
```bash
npm run test
npm run build
```

## 🔧 Configuration Updates

### TypeScript Configuration
If using TypeScript, update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true
  }
}
```

### Webpack/Vite Configuration
For optimal code splitting:

```js
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'ui-core': ['@dainabase/ui'],
          'ui-charts': ['@dainabase/ui/lazy/charts'],
          'ui-editor': ['@dainabase/ui/lazy/editor']
        }
      }
    }
  }
}
```

## ✅ New Features to Explore

### 1. Advanced Filtering
- Complex query building
- Save/load filter presets
- Export filters as JSON
- Custom operators

### 2. Dashboard Layouts
- Drag-and-drop widgets
- Resize widgets
- Save/load layouts
- Responsive breakpoints

### 3. Notification System
- Toast notifications
- Notification center
- Persistent notifications
- Action buttons

### 4. Theme Customization
- Visual theme editor
- Live preview
- Export/import themes
- CSS variables support

### 5. Performance Features
- Virtual scrolling
- Lazy loading
- Memoization
- Optimized re-renders

## 🐛 Bug Fixes

- Fixed memory leak in DataGrid
- Resolved accessibility issues in Dialog
- Fixed DatePicker timezone handling
- Improved Form validation performance
- Fixed Carousel touch navigation

## 📚 Documentation

### New Documentation
- [Advanced Filter Guide](./docs/components/advanced-filter.md)
- [Dashboard Grid Guide](./docs/components/dashboard-grid.md)
- [Notification Center Guide](./docs/components/notification-center.md)
- [Theme Builder Guide](./docs/components/theme-builder.md)
- [Virtualized Table Guide](./docs/components/virtualized-table.md)

### API References
All new components include comprehensive TypeScript definitions and JSDoc comments.

## 💡 Tips for Migration

1. **Start with non-critical pages** to test the new version
2. **Use feature flags** to gradually roll out changes
3. **Monitor bundle size** after migration
4. **Test accessibility** with screen readers
5. **Check console for warnings** about deprecated features

## 🤝 Support

### Resources
- [GitHub Issues](https://github.com/dainabase/directus-unified-platform/issues)
- [Documentation](https://github.com/dainabase/directus-unified-platform/tree/main/packages/ui)
- [NPM Package](https://www.npmjs.com/package/@dainabase/ui)

### Need Help?
- Check the [FAQ](./docs/FAQ.md)
- Join our [Discord](https://discord.gg/dainabase)
- Email: support@dainabase.com

## 🎉 Thank You!

Thank you for using @dainabase/ui! We're excited about these improvements and look forward to your feedback.

---

**Version**: 1.2.0-alpha.1  
**Last Updated**: August 14, 2025
