import type { Meta, StoryObj } from '@storybook/react';
import { Stepper, Step } from './stepper';
import { useState } from 'react';
import { FileText, Settings, CheckCircle, Rocket } from 'lucide-react';

const meta = {
  title: 'Components/Stepper',
  component: Stepper,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A stepper component for multi-step forms and processes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    variant: {
      control: 'select',
      options: ['default', 'dots', 'progress', 'simple'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    color: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'danger'],
    },
    clickable: {
      control: 'boolean',
    },
    showNumbers: {
      control: 'boolean',
    },
    showContent: {
      control: 'boolean',
    },
    alternativeLabel: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicSteps: Step[] = [
  {
    id: '1',
    title: 'Account',
    description: 'Create your account',
  },
  {
    id: '2',
    title: 'Profile',
    description: 'Setup your profile',
  },
  {
    id: '3',
    title: 'Preferences',
    description: 'Configure settings',
  },
  {
    id: '4',
    title: 'Review',
    description: 'Review and confirm',
  },
];

export const Default: Story = {
  args: {
    steps: basicSteps,
    activeStep: 1,
  },
};

export const Vertical: Story = {
  args: {
    steps: basicSteps,
    activeStep: 2,
    orientation: 'vertical',
  },
};

export const WithIcons: Story = {
  args: {
    steps: [
      {
        id: '1',
        title: 'Documentation',
        description: 'Read the docs',
        icon: <FileText className="h-5 w-5" />,
      },
      {
        id: '2',
        title: 'Configuration',
        description: 'Setup your project',
        icon: <Settings className="h-5 w-5" />,
      },
      {
        id: '3',
        title: 'Verification',
        description: 'Test everything',
        icon: <CheckCircle className="h-5 w-5" />,
      },
      {
        id: '4',
        title: 'Deploy',
        description: 'Go live!',
        icon: <Rocket className="h-5 w-5" />,
      },
    ],
    activeStep: 1,
    showNumbers: false,
  },
};

export const Dots: Story = {
  args: {
    steps: basicSteps,
    activeStep: 2,
    variant: 'dots',
  },
};

export const Progress: Story = {
  args: {
    steps: basicSteps,
    activeStep: 2,
    variant: 'progress',
  },
};

export const Simple: Story = {
  args: {
    steps: basicSteps.map(s => ({ ...s, description: undefined })),
    activeStep: 1,
    variant: 'simple',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-8 w-[600px]">
      <div>
        <p className="text-sm font-medium mb-4">Small</p>
        <Stepper steps={basicSteps} activeStep={1} size="sm" />
      </div>
      <div>
        <p className="text-sm font-medium mb-4">Medium</p>
        <Stepper steps={basicSteps} activeStep={1} size="md" />
      </div>
      <div>
        <p className="text-sm font-medium mb-4">Large</p>
        <Stepper steps={basicSteps} activeStep={1} size="lg" />
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [activeStep, setActiveStep] = useState(0);
    
    return (
      <div className="w-[600px] space-y-6">
        <Stepper
          steps={basicSteps}
          activeStep={activeStep}
          onStepClick={setActiveStep}
        />
        <div className="flex justify-between">
          <button
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Step {activeStep + 1} of {basicSteps.length}
          </span>
          <button
            onClick={() => setActiveStep(Math.min(basicSteps.length - 1, activeStep + 1))}
            disabled={activeStep === basicSteps.length - 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  },
};

export const WithContent: Story = {
  render: () => {
    const [activeStep, setActiveStep] = useState(0);
    
    const stepsWithContent: Step[] = [
      {
        id: '1',
        title: 'Account',
        description: 'Create your account',
        content: (
          <div className="p-4 border rounded">
            <h4 className="font-semibold mb-2">Account Information</h4>
            <p className="text-sm text-muted-foreground">
              Enter your email and password to create an account.
            </p>
          </div>
        ),
      },
      {
        id: '2',
        title: 'Profile',
        description: 'Setup your profile',
        content: (
          <div className="p-4 border rounded">
            <h4 className="font-semibold mb-2">Profile Setup</h4>
            <p className="text-sm text-muted-foreground">
              Add your personal information and profile picture.
            </p>
          </div>
        ),
      },
      {
        id: '3',
        title: 'Preferences',
        description: 'Configure settings',
        content: (
          <div className="p-4 border rounded">
            <h4 className="font-semibold mb-2">Preferences</h4>
            <p className="text-sm text-muted-foreground">
              Choose your notification settings and theme.
            </p>
          </div>
        ),
      },
    ];
    
    return (
      <div className="w-[600px]">
        <Stepper
          steps={stepsWithContent}
          activeStep={activeStep}
          onStepClick={setActiveStep}
          showContent
        />
      </div>
    );
  },
};

export const WithOptionalSteps: Story = {
  args: {
    steps: [
      {
        id: '1',
        title: 'Required Step',
        description: 'This step is mandatory',
      },
      {
        id: '2',
        title: 'Optional Step',
        description: 'You can skip this',
        optional: true,
      },
      {
        id: '3',
        title: 'Another Required',
        description: 'This is required',
      },
      {
        id: '4',
        title: 'Final Step',
        description: 'Complete the process',
      },
    ],
    activeStep: 1,
  },
};

export const WithError: Story = {
  args: {
    steps: [
      {
        id: '1',
        title: 'Completed',
        description: 'This step is done',
      },
      {
        id: '2',
        title: 'Error Step',
        description: 'Something went wrong',
        error: true,
      },
      {
        id: '3',
        title: 'Blocked',
        description: 'Cannot proceed',
        disabled: true,
      },
      {
        id: '4',
        title: 'Pending',
        description: 'Waiting...',
      },
    ],
    activeStep: 1,
  },
};

export const AlternativeLabel: Story = {
  args: {
    steps: basicSteps.map(s => ({ ...s, description: undefined })),
    activeStep: 2,
    alternativeLabel: true,
  },
};

export const NonLinear: Story = {
  render: () => {
    const [activeStep, setActiveStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    
    const handleStep = (step: number) => {
      setActiveStep(step);
    };
    
    const handleComplete = () => {
      setCompletedSteps([...completedSteps, activeStep]);
      setActiveStep(activeStep + 1);
    };
    
    return (
      <div className="w-[600px] space-y-6">
        <Stepper
          steps={basicSteps}
          activeStep={activeStep}
          completedSteps={completedSteps}
          onStepClick={handleStep}
        />
        <div className="text-center">
          <button
            onClick={handleComplete}
            className="px-4 py-2 bg-primary text-white rounded"
          >
            Complete Step {activeStep + 1}
          </button>
        </div>
      </div>
    );
  },
};