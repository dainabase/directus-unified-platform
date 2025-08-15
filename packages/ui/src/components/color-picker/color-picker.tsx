"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import { Input } from "../input";
import { Button } from "../button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import { Label } from "../label";
import { Palette, Pipette, Copy, Check } from "lucide-react";

// Color format types
export type ColorFormat = "hex" | "rgb" | "hsl" | "hsv";
export type ColorValue = {
  hex: string;
  rgb: { r: number; g: number; b: number; a?: number };
  hsl: { h: number; s: number; l: number; a?: number };
  hsv: { h: number; s: number; v: number; a?: number };
};

// Preset color palettes
export const PRESET_PALETTES = {
  default: [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
    "#6C5CE7", "#A8E6CF", "#FFD3B6", "#FF8B94", "#C7CEEA"
  ],
  material: [
    "#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5",
    "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50"
  ],
  tailwind: [
    "#EF4444", "#F59E0B", "#84CC16", "#10B981", "#06B6D4",
    "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#F43F5E"
  ],
  grayscale: [
    "#000000", "#1F2937", "#374151", "#4B5563", "#6B7280",
    "#9CA3AF", "#D1D5DB", "#E5E7EB", "#F3F4F6", "#FFFFFF"
  ]
};

// Color conversion utilities
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

const rgbToHsv = (r: number, g: number, b: number): { h: number; s: number; v: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;

  let h = 0;
  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
};

const hsvToRgb = (h: number, s: number, v: number): { r: number; g: number; b: number } => {
  h /= 360;
  s /= 100;
  v /= 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r, g, b;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
    default: r = g = b = 0;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

// Component props
export interface ColorPickerProps {
  value?: string;
  onChange?: (value: string, format: ColorFormat) => void;
  format?: ColorFormat;
  showAlpha?: boolean;
  showEyeDropper?: boolean;
  showPresets?: boolean;
  presetColors?: string[];
  presetPalette?: keyof typeof PRESET_PALETTES;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "compact" | "inline";
  swatchShape?: "square" | "circle";
  copyToClipboard?: boolean;
}

// Main ColorPicker component
export const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  (
    {
      value = "#000000",
      onChange,
      format = "hex",
      showAlpha = false,
      showEyeDropper = true,
      showPresets = true,
      presetColors,
      presetPalette = "default",
      disabled = false,
      placeholder = "Select color",
      label,
      className,
      size = "md",
      variant = "default",
      swatchShape = "square",
      copyToClipboard = true,
    },
    ref
  ) => {
    const [currentColor, setCurrentColor] = React.useState(value);
    const [selectedFormat, setSelectedFormat] = React.useState<ColorFormat>(format);
    const [isOpen, setIsOpen] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const [alpha, setAlpha] = React.useState(100);

    // Convert current color to different formats
    const getColorFormats = React.useMemo(() => {
      const rgb = hexToRgb(currentColor);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

      return {
        hex: currentColor,
        rgb: showAlpha ? { ...rgb, a: alpha / 100 } : rgb,
        hsl: showAlpha ? { ...hsl, a: alpha / 100 } : hsl,
        hsv: showAlpha ? { ...hsv, a: alpha / 100 } : hsv,
      };
    }, [currentColor, alpha, showAlpha]);

    // Format display value
    const getDisplayValue = React.useMemo(() => {
      const formats = getColorFormats;
      switch (selectedFormat) {
        case "rgb":
          return showAlpha
            ? `rgba(${formats.rgb.r}, ${formats.rgb.g}, ${formats.rgb.b}, ${formats.rgb.a})`
            : `rgb(${formats.rgb.r}, ${formats.rgb.g}, ${formats.rgb.b})`;
        case "hsl":
          return showAlpha
            ? `hsla(${formats.hsl.h}, ${formats.hsl.s}%, ${formats.hsl.l}%, ${formats.hsl.a})`
            : `hsl(${formats.hsl.h}, ${formats.hsl.s}%, ${formats.hsl.l}%)`;
        case "hsv":
          return showAlpha
            ? `hsv(${formats.hsv.h}, ${formats.hsv.s}%, ${formats.hsv.v}%, ${formats.hsv.a})`
            : `hsv(${formats.hsv.h}, ${formats.hsv.s}%, ${formats.hsv.v}%)`;
        default:
          return formats.hex;
      }
    }, [selectedFormat, getColorFormats, showAlpha]);

    // Handle color change
    const handleColorChange = (newColor: string) => {
      setCurrentColor(newColor);
      onChange?.(newColor, selectedFormat);
    };

    // Handle preset color selection
    const handlePresetSelect = (color: string) => {
      handleColorChange(color);
      setIsOpen(false);
    };

    // Handle copy to clipboard
    const handleCopy = async () => {
      if (!copyToClipboard) return;
      
      try {
        await navigator.clipboard.writeText(getDisplayValue);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy color:", err);
      }
    };

    // Handle eyedropper
    const handleEyeDropper = async () => {
      if (!showEyeDropper || !("EyeDropper" in window)) return;

      try {
        // @ts-ignore - EyeDropper API is not yet in TypeScript
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        handleColorChange(result.sRGBHex);
      } catch (err) {
        console.error("EyeDropper failed:", err);
      }
    };

    // Get preset colors
    const presets = React.useMemo(() => {
      return presetColors || PRESET_PALETTES[presetPalette];
    }, [presetColors, presetPalette]);

    // Size classes
    const sizeClasses = {
      sm: "h-8 text-sm",
      md: "h-10 text-base",
      lg: "h-12 text-lg",
    };

    // Swatch classes
    const swatchClasses = cn(
      "shrink-0 border",
      swatchShape === "circle" ? "rounded-full" : "rounded",
      size === "sm" ? "w-6 h-6" : size === "lg" ? "w-10 h-10" : "w-8 h-8"
    );

    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        {label && (
          <Label className="text-sm font-medium">{label}</Label>
        )}

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-start gap-2",
                sizeClasses[size],
                variant === "compact" && "w-auto",
                variant === "inline" && "border-0 p-0 h-auto"
              )}
            >
              <div
                className={swatchClasses}
                style={{ backgroundColor: currentColor }}
              />
              {variant !== "inline" && (
                <span className="flex-1 text-left truncate">
                  {getDisplayValue}
                </span>
              )}
              {variant === "default" && <Palette className="h-4 w-4 opacity-50" />}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-80 p-3" align="start">
            <div className="space-y-3">
              {/* Color display and controls */}
              <div className="flex gap-2">
                <div
                  className="h-20 flex-1 rounded-md border"
                  style={{ backgroundColor: currentColor }}
                />
                <div className="space-y-2">
                  {showEyeDropper && "EyeDropper" in window && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEyeDropper}
                      className="w-full"
                    >
                      <Pipette className="h-4 w-4" />
                    </Button>
                  )}
                  {copyToClipboard && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopy}
                      className="w-full"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Format tabs */}
              <Tabs value={selectedFormat} onValueChange={(v) => setSelectedFormat(v as ColorFormat)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="hex">HEX</TabsTrigger>
                  <TabsTrigger value="rgb">RGB</TabsTrigger>
                  <TabsTrigger value="hsl">HSL</TabsTrigger>
                  <TabsTrigger value="hsv">HSV</TabsTrigger>
                </TabsList>

                <TabsContent value="hex" className="space-y-2">
                  <Input
                    value={currentColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    placeholder="#000000"
                  />
                </TabsContent>

                <TabsContent value="rgb" className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">R</Label>
                      <Input
                        type="number"
                        min="0"
                        max="255"
                        value={getColorFormats.rgb.r}
                        onChange={(e) => {
                          const r = parseInt(e.target.value) || 0;
                          const hex = rgbToHex(r, getColorFormats.rgb.g, getColorFormats.rgb.b);
                          handleColorChange(hex);
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">G</Label>
                      <Input
                        type="number"
                        min="0"
                        max="255"
                        value={getColorFormats.rgb.g}
                        onChange={(e) => {
                          const g = parseInt(e.target.value) || 0;
                          const hex = rgbToHex(getColorFormats.rgb.r, g, getColorFormats.rgb.b);
                          handleColorChange(hex);
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">B</Label>
                      <Input
                        type="number"
                        min="0"
                        max="255"
                        value={getColorFormats.rgb.b}
                        onChange={(e) => {
                          const b = parseInt(e.target.value) || 0;
                          const hex = rgbToHex(getColorFormats.rgb.r, getColorFormats.rgb.g, b);
                          handleColorChange(hex);
                        }}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="hsl" className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">H</Label>
                      <Input
                        type="number"
                        min="0"
                        max="360"
                        value={getColorFormats.hsl.h}
                        onChange={(e) => {
                          const h = parseInt(e.target.value) || 0;
                          const rgb = hslToRgb(h, getColorFormats.hsl.s, getColorFormats.hsl.l);
                          const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                          handleColorChange(hex);
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">S</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={getColorFormats.hsl.s}
                        onChange={(e) => {
                          const s = parseInt(e.target.value) || 0;
                          const rgb = hslToRgb(getColorFormats.hsl.h, s, getColorFormats.hsl.l);
                          const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                          handleColorChange(hex);
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">L</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={getColorFormats.hsl.l}
                        onChange={(e) => {
                          const l = parseInt(e.target.value) || 0;
                          const rgb = hslToRgb(getColorFormats.hsl.h, getColorFormats.hsl.s, l);
                          const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                          handleColorChange(hex);
                        }}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="hsv" className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">H</Label>
                      <Input
                        type="number"
                        min="0"
                        max="360"
                        value={getColorFormats.hsv.h}
                        onChange={(e) => {
                          const h = parseInt(e.target.value) || 0;
                          const rgb = hsvToRgb(h, getColorFormats.hsv.s, getColorFormats.hsv.v);
                          const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                          handleColorChange(hex);
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">S</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={getColorFormats.hsv.s}
                        onChange={(e) => {
                          const s = parseInt(e.target.value) || 0;
                          const rgb = hsvToRgb(getColorFormats.hsv.h, s, getColorFormats.hsv.v);
                          const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                          handleColorChange(hex);
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">V</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={getColorFormats.hsv.v}
                        onChange={(e) => {
                          const v = parseInt(e.target.value) || 0;
                          const rgb = hsvToRgb(getColorFormats.hsv.h, getColorFormats.hsv.s, v);
                          const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                          handleColorChange(hex);
                        }}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Alpha slider */}
              {showAlpha && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Alpha</Label>
                    <span className="text-xs text-muted-foreground">{alpha}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={alpha}
                    onChange={(e) => setAlpha(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}

              {/* Preset colors */}
              {showPresets && (
                <div className="space-y-2">
                  <Label className="text-xs">Presets</Label>
                  <div className="grid grid-cols-10 gap-1">
                    {presets.map((color, i) => (
                      <button
                        key={i}
                        className={cn(
                          "w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform",
                          swatchShape === "circle" && "rounded-full"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => handlePresetSelect(color)}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

ColorPicker.displayName = "ColorPicker";

export default ColorPicker;
