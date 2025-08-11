import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ImageCropper, ImageCropperRef } from './image-cropper';
import { action } from '@storybook/addon-actions';

// Sample images for stories
const SAMPLE_IMAGES = {
  landscape: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzRhNWY3ZiIvPgogIDx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj44MDB4NjAwPC90ZXh0Pgo8L3N2Zz4=',
  portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iIzdhNGY3ZiIvPgogIDx0ZXh0IHg9IjMwMCIgeT0iNDAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj42MDB4ODAwPC90ZXh0Pgo8L3N2Zz4=',
  square: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzRhN2Y0YSIvPgogIDx0ZXh0IHg9IjMwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj42MDB4NjAwPC90ZXh0Pgo8L3N2Zz4=',
  gradient: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjY3ZWVhO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM3NjRiYTI7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNncmFkMSkiLz4KICA8dGV4dCB4PSI0MDAiIHk9IjMwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+R3JhZGllbnQgSW1hZ2U8L3RleHQ+Cjwvc3ZnPg=='
};

const meta = {
  title: 'Components/ImageCropper',
  component: ImageCropper,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Advanced image cropper with canvas-based editing, filters, transforms, and multiple export formats.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: { type: 'select' },
      options: Object.keys(SAMPLE_IMAGES),
      mapping: SAMPLE_IMAGES,
      description: 'Source image URL or data URI'
    },
    cropShape: {
      control: { type: 'select' },
      options: ['rect', 'circle', 'triangle', 'hexagon', 'star'],
      description: 'Shape of the crop area'
    },
    aspectRatio: {
      control: { type: 'select' },
      options: ['free', '16:9', '4:3', '1:1', '9:16', '3:4', 'custom'],
      description: 'Aspect ratio constraint'
    },
    quality: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      description: 'Export quality (0-1)'
    },
    maxZoom: {
      control: { type: 'range', min: 1, max: 10, step: 0.5 },
      description: 'Maximum zoom level'
    },
    minZoom: {
      control: { type: 'range', min: 0.1, max: 1, step: 0.1 },
      description: 'Minimum zoom level'
    },
    rotationStep: {
      control: { type: 'select' },
      options: [15, 30, 45, 90],
      description: 'Rotation step in degrees'
    },
    showGrid: {
      control: { type: 'boolean' },
      description: 'Show rule of thirds grid'
    },
    showPreview: {
      control: { type: 'boolean' },
      description: 'Show preview panel'
    },
    showToolbar: {
      control: { type: 'boolean' },
      description: 'Show toolbar'
    },
    showSidebar: {
      control: { type: 'boolean' },
      description: 'Show sidebar with controls'
    },
    enableTouch: {
      control: { type: 'boolean' },
      description: 'Enable touch gestures'
    },
    enableKeyboard: {
      control: { type: 'boolean' },
      description: 'Enable keyboard shortcuts'
    },
    enableHistory: {
      control: { type: 'boolean' },
      description: 'Enable undo/redo history'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable all interactions'
    },
    readOnly: {
      control: { type: 'boolean' },
      description: 'Read-only mode'
    },
    allowUpload: {
      control: { type: 'boolean' },
      description: 'Allow file upload'
    },
    autoSave: {
      control: { type: 'boolean' },
      description: 'Enable auto-save'
    }
  }
} satisfies Meta<typeof ImageCropper>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Stories
// ============================================================================

export const Default: Story = {
  args: {
    src: SAMPLE_IMAGES.landscape,
    onCropStart: action('onCropStart'),
    onCropChange: action('onCropChange'),
    onCropEnd: action('onCropEnd'),
    onTransformChange: action('onTransformChange'),
    onFilterChange: action('onFilterChange'),
    onSave: action('onSave'),
    onError: action('onError'),
    onImageLoad: action('onImageLoad')
  }
};

export const WithSquareAspectRatio: Story = {
  name: 'Square Aspect Ratio (1:1)',
  args: {
    ...Default.args,
    src: SAMPLE_IMAGES.landscape,
    aspectRatio: '1:1',
    defaultCrop: { x: 100, y: 50, width: 400, height: 400 }
  }
};

export const With16x9AspectRatio: Story = {
  name: 'Widescreen Aspect Ratio (16:9)',
  args: {
    ...Default.args,
    src: SAMPLE_IMAGES.portrait,
    aspectRatio: '16:9',
    defaultCrop: { x: 50, y: 100, width: 500, height: 281 }
  }
};

export const CircleCrop: Story = {
  name: 'Circle Crop Shape',
  args: {
    ...Default.args,
    src: SAMPLE_IMAGES.square,
    cropShape: 'circle',
    aspectRatio: '1:1',
    defaultCrop: { x: 100, y: 100, width: 400, height: 400 }
  }
};

export const TriangleCrop: Story = {
  name: 'Triangle Crop Shape',
  args: {
    ...Default.args,
    src: SAMPLE_IMAGES.gradient,
    cropShape: 'triangle',
    showGrid: false
  }
};

export const HexagonCrop: Story = {
  name: 'Hexagon Crop Shape',
  args: {
    ...Default.args,
    src: SAMPLE_IMAGES.square,
    cropShape: 'hexagon',
    aspectRatio: '1:1'
  }
};

export const StarCrop: Story = {
  name: 'Star Crop Shape',
  args: {
    ...Default.args,
    src: SAMPLE_IMAGES.gradient,
    cropShape: 'star',
    aspectRatio: '1:1'
  }
};

export const WithFilters: Story = {
  name: 'With Default Filters',
  args: {
    ...Default.args,
    src: SAMPLE_IMAGES.landscape,
    defaultFilters: [
      { type: 'brightness', value: 120 },
      { type: 'contrast', value: 110 },
      { type: 'saturate', value: 130 }
    ]
  }
};

export const WithTransform: Story = {
  name: 'With Default Transform',
  args: {
    ...Default.args,
    src: SAMPLE_IMAGES.portrait,
    defaultTransform: {
      rotation: 90,
      flipX: false,
      flipY: false,
      zoom: 1.2
    }
  }
};

export const NoToolbar: Story = {
  name: 'Without Toolbar',
  args: {
    ...Default.args,
    src: SAMPLE_IMAGES.landscape,
    showToolbar: false
  }
};

export const NoSidebar: Story = {
  name: 'Without Sidebar',
  args: {
    ...Default.args,
    src: SAMPLE_IMAGES.square,
    showSidebar: false
  }
};

export const MinimalUI: Story = {
  name: 'Minimal UI',
  args: {
    ...Default.args,
    src: SAMPLE_IMAGES.landscape,
    showToolbar: false,
    showSidebar: false,
    showGrid: false,
    showPreview: false
  }
};

export const ReadOnly: Story = {
  name: 'Read Only Mode',
  args: {
    ...Default.args,
    src: SAMPLE_IMAGES.gradient,
    readOnly: true,
    defaultCrop: { x: 100, y: 100, width: 400, height: 300 }
  },
  parameters: {
    docs: {
      description: {
        story: 'Read-only mode displays the image and crop area but disables all interactions.'
      }
    }
  }
};

export const Disabled: Story = {
  name: 'Disabled State',
  args: {
    ...Default.args,
    src: SAMPLE_IMAGES.square,
    disabled: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state shows the component with reduced opacity and no interactions.'
      }
    }
  }
};

export const WithWatermark: Story = {
  name: 'With Watermark',
  args: {
    ...Default.args,
    src: SAMPLE_IMAGES.landscape,
    watermark: {
      text: '© 2025 Sample Watermark',
      position: 'bottom-right',
      opacity: 0.7
    }
  }
};

export const AutoSaveEnabled: Story = {
  name: 'Auto Save Enabled',
  args: {
    ...Default.args,
    src: SAMPLE_IMAGES.gradient,
    autoSave: true,
    autoSaveInterval: 5000,
    onSave: action('Auto-save triggered')
  },
  parameters: {
    docs: {
      description: {
        story: 'Auto-save enabled with 5 second interval. Check the actions panel for save events.'
      }
    }
  }
};

export const CustomSizeConstraints: Story = {
  name: 'Custom Size Constraints',
  args: {
    ...Default.args,
    src: SAMPLE_IMAGES.landscape,
    minCropWidth: 100,
    minCropHeight: 100,
    defaultCrop: { x: 50, y: 50, width: 100, height: 100 }
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimum crop size set to 100x100 pixels.'
      }
    }
  }
};

export const NoImageUpload: Story = {
  name: 'Upload Image',
  args: {
    allowUpload: true,
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    onSave: action('onSave'),
    onError: action('onError')
  },
  parameters: {
    docs: {
      description: {
        story: 'Component without initial image, allowing user to upload their own.'
      }
    }
  }
};

export const WithRef: Story = {
  name: 'With Imperative Handle',
  render: () => {
    const cropperRef = React.useRef<ImageCropperRef>(null);

    const handleExport = async (format: 'jpeg' | 'png' | 'webp') => {
      if (cropperRef.current) {
        const result = await cropperRef.current.export(format);
        console.log('Exported:', result);
        action(`Exported as ${format}`)(result);
      }
    };

    const handleProgrammaticControl = () => {
      if (cropperRef.current) {
        // Rotate
        cropperRef.current.rotate(45);
        
        // Zoom
        cropperRef.current.zoom(1.5);
        
        // Apply filter
        cropperRef.current.applyFilter({ type: 'sepia', value: 50 });
        
        // Get state
        const state = cropperRef.current.getState();
        console.log('Current state:', state);
        action('Current state')(state);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => cropperRef.current?.undo()}
            className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Undo
          </button>
          <button
            onClick={() => cropperRef.current?.redo()}
            className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Redo
          </button>
          <button
            onClick={() => cropperRef.current?.reset()}
            className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Reset
          </button>
          <button
            onClick={handleProgrammaticControl}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Apply Transforms
          </button>
          <button
            onClick={() => handleExport('png')}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Export PNG
          </button>
        </div>
        <ImageCropper
          ref={cropperRef}
          src={SAMPLE_IMAGES.landscape}
          enableHistory={true}
          onSave={action('onSave')}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates using the imperative handle to control the cropper programmatically.'
      }
    }
  }
};

export const CompleteExample: Story = {
  name: 'Complete Example',
  args: {
    src: SAMPLE_IMAGES.gradient,
    cropShape: 'rect',
    aspectRatio: 'free',
    minCropWidth: 50,
    minCropHeight: 50,
    maxZoom: 5,
    minZoom: 0.1,
    zoomStep: 0.1,
    rotationStep: 90,
    quality: 0.92,
    showGrid: true,
    showPreview: true,
    showToolbar: true,
    showSidebar: true,
    enableTouch: true,
    enableKeyboard: true,
    enableHistory: true,
    maxHistorySize: 20,
    autoSave: false,
    allowUpload: true,
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxFileSize: 10 * 1024 * 1024,
    defaultCrop: { x: 100, y: 100, width: 400, height: 300 },
    defaultTransform: { rotation: 0, flipX: false, flipY: false, zoom: 1 },
    defaultFilters: [
      { type: 'brightness', value: 105 },
      { type: 'contrast', value: 102 }
    ],
    watermark: {
      text: 'Sample',
      position: 'bottom-right',
      opacity: 0.3
    },
    onCropStart: action('onCropStart'),
    onCropChange: action('onCropChange'),
    onCropEnd: action('onCropEnd'),
    onTransformChange: action('onTransformChange'),
    onFilterChange: action('onFilterChange'),
    onSave: action('onSave'),
    onError: action('onError'),
    onImageLoad: action('onImageLoad')
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete example with all features enabled and configured.'
      }
    }
  }
};

export const KeyboardShortcuts: Story = {
  name: 'Keyboard Shortcuts Demo',
  args: {
    ...Default.args,
    src: SAMPLE_IMAGES.landscape,
    enableKeyboard: true,
    enableHistory: true
  },
  parameters: {
    docs: {
      description: {
        story: `
Keyboard shortcuts enabled:
- **Ctrl/Cmd + Z**: Undo
- **Ctrl/Cmd + Shift + Z**: Redo  
- **Ctrl/Cmd + Y**: Redo
- **Ctrl/Cmd + S**: Save
- **Ctrl/Cmd + R**: Reset

Try these shortcuts while the component is focused.
        `
      }
    }
  }
};