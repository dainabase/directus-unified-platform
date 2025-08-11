# 📚 Directus Unified Platform - Documentation

<div align="center">

![Directus UI](https://img.shields.io/badge/Components-58-green)
![Bundle Size](https://img.shields.io/badge/Bundle%20Size-%3C600KB-success)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18-61dafb)

**A modern, optimized UI component library for Directus applications**

[Getting Started](./getting-started/installation.md) • [Components](./components/README.md) • [API Reference](./api/README.md) • [Guides](./guides/migration.md)

</div>

## 🎯 Overview

Directus Unified Platform is a comprehensive design system featuring **58 production-ready React components** built with TypeScript. Our library provides everything you need to build modern, accessible, and performant user interfaces.

## ✨ Features

- **🎨 58 Components** - Complete UI toolkit from basic to complex components
- **📦 < 600KB Bundle** - Optimized with lazy loading and code splitting
- **🎭 TypeScript Native** - Full type safety and IntelliSense support
- **♿ Accessible** - WCAG 2.1 compliant components
- **🎨 Themeable** - CSS variables and design tokens
- **📱 Responsive** - Mobile-first design approach
- **⚡ Fast** - Lazy loading for optimal performance
- **🧪 Tested** - Comprehensive test coverage

## 📦 Installation

```bash
npm install @directus/ui
# or
yarn add @directus/ui
# or
pnpm add @directus/ui
```

## 🚀 Quick Start

```tsx
import { Button, Card, Alert } from '@directus/ui';
import '@directus/ui/dist/styles.css';

function App() {
  return (
    <Card>
      <Alert variant="success">Welcome to Directus UI!</Alert>
      <Button variant="primary">Get Started</Button>
    </Card>
  );
}
```

## 📖 Documentation Structure

### [Getting Started](./getting-started/installation.md)
- [Installation](./getting-started/installation.md)
- [Quick Start](./getting-started/quick-start.md)
- [TypeScript Setup](./getting-started/typescript-setup.md)

### [Components](./components/README.md)
Complete documentation for all 58 components with:
- Props API
- Usage examples
- Best practices
- Accessibility notes
- Theming options

### [Guides](./guides/migration.md)
- [Migration Guide](./guides/migration.md)
- [Theming](./guides/theming.md)
- [Lazy Loading](./guides/lazy-loading.md)
- [Bundle Optimization](./guides/optimization.md)

### [API Reference](./api/README.md)
- Complete TypeScript definitions
- Props interfaces
- Event handlers
- Utility functions

## 🏗️ Component Categories

### Layout Components
- `Card`, `Container`, `Grid`, `Resizable`, `ScrollArea`

### Navigation
- `NavigationMenu`, `Tabs`, `Stepper`, `Pagination`, `Timeline`

### Forms & Inputs
- `Form`, `Input`, `Select`, `DatePicker`, `FileUpload`, `ColorPicker`

### Data Display
- `DataGrid`, `DataGridAdv`, `Table`, `Charts`, `Timeline`

### Feedback
- `Alert`, `Toast`, `Progress`, `Skeleton`, `Sonner`

### Overlays
- `Dialog`, `Sheet`, `Popover`, `Tooltip`, `HoverCard`

### Advanced
- `CommandPalette`, `ContextMenu`, `Menubar`, `ErrorBoundary`

## 🎯 Bundle Optimization

Our library is optimized for production with:

- **Lazy Loading**: 19 heavy components load on-demand
- **Code Splitting**: Automatic chunk optimization
- **Tree Shaking**: Import only what you use
- **External Dependencies**: React/ReactDOM externalized

```tsx
// Lazy loading example
import { lazy, Suspense } from 'react';
const DataGrid = lazy(() => import('@directus/ui/components/data-grid'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DataGrid />
    </Suspense>
  );
}
```

## 🧪 Development

```bash
# Install dependencies
npm install

# Start Storybook
npm run sb

# Build library
npm run build

# Analyze bundle
npm run build:analyze

# Run tests
npm test
```

## 📊 Bundle Analysis

View our bundle composition:
```bash
npm run build:analyze
```

This generates an interactive visualization showing:
- Component sizes
- Dependency tree
- Optimization opportunities

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) for details.

## 📄 License

MIT © [Directus](https://directus.io)

## 🔗 Links

- [GitHub Repository](https://github.com/dainabase/directus-unified-platform)
- [Storybook Demo](https://dainabase.github.io/directus-unified-platform)
- [NPM Package](https://www.npmjs.com/package/@directus/ui)
- [Issue Tracker](https://github.com/dainabase/directus-unified-platform/issues)

---

<div align="center">
Made with ❤️ by the Directus Community
</div>
