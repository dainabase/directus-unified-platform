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

## Development

See [Storybook](https://sb.dainabase.com) for interactive documentation.

## License

MIT © Dainabase