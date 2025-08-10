import type { Meta, StoryObj } from "@storybook/react";
import { ColorPicker, PRESET_PALETTES } from "./color-picker";
import { useState } from "react";

const meta = {
  title: "Components/Forms/ColorPicker",
  component: ColorPicker,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A comprehensive color picker with multiple format support, preset palettes, and eyedropper functionality.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: "color",
      description: "Current color value",
    },
    format: {
      control: "select",
      options: ["hex", "rgb", "hsl", "hsv"],
      description: "Color format to use",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the color picker",
    },
    variant: {
      control: "select",
      options: ["default", "compact", "inline"],
      description: "Visual variant of the picker",
    },
    swatchShape: {
      control: "select",
      options: ["square", "circle"],
      description: "Shape of the color swatch",
    },
    presetPalette: {
      control: "select",
      options: Object.keys(PRESET_PALETTES),
      description: "Preset color palette to use",
    },
    showAlpha: {
      control: "boolean",
      description: "Show alpha channel control",
    },
    showEyeDropper: {
      control: "boolean",
      description: "Show eyedropper button",
    },
    showPresets: {
      control: "boolean",
      description: "Show preset colors",
    },
    copyToClipboard: {
      control: "boolean",
      description: "Enable copy to clipboard",
    },
    disabled: {
      control: "boolean",
      description: "Disable the color picker",
    },
  },
} satisfies Meta<typeof ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    value: "#3B82F6",
    label: "Choose a color",
    placeholder: "Select color",
  },
};

// Controlled component example
export const Controlled: Story = {
  render: (args) => {
    const [color, setColor] = useState("#10B981");
    
    return (
      <div className="space-y-4">
        <ColorPicker
          {...args}
          value={color}
          onChange={(value) => setColor(value)}
        />
        <div className="p-4 rounded border">
          <p className="text-sm text-muted-foreground mb-2">Selected Color:</p>
          <div className="flex items-center gap-2">
            <div 
              className="w-16 h-16 rounded border"
              style={{ backgroundColor: color }}
            />
            <code className="text-sm">{color}</code>
          </div>
        </div>
      </div>
    );
  },
  args: {
    label: "Primary Color",
  },
};

// Different formats
export const HexFormat: Story = {
  args: {
    value: "#FF6B6B",
    format: "hex",
    label: "HEX Color",
  },
};

export const RgbFormat: Story = {
  args: {
    value: "#4ECDC4",
    format: "rgb",
    label: "RGB Color",
  },
};

export const HslFormat: Story = {
  args: {
    value: "#A8E6CF",
    format: "hsl",
    label: "HSL Color",
  },
};

export const HsvFormat: Story = {
  args: {
    value: "#FFD3B6",
    format: "hsv",
    label: "HSV Color",
  },
};

// With alpha channel
export const WithAlpha: Story = {
  args: {
    value: "#6366F1",
    showAlpha: true,
    label: "Color with Alpha",
  },
};

// Size variants
export const SmallSize: Story = {
  args: {
    value: "#EC4899",
    size: "sm",
    label: "Small Size",
  },
};

export const MediumSize: Story = {
  args: {
    value: "#8B5CF6",
    size: "md",
    label: "Medium Size",
  },
};

export const LargeSize: Story = {
  args: {
    value: "#F59E0B",
    size: "lg",
    label: "Large Size",
  },
};

// Visual variants
export const CompactVariant: Story = {
  args: {
    value: "#059669",
    variant: "compact",
    label: "Compact Variant",
  },
};

export const InlineVariant: Story = {
  args: {
    value: "#DC2626",
    variant: "inline",
  },
};

// Swatch shapes
export const SquareSwatch: Story = {
  args: {
    value: "#7C3AED",
    swatchShape: "square",
    label: "Square Swatch",
  },
};

export const CircleSwatch: Story = {
  args: {
    value: "#0891B2",
    swatchShape: "circle",
    label: "Circle Swatch",
  },
};

// Preset palettes
export const DefaultPalette: Story = {
  args: {
    value: "#FF6B6B",
    presetPalette: "default",
    label: "Default Palette",
  },
};

export const MaterialPalette: Story = {
  args: {
    value: "#2196F3",
    presetPalette: "material",
    label: "Material Design Palette",
  },
};

export const TailwindPalette: Story = {
  args: {
    value: "#3B82F6",
    presetPalette: "tailwind",
    label: "Tailwind CSS Palette",
  },
};

export const GrayscalePalette: Story = {
  args: {
    value: "#6B7280",
    presetPalette: "grayscale",
    label: "Grayscale Palette",
  },
};

// Custom preset colors
export const CustomPresets: Story = {
  args: {
    value: "#FF0000",
    presetColors: [
      "#FF0000", "#00FF00", "#0000FF",
      "#FFFF00", "#FF00FF", "#00FFFF",
      "#800080", "#FFA500", "#008000",
      "#000080", "#800000", "#808000",
    ],
    label: "Custom Preset Colors",
  },
};

// Feature toggles
export const NoEyeDropper: Story = {
  args: {
    value: "#4B5563",
    showEyeDropper: false,
    label: "Without EyeDropper",
  },
};

export const NoPresets: Story = {
  args: {
    value: "#1F2937",
    showPresets: false,
    label: "Without Presets",
  },
};

export const NoCopyButton: Story = {
  args: {
    value: "#374151",
    copyToClipboard: false,
    label: "Without Copy Button",
  },
};

// States
export const Disabled: Story = {
  args: {
    value: "#9CA3AF",
    disabled: true,
    label: "Disabled State",
  },
};

// Complete example
export const CompleteExample: Story = {
  render: () => {
    const [colors, setColors] = useState({
      primary: "#3B82F6",
      secondary: "#10B981",
      accent: "#F59E0B",
      danger: "#EF4444",
    });

    return (
      <div className="space-y-6 p-6 border rounded-lg bg-background">
        <h3 className="text-lg font-semibold">Theme Colors</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <ColorPicker
            label="Primary Color"
            value={colors.primary}
            onChange={(value) => setColors(prev => ({ ...prev, primary: value }))}
            presetPalette="tailwind"
          />
          
          <ColorPicker
            label="Secondary Color"
            value={colors.secondary}
            onChange={(value) => setColors(prev => ({ ...prev, secondary: value }))}
            presetPalette="tailwind"
          />
          
          <ColorPicker
            label="Accent Color"
            value={colors.accent}
            onChange={(value) => setColors(prev => ({ ...prev, accent: value }))}
            presetPalette="tailwind"
          />
          
          <ColorPicker
            label="Danger Color"
            value={colors.danger}
            onChange={(value) => setColors(prev => ({ ...prev, danger: value }))}
            presetPalette="tailwind"
          />
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Preview</h4>
          <div className="flex gap-2">
            {Object.entries(colors).map(([name, color]) => (
              <div key={name} className="text-center">
                <div
                  className="w-20 h-20 rounded-lg border shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <p className="text-xs mt-1 capitalize">{name}</p>
                <code className="text-xs text-muted-foreground">{color}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

// Multiple formats example
export const MultipleFormats: Story = {
  render: () => {
    const [color, setColor] = useState("#6366F1");
    const [format, setFormat] = useState<"hex" | "rgb" | "hsl" | "hsv">("hex");

    return (
      <div className="space-y-4 p-6 border rounded-lg">
        <div className="flex gap-4">
          <ColorPicker
            label="Select Color"
            value={color}
            onChange={(value, fmt) => {
              setColor(value);
              setFormat(fmt);
            }}
            format={format}
            showAlpha={true}
            className="flex-1"
          />
          
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Output Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="w-full p-2 border rounded"
            >
              <option value="hex">HEX</option>
              <option value="rgb">RGB</option>
              <option value="hsl">HSL</option>
              <option value="hsv">HSV</option>
            </select>
          </div>
        </div>
        
        <div className="p-4 bg-muted rounded">
          <p className="text-sm font-medium mb-2">Current Value ({format.toUpperCase()}):</p>
          <code className="text-sm">{color}</code>
        </div>
      </div>
    );
  },
};
