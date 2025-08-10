# @dainabase/ui

Apple-style Design System for modern React applications.

[![Version](https://img.shields.io/npm/v/@dainabase/ui?registry_uri=https://npm.pkg.github.com)](https://github.com/dainabase/directus-unified-platform/packages)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/dainabase/directus-unified-platform/actions/workflows/ui-ci.yml/badge.svg?branch=feat/design-system-apple)](https://github.com/dainabase/directus-unified-platform/actions/workflows/ui-ci.yml)
[![Chromatic](https://github.com/dainabase/directus-unified-platform/actions/workflows/ui-chromatic.yml/badge.svg?branch=feat/design-system-apple)](https://github.com/dainabase/directus-unified-platform/actions/workflows/ui-chromatic.yml)
[![A11y](https://github.com/dainabase/directus-unified-platform/actions/workflows/ui-a11y.yml/badge.svg?branch=feat/design-system-apple)](https://github.com/dainabase/directus-unified-platform/actions/workflows/ui-a11y.yml)
[![Storybook](https://img.shields.io/badge/Storybook-Pages-FF4785?logo=storybook)](https://dainabase.github.io/directus-unified-platform/)

## 📋 Quick Links

- 📚 [Storybook Documentation](https://dainabase.github.io/directus-unified-platform/)
- 🎨 [Chromatic Visual Tests](https://www.chromatic.com/builds?appId=66b75b7c34b967e64b8b8e09)
- 🔍 [GitHub Actions](https://github.com/dainabase/directus-unified-platform/actions)
- 📦 [Package on GitHub](https://github.com/dainabase/directus-unified-platform/packages)

## 🎨 Visual Testing (Chromatic)

This Design System uses Chromatic for visual regression testing. Every component change is automatically captured and compared against baselines.

### Status
- **Build Status**: ![Chromatic Status](https://github.com/dainabase/directus-unified-platform/actions/workflows/ui-chromatic.yml/badge.svg)
- **Latest Build**: [View on Chromatic](https://www.chromatic.com/builds?appId=66b75b7c34b967e64b8b8e09)
- **Coverage**: 23 components with visual tests

### Visual Testing Features
- ✅ Automatic screenshot capture on every push
- ✅ Visual diff detection for UI changes
- ✅ PR comments with change summary
- ✅ Blocking CI on visual regressions
- ✅ Component library hosting

## ♿ Accessibility

All components are tested for WCAG 2.1 AA compliance using automated tools:

- **Status**: ![A11y Status](https://github.com/dainabase/directus-unified-platform/actions/workflows/ui-a11y.yml/badge.svg)
- **Coverage**: 100% of interactive components
- **Testing**: Axe-core integration with Storybook

## Installation

First, configure npm to use GitHub Packages for the @dainabase scope:

```bash
echo "@dainabase:registry=https://npm.pkg.github.com/" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> .npmrc
```

Then install the package:

```bash
pnpm add @dainabase/ui
# or
npm install @dainabase/ui
# or
yarn add @dainabase/ui
```

## Setup

### 1. Configure Tailwind

Use the design system tokens in your `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";
import { tokens } from "@dainabase/ui/tokens";

export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@dainabase/ui/dist/**/*.{js,ts}"
  ],
  theme: {
    extend: {
      colors: tokens.colors,
      borderRadius: tokens.radius,
      spacing: tokens.spacing,
      boxShadow: tokens.shadow,
      fontFamily: { 
        sans: [tokens.font.sans, "sans-serif"] 
      }
    }
  },
  plugins: []
} satisfies Config;
```

### 2. Setup Font (Next.js example)

```tsx
// app/layout.tsx
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: "--font-sans"
});

export default function RootLayout({ children }) {
  return (
    <html className={montserrat.variable}>
      <body>{children}</body>
    </html>
  );
}
```

For other frameworks, load Montserrat and set the CSS variable `--font-sans`.

### 3. Setup Theme Provider

Wrap your app with the ThemeProvider:

```tsx
import { ThemeProvider } from "@dainabase/ui";

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      {/* Your app */}
    </ThemeProvider>
  );
}
```

### 4. Import base styles

Add to your global CSS:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Optional: Add any custom global styles */
```

## Usage

```tsx
import { Button, Card, Dialog } from "@dainabase/ui";

function MyComponent() {
  return (
    <Card>
      <Button variant="primary">Click me</Button>
    </Card>
  );
}
```

## Components

- **Layout**: AppShell
- **Core**: Button, Card, Dialog, Sheet, Tabs, DropdownMenu, Toast
- **Forms**: Input, Textarea, Select, Switch, Checkbox
- **Data**: DataGrid, DataGridAdv (virtualized)
- **Date**: Calendar, DatePicker, DateRangePicker
- **Charts**: LineChart, BarChart, AreaChart, DonutChart, RadialGauge
- **Utils**: CommandPalette, ThemeToggle, Icon

## TypeScript

Full TypeScript support with exported types:

```tsx
import type { ButtonProps, CardProps } from "@dainabase/ui";
```

## Features

- 🎨 Apple-inspired design language
- 🌗 Dark/light theme support
- ♿ Accessibility-first (WCAG 2.1 AA)
- 📱 Responsive by default
- 🚀 Tree-shakeable
- 📘 Full TypeScript support
- 📖 Comprehensive Storybook docs
- 🎭 Visual regression testing
- 🔍 Automated accessibility testing

## Quality Assurance

### CI/CD Pipeline
- **Build & Type Check**: Every commit
- **Linting**: ESLint with strict rules
- **Visual Testing**: Chromatic on every PR
- **Accessibility**: Automated a11y testing
- **Unit Tests**: Component testing suite
- **Consumer Build**: Integration smoke tests

### Test Coverage
- **Visual Tests**: 100% component coverage
- **A11y Tests**: WCAG 2.1 AA compliance
- **Unit Tests**: Core functionality coverage

## Development

See [Storybook](https://dainabase.github.io/directus-unified-platform/) for interactive documentation.

### Local Development
```bash
# Install dependencies
pnpm install

# Run Storybook
pnpm --filter @dainabase/ui sb

# Build package
pnpm --filter @dainabase/ui build

# Run tests
pnpm --filter @dainabase/ui test
```

## License

MIT © Dainabase
