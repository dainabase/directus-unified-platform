import type { Meta, StoryObj } from '@storybook/react';
import { DragDropGrid } from './drag-drop-grid';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

const meta = {
  title: 'Components/DragDropGrid',
  component: DragDropGrid,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An interactive grid component with drag and drop functionality for reordering items.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Number of columns in the grid',
    },
    gap: {
      control: { type: 'number', min: 0, max: 50 },
      description: 'Gap between grid items in pixels',
    },
    animationDuration: {
      control: { type: 'number', min: 0, max: 1000 },
      description: 'Duration of reorder animation in milliseconds',
    },
    showDragHandle: {
      control: 'boolean',
      description: 'Show drag handle on items',
    },
    autoScroll: {
      control: 'boolean',
      description: 'Enable auto-scroll when dragging near edges',
    },
    allowKeyboardNavigation: {
      control: 'boolean',
      description: 'Enable keyboard navigation and reordering',
    },
    lockAxis: {
      control: { type: 'select' },
      options: [null, 'x', 'y'],
      description: 'Lock dragging to a specific axis',
    },
  },
} satisfies Meta<typeof DragDropGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper component for interactive examples
const InteractiveDragDropGrid = (props: any) => {
  const [items, setItems] = useState(props.items);
  const [lastAction, setLastAction] = useState<string>('');

  const handleReorder = (reorderedItems: any[]) => {
    setItems(reorderedItems);
    setLastAction(`Reordered: ${reorderedItems.map(item => item.id).join(', ')}`);
  };

  const handleDragStart = (item: any) => {
    setLastAction(`Started dragging: ${item.id}`);
  };

  const handleDragEnd = (item: any) => {
    setLastAction(`Finished dragging: ${item.id}`);
  };

  return (
    <div className="w-full max-w-4xl space-y-4">
      {lastAction && (
        <div className="p-2 bg-blue-50 text-blue-700 rounded text-sm">
          {lastAction}
        </div>
      )}
      <DragDropGrid
        {...props}
        items={items}
        onReorder={handleReorder}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => (
    <InteractiveDragDropGrid
      {...args}
      items={[
        { id: '1', content: <div className="p-4 bg-white rounded shadow">Item 1</div> },
        { id: '2', content: <div className="p-4 bg-white rounded shadow">Item 2</div> },
        { id: '3', content: <div className="p-4 bg-white rounded shadow">Item 3</div> },
        { id: '4', content: <div className="p-4 bg-white rounded shadow">Item 4</div> },
        { id: '5', content: <div className="p-4 bg-white rounded shadow">Item 5</div> },
        { id: '6', content: <div className="p-4 bg-white rounded shadow">Item 6</div> },
      ]}
    />
  ),
  args: {
    columns: 3,
    gap: 16,
    showDragHandle: true,
    animationDuration: 200,
  },
};

export const CardGrid: Story = {
  render: () => {
    const [cards, setCards] = useState([
      {
        id: 'card-1',
        content: (
          <Card>
            <CardHeader>
              <CardTitle>Project Alpha</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Due: Tomorrow</p>
              <div className="mt-2 flex gap-1">
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">High Priority</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Design</span>
              </div>
            </CardContent>
          </Card>
        ),
      },
      {
        id: 'card-2',
        content: (
          <Card>
            <CardHeader>
              <CardTitle>Feature Beta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Due: Next Week</p>
              <div className="mt-2 flex gap-1">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">Medium</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Backend</span>
              </div>
            </CardContent>
          </Card>
        ),
      },
      {
        id: 'card-3',
        content: (
          <Card>
            <CardHeader>
              <CardTitle>Bug Fix</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Due: Today</p>
              <div className="mt-2 flex gap-1">
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">Critical</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">Frontend</span>
              </div>
            </CardContent>
          </Card>
        ),
      },
      {
        id: 'card-4',
        content: (
          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Due: End of Month</p>
              <div className="mt-2 flex gap-1">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Low</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Docs</span>
              </div>
            </CardContent>
          </Card>
        ),
      },
    ]);

    return (
      <div className="w-full max-w-5xl">
        <h3 className="text-lg font-semibold mb-4">Project Board</h3>
        <DragDropGrid
          items={cards}
          columns={2}
          gap={20}
          onReorder={setCards}
          className="min-h-[400px]"
          showDragHandle={true}
        />
      </div>
    );
  },
};

export const ImageGallery: Story = {
  render: () => {
    const [images, setImages] = useState([
      {
        id: 'img-1',
        content: (
          <div className="relative group">
            <div className="aspect-square bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg overflow-hidden">
              <div className="flex items-center justify-center h-full text-white text-2xl font-bold">1</div>
            </div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">Image 1</span>
            </div>
          </div>
        ),
      },
      {
        id: 'img-2',
        content: (
          <div className="relative group">
            <div className="aspect-square bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg overflow-hidden">
              <div className="flex items-center justify-center h-full text-white text-2xl font-bold">2</div>
            </div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">Image 2</span>
            </div>
          </div>
        ),
      },
      {
        id: 'img-3',
        content: (
          <div className="relative group">
            <div className="aspect-square bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg overflow-hidden">
              <div className="flex items-center justify-center h-full text-white text-2xl font-bold">3</div>
            </div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">Image 3</span>
            </div>
          </div>
        ),
      },
      {
        id: 'img-4',
        content: (
          <div className="relative group">
            <div className="aspect-square bg-gradient-to-br from-orange-400 to-red-400 rounded-lg overflow-hidden">
              <div className="flex items-center justify-center h-full text-white text-2xl font-bold">4</div>
            </div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">Image 4</span>
            </div>
          </div>
        ),
      },
      {
        id: 'img-5',
        content: (
          <div className="relative group">
            <div className="aspect-square bg-gradient-to-br from-indigo-400 to-purple-400 rounded-lg overflow-hidden">
              <div className="flex items-center justify-center h-full text-white text-2xl font-bold">5</div>
            </div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">Image 5</span>
            </div>
          </div>
        ),
      },
      {
        id: 'img-6',
        content: (
          <div className="relative group">
            <div className="aspect-square bg-gradient-to-br from-pink-400 to-rose-400 rounded-lg overflow-hidden">
              <div className="flex items-center justify-center h-full text-white text-2xl font-bold">6</div>
            </div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">Image 6</span>
            </div>
          </div>
        ),
      },
    ]);

    return (
      <div className="w-full max-w-4xl">
        <h3 className="text-lg font-semibold mb-4">Photo Gallery</h3>
        <DragDropGrid
          items={images}
          columns={3}
          gap={12}
          onReorder={setImages}
          showDragHandle={false}
          animationDuration={300}
        />
      </div>
    );
  },
};

export const WithDisabledItems: Story = {
  render: () => (
    <InteractiveDragDropGrid
      items={[
        { id: '1', content: <div className="p-4 bg-white rounded shadow">Draggable 1</div> },
        { id: '2', content: <div className="p-4 bg-gray-100 rounded shadow">Locked Item</div>, disabled: true },
        { id: '3', content: <div className="p-4 bg-white rounded shadow">Draggable 2</div> },
        { id: '4', content: <div className="p-4 bg-white rounded shadow">Draggable 3</div> },
        { id: '5', content: <div className="p-4 bg-gray-100 rounded shadow">Locked Item</div>, disabled: true },
        { id: '6', content: <div className="p-4 bg-white rounded shadow">Draggable 4</div> },
      ]}
      columns={3}
      gap={16}
      showDragHandle={true}
    />
  ),
};

export const SingleColumn: Story = {
  render: () => {
    const [tasks, setTasks] = useState([
      {
        id: 'task-1',
        content: (
          <div className="p-3 bg-white rounded shadow flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4" />
            <span>Complete project documentation</span>
          </div>
        ),
      },
      {
        id: 'task-2',
        content: (
          <div className="p-3 bg-white rounded shadow flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4" />
            <span>Review pull requests</span>
          </div>
        ),
      },
      {
        id: 'task-3',
        content: (
          <div className="p-3 bg-white rounded shadow flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4" />
            <span>Update dependencies</span>
          </div>
        ),
      },
      {
        id: 'task-4',
        content: (
          <div className="p-3 bg-white rounded shadow flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4" />
            <span>Write unit tests</span>
          </div>
        ),
      },
    ]);

    return (
      <div className="w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Task List</h3>
        <DragDropGrid
          items={tasks}
          columns={1}
          gap={8}
          onReorder={setTasks}
          showDragHandle={true}
          lockAxis="y"
        />
      </div>
    );
  },
};

export const ResponsiveGrid: Story = {
  render: () => {
    const [widgets, setWidgets] = useState([
      {
        id: 'widget-1',
        content: (
          <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg">
            <h4 className="font-semibold text-lg">Revenue</h4>
            <p className="text-3xl font-bold mt-2">$45,231</p>
            <p className="text-sm opacity-90 mt-1">+12% from last month</p>
          </div>
        ),
      },
      {
        id: 'widget-2',
        content: (
          <div className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg">
            <h4 className="font-semibold text-lg">Users</h4>
            <p className="text-3xl font-bold mt-2">1,234</p>
            <p className="text-sm opacity-90 mt-1">+5% from last month</p>
          </div>
        ),
      },
      {
        id: 'widget-3',
        content: (
          <div className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg">
            <h4 className="font-semibold text-lg">Orders</h4>
            <p className="text-3xl font-bold mt-2">89</p>
            <p className="text-sm opacity-90 mt-1">+23% from last month</p>
          </div>
        ),
      },
      {
        id: 'widget-4',
        content: (
          <div className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg">
            <h4 className="font-semibold text-lg">Conversion</h4>
            <p className="text-3xl font-bold mt-2">3.2%</p>
            <p className="text-sm opacity-90 mt-1">+0.5% from last month</p>
          </div>
        ),
      },
    ]);

    return (
      <div className="w-full max-w-6xl">
        <h3 className="text-lg font-semibold mb-4">Dashboard Widgets</h3>
        <DragDropGrid
          items={widgets}
          columns={window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 4}
          gap={20}
          onReorder={setWidgets}
          showDragHandle={true}
          animationDuration={250}
        />
      </div>
    );
  },
};
