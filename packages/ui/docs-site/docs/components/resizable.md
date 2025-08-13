---
id: resizable
title: Resizable
sidebar_position: 44
---

import { Resizable } from "@dainabase/ui";

A flexible resizable component for creating adjustable panels, split views, and resizable containers with smooth drag interactions and customizable constraints.

## Preview

<ComponentPreview>
  <Resizable
    defaultSize={{ width: 320, height: 200 }}
    minWidth={200}
    minHeight={100}
    maxWidth={500}
    maxHeight={400}
  >
    <div className="p-4 bg-blue-50 h-full">
      Drag the edges or corners to resize this panel
    </div>
  </Resizable>
</ComponentPreview>

## Features

- 📏 **Multi-directional Resizing** - Resize from any edge or corner
- 🎯 **Constraint Support** - Min/max width and height limits
- 📱 **Touch Support** - Works on mobile and tablet devices
- 🔄 **Controlled & Uncontrolled** - Flexible state management
- 📐 **Grid Snapping** - Optional snap-to-grid functionality
- 🎨 **Custom Handles** - Fully customizable resize handles
- 💾 **Persistence** - Save and restore sizes
- 🖼️ **Aspect Ratio** - Maintain aspect ratio while resizing
- ⚡ **Performance** - Optimized with RAF and throttling
- ♿ **Accessible** - Keyboard support for resizing

## Installation

```bash
npm install @dainabase/ui
```

## Basic Usage

```tsx
import { Resizable } from "@dainabase/ui";

function ResizablePanel() {
  return (
    <Resizable
      defaultSize={{ width: 300, height: 200 }}
      minWidth={100}
      maxWidth={600}
    >
      <div>Resizable content here</div>
    </Resizable>
  );
}
```

## Examples

### 1. Basic Resizable Panel

```tsx
import { Resizable } from "@dainabase/ui";
import { useState } from "react";

export default function BasicResizableExample() {
  const [size, setSize] = useState({ width: 320, height: 240 });

  return (
    <div className="p-8 bg-gray-50 min-h-[400px]">
      <Resizable
        size={size}
        onResize={setSize}
        minWidth={200}
        minHeight={150}
        maxWidth={600}
        maxHeight={400}
        className="border-2 border-blue-500 bg-white shadow-lg"
      >
        <div className="p-4 h-full flex flex-col">
          <h3 className="font-semibold mb-2">Resizable Panel</h3>
          <p className="text-sm text-gray-600 mb-4">
            Drag the edges or corners to resize
          </p>
          <div className="mt-auto text-xs text-gray-500">
            Size: {size.width}px × {size.height}px
          </div>
        </div>
      </Resizable>
    </div>
  );
}
```

### 2. Split View Layout

```tsx
import { Resizable } from "@dainabase/ui";
import { useState } from "react";

export default function SplitViewExample() {
  const [leftWidth, setLeftWidth] = useState(300);

  return (
    <div className="flex h-[500px] border rounded-lg overflow-hidden">
      <Resizable
        size={{ width: leftWidth, height: "100%" }}
        onResize={(size) => setLeftWidth(size.width)}
        minWidth={150}
        maxWidth={500}
        enable={{ right: true }}
        handleStyles={{
          right: {
            width: "4px",
            backgroundColor: "#E5E7EB",
            cursor: "col-resize",
            transition: "background-color 0.2s",
            "&:hover": {
              backgroundColor: "#9CA3AF"
            }
          }
        }}
      >
        <div className="h-full bg-gray-50 p-4">
          <h3 className="font-semibold mb-4">Sidebar</h3>
          <nav className="space-y-2">
            <a href="#" className="block p-2 hover:bg-gray-200 rounded">Dashboard</a>
            <a href="#" className="block p-2 hover:bg-gray-200 rounded">Projects</a>
            <a href="#" className="block p-2 hover:bg-gray-200 rounded">Tasks</a>
            <a href="#" className="block p-2 hover:bg-gray-200 rounded">Calendar</a>
            <a href="#" className="block p-2 hover:bg-gray-200 rounded">Settings</a>
          </nav>
          <div className="mt-auto pt-4 text-xs text-gray-500">
            Width: {leftWidth}px
          </div>
        </div>
      </Resizable>
      
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Main Content</h2>
        <p className="text-gray-600 mb-4">
          The sidebar on the left is resizable. Drag the divider to adjust the width.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded">Card 1</div>
          <div className="p-4 bg-green-50 rounded">Card 2</div>
          <div className="p-4 bg-yellow-50 rounded">Card 3</div>
          <div className="p-4 bg-purple-50 rounded">Card 4</div>
        </div>
      </div>
    </div>
  );
}
```

### 3. Grid Layout with Multiple Panels

```tsx
import { Resizable } from "@dainabase/ui";
import { useState } from "react";

export default function GridLayoutExample() {
  const [panels, setPanels] = useState([
    { id: 1, width: 250, height: 200 },
    { id: 2, width: 250, height: 200 },
    { id: 3, width: 250, height: 200 },
    { id: 4, width: 250, height: 200 }
  ]);

  const updatePanel = (id: number, size: { width: number; height: number }) => {
    setPanels(panels.map(p => p.id === id ? { ...p, ...size } : p));
  };

  return (
    <div className="p-8 bg-gray-100 min-h-[600px]">
      <div className="flex flex-wrap gap-4">
        {panels.map((panel) => (
          <Resizable
            key={panel.id}
            size={{ width: panel.width, height: panel.height }}
            onResize={(size) => updatePanel(panel.id, size)}
            minWidth={150}
            minHeight={100}
            maxWidth={400}
            maxHeight={300}
            className="bg-white rounded-lg shadow-md"
            handleStyles={{
              bottomRight: {
                cursor: "nwse-resize"
              }
            }}
          >
            <div className="p-4 h-full flex flex-col">
              <h4 className="font-semibold mb-2">Panel {panel.id}</h4>
              <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 rounded p-3">
                <p className="text-sm text-gray-600">
                  Resizable content area
                </p>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {panel.width} × {panel.height}
              </div>
            </div>
          </Resizable>
        ))}
      </div>
    </div>
  );
}
```

### 4. Aspect Ratio Locked

```tsx
import { Resizable } from "@dainabase/ui";
import { useState } from "react";

export default function AspectRatioExample() {
  const [size16x9, setSize16x9] = useState({ width: 640, height: 360 });
  const [size1x1, setSize1x1] = useState({ width: 300, height: 300 });
  const [size4x3, setSize4x3] = useState({ width: 400, height: 300 });

  return (
    <div className="space-y-8 p-8">
      <div>
        <h3 className="font-semibold mb-4">16:9 Aspect Ratio (Video)</h3>
        <Resizable
          size={size16x9}
          onResize={setSize16x9}
          lockAspectRatio={16/9}
          minWidth={320}
          maxWidth={800}
          className="bg-black rounded-lg overflow-hidden"
        >
          <div className="relative h-full">
            <video 
              className="w-full h-full object-cover"
              poster="/video-poster.jpg"
              controls
            />
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              16:9 - {size16x9.width}×{size16x9.height}
            </div>
          </div>
        </Resizable>
      </div>

      <div>
        <h3 className="font-semibold mb-4">1:1 Aspect Ratio (Square)</h3>
        <Resizable
          size={size1x1}
          onResize={setSize1x1}
          lockAspectRatio={1}
          minWidth={200}
          maxWidth={400}
          className="bg-gradient-to-br from-pink-400 to-purple-600 rounded-lg"
        >
          <div className="h-full flex items-center justify-center text-white">
            <div className="text-center">
              <div className="text-4xl mb-2">□</div>
              <div className="text-sm">{size1x1.width}×{size1x1.height}</div>
            </div>
          </div>
        </Resizable>
      </div>

      <div>
        <h3 className="font-semibold mb-4">4:3 Aspect Ratio (Classic)</h3>
        <Resizable
          size={size4x3}
          onResize={setSize4x3}
          lockAspectRatio={4/3}
          minWidth={320}
          maxWidth={640}
          className="border-2 border-gray-300 bg-white rounded"
        >
          <div className="h-full p-4 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl mb-2">📷</div>
              <div className="text-sm text-gray-600">
                4:3 Photo Frame
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {size4x3.width}×{size4x3.height}
              </div>
            </div>
          </div>
        </Resizable>
      </div>
    </div>
  );
}
```

### 5. Code Editor Layout

```tsx
import { Resizable } from "@dainabase/ui";
import { useState } from "react";

export default function CodeEditorExample() {
  const [fileExplorerWidth, setFileExplorerWidth] = useState(240);
  const [terminalHeight, setTerminalHeight] = useState(200);

  return (
    <div className="h-[600px] flex flex-col bg-gray-900 text-gray-100 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="h-10 bg-gray-800 flex items-center px-4 border-b border-gray-700">
        <span className="text-sm">MyProject - Visual Studio Code</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* File Explorer */}
        <Resizable
          size={{ width: fileExplorerWidth, height: "100%" }}
          onResize={(size) => setFileExplorerWidth(size.width)}
          minWidth={150}
          maxWidth={400}
          enable={{ right: true }}
          handleStyles={{
            right: {
              width: "2px",
              backgroundColor: "#374151",
              cursor: "col-resize"
            }
          }}
        >
          <div className="h-full bg-gray-800 p-3">
            <h4 className="text-xs uppercase text-gray-400 mb-3">Explorer</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 hover:bg-gray-700 p-1 rounded">
                <span>📁</span> src
              </div>
              <div className="ml-4 space-y-1">
                <div className="flex items-center gap-2 hover:bg-gray-700 p-1 rounded">
                  <span>📄</span> index.js
                </div>
                <div className="flex items-center gap-2 hover:bg-gray-700 p-1 rounded bg-gray-700">
                  <span>📄</span> App.tsx
                </div>
                <div className="flex items-center gap-2 hover:bg-gray-700 p-1 rounded">
                  <span>📄</span> styles.css
                </div>
              </div>
              <div className="flex items-center gap-2 hover:bg-gray-700 p-1 rounded">
                <span>📁</span> public
              </div>
              <div className="flex items-center gap-2 hover:bg-gray-700 p-1 rounded">
                <span>📄</span> package.json
              </div>
            </div>
          </div>
        </Resizable>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Code Editor */}
          <div className="flex-1 bg-gray-900 p-4 font-mono text-sm">
            <pre className="text-blue-400">
{`import React from 'react';
import { Resizable } from '@dainabase/ui';

function App() {
  return (
    <div className="app">
      <Resizable>
        <h1>Hello World</h1>
      </Resizable>
    </div>
  );
}

export default App;`}
            </pre>
          </div>

          {/* Terminal */}
          <Resizable
            size={{ width: "100%", height: terminalHeight }}
            onResize={(size) => setTerminalHeight(size.height)}
            minHeight={100}
            maxHeight={400}
            enable={{ top: true }}
            handleStyles={{
              top: {
                height: "2px",
                backgroundColor: "#374151",
                cursor: "row-resize"
              }
            }}
          >
            <div className="h-full bg-black p-3 font-mono text-xs">
              <div className="text-green-400">❯ npm run dev</div>
              <div className="text-gray-400 mt-1">
                <div>  VITE v4.4.5  ready in 423 ms</div>
                <div className="mt-1">  ➜  Local:   http://localhost:5173/</div>
                <div>  ➜  Network: use --host to expose</div>
                <div>  ➜  press h to show help</div>
              </div>
            </div>
          </Resizable>
        </div>
      </div>
    </div>
  );
}
```

### 6. Dashboard with Resizable Widgets

```tsx
import { Resizable } from "@dainabase/ui";
import { useState } from "react";

export default function DashboardWidgetsExample() {
  const [widgets, setWidgets] = useState([
    { id: "sales", width: 400, height: 250, title: "Sales Overview", color: "blue" },
    { id: "users", width: 300, height: 250, title: "Active Users", color: "green" },
    { id: "revenue", width: 350, height: 200, title: "Revenue", color: "purple" },
    { id: "tasks", width: 300, height: 300, title: "Tasks", color: "orange" }
  ]);

  const updateWidget = (id: string, size: { width: number; height: number }) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, ...size } : w));
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: "from-blue-400 to-blue-600",
      green: "from-green-400 to-green-600",
      purple: "from-purple-400 to-purple-600",
      orange: "from-orange-400 to-orange-600"
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Analytics Dashboard</h2>
      
      <div className="flex flex-wrap gap-4">
        {widgets.map((widget) => (
          <Resizable
            key={widget.id}
            size={{ width: widget.width, height: widget.height }}
            onResize={(size) => updateWidget(widget.id, size)}
            minWidth={250}
            minHeight={150}
            maxWidth={600}
            maxHeight={400}
            grid={[10, 10]}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="h-full flex flex-col">
              <div className={`h-2 bg-gradient-to-r ${getColorClasses(widget.color)}`} />
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-lg mb-3">{widget.title}</h3>
                <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-700 mb-1">
                      {Math.floor(Math.random() * 1000)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Sample Metric
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  {widget.width} × {widget.height}px
                </div>
              </div>
            </div>
          </Resizable>
        ))}
      </div>
    </div>
  );
}
```

### 7. Image Gallery with Resizable Preview

```tsx
import { Resizable } from "@dainabase/ui";
import { useState } from "react";

export default function ImageGalleryExample() {
  const [previewSize, setPreviewSize] = useState({ width: 600, height: 400 });
  const [selectedImage, setSelectedImage] = useState("/images/photo1.jpg");

  const images = [
    { id: 1, src: "/images/photo1.jpg", title: "Mountain Landscape" },
    { id: 2, src: "/images/photo2.jpg", title: "Ocean Sunset" },
    { id: 3, src: "/images/photo3.jpg", title: "City Skyline" },
    { id: 4, src: "/images/photo4.jpg", title: "Forest Path" }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Photo Gallery</h2>
        <p className="text-gray-600">Resize the preview window to see different sizes</p>
      </div>

      <div className="flex gap-6">
        {/* Thumbnail Grid */}
        <div className="w-48">
          <h3 className="font-semibold mb-3">Thumbnails</h3>
          <div className="grid grid-cols-2 gap-2">
            {images.map((image) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(image.src)}
                className={`aspect-square rounded overflow-hidden border-2 ${
                  selectedImage === image.src ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <img 
                  src={image.src} 
                  alt={image.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Resizable Preview */}
        <div className="flex-1">
          <Resizable
            size={previewSize}
            onResize={setPreviewSize}
            minWidth={300}
            minHeight={200}
            maxWidth={800}
            maxHeight={600}
            lockAspectRatio={false}
            className="border-2 border-gray-300 rounded-lg overflow-hidden bg-black"
          >
            <div className="relative h-full">
              <img 
                src={selectedImage}
                alt="Preview"
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {previewSize.width} × {previewSize.height}
              </div>
            </div>
          </Resizable>

          <div className="mt-4 flex gap-2">
            <button 
              onClick={() => setPreviewSize({ width: 400, height: 300 })}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              Small
            </button>
            <button 
              onClick={() => setPreviewSize({ width: 600, height: 400 })}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              Medium
            </button>
            <button 
              onClick={() => setPreviewSize({ width: 800, height: 600 })}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              Large
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 8. Resizable Modal/Dialog

```tsx
import { Resizable, Button } from "@dainabase/ui";
import { useState } from "react";

export default function ResizableModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalSize, setModalSize] = useState({ width: 500, height: 400 });

  return (
    <div className="p-8">
      <Button onClick={() => setIsOpen(true)}>
        Open Resizable Modal
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Resizable
            size={modalSize}
            onResize={setModalSize}
            minWidth={300}
            minHeight={200}
            maxWidth={window.innerWidth - 100}
            maxHeight={window.innerHeight - 100}
            className="bg-white rounded-lg shadow-2xl"
            bounds="parent"
          >
            <div className="h-full flex flex-col">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold">Resizable Modal</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 p-6 overflow-auto">
                <p className="mb-4">
                  This modal can be resized by dragging its edges or corners.
                  It has minimum and maximum size constraints.
                </p>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded">
                    <h3 className="font-semibold mb-1">Feature 1</h3>
                    <p className="text-sm text-gray-600">
                      Smooth resizing with real-time size updates
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <h3 className="font-semibold mb-1">Feature 2</h3>
                    <p className="text-sm text-gray-600">
                      Respects viewport boundaries
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded">
                    <h3 className="font-semibold mb-1">Feature 3</h3>
                    <p className="text-sm text-gray-600">
                      Maintains content layout during resize
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Size: {modalSize.width} × {modalSize.height}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsOpen(false)}>
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </Resizable>
        </div>
      )}
    </div>
  );
}
```

### 9. Nested Resizable Panels

```tsx
import { Resizable } from "@dainabase/ui";
import { useState } from "react";

export default function NestedResizableExample() {
  return (
    <div className="h-[600px] p-4 bg-gray-100">
      <Resizable
        defaultSize={{ width: "100%", height: "100%" }}
        className="bg-white rounded-lg shadow-lg"
        enable={{ bottom: true }}
      >
        <div className="h-full flex">
          {/* Left Panel */}
          <Resizable
            defaultSize={{ width: 300, height: "100%" }}
            minWidth={200}
            maxWidth={400}
            enable={{ right: true }}
            className="border-r"
          >
            <div className="h-full p-4 bg-blue-50">
              <h3 className="font-semibold mb-4">Left Panel</h3>
              
              {/* Nested Top */}
              <Resizable
                defaultSize={{ width: "100%", height: 200 }}
                minHeight={100}
                maxHeight={300}
                enable={{ bottom: true }}
                className="bg-white rounded p-3 mb-2"
              >
                <div>
                  <h4 className="font-medium mb-2">Nested Top</h4>
                  <p className="text-sm text-gray-600">
                    This panel is nested inside the left panel
                  </p>
                </div>
              </Resizable>

              {/* Nested Bottom */}
              <div className="bg-white rounded p-3">
                <h4 className="font-medium mb-2">Nested Bottom</h4>
                <p className="text-sm text-gray-600">
                  Fixed height content area
                </p>
              </div>
            </div>
          </Resizable>

          {/* Center Panel */}
          <div className="flex-1 flex flex-col">
            {/* Top Section */}
            <Resizable
              defaultSize={{ width: "100%", height: 250 }}
              minHeight={150}
              maxHeight={400}
              enable={{ bottom: true }}
              className="border-b"
            >
              <div className="h-full p-4">
                <h3 className="font-semibold mb-2">Center Top</h3>
                <div className="h-full bg-gradient-to-br from-green-50 to-blue-50 rounded p-4">
                  <p className="text-gray-600">
                    Main content area with resizable height
                  </p>
                </div>
              </div>
            </Resizable>

            {/* Bottom Section */}
            <div className="flex-1 p-4">
              <h3 className="font-semibold mb-2">Center Bottom</h3>
              <div className="h-full bg-gray-50 rounded p-4">
                <p className="text-gray-600">
                  This area expands to fill remaining space
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <Resizable
            defaultSize={{ width: 250, height: "100%" }}
            minWidth={150}
            maxWidth={350}
            enable={{ left: true }}
            className="border-l"
          >
            <div className="h-full p-4 bg-purple-50">
              <h3 className="font-semibold mb-4">Right Panel</h3>
              <div className="space-y-2">
                <div className="p-2 bg-white rounded">Item 1</div>
                <div className="p-2 bg-white rounded">Item 2</div>
                <div className="p-2 bg-white rounded">Item 3</div>
              </div>
            </div>
          </Resizable>
        </div>
      </Resizable>
    </div>
  );
}
```

### 10. Persisted Layout

```tsx
import { Resizable, Button } from "@dainabase/ui";
import { useState, useEffect } from "react";

export default function PersistedLayoutExample() {
  const STORAGE_KEY = "resizable-layout";
  
  const defaultLayout = {
    sidebar: { width: 250, height: "100%" },
    header: { width: "100%", height: 60 },
    main: { width: "100%", height: "100%" }
  };

  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultLayout;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }, [layout]);

  const resetLayout = () => {
    setLayout(defaultLayout);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateLayout = (panel: string, size: any) => {
    setLayout((prev: any) => ({
      ...prev,
      [panel]: size
    }));
  };

  return (
    <div className="h-[600px] flex flex-col bg-gray-100">
      {/* Header */}
      <Resizable
        size={layout.header}
        onResize={(size) => updateLayout("header", size)}
        minHeight={40}
        maxHeight={120}
        enable={{ bottom: true }}
        className="bg-white border-b shadow-sm"
      >
        <div className="h-full px-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Persisted Layout</h1>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={resetLayout}>
              Reset Layout
            </Button>
            <span className="text-sm text-gray-500">
              Layout saved automatically
            </span>
          </div>
        </div>
      </Resizable>

      {/* Body */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <Resizable
          size={layout.sidebar}
          onResize={(size) => updateLayout("sidebar", size)}
          minWidth={150}
          maxWidth={400}
          enable={{ right: true }}
          className="bg-gray-800 text-white"
        >
          <div className="h-full p-4">
            <h2 className="font-semibold mb-4">Sidebar</h2>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-gray-700 rounded">Menu Item 1</div>
              <div className="p-2 bg-gray-700 rounded">Menu Item 2</div>
              <div className="p-2 bg-gray-700 rounded">Menu Item 3</div>
            </div>
            <div className="mt-auto pt-4 text-xs text-gray-400">
              Width: {layout.sidebar.width}px
            </div>
          </div>
        </Resizable>

        {/* Main Content */}
        <div className="flex-1 p-6 bg-white">
          <h2 className="text-2xl font-bold mb-4">Main Content</h2>
          <p className="text-gray-600 mb-4">
            This layout persists across page refreshes. Resize any panel and 
            refresh the page - your layout will be restored!
          </p>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Current Layout:</h3>
            <pre className="text-xs bg-white p-2 rounded">
              {JSON.stringify(layout, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `{ width: number \| string, height: number \| string }` | `undefined` | Controlled size |
| `defaultSize` | `{ width: number \| string, height: number \| string }` | `{ width: "auto", height: "auto" }` | Default size |
| `onResize` | `(size: { width: number, height: number }) => void` | `undefined` | Resize callback |
| `onResizeStart` | `() => void` | `undefined` | Resize start callback |
| `onResizeStop` | `(size: { width: number, height: number }) => void` | `undefined` | Resize stop callback |
| `minWidth` | `number` | `10` | Minimum width |
| `minHeight` | `number` | `10` | Minimum height |
| `maxWidth` | `number` | `Infinity` | Maximum width |
| `maxHeight` | `number` | `Infinity` | Maximum height |
| `enable` | `{ top?: boolean, right?: boolean, bottom?: boolean, left?: boolean, topRight?: boolean, bottomRight?: boolean, bottomLeft?: boolean, topLeft?: boolean }` | `{ bottomRight: true }` | Enable specific resize handles |
| `handleStyles` | `object` | `{}` | Custom handle styles |
| `handleClasses` | `object` | `{}` | Custom handle classes |
| `handleComponent` | `object` | `{}` | Custom handle components |
| `grid` | `[number, number]` | `[1, 1]` | Grid snap size [x, y] |
| `lockAspectRatio` | `boolean \| number` | `false` | Lock aspect ratio |
| `bounds` | `"parent" \| "window" \| HTMLElement` | `undefined` | Boundary element |
| `className` | `string` | `undefined` | Additional CSS classes |
| `style` | `CSSProperties` | `{}` | Additional styles |
| `resizeRatio` | `number` | `1` | Resize speed ratio |
| `snapGap` | `number` | `0` | Snap to edge gap |
| `scale` | `number` | `1` | Transform scale |
| `as` | `string \| Component` | `"div"` | Wrapper element/component |

## Accessibility

The Resizable component follows WCAG 2.1 Level AA guidelines:

- **Keyboard Support**: Resize with arrow keys when focused
- **ARIA Labels**: Descriptive labels for resize handles
- **Focus Management**: Clear focus indicators on handles
- **Screen Readers**: Announces size changes

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Focus resize handles |
| `Arrow Keys` | Resize by 10px |
| `Shift + Arrow Keys` | Resize by 1px |
| `Ctrl + Arrow Keys` | Resize by 50px |
| `Escape` | Cancel resize operation |

## Best Practices

### Do's ✅

- **Set reasonable constraints** with min/max values
- **Use grid snapping** for aligned layouts
- **Persist layouts** for user preferences
- **Provide visual feedback** during resize
- **Test on touch devices** for mobile support
- **Use throttling** for resize callbacks
- **Consider performance** with many panels
- **Add resize indicators** on hover

### Don'ts ❌

- **Don't allow tiny sizes** that hide content
- **Don't forget boundaries** for modal/popups
- **Don't use excessive animations** during resize
- **Don't ignore mobile** viewport constraints
- **Don't nest too deeply** (performance)
- **Don't forget to save** user preferences
- **Don't make handles too small** to grab
- **Don't resize on every frame** without throttling

## Use Cases

1. **Split Views** - IDE-style layouts
2. **Dashboard Widgets** - Adjustable panels
3. **Image Editors** - Canvas and tool panels
4. **File Explorers** - Sidebar navigation
5. **Data Tables** - Column resizing
6. **Modal Dialogs** - Adjustable popups
7. **Video Players** - Resizable viewport
8. **Code Editors** - Multi-pane layouts
9. **Chat Applications** - Message and sidebar panels
10. **Form Builders** - Drag and resize fields

## Performance Considerations

- **Use RAF** for smooth animations
- **Throttle resize events** (16ms recommended)
- **Avoid complex calculations** in resize callbacks
- **Use CSS transforms** instead of width/height when possible
- **Implement virtual scrolling** for many resizable items
- **Debounce persistence** operations

## Related Components

- [ScrollArea](./scroll-area) - Scrollable containers
- [Collapsible](./collapsible) - Expandable sections
- [Sheet](./sheet) - Sliding panels
- [Dialog](./dialog) - Modal windows
- [Separator](./separator) - Visual dividers