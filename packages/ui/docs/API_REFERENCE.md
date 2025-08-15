# @dainabase/ui - Component API Reference

## 📚 Complete Component Documentation

Version: **1.3.0** | Coverage: **95%** | Bundle: **38KB** | Components: **58**

## 🎯 Quick Navigation

### Core Components (3)
- [Icon](#icon) - Iconography system
- [Label](#label) - Form labels and text
- [Separator](#separator) - Visual dividers

### Layout Components (4)
- [Card](#card) - Container component
- [Collapsible](#collapsible) - Expandable content
- [Resizable](#resizable) - Resizable panels
- [ScrollArea](#scrollarea) - Custom scrollbars

### Form Components (13)
- [Button](#button) - Interactive buttons
- [Checkbox](#checkbox) - Checkbox inputs
- [ColorPicker](#colorpicker) - Color selection
- [DatePicker](#datepicker) - Date selection
- [DateRangePicker](#daterangepicker) - Date range selection
- [FileUpload](#fileupload) - File upload interface
- [Form](#form) - Form container with validation
- [Input](#input) - Text inputs
- [RadioGroup](#radiogroup) - Radio button groups
- [Select](#select) - Dropdown selection
- [Slider](#slider) - Range slider
- [Switch](#switch) - Toggle switches
- [Textarea](#textarea) - Multi-line text input

### Data Display (6)
- [Badge](#badge) - Status indicators
- [Chart](#chart) - Data visualization
- [DataGrid](#datagrid) - Advanced data tables
- [DataGridAdvanced](#datagridadvanced) - Enterprise data grid
- [Table](#table) - Basic tables
- [Timeline](#timeline) - Timeline visualization

### Navigation (5)
- [Breadcrumb](#breadcrumb) - Navigation breadcrumbs
- [NavigationMenu](#navigationmenu) - Navigation menus
- [Pagination](#pagination) - Page navigation
- [Stepper](#stepper) - Step-by-step navigation
- [Tabs](#tabs) - Tabbed interface

### Feedback (6)
- [Alert](#alert) - Alert messages
- [ErrorBoundary](#errorboundary) - Error handling
- [Progress](#progress) - Progress indicators
- [Skeleton](#skeleton) - Loading placeholders
- [Sonner](#sonner) - Toast notifications (alternative)
- [Toast](#toast) - Toast notifications

### Overlays (7)
- [ContextMenu](#contextmenu) - Right-click menus
- [Dialog](#dialog) - Modal dialogs
- [DropdownMenu](#dropdownmenu) - Dropdown menus
- [HoverCard](#hovercard) - Hover tooltips
- [Popover](#popover) - Popover content
- [Sheet](#sheet) - Slide-out panels
- [Tooltip](#tooltip) - Tooltips

### Advanced (14)
- [Accordion](#accordion) - Collapsible sections
- [Avatar](#avatar) - User avatars
- [Calendar](#calendar) - Calendar widget
- [Carousel](#carousel) - Image carousel
- [CommandPalette](#commandpalette) - Command interface
- [FormsDemo](#formsdemo) - Form examples
- [Menubar](#menubar) - Application menubar
- [Rating](#rating) - Star rating
- [TextAnimations](#textanimations) - Animated text
- [Toggle](#toggle) - Toggle button
- [ToggleGroup](#togglegroup) - Toggle button group
- [UIProvider](#uiprovider) - Theme provider

---

## 📖 Component API Details

### Button

The most fundamental interactive component with comprehensive functionality.

#### Import
```typescript
import { Button } from '@dainabase/ui';
// or for lazy loading
import { Button } from '@dainabase/ui/lazy/core';
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'primary' \| 'secondary' \| 'ghost' \| 'link' \| 'destructive'` | `'default'` | Visual style variant |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Shows loading spinner **(NEW in v1.3)** |
| `disabled` | `boolean` | `false` | Disables interaction |
| `fullWidth` | `boolean` | `false` | Full width button |
| `leftIcon` | `ReactNode` | - | Icon on the left |
| `rightIcon` | `ReactNode` | - | Icon on the right |
| `onClick` | `(e: MouseEvent) => void` | - | Click handler |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `asChild` | `boolean` | `false` | Render as child element |

#### Examples
```tsx
// Basic usage
<Button onClick={handleClick}>Click me</Button>

// With loading state (NEW in v1.3)
<Button loading={isLoading} onClick={handleSubmit}>
  Submit
</Button>

// With icons
<Button 
  leftIcon={<SaveIcon />}
  variant="primary"
  size="lg"
>
  Save Changes
</Button>

// As a link
<Button asChild variant="link">
  <a href="/docs">Documentation</a>
</Button>
```

#### Accessibility
- Full keyboard navigation support
- ARIA attributes automatically applied
- Focus management
- Screen reader optimized

---

### Dialog

Modal dialog component with accessibility and animation support.

#### Import
```typescript
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@dainabase/ui';
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | - | Open state change handler **(BREAKING in v1.3)** |
| `modal` | `boolean` | `true` | Modal behavior |
| `defaultOpen` | `boolean` | `false` | Default open state |

#### Examples
```tsx
// Controlled dialog (NEW API in v1.3)
const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### DataGrid

Advanced data grid with virtualization, sorting, filtering, and more.

#### Import
```typescript
import { DataGrid } from '@dainabase/ui';
// or for better performance
import { DataGrid } from '@dainabase/ui/lazy/data';
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | `[]` | Data array |
| `columns` | `Column<T>[]` | `[]` | Column definitions |
| `virtualized` | `boolean` | `true` | Enable virtualization **(NEW default in v1.3)** |
| `rowHeight` | `number` | `40` | Row height for virtualization **(Required in v1.3)** |
| `onRowClick` | `(row: T) => void` | - | Row click handler |
| `onSort` | `(column: string, direction: 'asc' \| 'desc') => void` | - | Sort handler |
| `pagination` | `boolean` | `false` | Enable pagination |
| `pageSize` | `number` | `10` | Items per page |
| `selectable` | `boolean` | `false` | Enable row selection |
| `onSelectionChange` | `(selected: T[]) => void` | - | Selection change handler |

#### Column Definition
```typescript
interface Column<T> {
  key: keyof T;
  header: string;
  width?: number;
  sortable?: boolean;
  render?: (value: any, row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
}
```

#### Examples
```tsx
// Basic usage with virtualization (NEW in v1.3)
const columns = [
  { key: 'id', header: 'ID', width: 50 },
  { key: 'name', header: 'Name', sortable: true },
  { key: 'status', header: 'Status', render: (value) => <Badge>{value}</Badge> }
];

<DataGrid
  data={users}
  columns={columns}
  virtualized={true}
  rowHeight={45}
  onRowClick={(row) => console.log('Clicked:', row)}
/>

// With pagination and selection
<DataGrid
  data={products}
  columns={productColumns}
  pagination
  pageSize={25}
  selectable
  onSelectionChange={(selected) => setSelectedProducts(selected)}
/>
```

#### Performance Notes
- Virtualization enabled by default for datasets > 100 rows
- Lazy loading recommended for large datasets
- Memoize columns array for optimal performance

---

### Select

Dropdown selection component built with Radix UI v2.

#### Import
```typescript
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from '@dainabase/ui';
```

#### Props (NEW in v1.3 - Radix UI v2)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Controlled value |
| `onValueChange` | `(value: string) => void` | - | Value change handler **(NEW API)** |
| `defaultValue` | `string` | - | Default value |
| `disabled` | `boolean` | `false` | Disable select |
| `placeholder` | `string` | - | Placeholder text |
| `multiple` | `boolean` | `false` | Allow multiple selection |

#### Examples
```tsx
// Basic usage (NEW API in v1.3)
<Select value={country} onValueChange={setCountry}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select a country" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>North America</SelectLabel>
      <SelectItem value="usa">United States</SelectItem>
      <SelectItem value="canada">Canada</SelectItem>
    </SelectGroup>
    <SelectGroup>
      <SelectLabel>Europe</SelectLabel>
      <SelectItem value="uk">United Kingdom</SelectItem>
      <SelectItem value="france">France</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>

// With form integration
<Form.Field name="category">
  <Label>Category</Label>
  <Select>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {categories.map(cat => (
        <SelectItem key={cat.id} value={cat.id}>
          {cat.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</Form.Field>
```

---

## 🎨 Theming

All components support theming through CSS variables and the UIProvider:

```tsx
import { UIProvider } from '@dainabase/ui';

<UIProvider
  theme={{
    colors: {
      primary: '#007bff',
      secondary: '#6c757d',
      success: '#28a745',
      danger: '#dc3545',
    },
    fonts: {
      body: 'Inter, sans-serif',
      heading: 'Poppins, sans-serif',
    },
    radii: {
      sm: '4px',
      md: '8px',
      lg: '12px',
    }
  }}
>
  <App />
</UIProvider>
```

## 🌍 Internationalization

All components support i18n through the built-in provider:

```tsx
import { I18nProvider } from '@dainabase/ui';
import frenchMessages from './locales/fr.json';

<I18nProvider locale="fr" messages={frenchMessages}>
  <App />
</I18nProvider>
```

## ♿ Accessibility

All components are WCAG 2.1 AAA compliant with:
- Full keyboard navigation
- Screen reader support
- Focus management
- ARIA attributes
- High contrast mode support
- Reduced motion support

## 📦 Bundle Optimization

### Lazy Loading
```typescript
// Import only what you need
import { Button } from '@dainabase/ui/lazy/core';
import { DataGrid } from '@dainabase/ui/lazy/data';

// Category bundles
import * as Forms from '@dainabase/ui/forms';
import * as Overlays from '@dainabase/ui/overlays';
```

### Tree Shaking
The package is fully tree-shakeable. Unused components are automatically removed from your bundle.

## 🔧 TypeScript

Full TypeScript support with:
- Complete type definitions
- Generic components
- Strict type checking
- IntelliSense support

```typescript
// Type-safe props
interface User {
  id: string;
  name: string;
  email: string;
}

const columns: Column<User>[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' }
];

<DataGrid<User> data={users} columns={columns} />
```

## 📞 Support

- 📖 [Documentation](https://dainabase.github.io/ui)
- 📊 [Storybook](https://storybook.dainabase.dev)
- 💬 [Discord](https://discord.gg/dainabase)
- 📧 [Email](mailto:dev@dainabase.com)

---

*API Reference v1.3.0 - Last updated: August 17, 2025*