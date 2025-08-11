# 🎨 Components Documentation

Complete API documentation and examples for all 58 Directus UI components.

## 📋 Quick Navigation

### Core Components
- [Button](./button.md) - Interactive button component
- [Icon](./icon.md) - SVG icon system
- [Label](./label.md) - Form labels and text
- [Separator](./separator.md) - Visual divider

### Layout
- [Card](./card.md) - Content container with styling
- [Resizable](./resizable.md) - Resizable panels
- [ScrollArea](./scroll-area.md) - Custom scrollbar area
- [Collapsible](./collapsible.md) - Expandable content sections

### Forms & Inputs
- [Form](./form.md) - Form wrapper with validation
- [Input](./input.md) - Text input field
- [Textarea](./textarea.md) - Multi-line text input
- [Select](./select.md) - Dropdown selection
- [Checkbox](./checkbox.md) - Checkbox input
- [RadioGroup](./radio-group.md) - Radio button group
- [Switch](./switch.md) - Toggle switch
- [Slider](./slider.md) - Range slider
- [DatePicker](./date-picker.md) - Date selection
- [DateRangePicker](./date-range-picker.md) - Date range selection
- [ColorPicker](./color-picker.md) - Color selection tool
- [FileUpload](./file-upload.md) - File upload component
- [Rating](./rating.md) - Star rating input

### Data Display
- [Table](./table.md) - Data table
- [DataGrid](./data-grid.md) - Advanced data grid
- [DataGridAdv](./data-grid-adv.md) - Enterprise data grid
- [Charts](./charts.md) - Chart components
- [Timeline](./timeline.md) - Timeline visualization
- [Calendar](./calendar.md) - Calendar display

### Navigation
- [NavigationMenu](./navigation-menu.md) - Site navigation
- [Tabs](./tabs.md) - Tabbed interface
- [Stepper](./stepper.md) - Step-by-step navigation
- [Pagination](./pagination.md) - Page navigation
- [Menubar](./menubar.md) - Application menubar

### Feedback
- [Alert](./alert.md) - Alert messages
- [Toast](./toast.md) - Toast notifications
- [Sonner](./sonner.md) - Advanced toast system
- [Progress](./progress.md) - Progress indicators
- [Skeleton](./skeleton.md) - Loading placeholders
- [Badge](./badge.md) - Status badges

### Overlays
- [Dialog](./dialog.md) - Modal dialogs
- [Sheet](./sheet.md) - Side panel overlay
- [Popover](./popover.md) - Popover container
- [Tooltip](./tooltip.md) - Hover tooltips
- [HoverCard](./hover-card.md) - Hover information cards
- [DropdownMenu](./dropdown-menu.md) - Dropdown menus
- [ContextMenu](./context-menu.md) - Right-click menus

### Advanced
- [CommandPalette](./command-palette.md) - Command search interface
- [Carousel](./carousel.md) - Image/content carousel
- [Accordion](./accordion.md) - Collapsible panels
- [Avatar](./avatar.md) - User avatars
- [TextAnimations](./text-animations.md) - Animated text effects
- [ErrorBoundary](./error-boundary.md) - Error handling wrapper
- [Toggle](./toggle.md) - Toggle button
- [ToggleGroup](./toggle-group.md) - Toggle button group
- [UIProvider](./ui-provider.md) - Theme and context provider
- [FormsDemo](./forms-demo.md) - Form examples showcase

## 📖 Component Documentation Structure

Each component documentation includes:

### 1. Overview
- Component description
- Use cases
- Visual examples

### 2. Installation
```tsx
import { ComponentName } from '@directus/ui';
```

### 3. Props API
Complete TypeScript interface with descriptions

### 4. Usage Examples
```tsx
// Basic usage
<ComponentName prop="value" />

// Advanced usage
<ComponentName 
  prop="value"
  onEvent={handleEvent}
/>
```

### 5. Styling
- CSS variables
- Theme customization
- Class names

### 6. Accessibility
- ARIA attributes
- Keyboard navigation
- Screen reader support

### 7. Best Practices
- Do's and don'ts
- Performance tips
- Common patterns

## 🎯 Component Categories Explained

### Core Components
Essential building blocks used throughout the library.

### Layout Components
Structure and organize content on the page.

### Forms & Inputs
Complete form building toolkit with validation.

### Data Display
Present data in various formats.

### Navigation
Help users move through your application.

### Feedback
Communicate status and provide user feedback.

### Overlays
Content that appears above the main interface.

### Advanced Components
Complex, feature-rich components for specific use cases.

## 🚀 Quick Start Guide

### Basic Setup
```tsx
import { Button, Card, Alert } from '@directus/ui';
import '@directus/ui/dist/styles.css';

function MyComponent() {
  return (
    <Card>
      <Alert>Hello World</Alert>
      <Button>Click me</Button>
    </Card>
  );
}
```

### With TypeScript
```tsx
import type { ButtonProps } from '@directus/ui';
import { Button } from '@directus/ui';

const MyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};
```

### Lazy Loading
```tsx
import { lazy, Suspense } from 'react';

const DataGrid = lazy(() => 
  import('@directus/ui').then(mod => ({ default: mod.DataGrid }))
);

function MyApp() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DataGrid />
    </Suspense>
  );
}
```

## 🎨 Theming

All components support theming through CSS variables:

```css
:root {
  --directus-primary: #2e7d32;
  --directus-secondary: #1976d2;
  --directus-border-radius: 8px;
  --directus-font-family: 'Inter', sans-serif;
}
```

## ♿ Accessibility

All components are built with accessibility in mind:
- ✅ WCAG 2.1 Level AA compliant
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Focus management
- ✅ ARIA attributes

## 📊 Component Complexity Levels

- **🟢 Basic**: Simple, single-purpose components
- **🟡 Intermediate**: Components with multiple features
- **🔴 Advanced**: Complex components requiring configuration

## 🔗 Resources

- [Component Playground](https://storybook.directus.io)
- [Design Tokens](../guides/design-tokens.md)
- [TypeScript Types](../api/types.md)
- [Migration Guide](../guides/migration.md)

---

<div align="center">

**Need help?** Check our [FAQ](../faq.md) or [open an issue](https://github.com/dainabase/directus-unified-platform/issues)

</div>
