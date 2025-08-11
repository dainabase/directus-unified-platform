import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PDFViewer, PDFViewerRef } from './pdf-viewer';
import { action } from '@storybook/addon-actions';

// Mock PDF data
const MOCK_PDF_BASE64 = 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKNCAwIG9iago8PC9MZW5ndGggMzI0Ni9GaWx0ZXIvRmxhdGVEZWNvZGU+PgpzdHJlYW0K';

const meta = {
  title: 'Components/PDFViewer',
  component: PDFViewer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Advanced PDF viewer with annotations, search, bookmarks, and comprehensive navigation features.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    viewMode: {
      control: { type: 'select' },
      options: ['single', 'continuous', 'two-page'],
      description: 'Page viewing mode'
    },
    zoomMode: {
      control: { type: 'select' },
      options: ['auto', 'page-fit', 'page-width', 'custom'],
      description: 'Zoom mode'
    },
    theme: {
      control: { type: 'select' },
      options: ['light', 'dark', 'sepia'],
      description: 'Color theme'
    },
    toolMode: {
      control: { type: 'select' },
      options: ['select', 'hand', 'text', 'draw', 'highlight', 'comment'],
      description: 'Active tool mode'
    },
    defaultPage: {
      control: { type: 'number', min: 1 },
      description: 'Initial page to display'
    },
    defaultZoom: {
      control: { type: 'range', min: 0.5, max: 5, step: 0.1 },
      description: 'Initial zoom level'
    },
    defaultRotation: {
      control: { type: 'select' },
      options: [0, 90, 180, 270],
      description: 'Initial rotation in degrees'
    },
    minZoom: {
      control: { type: 'range', min: 0.1, max: 1, step: 0.1 },
      description: 'Minimum zoom level'
    },
    maxZoom: {
      control: { type: 'range', min: 1, max: 10, step: 0.5 },
      description: 'Maximum zoom level'
    },
    showToolbar: {
      control: { type: 'boolean' },
      description: 'Show toolbar'
    },
    showSidebar: {
      control: { type: 'boolean' },
      description: 'Show sidebar'
    },
    showThumbnails: {
      control: { type: 'boolean' },
      description: 'Show page thumbnails'
    },
    showOutline: {
      control: { type: 'boolean' },
      description: 'Show document outline'
    },
    showAnnotations: {
      control: { type: 'boolean' },
      description: 'Show annotations panel'
    },
    enableSearch: {
      control: { type: 'boolean' },
      description: 'Enable text search'
    },
    enablePrint: {
      control: { type: 'boolean' },
      description: 'Enable printing'
    },
    enableDownload: {
      control: { type: 'boolean' },
      description: 'Enable downloading'
    },
    enableRotation: {
      control: { type: 'boolean' },
      description: 'Enable page rotation'
    },
    enableZoom: {
      control: { type: 'boolean' },
      description: 'Enable zoom controls'
    },
    enableFullscreen: {
      control: { type: 'boolean' },
      description: 'Enable fullscreen mode'
    },
    enableAnnotations: {
      control: { type: 'boolean' },
      description: 'Enable annotations'
    },
    enableTextSelection: {
      control: { type: 'boolean' },
      description: 'Enable text selection'
    },
    enableNavigation: {
      control: { type: 'boolean' },
      description: 'Enable page navigation'
    },
    enableKeyboardShortcuts: {
      control: { type: 'boolean' },
      description: 'Enable keyboard shortcuts'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable all interactions'
    },
    readOnly: {
      control: { type: 'boolean' },
      description: 'Read-only mode'
    }
  }
} satisfies Meta<typeof PDFViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Stories
// ============================================================================

export const Default: Story = {
  args: {
    src: MOCK_PDF_BASE64,
    onPageChange: action('onPageChange'),
    onZoomChange: action('onZoomChange'),
    onRotationChange: action('onRotationChange'),
    onAnnotationAdd: action('onAnnotationAdd'),
    onAnnotationUpdate: action('onAnnotationUpdate'),
    onAnnotationDelete: action('onAnnotationDelete'),
    onBookmarkAdd: action('onBookmarkAdd'),
    onBookmarkDelete: action('onBookmarkDelete'),
    onSearch: action('onSearch'),
    onPrint: action('onPrint'),
    onDownload: action('onDownload'),
    onError: action('onError'),
    onLoad: action('onLoad')
  }
};

export const SinglePageView: Story = {
  name: 'Single Page View',
  args: {
    ...Default.args,
    viewMode: 'single',
    defaultPage: 3
  }
};

export const ContinuousScrollView: Story = {
  name: 'Continuous Scroll View',
  args: {
    ...Default.args,
    viewMode: 'continuous'
  },
  parameters: {
    docs: {
      description: {
        story: 'Continuous scrolling through all pages.'
      }
    }
  }
};

export const TwoPageView: Story = {
  name: 'Two Page View',
  args: {
    ...Default.args,
    viewMode: 'two-page'
  },
  parameters: {
    docs: {
      description: {
        story: 'Display two pages side by side, like a book.'
      }
    }
  }
};

export const DarkTheme: Story = {
  name: 'Dark Theme',
  args: {
    ...Default.args,
    theme: 'dark'
  }
};

export const SepiaTheme: Story = {
  name: 'Sepia Theme',
  args: {
    ...Default.args,
    theme: 'sepia'
  },
  parameters: {
    docs: {
      description: {
        story: 'Sepia theme for comfortable reading.'
      }
    }
  }
};

export const WithAnnotations: Story = {
  name: 'With Annotations',
  args: {
    ...Default.args,
    annotations: [
      {
        id: '1',
        type: 'highlight',
        page: 1,
        position: { x: 100, y: 100, width: 200, height: 30 },
        content: 'Important section',
        color: 'yellow',
        author: 'John Doe',
        timestamp: new Date()
      },
      {
        id: '2',
        type: 'text',
        page: 1,
        position: { x: 50, y: 200, width: 300, height: 50 },
        content: 'This needs review',
        author: 'Jane Smith',
        timestamp: new Date()
      },
      {
        id: '3',
        type: 'drawing',
        page: 2,
        position: { x: 150, y: 150, width: 100, height: 100 },
        content: JSON.stringify([{ x: 0, y: 0 }, { x: 100, y: 100 }]),
        color: 'red',
        author: 'Bob Johnson',
        timestamp: new Date()
      }
    ],
    showAnnotations: true,
    enableAnnotations: true
  }
};

export const WithBookmarks: Story = {
  name: 'With Bookmarks',
  args: {
    ...Default.args,
    bookmarks: [
      {
        id: '1',
        title: 'Chapter 1: Introduction',
        page: 1,
        level: 0,
        children: [
          { id: '1.1', title: 'Section 1.1: Overview', page: 2, level: 1 },
          { id: '1.2', title: 'Section 1.2: Background', page: 3, level: 1 }
        ]
      },
      {
        id: '2',
        title: 'Chapter 2: Main Content',
        page: 4,
        level: 0,
        children: [
          { id: '2.1', title: 'Section 2.1: Analysis', page: 5, level: 1 },
          { id: '2.2', title: 'Section 2.2: Results', page: 7, level: 1 }
        ]
      },
      {
        id: '3',
        title: 'Chapter 3: Conclusion',
        page: 9,
        level: 0
      }
    ],
    showOutline: true
  }
};

export const WithWatermark: Story = {
  name: 'With Watermark',
  args: {
    ...Default.args,
    watermark: {
      text: 'CONFIDENTIAL',
      opacity: 0.3,
      position: 'diagonal'
    }
  }
};

export const CustomZoomLevels: Story = {
  name: 'Custom Zoom Levels',
  args: {
    ...Default.args,
    defaultZoom: 1.5,
    minZoom: 0.25,
    maxZoom: 8,
    zoomStep: 0.5
  }
};

export const RotatedDocument: Story = {
  name: 'Rotated Document',
  args: {
    ...Default.args,
    defaultRotation: 90,
    rotationStep: 45
  }
};

export const NoToolbar: Story = {
  name: 'Without Toolbar',
  args: {
    ...Default.args,
    showToolbar: false
  }
};

export const NoSidebar: Story = {
  name: 'Without Sidebar',
  args: {
    ...Default.args,
    showSidebar: false
  }
};

export const MinimalUI: Story = {
  name: 'Minimal UI',
  args: {
    ...Default.args,
    showToolbar: false,
    showSidebar: false,
    enableKeyboardShortcuts: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal interface with keyboard shortcuts enabled for navigation.'
      }
    }
  }
};

export const ReadOnly: Story = {
  name: 'Read Only Mode',
  args: {
    ...Default.args,
    readOnly: true,
    enableAnnotations: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Read-only mode prevents adding or editing annotations.'
      }
    }
  }
};

export const Disabled: Story = {
  name: 'Disabled State',
  args: {
    ...Default.args,
    disabled: true
  }
};

export const SearchEnabled: Story = {
  name: 'Search Functionality',
  args: {
    ...Default.args,
    enableSearch: true,
    enableTextSelection: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Search for text within the PDF document. Press Ctrl+F to focus search.'
      }
    }
  }
};

export const DrawingMode: Story = {
  name: 'Drawing Mode',
  args: {
    ...Default.args,
    toolMode: 'draw',
    enableAnnotations: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Drawing mode allows freehand annotations on the PDF.'
      }
    }
  }
};

export const HighlightMode: Story = {
  name: 'Highlight Mode',
  args: {
    ...Default.args,
    toolMode: 'highlight',
    enableAnnotations: true,
    enableTextSelection: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Highlight text selections in the PDF.'
      }
    }
  }
};

export const CommentMode: Story = {
  name: 'Comment Mode',
  args: {
    ...Default.args,
    toolMode: 'comment',
    enableAnnotations: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Add text comments to specific locations in the PDF.'
      }
    }
  }
};

export const WithPassword: Story = {
  name: 'Password Protected',
  args: {
    ...Default.args,
    password: 'secret123'
  },
  parameters: {
    docs: {
      description: {
        story: 'Example of a password-protected PDF (mock implementation).'
      }
    }
  }
};

export const CustomToolbar: Story = {
  name: 'Custom Toolbar Items',
  args: {
    ...Default.args,
    customToolbarItems: (
      <div className="flex items-center gap-2 px-2">
        <button className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm">
          Custom Action
        </button>
        <button className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm">
          Another Action
        </button>
      </div>
    )
  }
};

export const WithRef: Story = {
  name: 'With Imperative Handle',
  render: () => {
    const viewerRef = React.useRef<PDFViewerRef>(null);

    const handleProgrammaticControl = () => {
      if (viewerRef.current) {
        // Navigate to page 5
        viewerRef.current.goToPage(5);
        
        // Zoom to 150%
        viewerRef.current.zoom(1.5);
        
        // Rotate 90 degrees
        viewerRef.current.rotate(90);
        
        // Add annotation
        viewerRef.current.addAnnotation({
          type: 'text',
          page: 5,
          position: { x: 100, y: 100, width: 200, height: 50 },
          content: 'Programmatically added',
          author: 'System'
        });
        
        // Search for text
        viewerRef.current.search('Lorem ipsum').then(results => {
          console.log('Search results:', results);
          action('Search results')(results);
        });
      }
    };

    const handleExport = () => {
      if (viewerRef.current) {
        const pageInfo = viewerRef.current.getPageInfo();
        console.log('Current page info:', pageInfo);
        action('Page info')(pageInfo);
        
        const annotations = viewerRef.current.getAnnotations();
        console.log('All annotations:', annotations);
        action('Annotations')(annotations);
      }
    };

    return (
      <div className="h-screen flex flex-col">
        <div className="flex gap-2 p-4 border-b bg-background">
          <button
            onClick={() => viewerRef.current?.firstPage()}
            className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            First Page
          </button>
          <button
            onClick={() => viewerRef.current?.previousPage()}
            className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Previous
          </button>
          <button
            onClick={() => viewerRef.current?.nextPage()}
            className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Next
          </button>
          <button
            onClick={() => viewerRef.current?.lastPage()}
            className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Last Page
          </button>
          <button
            onClick={() => viewerRef.current?.fitToPage()}
            className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Fit to Page
          </button>
          <button
            onClick={() => viewerRef.current?.fitToWidth()}
            className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Fit to Width
          </button>
          <button
            onClick={handleProgrammaticControl}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Apply Controls
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Get Info
          </button>
          <button
            onClick={() => viewerRef.current?.print()}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Print
          </button>
        </div>
        <PDFViewer
          ref={viewerRef}
          src={MOCK_PDF_BASE64}
          className="flex-1"
          onPageChange={action('onPageChange')}
          onZoomChange={action('onZoomChange')}
        />
      </div>
    );
  }
};

export const CompleteExample: Story = {
  name: 'Complete Example',
  args: {
    src: MOCK_PDF_BASE64,
    defaultPage: 1,
    defaultZoom: 1,
    defaultRotation: 0,
    viewMode: 'single',
    zoomMode: 'auto',
    theme: 'light',
    toolMode: 'select',
    minZoom: 0.5,
    maxZoom: 5,
    zoomStep: 0.25,
    rotationStep: 90,
    showToolbar: true,
    showSidebar: true,
    showThumbnails: true,
    showOutline: true,
    showAnnotations: true,
    enableSearch: true,
    enablePrint: true,
    enableDownload: true,
    enableRotation: true,
    enableZoom: true,
    enableFullscreen: true,
    enableAnnotations: true,
    enableTextSelection: true,
    enableNavigation: true,
    enableKeyboardShortcuts: true,
    annotations: [
      {
        id: 'ann-1',
        type: 'highlight',
        page: 1,
        position: { x: 100, y: 150, width: 250, height: 30 },
        content: 'Key point',
        color: 'yellow',
        author: 'User',
        timestamp: new Date()
      }
    ],
    bookmarks: [
      {
        id: 'bm-1',
        title: 'Introduction',
        page: 1,
        level: 0
      },
      {
        id: 'bm-2',
        title: 'Content',
        page: 3,
        level: 0
      }
    ],
    watermark: {
      text: 'SAMPLE',
      opacity: 0.2,
      position: 'center'
    },
    onPageChange: action('onPageChange'),
    onZoomChange: action('onZoomChange'),
    onRotationChange: action('onRotationChange'),
    onAnnotationAdd: action('onAnnotationAdd'),
    onAnnotationUpdate: action('onAnnotationUpdate'),
    onAnnotationDelete: action('onAnnotationDelete'),
    onBookmarkAdd: action('onBookmarkAdd'),
    onBookmarkDelete: action('onBookmarkDelete'),
    onSearch: action('onSearch'),
    onPrint: action('onPrint'),
    onDownload: action('onDownload'),
    onError: action('onError'),
    onLoad: action('onLoad')
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete PDF viewer with all features enabled and configured.'
      }
    }
  }
};

export const KeyboardShortcuts: Story = {
  name: 'Keyboard Shortcuts Demo',
  args: {
    ...Default.args,
    enableKeyboardShortcuts: true
  },
  parameters: {
    docs: {
      description: {
        story: `
Keyboard shortcuts enabled:
- **Arrow Keys**: Navigate pages
- **Home/End**: First/Last page
- **Ctrl/Cmd + P**: Print
- **Ctrl/Cmd + S**: Download
- **Ctrl/Cmd + F**: Search
- **Ctrl/Cmd + Plus/Minus**: Zoom in/out
- **Ctrl/Cmd + 0**: Reset zoom
- **R**: Rotate right
- **Shift + R**: Rotate left

Try these shortcuts while the component is focused.
        `
      }
    }
  }
};