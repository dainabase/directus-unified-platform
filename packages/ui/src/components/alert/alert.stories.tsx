import type { Meta, StoryObj } from '@storybook/react'
import { Alert, AlertDescription, AlertTitle } from './alert'
import { Terminal, AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'success', 'warning', 'info'],
    },
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the cli.
      </AlertDescription>
    </Alert>
  ),
}

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  ),
}

export const Success: Story = {
  render: () => (
    <Alert variant="success">
      <AlertTitle>Success!</AlertTitle>
      <AlertDescription>
        Your changes have been saved successfully.
      </AlertDescription>
    </Alert>
  ),
}

export const Warning: Story = {
  render: () => (
    <Alert variant="warning">
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        Your subscription will expire in 5 days. Please renew to continue using our services.
      </AlertDescription>
    </Alert>
  ),
}

export const Info: Story = {
  render: () => (
    <Alert variant="info">
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        A new version of the application is available. Click here to update.
      </AlertDescription>
    </Alert>
  ),
}

export const WithCustomIcon: Story = {
  render: () => (
    <Alert icon={<Terminal className="h-4 w-4" />}>
      <AlertTitle>Terminal</AlertTitle>
      <AlertDescription>
        You can add components to your app using the cli.
      </AlertDescription>
    </Alert>
  ),
}

export const WithoutTitle: Story = {
  render: () => (
    <Alert>
      <AlertDescription>
        This is a simple alert without a title. It can be used for less important notifications.
      </AlertDescription>
    </Alert>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4 w-[600px]">
      <Alert>
        <AlertTitle>Default</AlertTitle>
        <AlertDescription>
          This is a default alert with neutral styling.
        </AlertDescription>
      </Alert>
      
      <Alert variant="info">
        <AlertTitle>Info</AlertTitle>
        <AlertDescription>
          This alert provides information to the user.
        </AlertDescription>
      </Alert>
      
      <Alert variant="success">
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>
          This alert indicates a successful operation.
        </AlertDescription>
      </Alert>
      
      <Alert variant="warning">
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          This alert warns the user about something important.
        </AlertDescription>
      </Alert>
      
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          This alert indicates an error or problem.
        </AlertDescription>
      </Alert>
    </div>
  ),
}
