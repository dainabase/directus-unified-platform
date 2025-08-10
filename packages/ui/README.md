# @dainabase/ui

Apple-style Design System for modern React applications.

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

Extend your `tailwind.config.ts` to use the design system tokens:

```ts
import { tailwindConfig } from "@dainabase/ui/tailwind.config";

export default {
  ...tailwindConfig,
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@dainabase/ui/src/**/*.{ts,tsx}"
  ],
  // Your overrides here
};
```

### 2. Import styles

In your root CSS file:

```css
@import "@dainabase/ui/src/globals.css";
```

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

## Features

- 🎨 Apple-inspired design language
- 🌗 Dark/light theme support
- ♿ Accessibility-first (WCAG 2.1 AA)
- 📱 Responsive by default
- 🚀 Tree-shakeable
- 📘 Full TypeScript support
- 📖 Comprehensive Storybook docs

## Development

See [Storybook](https://sb.dainabase.com) for interactive documentation.

## License

MIT © Dainabase