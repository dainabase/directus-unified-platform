---
id: toggle-group
title: ToggleGroup
sidebar_position: 53
---

import { ToggleGroup, ToggleGroupItem } from '@dainabase/ui';

# ToggleGroup Component

A group of toggle buttons that allows single or multiple selection, perfect for creating exclusive or inclusive option groups, view switchers, and toolbar controls.

## Preview

```tsx live
function ToggleGroupDemo() {
  const [value, setValue] = useState('center');
  
  return (
    <ToggleGroup type="single" value={value} onValueChange={setValue}>
      <ToggleGroupItem value="left" aria-label="Align left">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
        </svg>
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" />
        </svg>
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />
        </svg>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
```

## Features

- 🎯 **Single & Multiple** - Support for exclusive and inclusive selection
- 🎨 **Variants** - Multiple visual styles and sizes
- ⌨️ **Keyboard Navigation** - Arrow key navigation within group
- ♿ **Accessible** - Full ARIA support with proper roles
- 🎭 **Visual Feedback** - Clear selected/unselected states
- 📱 **Touch Friendly** - Optimized for mobile interactions
- 🔄 **Controlled & Uncontrolled** - Flexible state management
- 🎪 **Icon & Text Support** - Works with any content
- 🚀 **Performance** - Optimized rendering
- 🌈 **Theming** - Adapts to your design system

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```tsx
import { ToggleGroup, ToggleGroupItem } from '@dainabase/ui';

function App() {
  return (
    <ToggleGroup type="single" defaultValue="option1">
      <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
      <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
      <ToggleGroupItem value="option3">Option 3</ToggleGroupItem>
    </ToggleGroup>
  );
}
```

## Examples

### 1. Text Alignment Toolbar

```tsx
function TextAlignmentToolbar() {
  const [alignment, setAlignment] = useState('left');
  const [decorations, setDecorations] = useState([]);
  
  return (
    <div className="p-6 space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Text Alignment</h3>
        <ToggleGroup type="single" value={alignment} onValueChange={setAlignment}>
          <ToggleGroupItem value="left" aria-label="Align left">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
            </svg>
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" />
            </svg>
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />
            </svg>
          </ToggleGroupItem>
          <ToggleGroupItem value="justify" aria-label="Justify">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Text Decoration</h3>
        <ToggleGroup type="multiple" value={decorations} onValueChange={setDecorations}>
          <ToggleGroupItem value="bold" aria-label="Bold">
            <span className="font-bold">B</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic">
            <span className="italic">I</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline">
            <span className="underline">U</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="strikethrough" aria-label="Strikethrough">
            <span className="line-through">S</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="p-4 border rounded-lg">
        <p className={`text-${alignment} ${
          decorations.includes('bold') ? 'font-bold' : ''
        } ${
          decorations.includes('italic') ? 'italic' : ''
        } ${
          decorations.includes('underline') ? 'underline' : ''
        } ${
          decorations.includes('strikethrough') ? 'line-through' : ''
        }`}>
          Sample text with formatting applied
        </p>
      </div>
    </div>
  );
}
```

### 2. View Mode Selector

```tsx
function ViewModeSelector() {
  const [view, setView] = useState('grid');
  
  const items = Array(12).fill(0).map((_, i) => ({
    id: i + 1,
    title: `Item ${i + 1}`,
    description: 'Lorem ipsum dolor sit amet',
    image: `https://picsum.photos/200/200?random=${i}`,
  }));
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <ToggleGroup type="single" value={view} onValueChange={setView} className="bg-gray-100 p-1 rounded-lg">
          <ToggleGroupItem value="grid" aria-label="Grid view" className="px-3 py-1.5">
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Grid
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view" className="px-3 py-1.5">
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List
          </ToggleGroupItem>
          <ToggleGroupItem value="cards" aria-label="Cards view" className="px-3 py-1.5">
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Cards
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      {view === 'grid' && (
        <div className="grid grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className="border rounded-lg overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />
              <div className="p-3">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {view === 'list' && (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
              <img src={item.image} alt={item.title} className="w-16 h-16 rounded object-cover" />
              <div className="flex-1">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {view === 'cards' && (
        <div className="grid grid-cols-2 gap-6">
          {items.map(item => (
            <div key={item.id} className="flex space-x-4 p-4 border rounded-lg">
              <img src={item.image} alt={item.title} className="w-32 h-32 rounded object-cover" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 3. Size Selector

```tsx
function SizeSelectorExample() {
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColors, setSelectedColors] = useState(['blue']);
  
  const sizes = [
    { value: 'XS', label: 'XS', available: true },
    { value: 'S', label: 'S', available: true },
    { value: 'M', label: 'M', available: true },
    { value: 'L', label: 'L', available: true },
    { value: 'XL', label: 'XL', available: false },
    { value: '2XL', label: '2XL', available: true },
  ];
  
  const colors = [
    { value: 'black', label: 'Black', hex: '#000000' },
    { value: 'white', label: 'White', hex: '#FFFFFF' },
    { value: 'blue', label: 'Blue', hex: '#3B82F6' },
    { value: 'red', label: 'Red', hex: '#EF4444' },
    { value: 'green', label: 'Green', hex: '#10B981' },
  ];
  
  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Product Options</h3>
        
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Size</label>
          <ToggleGroup type="single" value={selectedSize} onValueChange={setSelectedSize}>
            {sizes.map(size => (
              <ToggleGroupItem
                key={size.value}
                value={size.value}
                disabled={!size.available}
                className="w-12 h-12"
              >
                {size.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {selectedSize && (
            <p className="text-sm text-gray-600 mt-2">Selected: {selectedSize}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Colors (Multiple)</label>
          <ToggleGroup type="multiple" value={selectedColors} onValueChange={setSelectedColors}>
            {colors.map(color => (
              <ToggleGroupItem
                key={color.value}
                value={color.value}
                aria-label={color.label}
                className="w-12 h-12 relative"
              >
                <div
                  className="w-8 h-8 rounded-full border-2"
                  style={{ backgroundColor: color.hex }}
                />
                {selectedColors.includes(color.value) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {selectedColors.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              Selected: {selectedColors.join(', ')}
            </p>
          )}
        </div>
        
        <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
```

### 4. Calendar View Options

```tsx
function CalendarViewOptions() {
  const [view, setView] = useState('month');
  const [selectedFilters, setSelectedFilters] = useState(['work']);
  
  const viewOptions = [
    { value: 'day', label: 'Day', icon: '1' },
    { value: 'week', label: 'Week', icon: '7' },
    { value: 'month', label: 'Month', icon: '30' },
    { value: 'year', label: 'Year', icon: '365' },
  ];
  
  const filterOptions = [
    { value: 'work', label: 'Work', color: 'blue' },
    { value: 'personal', label: 'Personal', color: 'green' },
    { value: 'family', label: 'Family', color: 'purple' },
    { value: 'holidays', label: 'Holidays', color: 'red' },
  ];
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Calendar</h2>
          
          <div className="flex items-center space-x-4">
            <ToggleGroup type="single" value={view} onValueChange={setView}>
              {viewOptions.map(option => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  className="px-3 py-1"
                >
                  <span className="text-xs font-bold mr-1">{option.icon}</span>
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            
            <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
              Today
            </button>
          </div>
        </div>
        
        <div className="p-4 border-b">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Show:</span>
            <ToggleGroup type="multiple" value={selectedFilters} onValueChange={setSelectedFilters}>
              {filterOptions.map(filter => (
                <ToggleGroupItem
                  key={filter.value}
                  value={filter.value}
                  className="px-3 py-1"
                >
                  <div className={`w-3 h-3 rounded-full bg-${filter.color}-500 mr-2`} />
                  {filter.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
        
        <div className="p-8 text-center text-gray-500">
          <div className="text-6xl mb-4">📅</div>
          <p>Calendar view: {view}</p>
          <p className="text-sm mt-2">
            Showing: {selectedFilters.length > 0 ? selectedFilters.join(', ') : 'Nothing selected'}
          </p>
        </div>
      </div>
    </div>
  );
}
```

### 5. Editor Settings

```tsx
function EditorSettings() {
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState('14');
  const [features, setFeatures] = useState(['autocomplete', 'lint']);
  
  const themeOptions = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'auto', label: 'Auto', icon: '🔄' },
  ];
  
  const fontSizeOptions = [
    { value: '12', label: '12px' },
    { value: '14', label: '14px' },
    { value: '16', label: '16px' },
    { value: '18', label: '18px' },
  ];
  
  const featureOptions = [
    { value: 'autocomplete', label: 'Autocomplete', icon: '💡' },
    { value: 'lint', label: 'Linting', icon: '✅' },
    { value: 'format', label: 'Auto Format', icon: '🎨' },
    { value: 'minimap', label: 'Minimap', icon: '🗺️' },
    { value: 'wordwrap', label: 'Word Wrap', icon: '↩️' },
  ];
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Editor Settings</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3">Theme</h3>
          <ToggleGroup type="single" value={theme} onValueChange={setTheme} className="justify-start">
            {themeOptions.map(option => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className="px-4 py-2"
              >
                <span className="mr-2">{option.icon}</span>
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-3">Font Size</h3>
          <ToggleGroup type="single" value={fontSize} onValueChange={setFontSize} className="justify-start">
            {fontSizeOptions.map(option => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className="px-4 py-2 font-mono"
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-3">Features</h3>
          <ToggleGroup type="multiple" value={features} onValueChange={setFeatures} className="justify-start flex-wrap">
            {featureOptions.map(option => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className="px-4 py-2"
              >
                <span className="mr-2">{option.icon}</span>
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        
        <div className={`p-4 rounded-lg font-mono text-${fontSize}px ${
          theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
        }`}>
          <div>function example() {'{'}</div>
          <div className="pl-4">
            <span className="text-blue-500">const</span> result = 42;
            {features.includes('autocomplete') && (
              <span className="ml-2 text-gray-500 text-xs">// autocomplete enabled</span>
            )}
          </div>
          <div className="pl-4">
            <span className="text-purple-500">return</span> result;
          </div>
          <div>{'}'}</div>
          {features.includes('lint') && (
            <div className="mt-2 text-yellow-500 text-xs">⚠️ No issues found</div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 6. Chart Type Selector

```tsx
function ChartTypeSelector() {
  const [chartType, setChartType] = useState('bar');
  const [dataOptions, setDataOptions] = useState(['values']);
  
  const chartTypes = [
    { value: 'line', label: 'Line', icon: '📈' },
    { value: 'bar', label: 'Bar', icon: '📊' },
    { value: 'pie', label: 'Pie', icon: '🥧' },
    { value: 'area', label: 'Area', icon: '📉' },
    { value: 'scatter', label: 'Scatter', icon: '⚪' },
  ];
  
  const dataDisplayOptions = [
    { value: 'values', label: 'Values' },
    { value: 'percentages', label: 'Percentages' },
    { value: 'labels', label: 'Labels' },
    { value: 'legend', label: 'Legend' },
  ];
  
  const sampleData = [
    { label: 'Jan', value: 65 },
    { label: 'Feb', value: 78 },
    { label: 'Mar', value: 90 },
    { label: 'Apr', value: 81 },
    { label: 'May', value: 56 },
  ];
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Sales Analytics</h2>
          <ToggleGroup type="single" value={chartType} onValueChange={setChartType}>
            {chartTypes.map(type => (
              <ToggleGroupItem
                key={type.value}
                value={type.value}
                aria-label={type.label}
              >
                <span className="mr-1">{type.icon}</span>
                <span className="text-sm">{type.label}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        
        <div className="mb-4">
          <span className="text-sm font-medium mr-3">Display:</span>
          <ToggleGroup type="multiple" value={dataOptions} onValueChange={setDataOptions} className="inline-flex">
            {dataDisplayOptions.map(option => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className="px-3 py-1 text-sm"
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {chartTypes.find(t => t.value === chartType)?.icon}
            </div>
            <p className="text-gray-600">
              {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
            </p>
            <div className="mt-4 flex justify-center space-x-4">
              {sampleData.map(item => (
                <div key={item.label} className="text-center">
                  <div
                    className="w-12 bg-blue-500 rounded"
                    style={{ height: `${item.value}px` }}
                  />
                  <div className="text-xs mt-1">{item.label}</div>
                  {dataOptions.includes('values') && (
                    <div className="text-xs text-gray-600">{item.value}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 7. Media Control Bar

```tsx
function MediaControlBar() {
  const [playbackSpeed, setPlaybackSpeed] = useState('1x');
  const [quality, setQuality] = useState('1080p');
  const [controls, setControls] = useState(['play', 'volume']);
  
  const speedOptions = [
    { value: '0.5x', label: '0.5x' },
    { value: '1x', label: '1x' },
    { value: '1.5x', label: '1.5x' },
    { value: '2x', label: '2x' },
  ];
  
  const qualityOptions = [
    { value: '360p', label: '360p' },
    { value: '720p', label: '720p' },
    { value: '1080p', label: 'HD' },
    { value: '4K', label: '4K' },
  ];
  
  const controlOptions = [
    { value: 'play', label: 'Play', icon: '▶️' },
    { value: 'volume', label: 'Volume', icon: '🔊' },
    { value: 'fullscreen', label: 'Fullscreen', icon: '⛶' },
    { value: 'captions', label: 'Captions', icon: 'CC' },
    { value: 'settings', label: 'Settings', icon: '⚙️' },
  ];
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="bg-black aspect-video flex items-center justify-center">
          <span className="text-6xl">🎬</span>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">Speed:</span>
              <ToggleGroup type="single" value={playbackSpeed} onValueChange={setPlaybackSpeed}>
                {speedOptions.map(option => (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className="px-2 py-1 text-xs text-gray-300 data-[state=on]:text-white"
                  >
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">Quality:</span>
              <ToggleGroup type="single" value={quality} onValueChange={setQuality}>
                {qualityOptions.map(option => (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className="px-2 py-1 text-xs text-gray-300 data-[state=on]:text-white"
                  >
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <ToggleGroup type="multiple" value={controls} onValueChange={setControls}>
              {controlOptions.map(option => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  className="p-2 text-gray-400 data-[state=on]:text-white"
                  aria-label={option.label}
                >
                  <span className="text-lg">{option.icon}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 8. Language Selector

```tsx
function LanguageSelector() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedRegions, setSelectedRegions] = useState(['us']);
  
  const languages = [
    { value: 'en', label: 'English', flag: '🇬🇧' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { value: 'it', label: 'Italiano', flag: '🇮🇹' },
    { value: 'pt', label: 'Português', flag: '🇵🇹' },
    { value: 'ja', label: '日本語', flag: '🇯🇵' },
    { value: 'zh', label: '中文', flag: '🇨🇳' },
  ];
  
  const regions = [
    { value: 'us', label: 'United States', flag: '🇺🇸' },
    { value: 'uk', label: 'United Kingdom', flag: '🇬🇧' },
    { value: 'eu', label: 'European Union', flag: '🇪🇺' },
    { value: 'asia', label: 'Asia Pacific', flag: '🌏' },
    { value: 'latam', label: 'Latin America', flag: '🌎' },
  ];
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Language & Region Settings</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Display Language</h3>
            <ToggleGroup 
              type="single" 
              value={selectedLanguage} 
              onValueChange={setSelectedLanguage}
              className="grid grid-cols-4 gap-2"
            >
              {languages.map(lang => (
                <ToggleGroupItem
                  key={lang.value}
                  value={lang.value}
                  className="flex flex-col items-center p-3"
                >
                  <span className="text-2xl mb-1">{lang.flag}</span>
                  <span className="text-sm">{lang.label}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3">Content Regions (Multiple)</h3>
            <ToggleGroup 
              type="multiple" 
              value={selectedRegions} 
              onValueChange={setSelectedRegions}
              className="flex flex-wrap gap-2"
            >
              {regions.map(region => (
                <ToggleGroupItem
                  key={region.value}
                  value={region.value}
                  className="px-4 py-2"
                >
                  <span className="mr-2">{region.flag}</span>
                  {region.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">
              Language: <strong>{languages.find(l => l.value === selectedLanguage)?.label}</strong>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Regions: <strong>{selectedRegions.join(', ').toUpperCase()}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 9. Payment Method Selector

```tsx
function PaymentMethodSelector() {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [savedCards, setSavedCards] = useState(['visa-1234']);
  
  const methods = [
    { value: 'card', label: 'Credit Card', icon: '💳' },
    { value: 'paypal', label: 'PayPal', icon: '🅿️' },
    { value: 'apple', label: 'Apple Pay', icon: '🍎' },
    { value: 'google', label: 'Google Pay', icon: '🔵' },
    { value: 'crypto', label: 'Crypto', icon: '₿' },
  ];
  
  const cards = [
    { value: 'visa-1234', label: 'Visa ****1234', type: 'visa' },
    { value: 'master-5678', label: 'MasterCard ****5678', type: 'mastercard' },
    { value: 'amex-9012', label: 'Amex ****9012', type: 'amex' },
  ];
  
  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Select Payment Type</h3>
            <ToggleGroup 
              type="single" 
              value={paymentMethod} 
              onValueChange={setPaymentMethod}
              className="grid grid-cols-3 gap-2"
            >
              {methods.map(method => (
                <ToggleGroupItem
                  key={method.value}
                  value={method.value}
                  className="flex flex-col items-center p-3"
                >
                  <span className="text-2xl mb-1">{method.icon}</span>
                  <span className="text-xs">{method.label}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          
          {paymentMethod === 'card' && (
            <div>
              <h3 className="text-sm font-medium mb-3">Saved Cards</h3>
              <ToggleGroup 
                type="multiple" 
                value={savedCards} 
                onValueChange={setSavedCards}
                className="space-y-2"
              >
                {cards.map(card => (
                  <ToggleGroupItem
                    key={card.value}
                    value={card.value}
                    className="w-full p-3 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span>{card.label}</span>
                      <span className="text-xs text-gray-500">{card.type}</span>
                    </div>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <button className="w-full mt-2 p-3 border border-dashed rounded text-sm text-gray-500 hover:bg-gray-50">
                + Add New Card
              </button>
            </div>
          )}
          
          <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Continue to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 10. Dashboard Widgets Toggle

```tsx
function DashboardWidgetsToggle() {
  const [visibleWidgets, setVisibleWidgets] = useState(['stats', 'chart', 'activity']);
  const [widgetSizes, setWidgetSizes] = useState('medium');
  
  const widgets = [
    { value: 'stats', label: 'Statistics', icon: '📊' },
    { value: 'chart', label: 'Charts', icon: '📈' },
    { value: 'activity', label: 'Activity', icon: '📋' },
    { value: 'calendar', label: 'Calendar', icon: '📅' },
    { value: 'tasks', label: 'Tasks', icon: '✅' },
    { value: 'messages', label: 'Messages', icon: '💬' },
  ];
  
  const sizeOptions = [
    { value: 'small', label: 'Compact' },
    { value: 'medium', label: 'Default' },
    { value: 'large', label: 'Expanded' },
  ];
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Size:</span>
            <ToggleGroup type="single" value={widgetSizes} onValueChange={setWidgetSizes}>
              {sizeOptions.map(option => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  className="px-3 py-1 text-sm"
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </div>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium mb-3">Visible Widgets</h3>
        <ToggleGroup 
          type="multiple" 
          value={visibleWidgets} 
          onValueChange={setVisibleWidgets}
          className="flex flex-wrap gap-2"
        >
          {widgets.map(widget => (
            <ToggleGroupItem
              key={widget.value}
              value={widget.value}
              className="px-3 py-2"
            >
              <span className="mr-2">{widget.icon}</span>
              {widget.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      
      <div className={`grid ${
        widgetSizes === 'small' ? 'grid-cols-4' : 
        widgetSizes === 'medium' ? 'grid-cols-3' : 
        'grid-cols-2'
      } gap-4`}>
        {widgets
          .filter(w => visibleWidgets.includes(w.value))
          .map(widget => (
            <div
              key={widget.value}
              className={`bg-white rounded-lg shadow p-4 ${
                widgetSizes === 'small' ? 'h-32' :
                widgetSizes === 'medium' ? 'h-48' :
                'h-64'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{widget.label}</h3>
                <span className="text-2xl">{widget.icon}</span>
              </div>
              <div className="text-gray-500 text-center mt-4">
                Widget content here
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
```

## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'single' \| 'multiple'` | `'single'` | Selection type |
| `value` | `string \| string[]` | `undefined` | Controlled value |
| `defaultValue` | `string \| string[]` | `undefined` | Default value |
| `onValueChange` | `(value: string \| string[]) => void` | `undefined` | Value change handler |
| `disabled` | `boolean` | `false` | Disable all items |
| `className` | `string` | `undefined` | Additional CSS classes |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout orientation |
| `dir` | `'ltr' \| 'rtl'` | `'ltr'` | Text direction |

### ToggleGroupItem Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | Required | Item value |
| `disabled` | `boolean` | `false` | Disable this item |
| `className` | `string` | `undefined` | Additional CSS classes |
| `asChild` | `boolean` | `false` | Render as child component |

## Accessibility

The ToggleGroup component follows WCAG 2.1 Level AA guidelines:

- **Keyboard Navigation**: 
  - Arrow keys navigate between items
  - Space/Enter selects items
  - Tab moves focus in/out of group
- **ARIA Attributes**:
  - `role="group"` for container
  - `role="radio"` for single selection
  - `role="checkbox"` for multiple selection
  - `aria-pressed` for toggle state
  - `aria-checked` for selection state
- **Focus Management**: Clear focus indicators
- **Screen Reader Support**: Full announcements

## Best Practices

### Do's ✅

- Group related options together
- Provide clear labels for each option
- Show selected state clearly
- Use consistent styling
- Test keyboard navigation
- Consider touch target sizes
- Provide visual feedback
- Use appropriate selection type
- Include disabled states when needed
- Test with screen readers

### Don'ts ❌

- Don't mix selection types
- Don't use for navigation
- Don't make items too small
- Don't forget focus indicators
- Don't use ambiguous labels
- Don't nest toggle groups
- Don't forget hover states
- Don't use conflicting states
- Don't ignore accessibility
- Don't use for forms without proper labels

## Use Cases

1. **View Switchers** - Layout/view modes
2. **Text Formatting** - Editor toolbars
3. **Size Selectors** - Product options
4. **Filter Groups** - Multi-select filters
5. **Settings Groups** - Preference selections
6. **Theme Selectors** - Appearance options
7. **Language Pickers** - Locale selection
8. **Chart Types** - Visualization options
9. **Media Controls** - Player settings
10. **Payment Methods** - Checkout options

## Related Components

- [**Toggle**](./toggle) - Individual toggle button
- [**RadioGroup**](./radio-group) - Single selection
- [**Checkbox**](./checkbox) - Multiple selections
- [**Select**](./select) - Dropdown selection
- [**Tabs**](./tabs) - Tab navigation
