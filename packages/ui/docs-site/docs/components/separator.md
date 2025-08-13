---
id: separator
title: Separator
sidebar_position: 47
---

import { Separator } from '@dainabase/ui';

# Separator Component

A versatile visual divider component for creating clear visual boundaries between content sections with support for horizontal and vertical orientations, decorative styles, and theme integration.

## Preview

```tsx live
function SeparatorDemo() {
  return (
    <div>
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
        <p className="text-sm text-muted-foreground">
          An open-source UI component library.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  );
}
```

## Features

- 📐 **Dual Orientation** - Horizontal and vertical separator support
- 🎨 **Decorative Options** - Semantic or decorative separator roles
- 🎭 **Multiple Styles** - Solid, dashed, dotted, gradient styles
- 🌈 **Theme Integration** - Automatic theme color adaptation
- 📱 **Responsive Design** - Adapts to container dimensions
- ♿ **Accessibility** - Proper ARIA roles and semantics
- 🎯 **Flexible Sizing** - Customizable thickness and length
- 🚀 **Performance** - Lightweight with minimal DOM footprint
- 🔧 **CSS Variables** - Easy customization via CSS properties
- 🎪 **Animation Support** - Optional reveal animations

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```tsx
import { Separator } from '@dainabase/ui';

function App() {
  return (
    <div>
      <div>Content above</div>
      <Separator />
      <div>Content below</div>
    </div>
  );
}
```

## Examples

### 1. Text Content Separator

```tsx
function TextContentExample() {
  return (
    <article className="max-w-2xl mx-auto p-6">
      <header>
        <h1 className="text-3xl font-bold">Getting Started with React</h1>
        <p className="text-gray-600 mt-2">A comprehensive guide for beginners</p>
      </header>
      
      <Separator className="my-6" />
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Introduction</h2>
        <p className="text-gray-700 leading-relaxed">
          React is a JavaScript library for building user interfaces. It was developed 
          by Facebook and has become one of the most popular front-end frameworks.
        </p>
        
        <Separator className="my-4" decorative />
        
        <h3 className="text-xl font-semibold">Key Concepts</h3>
        <p className="text-gray-700 leading-relaxed">
          Understanding components, props, and state is essential for mastering React.
          Let's explore each concept in detail.
        </p>
      </section>
      
      <Separator className="my-6" />
      
      <footer className="text-sm text-gray-500">
        <p>Published on January 15, 2025</p>
        <p>By John Doe</p>
      </footer>
    </article>
  );
}
```

### 2. Navigation Bar with Separators

```tsx
function NavigationBarExample() {
  return (
    <nav className="border-b">
      <div className="container mx-auto">
        <div className="flex items-center h-16">
          <div className="font-bold text-xl">Logo</div>
          
          <Separator orientation="vertical" className="mx-6 h-8" />
          
          <div className="flex items-center space-x-1">
            <a href="#" className="px-3 py-2 rounded hover:bg-gray-100">Home</a>
            <a href="#" className="px-3 py-2 rounded hover:bg-gray-100">Products</a>
            <a href="#" className="px-3 py-2 rounded hover:bg-gray-100">Services</a>
            <a href="#" className="px-3 py-2 rounded hover:bg-gray-100">About</a>
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900">
              Search
            </button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <button className="text-gray-600 hover:text-gray-900">
              Cart (0)
            </button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

### 3. Card with Section Dividers

```tsx
function CardSectionsExample() {
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              JD
            </div>
            <div>
              <h3 className="font-semibold">John Doe</h3>
              <p className="text-sm text-gray-500">Software Engineer</p>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="p-6 space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Email</span>
            <span className="font-medium">john.doe@example.com</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone</span>
            <span className="font-medium">+1 (555) 123-4567</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Location</span>
            <span className="font-medium">San Francisco, CA</span>
          </div>
        </div>
        
        <Separator />
        
        <div className="p-6">
          <h4 className="font-semibold mb-3">Skills</h4>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">React</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">TypeScript</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Node.js</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">GraphQL</span>
          </div>
        </div>
        
        <Separator />
        
        <div className="p-6 flex space-x-4">
          <button className="flex-1 py-2 border rounded hover:bg-gray-50">
            Message
          </button>
          <button className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 4. Form Field Groups

```tsx
function FormFieldGroupsExample() {
  return (
    <form className="max-w-lg mx-auto space-y-6 p-6 bg-white rounded-lg shadow">
      <div>
        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input type="text" className="w-full px-3 py-2 border rounded" placeholder="johndoe" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full px-3 py-2 border rounded" placeholder="john@example.com" />
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input type="text" className="w-full px-3 py-2 border rounded" placeholder="John" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input type="text" className="w-full px-3 py-2 border rounded" placeholder="Doe" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea className="w-full px-3 py-2 border rounded" rows={3} placeholder="Tell us about yourself..." />
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Preferences</h3>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm">Receive email notifications</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm">Make profile public</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm">Allow messages from anyone</span>
          </label>
        </div>
      </div>
      
      <Separator />
      
      <div className="flex justify-end space-x-3">
        <button type="button" className="px-4 py-2 border rounded hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Save Changes
        </button>
      </div>
    </form>
  );
}
```

### 5. Timeline with Separators

```tsx
function TimelineExample() {
  const events = [
    { date: '2025-01-15', title: 'Project Kickoff', description: 'Initial planning meeting' },
    { date: '2025-01-22', title: 'Design Phase', description: 'UI/UX design completed' },
    { date: '2025-02-01', title: 'Development Start', description: 'Begin implementation' },
    { date: '2025-02-15', title: 'Beta Release', description: 'Internal testing begins' },
    { date: '2025-03-01', title: 'Launch', description: 'Public release' },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Project Timeline</h2>
      
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
        
        {events.map((event, index) => (
          <div key={index}>
            <div className="flex items-start mb-8">
              <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-white">
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
              </div>
              <div className="ml-4 flex-1">
                <time className="text-sm text-gray-500">{event.date}</time>
                <h3 className="text-lg font-semibold mt-1">{event.title}</h3>
                <p className="text-gray-600 mt-1">{event.description}</p>
              </div>
            </div>
            {index < events.length - 1 && (
              <Separator className="ml-16 mb-8" decorative />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6. Pricing Table Dividers

```tsx
function PricingTableExample() {
  const plans = [
    {
      name: 'Basic',
      price: '$9',
      features: ['10 Projects', '2 GB Storage', 'Email Support']
    },
    {
      name: 'Pro',
      price: '$29',
      features: ['Unlimited Projects', '100 GB Storage', 'Priority Support', 'Advanced Analytics']
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: ['Everything in Pro', 'Unlimited Storage', 'Dedicated Support', 'Custom Integration', 'SLA']
    }
  ];

  return (
    <div className="flex space-x-0 max-w-4xl mx-auto">
      {plans.map((plan, index) => (
        <React.Fragment key={plan.name}>
          <div className="flex-1 p-6 text-center">
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <div className="mt-4">
              <span className="text-4xl font-bold">{plan.price}</span>
              {plan.price !== 'Custom' && <span className="text-gray-500">/month</span>}
            </div>
            
            <Separator className="my-6" />
            
            <ul className="space-y-3 text-left">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            
            <button className="w-full mt-6 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
              Choose {plan.name}
            </button>
          </div>
          {index < plans.length - 1 && (
            <Separator orientation="vertical" className="h-auto" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
```

### 7. Footer with Multiple Separators

```tsx
function FooterExample() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto py-12 px-6">
        <div className="grid grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-white">Press</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Products</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Features</a></li>
              <li><a href="#" className="hover:text-white">Pricing</a></li>
              <li><a href="#" className="hover:text-white">Security</a></li>
              <li><a href="#" className="hover:text-white">Enterprise</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Documentation</a></li>
              <li><a href="#" className="hover:text-white">Guides</a></li>
              <li><a href="#" className="hover:text-white">API Reference</a></li>
              <li><a href="#" className="hover:text-white">Community</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Privacy</a></li>
              <li><a href="#" className="hover:text-white">Terms</a></li>
              <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-white">Licenses</a></li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-8 bg-gray-800" />
        
        <div className="flex items-center justify-between">
          <p className="text-gray-400">© 2025 DainaBase. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
            <Separator orientation="vertical" className="h-4 bg-gray-700" />
            <a href="#" className="text-gray-400 hover:text-white">GitHub</a>
            <Separator orientation="vertical" className="h-4 bg-gray-700" />
            <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

### 8. Dashboard Widget Separators

```tsx
function DashboardWidgetExample() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Sales Overview</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold">$12.5k</p>
          <p className="text-sm text-gray-500 mt-1">Today</p>
        </div>
        <Separator orientation="vertical" className="h-auto" />
        <div>
          <p className="text-2xl font-bold">$87.2k</p>
          <p className="text-sm text-gray-500 mt-1">This Week</p>
        </div>
        <Separator orientation="vertical" className="h-auto" />
        <div>
          <p className="text-2xl font-bold">$421k</p>
          <p className="text-sm text-gray-500 mt-1">This Month</p>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">vs Last Period</span>
        <span className="text-green-600 font-medium">+12.5% ↑</span>
      </div>
    </div>
  );
}
```

### 9. Code Block with Line Separators

```tsx
function CodeBlockExample() {
  const codeLines = [
    { type: 'comment', content: '// User authentication function' },
    { type: 'code', content: 'async function authenticate(email, password) {' },
    { type: 'code', content: '  try {' },
    { type: 'code', content: '    const user = await findUserByEmail(email);' },
    { type: 'separator', content: '' },
    { type: 'comment', content: '    // Verify password' },
    { type: 'code', content: '    const isValid = await bcrypt.compare(password, user.hash);' },
    { type: 'code', content: '    if (!isValid) throw new Error("Invalid credentials");' },
    { type: 'separator', content: '' },
    { type: 'comment', content: '    // Generate token' },
    { type: 'code', content: '    const token = generateJWT(user.id);' },
    { type: 'code', content: '    return { user, token };' },
    { type: 'code', content: '  } catch (error) {' },
    { type: 'code', content: '    console.error("Auth failed:", error);' },
    { type: 'code', content: '    throw error;' },
    { type: 'code', content: '  }' },
    { type: 'code', content: '}' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
          <span className="text-gray-400 text-sm">auth.js</span>
          <button className="text-gray-400 hover:text-white text-sm">Copy</button>
        </div>
        <div className="p-4 font-mono text-sm">
          {codeLines.map((line, index) => (
            <React.Fragment key={index}>
              {line.type === 'separator' ? (
                <Separator className="my-2 bg-gray-700" decorative />
              ) : (
                <div className={`${
                  line.type === 'comment' ? 'text-green-400' : 'text-gray-300'
                }`}>
                  {line.content || '\u00A0'}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 10. Menu with Icon Separators

```tsx
function MenuWithIconsExample() {
  const menuSections = [
    {
      items: [
        { icon: '🏠', label: 'Dashboard', badge: null },
        { icon: '📊', label: 'Analytics', badge: 'New' },
        { icon: '📈', label: 'Reports', badge: '3' },
      ]
    },
    {
      items: [
        { icon: '👥', label: 'Team', badge: null },
        { icon: '📋', label: 'Projects', badge: '12' },
        { icon: '📅', label: 'Calendar', badge: null },
      ]
    },
    {
      items: [
        { icon: '⚙️', label: 'Settings', badge: null },
        { icon: '❓', label: 'Help & Support', badge: null },
        { icon: '🚪', label: 'Sign Out', badge: null },
      ]
    }
  ];

  return (
    <div className="w-64 bg-white rounded-lg shadow-lg p-2">
      {menuSections.map((section, sectionIndex) => (
        <React.Fragment key={sectionIndex}>
          {section.items.map((item, itemIndex) => (
            <button
              key={itemIndex}
              className="w-full flex items-center justify-between px-3 py-2 text-left rounded hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  item.badge === 'New' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          {sectionIndex < menuSections.length - 1 && (
            <Separator className="my-2" decorative />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
```

## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | The orientation of the separator |
| `decorative` | `boolean` | `false` | Whether the separator is purely decorative |
| `className` | `string` | `undefined` | Additional CSS classes |
| `style` | `CSSProperties` | `undefined` | Inline styles |
| `asChild` | `boolean` | `false` | Render as child component |

### CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--separator-color` | `border` | Color of the separator |
| `--separator-width` | `1px` | Thickness of horizontal separator |
| `--separator-height` | `1px` | Thickness of vertical separator |
| `--separator-margin` | `0` | Margin around separator |
| `--separator-opacity` | `1` | Opacity of the separator |

## Accessibility

The Separator component follows WCAG 2.1 Level AA guidelines:

- **Semantic HTML**: Uses `<hr>` element for semantic separation
- **ARIA Roles**:
  - `role="separator"` for semantic separators
  - `role="none"` or `role="presentation"` for decorative separators
- **ARIA Orientation**: `aria-orientation` attribute for vertical separators
- **Screen Reader Support**: Properly announced or hidden based on decorative prop
- **Color Contrast**: Ensures sufficient contrast with background
- **Focus Management**: Not focusable as it's non-interactive

### Screen Reader Behavior

| Type | Announcement |
|------|--------------|
| Semantic Horizontal | "Separator" |
| Semantic Vertical | "Vertical separator" |
| Decorative | Silent (ignored) |

## Best Practices

### Do's ✅

- Use semantic separators between distinct content sections
- Use decorative separators for visual enhancement only
- Maintain consistent separator styles throughout the app
- Use appropriate margins for visual breathing room
- Consider using CSS borders for simple dividers
- Test separator visibility in both light and dark themes
- Use vertical separators in horizontal layouts
- Keep separator colors subtle and unobtrusive
- Use separators to improve content hierarchy
- Consider responsive behavior for separators

### Don'ts ❌

- Don't use separators as the only way to distinguish content
- Don't make separators too thick or prominent
- Don't use multiple separators in close proximity
- Don't rely on color alone for separation
- Don't use separators in place of proper spacing
- Don't make decorative separators semantic
- Don't forget to test with screen readers
- Don't use separators within inline text
- Don't animate separators unnecessarily
- Don't use gradients unless intentional

## Use Cases

1. **Content Sections** - Divide articles, blog posts, documentation
2. **Navigation Menus** - Separate menu groups or items
3. **Forms** - Group related form fields
4. **Cards** - Divide card sections
5. **Lists** - Separate list items or groups
6. **Headers/Footers** - Create visual boundaries
7. **Sidebars** - Separate sidebar sections
8. **Tables** - Alternative to borders
9. **Toolbars** - Separate tool groups
10. **Dialogs** - Separate dialog header, body, footer

## Styling Examples

```css
/* Custom separator styles */
.custom-separator {
  --separator-color: linear-gradient(90deg, transparent, #000, transparent);
  --separator-height: 2px;
}

/* Dashed separator */
.dashed-separator {
  border-style: dashed;
}

/* Dotted separator */
.dotted-separator {
  border-style: dotted;
}

/* Gradient separator */
.gradient-separator {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  height: 2px;
  border: none;
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Separator not visible | Check color contrast and opacity |
| Wrong orientation | Verify `orientation` prop value |
| Too much/little spacing | Adjust margins via className |
| Not announced by screen reader | Check `decorative` prop setting |
| Inconsistent styling | Use CSS variables for consistency |
| Overlapping content | Check z-index and positioning |

## Related Components

- [**Divider**](./divider) - Material-UI style divider
- [**Border**](./border) - Border utilities
- [**Spacer**](./spacer) - Spacing component
- [**Layout**](./layout) - Layout components
- [**Grid**](./grid) - Grid system with gaps
