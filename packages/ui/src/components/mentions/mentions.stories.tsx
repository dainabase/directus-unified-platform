import type { Meta, StoryObj } from '@storybook/react'
import { Mentions } from './mentions'
import React from 'react'

const meta: Meta<typeof Mentions> = {
  title: 'Components/Mentions',
  component: Mentions,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A mentions component with @mentions support for user tagging.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'The current value of the textarea',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    triggerChar: {
      control: 'text',
      description: 'Character that triggers mention suggestions',
    },
    maxSuggestions: {
      control: 'number',
      description: 'Maximum number of suggestions to show',
    },
    rows: {
      control: 'number',
      description: 'Number of rows for the textarea',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the textarea is disabled',
    },
    highlightMentions: {
      control: 'boolean',
      description: 'Whether to highlight mentions in the text',
    },
    showStatus: {
      control: 'boolean',
      description: 'Whether to show user status indicators',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const sampleUsers = [
  {
    id: '1',
    name: 'John Doe',
    username: 'johndoe',
    avatar: 'https://github.com/johndoe.png',
    email: 'john@example.com',
    status: 'online' as const,
  },
  {
    id: '2',
    name: 'Jane Smith',
    username: 'janesmith',
    avatar: 'https://github.com/janesmith.png',
    email: 'jane@example.com',
    status: 'away' as const,
  },
  {
    id: '3',
    name: 'Bob Johnson',
    username: 'bobjohnson',
    avatar: 'https://github.com/bobjohnson.png',
    email: 'bob@example.com',
    status: 'busy' as const,
  },
  {
    id: '4',
    name: 'Alice Williams',
    username: 'alicewilliams',
    avatar: 'https://github.com/alicewilliams.png',
    email: 'alice@example.com',
    status: 'offline' as const,
  },
  {
    id: '5',
    name: 'Charlie Brown',
    username: 'charliebrown',
    avatar: 'https://github.com/charliebrown.png',
    email: 'charlie@example.com',
    status: 'online' as const,
  },
]

export const Default: Story = {
  args: {
    users: sampleUsers,
    placeholder: 'Type @ to mention someone...',
  },
  render: (args) => {
    const [value, setValue] = React.useState('')
    const [mentions, setMentions] = React.useState<any[]>([])
    
    return (
      <div className="w-[500px]">
        <Mentions
          {...args}
          value={value}
          onChange={(val, mentions) => {
            setValue(val)
            setMentions(mentions || [])
          }}
        />
        {mentions.length > 0 && (
          <div className="mt-4 p-4 rounded-md bg-muted">
            <p className="text-sm font-medium mb-2">Mentioned users:</p>
            <div className="flex flex-wrap gap-2">
              {mentions.map((user) => (
                <span key={user.id} className="text-sm">
                  {user.name} (@{user.username})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  },
}

export const WithInitialValue: Story = {
  args: {
    users: sampleUsers,
    value: 'Hey @johndoe, can you review this? Thanks!',
    highlightMentions: true,
  },
  render: (args) => {
    const [value, setValue] = React.useState(args.value)
    
    return (
      <div className="w-[500px]">
        <Mentions
          {...args}
          value={value}
          onChange={(val) => setValue(val)}
        />
      </div>
    )
  },
}

export const CustomTriggerChar: Story = {
  args: {
    users: sampleUsers,
    triggerChar: '#',
    placeholder: 'Type # to mention someone...',
    formatMention: (user) => `#${user.username}`,
  },
  render: (args) => {
    const [value, setValue] = React.useState('')
    
    return (
      <div className="w-[500px]">
        <Mentions
          {...args}
          value={value}
          onChange={(val) => setValue(val)}
        />
      </div>
    )
  },
}

export const WithoutHighlight: Story = {
  args: {
    users: sampleUsers,
    highlightMentions: false,
    placeholder: 'Type @ to mention someone (no highlighting)...',
  },
  render: (args) => {
    const [value, setValue] = React.useState('')
    
    return (
      <div className="w-[500px]">
        <Mentions
          {...args}
          value={value}
          onChange={(val) => setValue(val)}
        />
      </div>
    )
  },
}

export const Disabled: Story = {
  args: {
    users: sampleUsers,
    value: 'This field is disabled',
    disabled: true,
  },
  render: (args) => (
    <div className="w-[500px]">
      <Mentions {...args} />
    </div>
  ),
}

export const LargeTextArea: Story = {
  args: {
    users: sampleUsers,
    rows: 8,
    placeholder: 'Write a longer message with mentions...',
  },
  render: (args) => {
    const [value, setValue] = React.useState('')
    
    return (
      <div className="w-[600px]">
        <Mentions
          {...args}
          value={value}
          onChange={(val) => setValue(val)}
        />
      </div>
    )
  },
}

export const WithMaxLength: Story = {
  args: {
    users: sampleUsers,
    maxLength: 100,
    placeholder: 'Type @ to mention (max 100 chars)...',
  },
  render: (args) => {
    const [value, setValue] = React.useState('')
    
    return (
      <div className="w-[500px]">
        <Mentions
          {...args}
          value={value}
          onChange={(val) => setValue(val)}
        />
        <p className="text-sm text-muted-foreground mt-2">
          {value.length}/{args.maxLength} characters
        </p>
      </div>
    )
  },
}