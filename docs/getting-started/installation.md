# Installation Guide

Get started with Directus UI in your React application.

## Prerequisites

Before installing Directus UI, ensure you have:

- **Node.js**: Version 16.0.0 or higher
- **React**: Version 18.0.0 or higher
- **TypeScript**: Version 5.0.0 or higher (optional but recommended)

## Package Managers

### npm

```bash
npm install @directus/ui
```

### Yarn

```bash
yarn add @directus/ui
```

### pnpm

```bash
pnpm add @directus/ui
```

### Bun

```bash
bun add @directus/ui
```

## Basic Setup

### 1. Install the Package

```bash
npm install @directus/ui
```

### 2. Import Styles

Add the CSS import to your main application file:

```tsx
// App.tsx or index.tsx
import '@directus/ui/dist/styles.css';
```

Or import in your CSS file:

```css
/* styles.css */
@import '@directus/ui/dist/styles.css';
```

### 3. Use Components

```tsx
import { Button, Card, Alert } from '@directus/ui';

function App() {
  return (
    <Card>
      <Alert variant="info">Welcome to Directus UI!</Alert>
      <Button variant="primary">Get Started</Button>
    </Card>
  );
}
```

## Advanced Installation

### With UI Provider

For theme customization and global configuration:

```tsx
import { UIProvider } from '@directus/ui';
import '@directus/ui/dist/styles.css';

function App() {
  return (
    <UIProvider
      theme={{
        primaryColor: '#2563eb',
        borderRadius: '8px',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <YourApp />
    </UIProvider>
  );
}
```

### Individual Component Imports

For better tree-shaking, import components individually:

```tsx
import Button from '@directus/ui/components/button';
import Card from '@directus/ui/components/card';
import Alert from '@directus/ui/components/alert';
```

### Lazy Loading Setup

For optimal performance with code splitting:

```tsx
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const DataGrid = lazy(() => 
  import('@directus/ui/components/data-grid')
);

const Charts = lazy(() => 
  import('@directus/ui/components/charts')
);

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DataGrid />
      <Charts />
    </Suspense>
  );
}
```

## Framework Integration

### Next.js

#### App Router (Next.js 13+)

```tsx
// app/layout.tsx
import '@directus/ui/dist/styles.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

```tsx
// app/page.tsx
'use client';

import { Button } from '@directus/ui';

export default function Home() {
  return <Button>Click me</Button>;
}
```

#### Pages Router

```tsx
// pages/_app.tsx
import '@directus/ui/dist/styles.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

### Vite

```tsx
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@directus/ui/dist/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Create React App

```tsx
// index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@directus/ui/dist/styles.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Remix

```tsx
// root.tsx
import { Links, LiveReload, Meta, Outlet, Scripts } from '@remix-run/react';
import directusStyles from '@directus/ui/dist/styles.css';

export function links() {
  return [{ rel: 'stylesheet', href: directusStyles }];
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
```

## TypeScript Configuration

### Basic Setup

```json
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["@directus/ui"]
  }
}
```

### Type Imports

```tsx
import type { ButtonProps, CardProps, AlertProps } from '@directus/ui';

const MyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};
```

## Bundle Size Optimization

### Production Build

The library is optimized for production with:
- Tree-shaking support
- Minified CSS and JavaScript
- Gzipped assets < 600KB total

### Analyze Bundle

```bash
npm run build:analyze
```

### External Dependencies

These peer dependencies are externalized to reduce bundle size:

```json
{
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  }
}
```

## CSS Customization

### CSS Variables

Override default theme variables:

```css
:root {
  /* Colors */
  --directus-primary: #2563eb;
  --directus-primary-hover: #1d4ed8;
  --directus-secondary: #64748b;
  
  /* Typography */
  --directus-font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --directus-font-size-base: 16px;
  
  /* Spacing */
  --directus-spacing-unit: 4px;
  
  /* Borders */
  --directus-border-radius: 6px;
  --directus-border-width: 1px;
  
  /* Shadows */
  --directus-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --directus-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
```

### Dark Mode

```css
@media (prefers-color-scheme: dark) {
  :root {
    --directus-background: #0a0a0a;
    --directus-foreground: #fafafa;
    --directus-primary: #3b82f6;
  }
}

/* Or with class */
.dark {
  --directus-background: #0a0a0a;
  --directus-foreground: #fafafa;
}
```

## Troubleshooting

### Common Issues

#### Styles Not Loading

```tsx
// Ensure styles are imported before components
import '@directus/ui/dist/styles.css'; // ✅ First
import { Button } from '@directus/ui'; // Then components
```

#### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npm install
```

#### Build Errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

#### SSR Issues

```tsx
// For Next.js or SSR environments
import dynamic from 'next/dynamic';

const Button = dynamic(
  () => import('@directus/ui').then(mod => mod.Button),
  { ssr: false }
);
```

## Version Compatibility

| Directus UI | React | TypeScript | Node.js |
|-------------|-------|------------|---------|
| 1.x         | ≥18.0 | ≥5.0       | ≥16.0   |
| 2.x         | ≥18.0 | ≥5.0       | ≥18.0   |

## Migration from Previous Versions

See our [Migration Guide](../guides/migration.md) for upgrading instructions.

## Development Setup

For contributing to Directus UI:

```bash
# Clone the repository
git clone https://github.com/dainabase/directus-unified-platform.git

# Install dependencies
cd directus-unified-platform/packages/ui
npm install

# Start development server
npm run dev

# Run Storybook
npm run sb
```

## Support

- 📖 [Documentation](https://github.com/dainabase/directus-unified-platform/tree/main/docs)
- 💬 [Discord Community](https://discord.gg/directus)
- 🐛 [Issue Tracker](https://github.com/dainabase/directus-unified-platform/issues)
- 📧 [Email Support](mailto:support@directus.io)

---

<div align="center">

[← Back to Docs](../README.md) | [Quick Start →](./quick-start.md)

</div>
