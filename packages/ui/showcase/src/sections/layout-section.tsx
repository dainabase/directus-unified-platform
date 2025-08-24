import React from 'react';
import { 
  Grid3x3, 
  Columns, 
  Layout, 
  Square,
  Maximize2,
  Minimize2
} from 'lucide-react';

export const LayoutSection = () => {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Layout Components
        </h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          18+ layout components including grids, containers, cards, and responsive structures.
        </p>
      </div>

      {/* Card Component Demo */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Card Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="w-full h-32 bg-gray-200 rounded mb-4"></div>
            <h4 className="font-semibold text-gray-900 mb-2">Basic Card</h4>
            <p className="text-gray-600 text-sm">Simple card with image and content.</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4">
            <div className="w-full h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded mb-4"></div>
            <h4 className="font-semibold text-gray-900 mb-2">Gradient Card</h4>
            <p className="text-gray-600 text-sm">Card with gradient background.</p>
          </div>
          
          <div className="bg-white border-2 border-purple-200 rounded-lg p-4 shadow-lg">
            <div className="w-full h-32 bg-purple-200 rounded mb-4"></div>
            <h4 className="font-semibold text-purple-900 mb-2">Elevated Card</h4>
            <p className="text-purple-700 text-sm">Card with shadow and border.</p>
          </div>
        </div>
      </div>

      {/* Grid System Demo */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Grid System</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12 bg-blue-100 p-2 text-center text-xs">12 cols</div>
          </div>
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-6 bg-blue-200 p-2 text-center text-xs">6 cols</div>
            <div className="col-span-6 bg-blue-200 p-2 text-center text-xs">6 cols</div>
          </div>
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-4 bg-blue-300 p-2 text-center text-xs">4 cols</div>
            <div className="col-span-4 bg-blue-300 p-2 text-center text-xs">4 cols</div>
            <div className="col-span-4 bg-blue-300 p-2 text-center text-xs">4 cols</div>
          </div>
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3 bg-blue-400 p-2 text-center text-xs text-white">3</div>
            <div className="col-span-3 bg-blue-400 p-2 text-center text-xs text-white">3</div>
            <div className="col-span-3 bg-blue-400 p-2 text-center text-xs text-white">3</div>
            <div className="col-span-3 bg-blue-400 p-2 text-center text-xs text-white">3</div>
          </div>
        </div>
      </div>

      {/* Container Demo */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Container Sizes</h3>
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded">
            <div className="max-w-sm mx-auto bg-blue-100 p-3 rounded text-center">
              Small Container (max-w-sm)
            </div>
          </div>
          <div className="bg-gray-100 p-4 rounded">
            <div className="max-w-md mx-auto bg-blue-200 p-3 rounded text-center">
              Medium Container (max-w-md)
            </div>
          </div>
          <div className="bg-gray-100 p-4 rounded">
            <div className="max-w-lg mx-auto bg-blue-300 p-3 rounded text-center">
              Large Container (max-w-lg)
            </div>
          </div>
          <div className="bg-gray-100 p-4 rounded">
            <div className="max-w-xl mx-auto bg-blue-400 p-3 rounded text-center text-white">
              Extra Large Container (max-w-xl)
            </div>
          </div>
        </div>
      </div>

      {/* Resizable Demo */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Resizable Panels</h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex h-64">
            <div className="w-1/3 bg-gray-100 p-4 border-r border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Left Panel</span>
                <Minimize2 className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">Resizable panel content</p>
            </div>
            <div className="flex-1 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Main Content</span>
                <Maximize2 className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">Main panel that adjusts to available space</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Area Demo */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Scroll Area</h3>
        <div className="border border-gray-200 rounded-lg h-48 overflow-y-auto">
          <div className="p-4 space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-700">Scrollable item {i + 1}</p>
                <p className="text-xs text-gray-500 mt-1">This is scrollable content that demonstrates the scroll area component.</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};