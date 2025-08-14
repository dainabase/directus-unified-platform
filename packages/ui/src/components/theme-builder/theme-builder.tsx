import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Palette,
  Download,
  Upload,
  Copy,
  Check,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Sliders,
  Paintbrush,
  Type,
  Layout,
  Box,
  Sparkles,
  Code,
  Share2,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../button';
import { Card } from '../card';
import { Input } from '../input';
import { Label } from '../label';
import { Slider } from '../slider';
import { Switch } from '../switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';
import { Badge } from '../badge';
import { ScrollArea } from '../scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../accordion';
import { toast } from '../toast';

// Theme types
export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface Typography {
  fontFamily: string;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
    loose: string;
  };
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
  };
}

export interface Spacing {
  unit: number;
  scale: number[];
}

export interface BorderRadius {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

export interface Shadows {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

export interface Theme {
  name: string;
  description?: string;
  mode: 'light' | 'dark';
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
  customCSS?: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description?: string;
  theme: Theme;
  thumbnail?: string;
  tags?: string[];
}

export interface ThemeBuilderProps {
  initialTheme?: Theme;
  presets?: ThemePreset[];
  onThemeChange?: (theme: Theme) => void;
  onSave?: (theme: Theme) => void;
  onExport?: (theme: Theme, format: 'json' | 'css' | 'scss' | 'js') => void;
  onImport?: (theme: Theme) => void;
  onShare?: (theme: Theme) => void;
  showPreview?: boolean;
  showCode?: boolean;
  allowCustomCSS?: boolean;
  className?: string;
}

// Default theme
const DEFAULT_THEME: Theme = {
  name: 'Custom Theme',
  mode: 'light',
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#10B981',
    neutral: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    background: '#FFFFFF',
    foreground: '#111827',
    card: '#FFFFFF',
    cardForeground: '#111827',
    popover: '#FFFFFF',
    popoverForeground: '#111827',
    muted: '#F3F4F6',
    mutedForeground: '#6B7280',
    border: '#E5E7EB',
    input: '#E5E7EB',
    ring: '#3B82F6'
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2'
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em'
    }
  },
  spacing: {
    unit: 4,
    scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64]
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px'
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
  }
};

// Helper functions
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : { r: 0, g: 0, b: 0 };
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

const generateColorShades = (baseColor: string): Record<number, string> => {
  const rgb = hexToRgb(baseColor);
  const shades: Record<number, string> = {};
  
  const shadeFactors = {
    50: 0.95,
    100: 0.9,
    200: 0.8,
    300: 0.6,
    400: 0.4,
    500: 0,
    600: -0.1,
    700: -0.25,
    800: -0.4,
    900: -0.55,
    950: -0.7
  };
  
  Object.entries(shadeFactors).forEach(([shade, factor]) => {
    if (factor === 0) {
      shades[Number(shade)] = baseColor;
    } else if (factor > 0) {
      // Lighter
      const newR = Math.round(rgb.r + (255 - rgb.r) * factor);
      const newG = Math.round(rgb.g + (255 - rgb.g) * factor);
      const newB = Math.round(rgb.b + (255 - rgb.b) * factor);
      shades[Number(shade)] = rgbToHex(newR, newG, newB);
    } else {
      // Darker
      const newR = Math.round(rgb.r * (1 + factor));
      const newG = Math.round(rgb.g * (1 + factor));
      const newB = Math.round(rgb.b * (1 + factor));
      shades[Number(shade)] = rgbToHex(
        Math.max(0, newR),
        Math.max(0, newG),
        Math.max(0, newB)
      );
    }
  });
  
  return shades;
};

/**
 * Theme Builder Component
 * 
 * A comprehensive visual theme customization tool with live preview,
 * presets, and export capabilities.
 */
export const ThemeBuilder: React.FC<ThemeBuilderProps> = ({
  initialTheme = DEFAULT_THEME,
  presets = [],
  onThemeChange,
  onSave,
  onExport,
  onImport,
  onShare,
  showPreview = true,
  showCode = true,
  allowCustomCSS = true,
  className
}) => {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'effects' | 'custom'>('colors');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showLivePreview, setShowLivePreview] = useState(showPreview);
  const [showCodeView, setShowCodeView] = useState(false);
  const [codeFormat, setCodeFormat] = useState<'css' | 'scss' | 'js' | 'json'>('css');
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['primary']);

  // Update theme
  const updateTheme = useCallback((updates: Partial<Theme>) => {
    const newTheme = { ...theme, ...updates };
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  }, [theme, onThemeChange]);

  // Update color
  const updateColor = useCallback((colorKey: keyof ColorPalette, value: string) => {
    updateTheme({
      colors: {
        ...theme.colors,
        [colorKey]: value
      }
    });
  }, [theme, updateTheme]);

  // Update typography
  const updateTypography = useCallback((updates: Partial<Typography>) => {
    updateTheme({
      typography: {
        ...theme.typography,
        ...updates
      }
    });
  }, [theme, updateTheme]);

  // Apply preset
  const applyPreset = useCallback((presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setTheme(preset.theme);
      setSelectedPreset(presetId);
      onThemeChange?.(preset.theme);
    }
  }, [presets, onThemeChange]);

  // Generate CSS
  const generateCSS = useCallback((): string => {
    const css = `
:root {
  /* Colors */
  --primary: ${theme.colors.primary};
  --secondary: ${theme.colors.secondary};
  --accent: ${theme.colors.accent};
  --neutral: ${theme.colors.neutral};
  --success: ${theme.colors.success};
  --warning: ${theme.colors.warning};
  --error: ${theme.colors.error};
  --info: ${theme.colors.info};
  --background: ${theme.colors.background};
  --foreground: ${theme.colors.foreground};
  --card: ${theme.colors.card};
  --card-foreground: ${theme.colors.cardForeground};
  --popover: ${theme.colors.popover};
  --popover-foreground: ${theme.colors.popoverForeground};
  --muted: ${theme.colors.muted};
  --muted-foreground: ${theme.colors.mutedForeground};
  --border: ${theme.colors.border};
  --input: ${theme.colors.input};
  --ring: ${theme.colors.ring};
  
  /* Typography */
  --font-family: ${theme.typography.fontFamily};
  --font-size-xs: ${theme.typography.fontSize.xs};
  --font-size-sm: ${theme.typography.fontSize.sm};
  --font-size-base: ${theme.typography.fontSize.base};
  --font-size-lg: ${theme.typography.fontSize.lg};
  --font-size-xl: ${theme.typography.fontSize.xl};
  --font-size-2xl: ${theme.typography.fontSize['2xl']};
  --font-size-3xl: ${theme.typography.fontSize['3xl']};
  --font-size-4xl: ${theme.typography.fontSize['4xl']};
  
  /* Spacing */
  --spacing-unit: ${theme.spacing.unit}px;
  
  /* Border Radius */
  --radius-sm: ${theme.borderRadius.sm};
  --radius-base: ${theme.borderRadius.base};
  --radius-md: ${theme.borderRadius.md};
  --radius-lg: ${theme.borderRadius.lg};
  --radius-xl: ${theme.borderRadius.xl};
  
  /* Shadows */
  --shadow-sm: ${theme.shadows.sm};
  --shadow-base: ${theme.shadows.base};
  --shadow-md: ${theme.shadows.md};
  --shadow-lg: ${theme.shadows.lg};
  --shadow-xl: ${theme.shadows.xl};
}

${theme.customCSS || ''}
`;
    return css.trim();
  }, [theme]);

  // Generate JS object
  const generateJS = useCallback((): string => {
    return `export const theme = ${JSON.stringify(theme, null, 2)};`;
  }, [theme]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async () => {
    let content = '';
    
    switch (codeFormat) {
      case 'css':
      case 'scss':
        content = generateCSS();
        break;
      case 'js':
        content = generateJS();
        break;
      case 'json':
        content = JSON.stringify(theme, null, 2);
        break;
    }
    
    try {
      await navigator.clipboard.writeText(content);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
      toast({
        title: 'Copied to clipboard',
        description: 'Theme code has been copied to your clipboard.'
      });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [codeFormat, generateCSS, generateJS, theme]);

  // Export theme
  const handleExport = useCallback((format: 'json' | 'css' | 'scss' | 'js') => {
    onExport?.(theme, format);
  }, [theme, onExport]);

  // Import theme
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        try {
          const importedTheme = JSON.parse(text) as Theme;
          setTheme(importedTheme);
          onImport?.(importedTheme);
          toast({
            title: 'Theme imported',
            description: 'Your theme has been successfully imported.'
          });
        } catch (err) {
          console.error('Failed to import theme:', err);
          toast({
            title: 'Import failed',
            description: 'Invalid theme file format.',
            variant: 'destructive'
          });
        }
      }
    };
    
    input.click();
  }, [onImport]);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    const isDark = theme.mode === 'dark';
    const newColors = isDark ? {
      // Switch to light mode colors
      background: '#FFFFFF',
      foreground: '#111827',
      card: '#FFFFFF',
      cardForeground: '#111827',
      popover: '#FFFFFF',
      popoverForeground: '#111827',
      muted: '#F3F4F6',
      mutedForeground: '#6B7280',
      border: '#E5E7EB',
      input: '#E5E7EB'
    } : {
      // Switch to dark mode colors
      background: '#0F172A',
      foreground: '#F8FAFC',
      card: '#1E293B',
      cardForeground: '#F8FAFC',
      popover: '#1E293B',
      popoverForeground: '#F8FAFC',
      muted: '#334155',
      mutedForeground: '#94A3B8',
      border: '#334155',
      input: '#334155'
    };
    
    updateTheme({
      mode: isDark ? 'light' : 'dark',
      colors: {
        ...theme.colors,
        ...newColors
      }
    });
  }, [theme, updateTheme]);

  // Reset theme
  const resetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME);
    setSelectedPreset(null);
    onThemeChange?.(DEFAULT_THEME);
  }, [onThemeChange]);

  // Generate preview styles
  const previewStyles = useMemo(() => {
    return {
      '--primary': theme.colors.primary,
      '--secondary': theme.colors.secondary,
      '--accent': theme.colors.accent,
      '--background': theme.colors.background,
      '--foreground': theme.colors.foreground,
      '--border': theme.colors.border,
      '--muted': theme.colors.muted,
      fontFamily: theme.typography.fontFamily
    } as React.CSSProperties;
  }, [theme]);

  return (
    <div className={cn("flex h-full", className)}>
      {/* Editor Panel */}
      <div className="flex-1 border-r">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Theme Builder</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
              >
                {theme.mode === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={resetTheme}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              {onSave && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onSave(theme)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Theme
                </Button>
              )}
            </div>
          </div>
          
          {/* Theme Name */}
          <div className="flex items-center gap-3">
            <Input
              value={theme.name}
              onChange={(e) => updateTheme({ name: e.target.value })}
              placeholder="Theme name"
              className="max-w-xs"
            />
            
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleImport}
              >
                <Upload className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('json')}
              >
                <Download className="h-4 w-4" />
              </Button>
              
              {onShare && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onShare(theme)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Presets */}
        {presets.length > 0 && (
          <div className="p-4 border-b">
            <Label className="mb-2 block">Presets</Label>
            <div className="grid grid-cols-4 gap-2">
              {presets.map(preset => (
                <button
                  key={preset.id}
                  className={cn(
                    "p-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800",
                    selectedPreset === preset.id && "ring-2 ring-primary"
                  )}
                  onClick={() => applyPreset(preset.id)}
                >
                  {preset.thumbnail && (
                    <img
                      src={preset.thumbnail}
                      alt={preset.name}
                      className="w-full h-12 object-cover rounded mb-1"
                    />
                  )}
                  <div className="font-medium">{preset.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="colors" className="flex-1">
              <Paintbrush className="h-4 w-4 mr-2" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex-1">
              <Type className="h-4 w-4 mr-2" />
              Typography
            </TabsTrigger>
            <TabsTrigger value="spacing" className="flex-1">
              <Layout className="h-4 w-4 mr-2" />
              Spacing
            </TabsTrigger>
            <TabsTrigger value="effects" className="flex-1">
              <Sparkles className="h-4 w-4 mr-2" />
              Effects
            </TabsTrigger>
            {allowCustomCSS && (
              <TabsTrigger value="custom" className="flex-1">
                <Code className="h-4 w-4 mr-2" />
                Custom
              </TabsTrigger>
            )}
          </TabsList>
          
          <ScrollArea className="h-[calc(100vh-300px)]">
            {/* Colors Tab */}
            <TabsContent value="colors" className="p-4 space-y-4">
              <Accordion type="multiple" value={expandedSections}>
                {Object.entries(theme.colors).map(([key, value]) => (
                  <AccordionItem key={key} value={key}>
                    <AccordionTrigger
                      onClick={() => {
                        setExpandedSections(prev =>
                          prev.includes(key)
                            ? prev.filter(k => k !== key)
                            : [...prev, key]
                        );
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: value }}
                        />
                        <span className="capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-3">
                          <Input
                            type="color"
                            value={value}
                            onChange={(e) => updateColor(key as keyof ColorPalette, e.target.value)}
                            className="w-20 h-10"
                          />
                          <Input
                            type="text"
                            value={value}
                            onChange={(e) => updateColor(key as keyof ColorPalette, e.target.value)}
                            className="flex-1"
                          />
                        </div>
                        
                        {/* Color shades */}
                        <div className="grid grid-cols-11 gap-1">
                          {Object.entries(generateColorShades(value)).map(([shade, color]) => (
                            <div
                              key={shade}
                              className="text-center"
                            >
                              <div
                                className="w-full h-8 rounded cursor-pointer hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                onClick={() => updateColor(key as keyof ColorPalette, color)}
                              />
                              <span className="text-xs text-gray-500">{shade}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
            
            {/* Typography Tab */}
            <TabsContent value="typography" className="p-4 space-y-6">
              <div>
                <Label className="mb-2">Font Family</Label>
                <Input
                  value={theme.typography.fontFamily}
                  onChange={(e) => updateTypography({ fontFamily: e.target.value })}
                  placeholder="e.g., Inter, system-ui, sans-serif"
                />
              </div>
              
              <div>
                <Label className="mb-2">Font Sizes</Label>
                <div className="space-y-3">
                  {Object.entries(theme.typography.fontSize).map(([size, value]) => (
                    <div key={size} className="flex items-center gap-3">
                      <Label className="w-16 text-sm">{size}</Label>
                      <Input
                        value={value}
                        onChange={(e) => updateTypography({
                          fontSize: {
                            ...theme.typography.fontSize,
                            [size]: e.target.value
                          }
                        })}
                        className="flex-1"
                      />
                      <span
                        className="text-gray-600"
                        style={{ fontSize: value }}
                      >
                        Sample
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="mb-2">Font Weights</Label>
                <div className="space-y-3">
                  {Object.entries(theme.typography.fontWeight).map(([weight, value]) => (
                    <div key={weight} className="flex items-center gap-3">
                      <Label className="w-20 text-sm capitalize">{weight}</Label>
                      <Slider
                        value={[value]}
                        onValueChange={([v]) => updateTypography({
                          fontWeight: {
                            ...theme.typography.fontWeight,
                            [weight]: v
                          }
                        })}
                        min={100}
                        max={900}
                        step={100}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* Spacing Tab */}
            <TabsContent value="spacing" className="p-4 space-y-6">
              <div>
                <Label className="mb-2">Base Unit (px)</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[theme.spacing.unit]}
                    onValueChange={([v]) => updateTheme({
                      spacing: {
                        ...theme.spacing,
                        unit: v
                      }
                    })}
                    min={1}
                    max={8}
                    step={1}
                    className="flex-1"
                  />
                  <span className="w-12 text-sm">{theme.spacing.unit}px</span>
                </div>
              </div>
              
              <div>
                <Label className="mb-2">Spacing Scale</Label>
                <div className="grid grid-cols-6 gap-2">
                  {theme.spacing.scale.map((value, index) => (
                    <div key={index} className="text-center">
                      <div
                        className="w-full bg-primary rounded mb-1"
                        style={{ height: `${value * theme.spacing.unit}px` }}
                      />
                      <span className="text-xs text-gray-500">
                        {value} ({value * theme.spacing.unit}px)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* Effects Tab */}
            <TabsContent value="effects" className="p-4 space-y-6">
              <div>
                <Label className="mb-2">Border Radius</Label>
                <div className="space-y-3">
                  {Object.entries(theme.borderRadius).map(([size, value]) => (
                    <div key={size} className="flex items-center gap-3">
                      <Label className="w-16 text-sm">{size}</Label>
                      <Input
                        value={value}
                        onChange={(e) => updateTheme({
                          borderRadius: {
                            ...theme.borderRadius,
                            [size]: e.target.value
                          }
                        })}
                        className="flex-1"
                      />
                      <div
                        className="w-12 h-12 bg-primary"
                        style={{ borderRadius: value }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="mb-2">Shadows</Label>
                <div className="space-y-4">
                  {Object.entries(theme.shadows).map(([size, value]) => (
                    <div key={size} className="space-y-2">
                      <Label className="text-sm">{size}</Label>
                      <Input
                        value={value}
                        onChange={(e) => updateTheme({
                          shadows: {
                            ...theme.shadows,
                            [size]: e.target.value
                          }
                        })}
                        className="w-full"
                      />
                      <div
                        className="w-full h-16 bg-white rounded flex items-center justify-center"
                        style={{ boxShadow: value }}
                      >
                        <span className="text-sm text-gray-600">Preview</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* Custom CSS Tab */}
            {allowCustomCSS && (
              <TabsContent value="custom" className="p-4">
                <Label className="mb-2">Custom CSS</Label>
                <textarea
                  className="w-full h-96 p-3 font-mono text-sm border rounded-lg"
                  value={theme.customCSS || ''}
                  onChange={(e) => updateTheme({ customCSS: e.target.value })}
                  placeholder="/* Add your custom CSS here */"
                />
              </TabsContent>
            )}
          </ScrollArea>
        </Tabs>
      </div>
      
      {/* Preview Panel */}
      {showLivePreview && (
        <div className="w-96 bg-gray-50 dark:bg-gray-900">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Live Preview</h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCodeView(!showCodeView)}
              >
                <Code className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLivePreview(false)}
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {showCodeView ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <select
                  className="text-sm px-2 py-1 border rounded"
                  value={codeFormat}
                  onChange={(e) => setCodeFormat(e.target.value as any)}
                >
                  <option value="css">CSS</option>
                  <option value="scss">SCSS</option>
                  <option value="js">JavaScript</option>
                  <option value="json">JSON</option>
                </select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  {copiedToClipboard ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <pre className="p-3 bg-gray-900 text-gray-100 rounded-lg overflow-auto max-h-[600px] text-xs">
                <code>
                  {codeFormat === 'css' || codeFormat === 'scss'
                    ? generateCSS()
                    : codeFormat === 'js'
                    ? generateJS()
                    : JSON.stringify(theme, null, 2)}
                </code>
              </pre>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-80px)]">
              <div className="p-6" style={previewStyles}>
                {/* Preview Components */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Typography</h4>
                    <div className="space-y-2">
                      <h1 className="text-4xl font-bold">Heading 1</h1>
                      <h2 className="text-3xl font-semibold">Heading 2</h2>
                      <h3 className="text-2xl font-medium">Heading 3</h3>
                      <p className="text-base">
                        This is a paragraph of text demonstrating the base font size and regular weight.
                      </p>
                      <p className="text-sm text-gray-600">
                        Small text with muted color for secondary information.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Colors</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(theme.colors).slice(0, 8).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div
                            className="w-full h-16 rounded-lg mb-1"
                            style={{ backgroundColor: value }}
                          />
                          <span className="text-xs capitalize">
                            {key}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Components</h4>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Button variant="default">Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                      </div>
                      
                      <Card className="p-4">
                        <h5 className="font-medium mb-2">Card Title</h5>
                        <p className="text-sm text-gray-600">
                          This is a card component with some content inside.
                        </p>
                      </Card>
                      
                      <div className="flex gap-2">
                        <Badge>Default</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="outline">Outline</Badge>
                        <Badge variant="destructive">Destructive</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <Input placeholder="Input field" />
                        <div className="flex items-center gap-2">
                          <Switch />
                          <Label>Toggle switch</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
};

ThemeBuilder.displayName = 'ThemeBuilder';

export default ThemeBuilder;