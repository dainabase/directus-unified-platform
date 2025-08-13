---
id: scroll-area
title: ScrollArea
sidebar_position: 45
---

import { ScrollArea } from '@dainabase/ui';

# ScrollArea Component

A customizable scrollable area component that provides consistent scrolling behavior across platforms with optional scrollbar styling and smooth scroll animations.

## Preview

```tsx live
function ScrollAreaDemo() {
  return (
    <ScrollArea className="h-72 w-full rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="text-sm py-2 border-b">
            Tag {i + 1} - Scrollable content item with consistent behavior
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
```

## Features

- 🎨 **Custom Scrollbar Styling** - Fully customizable scrollbar appearance
- 📱 **Cross-Platform Consistency** - Uniform behavior across all browsers and devices
- ⚡ **Performance Optimized** - Smooth 60fps scrolling with hardware acceleration
- 🎯 **Auto-Hide Scrollbars** - Intelligent scrollbar visibility management
- 📏 **Flexible Sizing** - Adapts to container dimensions automatically
- 🔄 **Smooth Scroll** - Built-in smooth scrolling animations
- 📐 **Viewport Tracking** - Scroll position and viewport size tracking
- 🎭 **Theme Support** - Automatic theme adaptation for light/dark modes
- ♿ **Keyboard Navigation** - Full keyboard support with arrow keys and Page Up/Down
- 🖱️ **Mouse Wheel Support** - Enhanced mouse wheel scrolling with momentum

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```tsx
import { ScrollArea } from '@dainabase/ui';

function App() {
  return (
    <ScrollArea className="h-[200px] w-[350px]">
      <div className="p-4">
        {/* Your scrollable content here */}
      </div>
    </ScrollArea>
  );
}
```

## Examples

### 1. Vertical Scrolling

```tsx
function VerticalScrollExample() {
  return (
    <ScrollArea className="h-96 w-full rounded-md border">
      <div className="p-4 space-y-4">
        <h4 className="text-lg font-semibold">Vertical Scroll Content</h4>
        {Array.from({ length: 30 }).map((_, index) => (
          <div key={index} className="p-4 bg-gray-100 rounded-lg">
            <h5 className="font-medium">Item {index + 1}</h5>
            <p className="text-sm text-gray-600 mt-1">
              This is a scrollable item with detailed content that demonstrates
              vertical scrolling behavior in the ScrollArea component.
            </p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
```

### 2. Horizontal Scrolling

```tsx
function HorizontalScrollExample() {
  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {Array.from({ length: 20 }).map((_, index) => (
          <figure key={index} className="shrink-0">
            <div className="overflow-hidden rounded-md">
              <div className="h-40 w-60 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
                Card {index + 1}
              </div>
            </div>
            <figcaption className="pt-2 text-xs text-muted-foreground">
              Photo by Artist {index + 1}
            </figcaption>
          </figure>
        ))}
      </div>
    </ScrollArea>
  );
}
```

### 3. Both Directions Scrolling

```tsx
function BothDirectionsExample() {
  return (
    <ScrollArea className="h-96 w-full rounded-md border">
      <div className="p-4">
        <table className="w-max">
          <thead>
            <tr>
              {Array.from({ length: 15 }).map((_, i) => (
                <th key={i} className="border px-4 py-2">
                  Column {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 50 }).map((_, row) => (
              <tr key={row}>
                {Array.from({ length: 15 }).map((_, col) => (
                  <td key={col} className="border px-4 py-2">
                    Cell {row + 1}-{col + 1}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ScrollArea>
  );
}
```

### 4. Chat Messages Interface

```tsx
function ChatScrollExample() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Alice', text: 'Hey there!', time: '10:00 AM' },
    { id: 2, sender: 'You', text: 'Hi Alice! How are you?', time: '10:01 AM' },
    // Add more messages...
  ]);

  return (
    <div className="flex flex-col h-[500px] border rounded-lg">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Chat with Alice</h3>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'You' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === 'You'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <span className="text-xs opacity-70">{message.time}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <input
          type="text"
          placeholder="Type a message..."
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
    </div>
  );
}
```

### 5. Code Editor with Line Numbers

```tsx
function CodeEditorExample() {
  const codeLines = `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

function factorial(n) {
  if (n === 0) return 1;
  return n * factorial(n - 1);
}

class DataStructure {
  constructor() {
    this.items = [];
  }
  
  add(item) {
    this.items.push(item);
  }
  
  remove(index) {
    return this.items.splice(index, 1);
  }
}`.trim().split('\n');

  return (
    <div className="border rounded-lg overflow-hidden">
      <ScrollArea className="h-96">
        <div className="flex">
          <div className="bg-gray-50 text-gray-500 text-sm p-4 select-none">
            {codeLines.map((_, i) => (
              <div key={i} className="leading-6">
                {i + 1}
              </div>
            ))}
          </div>
          <div className="flex-1 p-4 bg-gray-900 text-gray-100">
            <pre className="text-sm">
              <code>
                {codeLines.map((line, i) => (
                  <div key={i} className="leading-6">
                    {line || '\n'}
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
```

### 6. Image Gallery

```tsx
function ImageGalleryExample() {
  const images = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    src: `https://picsum.photos/300/200?random=${i}`,
    title: `Image ${i + 1}`,
  }));

  return (
    <ScrollArea className="h-[600px] w-full rounded-md border">
      <div className="p-4 grid grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id} className="group relative overflow-hidden rounded-lg">
            <img
              src={image.src}
              alt={image.title}
              className="w-full h-48 object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                {image.title}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
```

### 7. Sidebar Navigation

```tsx
function SidebarNavigationExample() {
  const menuItems = [
    { category: 'Dashboard', items: ['Overview', 'Analytics', 'Reports'] },
    { category: 'Products', items: ['All Products', 'Categories', 'Inventory', 'Pricing'] },
    { category: 'Customers', items: ['All Customers', 'Segments', 'Reviews', 'Support'] },
    { category: 'Orders', items: ['All Orders', 'Pending', 'Completed', 'Cancelled'] },
    { category: 'Marketing', items: ['Campaigns', 'Email', 'Social Media', 'SEO'] },
    { category: 'Settings', items: ['General', 'Security', 'Billing', 'Team', 'API'] },
  ];

  return (
    <div className="w-64 h-[600px] border rounded-lg">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-6">
          {menuItems.map((section) => (
            <div key={section.category}>
              <h3 className="mb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.category}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item}
                    className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
```

### 8. Terminal Output

```tsx
function TerminalOutputExample() {
  const [output, setOutput] = useState([
    '$ npm install @dainabase/ui',
    'added 156 packages in 3.241s',
    '',
    '$ npm run build',
    '> dainabase-ui@1.0.0 build',
    '> vite build',
    '',
    'vite v4.3.9 building for production...',
    '✓ 1247 modules transformed.',
    'dist/index.html                   0.45 kB',
    'dist/assets/index-d1f2c3b4.css   32.18 kB │ gzip: 8.71 kB',
    'dist/assets/index-a2b3c4d5.js   142.65 kB │ gzip: 45.82 kB',
    '✓ built in 2.14s',
    '',
    '$ npm test',
    'PASS  src/components/Button.test.tsx',
    'PASS  src/components/Input.test.tsx',
    'PASS  src/components/ScrollArea.test.tsx',
    '',
    'Test Suites: 58 passed, 58 total',
    'Tests:       342 passed, 342 total',
    'Time:        8.421s',
  ]);

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="bg-gray-800 px-4 py-2 flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="ml-4 text-xs text-gray-400">terminal</span>
      </div>
      <ScrollArea className="h-96">
        <div className="p-4 font-mono text-sm">
          {output.map((line, i) => (
            <div key={i} className="text-green-400 leading-relaxed">
              {line || '\u00A0'}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
```

### 9. Data Table with Fixed Header

```tsx
function DataTableExample() {
  const data = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: ['Admin', 'Editor', 'Viewer'][i % 3],
    status: ['Active', 'Inactive', 'Pending'][i % 3],
    lastLogin: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
  }));

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-4">ID</th>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Role</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Last Login</th>
            </tr>
          </thead>
        </table>
      </div>
      <ScrollArea className="h-96">
        <table className="w-full">
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{row.id}</td>
                <td className="p-4">{row.name}</td>
                <td className="p-4">{row.email}</td>
                <td className="p-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {row.role}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      row.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : row.status === 'Inactive'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="p-4">{row.lastLogin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}
```

### 10. Nested ScrollAreas

```tsx
function NestedScrollAreasExample() {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-4">Main Container</h3>
      <ScrollArea className="h-96 border rounded">
        <div className="p-4 space-y-4">
          <div>
            <h4 className="font-medium mb-2">Section 1 - Simple Content</h4>
            <p className="text-gray-600">
              This is a simple paragraph in the main scroll area.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Section 2 - Nested Scroll</h4>
            <ScrollArea className="h-48 border rounded bg-gray-50">
              <div className="p-4 space-y-2">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="p-2 bg-white rounded shadow-sm">
                    Nested item {i + 1}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Section 3 - Multiple Nested</h4>
            <div className="grid grid-cols-2 gap-4">
              <ScrollArea className="h-32 border rounded">
                <div className="p-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="py-1">Left nested {i + 1}</div>
                  ))}
                </div>
              </ScrollArea>
              <ScrollArea className="h-32 border rounded">
                <div className="p-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="py-1">Right nested {i + 1}</div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Section 4 - More Content</h4>
            {Array.from({ length: 15 }).map((_, i) => (
              <p key={i} className="text-gray-600 mb-2">
                Additional content paragraph {i + 1} to demonstrate main scroll area.
              </p>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
```

## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes for styling |
| `style` | `CSSProperties` | `undefined` | Inline styles for the scroll area |
| `type` | `'auto' \| 'always' \| 'scroll' \| 'hover'` | `'hover'` | Scrollbar visibility behavior |
| `scrollHideDelay` | `number` | `600` | Delay in ms before hiding scrollbar |
| `forceMount` | `boolean` | `false` | Force mount the scrollbar |
| `orientation` | `'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | Scroll direction |
| `dir` | `'ltr' \| 'rtl'` | `'ltr'` | Text direction |
| `scrollbarSize` | `number` | `10` | Width of the scrollbar in pixels |
| `scrollbarColor` | `string` | `undefined` | Custom scrollbar color |
| `thumbColor` | `string` | `undefined` | Custom thumb color |
| `trackColor` | `string` | `undefined` | Custom track color |
| `cornerColor` | `string` | `undefined` | Custom corner color |
| `smooth` | `boolean` | `true` | Enable smooth scrolling |
| `momentum` | `boolean` | `true` | Enable momentum scrolling on touch devices |
| `onScroll` | `(event: ScrollEvent) => void` | `undefined` | Scroll event handler |
| `onScrollStart` | `() => void` | `undefined` | Scroll start event handler |
| `onScrollEnd` | `() => void` | `undefined` | Scroll end event handler |
| `onViewportChange` | `(viewport: ViewportData) => void` | `undefined` | Viewport change handler |
| `children` | `ReactNode` | `undefined` | Content to be scrolled |
| `asChild` | `boolean` | `false` | Render as child component |
| `viewportRef` | `React.Ref<HTMLDivElement>` | `undefined` | Ref to viewport element |
| `scrollbarRef` | `React.Ref<HTMLDivElement>` | `undefined` | Ref to scrollbar element |

### ScrollEvent Type

```typescript
interface ScrollEvent {
  scrollTop: number;
  scrollLeft: number;
  scrollHeight: number;
  scrollWidth: number;
  clientHeight: number;
  clientWidth: number;
  scrollPercentageY: number;
  scrollPercentageX: number;
}
```

### ViewportData Type

```typescript
interface ViewportData {
  width: number;
  height: number;
  scrollableHeight: number;
  scrollableWidth: number;
  hasVerticalScroll: boolean;
  hasHorizontalScroll: boolean;
}
```

## Accessibility

The ScrollArea component follows WCAG 2.1 Level AA guidelines:

- **Keyboard Navigation**: Full support for arrow keys, Page Up/Down, Home/End
- **Screen Reader Support**: Proper ARIA attributes and live regions
- **Focus Management**: Clear focus indicators and logical tab order
- **High Contrast Mode**: Automatic adaptation to high contrast themes
- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **Touch Support**: Enhanced touch scrolling for mobile devices
- **ARIA Attributes**:
  - `role="region"` for scroll areas
  - `aria-label` for describing scroll area purpose
  - `aria-orientation` for scroll direction
  - `aria-controls` for scrollbar controls
  - `tabindex="0"` for keyboard focus

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑` / `↓` | Scroll vertically |
| `←` / `→` | Scroll horizontally |
| `Page Up` / `Page Down` | Scroll by page |
| `Home` / `End` | Scroll to start/end |
| `Space` | Scroll down by page |
| `Shift + Space` | Scroll up by page |

## Best Practices

### Do's ✅

- Set explicit height for vertical scrolling
- Set explicit width for horizontal scrolling
- Use `type="always"` for critical content that must be scrollable
- Provide clear visual boundaries for scroll areas
- Test with keyboard navigation
- Consider mobile touch scrolling experience
- Use smooth scrolling for better UX
- Add padding to content to prevent edge clipping
- Use nested ScrollAreas sparingly and with clear boundaries
- Monitor performance with large datasets

### Don'ts ❌

- Don't nest more than 2 levels of ScrollAreas
- Don't use ScrollArea for content that fits within viewport
- Don't override native scrollbar on form inputs
- Don't hide critical actions inside scroll areas
- Don't use horizontal scrolling for primary navigation
- Don't disable momentum scrolling on touch devices
- Don't use very thin scrollbars (< 8px)
- Don't scroll multiple areas simultaneously
- Don't forget to test with screen readers
- Don't use ScrollArea inside modals without proper focus management

## Use Cases

1. **Data Tables** - Large datasets with fixed headers
2. **Chat Interfaces** - Message history with auto-scroll
3. **Code Editors** - Syntax highlighted code with line numbers
4. **Image Galleries** - Grid layouts with many images
5. **Sidebars** - Navigation menus with many items
6. **Terminal/Console** - Command output and logs
7. **Comments Section** - User comments and discussions
8. **File Explorers** - Directory trees and file lists
9. **Product Listings** - E-commerce product grids
10. **Dashboard Widgets** - Scrollable dashboard cards

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Scrollbar not showing | Check height/width is set and content overflows |
| Jumpy scrolling | Enable `smooth` prop |
| Double scrollbars | Check for conflicting CSS overflow properties |
| Performance issues | Use virtualization for large lists |
| Touch scrolling broken | Ensure `momentum` prop is enabled |
| Keyboard navigation not working | Check `tabindex` and focus management |

## Related Components

- [**Table**](./table) - For structured data display with scrolling
- [**Sheet**](./sheet) - Side panels with scroll areas
- [**Dialog**](./dialog) - Modal dialogs with scrollable content
- [**Select**](./select) - Dropdown menus with scroll
- [**DataGrid**](./data-grid) - Advanced data tables with virtual scrolling
- [**Textarea**](./textarea) - Multi-line text input with scrolling
- [**Resizable**](./resizable) - Resizable panels with scroll areas
