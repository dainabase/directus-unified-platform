import type { Meta, StoryObj } from '@storybook/react'
import { TimelineEnhanced } from './timeline-enhanced'
import React from 'react'
import { Rocket, Package, CheckCircle, AlertCircle, Users, Code, FileText, Settings } from 'lucide-react'

const meta: Meta<typeof TimelineEnhanced> = {
  title: 'Components/TimelineEnhanced',
  component: TimelineEnhanced,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'An enhanced timeline component with rich features for displaying chronological events.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      description: 'Timeline orientation',
    },
    variant: {
      control: 'select',
      options: ['default', 'compact', 'detailed', 'cards'],
      description: 'Visual variant of the timeline',
    },
    showConnector: {
      control: 'boolean',
      description: 'Show connector lines between events',
    },
    showProgress: {
      control: 'boolean',
      description: 'Show progress bars for events',
    },
    animated: {
      control: 'boolean',
      description: 'Enable animations',
    },
    collapsible: {
      control: 'boolean',
      description: 'Allow events to be collapsed/expanded',
    },
    highlightCurrent: {
      control: 'boolean',
      description: 'Highlight current events',
    },
    groupByDate: {
      control: 'boolean',
      description: 'Group events by date',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const sampleEvents = [
  {
    id: '1',
    title: 'Project Kickoff',
    description: 'Initial project planning and team formation. Setting up the development environment and defining project goals.',
    date: new Date('2024-01-15'),
    type: 'info' as const,
    status: 'completed' as const,
    icon: <Rocket className="h-4 w-4" />,
    user: {
      name: 'John Doe',
      avatar: 'https://github.com/johndoe.png',
      role: 'Project Manager',
    },
    tags: ['planning', 'kickoff'],
    progress: 100,
    priority: 'high' as const,
  },
  {
    id: '2',
    title: 'Design Phase',
    description: 'Creating wireframes, mockups, and design system components.',
    date: new Date('2024-02-01'),
    type: 'default' as const,
    status: 'completed' as const,
    icon: <FileText className="h-4 w-4" />,
    user: {
      name: 'Jane Smith',
      avatar: 'https://github.com/janesmith.png',
      role: 'UI/UX Designer',
    },
    tags: ['design', 'ui/ux'],
    progress: 100,
    location: 'Design Studio',
    attachments: [
      { name: 'wireframes.fig', size: '2.4MB', type: 'figma' },
      { name: 'design-system.sketch', size: '1.8MB', type: 'sketch' },
    ],
  },
  {
    id: '3',
    title: 'Development Sprint 1',
    description: 'Implementing core features and setting up the infrastructure.',
    date: new Date('2024-02-15'),
    type: 'success' as const,
    status: 'completed' as const,
    icon: <Code className="h-4 w-4" />,
    user: {
      name: 'Bob Johnson',
      avatar: 'https://github.com/bobjohnson.png',
      role: 'Lead Developer',
    },
    tags: ['development', 'sprint-1'],
    progress: 100,
    duration: '2 weeks',
    comments: [
      { id: '1', user: 'Alice', text: 'Great progress on the backend!', date: new Date('2024-02-20') },
      { id: '2', user: 'Charlie', text: 'Frontend components looking good', date: new Date('2024-02-22') },
    ],
  },
  {
    id: '4',
    title: 'Testing Phase',
    description: 'QA testing and bug fixes. Running automated tests and manual testing.',
    date: new Date('2024-03-01'),
    type: 'warning' as const,
    status: 'current' as const,
    icon: <AlertCircle className="h-4 w-4" />,
    user: {
      name: 'Alice Williams',
      avatar: 'https://github.com/alicewilliams.png',
      role: 'QA Engineer',
    },
    tags: ['testing', 'qa'],
    progress: 65,
    priority: 'medium' as const,
    link: {
      label: 'View Test Results',
      url: 'https://example.com/tests',
    },
  },
  {
    id: '5',
    title: 'Beta Release',
    description: 'Rolling out beta version to selected users for feedback.',
    date: new Date('2024-03-15'),
    type: 'info' as const,
    status: 'upcoming' as const,
    icon: <Package className="h-4 w-4" />,
    tags: ['release', 'beta'],
    progress: 30,
    milestone: true,
  },
  {
    id: '6',
    title: 'Production Launch',
    description: 'Final release to production environment.',
    date: new Date('2024-04-01'),
    type: 'success' as const,
    status: 'upcoming' as const,
    icon: <CheckCircle className="h-4 w-4" />,
    tags: ['release', 'production'],
    progress: 0,
    priority: 'critical' as const,
    milestone: true,
  },
]

export const Default: Story = {
  args: {
    events: sampleEvents,
  },
  render: (args) => (
    <div className="w-full max-w-4xl mx-auto">
      <TimelineEnhanced {...args} />
    </div>
  ),
}

export const Compact: Story = {
  args: {
    events: sampleEvents,
    variant: 'compact',
    showProgress: false,
  },
  render: (args) => (
    <div className="w-full max-w-4xl mx-auto">
      <TimelineEnhanced {...args} />
    </div>
  ),
}

export const Cards: Story = {
  args: {
    events: sampleEvents,
    variant: 'cards',
    showConnector: false,
  },
  render: (args) => (
    <div className="w-full max-w-4xl mx-auto">
      <TimelineEnhanced {...args} />
    </div>
  ),
}

export const Horizontal: Story = {
  args: {
    events: sampleEvents.slice(0, 4),
    orientation: 'horizontal',
  },
  render: (args) => (
    <div className="w-full">
      <TimelineEnhanced {...args} />
    </div>
  ),
}

export const WithProgress: Story = {
  args: {
    events: sampleEvents,
    showProgress: true,
    highlightCurrent: true,
  },
  render: (args) => (
    <div className="w-full max-w-4xl mx-auto">
      <TimelineEnhanced {...args} />
    </div>
  ),
}

export const Collapsible: Story = {
  args: {
    events: sampleEvents.map(e => ({ ...e, expandable: true })),
    collapsible: true,
    defaultExpanded: false,
  },
  render: (args) => (
    <div className="w-full max-w-4xl mx-auto">
      <TimelineEnhanced {...args} />
    </div>
  ),
}

export const GroupedByDate: Story = {
  args: {
    events: sampleEvents,
    groupByDate: true,
    showTimestamp: false,
  },
  render: (args) => (
    <div className="w-full max-w-4xl mx-auto">
      <TimelineEnhanced {...args} />
    </div>
  ),
}

export const WithFilters: Story = {
  args: {
    events: sampleEvents,
    showFilters: true,
    filterOptions: [
      { value: 'completed', label: 'Completed' },
      { value: 'current', label: 'Current' },
      { value: 'upcoming', label: 'Upcoming' },
      { value: 'development', label: 'Development' },
      { value: 'design', label: 'Design' },
      { value: 'testing', label: 'Testing' },
    ],
  },
  render: (args) => {
    const [filters, setFilters] = React.useState<string[]>([])
    
    return (
      <div className="w-full max-w-4xl mx-auto">
        <TimelineEnhanced
          {...args}
          onFilterChange={setFilters}
        />
        {filters.length > 0 && (
          <div className="mt-4 p-4 rounded-md bg-muted">
            <p className="text-sm font-medium">Active filters: {filters.join(', ')}</p>
          </div>
        )}
      </div>
    )
  },
}

export const ScrollableTimeline: Story = {
  args: {
    events: [...sampleEvents, ...sampleEvents.map(e => ({ ...e, id: `${e.id}-2` }))],
    maxHeight: 500,
    showProgress: true,
  },
  render: (args) => (
    <div className="w-full max-w-4xl mx-auto">
      <TimelineEnhanced {...args} />
    </div>
  ),
}

export const Interactive: Story = {
  args: {
    events: sampleEvents,
    interactive: true,
    animated: true,
    highlightCurrent: true,
  },
  render: (args) => {
    const [selectedEvent, setSelectedEvent] = React.useState<any>(null)
    
    return (
      <div className="w-full max-w-4xl mx-auto">
        <TimelineEnhanced
          {...args}
          onEventClick={(event) => setSelectedEvent(event)}
        />
        {selectedEvent && (
          <div className="mt-4 p-4 rounded-md bg-muted">
            <p className="text-sm font-medium mb-2">Selected Event:</p>
            <p className="text-sm">{selectedEvent.title}</p>
            <p className="text-xs text-muted-foreground">{selectedEvent.description}</p>
          </div>
        )}
      </div>
    )
  },
}

export const CustomIcons: Story = {
  args: {
    events: [
      {
        id: '1',
        title: 'Team Meeting',
        description: 'Weekly team sync-up meeting',
        date: new Date('2024-01-15'),
        icon: <Users className="h-4 w-4" />,
        status: 'completed' as const,
      },
      {
        id: '2',
        title: 'Code Review',
        description: 'Reviewing pull requests',
        date: new Date('2024-01-16'),
        icon: <Code className="h-4 w-4" />,
        status: 'completed' as const,
      },
      {
        id: '3',
        title: 'Configuration Update',
        description: 'Updating system configuration',
        date: new Date('2024-01-17'),
        icon: <Settings className="h-4 w-4" />,
        status: 'current' as const,
      },
    ],
  },
  render: (args) => (
    <div className="w-full max-w-4xl mx-auto">
      <TimelineEnhanced {...args} />
    </div>
  ),
}