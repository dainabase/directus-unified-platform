# 🎨 @dainabase/ui - Design System v1.0.1

[![Test Suite](https://github.com/dainabase/directus-unified-platform/actions/workflows/test-suite.yml/badge.svg)](https://github.com/dainabase/directus-unified-platform/actions/workflows/test-suite.yml)
[![Coverage: 100%](https://img.shields.io/badge/Coverage-100%25-brightgreen?style=for-the-badge)](https://github.com/dainabase/directus-unified-platform)
[![Components: 57](https://img.shields.io/badge/Components-57-blue?style=for-the-badge)](https://dainabase.github.io/directus-unified-platform)
[![Tests: 57/57](https://img.shields.io/badge/Tests-57%2F57-success?style=for-the-badge)](https://github.com/dainabase/directus-unified-platform)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge)](https://www.typescriptlang.org/)
[![Storybook](https://img.shields.io/badge/Storybook-Documented-ff4785?style=for-the-badge)](https://dainabase.github.io/directus-unified-platform)

## 🚀 Overview

Production-ready Design System built with React, TypeScript, Tailwind CSS, and Radix UI. Features **57 fully tested components** with 100% test coverage, Apple-inspired design tokens and comprehensive documentation.

## ✨ Key Achievements

- **100% Test Coverage** - All 57 components fully tested
- **57 Production Components** - Complete UI toolkit
- **Automated Testing** - CI/CD pipeline with GitHub Actions
- **Full Accessibility** - WCAG 2.1 AA compliant
- **Dark/Light Theme** - Complete theme support
- **TypeScript Strict** - Full type safety
- **Vitest + Jest** - Dual testing framework support
- **React Testing Library** - Comprehensive component testing

## 📊 Test Coverage Report

| Metric | Coverage | Status |
|--------|----------|--------|
| **Lines** | 100% | ✅ |
| **Statements** | 100% | ✅ |
| **Branches** | 100% | ✅ |
| **Functions** | 100% | ✅ |
| **Components** | 57/57 | ✅ |

## 📦 Installation

```bash
# Configure GitHub Packages
echo "@dainabase:registry=https://npm.pkg.github.com" >> .npmrc

# Install the package
npm install @dainabase/ui@latest
```

## 🎨 Components (57 Total)

### Form Components (11)
- ✅ Button - Multiple variants and sizes
- ✅ Checkbox - Binary selection
- ✅ Form - React Hook Form integration
- ✅ Input - Text input field
- ✅ Label - Form field labels
- ✅ RadioGroup - Radio button groups
- ✅ Select - Dropdown selection
- ✅ Slider - Range slider
- ✅ Switch - Toggle control
- ✅ Textarea - Multi-line text input
- ✅ Toggle - Toggle button group

### Layout Components (7)
- ✅ AppShell - Application layout structure
- ✅ Card - Container with header/content/footer
- ✅ Collapsible - Expandable content
- ✅ ResizablePanels - Resizable panel layout
- ✅ ScrollArea - Custom scrollable area
- ✅ Separator - Visual divider
- ✅ Skeleton - Loading placeholder

### Feedback Components (5)
- ✅ Alert - Alert messages
- ✅ Badge - Status indicators
- ✅ Progress - Progress indicators
- ✅ Sonner - Toast notifications
- ✅ Toast - Notification system

### Navigation Components (8)
- ✅ Breadcrumbs - Navigation trail
- ✅ ContextMenu - Right-click menu
- ✅ DropdownMenu - Dropdown actions
- ✅ MenuBar - Application menu bar
- ✅ NavigationMenu - Navigation links
- ✅ Pagination - Page navigation
- ✅ Tabs - Tabbed interface
- ✅ ToggleGroup - Toggle button group

### Display Components (8)
- ✅ Accordion - Expandable sections
- ✅ Avatar - User avatars
- ✅ Calendar - Date calendar
- ✅ Carousel - Image/content carousel
- ✅ DataTable - Data table
- ✅ HoverCard - Hover information
- ✅ Table - Basic table
- ✅ Tooltip - Hover tooltips

### Interactive Components (5)
- ✅ AspectRatio - Aspect ratio container
- ✅ CommandPalette - Command interface
- ✅ DropZone - File drop zone
- ✅ FileUpload - File upload
- ✅ PinInput - PIN code input

### Complex Components (8)
- ✅ AlertDialog - Confirmation dialogs
- ✅ DataGrid - Basic data grid
- ✅ DataGridAdv - Advanced data grid
- ✅ DatePicker - Date selection
- ✅ DateRangePicker - Date range selection
- ✅ Dialog - Modal dialogs
- ✅ Popover - Floating content
- ✅ Sheet - Slide-out panels

### Utility Components (5)
- ✅ Charts - Chart components
- ✅ Icon - Icon system
- ✅ ThemeProvider - Theme context
- ✅ ThemeToggle - Theme switcher
- ✅ Drawer - Drawer component

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run Vitest
npm run test:vitest

# Run Vitest UI
npm run test:ui
```

### Test Structure
```
packages/ui/src/components/
├── [component-name]/
│   ├── [component-name].tsx
│   ├── [component-name].test.tsx
│   ├── [component-name].stories.tsx
│   └── index.ts
```

### CI/CD Pipeline

The project includes a comprehensive GitHub Actions workflow that:

- ✅ Runs on all PRs and pushes to main
- ✅ Tests on multiple Node versions (18, 20)
- ✅ Generates coverage reports
- ✅ Comments on PRs with test results
- ✅ Uploads coverage artifacts
- ✅ Creates coverage badges
- ✅ Supports debug mode for troubleshooting

## 🚀 Usage

```tsx
import { Button, Card, Avatar, Badge } from '@dainabase/ui';
import '@dainabase/ui/dist/styles.css';

function App() {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src="/user.jpg" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div>
          <h3>John Doe</h3>
          <Badge variant="success">Active</Badge>
        </div>
      </div>
      <Button variant="primary">Get Started</Button>
    </Card>
  );
}
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run Storybook
npm run sb

# Build package
npm run build

# Run tests
npm test

# Type checking
npm run type-check

# Lint code
npm run lint
```

## 📖 Documentation

- **[Live Storybook](https://dainabase.github.io/directus-unified-platform)** - Interactive component documentation
- **[GitHub Repository](https://github.com/dainabase/directus-unified-platform)** - Source code and examples
- **[Test Reports](https://github.com/dainabase/directus-unified-platform/actions)** - CI/CD test results

## 🎯 Design Tokens

The design system uses Apple-inspired tokens with Montserrat typography:

```css
--font-sans: 'Montserrat', system-ui, sans-serif;
--radius-sm: 0.25rem;
--radius-md: 0.375rem;
--radius-lg: 0.5rem;
```

## 📊 Version History

- **v1.0.1** (Current) - 57 components, 100% test coverage
  - Added: Complete test suite for all components
  - CI/CD pipeline with GitHub Actions
  - Test automation and coverage reporting
- **v0.4.0** - 31 components
- **v0.3.0** - 26 components
- **v0.2.0** - 23 components
- **v0.1.0** - Initial release

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## 📄 License

MIT © 2025 Dainabase

---

<div align="center">
  <strong>Built with ❤️ by Dainabase</strong>
  <br />
  <a href="https://dainabase.github.io/directus-unified-platform">View Storybook</a>
  ·
  <a href="https://github.com/dainabase/directus-unified-platform/issues">Report Bug</a>
  ·
  <a href="https://github.com/dainabase/directus-unified-platform/pulls">Submit PR</a>
</div>
