import type { Meta, StoryObj } from '@storybook/react';
import { VirtualList } from './virtual-list';
import { useState } from 'react';

const meta = {
  title: 'Sprint3/VirtualList',
  component: VirtualList,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
VirtualList is a high-performance component for rendering large lists efficiently.
It uses virtualization to only render visible items, significantly improving performance
for lists with thousands of items.

## Features

- **Dynamic item heights**: Support for fixed or variable height items
- **Smooth scrolling**: Optimized for 60fps scrolling
- **Overscan**: Renders extra items outside viewport for smoother scrolling
- **Scroll to index**: Programmatically scroll to specific items
- **Minimal re-renders**: Optimized render cycle

## Use Cases

- Large data tables
- Infinite scroll feeds
- Chat message lists
- Log viewers
- File explorers
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    height: {
      control: { type: 'number', min: 100, max: 800, step: 50 },
      description: 'Container height in pixels'
    },
    itemHeight: {
      control: { type: 'number', min: 20, max: 200, step: 10 },
      description: 'Height of each item (can be function for variable heights)'
    },
    overscan: {
      control: { type: 'number', min: 0, max: 10, step: 1 },
      description: 'Number of items to render outside visible area'
    }
  }
} satisfies Meta<typeof VirtualList>;

export default meta;
type Story = StoryObj<typeof meta>;

// Generate large dataset
const generateItems = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Item ${i + 1}`,
    description: `Description for item ${i + 1}`,
    value: Math.floor(Math.random() * 1000)
  }));
};

export const Default: Story = {
  args: {
    items: generateItems(1000),
    height: 400,
    itemHeight: 60,
    overscan: 3,
    renderItem: (item: any) => (
      <div className="flex items-center justify-between p-3 border-b hover:bg-gray-50">
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-sm text-gray-500">{item.description}</div>
        </div>
        <div className="text-lg font-semibold">{item.value}</div>
      </div>
    )
  }
};

export const LargeList: Story = {
  args: {
    items: generateItems(10000),
    height: 600,
    itemHeight: 50,
    overscan: 5,
    renderItem: (item: any, index: number) => (
      <div className="flex items-center p-2 border-b">
        <span className="w-12 text-gray-400">#{index + 1}</span>
        <span className="flex-1">{item.name}</span>
        <span className="text-blue-600">{item.value}</span>
      </div>
    )
  }
};

export const VariableHeights: Story = {
  args: {
    items: generateItems(500),
    height: 500,
    itemHeight: (index: number) => 40 + (index % 3) * 30,
    overscan: 3,
    renderItem: (item: any, index: number) => {
      const height = 40 + (index % 3) * 30;
      return (
        <div 
          className="flex items-center p-2 border-b"
          style={{ height }}
        >
          <div className="flex-1">
            <div className="font-medium">{item.name}</div>
            {height > 40 && <div className="text-sm text-gray-500">{item.description}</div>}
            {height > 70 && <div className="text-xs text-gray-400">Extra content for tall items</div>}
          </div>
        </div>
      );
    }
  }
};

export const WithScrollToIndex: Story = {
  render: () => {
    const [scrollIndex, setScrollIndex] = useState<number | undefined>();
    const items = generateItems(1000);
    
    return (
      <div className="w-[600px]">
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setScrollIndex(0)}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Scroll to Top
          </button>
          <button
            onClick={() => setScrollIndex(Math.floor(items.length / 2))}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Scroll to Middle
          </button>
          <button
            onClick={() => setScrollIndex(items.length - 1)}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Scroll to End
          </button>
          <input
            type="number"
            placeholder="Index"
            className="px-2 py-1 border rounded"
            onChange={(e) => setScrollIndex(parseInt(e.target.value))}
          />
        </div>
        <VirtualList
          items={items}
          height={400}
          itemHeight={50}
          scrollToIndex={scrollIndex}
          renderItem={(item: any, index: number) => (
            <div className={`flex items-center p-2 border-b ${index === scrollIndex ? 'bg-blue-100' : ''}`}>
              <span className="w-16 text-gray-400">#{index}</span>
              <span className="flex-1">{item.name}</span>
              <span className="text-blue-600">{item.value}</span>
            </div>
          )}
        />
      </div>
    );
  }
};

export const ChatMessages: Story = {
  args: {
    items: Array.from({ length: 500 }, (_, i) => ({
      id: i,
      user: i % 2 === 0 ? 'You' : 'Assistant',
      message: `This is message ${i + 1}. ${i % 3 === 0 ? 'This is a longer message with more content to demonstrate variable heights in the virtual list.' : ''}`,
      timestamp: new Date(Date.now() - (500 - i) * 60000).toLocaleTimeString()
    })),
    height: 500,
    itemHeight: (index: number) => index % 3 === 0 ? 80 : 60,
    overscan: 3,
    renderItem: (item: any) => (
      <div className={`p-3 ${item.user === 'You' ? 'bg-blue-50' : 'bg-gray-50'}`}>
        <div className="flex justify-between items-start mb-1">
          <span className="font-medium">{item.user}</span>
          <span className="text-xs text-gray-500">{item.timestamp}</span>
        </div>
        <div className="text-sm">{item.message}</div>
      </div>
    )
  }
};

export const DataTable: Story = {
  args: {
    items: generateItems(5000),
    height: 600,
    itemHeight: 40,
    overscan: 5,
    className: 'border rounded-lg',
    renderItem: (item: any, index: number) => (
      <div className="grid grid-cols-4 items-center px-4 py-2 border-b hover:bg-gray-50">
        <span className="text-sm">{index + 1}</span>
        <span className="font-medium">{item.name}</span>
        <span className="text-sm text-gray-600">{item.description}</span>
        <span className="text-right font-mono">${item.value}</span>
      </div>
    )
  }
};