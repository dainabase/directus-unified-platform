import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from './slider';
import { useState } from 'react';

const meta = {
  title: 'Components/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An input where the user selects a value from within a given range.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'danger'],
    },
    min: {
      control: 'number',
    },
    max: {
      control: 'number',
    },
    step: {
      control: 'number',
    },
    showValue: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
    className: 'w-[300px]',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: [33],
    max: 100,
    step: 1,
    showValue: true,
    className: 'w-[300px]',
  },
};

export const Range: Story = {
  args: {
    defaultValue: [25, 75],
    max: 100,
    step: 1,
    showValue: true,
    className: 'w-[300px]',
  },
};

export const WithMarks: Story = {
  args: {
    defaultValue: [50],
    min: 0,
    max: 100,
    step: 25,
    marks: [
      { value: 0, label: '0%' },
      { value: 25, label: '25%' },
      { value: 50, label: '50%' },
      { value: 75, label: '75%' },
      { value: 100, label: '100%' },
    ],
    className: 'w-[300px] mb-8',
  },
};

export const CustomFormat: Story = {
  args: {
    defaultValue: [500],
    min: 0,
    max: 1000,
    step: 50,
    showValue: true,
    formatValue: (value) => `$${value}`,
    className: 'w-[300px]',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-8 w-[300px]">
      <div>
        <label className="text-sm font-medium mb-2 block">Default</label>
        <Slider defaultValue={[50]} max={100} variant="default" />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Primary</label>
        <Slider defaultValue={[50]} max={100} variant="primary" />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Secondary</label>
        <Slider defaultValue={[50]} max={100} variant="secondary" />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Success</label>
        <Slider defaultValue={[50]} max={100} variant="success" />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Warning</label>
        <Slider defaultValue={[50]} max={100} variant="warning" />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Danger</label>
        <Slider defaultValue={[50]} max={100} variant="danger" />
      </div>
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState([50]);
    
    return (
      <div className="space-y-4 w-[300px]">
        <Slider
          value={value}
          onValueChange={setValue}
          max={100}
          step={1}
          showValue
        />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Current value:</p>
          <p className="text-2xl font-bold">{value[0]}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setValue([0])}
            className="px-3 py-1 text-sm border rounded"
          >
            Min
          </button>
          <button
            onClick={() => setValue([50])}
            className="px-3 py-1 text-sm border rounded"
          >
            Center
          </button>
          <button
            onClick={() => setValue([100])}
            className="px-3 py-1 text-sm border rounded"
          >
            Max
          </button>
        </div>
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    disabled: true,
    className: 'w-[300px]',
  },
};

export const SmallSteps: Story = {
  args: {
    defaultValue: [0.5],
    min: 0,
    max: 1,
    step: 0.01,
    showValue: true,
    formatValue: (value) => `${(value * 100).toFixed(0)}%`,
    className: 'w-[300px]',
  },
};

export const Temperature: Story = {
  args: {
    defaultValue: [20],
    min: -10,
    max: 40,
    step: 1,
    showValue: true,
    formatValue: (value) => `${value}°C`,
    marks: [
      { value: -10, label: '-10°C' },
      { value: 0, label: '0°C' },
      { value: 20, label: '20°C' },
      { value: 40, label: '40°C' },
    ],
    className: 'w-[300px] mb-8',
  },
};