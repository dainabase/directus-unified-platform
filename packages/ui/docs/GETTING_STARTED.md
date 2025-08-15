# 🚀 Getting Started with @dainabase/ui

Welcome to the **@dainabase/ui** Design System - a production-ready, enterprise-grade component library with 95% test coverage and exceptional performance.

## 📊 Why @dainabase/ui?

- **🎯 58 Components** - Everything you need for modern applications
- **📦 38KB Bundle** - Ultra-lightweight and performant
- **✅ 95% Test Coverage** - Battle-tested and reliable
- **♿ WCAG AAA** - Fully accessible out of the box
- **🎨 Themeable** - Complete customization support
- **🌍 i18n Ready** - Multi-language support built-in
- **📱 Responsive** - Mobile-first design
- **⚡ Fast** - 98/100 Lighthouse score

## 🎯 Quick Start

### Installation

```bash
# npm
npm install @dainabase/ui

# yarn
yarn add @dainabase/ui

# pnpm
pnpm add @dainabase/ui
```

### Basic Setup

```tsx
// 1. Import the UI Provider and components
import { UIProvider, Button, Card, Input } from '@dainabase/ui';

// 2. Import the CSS (required)
import '@dainabase/ui/styles.css';

// 3. Wrap your app with UIProvider
function App() {
  return (
    <UIProvider>
      <Card>
        <h1>Welcome to Dainabase UI</h1>
        <Input placeholder="Enter your name" />
        <Button variant="primary">Get Started</Button>
      </Card>
    </UIProvider>
  );
}

export default App;
```

## 📦 Installation Options

### Full Installation
Best for prototyping and getting started quickly:

```tsx
import { Button, Card, Dialog, DataGrid } from '@dainabase/ui';
```

### Optimized Installation
Best for production with lazy loading:

```tsx
// Import only what you need, when you need it
import { Button } from '@dainabase/ui/lazy/core';
import { DataGrid } from '@dainabase/ui/lazy/data';
import { Dialog } from '@dainabase/ui/lazy/overlays';
```

### Category-based Imports
Organize imports by component category:

```tsx
import * as Forms from '@dainabase/ui/forms';
import * as Overlays from '@dainabase/ui/overlays';
import * as DataComponents from '@dainabase/ui/data';
```

## 🎨 Theming

### Built-in Themes

```tsx
import { UIProvider } from '@dainabase/ui';

// Light theme (default)
<UIProvider theme="light">
  <App />
</UIProvider>

// Dark theme
<UIProvider theme="dark">
  <App />
</UIProvider>

// High contrast
<UIProvider theme="high-contrast">
  <App />
</UIProvider>
```

### Custom Theme

```tsx
<UIProvider
  theme={{
    colors: {
      primary: '#007bff',
      secondary: '#6c757d',
      background: '#ffffff',
      foreground: '#000000',
      border: '#e0e0e0',
    },
    fonts: {
      body: 'Inter, system-ui, sans-serif',
      heading: 'Poppins, sans-serif',
      mono: 'Fira Code, monospace',
    },
    radii: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      full: '9999px',
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    }
  }}
>
  <App />
</UIProvider>
```

## 🌍 Internationalization

```tsx
import { UIProvider, I18nProvider } from '@dainabase/ui';

// Import translations
import enMessages from './locales/en.json';
import frMessages from './locales/fr.json';
import deMessages from './locales/de.json';

const messages = {
  en: enMessages,
  fr: frMessages,
  de: deMessages,
};

function App() {
  const [locale, setLocale] = useState('en');

  return (
    <UIProvider>
      <I18nProvider locale={locale} messages={messages[locale]}>
        <YourApp />
      </I18nProvider>
    </UIProvider>
  );
}
```

## 💻 Example: Building a Dashboard

```tsx
import React, { useState } from 'react';
import {
  UIProvider,
  Card,
  Button,
  DataGrid,
  Chart,
  Badge,
  Alert,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@dainabase/ui';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const salesData = [
    { month: 'Jan', sales: 4000 },
    { month: 'Feb', sales: 3000 },
    { month: 'Mar', sales: 5000 },
  ];

  const columns = [
    { key: 'product', header: 'Product' },
    { key: 'sales', header: 'Sales' },
    { key: 'status', header: 'Status', render: (val) => <Badge>{val}</Badge> },
  ];

  const products = [
    { product: 'Widget A', sales: '$12,000', status: 'Active' },
    { product: 'Widget B', sales: '$8,000', status: 'Active' },
    { product: 'Widget C', sales: '$3,000', status: 'Inactive' },
  ];

  return (
    <UIProvider theme="light">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <Alert variant="success" className="mb-6">
          Welcome back! Your sales are up 23% this month.
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <h2 className="text-xl font-semibold mb-4">Sales Chart</h2>
                <Chart
                  type="line"
                  data={salesData}
                  xKey="month"
                  yKey="sales"
                  height={300}
                />
              </Card>

              <Card>
                <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-600">Total Revenue</span>
                    <p className="text-2xl font-bold">$23,000</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Active Products</span>
                    <p className="text-2xl font-bold">42</p>
                  </div>
                  <Button variant="primary" fullWidth>
                    View Full Report
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <h2 className="text-xl font-semibold mb-4">Product Performance</h2>
              <DataGrid
                data={products}
                columns={columns}
                pagination
                pageSize={10}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </UIProvider>
  );
}

export default Dashboard;
```

## 🔧 TypeScript Support

Full TypeScript support with complete type definitions:

```tsx
import { Button, ButtonProps } from '@dainabase/ui';

// Extend component props
interface CustomButtonProps extends ButtonProps {
  customProp?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  customProp,
  ...props
}) => {
  return <Button {...props} data-custom={customProp} />;
};

// Type-safe DataGrid
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

const columns: Column<User>[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role' },
];

<DataGrid<User> data={users} columns={columns} />
```

## ⚡ Performance Tips

### 1. Use Lazy Loading for Heavy Components
```tsx
import { lazy, Suspense } from 'react';

const DataGrid = lazy(() => import('@dainabase/ui/lazy/data').then(m => ({ default: m.DataGrid })));
const Chart = lazy(() => import('@dainabase/ui/lazy/data').then(m => ({ default: m.Chart })));

<Suspense fallback={<Skeleton />}>
  <DataGrid data={data} columns={columns} />
</Suspense>
```

### 2. Optimize Bundle Size
```tsx
// ❌ Don't import everything
import * as UI from '@dainabase/ui';

// ✅ Import only what you need
import { Button, Card } from '@dainabase/ui';
```

### 3. Use Virtualization for Large Lists
```tsx
// DataGrid automatically virtualizes for 100+ rows
<DataGrid
  data={largeDataset}
  virtualized={true}  // Default for large datasets
  rowHeight={40}       // Required for virtualization
/>
```

## 🎯 Common Patterns

### Form with Validation
```tsx
import { Form, Input, Button, Label } from '@dainabase/ui';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function LoginForm() {
  const onSubmit = (data) => {
    console.log('Form data:', data);
  };

  return (
    <Form onSubmit={onSubmit} validation={schema}>
      <Form.Field name="email">
        <Label>Email</Label>
        <Input type="email" placeholder="Enter email" />
      </Form.Field>

      <Form.Field name="password">
        <Label>Password</Label>
        <Input type="password" placeholder="Enter password" />
      </Form.Field>

      <Button type="submit" variant="primary" fullWidth>
        Sign In
      </Button>
    </Form>
  );
}
```

### Modal Dialog
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button } from '@dainabase/ui';

function DeleteConfirmation() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="destructive">
        Delete Item
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this item?</p>
          <div className="flex gap-2 mt-4">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

## 📚 Learning Resources

### Documentation
- 📖 [Full Documentation](https://dainabase.github.io/ui)
- 📊 [Interactive Storybook](https://storybook.dainabase.dev)
- 🎯 [API Reference](./API_REFERENCE.md)
- 🔄 [Migration Guide](./migrations/v1.0-to-v1.3.md)

### Examples
- [Next.js Starter](https://github.com/dainabase/ui-nextjs-starter)
- [Vite Starter](https://github.com/dainabase/ui-vite-starter)
- [CodeSandbox Templates](https://codesandbox.io/s/dainabase-ui)

### Community
- 💬 [Discord Community](https://discord.gg/dainabase)
- 🐛 [GitHub Issues](https://github.com/dainabase/directus-unified-platform/issues)
- 📧 [Email Support](mailto:dev@dainabase.com)

## 🚀 Next Steps

1. **Explore Components** - Check out all 58 components in [Storybook](https://storybook.dainabase.dev)
2. **Read the Docs** - Deep dive into the [API Reference](./API_REFERENCE.md)
3. **Join Community** - Get help and share your projects on [Discord](https://discord.gg/dainabase)
4. **Star on GitHub** - Show your support ⭐

## 📄 License

MIT © [Dainabase](https://github.com/dainabase)

---

*Getting Started Guide v1.3.0 - Last updated: August 17, 2025*