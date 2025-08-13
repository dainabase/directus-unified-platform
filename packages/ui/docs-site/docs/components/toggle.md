---
id: toggle
title: Toggle
sidebar_position: 52
---

import { Toggle } from '@dainabase/ui';

# Toggle Component

A versatile toggle button component that provides pressed/unpressed states with customizable styling, perfect for toolbars, settings, and interactive controls.

## Preview

```tsx live
function ToggleDemo() {
  const [pressed, setPressed] = useState(false);
  
  return (
    <Toggle 
      pressed={pressed} 
      onPressedChange={setPressed}
      aria-label="Toggle italic"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 4h-9a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9m0-16v16" />
      </svg>
    </Toggle>
  );
}
```

## Features

- 🎯 **State Management** - Controlled and uncontrolled modes
- 🎨 **Variants** - Multiple visual styles and sizes
- ⌨️ **Keyboard Support** - Space and Enter key activation
- ♿ **Accessible** - Full ARIA support with proper roles
- 🎭 **Visual Feedback** - Clear pressed/unpressed states
- 📱 **Touch Friendly** - Optimized for mobile interactions
- 🔄 **Toggle Groups** - Can be grouped for exclusive selection
- 🎪 **Icon Support** - Works with icons and text
- 🚀 **Performance** - Lightweight with minimal overhead
- 🌈 **Theming** - Adapts to your design system

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```tsx
import { Toggle } from '@dainabase/ui';

function App() {
  return (
    <Toggle aria-label="Toggle formatting">
      B
    </Toggle>
  );
}
```

## Examples

### 1. Text Formatting Toolbar

```tsx
function TextFormattingToolbar() {
  const [formatting, setFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    code: false,
    highlight: false,
  });
  
  const toggleFormat = (format) => {
    setFormatting(prev => ({
      ...prev,
      [format]: !prev[format]
    }));
  };
  
  const formatButtons = [
    { 
      key: 'bold', 
      icon: 'B', 
      label: 'Bold',
      shortcut: '⌘B'
    },
    { 
      key: 'italic', 
      icon: 'I', 
      label: 'Italic',
      shortcut: '⌘I',
      className: 'italic'
    },
    { 
      key: 'underline', 
      icon: 'U', 
      label: 'Underline',
      shortcut: '⌘U',
      className: 'underline'
    },
    { 
      key: 'strikethrough', 
      icon: 'S', 
      label: 'Strikethrough',
      shortcut: '⌘⇧S',
      className: 'line-through'
    },
    { 
      key: 'code', 
      icon: '</>', 
      label: 'Code',
      shortcut: '⌘E',
      className: 'font-mono text-sm'
    },
    { 
      key: 'highlight', 
      icon: '🖍️', 
      label: 'Highlight',
      shortcut: '⌘H'
    },
  ];
  
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center space-x-1 mb-4">
        {formatButtons.map((button) => (
          <div key={button.key} className="relative group">
            <Toggle
              pressed={formatting[button.key]}
              onPressedChange={() => toggleFormat(button.key)}
              aria-label={button.label}
              className="w-10 h-10 hover:bg-gray-100 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-600"
            >
              <span className={button.className}>{button.icon}</span>
            </Toggle>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {button.label}
              <span className="ml-2 text-gray-400">{button.shortcut}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 bg-gray-50 rounded">
        <p className="text-lg">
          <span className={formatting.bold ? 'font-bold' : ''}>
            <span className={formatting.italic ? 'italic' : ''}>
              <span className={formatting.underline ? 'underline' : ''}>
                <span className={formatting.strikethrough ? 'line-through' : ''}>
                  <span className={formatting.code ? 'font-mono bg-gray-200 px-1 rounded' : ''}>
                    <span className={formatting.highlight ? 'bg-yellow-200' : ''}>
                      Sample Text
                    </span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </p>
      </div>
    </div>
  );
}
```

### 2. View Mode Toggles

```tsx
function ViewModeToggles() {
  const [view, setView] = useState('grid');
  
  const views = [
    { id: 'grid', icon: '⊞', label: 'Grid View' },
    { id: 'list', icon: '☰', label: 'List View' },
    { id: 'card', icon: '▢', label: 'Card View' },
    { id: 'table', icon: '⊟', label: 'Table View' },
  ];
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Products</h3>
        <div className="flex items-center space-x-1 p-1 bg-gray-100 rounded-lg">
          {views.map((v) => (
            <Toggle
              key={v.id}
              pressed={view === v.id}
              onPressedChange={() => setView(v.id)}
              aria-label={v.label}
              className="px-3 py-2 data-[state=on]:bg-white data-[state=on]:shadow-sm rounded"
            >
              <span className="mr-2">{v.icon}</span>
              <span className="text-sm">{v.label}</span>
            </Toggle>
          ))}
        </div>
      </div>
      
      <div className="border rounded-lg p-4">
        {view === 'grid' && (
          <div className="grid grid-cols-3 gap-4">
            {Array(9).fill(0).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded" />
            ))}
          </div>
        )}
        {view === 'list' && (
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded" />
            ))}
          </div>
        )}
        {view === 'card' && (
          <div className="grid grid-cols-2 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded" />
            ))}
          </div>
        )}
        {view === 'table' && (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Name</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {Array(5).fill(0).map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2">Product {i + 1}</td>
                  <td className="py-2">Active</td>
                  <td className="py-2">$99</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

### 3. Settings Toggles

```tsx
function SettingsToggles() {
  const [settings, setSettings] = useState({
    notifications: true,
    sounds: false,
    vibration: true,
    darkMode: false,
    autoSave: true,
    syncData: true,
    analytics: false,
    location: false,
  });
  
  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const settingGroups = [
    {
      title: 'Notifications',
      items: [
        { key: 'notifications', label: 'Push Notifications', icon: '🔔', description: 'Receive push notifications' },
        { key: 'sounds', label: 'Sound Effects', icon: '🔊', description: 'Play sounds for actions' },
        { key: 'vibration', label: 'Vibration', icon: '📳', description: 'Vibrate on notifications' },
      ]
    },
    {
      title: 'Appearance',
      items: [
        { key: 'darkMode', label: 'Dark Mode', icon: '🌙', description: 'Use dark theme' },
      ]
    },
    {
      title: 'Data & Privacy',
      items: [
        { key: 'autoSave', label: 'Auto-save', icon: '💾', description: 'Automatically save changes' },
        { key: 'syncData', label: 'Sync Data', icon: '🔄', description: 'Sync across devices' },
        { key: 'analytics', label: 'Analytics', icon: '📊', description: 'Share usage analytics' },
        { key: 'location', label: 'Location', icon: '📍', description: 'Share location data' },
      ]
    }
  ];
  
  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      
      {settingGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {group.title}
          </h3>
          <div className="space-y-2">
            {group.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-gray-500">{item.description}</div>
                  </div>
                </div>
                <Toggle
                  pressed={settings[item.key]}
                  onPressedChange={() => toggleSetting(item.key)}
                  aria-label={`Toggle ${item.label}`}
                  className="data-[state=on]:bg-blue-600 data-[state=off]:bg-gray-200 relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                >
                  <span className={`${
                    settings[item.key] ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                </Toggle>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 4. Media Player Controls

```tsx
function MediaPlayerControls() {
  const [playing, setPlaying] = useState(false);
  const [controls, setControls] = useState({
    shuffle: false,
    repeat: false,
    mute: false,
    fullscreen: false,
    captions: false,
    pip: false,
  });
  
  const toggleControl = (control) => {
    setControls(prev => ({
      ...prev,
      [control]: !prev[control]
    }));
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900 rounded-lg">
      <div className="bg-gray-800 rounded-lg aspect-video mb-4 flex items-center justify-center">
        <span className="text-6xl text-gray-600">🎬</span>
      </div>
      
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-400">2:45</span>
          <div className="flex-1 h-1 bg-gray-700 rounded-full">
            <div className="w-1/3 h-full bg-blue-500 rounded-full" />
          </div>
          <span className="text-sm text-gray-400">8:32</span>
        </div>
        
        {/* Main Controls */}
        <div className="flex items-center justify-center space-x-2">
          <Toggle
            pressed={controls.shuffle}
            onPressedChange={() => toggleControl('shuffle')}
            aria-label="Shuffle"
            className="text-gray-400 hover:text-white data-[state=on]:text-blue-500"
          >
            🔀
          </Toggle>
          
          <button className="text-white hover:text-gray-300">⏮️</button>
          
          <button
            onClick={() => setPlaying(!playing)}
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:bg-gray-200"
          >
            <span className="text-2xl text-gray-900">
              {playing ? '⏸️' : '▶️'}
            </span>
          </button>
          
          <button className="text-white hover:text-gray-300">⏭️</button>
          
          <Toggle
            pressed={controls.repeat}
            onPressedChange={() => toggleControl('repeat')}
            aria-label="Repeat"
            className="text-gray-400 hover:text-white data-[state=on]:text-blue-500"
          >
            🔁
          </Toggle>
        </div>
        
        {/* Secondary Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Toggle
              pressed={controls.mute}
              onPressedChange={() => toggleControl('mute')}
              aria-label="Mute"
              className="text-gray-400 hover:text-white data-[state=on]:text-red-500"
            >
              {controls.mute ? '🔇' : '🔊'}
            </Toggle>
            <div className="w-24 h-1 bg-gray-700 rounded-full">
              <div className="w-2/3 h-full bg-white rounded-full" />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Toggle
              pressed={controls.captions}
              onPressedChange={() => toggleControl('captions')}
              aria-label="Captions"
              className="px-2 py-1 text-xs text-gray-400 hover:text-white data-[state=on]:text-white data-[state=on]:bg-gray-700 rounded"
            >
              CC
            </Toggle>
            
            <Toggle
              pressed={controls.pip}
              onPressedChange={() => toggleControl('pip')}
              aria-label="Picture in Picture"
              className="text-gray-400 hover:text-white data-[state=on]:text-white"
            >
              ⚹
            </Toggle>
            
            <Toggle
              pressed={controls.fullscreen}
              onPressedChange={() => toggleControl('fullscreen')}
              aria-label="Fullscreen"
              className="text-gray-400 hover:text-white data-[state=on]:text-white"
            >
              ⛶
            </Toggle>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 5. Filter Toggles

```tsx
function FilterToggles() {
  const [filters, setFilters] = useState({
    inStock: true,
    onSale: false,
    freeShipping: false,
    newArrival: false,
    topRated: false,
  });
  
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [categories, setCategories] = useState([]);
  
  const toggleFilter = (filter) => {
    setFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };
  
  const toggleCategory = (category) => {
    setCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const categoryOptions = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'];
  
  const activeFilterCount = Object.values(filters).filter(Boolean).length + categories.length;
  
  return (
    <div className="max-w-sm p-6 border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        {activeFilterCount > 0 && (
          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
            {activeFilterCount} active
          </span>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Quick Filters */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Filters</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => (
              <Toggle
                key={key}
                pressed={value}
                onPressedChange={() => toggleFilter(key)}
                className="px-3 py-1.5 text-sm border rounded-full data-[state=on]:bg-blue-50 data-[state=on]:border-blue-500 data-[state=on]:text-blue-700"
              >
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Toggle>
            ))}
          </div>
        </div>
        
        {/* Categories */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Categories</h4>
          <div className="space-y-1">
            {categoryOptions.map((category) => (
              <Toggle
                key={category}
                pressed={categories.includes(category)}
                onPressedChange={() => toggleCategory(category)}
                className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-700 flex items-center justify-between"
              >
                <span>{category}</span>
                {categories.includes(category) && <span>✓</span>}
              </Toggle>
            ))}
          </div>
        </div>
        
        {/* Price Range */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Price Range: ${priceRange[0]} - ${priceRange[1]}
          </h4>
          <input
            type="range"
            min="0"
            max="1000"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-full"
          />
        </div>
        
        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => {
              setFilters({
                inStock: false,
                onSale: false,
                freeShipping: false,
                newArrival: false,
                topRated: false,
              });
              setCategories([]);
              setPriceRange([0, 1000]);
            }}
            className="flex-1 py-2 border rounded hover:bg-gray-50"
          >
            Clear All
          </button>
          <button className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 6. Sidebar Navigation Toggles

```tsx
function SidebarNavigation() {
  const [expanded, setExpanded] = useState({
    dashboard: false,
    products: true,
    orders: false,
    customers: false,
    analytics: false,
  });
  
  const [activeItem, setActiveItem] = useState('all-products');
  
  const toggleSection = (section) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      items: [
        { id: 'overview', label: 'Overview' },
        { id: 'activity', label: 'Activity' },
      ]
    },
    {
      id: 'products',
      label: 'Products',
      icon: '📦',
      items: [
        { id: 'all-products', label: 'All Products' },
        { id: 'categories', label: 'Categories' },
        { id: 'inventory', label: 'Inventory' },
      ]
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: '🛒',
      badge: '12',
      items: [
        { id: 'all-orders', label: 'All Orders' },
        { id: 'pending', label: 'Pending', badge: '5' },
        { id: 'completed', label: 'Completed' },
      ]
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: '👥',
      items: [
        { id: 'all-customers', label: 'All Customers' },
        { id: 'segments', label: 'Segments' },
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📈',
      items: [
        { id: 'reports', label: 'Reports' },
        { id: 'insights', label: 'Insights' },
      ]
    },
  ];
  
  return (
    <div className="w-64 bg-gray-50 p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Navigation</h2>
      
      <nav className="space-y-1">
        {navItems.map((section) => (
          <div key={section.id}>
            <Toggle
              pressed={expanded[section.id]}
              onPressedChange={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-gray-100 data-[state=on]:bg-gray-100"
            >
              <div className="flex items-center space-x-2">
                <span>{section.icon}</span>
                <span className="font-medium">{section.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                {section.badge && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                    {section.badge}
                  </span>
                )}
                <span className={`transition-transform ${
                  expanded[section.id] ? 'rotate-90' : ''
                }`}>
                  ›
                </span>
              </div>
            </Toggle>
            
            {expanded[section.id] && (
              <div className="ml-9 mt-1 space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveItem(item.id)}
                    className={`w-full text-left px-3 py-1.5 text-sm rounded hover:bg-gray-100 flex items-center justify-between ${
                      activeItem === item.id ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
```

### 7. Code Editor Options

```tsx
function CodeEditorOptions() {
  const [options, setOptions] = useState({
    lineNumbers: true,
    wordWrap: false,
    minimap: true,
    brackets: true,
    indent: true,
    highlight: true,
    autocomplete: true,
    lint: false,
  });
  
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState(14);
  
  const toggleOption = (option) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3 text-gray-400 text-sm">
            <span>main.js</span>
            <span>JavaScript</span>
          </div>
          <div className="font-mono text-sm text-gray-300">
            <div className="flex">
              {options.lineNumbers && (
                <div className="pr-4 text-gray-600">
                  {Array(10).fill(0).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
              )}
              <div>
                <div><span className="text-purple-400">function</span> <span className="text-blue-400">calculate</span>() {'{'}</div>
                <div className="pl-4"><span className="text-purple-400">const</span> result = 42;</div>
                <div className="pl-4"><span className="text-purple-400">return</span> result;</div>
                <div>{'}'}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-3">Editor Settings</h3>
            
            <div className="space-y-2">
              {Object.entries(options).map(([key, value]) => (
                <Toggle
                  key={key}
                  pressed={value}
                  onPressedChange={() => toggleOption(key)}
                  className="w-full flex items-center justify-between px-3 py-2 border rounded hover:bg-gray-50 data-[state=on]:bg-blue-50 data-[state=on]:border-blue-500"
                >
                  <span className="text-sm">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${
                    value ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                </Toggle>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Theme</h4>
            <div className="flex space-x-1">
              <Toggle
                pressed={theme === 'light'}
                onPressedChange={() => setTheme('light')}
                className="flex-1 py-1 text-sm border rounded data-[state=on]:bg-white data-[state=on]:border-blue-500"
              >
                Light
              </Toggle>
              <Toggle
                pressed={theme === 'dark'}
                onPressedChange={() => setTheme('dark')}
                className="flex-1 py-1 text-sm border rounded data-[state=on]:bg-gray-900 data-[state=on]:text-white data-[state=on]:border-blue-500"
              >
                Dark
              </Toggle>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Font Size: {fontSize}px</h4>
            <input
              type="range"
              min="10"
              max="20"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 8. Map Layer Toggles

```tsx
function MapLayerToggles() {
  const [layers, setLayers] = useState({
    satellite: false,
    traffic: false,
    transit: false,
    bike: false,
    terrain: false,
    weather: false,
    businesses: true,
    landmarks: true,
  });
  
  const toggleLayer = (layer) => {
    setLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };
  
  const layerGroups = [
    {
      title: 'Base Layers',
      items: [
        { key: 'satellite', label: 'Satellite', icon: '🛰️' },
        { key: 'terrain', label: 'Terrain', icon: '⛰️' },
      ]
    },
    {
      title: 'Data Layers',
      items: [
        { key: 'traffic', label: 'Traffic', icon: '🚗' },
        { key: 'transit', label: 'Transit', icon: '🚇' },
        { key: 'bike', label: 'Bike Paths', icon: '🚴' },
        { key: 'weather', label: 'Weather', icon: '☁️' },
      ]
    },
    {
      title: 'Points of Interest',
      items: [
        { key: 'businesses', label: 'Businesses', icon: '🏢' },
        { key: 'landmarks', label: 'Landmarks', icon: '🏛️' },
      ]
    }
  ];
  
  return (
    <div className="max-w-md p-6">
      <div className="bg-gray-200 rounded-lg h-64 mb-4 flex items-center justify-center">
        <span className="text-4xl">🗺️</span>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="font-semibold mb-3">Map Layers</h3>
        
        {layerGroups.map((group, index) => (
          <div key={index} className={index > 0 ? 'mt-4 pt-4 border-t' : ''}>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              {group.title}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {group.items.map((item) => (
                <Toggle
                  key={item.key}
                  pressed={layers[item.key]}
                  onPressedChange={() => toggleLayer(item.key)}
                  className="flex items-center space-x-2 px-3 py-2 border rounded data-[state=on]:bg-blue-50 data-[state=on]:border-blue-500"
                >
                  <span>{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </Toggle>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 9. Accessibility Options

```tsx
function AccessibilityOptions() {
  const [a11y, setA11y] = useState({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNav: true,
    focusIndicator: true,
    captions: false,
    audioDescriptions: false,
  });
  
  const toggleA11y = (option) => {
    setA11y(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };
  
  const categories = [
    {
      title: 'Visual',
      icon: '👁️',
      items: [
        { key: 'highContrast', label: 'High Contrast Mode' },
        { key: 'largeText', label: 'Large Text' },
        { key: 'focusIndicator', label: 'Focus Indicators' },
      ]
    },
    {
      title: 'Motion',
      icon: '🎬',
      items: [
        { key: 'reducedMotion', label: 'Reduce Motion' },
      ]
    },
    {
      title: 'Audio',
      icon: '🔊',
      items: [
        { key: 'screenReader', label: 'Screen Reader Support' },
        { key: 'captions', label: 'Closed Captions' },
        { key: 'audioDescriptions', label: 'Audio Descriptions' },
      ]
    },
    {
      title: 'Navigation',
      icon: '⌨️',
      items: [
        { key: 'keyboardNav', label: 'Keyboard Navigation' },
      ]
    }
  ];
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Accessibility Settings</h2>
        <p className="text-gray-600">Customize your experience for better accessibility</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => (
          <div key={category.title} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-2xl">{category.icon}</span>
              <h3 className="font-semibold">{category.title}</h3>
            </div>
            
            <div className="space-y-2">
              {category.items.map((item) => (
                <Toggle
                  key={item.key}
                  pressed={a11y[item.key]}
                  onPressedChange={() => toggleA11y(item.key)}
                  className="w-full text-left px-3 py-2 rounded border hover:bg-gray-50 data-[state=on]:bg-green-50 data-[state=on]:border-green-500 flex items-center justify-between"
                >
                  <span className="text-sm">{item.label}</span>
                  <span className={`w-4 h-4 rounded-full border-2 ${
                    a11y[item.key] 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300'
                  }`}>
                    {a11y[item.key] && (
                      <span className="block w-full h-full text-white text-xs flex items-center justify-center">
                        ✓
                      </span>
                    )}
                  </span>
                </Toggle>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex justify-center space-x-3">
        <button
          onClick={() => setA11y(Object.keys(a11y).reduce((acc, key) => ({ ...acc, [key]: false }), {}))}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Reset to Defaults
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Save Preferences
        </button>
      </div>
    </div>
  );
}
```

### 10. Social Share Toggles

```tsx
function SocialShareToggles() {
  const [platforms, setPlatforms] = useState({
    facebook: true,
    twitter: true,
    linkedin: false,
    instagram: false,
    whatsapp: false,
    telegram: false,
    reddit: false,
    pinterest: false,
  });
  
  const [shareSettings, setShareSettings] = useState({
    includeImage: true,
    includeLink: true,
    trackClicks: false,
  });
  
  const togglePlatform = (platform) => {
    setPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };
  
  const toggleSetting = (setting) => {
    setShareSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  const socialPlatforms = [
    { key: 'facebook', label: 'Facebook', icon: '👍', color: 'blue' },
    { key: 'twitter', label: 'Twitter', icon: '🐦', color: 'sky' },
    { key: 'linkedin', label: 'LinkedIn', icon: '💼', color: 'indigo' },
    { key: 'instagram', label: 'Instagram', icon: '📷', color: 'pink' },
    { key: 'whatsapp', label: 'WhatsApp', icon: '💬', color: 'green' },
    { key: 'telegram', label: 'Telegram', icon: '✈️', color: 'cyan' },
    { key: 'reddit', label: 'Reddit', icon: '🤖', color: 'orange' },
    { key: 'pinterest', label: 'Pinterest', icon: '📌', color: 'red' },
  ];
  
  const selectedCount = Object.values(platforms).filter(Boolean).length;
  
  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Share Settings</h3>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Social Platforms</h4>
            <span className="text-sm text-gray-500">{selectedCount} selected</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {socialPlatforms.map((platform) => (
              <Toggle
                key={platform.key}
                pressed={platforms[platform.key]}
                onPressedChange={() => togglePlatform(platform.key)}
                className={`flex items-center space-x-2 px-3 py-2 border rounded hover:bg-gray-50 data-[state=on]:bg-${platform.color}-50 data-[state=on]:border-${platform.color}-500`}
              >
                <span>{platform.icon}</span>
                <span className="text-sm">{platform.label}</span>
              </Toggle>
            ))}
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Share Options</h4>
          <div className="space-y-2">
            <Toggle
              pressed={shareSettings.includeImage}
              onPressedChange={() => toggleSetting('includeImage')}
              className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-gray-50"
            >
              <span className="text-sm">Include Preview Image</span>
              <span className={`text-xs px-2 py-1 rounded ${
                shareSettings.includeImage ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {shareSettings.includeImage ? 'ON' : 'OFF'}
              </span>
            </Toggle>
            
            <Toggle
              pressed={shareSettings.includeLink}
              onPressedChange={() => toggleSetting('includeLink')}
              className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-gray-50"
            >
              <span className="text-sm">Include Link</span>
              <span className={`text-xs px-2 py-1 rounded ${
                shareSettings.includeLink ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {shareSettings.includeLink ? 'ON' : 'OFF'}
              </span>
            </Toggle>
            
            <Toggle
              pressed={shareSettings.trackClicks}
              onPressedChange={() => toggleSetting('trackClicks')}
              className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-gray-50"
            >
              <span className="text-sm">Track Clicks</span>
              <span className={`text-xs px-2 py-1 rounded ${
                shareSettings.trackClicks ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {shareSettings.trackClicks ? 'ON' : 'OFF'}
              </span>
            </Toggle>
          </div>
        </div>
        
        <button className="w-full mt-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Share Now
        </button>
      </div>
    </div>
  );
}
```

## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pressed` | `boolean` | `false` | Controlled pressed state |
| `defaultPressed` | `boolean` | `false` | Default pressed state |
| `onPressedChange` | `(pressed: boolean) => void` | `undefined` | Pressed state change handler |
| `disabled` | `boolean` | `false` | Disable the toggle |
| `className` | `string` | `undefined` | Additional CSS classes |
| `variant` | `'default' \| 'outline'` | `'default'` | Visual variant |
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | Size variant |
| `asChild` | `boolean` | `false` | Render as child component |

## Accessibility

The Toggle component follows WCAG 2.1 Level AA guidelines:

- **Keyboard Support**: Space and Enter keys toggle state
- **ARIA Attributes**:
  - `role="button"` for semantic button
  - `aria-pressed` indicates toggle state
  - `aria-label` for screen reader context
  - `aria-disabled` for disabled state
- **Focus Management**: Clear focus indicators
- **Screen Reader Support**: State changes announced

## Best Practices

### Do's ✅

- Provide clear visual feedback for states
- Use appropriate aria-labels
- Group related toggles together
- Show current state clearly
- Test keyboard navigation
- Consider touch target sizes
- Use consistent styling
- Provide tooltips for icons
- Test with screen readers
- Handle disabled states properly

### Don'ts ❌

- Don't use for navigation
- Don't make toggle too small
- Don't forget focus indicators
- Don't use ambiguous icons
- Don't toggle without feedback
- Don't use for critical actions alone
- Don't forget hover states
- Don't mix toggle patterns
- Don't ignore accessibility
- Don't use conflicting states

## Use Cases

1. **Settings** - Preference toggles
2. **Toolbars** - Formatting controls
3. **Filters** - Filter options
4. **View Modes** - Layout switches
5. **Features** - Feature flags
6. **Media Controls** - Player options
7. **Editor Options** - Code settings
8. **Accessibility** - A11y preferences
9. **Themes** - Theme switching
10. **Navigation** - Expand/collapse

## Related Components

- [**ToggleGroup**](./toggle-group) - Exclusive toggle selection
- [**Switch**](./switch) - On/off switches
- [**Checkbox**](./checkbox) - Multiple selections
- [**RadioGroup**](./radio-group) - Single selection
- [**Button**](./button) - Action buttons
