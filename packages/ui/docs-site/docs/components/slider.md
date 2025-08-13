---
id: slider
title: Slider
sidebar_position: 35
---

import { Slider } from '@dainabase/ui';

The Slider component provides an intuitive way for users to select a value or range of values from a continuous scale. Perfect for settings, filters, volume controls, and any numeric input that benefits from visual feedback.

## Preview

```jsx live
function SliderDemo() {
  const [value, setValue] = useState([50]);
  
  return (
    <div className="space-y-4 w-full max-w-md">
      <Slider
        value={value}
        onValueChange={setValue}
        max={100}
        step={1}
      />
      <p className="text-center text-sm text-gray-600">
        Value: {value[0]}
      </p>
    </div>
  );
}
```

## Features

- 🎯 **Single & Range Selection** - Support for single value or range selection
- 📊 **Custom Scales** - Linear, logarithmic, or custom scale functions
- 🎨 **Marks & Labels** - Display marks and labels at specific values
- 🔢 **Precise Input** - Keyboard support for precise value selection
- 📱 **Touch Optimized** - Smooth touch interactions on mobile devices
- ♿ **Accessible** - Full ARIA support and keyboard navigation
- 🎭 **Custom Styling** - Fully customizable track, thumb, and marks
- 📏 **Step Control** - Configure step intervals for value snapping
- 🔄 **Orientation** - Horizontal and vertical slider support
- ⚡ **Performance** - Optimized rendering and smooth animations

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```jsx
import { Slider } from '@dainabase/ui';

function App() {
  const [value, setValue] = useState([30]);
  
  return (
    <Slider
      value={value}
      onValueChange={setValue}
      max={100}
      step={1}
    />
  );
}
```

## Examples

### Range Slider

```jsx
function RangeSliderExample() {
  const [range, setRange] = useState([25, 75]);
  
  return (
    <div className="space-y-4">
      <Slider
        value={range}
        onValueChange={setRange}
        max={100}
        step={5}
        minStepsBetweenThumbs={1}
      />
      <div className="flex justify-between text-sm">
        <span>Min: {range[0]}</span>
        <span>Max: {range[1]}</span>
      </div>
    </div>
  );
}
```

### With Marks and Labels

```jsx
function MarkedSliderExample() {
  const marks = [
    { value: 0, label: '0°C' },
    { value: 25, label: '25°C' },
    { value: 50, label: '50°C' },
    { value: 75, label: '75°C' },
    { value: 100, label: '100°C' }
  ];
  
  return (
    <div className="py-8">
      <Slider
        defaultValue={[25]}
        max={100}
        step={5}
        marks={marks}
        className="w-full"
      />
    </div>
  );
}
```

### Vertical Slider

```jsx
function VerticalSliderExample() {
  const [value, setValue] = useState([60]);
  
  return (
    <div className="flex items-center space-x-8 h-64">
      <Slider
        value={value}
        onValueChange={setValue}
        orientation="vertical"
        max={100}
        step={1}
      />
      <div className="text-sm">
        <p>Volume: {value[0]}%</p>
      </div>
    </div>
  );
}
```

### Custom Styled Slider

```jsx
function CustomStyledExample() {
  return (
    <Slider
      defaultValue={[33]}
      max={100}
      step={1}
      className="w-full"
      trackClassName="bg-gradient-to-r from-blue-200 to-blue-400 h-2"
      rangeClassName="bg-gradient-to-r from-blue-500 to-blue-700"
      thumbClassName="w-6 h-6 bg-white border-4 border-blue-600 shadow-lg hover:scale-110 transition-transform"
    />
  );
}
```

### Multiple Thumbs

```jsx
function MultipleThumbsExample() {
  const [values, setValues] = useState([20, 50, 80]);
  
  return (
    <div className="space-y-4">
      <Slider
        value={values}
        onValueChange={setValues}
        max={100}
        step={1}
        thumbCount={3}
      />
      <div className="flex justify-around text-sm">
        <span>Low: {values[0]}</span>
        <span>Mid: {values[1]}</span>
        <span>High: {values[2]}</span>
      </div>
    </div>
  );
}
```

### With Input Field

```jsx
function SliderWithInputExample() {
  const [value, setValue] = useState([50]);
  
  const handleInputChange = (e) => {
    const newValue = parseInt(e.target.value) || 0;
    setValue([Math.min(100, Math.max(0, newValue))]);
  };
  
  return (
    <div className="flex items-center space-x-4">
      <Slider
        value={value}
        onValueChange={setValue}
        max={100}
        step={1}
        className="flex-1"
      />
      <input
        type="number"
        value={value[0]}
        onChange={handleInputChange}
        min="0"
        max="100"
        className="w-20 px-2 py-1 border rounded text-center"
      />
    </div>
  );
}
```

### Logarithmic Scale

```jsx
function LogarithmicSliderExample() {
  const [value, setValue] = useState([100]);
  
  // Convert linear slider value to logarithmic scale
  const logValue = (val) => {
    const minp = 0;
    const maxp = 100;
    const minv = Math.log(10);
    const maxv = Math.log(10000);
    const scale = (maxv - minv) / (maxp - minp);
    return Math.exp(minv + scale * (val - minp));
  };
  
  return (
    <div className="space-y-4">
      <Slider
        value={value}
        onValueChange={setValue}
        max={100}
        step={1}
      />
      <p className="text-sm text-center">
        Value: {Math.round(logValue(value[0]))} Hz
      </p>
    </div>
  );
}
```

### Color Picker Slider

```jsx
function ColorPickerExample() {
  const [hue, setHue] = useState([180]);
  const [saturation, setSaturation] = useState([100]);
  const [lightness, setLightness] = useState([50]);
  
  const color = `hsl(${hue[0]}, ${saturation[0]}%, ${lightness[0]}%)`;
  
  return (
    <div className="space-y-6">
      <div 
        className="w-full h-32 rounded-lg shadow-inner"
        style={{ backgroundColor: color }}
      />
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Hue: {hue[0]}°</label>
          <Slider
            value={hue}
            onValueChange={setHue}
            max={360}
            className="mt-2"
            trackClassName="bg-gradient-to-r from-red-500 via-green-500 to-blue-500"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Saturation: {saturation[0]}%</label>
          <Slider
            value={saturation}
            onValueChange={setSaturation}
            max={100}
            className="mt-2"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Lightness: {lightness[0]}%</label>
          <Slider
            value={lightness}
            onValueChange={setLightness}
            max={100}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
}
```

### Disabled and Read-Only States

```jsx
function StatesExample() {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-500">Disabled</label>
        <Slider
          defaultValue={[40]}
          disabled
          max={100}
          className="mt-2 opacity-50"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Read-Only</label>
        <Slider
          defaultValue={[60]}
          readOnly
          max={100}
          className="mt-2"
        />
      </div>
    </div>
  );
}
```

### Price Range Filter

```jsx
function PriceRangeExample() {
  const [priceRange, setPriceRange] = useState([100, 500]);
  const minPrice = 0;
  const maxPrice = 1000;
  
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Price Range</h3>
      
      <Slider
        value={priceRange}
        onValueChange={setPriceRange}
        min={minPrice}
        max={maxPrice}
        step={10}
        minStepsBetweenThumbs={1}
        className="mb-6"
      />
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Min:</span>
          <input
            type="number"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
            className="w-24 px-2 py-1 border rounded"
            min={minPrice}
            max={priceRange[1]}
          />
        </div>
        
        <span className="text-gray-400">—</span>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Max:</span>
          <input
            type="number"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-24 px-2 py-1 border rounded"
            min={priceRange[0]}
            max={maxPrice}
          />
        </div>
      </div>
      
      <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Apply Filter (${priceRange[0]} - ${priceRange[1]})
      </button>
    </div>
  );
}
```

## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number[]` | `undefined` | Controlled value(s) of the slider |
| `defaultValue` | `number[]` | `[0]` | Default value(s) for uncontrolled mode |
| `onValueChange` | `(value: number[]) => void` | `undefined` | Callback when value changes |
| `onValueCommit` | `(value: number[]) => void` | `undefined` | Callback when value change is committed |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `step` | `number` | `1` | Step increment value |
| `minStepsBetweenThumbs` | `number` | `0` | Minimum steps between multiple thumbs |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Slider orientation |
| `disabled` | `boolean` | `false` | Disable the slider |
| `readOnly` | `boolean` | `false` | Make slider read-only |
| `inverted` | `boolean` | `false` | Invert the slider direction |
| `marks` | `Array<{value: number, label?: string}>` | `[]` | Marks to display on the slider |
| `thumbCount` | `number` | `1` | Number of thumbs for multi-value selection |
| `showTooltip` | `boolean` | `false` | Show value tooltip on hover/focus |
| `tooltipFormat` | `(value: number) => string` | `undefined` | Custom tooltip formatter |
| `trackClassName` | `string` | `''` | CSS class for the track |
| `rangeClassName` | `string` | `''` | CSS class for the selected range |
| `thumbClassName` | `string` | `''` | CSS class for thumb(s) |
| `markClassName` | `string` | `''` | CSS class for marks |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `CSSProperties` | `undefined` | Inline styles |
| `name` | `string` | `undefined` | Form field name |
| `id` | `string` | `undefined` | Element ID |
| `aria-label` | `string` | `undefined` | Accessibility label |
| `aria-labelledby` | `string` | `undefined` | ID of labelling element |
| `aria-describedby` | `string` | `undefined` | ID of describing element |
| `aria-valuetext` | `string` | `undefined` | Text representation of value |

## Accessibility

The Slider component follows WCAG 2.1 Level AA guidelines:

- **Keyboard Navigation**: Arrow keys for value adjustment, Tab for focus
- **Screen Readers**: Proper ARIA attributes for value announcements
- **Focus Management**: Clear focus indicators on thumbs
- **Value Announcements**: Real-time value updates for screen readers
- **Orientation Support**: Correct ARIA orientation attribute
- **Range Support**: Proper multi-thumb accessibility
- **Label Association**: Support for aria-label and aria-labelledby
- **Value Text**: Custom value text for better context

```jsx
// Accessible implementation
<div role="group" aria-labelledby="volume-label">
  <label id="volume-label">
    Volume Control
  </label>
  <Slider
    value={[volume]}
    onValueChange={setVolume}
    max={100}
    aria-label="Volume"
    aria-valuetext={`${volume} percent`}
    aria-describedby="volume-help"
  />
  <span id="volume-help" className="sr-only">
    Use arrow keys to adjust volume
  </span>
</div>
```

## Best Practices

### Do's ✅

- **Do** provide clear labels for what the slider controls
- **Do** show the current value visually
- **Do** use appropriate step values for the context
- **Do** provide keyboard shortcuts for common values
- **Do** use marks for important values
- **Do** ensure sufficient color contrast
- **Do** provide alternative input methods when precision is needed
- **Do** test with assistive technologies

### Don'ts ❌

- **Don't** use sliders for discrete options (use Select or Radio instead)
- **Don't** make the slider too small for touch targets
- **Don't** use for very large ranges without input field alternative
- **Don't** hide important values or ranges
- **Don't** use similar colors for track and range
- **Don't** forget to handle edge cases (min/max values)
- **Don't** use for binary choices (use Switch instead)
- **Don't** make thumbs too small on mobile

## Use Cases

1. **Volume Controls**: Audio/video players, system settings
2. **Price Filters**: E-commerce price range selection
3. **Image Editing**: Brightness, contrast, saturation adjustments
4. **Settings**: Font size, zoom level, animation speed
5. **Data Visualization**: Timeline scrubbing, chart filtering
6. **Color Selection**: Hue, saturation, lightness controls
7. **Progress Tracking**: Project completion, skill levels
8. **Rating Systems**: Star ratings, satisfaction scores

## Related Components

- [Input](./input) - Numeric text input
- [Switch](./switch) - Binary on/off control
- [Select](./select) - Discrete option selection
- [Progress](./progress) - Read-only progress indicator
- [Radio Group](./radio-group) - Single choice selection
- [Rating](./rating) - Star rating component