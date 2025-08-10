import type { Meta, StoryObj } from '@storybook/react';
import { Rating } from './rating';
import { useState } from 'react';

const meta = {
  title: 'Components/Rating',
  component: Rating,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A rating component for collecting user feedback with customizable icons and styles.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'number', min: 0, max: 5, step: 0.5 },
    },
    max: {
      control: { type: 'number', min: 1, max: 10 },
    },
    icon: {
      control: 'select',
      options: ['star', 'heart', 'thumbs', 'circle', 'square', 'triangle'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    color: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'danger'],
    },
    allowHalf: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    readOnly: {
      control: 'boolean',
    },
    showLabel: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: 3,
    max: 5,
  },
};

export const WithLabel: Story = {
  args: {
    defaultValue: 4,
    max: 5,
    showLabel: true,
  },
};

export const CustomLabels: Story = {
  args: {
    defaultValue: 3,
    max: 5,
    showLabel: true,
    labels: ['Terrible', 'Bad', 'OK', 'Good', 'Excellent'],
  },
};

export const Icons: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Stars:</span>
        <Rating defaultValue={3} icon="star" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Hearts:</span>
        <Rating defaultValue={3} icon="heart" color="danger" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Thumbs:</span>
        <Rating defaultValue={3} icon="thumbs" color="primary" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Circles:</span>
        <Rating defaultValue={3} icon="circle" color="secondary" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Squares:</span>
        <Rating defaultValue={3} icon="square" color="success" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Triangles:</span>
        <Rating defaultValue={3} icon="triangle" color="default" />
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Small:</span>
        <Rating defaultValue={3} size="sm" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Medium:</span>
        <Rating defaultValue={3} size="md" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Large:</span>
        <Rating defaultValue={3} size="lg" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">XLarge:</span>
        <Rating defaultValue={3} size="xl" />
      </div>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Default:</span>
        <Rating defaultValue={3} color="default" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Primary:</span>
        <Rating defaultValue={3} color="primary" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Secondary:</span>
        <Rating defaultValue={3} color="secondary" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Success:</span>
        <Rating defaultValue={3} color="success" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Warning:</span>
        <Rating defaultValue={3} color="warning" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Danger:</span>
        <Rating defaultValue={3} color="danger" />
      </div>
    </div>
  ),
};

export const HalfRatings: Story = {
  args: {
    defaultValue: 3.5,
    max: 5,
    allowHalf: true,
    showLabel: true,
  },
};

export const ReadOnly: Story = {
  args: {
    value: 3.5,
    max: 5,
    readOnly: true,
    allowHalf: true,
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: 3,
    max: 5,
    disabled: true,
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState(3);
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    
    return (
      <div className="space-y-4">
        <Rating
          value={value}
          onValueChange={setValue}
          onHoverChange={setHoverValue}
          max={5}
          size="lg"
        />
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Current: <span className="font-bold">{value}</span>
          </p>
          {hoverValue !== null && (
            <p className="text-sm text-muted-foreground">
              Hovering: <span className="font-bold">{hoverValue}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setValue(0)}
            className="px-3 py-1 text-sm border rounded"
          >
            Clear
          </button>
          <button
            onClick={() => setValue(5)}
            className="px-3 py-1 text-sm border rounded"
          >
            Max
          </button>
        </div>
      </div>
    );
  },
};

export const CustomMax: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">3 Stars</p>
        <Rating defaultValue={2} max={3} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">7 Stars</p>
        <Rating defaultValue={5} max={7} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">10 Stars</p>
        <Rating defaultValue={7} max={10} size="sm" />
      </div>
    </div>
  ),
};

export const ProductRating: Story = {
  render: () => {
    const [rating, setRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    
    return (
      <div className="p-6 border rounded-lg max-w-sm">
        <h3 className="font-semibold mb-2">Rate this product</h3>
        <p className="text-sm text-muted-foreground mb-4">
          How would you rate your experience?
        </p>
        <Rating
          value={rating}
          onValueChange={setRating}
          size="lg"
          showLabel
          labels={['Very Poor', 'Poor', 'Average', 'Good', 'Excellent']}
        />
        <button
          onClick={() => setSubmitted(true)}
          disabled={rating === 0}
          className="mt-4 w-full px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
        >
          Submit Rating
        </button>
        {submitted && (
          <p className="mt-4 text-sm text-green-600">
            Thank you for your feedback!
          </p>
        )}
      </div>
    );
  },
};