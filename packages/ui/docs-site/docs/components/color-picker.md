---
id: color-picker
title: ColorPicker
sidebar_position: 39
---

import { ColorPicker } from "@dainabase/ui";

A comprehensive color selection component with support for various color formats, alpha channel, presets, and advanced features like gradients and eyedropper tools.

## Preview

<ComponentPreview>
  <ColorPicker
    defaultValue="#3B82F6"
    onChange={(color) => console.log('Selected color:', color)}
  />
</ComponentPreview>

## Features

- 🎨 **Multiple Color Formats** - Support for HEX, RGB, HSL, HSV, and CSS color names
- 🔍 **Eyedropper Tool** - Pick colors directly from the screen (when supported)
- 🎯 **Advanced Color Wheel** - Intuitive hue and saturation selection
- 📊 **Alpha Channel Support** - Full transparency control with alpha slider
- 🎭 **Gradient Builder** - Create and edit linear/radial gradients
- 💾 **Color History** - Automatically saves recently used colors
- 🎪 **Preset Palettes** - Customizable color swatches for quick access
- ♿ **Accessible** - Full keyboard navigation and screen reader support
- 🌍 **Internationalization** - Support for multiple locales
- 📱 **Responsive** - Optimized for mobile and touch devices

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```tsx
import { ColorPicker } from "@dainabase/ui";
import { useState } from "react";

function ColorSelector() {
  const [color, setColor] = useState("#3B82F6");

  return (
    <ColorPicker
      value={color}
      onChange={setColor}
      label="Choose a color"
    />
  );
}
```

## Examples

### 1. Basic Color Picker

```tsx
import { ColorPicker } from "@dainabase/ui";

export default function BasicExample() {
  return (
    <div className="space-y-4">
      <ColorPicker
        defaultValue="#FF6B6B"
        label="Primary Color"
        description="Select your brand's primary color"
      />
    </div>
  );
}
```

### 2. With Alpha Channel

```tsx
import { ColorPicker } from "@dainabase/ui";
import { useState } from "react";

export default function AlphaExample() {
  const [color, setColor] = useState("rgba(59, 130, 246, 0.8)");

  return (
    <div className="space-y-4">
      <ColorPicker
        value={color}
        onChange={setColor}
        showAlpha={true}
        label="Background Color"
        description="Adjust color and transparency"
      />
      <div
        className="w-full h-32 rounded-lg border"
        style={{ backgroundColor: color }}
      >
        <p className="p-4 text-white">Preview with alpha</p>
      </div>
    </div>
  );
}
```

### 3. Custom Color Presets

```tsx
import { ColorPicker } from "@dainabase/ui";

const brandColors = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#FFA07A", // Light Salmon
  "#98D8C8", // Mint
  "#F7B731", // Yellow
  "#5F27CD", // Purple
  "#00D2D3", // Cyan
];

const materialColors = [
  "#F44336", // Red 500
  "#E91E63", // Pink 500
  "#9C27B0", // Purple 500
  "#673AB7", // Deep Purple 500
  "#3F51B5", // Indigo 500
  "#2196F3", // Blue 500
  "#03A9F4", // Light Blue 500
  "#00BCD4", // Cyan 500
];

export default function PresetsExample() {
  return (
    <div className="space-y-6">
      <ColorPicker
        defaultValue="#FF6B6B"
        presets={brandColors}
        label="Brand Color"
        presetLabel="Quick Select"
      />
      
      <ColorPicker
        defaultValue="#2196F3"
        presets={materialColors}
        label="Material Design Color"
        presetLabel="Material Palette"
      />
    </div>
  );
}
```

### 4. Multiple Format Support

```tsx
import { ColorPicker } from "@dainabase/ui";
import { useState } from "react";

export default function FormatsExample() {
  const [hex, setHex] = useState("#3B82F6");
  const [rgb, setRgb] = useState("rgb(59, 130, 246)");
  const [hsl, setHsl] = useState("hsl(217, 91%, 60%)");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ColorPicker
        value={hex}
        onChange={setHex}
        format="hex"
        label="HEX Format"
        showInput={true}
      />
      
      <ColorPicker
        value={rgb}
        onChange={setRgb}
        format="rgb"
        label="RGB Format"
        showInput={true}
      />
      
      <ColorPicker
        value={hsl}
        onChange={setHsl}
        format="hsl"
        label="HSL Format"
        showInput={true}
      />
    </div>
  );
}
```

### 5. Gradient Builder

```tsx
import { ColorPicker } from "@dainabase/ui";
import { useState } from "react";

export default function GradientExample() {
  const [gradient, setGradient] = useState(
    "linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
  );

  return (
    <div className="space-y-4">
      <ColorPicker
        value={gradient}
        onChange={setGradient}
        enableGradient={true}
        label="Gradient Builder"
        description="Create beautiful gradients"
      />
      
      <div
        className="w-full h-32 rounded-lg"
        style={{ background: gradient }}
      />
      
      <pre className="p-2 bg-gray-100 rounded text-sm">
        {gradient}
      </pre>
    </div>
  );
}
```

### 6. Eyedropper Tool

```tsx
import { ColorPicker } from "@dainabase/ui";
import { useState } from "react";

export default function EyedropperExample() {
  const [color, setColor] = useState("#000000");
  const [picked, setPicked] = useState(false);

  return (
    <div className="space-y-4">
      <ColorPicker
        value={color}
        onChange={(newColor) => {
          setColor(newColor);
          setPicked(true);
        }}
        showEyedropper={true}
        label="Pick from Screen"
        description="Use the eyedropper to select any color from your screen"
      />
      
      {picked && (
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-green-800">
            Color picked: <code className="font-mono">{color}</code>
          </p>
        </div>
      )}
    </div>
  );
}
```

### 7. Compact Mode

```tsx
import { ColorPicker } from "@dainabase/ui";

export default function CompactExample() {
  return (
    <div className="flex flex-wrap gap-4">
      <ColorPicker
        defaultValue="#FF6B6B"
        size="sm"
        variant="compact"
        label="Small"
      />
      
      <ColorPicker
        defaultValue="#4ECDC4"
        size="md"
        variant="compact"
        label="Medium"
      />
      
      <ColorPicker
        defaultValue="#45B7D1"
        size="lg"
        variant="compact"
        label="Large"
      />
    </div>
  );
}
```

### 8. Form Integration

```tsx
import { ColorPicker, Form, Button } from "@dainabase/ui";
import { useForm } from "react-hook-form";

export default function FormExample() {
  const form = useForm({
    defaultValues: {
      primaryColor: "#3B82F6",
      secondaryColor: "#10B981",
      accentColor: "#F59E0B",
    },
  });

  const onSubmit = (data: any) => {
    console.log("Theme colors:", data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Field
            control={form.control}
            name="primaryColor"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Primary Color</Form.Label>
                <Form.Control>
                  <ColorPicker {...field} />
                </Form.Control>
                <Form.Description>
                  Main brand color
                </Form.Description>
              </Form.Item>
            )}
          />
          
          <Form.Field
            control={form.control}
            name="secondaryColor"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Secondary Color</Form.Label>
                <Form.Control>
                  <ColorPicker {...field} />
                </Form.Control>
                <Form.Description>
                  Supporting color
                </Form.Description>
              </Form.Item>
            )}
          />
          
          <Form.Field
            control={form.control}
            name="accentColor"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Accent Color</Form.Label>
                <Form.Control>
                  <ColorPicker {...field} />
                </Form.Control>
                <Form.Description>
                  Highlight color
                </Form.Description>
              </Form.Item>
            )}
          />
        </div>
        
        <Button type="submit">Save Theme</Button>
      </form>
    </Form>
  );
}
```

### 9. Color History

```tsx
import { ColorPicker } from "@dainabase/ui";
import { useState } from "react";

export default function HistoryExample() {
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [currentColor, setCurrentColor] = useState("#3B82F6");

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    setRecentColors((prev) => {
      const updated = [color, ...prev.filter((c) => c !== color)];
      return updated.slice(0, 10); // Keep last 10 colors
    });
  };

  return (
    <div className="space-y-4">
      <ColorPicker
        value={currentColor}
        onChange={handleColorChange}
        recentColors={recentColors}
        label="Color with History"
        showRecentColors={true}
        maxRecentColors={10}
      />
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Color History:</p>
        <div className="flex gap-2 flex-wrap">
          {recentColors.map((color, index) => (
            <button
              key={index}
              className="w-8 h-8 rounded border-2 border-gray-300"
              style={{ backgroundColor: color }}
              onClick={() => setCurrentColor(color)}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 10. Disabled and Read-only States

```tsx
import { ColorPicker } from "@dainabase/ui";

export default function StatesExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ColorPicker
        defaultValue="#3B82F6"
        label="Normal"
        description="Interactive color picker"
      />
      
      <ColorPicker
        defaultValue="#EF4444"
        disabled={true}
        label="Disabled"
        description="Cannot be changed"
      />
      
      <ColorPicker
        defaultValue="#10B981"
        readOnly={true}
        label="Read-only"
        description="View only mode"
      />
    </div>
  );
}
```

## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `undefined` | Controlled color value |
| `defaultValue` | `string` | `"#000000"` | Default color value |
| `onChange` | `(color: string) => void` | `undefined` | Callback when color changes |
| `format` | `"hex" \| "rgb" \| "hsl" \| "hsv"` | `"hex"` | Output format for color value |
| `showAlpha` | `boolean` | `false` | Show alpha/transparency slider |
| `showInput` | `boolean` | `true` | Show text input for manual entry |
| `showEyedropper` | `boolean` | `false` | Show eyedropper tool (requires browser support) |
| `showRecentColors` | `boolean` | `false` | Show recently used colors |
| `recentColors` | `string[]` | `[]` | Array of recent color values |
| `maxRecentColors` | `number` | `8` | Maximum number of recent colors to display |
| `presets` | `string[]` | `[]` | Preset color swatches |
| `presetLabel` | `string` | `"Presets"` | Label for preset section |
| `enableGradient` | `boolean` | `false` | Enable gradient builder mode |
| `label` | `string` | `undefined` | Label for the color picker |
| `description` | `string` | `undefined` | Helper text description |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size of the color picker |
| `variant` | `"default" \| "compact" \| "popover"` | `"default"` | Display variant |
| `disabled` | `boolean` | `false` | Disable the color picker |
| `readOnly` | `boolean` | `false` | Make color picker read-only |
| `required` | `boolean` | `false` | Mark as required field |
| `error` | `string` | `undefined` | Error message to display |
| `className` | `string` | `undefined` | Additional CSS classes |
| `popoverPlacement` | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"` | Popover placement |
| `closeOnSelect` | `boolean` | `false` | Close popover on color selection |
| `colorSpace` | `"srgb" \| "display-p3" \| "rec2020"` | `"srgb"` | Color space for advanced color support |
| `onOpen` | `() => void` | `undefined` | Callback when picker opens |
| `onClose` | `() => void` | `undefined` | Callback when picker closes |

## Accessibility

The ColorPicker component follows WCAG 2.1 Level AA guidelines:

- **Keyboard Navigation**: Full keyboard support with Tab, Arrow keys, Enter, and Escape
- **Screen Readers**: Proper ARIA labels and announcements
- **Focus Management**: Clear focus indicators and proper focus trapping
- **Color Contrast**: Ensures selected colors meet contrast requirements
- **Alternative Input**: Text input alternative for users who cannot use visual picker

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate between elements |
| `Arrow Keys` | Navigate color spectrum |
| `Enter` | Select current color |
| `Escape` | Close color picker |
| `Space` | Toggle color picker (when focused on trigger) |
| `Home/End` | Jump to min/max values on sliders |

## Best Practices

### Do's ✅

- **Provide default values** for better UX
- **Use presets** for commonly used colors
- **Include labels** for better accessibility
- **Save recent colors** for user convenience
- **Use appropriate format** based on use case
- **Test color contrast** for accessibility
- **Provide text input** as alternative input method
- **Use compact mode** in space-constrained layouts

### Don'ts ❌

- **Don't hide labels** unless space is extremely limited
- **Don't disable text input** without good reason
- **Don't use too many presets** (8-12 is optimal)
- **Don't auto-close** on selection if user might want to fine-tune
- **Don't ignore alpha channel** for backgrounds/overlays
- **Don't use gradient mode** for simple color needs
- **Don't forget error states** in forms
- **Don't override browser eyedropper** when available

## Use Cases

1. **Theme Customization** - Brand colors, UI themes
2. **Design Tools** - Graphics editors, drawing apps
3. **Data Visualization** - Chart colors, heat maps
4. **Product Configuration** - Custom product colors
5. **Content Creation** - Text colors, backgrounds
6. **Form Inputs** - Settings, preferences
7. **Style Editors** - CSS editors, styling tools
8. **Accessibility Tools** - Contrast checkers
9. **Image Filters** - Color adjustments
10. **Gaming** - Character customization, team colors

## Performance Considerations

- **Lazy load** gradient builder if not immediately needed
- **Debounce** onChange callbacks for performance
- **Memoize** preset colors if computed
- **Use CSS variables** for dynamic theming
- **Virtualize** large color history lists

## Related Components

- [Input](./input) - For basic text input
- [Select](./select) - For predefined color options
- [Slider](./slider) - For individual channel control
- [Popover](./popover) - For custom picker placement
- [Form](./form) - For form integration
- [Button](./button) - For trigger elements