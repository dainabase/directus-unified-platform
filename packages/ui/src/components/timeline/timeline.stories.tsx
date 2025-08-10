import type { Meta, StoryObj } from '@storybook/react';
import { Timeline, TimelineItem } from './timeline';
import { Package, Truck, CheckCircle, Home } from 'lucide-react';

const meta = {
  title: 'Components/Timeline',
  component: Timeline,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A timeline component for displaying chronological events or process steps.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
    position: {
      control: 'select',
      options: ['left', 'right', 'alternate'],
    },
    variant: {
      control: 'select',
      options: ['default', 'compact', 'detailed'],
    },
    color: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'danger'],
    },
    showConnectors: {
      control: 'boolean',
    },
    animated: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicItems: TimelineItem[] = [
  {
    id: '1',
    title: 'Application Submitted',
    description: 'Your application has been received and is under review.',
    date: 'Jan 1, 2025',
    status: 'completed',
  },
  {
    id: '2',
    title: 'In Review',
    description: 'Our team is currently reviewing your application.',
    date: 'Jan 3, 2025',
    status: 'completed',
  },
  {
    id: '3',
    title: 'Interview Scheduled',
    description: 'You have been selected for an interview.',
    date: 'Jan 5, 2025',
    status: 'active',
  },
  {
    id: '4',
    title: 'Final Decision',
    description: 'We will notify you of our decision.',
    date: 'Jan 10, 2025',
    status: 'pending',
  },
];

export const Default: Story = {
  args: {
    items: basicItems,
  },
};

export const Horizontal: Story = {
  args: {
    items: basicItems.slice(0, 3),
    orientation: 'horizontal',
  },
};

export const Alternate: Story = {
  args: {
    items: basicItems,
    position: 'alternate',
  },
};

export const Compact: Story = {
  args: {
    items: basicItems,
    variant: 'compact',
  },
};

export const Detailed: Story = {
  args: {
    items: basicItems.map(item => ({
      ...item,
      content: (
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
          <p className="text-xs">Additional details about {item.title.toLowerCase()}.</p>
        </div>
      ),
    })),
    variant: 'detailed',
  },
};

export const WithIcons: Story = {
  args: {
    items: [
      {
        id: '1',
        title: 'Order Placed',
        description: 'Your order has been confirmed.',
        date: 'Today, 10:00 AM',
        status: 'completed',
        icon: <Package className="h-5 w-5" />,
      },
      {
        id: '2',
        title: 'Order Shipped',
        description: 'Your package is on its way.',
        date: 'Today, 2:00 PM',
        status: 'completed',
        icon: <Truck className="h-5 w-5" />,
      },
      {
        id: '3',
        title: 'Out for Delivery',
        description: 'Your package will arrive today.',
        date: 'Expected by 6:00 PM',
        status: 'active',
        icon: <CheckCircle className="h-5 w-5" />,
      },
      {
        id: '4',
        title: 'Delivered',
        description: 'Package delivered to your address.',
        date: 'Pending',
        status: 'pending',
        icon: <Home className="h-5 w-5" />,
      },
    ],
  },
};

export const AllStatuses: Story = {
  args: {
    items: [
      {
        id: '1',
        title: 'Completed Task',
        description: 'This task has been completed successfully.',
        date: '2 hours ago',
        status: 'completed',
      },
      {
        id: '2',
        title: 'Active Task',
        description: 'Currently working on this task.',
        date: 'Now',
        status: 'active',
      },
      {
        id: '3',
        title: 'Pending Task',
        description: 'This task is waiting to be started.',
        date: 'Scheduled',
        status: 'pending',
      },
      {
        id: '4',
        title: 'Failed Task',
        description: 'This task encountered an error.',
        date: '1 hour ago',
        status: 'error',
      },
      {
        id: '5',
        title: 'Cancelled Task',
        description: 'This task was cancelled.',
        date: '30 minutes ago',
        status: 'cancelled',
      },
    ],
  },
};

export const Colors: Story = {
  render: () => (
    <div className="space-y-8">
      {(['default', 'primary', 'secondary', 'success', 'warning', 'danger'] as const).map(color => (
        <div key={color}>
          <h3 className="text-sm font-semibold mb-4 capitalize">{color}</h3>
          <Timeline
            items={basicItems.slice(0, 2)}
            color={color}
            variant="compact"
          />
        </div>
      ))}
    </div>
  ),
};

export const Animated: Story = {
  args: {
    items: basicItems,
    animated: true,
  },
};

export const NoConnectors: Story = {
  args: {
    items: basicItems,
    showConnectors: false,
  },
};

export const ProjectTimeline: Story = {
  args: {
    items: [
      {
        id: '1',
        title: 'Project Kickoff',
        description: 'Initial planning and team formation.',
        date: 'Q1 2025',
        status: 'completed',
      },
      {
        id: '2',
        title: 'Design Phase',
        description: 'Creating wireframes and prototypes.',
        date: 'Q1 2025',
        status: 'completed',
      },
      {
        id: '3',
        title: 'Development Sprint 1',
        description: 'Building core features.',
        date: 'Q2 2025',
        status: 'active',
      },
      {
        id: '4',
        title: 'Development Sprint 2',
        description: 'Adding advanced features.',
        date: 'Q2 2025',
        status: 'pending',
      },
      {
        id: '5',
        title: 'Testing & QA',
        description: 'Comprehensive testing phase.',
        date: 'Q3 2025',
        status: 'pending',
      },
      {
        id: '6',
        title: 'Launch',
        description: 'Product goes live.',
        date: 'Q3 2025',
        status: 'pending',
      },
    ],
    position: 'alternate',
    variant: 'detailed',
    animated: true,
  },
};