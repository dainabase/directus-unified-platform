# @dainabase/ui - Design System

![Version](https://img.shields.io/badge/version-0.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![Storybook](https://img.shields.io/badge/Storybook-7.6-ff4785)

A modern, accessible, and performant Design System built with React, TypeScript, and Tailwind CSS, inspired by Apple's Human Interface Guidelines.

## 🎯 Features

- **30+ Production-Ready Components**: Buttons, Forms, Data Grids, Charts, and more
- **Design Tokens**: Consistent spacing, colors, typography with Montserrat font
- **Accessibility First**: WCAG 2.1 AA compliant with full keyboard navigation
- **Dark Mode Support**: Built-in theme switching with system preference detection
- **TypeScript Native**: Full type safety and IntelliSense support
- **Tree-Shakeable**: Import only what you need
- **Storybook Documentation**: Interactive component playground

## 📦 Installation

### Using GitHub Packages

```bash
# Configure npm to use GitHub Packages
echo "@dainabase:registry=https://npm.pkg.github.com" >> .npmrc

# Install the package
npm install @dainabase/ui

# Or with pnpm
pnpm add @dainabase/ui

# Or with yarn
yarn add @dainabase/ui
```

### Peer Dependencies

```bash
npm install react react-dom
```

## 🚀 Quick Start

### 1. Import the CSS

```tsx
// In your app's entry point (e.g., _app.tsx or main.tsx)
import "@dainabase/ui/dist/index.css";
```

### 2. Setup Tailwind Config

```ts
// tailwind.config.ts
import { tailwindConfig } from "@dainabase/ui/tailwind.config";

export default {
  ...tailwindConfig,
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@dainabase/ui/dist/**/*.js",
  ],
};
```

### 3. Use Components

```tsx
import { Button, Card, Input } from "@dainabase/ui";

function App() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Welcome</Card.Title>
      </Card.Header>
      <Card.Content>
        <Input placeholder="Enter your name" />
        <Button variant="primary">Get Started</Button>
      </Card.Content>
    </Card>
  );
}
```

## 🎨 Design Tokens

Access design tokens for custom implementations:

```ts
import { tokens } from "@dainabase/ui/tokens";

// Use in your custom components
const customStyles = {
  color: tokens.colors.primary,
  fontFamily: tokens.font.sans,
  borderRadius: tokens.radius.md,
};
```

## 📚 Documentation

### Storybook

View the interactive component documentation:

```bash
# Clone the repository
git clone https://github.com/dainabase/directus-unified-platform.git
cd directus-unified-platform

# Install dependencies
pnpm install

# Run Storybook
pnpm -C packages/ui sb
```

Or visit our [online Storybook](https://dainabase.github.io/directus-unified-platform) (coming soon).

## 🧩 Components

### Layout
- `AppShell` - Application layout wrapper
- `Card` - Content container
- `Tabs` - Tabbed navigation

### Forms
- `Form` - Form wrapper with validation
- `Input` - Text input field
- `Textarea` - Multi-line text input
- `Select` - Dropdown selection
- `Checkbox` - Checkbox input
- `Switch` - Toggle switch
- `DatePicker` - Date selection

### Data Display
- `DataGrid` - Basic data table
- `DataGridAdv` - Advanced data table with sorting/filtering
- `Charts` - Data visualization components

### Feedback
- `Button` - Interactive buttons
- `Toast` - Notification messages
- `Dialog` - Modal dialogs
- `Sheet` - Slide-out panels
- `Tooltip` - Contextual tooltips

### Navigation
- `Breadcrumbs` - Navigation trail
- `DropdownMenu` - Contextual menus
- `CommandPalette` - Command search interface

### Display
- `Avatar` - User avatars
- `Badge` - Status indicators
- `Icon` - Icon wrapper
- `Progress` - Progress indicators
- `Skeleton` - Loading placeholders

## 🛠️ Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Clone the repository
git clone https://github.com/dainabase/directus-unified-platform.git
cd directus-unified-platform

# Install dependencies
pnpm install

# Navigate to UI package
cd packages/ui
```

### Commands

```bash
# Development
pnpm dev          # Watch mode for TypeScript
pnpm sb           # Run Storybook locally

# Building
pnpm build        # Build the library
pnpm build:sb:static  # Build Storybook static

# Quality
pnpm lint         # Run ESLint
pnpm format       # Format with Prettier
pnpm typecheck    # Type checking
pnpm validate     # Run all checks

# Testing
pnpm test         # Run tests
pnpm test:watch   # Watch mode
pnpm test:ci      # CI mode with coverage
```

## 🔄 Versioning

We use [Changesets](https://github.com/changesets/changesets) for version management:

```bash
# Create a changeset
pnpm changeset

# Version packages
pnpm version-packages

# Publish
pnpm release-packages
```

## 📊 Performance

- **Bundle Size**: ~45KB gzipped (core components)
- **Tree-Shaking**: Full support
- **CSS**: Optimized with PurgeCSS in production
- **Runtime**: Zero runtime CSS-in-JS

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

## 📄 License

MIT © [Dainabase](https://github.com/dainabase)

## 🙏 Credits

Built with:
- [Radix UI](https://www.radix-ui.com/) - Unstyled components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [React Hook Form](https://react-hook-form.com/) - Form handling
- [Recharts](https://recharts.org/) - Charts
- [TanStack Table](https://tanstack.com/table) - Data tables
- [Lucide Icons](https://lucide.dev/) - Icons

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/dainabase/directus-unified-platform/issues)
- **Email**: admin@dainamics.ch
- **Documentation**: [Storybook](https://dainabase.github.io/directus-unified-platform)

---

Made with ❤️ by [Dainabase](https://github.com/dainabase)
