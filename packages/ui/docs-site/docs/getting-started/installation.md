---
id: installation
title: Installation
sidebar_position: 2
---

# Installation

Get started with Dainabase UI in your React project. This guide will walk you through the installation process and initial setup.

## Prerequisites

Before installing Dainabase UI, ensure you have:

- **Node.js** 18.0 or higher
- **React** 18.0 or higher
- **React DOM** 18.0 or higher
- A React project (Create React App, Next.js, Vite, etc.)

## Package Installation

### NPM

```bash
npm install @dainabase/ui
```

### Yarn

```bash
yarn add @dainabase/ui
```

### PNPM

```bash
pnpm add @dainabase/ui
```

## Peer Dependencies

Dainabase UI uses Radix UI primitives under the hood. Install the required peer dependencies based on the components you plan to use:

### Core Dependencies (Required)

```bash
npm install @radix-ui/react-slot @radix-ui/react-primitive
```

### Component-Specific Dependencies

Install only the dependencies for components you'll use to minimize bundle size:

```bash
# For form components
npm install @radix-ui/react-label @radix-ui/react-checkbox @radix-ui/react-switch

# For overlay components
npm install @radix-ui/react-dialog @radix-ui/react-popover @radix-ui/react-tooltip

# For navigation components
npm install @radix-ui/react-tabs @radix-ui/react-dropdown-menu

# For data display
npm install @tanstack/react-table recharts
```

### Install All Dependencies (Optional)

If you plan to use most components, you can install all peer dependencies:

```bash
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog \
  @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-popover \
  @radix-ui/react-progress @radix-ui/react-select @radix-ui/react-separator \
  @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-tabs \
  @radix-ui/react-toast @radix-ui/react-tooltip
```

## Setup

### 1. Import Styles

Add the Dainabase UI styles to your application. Import this in your root component or global CSS file:

```css
/* In your global CSS file or App.css */
@import '@dainabase/ui/dist/styles.css';
```

Or if using a JavaScript entry point:

```tsx
// In your App.tsx or index.tsx
import '@dainabase/ui/dist/styles.css';
```

### 2. Configure Tailwind CSS (Optional)

If you're using Tailwind CSS, extend your configuration to include Dainabase UI's design tokens:

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@dainabase/ui/dist/**/*.{js,mjs}'
  ],
  theme: {
    extend: {
      // Dainabase UI will automatically provide theme extensions
    },
  },
  plugins: [
    require('tailwindcss-animate') // Optional: for animations
  ],
}
```

### 3. Set Up Theme Provider

Wrap your application with the Dainabase UI provider for theme and configuration support:

```tsx
// App.tsx
import { UIProvider } from '@dainabase/ui';

function App() {
  return (
    <UIProvider>
      {/* Your app content */}
    </UIProvider>
  );
}

export default App;
```

### 4. TypeScript Configuration

Dainabase UI is built with TypeScript. For the best development experience, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["@dainabase/ui"]
  }
}
```

## Usage Example

Once installed and configured, you can start using Dainabase UI components:

```tsx
import { Button, Card, Input, Label } from '@dainabase/ui';

function LoginForm() {
  return (
    <Card className="w-full max-w-md p-6">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="Enter your email"
          />
        </div>
        
        <div>
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="Enter your password"
          />
        </div>
        
        <Button className="w-full">
          Sign In
        </Button>
      </div>
    </Card>
  );
}
```

## Framework-Specific Setup

### Next.js

For Next.js projects, import styles in your `_app.tsx`:

```tsx
// pages/_app.tsx or app/layout.tsx
import '@dainabase/ui/dist/styles.css';
import { UIProvider } from '@dainabase/ui';

export default function App({ Component, pageProps }) {
  return (
    <UIProvider>
      <Component {...pageProps} />
    </UIProvider>
  );
}
```

### Vite

For Vite projects, import in your `main.tsx`:

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@dainabase/ui/dist/styles.css';
import { UIProvider } from '@dainabase/ui';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UIProvider>
      <App />
    </UIProvider>
  </React.StrictMode>
);
```

### Create React App

For CRA projects, import in your `index.tsx`:

```tsx
// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@dainabase/ui/dist/styles.css';
import { UIProvider } from '@dainabase/ui';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <UIProvider>
      <App />
    </UIProvider>
  </React.StrictMode>
);
```

## Optimizations

### Tree Shaking

Dainabase UI supports tree shaking out of the box. Import only the components you need:

```tsx
// ✅ Good - Only imports what you use
import { Button, Card } from '@dainabase/ui';

// ❌ Avoid - Imports entire library
import * as UI from '@dainabase/ui';
```

### Lazy Loading

For large applications, consider lazy loading components:

```tsx
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const DataGrid = lazy(() => 
  import('@dainabase/ui').then(module => ({ 
    default: module.DataGrid 
  }))
);

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DataGrid data={data} columns={columns} />
    </Suspense>
  );
}
```

### Bundle Size Analysis

Monitor your bundle size impact:

```bash
# Analyze bundle with webpack-bundle-analyzer
npm run build
npm run analyze

# Check component sizes
npx bundlephobia @dainabase/ui
```

## Troubleshooting

### Common Issues

#### Styles Not Loading

If styles aren't appearing, ensure you've imported the CSS file:

```tsx
import '@dainabase/ui/dist/styles.css';
```

#### TypeScript Errors

If you encounter TypeScript errors, ensure you have the latest types:

```bash
npm install --save-dev @types/react @types/react-dom
```

#### Peer Dependency Warnings

Install missing peer dependencies shown in npm warnings:

```bash
npm install [missing-package-name]
```

### Getting Help

- 📚 Check our [documentation](https://docs.dainabase.dev)
- 💬 Join our [Discord community](https://discord.gg/dainabase)
- 🐛 Report issues on [GitHub](https://github.com/dainabase/directus-unified-platform/issues)
- 📧 Contact support at support@dainabase.com

## Next Steps

Now that you have Dainabase UI installed, explore:

- [Quick Start Guide](/docs/getting-started/quick-start) - Build your first component
- [Component Documentation](/docs/components/button) - Explore all available components
- [Theming Guide](/docs/theming/design-tokens) - Customize the look and feel
- [TypeScript Guide](/docs/getting-started/typescript) - TypeScript best practices

---

<div className="success-message">
  🎉 <strong>Congratulations!</strong> You've successfully installed Dainabase UI. Start building amazing interfaces!
</div>
