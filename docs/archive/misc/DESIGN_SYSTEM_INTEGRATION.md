# 🎨 Design System Integration Guide

## @dainabase/ui v0.3.0 - Score: 98/100

### 🚀 Quick Integration

This guide helps you integrate the @dainabase/ui Design System into your existing React applications.

## 📦 Package Information

- **Name**: `@dainabase/ui`
- **Version**: `0.3.0`
- **Score**: `98/100`
- **Components**: `25/25`
- **Registry**: GitHub Packages
- **Documentation**: [Storybook](https://dainabase.github.io/directus-unified-platform)

## 🔧 Integration Steps

### 1. Install the Package

```bash
# Configure npm for GitHub Packages
echo "@dainabase:registry=https://npm.pkg.github.com" >> .npmrc

# Install
npm install @dainabase/ui@0.3.0
```

### 2. Setup Tailwind CSS

```js
// tailwind.config.js
import { uiConfig } from "@dainabase/ui/tailwind.config";

export default {
  presets: [uiConfig],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@dainabase/ui/dist/**/*.js",
  ],
};
```

### 3. Import Styles

```css
/* In your global CSS (e.g., index.css or App.css) */
@import "@dainabase/ui/dist/index.css";

/* Ensure Montserrat font is loaded */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');

:root {
  --font-sans: 'Montserrat', sans-serif;
}
```

### 4. Setup Provider (if using themes)

```tsx
// App.tsx or main.tsx
import { ThemeProvider } from "@dainabase/ui";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

## 🎯 Common Integration Patterns

### Portal Dashboard Integration

```tsx
import { 
  AppShell,
  Card,
  Button,
  DataGrid,
  Charts
} from "@dainabase/ui";

function Dashboard() {
  return (
    <AppShell>
      <AppShell.Header>
        <h1>Dashboard</h1>
      </AppShell.Header>
      
      <AppShell.Sidebar>
        {/* Navigation */}
      </AppShell.Sidebar>
      
      <AppShell.Content>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <Card.Header>
              <Card.Title>Revenue</Card.Title>
            </Card.Header>
            <Card.Content>
              <Charts.AreaChart data={revenueData} />
            </Card.Content>
          </Card>
          
          <Card>
            <Card.Header>
              <Card.Title>Tasks</Card.Title>
            </Card.Header>
            <Card.Content>
              <DataGrid data={tasksData} />
            </Card.Content>
          </Card>
        </div>
      </AppShell.Content>
    </AppShell>
  );
}
```

### Form Integration

```tsx
import { 
  Form,
  Input,
  Select,
  DateRangePicker,
  Button 
} from "@dainabase/ui";

function ProjectForm() {
  const [dateRange, setDateRange] = useState();
  
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Field>
        <Form.Label>Project Name</Form.Label>
        <Input placeholder="Enter project name" />
      </Form.Field>
      
      <Form.Field>
        <Form.Label>Priority</Form.Label>
        <Select>
          <Select.Option value="high">High</Select.Option>
          <Select.Option value="medium">Medium</Select.Option>
          <Select.Option value="low">Low</Select.Option>
        </Select>
      </Form.Field>
      
      <Form.Field>
        <Form.Label>Timeline</Form.Label>
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          placeholder="Select project dates"
        />
      </Form.Field>
      
      <Button type="submit" variant="primary">
        Create Project
      </Button>
    </Form>
  );
}
```

## 🎨 Design Tokens Usage

### Using Tokens in Custom Components

```tsx
import { tokens } from "@dainabase/ui/tokens";

const CustomComponent = () => {
  return (
    <div 
      style={{
        backgroundColor: tokens.colors.background,
        color: tokens.colors.foreground,
        padding: tokens.spacing.md,
        borderRadius: tokens.radius.lg,
      }}
    >
      Custom content with DS tokens
    </div>
  );
};
```

### Extending with Tailwind

```jsx
// Use DS classes directly
<div className="bg-primary text-primary-foreground rounded-lg p-4">
  Content
</div>

// Combine with custom classes
<div className="bg-primary/10 border border-primary rounded-xl">
  Subtle primary background
</div>
```

## 🔄 Migration from Custom Components

### Before (Custom Implementation)

```jsx
// Old custom button
<button 
  className="custom-btn" 
  onClick={handleClick}
>
  Click me
</button>
```

### After (DS Component)

```jsx
// New DS button
import { Button } from "@dainabase/ui";

<Button 
  variant="primary"
  onClick={handleClick}
>
  Click me
</Button>
```

## 📊 Component Mapping

| Your Component | DS Component | Migration Notes |
|---------------|--------------|-----------------|
| CustomButton | Button | Supports all variants |
| CustomCard | Card | Includes header/content/footer |
| CustomModal | Dialog | Built on Radix UI |
| CustomTabs | Tabs | Accessible by default |
| CustomTable | DataGrid | Advanced features included |
| CustomDatePicker | DatePicker/Calendar | Now fully functional |
| CustomSelect | Select | Searchable option available |

## 🚨 Common Issues & Solutions

### Issue: Styles not applying

```bash
# Ensure CSS is imported
import "@dainabase/ui/dist/index.css";

# Check Tailwind config includes DS path
content: [
  "./node_modules/@dainabase/ui/dist/**/*.js"
]
```

### Issue: TypeScript errors

```tsx
// Install types if needed
npm install --save-dev @types/react @types/react-dom

// Import types
import type { ButtonProps } from "@dainabase/ui";
```

### Issue: Font not loading

```css
/* Add to your global CSS */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');

body {
  font-family: var(--font-sans);
}
```

## 🎯 Best Practices

### ✅ DO

- Use DS components as primary building blocks
- Follow the token system for consistency
- Leverage built-in accessibility features
- Use semantic color names (primary, secondary, etc.)
- Test with Storybook during development

### ❌ DON'T

- Override DS styles with !important
- Mix different UI libraries
- Create custom components for existing DS components
- Use inline styles when tokens are available
- Skip accessibility testing

## 🔧 Advanced Configuration

### Custom Theme Extension

```js
// tailwind.config.js
import { uiConfig } from "@dainabase/ui/tailwind.config";

export default {
  presets: [uiConfig],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#your-brand-color',
          // Add your brand colors
        }
      }
    }
  }
};
```

### Component Composition

```tsx
// Create composite components using DS primitives
import { Card, Button, Icon } from "@dainabase/ui";

export function TaskCard({ task, onComplete }) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>{task.title}</Card.Title>
        <Button 
          size="sm" 
          variant="ghost"
          onClick={onComplete}
        >
          <Icon name="check" />
        </Button>
      </Card.Header>
      <Card.Content>
        {task.description}
      </Card.Content>
    </Card>
  );
}
```

## 📚 Resources

- [Component Documentation](https://dainabase.github.io/directus-unified-platform)
- [GitHub Repository](https://github.com/dainabase/directus-unified-platform)
- [Migration Guide](./MIGRATION.md)
- [Design Tokens](./packages/ui/tokens.ts)
- [Examples](./packages/ui/src/stories)

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/dainabase/directus-unified-platform/issues)
- **Email**: admin@dainamics.ch
- **Documentation**: [Storybook](https://dainabase.github.io/directus-unified-platform)

---

**Version**: 0.3.0 | **Score**: 98/100 | **Components**: 25/25 | **Coverage**: 80%
