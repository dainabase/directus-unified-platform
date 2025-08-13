---
id: icon
title: Icon Component
sidebar_position: 54
---

import { Icon } from '@dainabase/ui';

# Icon

A comprehensive icon system with support for multiple icon libraries, dynamic imports, and customizable styling. The Icon component provides a unified interface for rendering SVG icons from various sources.

## Preview

```jsx live
function IconDemo() {
  return (
    <div className="flex items-center gap-4">
      <Icon name="home" size={24} />
      <Icon name="settings" size={24} color="blue" />
      <Icon name="user" size={24} className="text-green-500" />
      <Icon name="heart" size={24} filled />
      <Icon name="star" size={24} animated />
    </div>
  );
}
```

## Features

- 🎨 **Multiple Icon Libraries** - Support for Lucide, Heroicons, Feather, and custom icons
- 📦 **Dynamic Imports** - Icons are loaded on-demand for optimal bundle size
- 🎯 **TypeScript Support** - Full type safety with icon name autocomplete
- 🌈 **Customizable Styling** - Size, color, and className props for easy customization
- ♿ **Accessible** - Proper ARIA labels and roles for screen readers
- 🎭 **Animation Support** - Built-in animations for common interactions
- 🔄 **Rotation & Flip** - Transform icons with rotation and flip props
- 📱 **Responsive** - Scale icons based on viewport size
- 🎪 **Icon Sets** - Organize icons into semantic groups
- 🔍 **Search & Discovery** - Built-in icon browser and search functionality

## Installation

```bash
npm install @dainabase/ui lucide-react
```

## Basic Usage

```jsx
import { Icon } from '@dainabase/ui';

function MyComponent() {
  return (
    <div>
      <Icon name="home" />
      <Icon name="settings" size={32} />
      <Icon name="user" color="#3B82F6" />
    </div>
  );
}
```

## Examples

### 1. Different Sizes

```jsx live
function SizeExample() {
  const sizes = [16, 20, 24, 32, 48, 64];
  
  return (
    <div className="flex items-end gap-4">
      {sizes.map(size => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Icon name="box" size={size} />
          <span className="text-xs text-gray-500">{size}px</span>
        </div>
      ))}
    </div>
  );
}
```

### 2. Color Variations

```jsx live
function ColorExample() {
  const colors = [
    { name: 'Default', value: undefined },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Orange', value: '#F97316' }
  ];
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {colors.map(({ name, value }) => (
        <div key={name} className="flex items-center gap-2">
          <Icon name="heart" size={24} color={value} />
          <span className="text-sm">{name}</span>
        </div>
      ))}
    </div>
  );
}
```

### 3. Animated Icons

```jsx live
function AnimatedExample() {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  
  return (
    <div className="flex gap-6">
      <button
        onClick={() => setLiked(!liked)}
        className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
      >
        <Icon 
          name="heart" 
          size={24} 
          filled={liked}
          animated
          color={liked ? '#EF4444' : undefined}
        />
        <span>{liked ? 'Liked' : 'Like'}</span>
      </button>
      
      <button
        onClick={() => setLoading(!loading)}
        className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
      >
        <Icon 
          name="loader" 
          size={24} 
          animated={loading}
          className={loading ? 'animate-spin' : ''}
        />
        <span>{loading ? 'Loading...' : 'Load'}</span>
      </button>
    </div>
  );
}
```

### 4. Icon with Badge

```jsx live
function BadgeExample() {
  const [count, setCount] = useState(3);
  
  return (
    <div className="flex gap-4">
      <div className="relative">
        <Icon name="bell" size={24} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {count}
          </span>
        )}
      </div>
      
      <div className="relative">
        <Icon name="inbox" size={24} />
        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full px-1.5">
          New
        </span>
      </div>
      
      <button 
        onClick={() => setCount(Math.max(0, count - 1))}
        className="text-sm px-2 py-1 bg-gray-100 rounded"
      >
        Clear notification
      </button>
    </div>
  );
}
```

### 5. Rotated & Flipped Icons

```jsx live
function TransformExample() {
  const rotations = [0, 45, 90, 135, 180, 270];
  
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {rotations.map(rotation => (
          <div key={rotation} className="flex flex-col items-center gap-2">
            <Icon name="arrow-up" size={24} rotation={rotation} />
            <span className="text-xs text-gray-500">{rotation}°</span>
          </div>
        ))}
      </div>
      
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <Icon name="play" size={24} />
          <span className="text-sm">Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="play" size={24} flipHorizontal />
          <span className="text-sm">Flip H</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="play" size={24} flipVertical />
          <span className="text-sm">Flip V</span>
        </div>
      </div>
    </div>
  );
}
```

### 6. Icon Button Group

```jsx live
function ButtonGroupExample() {
  const [selected, setSelected] = useState('grid');
  
  const views = [
    { id: 'grid', icon: 'layout-grid' },
    { id: 'list', icon: 'list' },
    { id: 'cards', icon: 'credit-card' }
  ];
  
  return (
    <div className="inline-flex rounded-lg border border-gray-200 divide-x divide-gray-200">
      {views.map(({ id, icon }) => (
        <button
          key={id}
          onClick={() => setSelected(id)}
          className={`px-3 py-2 ${
            selected === id 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } ${id === 'grid' ? 'rounded-l-lg' : ''} ${
            id === 'cards' ? 'rounded-r-lg' : ''
          }`}
        >
          <Icon name={icon} size={20} />
        </button>
      ))}
    </div>
  );
}
```

### 7. Status Icons

```jsx live
function StatusExample() {
  const statuses = [
    { type: 'success', icon: 'check-circle', color: '#10B981' },
    { type: 'warning', icon: 'alert-triangle', color: '#F59E0B' },
    { type: 'error', icon: 'x-circle', color: '#EF4444' },
    { type: 'info', icon: 'info', color: '#3B82F6' }
  ];
  
  return (
    <div className="space-y-3">
      {statuses.map(({ type, icon, color }) => (
        <div key={type} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Icon name={icon} size={20} color={color} />
          <div>
            <div className="font-medium capitalize">{type} Status</div>
            <div className="text-sm text-gray-600">
              This is a {type} message with an icon
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 8. Loading States

```jsx live
function LoadingStatesExample() {
  const [loadingStates, setLoadingStates] = useState({
    save: false,
    sync: false,
    download: false
  });
  
  const handleAction = (action) => {
    setLoadingStates(prev => ({ ...prev, [action]: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [action]: false }));
    }, 2000);
  };
  
  return (
    <div className="flex gap-3">
      <button
        onClick={() => handleAction('save')}
        disabled={loadingStates.save}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        <Icon 
          name={loadingStates.save ? 'loader-2' : 'save'} 
          size={18}
          className={loadingStates.save ? 'animate-spin' : ''}
        />
        {loadingStates.save ? 'Saving...' : 'Save'}
      </button>
      
      <button
        onClick={() => handleAction('sync')}
        disabled={loadingStates.sync}
        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
      >
        <Icon 
          name={loadingStates.sync ? 'refresh-cw' : 'refresh-cw'} 
          size={18}
          className={loadingStates.sync ? 'animate-spin' : ''}
        />
        {loadingStates.sync ? 'Syncing...' : 'Sync'}
      </button>
      
      <button
        onClick={() => handleAction('download')}
        disabled={loadingStates.download}
        className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
      >
        <Icon 
          name={loadingStates.download ? 'loader' : 'download'} 
          size={18}
          className={loadingStates.download ? 'animate-spin' : ''}
        />
        {loadingStates.download ? 'Downloading...' : 'Download'}
      </button>
    </div>
  );
}
```

### 9. Social Media Icons

```jsx live
function SocialExample() {
  const socials = [
    { name: 'facebook', icon: 'facebook', color: '#1877F2' },
    { name: 'twitter', icon: 'twitter', color: '#1DA1F2' },
    { name: 'instagram', icon: 'instagram', color: '#E4405F' },
    { name: 'linkedin', icon: 'linkedin', color: '#0A66C2' },
    { name: 'github', icon: 'github', color: '#181717' },
    { name: 'youtube', icon: 'youtube', color: '#FF0000' }
  ];
  
  return (
    <div className="flex gap-3">
      {socials.map(({ name, icon, color }) => (
        <a
          key={name}
          href={`https://${name}.com`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label={`Visit ${name}`}
        >
          <Icon name={icon} size={24} color={color} />
        </a>
      ))}
    </div>
  );
}
```

### 10. Icon Search Browser

```jsx live
function IconBrowserExample() {
  const [search, setSearch] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(null);
  
  const commonIcons = [
    'home', 'settings', 'user', 'search', 'heart', 'star',
    'mail', 'phone', 'calendar', 'clock', 'map-pin', 'bookmark',
    'camera', 'image', 'video', 'music', 'mic', 'headphones',
    'wifi', 'bluetooth', 'battery', 'bell', 'lock', 'unlock',
    'eye', 'eye-off', 'edit', 'trash', 'download', 'upload',
    'share', 'copy', 'paste', 'save', 'folder', 'file'
  ];
  
  const filteredIcons = commonIcons.filter(icon =>
    icon.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Icon 
          name="search" 
          size={20} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search icons..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-lg">
        {filteredIcons.map(icon => (
          <button
            key={icon}
            onClick={() => setSelectedIcon(icon)}
            className={`p-3 rounded-lg hover:bg-gray-100 flex flex-col items-center gap-2 ${
              selectedIcon === icon ? 'bg-blue-100 ring-2 ring-blue-500' : ''
            }`}
          >
            <Icon name={icon} size={20} />
            <span className="text-xs text-gray-600">{icon}</span>
          </button>
        ))}
      </div>
      
      {selectedIcon && (
        <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name={selectedIcon} size={32} />
            <div>
              <div className="font-medium">Selected: {selectedIcon}</div>
              <code className="text-xs text-gray-600">
                {`<Icon name="${selectedIcon}" />`}
              </code>
            </div>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(`<Icon name="${selectedIcon}" />`)}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Copy Code
          </button>
        </div>
      )}
    </div>
  );
}
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | **required** | Icon name from the icon library |
| `size` | `number \| string` | `24` | Size of the icon in pixels |
| `color` | `string` | `currentColor` | Color of the icon |
| `className` | `string` | `undefined` | Additional CSS classes |
| `filled` | `boolean` | `false` | Use filled variant of the icon |
| `strokeWidth` | `number` | `2` | Stroke width for the icon |
| `rotation` | `number` | `0` | Rotation angle in degrees |
| `flipHorizontal` | `boolean` | `false` | Flip icon horizontally |
| `flipVertical` | `boolean` | `false` | Flip icon vertically |
| `animated` | `boolean` | `false` | Enable default animation |
| `library` | `'lucide' \| 'heroicons' \| 'feather'` | `'lucide'` | Icon library to use |
| `ariaLabel` | `string` | `undefined` | Accessibility label |
| `ariaHidden` | `boolean` | `false` | Hide from screen readers |
| `onClick` | `function` | `undefined` | Click handler |
| `onHover` | `function` | `undefined` | Hover handler |

### Icon Libraries

The component supports multiple icon libraries:

- **Lucide** (default) - 1000+ icons
- **Heroicons** - 300+ icons  
- **Feather** - 280+ icons
- **Custom** - Add your own SVG icons

### Custom Icons

You can add custom icons by registering them:

```jsx
import { Icon, registerIcon } from '@dainabase/ui';

// Register a custom icon
registerIcon('my-custom-icon', {
  viewBox: '0 0 24 24',
  path: 'M12 2L2 7v10c0 5.55 3.84 10.74 9 12...'
});

// Use the custom icon
<Icon name="my-custom-icon" size={24} />
```

## Accessibility

The Icon component follows WAI-ARIA guidelines:

- **Decorative Icons**: Use `aria-hidden="true"` for purely decorative icons
- **Functional Icons**: Provide `aria-label` for icons that convey meaning
- **Button Icons**: When used in buttons, ensure the button has accessible text
- **Status Icons**: Use appropriate ARIA roles for status indicators
- **Loading Icons**: Include `aria-live` regions for loading states

### Keyboard Support

When icons are interactive:

| Key | Description |
|-----|-------------|
| `Enter` | Triggers onClick handler |
| `Space` | Triggers onClick handler (when focusable) |

## Best Practices

### ✅ Do's

- Use semantic icon names that describe their purpose
- Provide aria-labels for functional icons
- Use consistent icon sizes across your application
- Leverage the color prop for theming consistency
- Use filled variants for selected/active states
- Cache frequently used icons for performance
- Use icon sets to organize related icons
- Test icon visibility at different sizes

### ❌ Don'ts

- Don't use icons as the only way to convey information
- Don't make icons too small (minimum 16px for interactive)
- Don't mix icon libraries unnecessarily
- Don't use color alone to convey meaning
- Don't forget hover/focus states for interactive icons
- Don't hardcode colors if you have a theme system
- Don't use decorative icons in place of functional ones

## Use Cases

1. **Navigation Menus** - Clear iconography for menu items
2. **Action Buttons** - Visual cues for user actions
3. **Status Indicators** - Communicate state and progress
4. **Form Fields** - Input prefixes and validation states
5. **Empty States** - Large illustrative icons
6. **Loading States** - Animated spinners and progress
7. **Social Links** - Brand icons for social platforms
8. **File Types** - Visual representation of documents
9. **Notifications** - Alert and message type indicators
10. **Toolbar Actions** - Compact icon-only buttons

## Performance Considerations

- Icons are loaded on-demand to minimize bundle size
- SVG icons are cached after first use
- Use sprite sheets for large icon sets
- Consider using icon fonts for very large applications
- Implement virtual scrolling for icon browsers

## Related Components

- [Button](./button) - Icon buttons
- [Badge](./badge) - Icons with badges
- [Tooltip](./tooltip) - Icon tooltips
- [Navigation Menu](./navigation-menu) - Icons in navigation
- [Alert](./alert) - Status icons in alerts
